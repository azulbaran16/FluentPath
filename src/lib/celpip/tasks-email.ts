import type { CelpipWritingTask } from "../celpip";

// Task 1 seed: one original formal-email prompt in an everyday-Canadian
// context. Plan 02 expands this array to ~8 entries. ALL original content —
// written from the exam FORMAT only, no text copied from third-party material.
export const EMAIL_TASKS: CelpipWritingTask[] = [
  {
    id: "email-noise-complaint",
    taskType: "email",
    title: "Email to your building manager",
    scenario:
      "You live in an apartment building in Toronto. Over the past two weeks, a neighbour has been playing loud music late at night, and it has been affecting your sleep and your ability to focus on work the next day. Write an email to your building manager, Mr. Chen.",
    bullets: [
      "Explain the problem and how it has been affecting you",
      "Describe what you have already tried to resolve it yourself",
      "Suggest what you would like the manager to do next",
    ],
    timeLimitMinutes: 27,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Dear Mr. Chen,

I am writing to raise a concern about noise coming from the apartment next to mine, unit 412. Over the past two weeks, loud music has continued well past midnight on several nights, and it has become difficult for me to sleep or concentrate on work the next day.

I have already spoken to my neighbour twice, most recently on Tuesday evening, and asked politely if the volume could be lowered after 10 p.m. Unfortunately, the situation has not improved, and I would rather not approach them again on my own.

Given this, I would appreciate it if you could send a written reminder to all residents about the building's quiet hours policy, and speak directly with unit 412 if the noise continues. I am happy to share the specific dates and times if that would help.

Thank you for looking into this matter. I look forward to hearing how we can resolve it.

Yours sincerely,
Priya Patel`,
    strategyTips: [
      "Open with a one-sentence purpose statement so the reader knows immediately why you're writing.",
      "Give each bullet point its own paragraph — blending them together makes the email harder to act on.",
      "Close with a concrete next step and a formal sign-off ('Yours sincerely,' plus your full name) to match the formal register.",
    ],
  },
];
