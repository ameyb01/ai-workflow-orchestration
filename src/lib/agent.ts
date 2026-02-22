import OpenAI from "openai";
import { AgentDecision } from "@/types/workflow";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function aiAgent(
  currentState: string,
  incomingMessage: string,
  tenantConfig: any
): Promise<AgentDecision> {

  const systemPrompt = `
You are an AI university sales intake agent.

Business rules:
- Budget must be >= ${tenantConfig.budgetThreshold}
- If budget meets threshold → move to "booked"
- If user says not interested → move to "disqualified"
- If message unrelated to university → escalate
- Otherwise → move through qualification steps

Behavior examples:

Example 1:
Current state: new_lead
User: "Hi I'm interested"
→ qualifying
→ ask_question

Example 2:
Current state: qualifying
User: "My budget is 25000"
→ booked
→ book

Example 3:
Current state: qualifying
User: "Not interested"
→ disqualified

Only escalate if clearly irrelevant.

Return STRICT JSON only:
{
  "intent": string,
  "nextState": "new_lead" | "qualifying" | "booked" | "escalated" | "disqualified",
  "action": "ask_question" | "book" | "escalate" | "disqualify",
  "message": string,
  "confidence": number
}

Be decisive but do NOT escalate normal inquiries.
`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Current state: ${currentState}\nUser message: ${incomingMessage}`
      }
    ]
  });

  const content = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(content || "");
    return parsed;
  } catch {
    return {
      intent: "parse_error",
      nextState: "escalated",
      action: "escalate",
      message: "I'm connecting you with a human advisor.",
      confidence: 0.2
    };
  }
}