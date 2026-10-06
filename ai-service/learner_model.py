"""
How sure we are that a child understands a skill, updated from what they do.

Bayesian Knowledge Tracing. One number per skill, between 0 and 1, meaning
"the probability this child has learned it". Each piece of evidence moves it.

No language model is involved and none may be. This number decides what a
child is taught next, so it has to be reproducible: the same evidence in the
same order must always give the same answer, and a person has to be able to
work out why it moved.

The model has two steps per piece of evidence:

  1. Given what they just did, how likely is it they already knew it?
     Correct answers are evidence of knowing, but a child who knows something
     still slips sometimes, and a child who does not know it still guesses
     right sometimes. P_SLIP and P_GUESS are those two.
  2. Whether or not they knew it, they may have just learned it from the
     attempt itself. P_LEARN adds that.
"""

# Deferred annotation evaluation, so the modern union and builtin generic
# syntax below also runs on Python 3.8 and 3.9.
from __future__ import annotations

from dataclasses import dataclass

# Before a child has done anything, assume they probably do not know it yet.
# Low rather than zero: some children arrive already able to do this.
P_INIT = 0.2

# Chance a child learns a skill from one attempt, whether or not they got it
# right. Struggling with something is itself a way of learning it.
P_LEARN = 0.15

# Chance a child who does understand gets it wrong anyway: a typo, a
# mis-dragged block, a distraction.
P_SLIP = 0.1

# Chance a child who does not understand gets it right anyway: copied it,
# guessed, or dropped a block in the right place by accident.
P_GUESS = 0.2

# At or above this, treat the skill as learned and move on.
MASTERED = 0.85

# At or below this, the child needs teaching rather than another attempt.
STRUGGLING = 0.4

# How much a success counts for when the child was being helped at the time.
#
# Hints escalate: level 1 nudges, level 2 gives a clearer clue, level 3 spells
# out the step. Getting it right after level 3 mostly shows the child can
# follow an instruction, which is not the same as understanding. So a success
# is discounted by how much help it took, and the discount is applied by
# shrinking the gain towards where the estimate already was.
#
# Level 1 or no hint counts in full. Level 2 counts a little over half. Level 3
# counts a third. Failures are never discounted: needing help and still not
# managing it is evidence either way.
HINT_CREDIT = {0: 1.0, 1: 1.0, 2: 0.6, 3: 0.35}


@dataclass(frozen=True)
class Evidence:
    skill: str
    correct: bool
    hint_level: int = 0


def _credit(hint_level: int) -> float:
    """How much of a success to count. Unknown levels get the harshest credit."""
    if hint_level is None:
        return HINT_CREDIT[0]
    if hint_level in HINT_CREDIT:
        return HINT_CREDIT[hint_level]
    # Anything above the ladder is at least as much help as level 3.
    return HINT_CREDIT[3] if hint_level > 3 else HINT_CREDIT[0]


def clamp(p: float) -> float:
    """Keep an estimate inside (0, 1), never reaching certainty either way."""
    return max(0.001, min(0.999, p))


def update_one(prior: float, correct: bool, hint_level: int = 0) -> float:
    """
    One piece of evidence, one skill.

    Returns the new probability that the child has learned the skill.
    """
    p = clamp(prior)

    # Step 1: what the attempt says about what they already knew.
    if correct:
        # They got it right. Either they knew it and did not slip, or they did
        # not know it and guessed.
        numerator = p * (1 - P_SLIP)
        denominator = numerator + (1 - p) * P_GUESS
    else:
        # They got it wrong. Either they knew it and slipped, or they did not
        # know it and did not guess.
        numerator = p * P_SLIP
        denominator = numerator + (1 - p) * (1 - P_GUESS)

    posterior = numerator / denominator if denominator > 0 else p

    # Step 2: they may have learned it from the attempt itself.
    posterior = posterior + (1 - posterior) * P_LEARN

    # A success earned with a lot of help moves the estimate less far. The
    # discount pulls the result back towards where it started rather than
    # capping it, so a heavily hinted success still helps, just less.
    if correct:
        credit = _credit(hint_level)
        posterior = p + (posterior - p) * credit

    return clamp(posterior)


def update(prior: dict, evidence: list) -> dict:
    """
    Apply a run of evidence to a set of skills.

    Skills the evidence does not mention are returned unchanged. A skill that
    appears in the evidence but not in the prior starts at P_INIT, which is how
    a child's first attempt at something new is handled.
    """
    posterior = dict(prior)

    for item in evidence:
        skill = item["skill"] if isinstance(item, dict) else item.skill
        if not skill:
            # Evidence with no skill attached, such as a proactive nudge.
            # Nothing to update, and guessing would be worse than skipping.
            continue

        correct = bool(item["correct"] if isinstance(item, dict) else item.correct)
        raw_level = (
            item.get("hint_level", 0) if isinstance(item, dict) else item.hint_level
        )
        hint_level = int(raw_level or 0)

        current = posterior.get(skill, P_INIT)
        posterior[skill] = update_one(current, correct, hint_level)

    return posterior


def level_for(p: float) -> str:
    """
    The estimate as a word.

    Children and parents see this, never the number. A probability invites
    people to treat it as a mark out of a hundred, which it is not.
    """
    if p >= MASTERED:
        return "confident"
    if p <= STRUGGLING:
        return "needs help"
    return "getting there"
