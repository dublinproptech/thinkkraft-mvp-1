import { z } from "zod";
import { createStudent } from "@/lib/db/people";

export const dynamic = "force-dynamic";

const StudentInput = z.object({
  displayName: z.string().min(1, "Display name is required"),
  ageBand: z.string().min(1, "Age band is required"),
  parentId: z.string().min(1, "Parent ID is required"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = StudentInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const student = await createStudent(parsed.data);
    return Response.json({ student }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create student." },
      { status: 500 },
    );
  }
}
