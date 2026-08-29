import { prisma } from "@/lib/prisma";

export function listCourses () {
	return prisma.course.findMany({
		orderBy: { createdAt: "asc" },
		select: { id: true, title: true, ageBand: true },
	});
}

export function getCourseWithLessons(id: string) {
	return prisma.course.findUnique({
		where: { id },
		include: { lessons: {orderBy: { orderNo: "asc" } } },
	});
}
