"""
Run:  uvicorn main:app --reload --port 8000
"""

import httpx
from fastapi import FastAPI, UploadFile, File
from sb3_parser import parse_sb3
from checker import check
from hints import build_hint, LADDER, level_for, guardrail
from model import rephrase
import time
from collections import defaultdict, deque
from pydantic import BaseModel
from monitor import looks_stuck
from governor import may_speak, record_nudge
from checker import check, check_signals
from hints import build_hint, build_hint_for_proactive, build_followup
# Aliased: hints.level_for already exists and means something else (the rung
# of the hint ladder for a number of attempts). Importing this one under its
# own name shadowed it and broke every hint request.
from learner_model import level_for as mastery_level_for, update as update_mastery
from planner import plan, content_for_skill as plan_content

app = FastAPI(title="ThinkKraft AI service")

OLLAMA_URL = "http://localhost:11434"

ACTIVITY = defaultdict(lambda: deque(maxlen=50))

PROACTIVE = defaultdict(list)


class ActivityEvent(BaseModel):
    studentId: str
    lessonId: str
    kind: str


@app.get("/health")
def health():
    # A plain liveness check. The Next.js core calls this to confirm the AI service is up.
    return {"status": "ok", "service": "ai"}


@app.get("/ollama-check")
async def ollama_check():
    # Confirms the model runtime is reachable and lists any models you have pulled.
    # This is the seam that, in Phase 3, becomes the model adapter.
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{OLLAMA_URL}/api/tags")
            res.raise_for_status()
            models = [m["name"] for m in res.json().get("models", [])]
        return {"status": "ok", "ollama": "reachable", "models": models}
    except Exception as exc:
        return {"status": "error", "ollama": "unreachable", "detail": str(exc)}


@app.post("/parse")
async def parse(lesson_id: str, attempts: int = 1, file: UploadFile = File(...)):
    data = await file.read()
    try:
        signals = parse_sb3(data)
    except Exception as e:
        return {"error": str(e)}
    result = check(lesson_id, signals)
    hint = None
    if not result["correct"] and result["diagnosis"]:
        hint = build_hint(result["diagnosis"], attempts)
    return {"signals": signals, "result": result, "hint": hint}


@app.get("/content/{skill_id}")
async def content(skill_id: str):
    """
    One skill's teaching content, by id.

    Separate from /learner/next on purpose. The planner answers "what should
    this child do next", and its answer may be a different skill from the one
    asked about, because it redirects to the root cause. Anything that needs
    the content for a named skill has to ask for that skill, not for a plan.
    """
    step = plan_content(skill_id)
    if step is None:
        return {"content": None}
    return {"content": step}


@app.post("/practice/check")
async def practice_check(required_signals: str = "", file: UploadFile = File(...)):
    """
    A practice attempt, checked against the skill's own required signals.

    Deterministic, like every other verdict here. The signal list comes from
    skills.yaml by way of the planner, not from the child and not from a model.
    """
    data = await file.read()
    try:
        signals = parse_sb3(data)
    except Exception as e:
        return {"error": str(e)}
    required = [s for s in required_signals.split(",") if s]
    return {"signals": signals, "result": check_signals(signals, required)}


@app.post("/activity")
async def activity(event: ActivityEvent):
    ACTIVITY[event.studentId].append({"kind": event.kind, "at": time.time()})
    recent = list(ACTIVITY[event.studentId])

    verdict = looks_stuck(recent)
    if not verdict["stuck"]:
        return {"stuck": False, "spoke": False, "reason": None}

    gate = may_speak(event.studentId, recent)
    if not gate["allow"]:
        return {"stuck": True, "spoke": False, "reason": gate["reason"]}

    diagnosis = f"proactive:{verdict['reason']}"
    hint = build_hint_for_proactive(event.lessonId, verdict["reason"])
    record_nudge(event.studentId)
    PROACTIVE[event.studentId].append(hint)

    return {"stuck": True, "spoke": True, "reason": verdict["reason"], "hint": hint}


class LearnerEvidence(BaseModel):
    skill: str | None = None
    correct: bool = False
    hint_level: int = 0


class LearnerUpdateRequest(BaseModel):
    prior: dict[str, float] = {}
    evidence: list[LearnerEvidence] = []


@app.post("/learner/update")
async def learner_update(req: LearnerUpdateRequest):
    """
    Apply evidence to a child's mastery estimates.

    Stateless, like everything else here: the caller sends what it has stored
    and gets back what to store next. The web core owns the database.
    """
    posterior = update_mastery(
        req.prior,
        [e.model_dump() for e in req.evidence],
    )
    return {
        "posterior": posterior,
        # The words a child or parent sees. Sent alongside so no caller has to
        # re-implement the thresholds and risk disagreeing with this one.
        "levels": {k: mastery_level_for(v) for k, v in posterior.items()},
    }


class NextStepRequest(BaseModel):
    mastery: dict[str, float] = {}
    target_skills: list[str] = []
    # Off by default. Rewording costs a model call, and a teacher reading the
    # queue wants the words they approved, not a variation on them.
    reword: bool = False


@app.post("/learner/next")
async def learner_next(req: NextStepRequest):
    """
    What to teach this child next.

    The decision is made by planner.py in code. The model is not asked what to
    teach, only, optionally, to say the chosen explanation more warmly. If it
    fails or is not running, rephrase returns the template unchanged.
    """
    step = plan(req.mastery, req.target_skills)

    content = step.get("content")
    if req.reword and content:
        explanation = content["micro_lesson"]["explanation"]
        # Level 1: a micro-lesson is an explanation, not a worked answer, so
        # the guardrail's gentler setting applies. The worked example is left
        # exactly as written, because it names the blocks to use and rewording
        # it risks naming different ones.
        content["micro_lesson"]["explanation"] = rephrase(explanation, 1)

    return step


class FollowupRequest(BaseModel):
    diagnosis: str
    previousLevel: int
    answer: str


@app.post("/followup")
async def followup(req: FollowupRequest):
    """
    A child answered a hint that asked them a question. What they get back is
    the next rung of the same ladder, chosen here by deterministic code; their
    answer only colours how it is worded. It is still a proposed hint, so a
    teacher reads it before the child ever sees it.
    """
    template = build_followup(req.diagnosis, req.previousLevel)
    if template is None:
        return {"hint": None}

    if not template["model"]:
        return {"hint": {"level": template["level"], "text": template["text"]}}

    ladder = LADDER[req.diagnosis]
    worded = rephrase(template["text"], template["level"], req.answer)
    safe = guardrail(worded, template["level"], ladder)
    return {"hint": {"level": template["level"], "text": safe, "template": template["text"]}}


@app.get("/proactive/{student_id}")
async def proactive(student_id: str):
    hints = PROACTIVE.pop(student_id, [])  # hand them over once, then clear
    return {"hints": hints}


def build_hint(diagnosis: str, attempts: int) -> dict:
    ladder = LADDER.get(diagnosis)
    if ladder is None:
        return {
            "level": 1,
            "text": "Let's take a look at this together. What are you trying to make happen?",
        }

    level = level_for(attempts)
    template = ladder[level]
    worded = rephrase(template, level)  # model rewords it
    safe = guardrail(worded, level, ladder)  # guardrail checks the model's output
    return {"level": level, "text": safe, "template": template}
