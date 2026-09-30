import { progressForAll } from "@/lib/db/progress";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const who = await requireTeacher();
  if (!who.ok) return who.response;
  return Response.json({ progress: await progressForAll() });
}
