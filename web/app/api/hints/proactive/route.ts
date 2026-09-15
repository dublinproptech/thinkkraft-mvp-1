import { createHint } from "@/lib/db/hints";

const AI = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { studentId, lessonId } = await req.json();
  if (!studentId || !lessonId) {
    return Response.json(
      { error: "studentId, lessonId required" },
      { status: 400 },
    );
  }
  const r = await fetch(`${AI}/proactive/${studentId}`).then((x) => x.json());
  const created = [];
  for (const h of r.hints ?? []) {
    const saved = await createHint({
      studentId,
      lessonId,
      diagnosis: `proactive:${h.reason}`,
      level: h.level,
      text: h.text,
    });
    created.push(saved.id);
  }
  return Response.json({ created });
}
