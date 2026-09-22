import { adminRead } from "@/lib/adminRoute";
import { listStudents } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

// Read only. Students are created by the people they belong to, through the
// registration and enrolment flows, not by an administrator on their behalf.
export async function GET() {
  return adminRead(async () => Response.json({ students: await listStudents() }));
}
