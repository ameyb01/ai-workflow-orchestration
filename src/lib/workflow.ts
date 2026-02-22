import { prisma } from "@/lib/db";
import { AgentDecision, DealState } from "@/types/workflow";

const allowedTransitions: Record<DealState, DealState[]> = {
  new_lead: ["qualifying", "escalated"],
  qualifying: ["booked", "disqualified", "qualifying", "escalated"],
  booked: [],
  disqualified: [],
  escalated: []
};

function isValidTransition(current: DealState, next: DealState) {
  return allowedTransitions[current].includes(next);
}

const CONFIDENCE_THRESHOLD = 0.5;

export async function executeWorkflow(
  contactId: string,
  currentState: DealState,
  decision: AgentDecision
) {

  // Low confidence → escalate
  if (decision.confidence < CONFIDENCE_THRESHOLD) {

    await prisma.contact.update({
      where: { id: contactId },
      data: { dealStage: "escalated" }
    });

    await prisma.interaction.create({
      data: {
        contactId,
        message: "Escalated due to low AI confidence.",
        direction: "outbound"
      }
    });

    return "I'm connecting you with a human advisor.";
  }

  // Invalid transition → escalate
  if (!isValidTransition(currentState, decision.nextState)) {

    await prisma.contact.update({
      where: { id: contactId },
      data: { dealStage: "escalated" }
    });

    await prisma.interaction.create({
      data: {
        contactId,
        message: `Invalid transition from ${currentState} to ${decision.nextState}`,
        direction: "outbound"
      }
    });

    return "I'm connecting you with a human advisor.";
  }

  // Valid transition
  await prisma.contact.update({
    where: { id: contactId },
    data: { dealStage: decision.nextState }
  });

  await prisma.interaction.create({
    data: {
      contactId,
      message: decision.message,
      direction: "outbound"
    }
  });

  return decision.message;
}