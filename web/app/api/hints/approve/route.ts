import { z } from "zod";
import { approveHint } from "@/lib/db/hints";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; 

export const dynamic = "force-dynamic";

// 1. Remove teacherId from the input. We will not accept it from the frontend anymore.
const Input = z.object({
  hintId: z.string().min(1),
});

export async function POST(req: Request) {
  // 2. SECURITY CHECK: Verify identity securely on the server
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  // 3. SECURE RBAC: Reject anyone who isn't a teacher
  if (session.user.role !== "TEACHER") {
    return Response.json({ error: "Forbidden. Only teachers can approve hints." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 4. SECURE WRITE: Pass the teacherId directly from the verified server session
  const updated = await approveHint(parsed.data.hintId, session.user.id);
  
  return Response.json({ status: updated.status });
}