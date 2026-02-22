import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
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

  return NextResponse.json({
    message: "Seeded successfully",
    tenant,
    contact
  });
}
