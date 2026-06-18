import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function canAccess(userId: string, docId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { shares: true },
  });
  if (!doc) return { doc: null, permission: null };

  if (doc.ownerId === userId) return { doc, permission: "owner" };

  const share = doc.shares.find((s) => s.userId === userId);
  if (share) return { doc, permission: share.permission };

  return { doc: null, permission: null };
}

// GET single doc
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { doc, permission } = await canAccess(user.userId, id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...doc, permission });
}

// UPDATE doc
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { permission } = await canAccess(user.userId, id);

  if (!permission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (permission === "view") return NextResponse.json({ error: "Read only" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.document.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE doc
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

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}