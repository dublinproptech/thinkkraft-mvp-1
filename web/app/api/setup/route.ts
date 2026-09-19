import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("thinkkraft123", 10);
    const email = "teacher@thinkkraft.com";

    // 1. Upsert the Teacher
    const teacher = await prisma.teacher.upsert({
      where: { email },
      update: { name: "Manthan" },
      create: {
        name: "Manthan",
        email: email,
      },
    });

    // 2. Upsert the User account and link it to the teacher
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword,
        role: "TEACHER",
        teacherId: teacher.id 
      },
      create: {
        email: email,
        password: hashedPassword,
        role: "TEACHER",
        teacherId: teacher.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully! You can now log in.", 
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
}