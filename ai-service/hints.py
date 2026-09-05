"""
Turns a diagnosis code into a graded, kid-friendly hint.
Level 1 = gentle nudge, 2 = clearer clue, 3 = worked step.
The level rises with how many times the child has already tried,
so the tutor guides before it ever reveals the answer.
"""

LADDER = {
    "missing_green_flag": {
        1: "How will your project know when to start? Look in the yellow Events blocks.",
        2: "Your code needs a starting block. Try adding 'when green flag clicked' at the top.",
        3: "Drag a 'when green flag clicked' block from Events and put it above your other blocks.",
    },
    "missing_move": {
        1: "What should your sprite actually do? Have a look in the blue Motion blocks.",
        2: "Add a movement block so your sprite goes somewhere.",
        3: "Drag a 'move 10 steps' block from Motion into your script.",
    },
    "missing_loop": {
        1: "Your sprite moves once. How could you make it keep going without clicking again and again? Look in the Control blocks.",
        2: "Try putting your move block inside a repeating block from the Control section.",
        3: "Take a 'forever' block from Control and place your 'move 10 steps' block inside it.",
    },
    "missing_conditional": {
        1: "How can your sprite make a decision? Look in the Control blocks for one that checks something.",
        2: "Try an 'if' block so something only happens when a condition is true.",
        3: "Drag an 'if then' block from Control and put the action you want inside it.",
    },
    "missing_variable": {
        1: "How could your project remember a number, like a score? Look in the Variables section.",
        2: "Make a variable to keep track of your score.",
        3: "In Variables, click 'Make a Variable', name it score, then use a 'set score to 0' block.",
    },
}

# Phrases that would give the answer away in a level-1 nudge.
# If a level-1 hint contains one, we drop back to the known-safe nudge.
GIVEAWAY = [
    "drag a",
    "take a 'forever'",
    "'make a variable'",
    "put it above",
    "inside it",
]


def level_for(attempts: int) -> int:
    return 1 if attempts <= 1 else (2 if attempts == 2 else 3)


def build_hint(diagnosis: str, attempts: int) -> dict:
    ladder = LADDER.get(diagnosis)
    if ladder is None:
        return {
            "level": 1,
            "text": "Let's take a look at this together. What are you trying to make happen?",
        }

    level = level_for(attempts)
    text = ladder[level]
    text = guardrail(text, level, ladder)
    return {"level": level, "text": text}


def guardrail(text: str, level: int, ladder: dict) -> str:
    # A level-1 nudge must never contain the full solution.
    if level == 1 and any(g in text.lower() for g in GIVEAWAY):
        return ladder[1]  # already the safe nudge, but this enforces it if edited later
    return text
