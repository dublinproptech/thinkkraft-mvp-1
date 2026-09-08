import { pendingHints } from "@/lib/db/hints";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ pending: await pendingHints() });
}
