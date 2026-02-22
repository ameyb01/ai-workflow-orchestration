import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiAgent } from "@/lib/agent";
import { executeWorkflow } from "@/lib/workflow";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, phone, message } = body;

    // Validate tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Find contact
    const contact = await prisma.contact.findFirst({
      where: { tenantId, phone }
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Log inbound
    await prisma.interaction.create({
      data: {
        contactId: contact.id,
        message,
        direction: "inbound"
      }
    });

    // AI decision
    const decision = await aiAgent(
      contact.dealStage,
      message,
      tenant.config
    );

    // Execute workflow
    const reply = await executeWorkflow(
      contact.id,
      contact.dealStage as any,
      decision
    );

    // Fetch updated state
    const updatedContact = await prisma.contact.findUnique({
      where: { id: contact.id }
    });

    return NextResponse.json({
      reply,
      newState: updatedContact?.dealStage,
      confidence: decision.confidence
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}