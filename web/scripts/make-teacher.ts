import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Turn an existing account into a teacher.
//
// Teacher accounts are deliberately not self-service: anyone who could sign
// themselves up as a teacher could approve their own AI hints, which is the one
// thing the approval gate exists to prevent. So this is a command you run
// against the database, not a page on the web.
//
//   npx tsx scripts/make-teacher.ts <email> ["Display Name"]
//
// Pass --demote to send the account back to being a parent.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--demote");
  const demote = process.argv.includes("--demote");
  const email = (args[0] ?? "").toLowerCase().trim();
  const name = args[1];

  if (!email) {
    console.error("Usage: npx tsx scripts/make-teacher.ts <email> [\"Display Name\"] [--demote]");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email },
    include: { teacher: true, parent: true },
  });

  if (!user) {
    console.error(`No account with the email ${email}.`);
    console.error("Register at /register first, then run this again.");
    process.exit(1);
  }

  if (demote) {
    if (!user.parentId) {
      console.error(`${email} has no parent profile to go back to.`);
      process.exit(1);
    }
    await prisma.user.update({ where: { id: user.id }, data: { role: "PARENT" } });
    console.log(`${email} is a parent again.`);
    return;
  }

  // A Teacher row may already exist from seeding even when no User points at it.
  const teacher =
    user.teacher ??
    (await prisma.teacher.upsert({
      where: { email },
      update: name ? { name } : {},
      create: { email, name: name ?? user.parent?.name ?? email.split("@")[0] },
    }));

  // The parent link is left in place on purpose. Someone who runs a class and
  // also has a child of their own keeps both, and --demote can switch back.
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "TEACHER", teacherId: teacher.id },
  });

  console.log(`${email} is now a teacher (${teacher.name}).`);
  console.log("Sign out and back in: the role is carried in the session token,");
  console.log("so an existing session still says whatever it said before.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
