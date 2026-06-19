"use client";

import type { Skill } from "@/lib/curriculum";
import { SKILL_META } from "@/lib/curriculum";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { PASSAGES } from "@/lib/content/reading";
import { WRITING_PROMPTS } from "@/lib/content/writing";
import { getPhrases } from "@/lib/content/phrases";
import { GrammarQuiz } from "./GrammarQuiz";
import { ReadingRoom } from "./ReadingRoom";
import { WritingDesk } from "./WritingDesk";
import { PronunciationLab } from "./PronunciationLab";

// General speaking warm-up mixing a few useful sets.
const SPEAKING_SET = [
  ...getPhrases("social", "small-talk").slice(0, 3),
  ...getPhrases("native", "pronunciation"),
  ...getPhrases("native", "idioms").slice(0, 2),
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
