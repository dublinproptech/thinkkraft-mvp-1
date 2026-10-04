"""
The learner model decides what a child is taught, so its behaviour is pinned
down here rather than left to be discovered later.
"""

# Deferred annotation evaluation, so the modern union and builtin generic
# syntax below also runs on Python 3.8 and 3.9.
from __future__ import annotations

import pytest

from learner_model import (
    MASTERED,
    P_INIT,
    STRUGGLING,
    Evidence,
    level_for,
    update,
    update_one,
)


# ---------- the direction each kind of evidence moves the estimate ----------


def test_correct_raises_the_estimate():
    assert update_one(P_INIT, correct=True) > P_INIT


def test_incorrect_lowers_the_estimate():
    assert update_one(P_INIT, correct=False) < P_INIT


def test_repeated_success_reaches_mastery():
    p = P_INIT
    for _ in range(6):
        p = update_one(p, correct=True)
    assert p >= MASTERED


def test_repeated_failure_reaches_struggling():
    p = 0.7
    for _ in range(5):
        p = update_one(p, correct=False)
    assert p <= STRUGGLING


# ---------- hints dampen gains ----------


def test_hints_dampen_the_gain():
    """A success with more help moves the estimate less far."""
    unaided = update_one(P_INIT, correct=True, hint_level=0)
    nudged = update_one(P_INIT, correct=True, hint_level=1)
    clearer = update_one(P_INIT, correct=True, hint_level=2)
    spelled_out = update_one(P_INIT, correct=True, hint_level=3)

    assert unaided == nudged  # a level-1 nudge is not really help
    assert nudged > clearer > spelled_out > P_INIT


def test_a_heavily_hinted_success_still_helps():
    """Discounted, not cancelled: they did get there."""
    assert update_one(P_INIT, correct=True, hint_level=3) > P_INIT


def test_failure_is_not_discounted_by_hint_level():
    """
    Needing a lot of help and still not managing it is not weaker evidence
    than failing unaided.
    """
    assert update_one(0.6, correct=False, hint_level=0) == update_one(
        0.6, correct=False, hint_level=3
    )


def test_unknown_hint_level_is_treated_as_maximum_help():
    assert update_one(P_INIT, correct=True, hint_level=9) == update_one(
        P_INIT, correct=True, hint_level=3
    )


# ---------- applying a run of evidence ----------


def test_update_leaves_unmentioned_skills_alone():
    prior = {"loops": 0.5, "motion": 0.9}
    after = update(prior, [{"skill": "loops", "correct": True}])
    assert after["motion"] == 0.9
    assert after["loops"] != 0.5


def test_a_skill_not_in_the_prior_starts_at_p_init():
    after = update({}, [{"skill": "variables", "correct": True}])
    assert after["variables"] == update_one(P_INIT, correct=True)


def test_evidence_with_no_skill_is_ignored():
    """Proactive nudges arrive with no skill. Silence is not a wrong answer."""
    prior = {"loops": 0.5}
    assert update(prior, [{"skill": None, "correct": False}]) == prior


def test_dataclass_evidence_works_too():
    prior = {"loops": 0.5}
    from_dict = update(prior, [{"skill": "loops", "correct": True, "hint_level": 2}])
    from_obj = update(prior, [Evidence(skill="loops", correct=True, hint_level=2)])
    assert from_dict == from_obj


def test_the_prior_is_not_mutated():
    prior = {"loops": 0.5}
    update(prior, [{"skill": "loops", "correct": True}])
    assert prior == {"loops": 0.5}


def test_order_matters_but_the_result_is_reproducible():
    ev = [
        {"skill": "loops", "correct": False},
        {"skill": "loops", "correct": True, "hint_level": 3},
    ]
    assert update({}, ev) == update({}, ev)


# ---------- edges ----------


@pytest.mark.parametrize("start", [0.0, 1.0, -5.0, 5.0])
def test_estimates_stay_inside_the_range(start):
    for correct in (True, False):
        p = update_one(start, correct=correct)
        assert 0.0 < p < 1.0


def test_certainty_is_never_reached():
    p = 0.5
    for _ in range(200):
        p = update_one(p, correct=True)
    assert p < 1.0


def test_missing_hint_level_is_treated_as_none():
    assert update({}, [{"skill": "loops", "correct": True}])["loops"] == update_one(
        P_INIT, correct=True, hint_level=0
    )


# ---------- the words children see ----------


def test_level_words():
    assert level_for(0.95) == "confident"
    assert level_for(0.2) == "needs help"
    assert level_for(0.6) == "getting there"
    # The thresholds themselves belong to the lower band, not between bands.
    assert level_for(MASTERED) == "confident"
    assert level_for(STRUGGLING) == "needs help"
