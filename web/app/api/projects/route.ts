import { createProject } from "@/lib/db/projects";
import { saveSb3 } from "@/lib/storage";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// A rough ceiling on an .sb3 upload. Scratch projects with a few sprites and
// sounds run to a couple of megabytes; this leaves room without letting a
// child's browser post something enormous into local storage.
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const form = await req.formData();
  const file = form.get("file");
  const lessonId = form.get("lessonId");

  if (!(file instanceof File)) {
    return Response.json({ error: "no project file uploaded" }, { status: 400 });
  }
  if (typeof lessonId !== "string" || lessonId.length === 0) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }
  if (!file.name.endsWith(".sb3")) {
    return Response.json({ error: "expected a .sb3 Scratch file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "that project file is too big" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sb3Ref = await saveSb3(bytes);

  // who.studentId is the Student row. who.userId is the User row that signs in
  // as them; Project.studentId points at the former.
  const project = await createProject({
    studentId: who.studentId,
    lessonId,
    sb3Ref,
  });

  return Response.json({ project }, { status: 201 });
}
