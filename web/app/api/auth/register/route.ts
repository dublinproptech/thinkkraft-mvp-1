import { z } from "zod";
import bcrypt from "bcryptjs";
import { registerParent } from "@/lib/db/people";

export const dynamic = "force-dynamic";

// Only a parent can register themselves. Children never self-register: a
// parent creates each child from their own account, which is what records the
// consent. Teacher accounts are created by seeding, not from the public web.
const Input = z.object({
  name: z.string().trim().min(1, "Your name is required").max(100),
  email: z.email("Enter a valid email address").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  const created = await registerParent({ name, email, passwordHash });
  if (!created) {
    return Response.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  // Never return the user row: it carries the password hash.
  return Response.json({ ok: true }, { status: 201 });
}
