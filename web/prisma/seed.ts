import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL  });
const prisma = new PrismaClient({ adapter });

async function main() {
	// 1. A teacher lead the cohort
	const teacher = await prisma.teacher.upsert({
		where: { email: "teacher@thinkkraft.ai" },
		update: {},
		create: { name: "Ms Riordain", email: "teacher@thinkkraft.ai" },
	});

	// 2. The first course
	const course = await prisma.course.upsert({
		where: { id: "scratch-foundations" },
		update: {},
		create: {
			id: "scratch-foundations",
			title: "Build your first game in Scratch",
			ageBand: "9-13",
		},
	});

	// 3. Its lessons, in order
	const lessons = [
		{ orderNo: 1, goal: "Make a sprite move when the green flag is clicked" },
		{ orderNo: 2, goal: "Make the sprite keep moving using a loop" },
		{ orderNo: 3, goal: "Make the sprite react with an if/else decision" },
		{ orderNo: 4, goal: "Track a score using a variable" },
	];

	for (const l of lessons) {
		await prisma.lesson.upsert({
			where: { courseId_orderNo: { courseId: course.id, orderNo: l.orderNo } },
			update: { goal: l.goal },
			create: { courseId: course.id, orderNo: l.orderNo, goal: l.goal },
		});
	}

	// 4. A cohort: a specific running of the course, led by the teacher
	await prisma.cohort.upsert({
		where: { id: "cohort-autumn" },
		update: {},
		create: {
			id: "cohort-autumn",
			schedule: "Saturdays 10:00",
			courseId: course.id,
			teacherId: teacher.id,
		},	
	});

	console.log("Seed complete: 1 course, 4 lessons, 1 teacher, 1 cohort");
}

main()
	.then(() => prisma.$disconnect())
	.catch(async(e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
