import time

COOLDOWN_SECONDS = 120  # no proactive nudge within this long of the last one
SESSION_CAP = 5  # at most this many proactive nudges per student per session
PROGRESS_QUIET_SECONDS = 15  # if the child edited within this window, stay quiet

# Per-student proactive state, in memory (resets on restart, fine for the prototype).
_last_nudge_at = {}  # studentId -> timestamp of last proactive nudge
_nudge_count = {}  # studentId -> nudges given this session


def may_speak(student_id: str, events: list) -> dict:
    now = time.time()

    # 1. Cooldown: not too soon after the last nudge.
    last = _last_nudge_at.get(student_id)
    if last is not None and now - last < COOLDOWN_SECONDS:
        return {"allow": False, "reason": "cooldown"}

    # 2. Session cap: don't exceed a sensible number of nudges.
    if _nudge_count.get(student_id, 0) >= SESSION_CAP:
        return {"allow": False, "reason": "cap_reached"}

    # 3. In-flow suppression: if they just edited, they're working; leave them be.
    for e in reversed(events):
        if e["kind"] in ("block_added", "block_deleted"):
            if now - e["at"] < PROGRESS_QUIET_SECONDS:
                return {"allow": False, "reason": "in_flow"}
            break

    return {"allow": True, "reason": None}


def record_nudge(student_id: str):
    """Call this only when a proactive nudge is actually sent."""
    _last_nudge_at[student_id] = time.time()
    _nudge_count[student_id] = _nudge_count.get(student_id, 0) + 1
