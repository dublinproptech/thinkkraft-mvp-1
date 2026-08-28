import { aiHealth } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await aiHealth();
  return Response.json(r, { status: r.status === "ok" ? 200 : 502 });
}
