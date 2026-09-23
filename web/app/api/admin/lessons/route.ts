import { z } from "zod";
import { adminAction, adminRead } from "@/lib/adminRoute";
import { createLesson, listLessons } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

// Lesson ids are readable strings here, not cuids: hints and projects are filed
// against "loops-1". An admin may set one when creating a lesson, which is why
// the shape is restricted to what is safe in a URL.
const NewLesson = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Use lower-case letters, numbers and hyphens only.")
    .max(60)
    .optional()
    .or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  goal: z.string().trim().min(4, "Say what the lesson is for.").max(500),
  orderNo: z.coerce.number().int().min(1, "Lesson number starts at 1.").max(999),
  courseId: z.string().min(1, "Choose a course."),
});

export async function GET(req: Request) {
  const courseId = new URL(req.url).searchParams.get("courseId") ?? undefined;
  return adminRead(async () =>
    Response.json({ lessons: await listLessons(courseId) }),
  );
}

export async function POST(req: Request) {
  return adminAction(req, NewLesson, async (data) => {
    const lesson = await createLesson({
      id: data.id || undefined,
      title: data.title || null,
      goal: data.goal,
      orderNo: data.orderNo,
      courseId: data.courseId,
    });
    return Response.json({ lesson }, { status: 201 });
  });
}
