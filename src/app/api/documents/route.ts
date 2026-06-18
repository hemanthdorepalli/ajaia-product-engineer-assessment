import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET all docs (owned + shared)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.document.findMany({
    where: { ownerId: user.userId },
    orderBy: { updatedAt: "desc" },
    include: { owner: { select: { name: true, email: true } } },
  });

  const shared = await prisma.document.findMany({
    where: {
      shares: { some: { userId: user.userId } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      shares: { where: { userId: user.userId }, select: { permission: true } },
    },
  });

  return NextResponse.json({ owned, shared });
}

// CREATE new doc
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const doc = await prisma.document.create({
    data: {
      title: body.title || "Untitled",
      content: body.content || {},
      ownerId: user.userId,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}