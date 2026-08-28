import { prisma } from "@/lib/prisma";

// Always run fresh; a health check must never be served from cache.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Cheapest possible "is the database really there" probe.
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", db: "connected" });
  } catch (e) {
    return Response.json(
      { status: "error", db: "unreachable", detail: String(e) },
      { status: 500 },
    );
  }
}
