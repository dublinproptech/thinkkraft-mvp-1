import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireParent } from "@/lib/session";
import { registerChild, childrenOfParent } from "@/lib/db/people";

export const dynamic = "force-dynamic";

// A child account is created here and nowhere else, by the signed-in parent.
// parentId comes from the session, so a parent can only ever add a child to
// their own family.
const Input = z.object({
  displayName: z.string().trim().min(1, "Your child's name is required").max(100),
  ageBand: z.string().trim().min(1, "Age band is required").max(20),
  // Children sign in with a username, not an email, so nothing identifying
  // leaves the family account.
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[A-Za-z0-9_]+$/, "Letters, numbers and underscores only"),
  // A PIN rather than a password: short enough for a 9 year old to remember.
  pin: z.string().regex(/^\d{4,6}$/, "Choose a PIN of 4 to 6 digits"),
});

export async function GET() {
  const who = await requireParent();
  if (!who.ok) return who.response;

  return Response.json({ children: await childrenOfParent(who.parentId) });
}

export async function POST(req: Request) {
  const who = await requireParent();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { displayName, ageBand, username, pin } = parsed.data;

  const created = await registerChild({
    parentId: who.parentId,
    displayName,
    ageBand,
    username,
    pinHash: await bcrypt.hash(pin, 10),
  });

  if (!created) {
    return Response.json(
      { error: "That username is already taken. Try another." },
      { status: 409 },
    );
  }

  return Response.json({ child: created }, { status: 201 });
}
