import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 },
      );
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: { id: userId, email },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("sync-user error", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 },
    );
  }
}
