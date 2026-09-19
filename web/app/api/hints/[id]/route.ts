import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body; // Expecting "APPROVED" or "REJECTED"

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Update the hint in the database
    const updatedHint = await prisma.hint.update({
      where: { id: params.id },
      data: { status: status },
    });

    return NextResponse.json({ success: true, hint: updatedHint });
  } catch (error) {
    console.error("Failed to update hint:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}