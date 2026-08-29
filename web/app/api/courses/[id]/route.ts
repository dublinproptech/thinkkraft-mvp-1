import { getCourseWithLessons } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const course = await getCourseWithLessons(id);
  if (!course) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }
  return Response.json({ course });
}
