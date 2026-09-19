import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma"; // Adjust path if necessary

export async function GET() {
  try {
    // 1. Hash the password securely
    const hashedPassword = await bcrypt.hash("thinkkraft123", 10);

    // 2. Create the Teacher and linked User account
    const newTeacher = await prisma.teacher.create({
      data: {
        name: "Manthan",
        email: "teacher@thinkkraft.com",
        user: {
          create: {
            email: "teacher@thinkkraft.com",
            password: hashedPassword,
            role: "TEACHER",
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Test teacher account created successfully!", 
      data: newTeacher 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Account likely already exists, or there was a database error.",
      error: String(error)
    }, { status: 500 });
  }
}