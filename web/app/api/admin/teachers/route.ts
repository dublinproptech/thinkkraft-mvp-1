import { z } from "zod";
import bcrypt from "bcryptjs";
import { adminAction, adminRead } from "@/lib/adminRoute";
import { createTeacher, listTeachers } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

// Creating a teacher creates the account that signs in as them, so a password
// is required here and never comes back out again.
const NewTeacher = z.object({
  name: z.string().trim().min(2, "Give the teacher a name.").max(80),
  email: z.email("That does not look like an email address.").transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function GET() {
  return adminRead(async () => Response.json({ teachers: await listTeachers() }));
}

export async function POST(req: Request) {
  return adminAction(req, NewTeacher, async (data) => {
    const teacher = await createTeacher({
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
    });
    return Response.json({ teacher }, { status: 201 });
  });
}
