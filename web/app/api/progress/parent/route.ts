import { progressForParent } from "@/lib/db/progress";
import { requireParent } from "@/lib/session";

export const dynamic = "force-dynamic";

// parentId comes from the session, so a parent can only ever see their own
// children. This was the shape of an earlier leak on the recap page, where the
// query trusted the request instead.
export async function GET() {
  const who = await requireParent();
  if (!who.ok) return who.response;
  return Response.json({ progress: await progressForParent(who.parentId) });
}
