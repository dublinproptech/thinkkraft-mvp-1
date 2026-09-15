import { sendActivity } from "@/lib/aiHint";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { studentId, lessonId, kind } = await req.json();
  if (!studentId || !lessonId || !kind) {
    return Response.json(
      { error: "studentId, lessonId, kind required" },
      { status: 400 },
    );
  }
  await sendActivity(studentId, lessonId, kind);
  return Response.json({ ok: true });
}
