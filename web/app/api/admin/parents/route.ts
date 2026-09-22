import { adminRead } from "@/lib/adminRoute";
import { listParents } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

// Read only. Parents are created by the people they belong to, through the
// registration and enrolment flows, not by an administrator on their behalf.
export async function GET() {
  return adminRead(async () => Response.json({ parents: await listParents() }));
}
