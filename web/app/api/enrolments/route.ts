import { z } from "zod";
import { enrolStudent, studentBelongsToParent } from "@/lib/db/people";
import { requireSession } from "@/lib/session";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const EnrolInput = z.object({
  studentId: z.string().min(1, "studentId is required"),
  cohortId: z.string().min(1, "cohortId is required"),
});

export async function POST(req: Request) {
  const who = await requireSession();
  if (!who.ok) return who.response;

  // A teacher may enrol anyone. A parent may enrol only their own child.
  // A student may not enrol themselves.
  if (who.role === "STUDENT") {
    return Response.json(
      { error: "Ask your parent or teacher to enrol you." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = EnrolInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (who.role === "PARENT") {
    const owns = await studentBelongsToParent(parsed.data.studentId, who.parentId!);
    if (!owns) {
      return Response.json({ error: "That is not your child." }, { status: 403 });
    }
  }

  try {
    const enrolment = await enrolStudent(parsed.data);
    return Response.json({ enrolment }, { status: 201 });
  } catch (e) {
    // The @@unique([studentId, cohortId]) stops a double enrolment (P2002).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return Response.json(
        { error: "student already enrolled in this cohort" },
        { status: 409 },
      );
    }
    throw e;
  }
}
