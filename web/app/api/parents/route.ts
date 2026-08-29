import { z } from "zod";
import { createParent } from "@/lib/db/people";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const ParentInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ParentInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const parent = await createParent(parsed.data);
    return Response.json({ parent }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json({ error: "Email already exists." }, { status: 409 });
    }
    throw error;
  }
}
