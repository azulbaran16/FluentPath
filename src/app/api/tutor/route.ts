import { NextResponse } from "next/server";

// ───────────────────────────────────────────────────────────
// AI Tutor endpoint.
//
// FASE 2: when ANTHROPIC_API_KEY is set, call the Claude API here
// (claude-opus-4-8 / claude-sonnet-4-6) with a tutor system prompt
// that role-plays the scenario and returns corrections. Until then
// we return a clearly-labelled stub so the chat UI is fully usable.
// ───────────────────────────────────────────────────────────

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const { messages, scenario } = (await req.json()) as {
    messages: TutorMessage[];
    scenario?: string;
  };

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

  // TODO Fase 2: if (hasKey) -> stream a real Claude completion here.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const reply = buildStubReply(lastUser?.content ?? "", scenario, hasKey);

  return NextResponse.json({ reply, stub: !hasKey });
}

function buildStubReply(userText: string, scenario?: string, hasKey?: boolean) {
  if (hasKey) {
    // Key present but real call not wired yet — be explicit.
    return "✅ API key detected. The live Claude tutor will be wired up in Fase 2. For now this is still a placeholder response.";
  }
  const context = scenario
    ? ` We're practicing the "${scenario.split("/").pop()}" scenario.`
    : "";
  const trimmed = userText.trim();
  if (!trimmed) {
    return `Hi! I'm your English tutor.${context} Say anything and I'll reply, correct your grammar, and keep the conversation going. (Demo mode — add your Anthropic API key to unlock the real AI tutor.)`;
  }
  return [
    `You said: "${trimmed}".`,
    `Nice — that's clear and understandable.${context}`,
    "💡 (Demo mode) Once the Anthropic API key is added, I'll reply naturally in character, point out any grammar or word-choice issues, and suggest a more native way to say it.",
  ].join(" ");
}
