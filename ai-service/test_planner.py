"""
The planner decides what a child is taught, so root-cause selection is pinned
down here. Mastery values are chosen to sit clearly inside a band rather than
on a threshold, so a change to the thresholds does not quietly rewrite what
these tests mean.
"""

# Deferred annotation evaluation, so the modern union and builtin generic
# syntax below also runs on Python 3.8 and 3.9.
from __future__ import annotations

import planner
from learner_model import MASTERED, P_INIT
from planner import ADVANCE, PRACTICE, REVIEW, TEACH, plan, weakest_unmastered_prerequisite

SOLID = 0.95
HALF = 0.6
WEAK = 0.15


def everything(p):
    return {
        "events": p,
        "sequencing": p,
        "motion": p,
        "loops": p,
        "conditionals": p,
        "variables": p,
    }


# Content is unapproved by default, which is the point of the gate, but it
# would make every test here assert the same "blocked" branch. These tests are
# about which skill gets chosen, so serving is turned on for them.
def setup_module():
    planner.ALLOW_UNAPPROVED = True


def teardown_module():
    planner.ALLOW_UNAPPROVED = False


# ---------- root cause ----------


def test_weak_loops_with_weak_motion_teaches_motion():
    """The stated case: loops fail, but motion is the thing that is broken."""
    mastery = everything(SOLID)
    mastery.update({"loops": 0.2, "motion": WEAK})
    step = plan(mastery, ["loops"])
    assert step["action"] == TEACH
    assert step["skill"] == "motion"


def test_weak_loops_with_sound_prerequisites_teaches_loops():
    mastery = everything(SOLID)
    mastery["loops"] = WEAK
    step = plan(mastery, ["loops"])
    assert step["action"] == TEACH
    assert step["skill"] == "loops"


def test_the_deepest_gap_wins_not_the_nearest():
    """
    loops <- motion <- sequencing <- events. Events is the weakest, so that is
    where teaching starts, even though motion is the immediate parent.
    """
    mastery = everything(SOLID)
    mastery.update({"loops": 0.2, "motion": 0.3, "sequencing": 0.25, "events": 0.05})
    step = plan(mastery, ["loops"])
    assert step["skill"] == "events"


def test_of_two_weak_prerequisites_the_weaker_is_chosen():
    mastery = everything(SOLID)
    mastery.update({"loops": 0.1, "motion": 0.3, "sequencing": 0.5})
    assert plan(mastery, ["loops"])["skill"] == "motion"


def test_unknown_skills_count_as_unlearned_not_as_fine():
    """An empty mastery map must not read as "this child knows everything"."""
    step = plan({}, ["loops"])
    assert step["action"] == TEACH
    assert step["skill"] == "events"  # the root of the chain


def test_prerequisite_walk_returns_none_when_foundations_are_sound():
    assert weakest_unmastered_prerequisite(everything(SOLID), "loops") is None


def test_a_cycle_in_the_skill_map_does_not_hang(monkeypatch):
    monkeypatch.setattr(
        planner, "prerequisites_of", lambda s: {"a": ["b"], "b": ["a"]}.get(s, [])
    )
    assert weakest_unmastered_prerequisite({"a": 0.1, "b": 0.1}, "a") in ("a", "b", None)


# ---------- the four actions ----------


def test_mastered_target_with_sound_foundations_advances():
    step = plan(everything(SOLID), ["loops"])
    assert step["action"] == ADVANCE
    assert step["content"] is None


def test_mastered_target_with_a_weak_prerequisite_reviews_it():
    mastery = everything(SOLID)
    mastery["motion"] = WEAK
    step = plan(mastery, ["loops"])
    assert step["action"] == REVIEW
    assert step["skill"] == "motion"


def test_half_known_target_practises_rather_than_re_explaining():
    mastery = everything(SOLID)
    mastery["loops"] = HALF
    step = plan(mastery, ["loops"])
    assert step["action"] == PRACTICE
    assert step["skill"] == "loops"


def test_struggling_target_gets_taught():
    mastery = everything(SOLID)
    mastery["loops"] = WEAK
    assert plan(mastery, ["loops"])["action"] == TEACH


# ---------- several targets ----------


def test_the_weakest_target_is_worked_on_first():
    mastery = everything(SOLID)
    mastery.update({"loops": 0.5, "variables": 0.1})
    assert plan(mastery, ["loops", "variables"])["skill"] == "variables"


def test_no_targets_advances_without_a_skill():
    step = plan(everything(SOLID), [])
    assert step["action"] == ADVANCE
    assert step["skill"] is None


def test_unknown_target_skills_are_ignored():
    step = plan(everything(SOLID), ["not-a-real-skill"])
    assert step["action"] == ADVANCE
    assert step["skill"] is None


# ---------- what comes back ----------


def test_content_carries_a_micro_lesson_and_a_practice_task():
    mastery = everything(SOLID)
    mastery["loops"] = WEAK
    content = plan(mastery, ["loops"])["content"]
    assert content["skill"] == "loops"
    assert content["micro_lesson"]["explanation"]
    assert content["micro_lesson"]["worked_example"]
    assert content["practice"]["prompt"]
    assert content["practice"]["required_signals"]


def test_the_reason_is_one_plain_sentence():
    mastery = everything(SOLID)
    mastery.update({"loops": 0.2, "motion": WEAK})
    reason = plan(mastery, ["loops"])["reason"]
    assert reason.endswith(".")
    assert reason.count(".") == 1
    assert len(reason) < 200
    # Names the skill being taught, so a teacher can tell what it decided.
    assert "motion" in reason.lower() or "move" in reason.lower()


def test_every_action_has_a_reason():
    cases = [
        (everything(SOLID), ["loops"]),
        ({**everything(SOLID), "loops": WEAK}, ["loops"]),
        ({**everything(SOLID), "loops": HALF}, ["loops"]),
        ({**everything(SOLID), "motion": WEAK}, ["loops"]),
        ({}, []),
    ]
    for mastery, targets in cases:
        assert plan(mastery, targets)["reason"].strip()


def test_planning_is_reproducible():
    mastery = everything(SOLID)
    mastery.update({"loops": 0.2, "motion": WEAK})
    assert plan(mastery, ["loops"]) == plan(mastery, ["loops"])


# ---------- the approval gate on content ----------


def test_unapproved_content_is_decided_but_not_served():
    planner.ALLOW_UNAPPROVED = False
    try:
        mastery = everything(SOLID)
        mastery["loops"] = WEAK
        step = plan(mastery, ["loops"])
        assert step["action"] == TEACH
        assert step["skill"] == "loops"
        assert step["content"] is None
        assert "not been approved" in step["blocked"]
        assert step["reason"]
    finally:
        planner.ALLOW_UNAPPROVED = True


def test_advance_needs_no_content_so_is_never_blocked():
    planner.ALLOW_UNAPPROVED = False
    try:
        assert "blocked" not in plan(everything(SOLID), ["loops"])
    finally:
        planner.ALLOW_UNAPPROVED = True
