import { z } from "zod";
import { adminAction, adminRead } from "@/lib/adminRoute";
import { createCourse, listCourses } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

const Course = z.object({
  title: z.string().trim().min(2, "Give the course a title.").max(120),
  ageBand: z.string().trim().min(1, "Choose an age band.").max(40),
});

export async function GET() {
  return adminRead(async () => Response.json({ courses: await listCourses() }));
}

export async function POST(req: Request) {
  return adminAction(req, Course, async (data) =>
    Response.json({ course: await createCourse(data) }, { status: 201 }),
  );
}
