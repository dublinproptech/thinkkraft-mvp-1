import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; 
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  // 1. Get the identity securely from the server
  const session = await getServerSession(authOptions);

  // 2. Reject anyone who isn't logged in or isn't a student
  if (!session || session.user?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Students only." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { lessonId, completed, blocksUsed } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "Missing lessonId." }, { status: 400 });
    }

    // 3. SECURE WRITE: Completely ignore any student ID sent from the frontend.
    // Force Prisma to use the exact ID from the verified server session.
    const secureStudentId = session.user.id;

    // 4. Update or create the progress record
    const progress = await prisma.studentProgress.upsert({
      where: {
        // Assuming a compound unique constraint on studentId and lessonId in schema.prisma
        studentId_lessonId: { 
          studentId: secureStudentId,
          lessonId: lessonId,
        }
      },
      update: {
        completed,
        blocksUsed, // Optional: tracking what they built
      },
      create: {
        studentId: secureStudentId,
        lessonId,
        completed,
        blocksUsed,
      }
    });

    return NextResponse.json({ success: true, progress }, { status: 200 });
  } catch (error) {
    console.error("Error saving student progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}