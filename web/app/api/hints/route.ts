import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Grab the URL parameters (e.g., ?status=PENDING)
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Tell Prisma to find hints that match the requested status
    const hints = await prisma.hint.findMany({
      where: status ? { status: status } : undefined,
    });

    return NextResponse.json({ hints });
  } catch (error) {
    console.error("Failed to fetch hints:", error);
    return NextResponse.json({ error: "Failed to fetch hints" }, { status: 500 });
  }
}