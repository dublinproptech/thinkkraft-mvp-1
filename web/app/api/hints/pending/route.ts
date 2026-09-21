import { pendingHints } from "@/lib/db/hints";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

// The approval queue. Teachers only: these are unreviewed AI hints, and no
// child or parent should see one before a teacher has passed it.
export async function GET() {
  const who = await requireTeacher();
  if (!who.ok) return who.response;

  return Response.json({ pending: await pendingHints() });
}
