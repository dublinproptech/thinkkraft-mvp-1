import { createProject } from "@/lib/db/projects";
import { saveSb3 } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const studentId = form.get("studentId");
  const lessonId = form.get("lessonId");

  if (!(file instanceof File)) {
    return Response.json(
      { error: "no project file uploaded" },
      { status: 400 },
    );
  }
  if (typeof studentId !== "string" || typeof lessonId !== "string") {
    return Response.json(
      { error: "studentId and lessonId are required" },
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
  const project = await createProject({ studentId, lessonId, sb3Ref });
  return Response.json({ project }, { status: 201 });
}
