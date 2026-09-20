import { approvedHintsForStudent } from "@/lib/db/hints";
import { requireSession } from "@/lib/session";
import { studentBelongsToParent } from "@/lib/db/people";

export const dynamic = "force-dynamic";

// Who may read a child's approved hints: the child, their parent, or a teacher.
// A student never gets to name the id, so the query param is only consulted for
// the two adult roles.
export async function GET(req: Request) {
  const who = await requireSession();
  if (!who.ok) return who.response;

  if (who.role === "STUDENT") {
    return Response.json({ hints: await approvedHintsForStudent(who.studentId!) });
  }

  const id = new URL(req.url).searchParams.get("studentId");
  if (!id) {
    return Response.json({ error: "studentId required" }, { status: 400 });
  }

  if (who.role === "PARENT") {
    const owns = await studentBelongsToParent(id, who.parentId!);
    if (!owns) {
      return Response.json({ error: "That is not your child." }, { status: 403 });
    }
  }

  return Response.json({ hints: await approvedHintsForStudent(id) });
}
