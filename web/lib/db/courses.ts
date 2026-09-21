import { prisma } from "@/lib/prisma";

export function listCourses () {
	return prisma.course.findMany({
		orderBy: { createdAt: "asc" },
		select: { id: true, title: true, ageBand: true },
	});
}

// The classes a child can be enrolled into, with enough detail for a parent to
// tell them apart. Used by the add-a-child form so the cohort id is never
// hardcoded in the UI.
export function listCohorts() {
	return prisma.cohort.findMany({
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			schedule: true,
			course: { select: { title: true, ageBand: true } },
			teacher: { select: { name: true } },
		},
	});
}

// The lessons a child can actually open: the ones on the course behind the
// cohort they are enrolled in, in teaching order, with their own progress.
// Returns an empty list when they are not enrolled anywhere yet.
export async function lessonsForStudent(studentId: string) {
	const enrolment = await prisma.enrolment.findFirst({
		where: { studentId },
		orderBy: { createdAt: "desc" },
		select: {
			cohort: {
				select: {
					schedule: true,
					course: {
						select: {
							id: true,
							title: true,
							lessons: {
								orderBy: { orderNo: "asc" },
								select: { id: true, orderNo: true, goal: true },
							},
						},
					},
				},
			},
		},
	});

	if (!enrolment) return { course: null, lessons: [] };

	const progress = await prisma.studentProgress.findMany({
		where: { studentId },
		select: { lessonId: true, completed: true },
	});
	const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

	const { course } = enrolment.cohort;
	return {
		course: { id: course.id, title: course.title, schedule: enrolment.cohort.schedule },
		lessons: course.lessons.map((l) => ({ ...l, completed: done.has(l.id) })),
	};
}

export function getCourseWithLessons(id: string) {
	return prisma.course.findUnique({
		where: { id },
		include: { lessons: {orderBy: { orderNo: "asc" } } },
	});
}
