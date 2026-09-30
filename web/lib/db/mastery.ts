import { prisma } from "@/lib/prisma";

// What the app knows about how well one child understands each skill.
//
// The estimate itself is computed by the AI service's learner model, which is
// deterministic and has no language model in it. This file only stores what
// comes back and reads it out again. Nothing here decides anything.

// Mirrors learner_model.P_INIT. A skill with no evidence is assumed unlearned
// rather than assumed fine, so a child who has never tried something is taught
// it rather than skipped past it.
const P_INIT = 0.2;

// Mirrors MASTERED and STRUGGLING in learner_model.py. Duplicated on purpose:
// the enum is a database concern and the service should not have to know about
// Prisma to write one. If the thresholds move, they move in both places, which
// the test at the bottom of the learner model pins down.
const MASTERED = 0.85;
const STRUGGLING = 0.4;

// The existing MasteryLevel enum, derived from the estimate. NOT_STARTED is
// reserved for a skill with no evidence at all, so a child who has tried and
// struggled reads as LEARNING rather than as never having begun.
function levelFor(p: number, attempts = 1): "NOT_STARTED" | "LEARNING" | "PRACTISING" | "MASTERED" {
  if (attempts === 0) return "NOT_STARTED";
  if (p >= MASTERED) return "MASTERED";
  if (p <= STRUGGLING) return "LEARNING";
  return "PRACTISING";
}

export type Profile = {
  mastery: Record<string, number>;
  rows: {
    skill: string;
    pMastery: number;
    attempts: number;
    level: string;
    updatedAt: Date;
  }[];
};

// Everything known about one child, in the shape the AI service wants for a
// prior. A child with no rows yet gets an empty map, which the service reads
// as "nothing known", not as "knows nothing about anything in particular".
export async function getProfile(studentId: string): Promise<Profile> {
  const rows = await prisma.skillMastery.findMany({
    where: { studentId },
    orderBy: { skill: "asc" },
  });

  const mastery: Record<string, number> = {};
  for (const r of rows) mastery[r.skill] = r.pMastery;

  return {
    mastery,
    rows: rows.map((r) => ({
      skill: r.skill,
      pMastery: r.pMastery,
      attempts: r.attempts,
      level: r.level,
      updatedAt: r.updatedAt,
    })),
  };
}

// The evidence behind a skill, oldest first, capped.
//
// The estimate is recomputed from this rather than from the previous estimate.
// Reading a number, adjusting it and writing it back is a lost update waiting
// to happen: two checks landing together both read the same starting value and
// the second overwrites the first, so a child ends up with ten pieces of
// evidence and one attempt's worth of credit. Recomputing from the history
// means whichever write lands last still accounts for everything recorded.
//
// The cap keeps the recomputation bounded. Bayesian updating converges, so the
// oldest attempts stop mattering long before the limit is reached.
const HISTORY_LIMIT = 200;

export async function evidenceHistory(studentId: string, skills: string[]) {
  const rows = await prisma.learningEvidence.findMany({
    where: { studentId, skill: { in: skills } },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
    select: { skill: true, correct: true, hintLevel: true },
  });
  return rows.map((r) => ({
    skill: r.skill,
    correct: r.correct,
    hint_level: r.hintLevel,
  }));
}

// Write down what a child did. Separate from storing the estimate, because the
// estimate is derived from this and has to be computed after it is written.
export async function recordEvidenceRows(
  studentId: string,
  evidence: { skill: string; correct: boolean; hintLevel: number; source: string }[],
) {
  if (!evidence.length) return;
  await prisma.learningEvidence.createMany({
    data: evidence.map((e) => ({
      studentId,
      skill: e.skill,
      correct: e.correct,
      hintLevel: e.hintLevel,
      source: e.source,
    })),
  });
}

// Record what a child did and store the estimates it produced.
//
// Evidence and estimate are written together. Storing one without the other
// would leave a number nobody can account for, or a history that does not add
// up to what the app is acting on.
export async function applyUpdate(args: {
  studentId: string;
  posterior: Record<string, number>;
}) {
  const { studentId, posterior } = args;

  return prisma.$transaction(async (tx) => {
    for (const [skill, p] of Object.entries(posterior)) {
      // attempts is counted from the evidence table rather than incremented,
      // so it cannot drift away from the number of things actually recorded,
      // and so a retry of the same write does not inflate it.
      const attempts = await tx.learningEvidence.count({
        where: { studentId, skill },
      });
      await tx.skillMastery.upsert({
        where: { studentId_skill: { studentId, skill } },
        update: { pMastery: p, level: levelFor(p, attempts), attempts },
        create: { studentId, skill, pMastery: p, level: levelFor(p, attempts), attempts },
      });
    }

    return getProfileIn(tx, studentId);
  });
}

// Inside the transaction, so the caller sees what it just wrote.
async function getProfileIn(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  studentId: string,
) {
  const rows = await tx.skillMastery.findMany({
    where: { studentId },
    orderBy: { skill: "asc" },
  });
  const mastery: Record<string, number> = {};
  for (const r of rows) mastery[r.skill] = r.pMastery;
  return { mastery, rows };
}

export { P_INIT, MASTERED, STRUGGLING, levelFor };
