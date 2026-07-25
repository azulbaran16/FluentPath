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
  {
    id: "survey-02",
    taskType: "survey",
    title: "Town budget survey: park or library",
    scenario:
      "Your town council has extra funds this year and is asking residents to vote on how to spend it: building a new park with a playground and walking trails, or expanding the public library with more books, computers, and study space. Write a response giving your opinion.",
    options: ["Build a new park", "Expand the public library"],
    timeLimitMinutes: 26,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `When residents are asked to choose between a new park and a larger library, I believe expanding the library is the wiser use of the town's extra funds.

First, a bigger library serves a wider range of people throughout the year, not just during good weather. Students need quiet space to study, job seekers use library computers to apply for work online, and parents bring young children to reading programs every week. A park, by contrast, sits mostly empty once the temperature drops or the rain starts, which limits how much value residents actually get from it.

Second, the library already has a proven track record in our community: the current branch is consistently busy, and staff often mention that the computer stations and study rooms are booked well in advance. Expanding something people are already relying on heavily makes more sense than building something new and unproven.

For these reasons, I would encourage the council to invest in the library expansion, since it addresses a need that residents clearly have every single day of the year.`,
    strategyTips: [
      "When a survey compares a 'nice to have' option against one people already rely on daily, lead your argument with existing demand evidence.",
      "Contrast the two options directly in your first body paragraph so the reader sees why one wins, not just why one is good.",
      "Keep the conclusion to one sentence that names your choice again in different words.",
    ],
  },
  {
    id: "survey-03",
    taskType: "survey",
    title: "Transportation budget survey: transit or roads",
    scenario:
      "The regional transportation authority is deciding how to spend next year's budget: adding more bus routes and increasing service frequency, or repaving and widening existing roads for drivers. Write a response giving your opinion on which the authority should fund.",
    options: ["Add more bus routes and frequency", "Repave and widen existing roads"],
    timeLimitMinutes: 26,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Faced with a choice between funding more bus service or repaving roads, I believe the transportation authority should prioritize expanding bus routes and frequency.

To begin with, better bus service benefits people who have no other way to get around, including seniors, students, and residents who cannot afford a car. Increasing how often buses run on already-popular routes would shorten wait times and make transit a realistic option for daily commuting, not just an occasional backup plan. Widening roads, meanwhile, mainly helps drivers who already have a convenient alternative.

In addition, more frequent buses can actually reduce the wear on roads over time, since fewer cars means less traffic and less pressure on the pavement the authority would otherwise need to repair again in a few years. My cousin, who relies entirely on the bus to get to her night-shift job, has told me how much a single extra route would change her daily routine.

For all these reasons, I would ask the authority to direct next year's budget toward transit rather than road expansion, since it helps the residents who need it most.`,
    strategyTips: [
      "When one option helps a specific group (seniors, students, non-drivers), name them directly — it makes your reasoning concrete instead of abstract.",
      "A short personal example (a friend, a relative) can serve as your 'example' step without inventing statistics you can't support.",
      "Address the counterargument briefly (roads help drivers) before dismissing it, so your response reads as considered rather than one-sided.",
    ],
  },
  {
    id: "survey-04",
    taskType: "survey",
    title: "Workplace policy survey: remote or in-office",
    scenario:
      "Your company is updating its workplace policy and is surveying employees on their preference: allowing everyone to work from home permanently, or requiring everyone to work from the office five days a week. Write a response giving your opinion.",
    options: ["Allow permanent work from home", "Require five days in the office"],
    timeLimitMinutes: 26,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Asked to choose between permanent remote work and a full return to the office, I would strongly support allowing employees to work from home permanently.

The most important reason is that remote work gives people control over how they balance their job with the rest of their life. Employees without a long commute have more time for family, exercise, or simply enough sleep, which in turn makes them more focused during actual working hours. A colleague of mine used to spend almost two hours a day traveling to the office; since switching to remote work, she has used that time to finish a part-time course in the evenings.

A full return to the office also assumes everyone works best under close supervision, which is not true for many roles that depend on independent, deep-focus tasks rather than constant collaboration. Forcing five office days a week ignores how differently people actually work.

Because remote work supports both wellbeing and productivity, I believe the company should make it a permanent option rather than reverting to a fixed office schedule.`,
    strategyTips: [
      "Anchor an abstract benefit (work-life balance) to one specific, relatable example so the marker sees it isn't just a stock phrase.",
      "Address the hidden assumption behind the other option (that supervision improves output) directly — refuting an assumption is a strong idea → explain move.",
      "Use 'because... I believe' in your closing sentence to link your reasoning to your position in one complex sentence.",
    ],
  },
  {
    id: "survey-05",
    taskType: "survey",
    title: "Neighbourhood grant survey: sports complex or cultural centre",
    scenario:
      "Your neighbourhood association received a grant to build one new shared facility and is asking residents to choose between two options: an indoor sports complex with a gym and courts, or a community cultural centre with event space and art studios. Write a response giving your opinion.",
    options: ["Build an indoor sports complex", "Build a community cultural centre"],
    timeLimitMinutes: 26,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `When choosing between an indoor sports complex and a community cultural centre, I believe the grant would be better spent on the cultural centre.

One key reason is that our neighbourhood already has a recreation centre with a gym and courts about ten minutes away, so a second sports facility would largely duplicate something residents can already access. A cultural centre, on the other hand, would fill a real gap, since there is currently nowhere nearby for local artists to exhibit their work or for community groups to hold larger gatherings and workshops.

A cultural centre would also bring together a wider mix of residents than a sports facility typically does. Event space and art studios can host everything from seniors' craft mornings to youth theatre rehearsals, which builds connections across age groups rather than serving mainly the people who already enjoy sports.

Given that the neighbourhood's fitness needs are already reasonably well met, I would encourage the association to invest this grant in the cultural centre instead, since it offers something genuinely new to the community.`,
    strategyTips: [
      "When one option duplicates an existing resource, say so explicitly — 'we already have X nearby' is a strong, concrete reason a marker can follow.",
      "Think about who benefits from each option (age groups, interests), not only what each option contains.",
      "Open your conclusion with 'Given that...' to summarize your strongest reason before restating your choice.",
    ],
  },
];
