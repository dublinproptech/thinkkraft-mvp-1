import { listCohorts } from "@/lib/db/courses";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Which classes are running. Signed-in adults only: a parent needs this to
// enrol a child, a teacher to see the timetable. Nothing here is per-family,
// so no ownership check is needed beyond being signed in.
export async function GET() {
  const who = await requireSession();
  if (!who.ok) return who.response;

  if (who.role === "STUDENT") {
    return Response.json(
      { error: "Ask your parent or teacher about classes." },
      { status: 403 },
    );
  }

  return Response.json({ cohorts: await listCohorts() });
}
