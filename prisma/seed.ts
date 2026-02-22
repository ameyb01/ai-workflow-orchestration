import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: "Demo University",
      config: {
        qualificationQuestions: [
          "What program are you interested in?",
          "What is your budget range?"
        ],
        budgetThreshold: 20000,
        autoBookIfQualified: true
      },
      promptVersion: "v1.0"
    }
  });

  const contact = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      name: "Test Lead",
      phone: "+15551234567"
    }
  });

  console.log("Seeded:");
  console.log({ tenant, contact });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
