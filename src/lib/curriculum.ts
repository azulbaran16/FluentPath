// ───────────────────────────────────────────────────────────
// FluentPath curriculum — the 6 "worlds" of real-life English.
// Each world groups scenarios; each scenario trains one or more
// of the four core skills plus pronunciation & vocabulary.
// This is the single source of truth for navigation & progress.
// ───────────────────────────────────────────────────────────

export type Skill = "grammar" | "speaking" | "reading" | "writing";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Scenario {
  slug: string;
  title: string;
  /** Plain-language situation the learner will practice. */
  blurb: string;
  level: Level;
  skills: Skill[];
  /** ~minutes for one practice session. */
  minutes: number;
}

export interface World {
  slug: string;
  title: string;
  tagline: string;
  /** CSS color token name (without the var()). */
  color: string;
  scenarios: Scenario[];
}

export const SKILL_META: Record<
  Skill,
  { label: string; color: string; blurb: string }
> = {
  grammar: {
    label: "Grammar",
    color: "--plum",
    blurb: "Tenses, articles, prepositions — corrected in context, never as dry lists.",
  },
  speaking: {
    label: "Speaking",
    color: "--vermilion",
    blurb: "Role-play out loud with the AI tutor; get pronunciation & fluency feedback.",
  },
  reading: {
    label: "Reading",
    color: "--teal",
    blurb: "Graded texts, news and stories with comprehension and emerging vocabulary.",
  },
  writing: {
    label: "Writing",
    color: "--sky",
    blurb: "Write real emails and messages; the tutor corrects and explains the why.",
  },
};

export const WORLDS: World[] = [
  {
    slug: "social",
    title: "Social & Everyday Life",
    tagline: "Sound natural with anyone, anywhere.",
    color: "--vermilion",
    scenarios: [
      { slug: "small-talk", title: "Small talk & breaking the ice", blurb: "Start and keep a casual conversation going without awkward pauses.", level: "B1", skills: ["speaking", "grammar"], minutes: 8 },
      { slug: "making-friends", title: "Making new friends", blurb: "Introduce yourself, find common ground, suggest plans.", level: "B1", skills: ["speaking"], minutes: 10 },
      { slug: "dating", title: "Dating & flirting", blurb: "Ask someone out, compliment naturally, navigate a first date.", level: "B2", skills: ["speaking"], minutes: 10 },
      { slug: "parties", title: "Parties & hosting", blurb: "Invite, welcome guests, mingle, and wrap up the night.", level: "B1", skills: ["speaking"], minutes: 8 },
      { slug: "complaining", title: "Complaining politely", blurb: "Express dissatisfaction firmly but without sounding rude.", level: "B2", skills: ["speaking", "writing"], minutes: 8 },
      { slug: "favors", title: "Asking for & offering favors", blurb: "Make and respond to requests with the right level of politeness.", level: "B1", skills: ["speaking"], minutes: 7 },
      { slug: "humor", title: "Humor & sarcasm", blurb: "Get the joke and make one — read tone and irony.", level: "C1", skills: ["speaking", "reading"], minutes: 10 },
    ],
  },
  {
    slug: "work",
    title: "Work & Professional",
    tagline: "Be the most articulate person in the room.",
    color: "--sky",
    scenarios: [
      { slug: "interviews", title: "Job interviews", blurb: "Answer common questions, tell your story, ask sharp questions.", level: "B2", skills: ["speaking", "grammar"], minutes: 12 },
      { slug: "meetings", title: "Meetings & video calls", blurb: "Interrupt politely, agree/disagree, summarize, take the floor.", level: "B2", skills: ["speaking"], minutes: 10 },
      { slug: "emails", title: "Professional emails", blurb: "Write clear, well-toned emails — from requests to follow-ups.", level: "B1", skills: ["writing", "grammar"], minutes: 10 },
      { slug: "presentations", title: "Presentations", blurb: "Open strong, signpost, handle Q&A, and close memorably.", level: "B2", skills: ["speaking", "writing"], minutes: 12 },
      { slug: "negotiating", title: "Negotiating", blurb: "Make offers, push back, find win-win language.", level: "C1", skills: ["speaking"], minutes: 10 },
      { slug: "networking", title: "Networking", blurb: "Pitch yourself, exchange contacts, follow up afterward.", level: "B2", skills: ["speaking", "writing"], minutes: 9 },
      { slug: "feedback", title: "Giving & receiving feedback", blurb: "Be constructive and take criticism gracefully.", level: "B2", skills: ["speaking"], minutes: 9 },
    ],
  },
  {
    slug: "travel",
    title: "Travel & Errands",
    tagline: "Handle the world like a local.",
    color: "--teal",
    scenarios: [
      { slug: "airport", title: "At the airport", blurb: "Check in, security, gate changes, delays and missed connections.", level: "A2", skills: ["speaking"], minutes: 8 },
      { slug: "hotel", title: "Hotels & stays", blurb: "Book, check in, request things, resolve problems.", level: "B1", skills: ["speaking", "writing"], minutes: 8 },
      { slug: "restaurant", title: "Restaurants & ordering", blurb: "Read a menu, order, ask about ingredients, handle the bill.", level: "A2", skills: ["speaking", "reading"], minutes: 8 },
      { slug: "directions", title: "Directions & getting around", blurb: "Ask for and understand directions, use transport.", level: "A2", skills: ["speaking"], minutes: 7 },
      { slug: "emergencies", title: "Emergencies", blurb: "Pharmacy, doctor, police, lost items — get help fast.", level: "B1", skills: ["speaking"], minutes: 9 },
      { slug: "shopping", title: "Shopping & returns", blurb: "Compare, ask for sizes, negotiate, return faulty items.", level: "B1", skills: ["speaking"], minutes: 8 },
    ],
  },
  {
    slug: "academic",
    title: "Reading & Ideas",
    tagline: "Read deeply, think in English.",
    color: "--moss",
    scenarios: [
      { slug: "news", title: "Reading the news", blurb: "Skim headlines, grasp the gist, spot bias and nuance.", level: "B2", skills: ["reading"], minutes: 10 },
      { slug: "articles", title: "Long-form articles", blurb: "Follow argument, infer meaning, learn vocabulary in context.", level: "C1", skills: ["reading"], minutes: 12 },
      { slug: "stories", title: "Short stories", blurb: "Enjoy fiction, follow narrative voice and idiom.", level: "B2", skills: ["reading"], minutes: 12 },
      { slug: "summaries", title: "Summarizing", blurb: "Capture the main idea of a text in your own words.", level: "B2", skills: ["reading", "writing"], minutes: 9 },
      { slug: "debate", title: "Debating ideas", blurb: "Defend a position, concede points, build arguments.", level: "C1", skills: ["speaking", "writing"], minutes: 11 },
    ],
  },
  {
    slug: "practical",
    title: "Practical Life",
    tagline: "Get things done in English.",
    color: "--gold",
    scenarios: [
      { slug: "phone-calls", title: "Phone calls", blurb: "Make and take calls without seeing the other person.", level: "B1", skills: ["speaking"], minutes: 8 },
      { slug: "tech-support", title: "Tech & customer support", blurb: "Describe a problem, follow troubleshooting, escalate.", level: "B1", skills: ["speaking", "writing"], minutes: 9 },
      { slug: "housing", title: "Renting & moving", blurb: "Tour a flat, ask about a lease, set up utilities.", level: "B2", skills: ["speaking", "reading"], minutes: 10 },
      { slug: "banking", title: "Banking & money", blurb: "Open an account, dispute a charge, talk about bills.", level: "B1", skills: ["speaking"], minutes: 8 },
      { slug: "appointments", title: "Booking appointments", blurb: "Schedule, reschedule and cancel without confusion.", level: "A2", skills: ["speaking"], minutes: 6 },
    ],
  },
  {
    slug: "native",
    title: "Sounding Native",
    tagline: "The final 10% that changes everything.",
    color: "--plum",
    scenarios: [
      // 04-03 took the warm-up from 6 re-selected phrases to 18 and 04-04
      // re-selected the deck up to 24 cards, so the sitting is now
      // 18 x 20 s + a 42-card deck x 15 s = 990 s. The smallest whole minute
      // that covers it is 17 (1020 s), 30 s of slack.
      { slug: "idioms", title: "Idioms & expressions", blurb: "Use everyday idioms correctly and naturally.", level: "C1", skills: ["speaking", "reading"], minutes: 17 },
      { slug: "phrasal-verbs", title: "Phrasal verbs", blurb: "Master the verbs natives can't live without.", level: "B2", skills: ["grammar", "speaking"], minutes: 24 },
      // 04-07 took the warm-up from 6 to 12 and the metalanguage deck from 8
      // cards to 16 — half again, where its four neighbours went to three
      // times. Both banks say in as many words why this scenario is
      // deliberately the smallest of the five. The sitting is therefore
      // 12 x 20 s + a 28-card deck x 15 s = 660 s, and the smallest whole
      // minute that covers it is 11 (660 s) — zero slack, which the invariant
      // permits because it compares with `>=` and already double-counts the
      // warm-up phrases inside the deck.
      { slug: "pronunciation", title: "Pronunciation & accent", blurb: "Tricky sounds, word stress, intonation, connected speech.", level: "B2", skills: ["speaking"], minutes: 11 },
      // 04-05 took the warm-up from three contrasting pairs to nine (6 phrases
      // to 18) and the marker deck from 8 cards to 24, so the sitting is
      // 18 x 20 s + a 42-card deck x 15 s = 990 s. The smallest whole minute
      // that covers it is 17 (1020 s), 30 s of slack.
      { slug: "register", title: "Register: formal ↔ casual", blurb: "Switch tone for the situation, from texts to contracts.", level: "C1", skills: ["writing", "speaking"], minutes: 17 },
      // 04-06 took the warm-up from 6 repair phrases to 18 and the deck from 8
      // cards to 24, so the sitting is 18 x 20 s + a 42-card deck x 15 s
      // = 990 s. The smallest whole minute that covers it is 17 (1020 s),
      // 30 s of slack.
      { slug: "culture", title: "Culture & references", blurb: "Catch the references natives drop in conversation.", level: "C1", skills: ["reading", "speaking"], minutes: 17 },
    ],
  },
];

export function getWorld(slug: string): World | undefined {
  return WORLDS.find((w) => w.slug === slug);
}

export function getScenario(
  worldSlug: string,
  scenarioSlug: string,
): { world: World; scenario: Scenario } | undefined {
  const world = getWorld(worldSlug);
  const scenario = world?.scenarios.find((s) => s.slug === scenarioSlug);
  if (!world || !scenario) return undefined;
  return { world, scenario };
}

export const TOTAL_SCENARIOS = WORLDS.reduce(
  (sum, w) => sum + w.scenarios.length,
  0,
);
