import { lessonsForStudent } from "@/lib/db/courses";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// The signed-in child's own lessons. No studentId in the request: a child can
// only ever see the course they are enrolled in.
export async function GET() {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  return Response.json(await lessonsForStudent(who.studentId));
}
