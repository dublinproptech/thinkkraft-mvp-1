import { listCourses } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function GET() {
	const courses = await listCourses();
	return Response.json({ courses });
}
