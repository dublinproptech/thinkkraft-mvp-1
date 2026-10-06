"""
The skill map, loaded once, plus the one place diagnosis codes become skills.

checker.py says what is missing in the language of the lesson
("missing_loop"). The learner model thinks in skills ("loops"). This module is
the only translation between the two, so neither has to know about the other.

Nothing here decides anything about a child. It is a lookup table with a
loader, kept separate so the planner and the learner model can both read it
without either owning it.
"""

# Deferred annotation evaluation, so the modern union and builtin generic
# syntax below also runs on Python 3.8 and 3.9.
from __future__ import annotations

import os
from functools import lru_cache

import yaml

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content")
SKILLS_FILE = os.path.join(CONTENT_DIR, "skills.yaml")

# A diagnosis names the gap the checker found. A skill names the thing the
# child has not learned yet. Mostly one to one, but the mapping lives here so
# a new diagnosis does not mean touching the learner model.
DIAGNOSIS_TO_SKILL = {
    "missing_green_flag": "events",
    "missing_move": "motion",
    "missing_loop": "loops",
    "missing_conditional": "conditionals",
    "missing_variable": "variables",
}


@lru_cache(maxsize=1)
def load_skills() -> dict:
    """Every skill, keyed by id. Cached: the file does not change at runtime."""
    with open(SKILLS_FILE, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return {s["id"]: s for s in raw.get("skills", [])}


def skill_ids() -> list:
    return list(load_skills().keys())


def get_skill(skill_id: str):
    return load_skills().get(skill_id)


def skill_for_diagnosis(diagnosis: str):
    """
    The skill a checker diagnosis points at, or None.

    Proactive nudges arrive as "proactive:idle" and similar. They say the child
    went quiet, not that they got anything wrong, so they map to no skill and
    contribute no evidence. Guessing a skill from silence would move a child's
    mastery on the strength of them pausing to think.
    """
    if not diagnosis:
        return None
    return DIAGNOSIS_TO_SKILL.get(diagnosis)


def prerequisites_of(skill_id: str) -> list:
    skill = get_skill(skill_id)
    return list(skill.get("prerequisites", [])) if skill else []


def is_approved(skill_id: str) -> bool:
    skill = get_skill(skill_id)
    return bool(skill and skill.get("approved") is True)
