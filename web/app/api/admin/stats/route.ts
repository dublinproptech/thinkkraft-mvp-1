import { adminRead } from "@/lib/adminRoute";
import { adminStats } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  return adminRead(async () => Response.json({ stats: await adminStats() }));
}
