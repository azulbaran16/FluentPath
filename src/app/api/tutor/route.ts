import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isPro, stripeEnabled } from "@/lib/stripe";
import { getScenario } from "@/lib/curriculum";

// ───────────────────────────────────────────────────────────
// AI Tutor endpoint.
// - With ANTHROPIC_API_KEY set: a real Claude (Haiku) tutor that
//   role-plays the scenario and corrects the learner.
// - Gated to Pro users when billing is enabled, with a per-user
//   daily message cap so costs stay well under the subscription price.
// - Falls back to a clearly-labelled stub when no key is configured.
// ───────────────────────────────────────────────────────────

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "claude-haiku-4-5";
const DAILY_CAP = 60; // messages per user per day

function tutorSystemPrompt(scenarioParam?: string): string {
  let context = "";
  if (scenarioParam) {
    const [w, s] = scenarioParam.split("/");
    const found = getScenario(w, s);
    if (found) {
      context = ` You are role-playing this real-life situation: "${found.scenario.title}" — ${found.scenario.blurb} Stay in character and keep the learner inside the situation.`;
    }
  }
  return [
    "You are a warm, encouraging English tutor for a Spanish-speaking learner at roughly a B1–B2 level.",
    context,
    "Speak mainly in English using clear, natural language. Keep replies short (1–3 sentences) and always end by inviting the learner to continue.",
    "When the learner makes a grammar or word-choice mistake, gently correct the most important one: briefly show the better way to say it, then continue the conversation naturally. Don't pile on corrections.",
    "If the learner writes in Spanish, encourage them to try in English and help them. Be patient and positive.",
    "Write in plain conversational text only. Do not use any Markdown formatting — no asterisks for bold, no hashes for headings, no bullet lists. Use quotation marks to highlight a corrected phrase.",
  ]
    .filter(Boolean)
    .join(" ");
}

const today = () => new Date().toISOString().slice(0, 10);

export async function POST(req: Request) {
  const { messages, scenario } = (await req.json()) as {
    messages: TutorMessage[];
    scenario?: string;
  };
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

  // ── Stub mode (no key) ──────────────────────────────────────
  if (!hasKey) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return NextResponse.json({ reply: buildStubReply(lastUser?.content ?? "", scenario), stub: true });
  }

  // ── Auth + Pro gate ─────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (stripeEnabled) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { proUntil: true },
    });
    if (!isPro(user)) {
      return NextResponse.json(
        { reply: "The AI Tutor is a Pro feature. Upgrade to start practicing.", stub: false },
        { status: 200 },
      );
    }
  }

  // ── Daily usage cap ─────────────────────────────────────────
  const usage = await prisma.tutorUsage.upsert({
    where: { userId_day: { userId: session.user.id, day: today() } },
    update: {},
    create: { userId: session.user.id, day: today(), count: 0 },
  });
  if (usage.count >= DAILY_CAP) {
    return NextResponse.json({
      reply:
        "You've reached today's practice limit with the tutor. Come back tomorrow — your other practice is still unlimited!",
      stub: false,
      limited: true,
    });
  }

  // ── Build the conversation for Claude ───────────────────────
  // Claude requires a non-empty conversation starting with a user turn.
  const convo = messages
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0);
  while (convo.length && convo[0].role === "assistant") convo.shift();
  if (convo.length === 0) {
    convo.push({
      role: "user",
      content: "[The learner just opened the chat. Greet them warmly and start the conversation or scenario.]",
    });
  }

  try {
    const client = new Anthropic();
    const completion = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: tutorSystemPrompt(scenario),
      messages: convo as Anthropic.MessageParam[],
    });
    const reply = completion.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    await prisma.tutorUsage.update({
      where: { userId_day: { userId: session.user.id, day: today() } },
      data: { count: { increment: 1 } },
    });

    return NextResponse.json({ reply: reply || "…", stub: false });
  } catch (err) {
    console.error("[tutor] Anthropic error:", err);
    return NextResponse.json(
      { reply: "Sorry, I had trouble responding just now. Please try again.", stub: false },
      { status: 200 },
    );
  }
}

function buildStubReply(userText: string, scenario?: string) {
  const context = scenario ? ` We're practicing the "${scenario.split("/").pop()}" scenario.` : "";
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
