"""
Reads a Scratch .sb3 file and extracts the block-level signals the tutor needs.
A .sb3 is a ZIP archive containing project.json, which lists every block.

The important thing this does, and the thing it used to get wrong, is read the
shape of the child's scripts rather than a flat list of the blocks lying around.

A block only runs if it hangs off a hat block, directly or through a chain of
next pointers and the insides of C blocks. A "move 10 steps" sitting loose on
the canvas never executes. Counting it as evidence that the child has made
something move marked empty projects correct: an unconnected green flag, an
empty repeat and a stray move block satisfied the loops lesson while doing
nothing at all when the flag was clicked.

So the signals below are computed over connected blocks only, and the parser
also reports whether the movement is actually inside the loop, because
"put your move block inside the forever block" is the whole point of that
lesson and a loop with nothing in it has not been learned.
"""

from __future__ import annotations

import io
import json
import zipfile

# Blocks that can start a script. Anything not reachable from one of these
# never runs, however tidy it looks on the canvas.
HAT_OPCODES = {
    "event_whenflagclicked",
    "event_whenkeypressed",
    "event_whenthisspriteclicked",
    "event_whenstageclicked",
    "event_whenbroadcastreceived",
    "event_whenbackdropswitchesto",
    "event_whengreaterthan",
    "control_start_as_clone",
    "procedures_definition",
}

LOOP_OPCODES = {"control_forever", "control_repeat", "control_repeat_until"}
CONDITIONAL_OPCODES = {"control_if", "control_if_else"}

# The inputs that hold the body of a C block, as opposed to a value slot.
SUBSTACK_INPUTS = ("SUBSTACK", "SUBSTACK2")


def parse_sb3(data: bytes) -> dict:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        with z.open("project.json") as f:
            project = json.load(f)

    all_opcodes: list[str] = []
    connected_opcodes: list[str] = []
    move_inside_loop = False

    for target in project.get("targets", []):
        blocks = target.get("blocks", {})
        if not isinstance(blocks, dict):
            continue

        # Every block in the file, connected or not. Kept so block_count keeps
        # meaning "how much has this child put on the canvas", which is what
        # the progress record uses it for.
        for block in blocks.values():
            if _is_block(block):
                all_opcodes.append(block["opcode"])

        # Now the ones that would actually run.
        for block_id, block in blocks.items():
            if not _is_block(block):
                continue
            if block.get("opcode") not in HAT_OPCODES:
                continue
            # A hat that is not top level is not a script start.
            if not block.get("topLevel", False):
                continue

            for reached in _walk(blocks, block_id):
                reached_block = blocks.get(reached)
                if _is_block(reached_block):
                    connected_opcodes.append(reached_block["opcode"])

        if _move_inside_loop(blocks):
            move_inside_loop = True

    return summarize(all_opcodes, connected_opcodes, move_inside_loop)


def _is_block(block) -> bool:
    """
    Real blocks are objects with an opcode.

    Some entries in the table are compressed arrays standing in for a literal
    value or a variable reporter. They are not blocks a child dragged out.
    """
    return isinstance(block, dict) and "opcode" in block


def _input_block_ids(block: dict, only: tuple | None = None) -> list[str]:
    """
    The blocks sitting inside another block's inputs.

    An input looks like [type, value, shadow]. The value is a block id when it
    is a real block, or a nested array when it is a literal or a compressed
    reporter, which is why the type check matters.
    """
    found = []
    inputs = block.get("inputs") or {}
    if not isinstance(inputs, dict):
        return found
    for name, value in inputs.items():
        if only is not None and name not in only:
            continue
        if isinstance(value, list) and len(value) > 1 and isinstance(value[1], str):
            found.append(value[1])
    return found


def _walk(blocks: dict, start_id: str) -> set:
    """
    Every block reachable from start_id, following the script as it runs:
    down the next chain, and into the inputs, which is where the body of a
    loop or an if lives.

    Guards against a malformed file pointing a block at itself.
    """
    seen: set = set()
    stack = [start_id]
    while stack:
        current = stack.pop()
        if current in seen or current not in blocks:
            continue
        seen.add(current)

        block = blocks[current]
        if not _is_block(block):
            continue

        nxt = block.get("next")
        if isinstance(nxt, str):
            stack.append(nxt)
        stack.extend(_input_block_ids(block))

    return seen


def _move_inside_loop(blocks: dict) -> bool:
    """
    Is there a movement block inside a loop that actually runs?

    Both halves matter. A loop sitting loose on the canvas does not count, and
    neither does a movement next to a loop rather than inside it.
    """
    for block_id, block in blocks.items():
        if not _is_block(block) or block.get("opcode") not in LOOP_OPCODES:
            continue
        if not _reachable_from_hat(blocks, block_id):
            continue
        for body_start in _input_block_ids(block, only=SUBSTACK_INPUTS):
            for inner in _walk(blocks, body_start):
                inner_block = blocks.get(inner)
                if _is_block(inner_block) and inner_block["opcode"].startswith("motion_"):
                    return True
    return False


def _reachable_from_hat(blocks: dict, target_id: str) -> bool:
    for block_id, block in blocks.items():
        if not _is_block(block):
            continue
        if block.get("opcode") in HAT_OPCODES and block.get("topLevel", False):
            if target_id in _walk(blocks, block_id):
                return True
    return False


def summarize(
    all_opcodes: list,
    connected_opcodes: list | None = None,
    move_inside_loop: bool = False,
) -> dict:
    """
    The signals the checker reads.

    connected_opcodes defaults to all_opcodes so that a caller passing a bare
    list of opcodes, as the tests do, still gets a sensible answer.
    """
    if connected_opcodes is None:
        connected_opcodes = all_opcodes

    live = set(connected_opcodes)

    def has(pred):
        return any(pred(o) for o in live)

    return {
        # Everything on the canvas, which is what "how much have they built"
        # means for a progress record.
        "block_count": len(all_opcodes),
        # Everything that would run if the child clicked the flag.
        "connected_block_count": len(connected_opcodes),
        "has_green_flag": "event_whenflagclicked" in live,
        "has_motion": has(lambda o: o.startswith("motion_")),
        "has_move": "motion_movesteps" in live,
        "has_loop": has(lambda o: o in LOOP_OPCODES),
        "has_conditional": has(lambda o: o in CONDITIONAL_OPCODES),
        "has_variable": has(lambda o: o.startswith("data_")),
        # A loop with the movement actually inside it, which is what the loops
        # lesson asks for and what its hints describe.
        "move_inside_loop": move_inside_loop,
        "opcodes": connected_opcodes,
    }
