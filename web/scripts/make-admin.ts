import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Create an admin, or promote an existing account to one.
//
// Same reasoning as make-teacher.ts, only more so. An admin can edit the
// curriculum every child works through and can create teachers, who are the
// people who approve AI hints. If admin were self-service, anyone could sign
// themselves up and end up approving hints to children. So this is a command
// you run against the database, not a page on the web.
//
//   npx tsx scripts/make-admin.ts <email> [password]
//
// Pass an existing account's email to promote it; the password is ignored.
// Pass a new email with a password to create the account outright, which is
// how the first admin comes into being on a fresh database.
//
// Pass --demote to take the role away again.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demote = process.argv.includes("--demote");
  const args = process.argv.slice(2).filter((a) => a !== "--demote");
  const email = (args[0] ?? "").toLowerCase().trim();
  const password = args[1];

  if (!email) {
    console.error('Usage: npx tsx scripts/make-admin.ts <email> [password] [--demote]');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({ where: { email } });

  if (demote) {
    if (!user) {
      console.error(`No account with the email ${email}.`);
      process.exit(1);
    }
    // An admin has no profile row, so there is nothing to fall back to unless
    // the account also happens to be a teacher or a parent.
    const fallback = user.teacherId ? "TEACHER" : user.parentId ? "PARENT" : null;
    if (!fallback) {
      console.error(`${email} has no other profile to fall back to.`);
      console.error("Delete the account instead, or give it a teacher or parent profile first.");
      process.exit(1);
    }
    await prisma.user.update({ where: { id: user.id }, data: { role: fallback } });
    console.log(`${email} is no longer an admin (now ${fallback.toLowerCase()}).`);
    return;
  }

  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    console.log(`${email} is now an admin.`);
  } else {
    if (!password || password.length < 8) {
      console.error(`No account with the email ${email}.`);
      console.error("To create one, pass a password of at least 8 characters:");
      console.error('  npx tsx scripts/make-admin.ts <email> "<password>"');
      process.exit(1);
    }
    await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        role: "ADMIN",
      },
    });
    console.log(`Created admin ${email}.`);
  }

  console.log("Sign in at /admin/login.");
  console.log("If you were already signed in, sign out and back in: the role is");
  console.log("carried in the session token, so an old session says the old role.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
