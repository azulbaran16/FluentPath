// Curated advice on how to learn English effectively. Shown on /tips.

export type TipIcon =
  | "habit"
  | "speak"
  | "immerse"
  | "skills"
  | "memory"
  | "mindset";

export interface TipSection {
  id: string;
  icon: TipIcon;
  title: string;
  intro: string;
  tips: string[];
}

export const LEARNING_TIPS: TipSection[] = [
  {
    id: "habit",
    icon: "habit",
    title: "Build the habit",
    intro:
      "Consistency beats intensity. Fifteen focused minutes every day will take you further than a three-hour session once a week.",
    tips: [
      "Study a little every day — keep your streak alive, even on busy days.",
      "Attach practice to an existing habit: after coffee, on the commute, before bed.",
      "Trust the spaced-repetition Review — it brings things back right before you'd forget them.",
      "Don't break the chain twice. Missing one day is fine; missing two starts a new habit of not doing it.",
    ],
  },
  {
    id: "speak",
    icon: "speak",
    title: "Speak from day one",
    intro:
      "You learn to speak by speaking. Output — even imperfect — is where real fluency is built.",
    tips: [
      "Say things out loud, not just in your head. Use the pronunciation lab daily.",
      "Mistakes are not failures — they're data. Fluent speakers are people who made millions of them.",
      "Shadowing: play a short clip, then copy the rhythm and intonation, not just the words.",
      "Try to think in English for small things — your shopping list, your plans for the day.",
    ],
  },
  {
    id: "immerse",
    icon: "immerse",
    title: "Surround yourself with English",
    intro:
      "Your brain learns a language from massive, enjoyable input. Make English part of your day, not just your study time.",
    tips: [
      "Choose content slightly above your level — enough to follow, enough to stretch you.",
      "Watch shows with English (not your own) subtitles; re-watch favourite scenes.",
      "Switch your phone, apps and social feeds to English.",
      "Pick topics you genuinely love — you'll absorb far more when you're interested.",
    ],
  },
  {
    id: "skills",
    icon: "skills",
    title: "Train each skill on purpose",
    intro:
      "The four skills support each other, but each needs its own deliberate practice.",
    tips: [
      "Reading: read a little above your level and guess words from context before checking.",
      "Listening: listen more than feels comfortable; quantity builds your ear.",
      "Writing: keep a short daily journal — three sentences is enough to start.",
      "Grammar: learn a rule, then immediately use it in a sentence about your own life.",
    ],
  },
  {
    id: "memory",
    icon: "memory",
    title: "Make it stick",
    intro:
      "Learning isn't remembering once — it's being able to recall and use it later.",
    tips: [
      "Learn vocabulary in chunks and phrases, not isolated words ('make a decision', not just 'decision').",
      "Use a new word three times in the next two days and it's far more likely to stay.",
      "Test yourself instead of re-reading — recalling is what strengthens memory.",
      "Review beats cramming: short sessions spread over time win every time.",
    ],
  },
  {
    id: "mindset",
    icon: "mindset",
    title: "Mindset for the long run",
    intro:
      "Reaching a native level is a marathon. How you think about the journey decides whether you finish it.",
    tips: [
      "Aim for progress, not perfection — being understood matters more than being flawless.",
      "Plateaus are normal. They're often the moment right before a jump in ability.",
      "Set tiny, concrete goals ('order a coffee in English') rather than vague ones ('be fluent').",
      "Celebrate small wins — they're the fuel that keeps the habit going.",
    ],
  },
];
