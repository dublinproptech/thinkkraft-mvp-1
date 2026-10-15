"""
The governor decides whether the tutor is allowed to speak to a child
unprompted. It is the one piece of this service whose job is to say no, so
every rule it enforces is pinned down here, at and either side of its
threshold.

Three rules, checked in this order: cooldown, session cap, in-flow
suppression. The order matters as much as the rules, because the reason code
is what the web core logs and what a teacher is shown, so a blocked nudge has
to come back with the right explanation and not merely with a refusal.

On timing. The thresholds are compared against time.time(), so rather than
freeze the clock these tests place events a chosen number of seconds before
now and let real time move on underneath them. The few microseconds that pass
between building a case and asserting on it only ever push elapsed time up,
and both boundaries here are "<", so that drift moves a value at exactly the
threshold further into the allowed side, which is the side it already belongs
to. Nothing here is at the mercy of how fast the suite runs.
"""

from __future__ import annotations

import time

import pytest

import governor
from governor import COOLDOWN_SECONDS, PROGRESS_QUIET_SECONDS, SESSION_CAP, may_speak, record_nudge

CHILD = "student-1"
OTHER = "student-2"


@pytest.fixture(autouse=True)
def clean_state():
    """
    The governor keeps per-student state in module globals, deliberately: it
    resets when the service restarts and that is fine for a prototype. Tests
    have to clear it themselves or each one inherits the last one's nudges.
    """
    governor._last_nudge_at.clear()
    governor._nudge_count.clear()
    yield
    governor._last_nudge_at.clear()
    governor._nudge_count.clear()


def edit(seconds_ago: float, kind: str = "block_added") -> dict:
    return {"kind": kind, "at": time.time() - seconds_ago}


def tick(seconds_ago: float, kind: str = "idle_tick") -> dict:
    return {"kind": kind, "at": time.time() - seconds_ago}


# ---------- the permissive baseline ----------


def test_first_nudge_of_a_session_is_allowed():
    """Nothing has been said yet and nothing is being worked on, so speak."""
    gate = may_speak(CHILD, [])
    assert gate == {"allow": True, "reason": None}


def test_no_events_at_all_is_allowed():
    """An empty history is not evidence of anything, so it must not block."""
    assert may_speak(CHILD, [])["allow"] is True


def test_idle_history_does_not_block():
    """
    Idle ticks are what got the child here: looks_stuck() reports idle, and the
    governor is then asked whether it may act on that. Treating an idle tick as
    work would make the idle path unreachable.
    """
    events = [tick(90), tick(60), tick(30)]
    assert may_speak(CHILD, events)["allow"] is True


# ---------- rule 1: cooldown ----------


def test_nudge_immediately_after_another_is_blocked():
    record_nudge(CHILD)
    gate = may_speak(CHILD, [])
    assert gate == {"allow": False, "reason": "cooldown"}


def test_just_inside_the_cooldown_is_blocked():
    """One tenth of a second short of the window still counts as too soon."""
    governor._last_nudge_at[CHILD] = time.time() - (COOLDOWN_SECONDS - 0.1)
    gate = may_speak(CHILD, [])
    assert gate["allow"] is False
    assert gate["reason"] == "cooldown"


def test_exactly_at_the_cooldown_is_allowed():
    """The comparison is strict, so the threshold itself is on the yes side."""
    governor._last_nudge_at[CHILD] = time.time() - COOLDOWN_SECONDS
    assert may_speak(CHILD, [])["allow"] is True


def test_well_past_the_cooldown_is_allowed():
    governor._last_nudge_at[CHILD] = time.time() - (COOLDOWN_SECONDS + 60)
    assert may_speak(CHILD, [])["allow"] is True


# ---------- rule 2: session cap ----------


def test_nudges_up_to_the_cap_are_allowed():
    """
    Each nudge is placed outside the cooldown so this test measures the cap and
    not the cooldown. The count is what is being exercised, so it is driven
    through record_nudge rather than written into the dict directly.
    """
    for i in range(SESSION_CAP):
        assert may_speak(CHILD, [])["allow"] is True, f"nudge {i + 1} should be allowed"
        record_nudge(CHILD)
        governor._last_nudge_at[CHILD] = time.time() - (COOLDOWN_SECONDS + 1)

    assert governor._nudge_count[CHILD] == SESSION_CAP


def test_one_nudge_past_the_cap_is_blocked():
    governor._nudge_count[CHILD] = SESSION_CAP
    gate = may_speak(CHILD, [])
    assert gate == {"allow": False, "reason": "cap_reached"}


def test_one_below_the_cap_is_allowed():
    governor._nudge_count[CHILD] = SESSION_CAP - 1
    assert may_speak(CHILD, [])["allow"] is True


def test_the_cap_does_not_reset_with_time():
    """
    The cap is per session, not per window. A child who has had their five
    nudges does not earn a sixth by waiting, which is the difference between
    this rule and the cooldown.
    """
    governor._nudge_count[CHILD] = SESSION_CAP
    governor._last_nudge_at[CHILD] = time.time() - (COOLDOWN_SECONDS * 10)
    assert may_speak(CHILD, [])["reason"] == "cap_reached"


# ---------- rule 3: in-flow suppression ----------


def test_a_recent_edit_suppresses_the_nudge():
    gate = may_speak(CHILD, [edit(1)])
    assert gate == {"allow": False, "reason": "in_flow"}


def test_just_inside_the_quiet_window_is_blocked():
    gate = may_speak(CHILD, [edit(PROGRESS_QUIET_SECONDS - 0.1)])
    assert gate["reason"] == "in_flow"


def test_exactly_at_the_quiet_window_is_allowed():
    """Strict comparison again: at the threshold the child is no longer in flow."""
    assert may_speak(CHILD, [edit(PROGRESS_QUIET_SECONDS)])["allow"] is True


def test_an_old_edit_does_not_suppress():
    assert may_speak(CHILD, [edit(PROGRESS_QUIET_SECONDS + 10)])["allow"] is True


@pytest.mark.parametrize("kind", ["block_added", "block_deleted", "block_moved"])
def test_every_edit_kind_counts_as_working(kind):
    """
    block_moved is the one worth stating. Dragging a block or editing a value
    inside one adds nothing and deletes nothing, but it is still the child
    working, and interrupting a child mid-drag is the exact interruption this
    rule exists to prevent.
    """
    assert may_speak(CHILD, [edit(1, kind=kind)])["reason"] == "in_flow"


def test_running_the_project_is_not_an_edit():
    """
    ran_project is how the repeated-runs path is detected in the first place.
    If it counted as work, a child clicking the green flag over and over would
    silence the very nudge their clicking asked for.
    """
    assert may_speak(CHILD, [{"kind": "ran_project", "at": time.time()}])["allow"] is True


def test_only_the_most_recent_edit_is_considered():
    """
    The scan walks backwards to the newest edit and stops there. An old edit
    behind a run of idle ticks means the child has stopped working, so the
    stale edit must not keep suppressing nudges forever.
    """
    events = [edit(300), tick(90), tick(60), tick(30)]
    assert may_speak(CHILD, events)["allow"] is True


def test_a_recent_edit_behind_later_ticks_still_suppresses():
    """Non-edit events are skipped over, not treated as the end of the search."""
    events = [edit(2), tick(1)]
    assert may_speak(CHILD, events)["reason"] == "in_flow"


# ---------- order of precedence ----------


def test_cooldown_is_reported_before_the_cap():
    """
    Both rules fail here. Cooldown is checked first and its reason is the one
    that comes back, because "too soon" is the thing that will stop being true.
    """
    governor._nudge_count[CHILD] = SESSION_CAP
    record_nudge(CHILD)  # also pushes the count past the cap, which is fine
    assert may_speak(CHILD, [])["reason"] == "cooldown"


def test_cap_is_reported_before_in_flow():
    governor._nudge_count[CHILD] = SESSION_CAP
    assert may_speak(CHILD, [edit(1)])["reason"] == "cap_reached"


def test_cooldown_is_reported_before_in_flow():
    record_nudge(CHILD)
    assert may_speak(CHILD, [edit(1)])["reason"] == "cooldown"


# ---------- state is per child ----------


def test_one_childs_nudges_do_not_silence_another():
    """
    The state is keyed by student. A busy classroom would otherwise spend one
    child's allowance on the rest of the room.
    """
    for _ in range(SESSION_CAP):
        record_nudge(CHILD)

    assert may_speak(CHILD, [])["allow"] is False
    assert may_speak(OTHER, [])["allow"] is True


def test_record_nudge_tracks_time_and_count_together():
    record_nudge(CHILD)
    assert governor._nudge_count[CHILD] == 1
    assert governor._last_nudge_at[CHILD] == pytest.approx(time.time(), abs=2)

    record_nudge(CHILD)
    assert governor._nudge_count[CHILD] == 2


def test_asking_does_not_count_as_speaking():
    """
    may_speak() is a question, not an act. Only record_nudge() spends the
    allowance, so a gate that was opened and then not used must leave the
    child's budget untouched.
    """
    for _ in range(SESSION_CAP + 3):
        assert may_speak(CHILD, [])["allow"] is True

    assert CHILD not in governor._nudge_count
    assert CHILD not in governor._last_nudge_at
