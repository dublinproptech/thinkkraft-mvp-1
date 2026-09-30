import { getProfile } from "@/lib/db/mastery";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// One child's skill profile.
//
// studentId comes from the URL, as the task specifies. That on its own would
// let anyone read any child's profile by changing the id, which is the exact
// shape of a hole closed earlier in this codebase, so it is checked against
// the session as well: a signed-in child may only read their own, while a
// teacher or parent may read any. The URL decides which child, the session
// decides whether you may.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;

  const who = await requireSession();
  if (!who.ok) return who.response;
  if (who.role === "STUDENT" && who.studentId !== studentId) {
    return Response.json({ error: "That is not your profile." }, { status: 403 });
  }

  const profile = await getProfile(studentId);
  return Response.json({ studentId, ...profile });
}
