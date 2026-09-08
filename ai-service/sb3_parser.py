"""
Reads a Scratch .sb3 file and extracts the block-level signals the tutor needs.
A .sb3 is a ZIP archive containing project.json, which lists every block.
"""

import io
import json
import zipfile


def parse_sb3(data: bytes) -> dict:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        with z.open("project.json") as f:
            project = json.load(f)

    opcodes = []
    for target in project.get("targets", []):
        # target is a sprite or the stage; its blocks live in a dict keyed by block id.
        for block in target.get("blocks", {}).values():
            # Most blocks are dicts with an "opcode". Some entries are compressed
            # arrays (shadow inputs); we skip those, they aren't real blocks.
            if isinstance(block, dict) and "opcode" in block:
                opcodes.append(block["opcode"])

    return summarize(opcodes)


def summarize(opcodes: list) -> dict:
    def has(pred):
        return any(pred(o) for o in opcodes)

    return {
        "block_count": len(opcodes),
        "has_green_flag": "event_whenflagclicked" in opcodes,
        "has_motion": has(lambda o: o.startswith("motion_")),
        "has_move": "motion_movesteps" in opcodes,
        "has_loop": has(
            lambda o: o in ("control_forever", "control_repeat", "control_repeat_until")
        ),
        "has_conditional": has(lambda o: o in ("control_if", "control_if_else")),
        "has_variable": has(lambda o: o.startswith("data_")),
        "opcodes": opcodes,
    }
