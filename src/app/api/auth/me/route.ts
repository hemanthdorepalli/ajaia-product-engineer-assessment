import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const fullUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(fullUser);
}