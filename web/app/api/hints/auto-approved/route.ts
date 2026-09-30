import { autoApprovedHints } from "@/lib/db/presence";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

// What went out to children while nobody was watching the queue. A teacher
// cannot un-send these, but they can read them, which is the point: the gate
// opening by itself is a thing a person should be able to check afterwards.
export async function GET() {
  const who = await requireTeacher();
  if (!who.ok) return who.response;
  return Response.json({ hints: await autoApprovedHints() });
}
