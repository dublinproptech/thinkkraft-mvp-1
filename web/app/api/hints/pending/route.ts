import { pendingHints } from "@/lib/db/hints";
import { markTeacherSeen, teachersOnline } from "@/lib/db/presence";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

// The approval queue. Teachers only: these are unreviewed AI hints, and no
// child or parent should see one before a teacher has passed it.
//
// Loading this is also how a teacher says they are here. The page polls every
// few seconds, so the heartbeat comes for free, and a teacher who closes the
// tab stops being counted about a minute and a half later. That is what
// decides whether a child's next hint waits for a person.
export async function GET() {
  const who = await requireTeacher();
  if (!who.ok) return who.response;

  await markTeacherSeen(who.teacherId).catch(() => {
    // Losing one heartbeat is not worth failing the queue over. The worst case
    // is that presence lapses and hints go out unsupervised, which is why the
    // window is generous compared with the poll interval.
  });

  return Response.json({
    pending: await pendingHints(),
    // So the page can tell a teacher whether they are the only one on duty.
    teachersOnline: await teachersOnline(),
  });
}
