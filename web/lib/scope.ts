// What Milo is for, decided before the model is asked anything.
//
// A child typing into a box will type anything: a question about their
// homework, about football, about what Milo looks like. The model must not be
// the thing that decides how to handle that. It is asked to reword a Scratch
// hint, and a question about the capital of France would come back as a
// Scratch hint with a strange first sentence.
//
// So the answer is classified here, in code, and an off-topic one never
// reaches the model at all.

// Words that say the reply is about the thing in front of them. Scratch
// vocabulary, plus the ordinary words a child uses about their own project.
const IN_SCOPE = [
  "scratch", "block", "blocks", "sprite", "sprites", "stage", "backdrop",
  "costume", "sound", "script", "code", "coding", "program", "project",
  "loop", "loops", "repeat", "forever", "if", "else", "condition",
  "variable", "variables", "score", "move", "moving", "motion", "steps",
  "turn", "glide", "x", "y", "flag", "green flag", "start", "event",
  "click", "clicked", "key", "press", "broadcast", "wait", "hide", "show",
  "say", "think", "draw", "pen", "clone", "touch", "touching", "bounce",
  "game", "animation", "character", "cat", "run", "play", "build", "make",
  "stuck", "help", "try", "tried", "work", "working", "broken", "error",
  "wrong", "right", "lesson", "level", "next", "how", "what", "why", "where",
  "which", "dont", "don't", "know", "think", "maybe", "yes", "no", "ok",
];

// Subjects that are plainly somewhere else. A match here is decisive: it says
// off-topic even if a stray in-scope word like "how" also appears, which is
// how "how do I do my maths homework" is caught.
const OUT_OF_SCOPE = [
  "homework", "maths", "math", "algebra", "spelling", "essay", "history",
  "geography", "capital of", "president", "football", "soccer", "minecraft",
  "roblox", "fortnite", "youtube", "tiktok", "netflix", "song", "singer",
  "joke", "weather", "dinner", "pizza", "birthday", "holiday", "pokemon",
  "who are you", "are you real", "are you human", "are you a robot",
  "your name", "how old are you", "buy", "money", "password", "address",
  "phone number",
];

export type Scope = { inScope: true } | { inScope: false; reply: string };

// Said to a child whose question is somewhere else. It is friendly, it does
// not tell them off, and it points at the one thing that is in front of them.
export const OUT_OF_SCOPE_REPLY =
  "That one is outside what I know about, sorry. I am only here to help " +
  "with your Scratch project, so ask me about your blocks and I will do my " +
  "best. If it is something else, your teacher or a grown-up is the one to ask.";

function words(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function classify(answer: string): Scope {
  const lower = answer.toLowerCase();

  // An explicit other subject settles it, whatever else is in the sentence.
  if (OUT_OF_SCOPE.some((p) => lower.includes(p))) {
    return { inScope: false, reply: OUT_OF_SCOPE_REPLY };
  }

  const w = words(answer);

  // Very short replies are almost always an answer to Milo's own question:
  // "yes", "I dont know", "a loop". Treating those as off-topic would be
  // maddening for a child who is doing exactly what was asked.
  if (w.length <= 4) return { inScope: true };

  // Longer than that, expect at least one word about the work. This is the
  // permissive direction on purpose: the cost of a false "off topic" to a
  // child who is genuinely stuck is higher than the cost of the model
  // rewording a hint next to a sentence about their dog.
  if (w.some((x) => IN_SCOPE.includes(x))) return { inScope: true };

  return { inScope: false, reply: OUT_OF_SCOPE_REPLY };
}
