import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; 
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  // 1. Get identity securely from the server session
  const session = await getServerSession(authOptions);

  // 2. Reject anyone who isn't logged in or isn't a student
  if (!session || session.user?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Only students can request hints." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { lessonId, projectData, requestedLevel } = body;

    if (!lessonId || !projectData) {
      return NextResponse.json({ error: "Missing required lesson or project data." }, { status: 400 });
    }

    // 3. Force the database to use the verified session ID
    const secureStudentId = session.user.id;

    // --- AI GENERATION LOGIC GOES HERE ---
    // Here is where you parse the Scratch projectData and send it to your AI model.
    // For now, we simulate the AI's response:
    const aiDiagnosis = "The student forgot to add a loop block to repeat the movement.";
    const aiHintText = "Take a look at your Control blocks. Is there a way to make your character do that action more than once automatically?";
    // -------------------------------------

    // 4. SECURE WRITE: Save the generated hint to the database.
    // Notice how we IGNORE whatever status the client might have tried to send,
    // and strictly enforce "PROPOSED" so the teacher has to review it.
    const hintEvent = await prisma.hintEvent.create({
      data: {
        diagnosis: aiDiagnosis,
        text: aiHintText,
        level: requestedLevel || 1,
        status: "PROPOSED", // Locked: The client cannot override this
        studentId: secureStudentId,
        lessonId: lessonId,
      }
    });

    return NextResponse.json({ success: true, hint: hintEvent }, { status: 200 });
  } catch (error) {
    console.error("Error generating AI hint:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}