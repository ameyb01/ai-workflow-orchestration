# AI Workflow Orchestration Prototype

A multi-tenant AI-driven sales intake orchestration backend exploring guardrails, state integrity, and structured LLM control.

---

## Overview

This prototype simulates an AI sales automation system where an LLM drives conversation state transitions while a deterministic backend enforces safety.

The focus is not UI — it is **workflow reliability under probabilistic AI reasoning**.

---

## Architecture

- Next.js (API layer)
- PostgreSQL (Neon)
- Prisma ORM
- Groq LLM (Llama 3.1)
- TypeScript

---

## System Flow

Incoming Message  
→ LLM (structured JSON output)  
→ Confidence gating  
→ State machine validation  
→ CRM update + interaction log  

---

## Core Design

- **Structured LLM Output** (strict JSON contract)
- **Deterministic State Guards** (AI cannot directly mutate state)
- **Confidence-Based Escalation**
- **Multi-Tenant Configuration Injection**
- **Persistent Interaction Logging**

---

## Observed Failure Modes

- Over-escalation bias in ambiguous inputs  
- Prompt brittleness affecting state transitions  
- Confidence miscalibration  
- Structured JSON fragility  
- Tension between AI autonomy and deterministic state enforcement  

These constraints become critical at scale.

---

## Example API

`POST /api/message`

```json
{
  "tenantId": "uuid",
  "phone": "+15551234567",
  "message": "Hi, I'm interested"
}

Response:

{
  "reply": "Thanks for reaching out...",
  "newState": "qualifying",
  "confidence": 0.82
}

## Purpose

Built to explore real-world bottlenecks in AI-driven workflow systems:

Guardrail design

State integrity

Configuration scaling

Automation gating
