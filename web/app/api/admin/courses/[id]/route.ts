import { z } from "zod";
import { adminAction, adminRead } from "@/lib/adminRoute";
import { deleteCourse, getCourse, updateCourse } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

const Course = z.object({
  title: z.string().trim().min(2, "Give the course a title.").max(120),
  ageBand: z.string().trim().min(1, "Choose an age band.").max(40),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminRead(async () => {
    const course = await getCourse(id);
    if (!course) return Response.json({ error: "No such course." }, { status: 404 });
    return Response.json({ course });
  });
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminAction(req, Course, async (data) =>
    Response.json({ course: await updateCourse(id, data) }),
  );
}

// Refuses rather than cascades: a course with lessons under it is not an
// admin's to erase in one click. The reason comes back so the panel can say
// what is in the way.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminRead(async () => {
    const result = await deleteCourse(id);
    if (!result.ok) {
      if (result.reason === "missing") {
        return Response.json({ error: "That course no longer exists." }, { status: 404 });
      }
      return Response.json(
        { error: `Still in use by ${result.blockers.join(" and ")}.` },
        { status: 409 },
      );
    }
    return Response.json({ ok: true });
  });
}
