import { z } from "zod";
import { enrolStudent } from "@/lib/db/people";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const EnrolInput = z.object({
  studentId: z.string().min(1, "studentId is required"),
  cohortId: z.string().min(1, "cohortId is required"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = EnrolInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const enrolment = await enrolStudent(parsed.data);
    return Response.json({ enrolment }, { status: 201 });
  } catch (e) {
    // The @@unique([studentId, cohortId]) stops a double enrolment (P2002).
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return Response.json(
        { error: "student already enrolled in this cohort" },
        { status: 409 },
      );
    }
    throw e;
  }
}
