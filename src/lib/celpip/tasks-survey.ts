import type { CelpipWritingTask } from "../celpip";

// Task 2 seed: one original survey/opinion-response prompt in an
// everyday-Canadian context. Plan 03 expands this array to ~8 entries. ALL
// original content — written from the exam FORMAT only.
export const SURVEY_TASKS: CelpipWritingTask[] = [
  {
    id: "survey-transit-vs-parking",
    taskType: "survey",
    title: "City transit investment survey",
    scenario:
      "Your city council is asking residents for their opinion on how to spend the next infrastructure budget: expanding public transit, or building more parking downtown. Write a response giving your opinion.",
    options: ["Expand public transit", "Build more downtown parking"],
    timeLimitMinutes: 26,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `When it comes to deciding how the city should invest in infrastructure, I believe expanding public transit is the better choice.

First, reliable transit reduces how much residents depend on cars for daily trips. If buses and trains run frequently and connect the neighbourhoods people actually live in, fewer families need to own a second car just to get to work or school, which saves them money every month.

Second, investing in transit now prevents a bigger problem later. Downtown parking lots take up valuable land that could otherwise be used for housing or small businesses, and building more of them only encourages more driving, which then creates pressure to build even more parking. Cities that have expanded transit instead, such as those with dedicated bus lanes, have seen commute times drop even as their population grew.

For these reasons, although new parking might feel like a quicker fix, I think the council should commit its budget to public transit, because it solves the underlying problem rather than adding to it.`,
    strategyTips: [
      "Paraphrase the survey question and state your chosen option in your very first sentence.",
      "Build each body paragraph as idea → explain → example, rather than listing reasons without development.",
      "Close with a complex sentence that restates your position instead of introducing a new idea.",
    ],
  },
];
