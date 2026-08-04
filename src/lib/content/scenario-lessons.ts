// Short "Learn the essentials" intro shown at the top of each scenario,
// before the speaking warm-up. Curated for the main scenarios, with a
// sensible fallback so every scenario has a useful briefing.

export interface ScenarioLesson {
  /** one- or two-sentence framing of the situation */
  intro: string;
  /** 2–3 quick, practical tips (usage, culture, register) */
  tips: string[];
}

const LESSONS: Record<string, ScenarioLesson> = {
  "social/small-talk": {
    intro:
      "Small talk is the social glue of English. The goal isn't deep content — it's showing warmth and keeping the conversation flowing.",
    tips: [
      "Safe topics: weekend, weather, work, travel, food. Avoid money, age and politics with strangers.",
      "Answer with a little extra, then bounce it back: “Good, busy week! How about you?”",
      "“How are you?” is often just a greeting — a short positive reply is enough.",
    ],
  },
  "social/making-friends": {
    intro:
      "Turning an acquaintance into a friend is about finding common ground and making a low-pressure plan.",
    tips: [
      "Find shared interests, then suggest something casual: “We should grab a coffee sometime.”",
      "“We should hang out” is friendly but vague — follow up with a real day to make it happen.",
      "Swapping contacts: “Let me give you my number / What's your Instagram?”",
    ],
  },
  "social/dating": {
    intro:
      "Asking someone out works best when it's relaxed, specific and easy to say no to.",
    tips: [
      "Be specific and light: “Would you like to grab dinner on Friday?”",
      "Compliments on effort/personality land better than on looks early on.",
      "Reading interest: enthusiasm and follow-up questions are good signs.",
    ],
  },
  "work/interviews": {
    intro:
      "Interviews reward clear, structured answers. Tell short stories that show results, and ask sharp questions back.",
    tips: [
      "Use the STAR pattern: Situation, Task, Action, Result.",
      "Have 2–3 questions ready: “What does success look like in this role?”",
      "Keep it positive about past jobs — never badmouth a former employer.",
    ],
  },
  "work/meetings": {
    intro:
      "In meetings, the key skills are interrupting politely, agreeing/disagreeing, and summarising.",
    tips: [
      "Jump in politely: “Can I add something here?” / “Just to build on that…”",
      "Disagree softly: “I see your point, but…” / “I'm not sure I agree.”",
      "Park tangents: “Let's circle back to that later.”",
    ],
  },
  "work/emails": {
    intro:
      "A good work email is short, clear and well-toned. One topic, one clear ask.",
    tips: [
      "Front-load the purpose in the first line.",
      "Match the register: “Hi” for colleagues, “Dear” for clients/formal.",
      "End with a clear next step and a sign-off (Best, / Kind regards,).",
    ],
  },
  "travel/airport": {
    intro:
      "Airports use a small set of fixed phrases. Knowing them removes most of the stress.",
    tips: [
      "Check-in: “I'd like a window/aisle seat, please.”",
      "Listen for: boarding, gate, delayed, connection, baggage claim.",
      "If something goes wrong: “I think I've missed my connection — what are my options?”",
    ],
  },
  "travel/restaurant": {
    intro:
      "Ordering food follows a predictable script — from being seated to paying.",
    tips: [
      "Ordering: “I'll have the…, please.” / “Could we see the menu?”",
      "Ask about food: “Does this contain nuts?” / “What do you recommend?”",
      "Paying: “Could we get the check/bill, please?” Tipping varies by country.",
    ],
  },
  "travel/directions": {
    intro:
      "Asking for directions is about a clear question and understanding a few key words.",
    tips: [
      "Open politely: “Excuse me, how do I get to…?”",
      "Key words: turn left/right, go straight, next to, opposite, on the corner.",
      "Check distance: “Is it within walking distance?”",
    ],
  },
  "travel/emergencies": {
    intro:
      "In an emergency, speak slowly and give the essential facts first: what, where, who.",
    tips: [
      "State the problem clearly: “I need help — there's been an accident.”",
      "Pharmacy/doctor: “I have a headache / a sore throat / a fever.”",
      "Useful: “Could you call an ambulance?” / “Where's the nearest hospital?”",
    ],
  },
  "practical/phone-calls": {
    intro:
      "Phone calls are harder because there's no body language — clarity and set phrases carry the call.",
    tips: [
      "Open: “Hi, this is [name]. I'm calling about…”",
      "Can't hear? “Sorry, you're breaking up — could you repeat that?”",
      "Close: “Thanks for your help. Have a good day.”",
    ],
  },
  "practical/tech-support": {
    intro:
      "With support, describe the problem step by step and what you've already tried.",
    tips: [
      "Describe clearly: “It won't turn on / It keeps crashing when I…”",
      "Say what you tried: “I've already restarted it and checked the cable.”",
      "Escalate calmly: “Could I speak to someone who can help with this?”",
    ],
  },
  /* The three examples this briefing used to work from — "a piece of cake",
   * "under the weather" — were also in the phrase bank and also in the deck, so
   * ONE canonical list appeared on three surfaces of a single C1 scenario, and
   * it appeared here in the shape the bank is now gated against: expression =
   * translation. Both expressions were retired at 04-03/04-04 and this briefing
   * would otherwise be teaching from a bank that no longer holds them.
   *
   * The rewrite demonstrates its points on expressions used NOWHERE ELSE in
   * this scenario — not in the eighteen phrases, not in the twenty-four cards,
   * not in the rehearsal, and not among the four expressions the reading
   * passage withholds. That separation is asserted in
   * scripts/verify-scenario-content.mts, so it cannot quietly come back. */
  "native/idioms": {
    intro:
      "An idiom only sounds native when it fits the person you're saying it to. Learn each one properly — what it means AND who you can say it to — rather than collecting a long list you can only translate.",
    tips: [
      "The restriction is part of the expression. “I've got a lot on my plate” sounds honest said to a colleague, and reads as an excuse in a written reply to someone who has been waiting a fortnight.",
      "Most of them are informal. They belong in speech and in messages; in a contract, a complaint or a covering letter, the plain wording is the professional one.",
      "Getting it wrong rarely leaves you misunderstood — it leaves you misplaced. People work out what you meant; what they notice is that you reached for a phrase the moment didn't call for. When in doubt, the ordinary sentence is never the wrong answer.",
    ],
  },
  "native/pronunciation": {
    intro:
      "Clear pronunciation is less about a perfect accent and more about the right sounds, stress and rhythm.",
    tips: [
      "Mind the 'th' (think/this) and the difference between /r/ and /l/.",
      "Stress the correct syllable — it matters more than individual sounds.",
      "Link words together; don't pronounce each one separately.",
    ],
  },
  "native/phrasal-verbs": {
    intro:
      "Phrasal verbs are everywhere in spoken English. Natives prefer “turn down” to “reduce”.",
    tips: [
      "Learn them in context, not as lists: “turn down the music”.",
      "Many are separable: “turn it down” ✓, “turn down it” ✗.",
      "Same verb, many meanings: “get up / get on / get over”.",
    ],
  },
  "social/parties": {
    intro:
      "Parties are about energy and quick connections, not deep talks — your job is to mingle, not to impress.",
    tips: [
      "An easy opener works anywhere: “So, how do you know the host?”",
      "Leave a chat politely: “It was great talking — I'm going to grab a drink.”",
      "As a host, keep introducing people: “Ana, this is Tom — he also loves climbing.”",
    ],
  },
  "social/complaining": {
    intro:
      "Complaining well in English means being firm about the problem while staying polite with the person.",
    tips: [
      "Soften the opening, keep the point firm: “I'm sorry to bother you, but this isn't what I ordered.”",
      "Describe the issue, not the person: “There seems to be a mistake” beats “You messed up.”",
      "Ask for the fix clearly: “Could you replace it or refund me, please?”",
    ],
  },
  "social/favors": {
    intro:
      "Asking for favors is all about register: the bigger the ask, the more polite and indirect you go.",
    tips: [
      "Small favor: “Can you…?” Bigger one: “Would you mind …ing?”",
      "Give a reason — people say yes more often: “Could you cover for me? I have an appointment.”",
      "Offering help sounds friendly: “Do you want a hand with that?”",
    ],
  },
  "social/humor": {
    intro:
      "Humor and sarcasm rely on tone and timing — the words often mean the opposite of what's said.",
    tips: [
      "Sarcasm flips meaning: a flat “Oh, great” means it's not great at all.",
      "Self-deprecating humor (gently laughing at yourself) is safe and likeable in English.",
      "Not sure if they're joking? A light “Wait, are you serious?” keeps it friendly.",
    ],
  },
  "work/presentations": {
    intro:
      "A good presentation guides the listener: tell them what's coming, say it, then remind them what you said.",
    tips: [
      "Signpost clearly: “First… / Moving on… / To sum up…”",
      "Handle questions calmly: “Great question — let me come back to that.”",
      "Close with a takeaway, not “that's it”: “So the key point is…”",
    ],
  },
  "work/negotiating": {
    intro:
      "Negotiation language stays flexible and collaborative while protecting what matters to you.",
    tips: [
      "Trade, don't just concede: “If you can do X, then we could do Y.”",
      "Push back politely: “I see your point, but that doesn't quite work for us.”",
      "Aim for win-win wording: “Let's find something that works for both of us.”",
    ],
  },
  "work/networking": {
    intro:
      "Networking is starting low-stakes professional chats and leaving a door open to talk again.",
    tips: [
      "Keep your pitch short: “I'm a [role] at [place], focused on [thing].”",
      "Show interest first: “What are you working on these days?”",
      "Follow up afterward: “Great to meet you — let's stay in touch on LinkedIn.”",
    ],
  },
  "work/feedback": {
    intro:
      "Good feedback is specific and kind; receiving it well is about listening before defending.",
    tips: [
      "Be concrete: “The intro was strong; the data slide felt rushed.”",
      "Use “I” framing: “I found it hard to follow” over “You were unclear.”",
      "Taking feedback: “Thanks, that's helpful — could you give an example?”",
    ],
  },
  "travel/hotel": {
    intro:
      "Hotel English is a small set of predictable requests — checking in, asking for things, and fixing problems.",
    tips: [
      "Check in: “I have a reservation under [name].”",
      "Make requests: “Could I get an extra towel / a late checkout?”",
      "Report problems: “The AC isn't working — could someone take a look?”",
    ],
  },
  "travel/shopping": {
    intro:
      "Shopping conversations cover comparing, trying, paying and returning — mostly short, polite exchanges.",
    tips: [
      "“I'm just looking, thanks” politely ends the offer to help.",
      "Ask about fit: “Do you have this in a medium?”",
      "Returns: “I'd like to return this — here's the receipt.”",
    ],
  },
  "academic/news": {
    intro:
      "Reading the news well means getting the gist fast and noticing the angle a writer takes.",
    tips: [
      "Headlines drop small words: “PM to meet leaders” = will meet.",
      "Read the first paragraph for the who/what/when, then skim the rest.",
      "Spot loaded words (“slammed”, “claims”) that signal opinion, not fact.",
    ],
  },
  "academic/articles": {
    intro:
      "Long-form articles reward following the argument and inferring meaning you aren't told directly.",
    tips: [
      "Track the thread: each paragraph usually adds one new idea.",
      "Guess new words from context before reaching for a dictionary.",
      "Notice signposts — “however”, “in contrast”, “as a result” — that show the logic.",
    ],
  },
  "academic/stories": {
    intro:
      "Short stories are about voice and subtext — what characters feel often sits between the lines.",
    tips: [
      "Don't stop at every word; keep the narrative moving and infer.",
      "Watch the narrator's tone — it colors how you read events.",
      "Dialogue carries character; note the natural phrasings you like.",
    ],
  },
  "academic/summaries": {
    intro:
      "Summarizing is saying the main idea in your own words — shorter, clearer, and without the detail.",
    tips: [
      "Find the one sentence that captures the point, then build from it.",
      "Use your words, not the author's — it proves you understood.",
      "Cut examples and repetition; keep only what changes the meaning.",
    ],
  },
  "academic/debate": {
    intro:
      "Debating in English is structured disagreement: state a claim, support it, and respond to the other side.",
    tips: [
      "Signal your move: “My main argument is… / On the other hand…”",
      "Concede gracefully: “That's a fair point, but…”",
      "Back claims with reasons or examples, not just stronger words.",
    ],
  },
  "practical/housing": {
    intro:
      "Renting and moving involve viewings, lease questions and setting things up — practical, detail-heavy talk.",
    tips: [
      "Ask the key questions: “What's included in the rent? When's it available?”",
      "Know the lease terms: deposit, notice period, utilities.",
      "Set things up: “I'd like to set up electricity at this address.”",
    ],
  },
  "practical/banking": {
    intro:
      "Banking English is a handful of clear requests about accounts, payments and problems.",
    tips: [
      "Opening: “I'd like to open a current account.”",
      "Disputes: “I don't recognize this charge — can you check it?”",
      "Bills: “Can I set up a direct debit?”",
    ],
  },
  "practical/appointments": {
    intro:
      "Booking appointments is short and formulaic — a date, a time, and confirming.",
    tips: [
      "Ask availability: “Do you have anything on Tuesday morning?”",
      "Confirm clearly: “So that's the 3rd at 10, right?”",
      "Reschedule: “Could I move my appointment to next week?”",
    ],
  },
  "native/register": {
    intro:
      "Register is the formality dial — the same idea sounds very different in a text vs. a contract.",
    tips: [
      "Casual ↔ formal: “Can you…?” becomes “Would you be able to…?”",
      "Contractions and slang signal informal; full forms signal formal.",
      "Mirror the other person's level — matching tone builds rapport.",
    ],
  },
  "native/culture": {
    intro:
      "Cultural references — films, sayings, history — are the shortcuts natives drop without explaining.",
    tips: [
      "Catch common ones: “It's his Achilles' heel”, “That's so 2010.”",
      "When you miss one, just ask: “Sorry, what's that a reference to?”",
      "Notice references in shows and headlines — they repeat a lot.",
    ],
  },
};

/* The generic briefing an unknown scenario key resolves to.
 *
 * EXPORTED SO THE HARNESS CAN PROVE IT UNREACHABLE. All 35 scenarios have a
 * briefing of their own today, so this record is dead — the same situation
 * `phrases.ts` was in before 03-11, and the same trap: filler that reads exactly
 * like curated content on the page, handed silently to the next author who adds
 * a scenario and forgets a briefing.
 *
 * 03-11 deleted its fallback outright. That is NOT the move here, because
 * `getScenarioLesson` returns `ScenarioLesson` rather than `ScenarioLesson |
 * undefined`, so deleting the record changes the accessor's return type and
 * every call site — real churn in files this change does not own, to buy a
 * safety property an assertion buys for nothing. 03-11's other rule is the one
 * that applies: the replacement for a comment saying "this is dead" is an
 * ASSERTION saying so. See scripts/verify-scenario-content.mts.
 *
 * Whether the record should be deleted outright, and the accessor made to
 * return `undefined` like every other bank's, is an OPEN QUESTION filed for the
 * phase gate — not a decision taken here. */
export const FALLBACK_LESSON: ScenarioLesson = {
  intro:
    "Before you practise, glance over the key phrases below — then say them out loud and rehearse the conversation.",
  tips: [
    "Short, clear sentences beat long, perfect ones. Aim to be understood.",
    "It's fine to ask people to slow down: “Sorry, could you say that again?”",
    "Listen for the key words; you don't need to catch every single one.",
  ],
};

export function getScenarioLesson(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioLesson {
  return LESSONS[`${worldSlug}/${scenarioSlug}`] ?? FALLBACK_LESSON;
}
