"""
What to do next for one child.

Given how well they understand each skill, decide whether to teach something,
set them practice, review, or let them move on. Deterministic: the same
mastery and the same targets always give the same action, and the reason is a
sentence a teacher can read and disagree with.

The language model is not consulted here and must not be. It may reword an
explanation on the way out, which is the same arrangement the hints have: what
is taught is chosen in code, and the model only changes the wording.

The important idea is root cause. A child failing at loops may not have a loop
problem. Loops need motion, motion needs sequencing, sequencing needs events.
Teaching loops to a child who cannot reliably make a sprite move is teaching
the wrong thing, so the planner walks down the prerequisites first and teaches
the weakest thing that is actually broken.
"""

# Deferred annotation evaluation, so the modern union and builtin generic
# syntax below also runs on Python 3.8 and 3.9.
from __future__ import annotations

import os

from learner_model import MASTERED, P_INIT, STRUGGLING
from skills import get_skill, is_approved, prerequisites_of

# Content is unapproved until a person reads it, exactly like a hint. The
# override exists so the panel is usable in development before anyone has gone
# through the file, and it is read from the environment so it cannot be turned
# on by anything a child or a request can reach.
ALLOW_UNAPPROVED = os.environ.get("ALLOW_UNAPPROVED_CONTENT") == "true"

TEACH = "teach"
PRACTICE = "practice"
REVIEW = "review"
ADVANCE = "advance"


def _mastery_of(mastery: dict, skill_id: str) -> float:
    """A skill nobody has evidence for is assumed unlearned, not assumed fine."""
    return float(mastery.get(skill_id, P_INIT))


def _servable(skill_id: str) -> bool:
    return is_approved(skill_id) or ALLOW_UNAPPROVED


def content_for_skill(skill_id: str) -> dict | None:
    """
    The content for one named skill, with the same approval gate applied.

    Public because things other than the planner need it: checking a practice
    attempt means knowing which signals that skill's task asked for, and asking
    the planner would return whatever it thinks the child should do instead.
    """
    return _content_for(skill_id)


def _content_for(skill_id: str) -> dict | None:
    """
    The micro-lesson and practice task for a skill, if it may be served.

    Returns None when the content exists but nobody has approved it, which the
    caller must treat as "there is nothing to give this child" rather than
    serving it anyway.
    """
    skill = get_skill(skill_id)
    if not skill or not _servable(skill_id):
        return None
    return {
        "skill": skill_id,
        "name": skill["name"],
        "micro_lesson": dict(skill["micro_lesson"]),
        "practice": dict(skill["practice"]),
        "approved": bool(skill.get("approved")),
    }


def weakest_unmastered_prerequisite(mastery: dict, skill_id: str, _seen=None):
    """
    The real gap under a skill, or None if its foundations are sound.

    Walks the whole prerequisite tree, not just the immediate parents, because
    the thing that is actually broken may be two or three steps down. Of
    everything unmastered, the weakest is returned: that is where teaching pays
    off most, and it is the thing everything else is resting on.

    _seen guards against a cycle in the skill map. A badly edited skills.yaml
    should not hang the service.
    """
    seen = _seen if _seen is not None else set()
    if skill_id in seen:
        return None
    seen.add(skill_id)

    weakest = None
    weakest_p = None

    for parent in prerequisites_of(skill_id):
        if parent in seen:
            continue

        # Look underneath this parent first, so a deep gap wins over a shallow
        # one even when both are unmastered.
        deeper = weakest_unmastered_prerequisite(mastery, parent, seen)
        candidates = []
        if deeper:
            candidates.append(deeper)
        if _mastery_of(mastery, parent) < MASTERED:
            candidates.append(parent)

        for candidate in candidates:
            p = _mastery_of(mastery, candidate)
            if weakest_p is None or p < weakest_p:
                weakest, weakest_p = candidate, p

    return weakest


def _weakest_target(mastery: dict, target_skills: list):
    """Of the skills asked about, the one the child is furthest from."""
    if not target_skills:
        return None
    return min(target_skills, key=lambda s: _mastery_of(mastery, s))


def plan(mastery: dict, target_skills: list) -> dict:
    """
    The next step for this child.

    action is one of teach, practice, review or advance:

      teach     they do not understand it yet, so explain it and set practice
      practice  they half know it; another go is worth more than another
                explanation
      review    the target is mastered but something underneath it is not, so
                go back and firm that up before building on it
      advance   nothing here needs work
    """
    mastery = mastery or {}
    targets = [t for t in (target_skills or []) if get_skill(t)]

    if not targets:
        return {
            "action": ADVANCE,
            "skill": None,
            "content": None,
            "reason": "There is no lesson skill to work on at the moment.",
        }

    target = _weakest_target(mastery, targets)
    target_p = _mastery_of(mastery, target)
    target_name = get_skill(target)["name"]

    root = weakest_unmastered_prerequisite(mastery, target)

    # The target is fine, but something it rests on is not. Worth going back:
    # the next lesson will lean on it even if this one no longer does.
    if target_p >= MASTERED:
        if root:
            return _step(
                REVIEW,
                root,
                f"{target_name} looks solid, but {get_skill(root)['name'].lower()} "
                f"underneath it is still shaky, so go back to that first.",
            )
        return {
            "action": ADVANCE,
            "skill": target,
            "content": None,
            "reason": f"{target_name} is solid and everything it depends on is too, "
            "so this child is ready for the next thing.",
        }

    # The target is weak, and something it rests on is not learned yet. That is
    # the real problem, whatever the two numbers happen to be: a child cannot
    # loop a movement they cannot reliably produce, so a lower score on loops
    # than on motion does not make loops the thing to teach. Fix the
    # foundation, then come back.
    if root:
        return _step(
            TEACH,
            root,
            f"They are stuck on {target_name.lower()}, but the cause looks like "
            f"{get_skill(root)['name'].lower()}, so teach that first.",
        )

    # The target itself is the weakest thing. How weak decides whether they
    # need it explained again or just another go at it.
    if target_p <= STRUGGLING:
        return _step(
            TEACH,
            target,
            f"They have not got {target_name.lower()} yet, so explain it and "
            "give them something small to try.",
        )

    return _step(
        PRACTICE,
        target,
        f"They half know {target_name.lower()}, so another go will help more "
        "than another explanation.",
    )


def _step(action: str, skill_id: str, reason: str) -> dict:
    """
    Wrap a decision with its content.

    If the content is not approved, the decision still stands and is still
    reported, but nothing is served. A teacher reading the queue can see what
    the child needs even when there is nothing yet cleared to give them.
    """
    content = _content_for(skill_id)
    if content is None:
        return {
            "action": action,
            "skill": skill_id,
            "content": None,
            "reason": reason,
            "blocked": "This content has not been approved yet, so it has not "
            "been shown to the child.",
        }
    return {"action": action, "skill": skill_id, "content": content, "reason": reason}
