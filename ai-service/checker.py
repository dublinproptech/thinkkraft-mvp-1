"""
Decides, from the parsed signals, whether a project meets its lesson goal,
and if not, names the exact concept the child is missing (the "diagnosis").
This is deterministic on purpose: correctness is never left to the language model.
"""

# Each lesson requires a set of concepts. The keys map to signals from the parser.
LESSON_REQUIREMENTS = {
    "loops-1": ["has_green_flag", "has_move", "has_loop"],
    "conditionals-1": ["has_green_flag", "has_conditional"],
    "variables-1": ["has_variable"],
}

# When a required concept is missing, this is the diagnosis code we emit.
# The order here is the teaching order: we report the earliest missing concept.
DIAGNOSIS_FOR = {
    "has_green_flag": "missing_green_flag",
    "has_move": "missing_move",
    "has_loop": "missing_loop",
    "has_conditional": "missing_conditional",
    "has_variable": "missing_variable",
}


def check(lesson_id: str, signals: dict) -> dict:
    required = LESSON_REQUIREMENTS.get(lesson_id)
    if required is None:
        return {"correct": False, "diagnosis": "unknown_lesson"}

    # Walk the requirements in teaching order; the first one not satisfied
    # is what we coach on. Reporting one gap at a time keeps hints focused.
    for concept in required:
        if not signals.get(concept):
            return {"correct": False, "diagnosis": DIAGNOSIS_FOR[concept]}

    return {"correct": True, "diagnosis": None}


def check_signals(signals: dict, required: list) -> dict:
    """
    Does this project show every signal a practice task asked for?

    Lessons are checked against LESSON_REQUIREMENTS above. A practice task is
    not a lesson: it belongs to a skill and names its own signals, so it is
    checked against those. Same deterministic rule, different source for the
    list.
    """
    missing = [s for s in (required or []) if not signals.get(s)]
    return {"correct": not missing, "missing": missing}
