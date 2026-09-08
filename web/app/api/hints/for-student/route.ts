import { approvedHintsForStudent } from "@/lib/db/hints";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("studentId");
  if (!id)
    return Response.json({ error: "studentId required" }, { status: 400 });
  return Response.json({ hints: await approvedHintsForStudent(id) });
}
