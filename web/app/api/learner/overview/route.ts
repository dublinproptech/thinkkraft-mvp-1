import { prisma } from "@/lib/prisma";
import { nextStep } from "@/lib/aiHint";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

// Every child with skill evidence, and what the planner would do next for
// each. Teachers only: this is the whole class's standing, not one child's.
export async function GET() {
  const who = await requireTeacher();
  if (!who.ok) return who.response;

  const students = await prisma.student.findMany({
    orderBy: { displayName: "asc" },
    include: { skills: { orderBy: { skill: "asc" } } },
  });

  const out = await Promise.all(
    students.map(async (s) => {
      const rows = s.skills
        .filter((r) => r.attempts > 0)
        .map((r) => ({ skill: r.skill, level: r.level, attempts: r.attempts }));

      const mastery: Record<string, number> = {};
      for (const r of s.skills) mastery[r.skill] = r.pMastery;

      // The weakest skill they have evidence for is what the planner is asked
      // about. A child with no evidence has nothing to plan around yet.
      const weakest = s.skills
        .filter((r) => r.attempts > 0)
        .sort((a, b) => a.pMastery - b.pMastery)[0];

      let next = null;
      if (weakest) {
        try {
          const step = await nextStep(mastery, [weakest.skill]);
          next = { action: step.action, skill: step.skill, reason: step.reason };
        } catch {
          // The AI service being down should not empty the whole table.
          next = null;
        }
      }

      return { studentId: s.id, displayName: s.displayName, rows, next };
    }),
  );

  return Response.json({ students: out.filter((s) => s.rows.length > 0) });
}
