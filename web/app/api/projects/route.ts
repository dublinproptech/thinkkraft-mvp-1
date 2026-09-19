import { createProject } from "@/lib/db/projects";
import { saveSb3 } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust this path if your authOptions is located elsewhere

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Get identity securely from the server session
  const session = await getServerSession(authOptions);

  // 2. Reject unauthenticated requests or non-students
  if (!session || session.user?.role !== "STUDENT") {
    return Response.json(
      { error: "Unauthorized. Only students can save projects." },
      { status: 401 }
    );
  }

  // 3. Grab the student ID directly from the trusted session
  const studentId = session.user.id;

  const form = await req.formData();
  const file = form.get("file");
  const lessonId = form.get("lessonId"); // Lesson ID still comes from the form

  if (!(file instanceof File)) {
    return Response.json(
      { error: "no project file uploaded" },
      { status: 400 },
    );
  }
  if (typeof lessonId !== "string") {
    return Response.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }
  if (!file.name.endsWith(".sb3")) {
    return Response.json(
      { error: "expected a .sb3 Scratch file" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sb3Ref = await saveSb3(bytes);
  
  // 4. Create the project using the trusted studentId
  const project = await createProject({ studentId, lessonId, sb3Ref });
  
  return Response.json({ project }, { status: 201 });
}