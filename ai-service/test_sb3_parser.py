"""
The parser decides whether a child's project is correct, so the cases that
used to be read wrongly are pinned down here.

The projects are built in memory rather than loaded from .sb3 fixtures, so the
test says in plain terms what arrangement of blocks it is describing. The
shapes match what the editor writes: a hat block with topLevel true, next
pointers down a stack, and SUBSTACK for the inside of a C block.
"""

from __future__ import annotations

import io
import json
import zipfile

from checker import check
from sb3_parser import parse_sb3


def sb3(blocks: dict) -> bytes:
    """A minimal .sb3 containing one sprite with these blocks."""
    project = {"targets": [{"isStage": False, "name": "Sprite1", "blocks": blocks}]}
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as z:
        z.writestr("project.json", json.dumps(project))
    return buffer.getvalue()


def block(opcode, *, next=None, parent=None, inputs=None, top=False):
    return {
        "opcode": opcode,
        "next": next,
        "parent": parent,
        "inputs": inputs or {},
        "fields": {},
        "shadow": False,
        "topLevel": top,
    }


FLAG = "event_whenflagclicked"
MOVE = "motion_movesteps"


# ---------- the case the report found ----------


def test_loose_blocks_do_not_count_as_a_finished_project():
    """
    A green flag, an empty repeat and a move block, none of them joined.

    Clicking the flag does nothing at all. This was read as a correct loops
    project because the parser only looked at which opcodes existed.
    """
    data = sb3(
        {
            "h": block(FLAG, top=True),
            "lp": block("control_repeat", top=True),
            "mv": block(MOVE, top=True),
        }
    )
    signals = parse_sb3(data)
    assert signals["has_green_flag"] is True
    assert signals["has_move"] is False
    assert signals["has_loop"] is False
    assert check("loops-1", signals)["correct"] is False


def test_a_stack_with_no_hat_on_top_never_runs():
    """A loop with a move inside it, but nothing to start it."""
    data = sb3(
        {
            "lp": block("control_forever", inputs={"SUBSTACK": [2, "mv"]}, top=True),
            "mv": block(MOVE, parent="lp"),
        }
    )
    signals = parse_sb3(data)
    assert signals["connected_block_count"] == 0
    assert signals["has_loop"] is False
    assert check("loops-1", signals)["diagnosis"] == "missing_green_flag"


def test_a_loop_beside_the_script_rather_than_in_it():
    """Flag joined to a move, with an empty loop sitting next to them."""
    data = sb3(
        {
            "h": block(FLAG, next="mv", top=True),
            "mv": block(MOVE, parent="h"),
            "lp": block("control_forever", top=True),
        }
    )
    signals = parse_sb3(data)
    assert signals["has_move"] is True
    assert signals["has_loop"] is False
    assert check("loops-1", signals)["diagnosis"] == "missing_loop"


# ---------- what the lesson actually asks for ----------


def test_a_connected_loop_with_the_move_inside_is_correct():
    data = sb3(
        {
            "h": block(FLAG, next="lp", top=True),
            "lp": block("control_forever", parent="h", inputs={"SUBSTACK": [2, "mv"]}),
            "mv": block(MOVE, parent="lp"),
        }
    )
    signals = parse_sb3(data)
    assert signals["move_inside_loop"] is True
    assert check("loops-1", signals)["correct"] is True


def test_a_loop_and_a_move_in_sequence_is_not_the_lesson():
    """
    Flag, then a move, then an empty loop under it. Everything is connected
    and everything runs, but the sprite still moves once and stops, which is
    the thing the lesson is about.
    """
    data = sb3(
        {
            "h": block(FLAG, next="mv", top=True),
            "mv": block(MOVE, parent="h", next="lp"),
            "lp": block("control_forever", parent="mv"),
        }
    )
    signals = parse_sb3(data)
    assert signals["has_loop"] is True
    assert signals["move_inside_loop"] is False
    assert check("loops-1", signals)["diagnosis"] == "missing_loop"


def test_a_move_nested_deeper_inside_the_loop_still_counts():
    """The movement is inside an if, inside the forever."""
    data = sb3(
        {
            "h": block(FLAG, next="lp", top=True),
            "lp": block("control_forever", parent="h", inputs={"SUBSTACK": [2, "if"]}),
            "if": block("control_if", parent="lp", inputs={"SUBSTACK": [2, "mv"]}),
            "mv": block(MOVE, parent="if"),
        }
    )
    assert parse_sb3(sb3({})) is not None  # empty project does not raise
    assert parse_sb3(data)["move_inside_loop"] is True


# ---------- counts ----------


def test_block_count_is_everything_and_connected_count_is_what_runs():
    """
    Progress records how much a child has built, so block_count stays as the
    whole canvas. Correctness uses the connected count.
    """
    data = sb3(
        {
            "h": block(FLAG, next="mv", top=True),
            "mv": block(MOVE, parent="h"),
            "spare": block("motion_turnright", top=True),
        }
    )
    signals = parse_sb3(data)
    assert signals["block_count"] == 3
    assert signals["connected_block_count"] == 2


def test_an_empty_project_is_handled():
    signals = parse_sb3(sb3({}))
    assert signals["block_count"] == 0
    assert signals["has_green_flag"] is False
    assert check("loops-1", signals)["diagnosis"] == "missing_green_flag"


def test_a_block_pointing_at_itself_does_not_hang():
    """A malformed file should not take the service down."""
    data = sb3({"h": block(FLAG, next="h", top=True)})
    assert parse_sb3(data)["has_green_flag"] is True


def test_compressed_input_entries_are_not_treated_as_blocks():
    """
    A literal value is stored as a nested array rather than a block id, and a
    variable reporter as [12, name, id]. Neither is a block a child dragged.
    """
    data = sb3(
        {
            "h": block(FLAG, next="st", top=True),
            "st": block(
                "data_setvariableto",
                parent="h",
                inputs={"VALUE": [3, [12, "score", "id1"], [10, "0"]]},
            ),
        }
    )
    signals = parse_sb3(data)
    assert signals["has_variable"] is True
    assert signals["connected_block_count"] == 2


# ---------- other lessons still work ----------


def test_conditionals_lesson_needs_a_connected_conditional():
    loose = sb3({"h": block(FLAG, top=True), "if": block("control_if", top=True)})
    assert check("conditionals-1", parse_sb3(loose))["diagnosis"] == "missing_conditional"

    joined = sb3({"h": block(FLAG, next="if", top=True), "if": block("control_if", parent="h")})
    assert check("conditionals-1", parse_sb3(joined))["correct"] is True
