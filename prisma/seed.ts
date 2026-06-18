import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { id: "hemanth-test", email: "hemanth@ajaia.ai", name: "Hemanth" },
      { id: "user-bob", email: "bob@ajaia.ai", name: "Bob" },
      { id: "user-carol", email: "carol@ajaia.ai", name: "Carol" },
    ],
    skipDuplicates: true,
  });
  console.log("Seeded 3 users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());