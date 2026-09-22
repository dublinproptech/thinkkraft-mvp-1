import { z } from "zod";
import { adminAction, adminRead } from "@/lib/adminRoute";
import { deleteLesson, getLesson, updateLesson } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

// No id here. A lesson's id is what every project and hint is filed against,
// so renaming it after the fact would orphan a child's work.
const EditLesson = z.object({
  title: z.string().trim().max(120).optional().or(z.literal("")),
  goal: z.string().trim().min(4, "Say what the lesson is for.").max(500),
  orderNo: z.coerce.number().int().min(1, "Lesson number starts at 1.").max(999),
  courseId: z.string().min(1, "Choose a course."),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminRead(async () => {
    const lesson = await getLesson(id);
    if (!lesson) return Response.json({ error: "No such lesson." }, { status: 404 });
    return Response.json({ lesson });
  });
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminAction(req, EditLesson, async (data) =>
    Response.json({
      lesson: await updateLesson(id, {
        title: data.title || null,
        goal: data.goal,
        orderNo: data.orderNo,
        courseId: data.courseId,
      }),
    }),
  );
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminRead(async () => {
    const result = await deleteLesson(id);
    if (!result.ok) {
      if (result.reason === "missing") {
        return Response.json({ error: "That lesson no longer exists." }, { status: 404 });
      }
      return Response.json(
        { error: `Still in use by ${result.blockers.join(" and ")}.` },
        { status: 409 },
      );
    }
    return Response.json({ ok: true });
  });
}
