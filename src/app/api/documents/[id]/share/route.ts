import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET shares for a doc
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.ownerId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shares = await prisma.share.findMany({
    where: { docId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(shares);
}

// ADD share
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.ownerId !== user.userId) {
    return NextResponse.json({ error: "Only owner can share" }, { status: 403 });
  }

  const { userId, permission } = await req.json();

  if (userId === user.userId) {
    return NextResponse.json({ error: "Cannot share with yourself" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const share = await prisma.share.upsert({
    where: { docId_userId: { docId: id, userId } },
    update: { permission: permission || "view" },
    create: { docId: id, userId, permission: permission || "view" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(share, { status: 201 });
}

// REMOVE share
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.ownerId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  await prisma.share.deleteMany({ where: { docId: id, userId } });

  return NextResponse.json({ success: true });
}