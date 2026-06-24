import { Suspense } from "react";
import Link from "next/link";
import { Sparkles, Mic, MessagesSquare, Check } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isPro, stripeEnabled } from "@/lib/stripe";
import { Tutor } from "@/components/Tutor";

export default async function TutorPage() {
  const session = await auth();
  let pro = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { proUntil: true },
    });
    pro = isPro(user);
  }

  // When billing isn't configured yet, keep the tutor open (demo mode).
  if (pro || !stripeEnabled) {
    return (
      <Suspense fallback={<div className="text-muted">Loading tutor…</div>}>
        <Tutor />
      </Suspense>
    );
  }

  return <TutorUpsell />;
}

function TutorUpsell() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <span
          className="pop-in mx-auto grid h-14 w-14 place-items-center rounded-2xl text-paper"
          style={{ background: "var(--vermilion)" }}
        >
          <Sparkles className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold">
          The AI Tutor is a Pro feature
        </h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Practise real conversations with a tutor that talks, listens and
          corrects you — live and in character.
        </p>
        <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm">
          {[
            "In-character role-play for any scenario",
            "Instant grammar & word-choice corrections",
            "Pronunciation & fluency feedback",
          ].map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--vermilion)" }} strokeWidth={2.5} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/pro"
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--vermilion)" }}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} /> Upgrade to Pro
        </Link>
        <p className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MessagesSquare className="h-3.5 w-3.5" /> Chat
          </span>
          <span className="inline-flex items-center gap-1">
            <Mic className="h-3.5 w-3.5" /> Voice
          </span>
        </p>
      </div>
    </div>
  );
}
