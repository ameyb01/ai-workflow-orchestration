export type DealState =
  | "new_lead"
  | "qualifying"
  | "booked"
  | "escalated"
  | "disqualified";

export type AgentAction =
  | "ask_question"
  | "book"
  | "escalate"
  | "disqualify";

export interface AgentDecision {
  intent: string;
  nextState: DealState;
  action: AgentAction;
  message: string;
  confidence: number;
}