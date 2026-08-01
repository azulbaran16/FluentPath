"use client";

import type { Skill } from "@/lib/curriculum";
import { SKILL_META } from "@/lib/curriculum";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { PASSAGES } from "@/lib/content/reading";
import { WRITING_PROMPTS } from "@/lib/content/writing";
import { getScenarioPhrases } from "@/lib/content/phrases";
import { GrammarQuiz } from "./GrammarQuiz";
import { ReadingRoom } from "./ReadingRoom";
import { WritingDesk } from "./WritingDesk";
import { PronunciationLab } from "./PronunciationLab";

// General speaking warm-up mixing a few useful sets. All three keys are curated
// and the content harness asserts every scenario resolves to a non-empty set,
// so `?? []` is unreachable — and if a set were ever deleted this warm-up would
// get SHORTER rather than quietly serving another scenario's phrases, which is
// the whole reason the per-world fallback was removed at 03-11.
const SPEAKING_SET = [
  ...(getScenarioPhrases("social", "small-talk") ?? []).slice(0, 3),
  ...(getScenarioPhrases("native", "pronunciation") ?? []),
  ...(getScenarioPhrases("native", "idioms") ?? []).slice(0, 2),
];

export function SkillPractice({ skill }: { skill: Skill }) {
  const accent = `var(${SKILL_META[skill].color})`;

  switch (skill) {
    case "grammar":
      return <GrammarQuiz questions={GRAMMAR_QUESTIONS} accent={accent} />;
    case "speaking":
      return <PronunciationLab phrases={SPEAKING_SET} accent={accent} />;
    case "reading":
      return <ReadingRoom passages={PASSAGES} accent={accent} />;
    case "writing":
      return <WritingDesk prompts={WRITING_PROMPTS} accent={accent} />;
  }
}
