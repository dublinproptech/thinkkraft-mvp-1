import { z } from "zod";
import bcrypt from "bcryptjs";
import { adminAction, adminRead } from "@/lib/adminRoute";
import { deleteTeacher, getTeacher, updateTeacher } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

// Password is optional on an edit: leaving it blank keeps the existing one.
const EditTeacher = z.object({
  name: z.string().trim().min(2, "Give the teacher a name.").max(80),
  email: z.email("That does not look like an email address.").transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters.").optional().or(z.literal("")),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminRead(async () => {
    const teacher = await getTeacher(id);
    if (!teacher) return Response.json({ error: "No such teacher." }, { status: 404 });
    return Response.json({ teacher });
  });
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminAction(req, EditTeacher, async (data) =>
    Response.json({
      teacher: await updateTeacher(id, {
        name: data.name,
        email: data.email,
        passwordHash: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      }),
    }),
  );
}

// A teacher who has approved hints is part of the record of what reached a
// child, so they are not deletable. Rename or reassign instead.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return adminRead(async () => {
    const result = await deleteTeacher(id);
    if (!result.ok) {
      if (result.reason === "missing") {
        return Response.json({ error: "That teacher no longer exists." }, { status: 404 });
      }
      return Response.json(
        { error: `Still in use by ${result.blockers.join(" and ")}.` },
        { status: 409 },
      );
    }
    return Response.json({ ok: true });
  });
}
