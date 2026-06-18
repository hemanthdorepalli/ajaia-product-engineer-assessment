import { describe, it, expect } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Document access control", () => {
  it("seeded users exist in database", async () => {
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThanOrEqual(3);

    const alice = await prisma.user.findUnique({ where: { id: "user-alice" } });
    expect(alice).not.toBeNull();
    expect(alice?.email).toBe("alice@ajaia.ai");
  });

  it("document is only accessible by owner and shared users", async () => {
    // Create a doc as Alice
    const doc = await prisma.document.create({
      data: {
        title: "Test Doc",
        content: { type: "doc", content: [] },
        ownerId: "user-alice",
      },
    });

    expect(doc.ownerId).toBe("user-alice");

    // Bob has no access initially
    const bobShare = await prisma.share.findUnique({
      where: { docId_userId: { docId: doc.id, userId: "user-bob" } },
    });
    expect(bobShare).toBeNull();

    // Share with Bob as view
    const share = await prisma.share.create({
      data: { docId: doc.id, userId: "user-bob", permission: "view" },
    });
    expect(share.permission).toBe("view");

    // Bob now has access
    const bobAccess = await prisma.share.findUnique({
      where: { docId_userId: { docId: doc.id, userId: "user-bob" } },
    });
    expect(bobAccess).not.toBeNull();
    expect(bobAccess?.permission).toBe("view");

    // Cleanup
    await prisma.share.deleteMany({ where: { docId: doc.id } });
    await prisma.document.delete({ where: { id: doc.id } });
  });
});