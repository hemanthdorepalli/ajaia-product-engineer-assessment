import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".txt") && !name.endsWith(".md")) {
    return NextResponse.json(
      { error: "Only .txt and .md files are supported" },
      { status: 400 }
    );
  }

  const text = await file.text();

  // Convert plain text to TipTap JSON
  const paragraphs = text.split("\n").map((line) => {
    if (line.trim() === "") {
      return { type: "paragraph" };
    }
    return {
      type: "paragraph",
      content: [{ type: "text", text: line }],
    };
  });

  const content = { type: "doc", content: paragraphs };
  const title = file.name.replace(/\.(txt|md)$/, "");

  const doc = await prisma.document.create({
    data: {
      title,
      content,
      ownerId: user.userId,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}