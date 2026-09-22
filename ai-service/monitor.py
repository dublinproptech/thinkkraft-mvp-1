import time

IDLE_SECONDS = 30  # no activity for this long counts as idle
IDLE_TICKS_TO_TRIGGER = 3  # this many idle ticks in a row means stuck
REPEATED_RUNS_TO_TRIGGER = 3  # ran the project this many times with no edits between

# What counts as the child working on their project.
#
# block_moved covers a change that neither adds nor removes a block: dragging a
# block somewhere new, or editing a value inside one. It is quieter than adding
# a block but it is still the child working, so it breaks a run of idle ticks
# and it counts as an edit between runs.
EDIT_KINDS = ("block_added", "block_deleted", "block_moved")


def looks_stuck(events: list) -> dict:
    """events: list of {"kind": str, "at": float}, oldest first."""
    if not events:
        return {"stuck": False, "reason": None}

    # Rule 1: a run of idle ticks at the end means the child has gone quiet.
    trailing_idle = 0
    for e in reversed(events):
        if e["kind"] == "idle_tick":
            trailing_idle += 1
        else:
            break
    if trailing_idle >= IDLE_TICKS_TO_TRIGGER:
        return {"stuck": True, "reason": "idle"}

    # Rule 2: repeated runs with no edit between them = trying the same thing over.
    recent = events[-6:]
    runs = sum(1 for e in recent if e["kind"] == "ran_project")
    edits = sum(1 for e in recent if e["kind"] in EDIT_KINDS)
    if runs >= REPEATED_RUNS_TO_TRIGGER and edits == 0:
        return {"stuck": True, "reason": "repeated_runs"}

    return {"stuck": False, "reason": None}
