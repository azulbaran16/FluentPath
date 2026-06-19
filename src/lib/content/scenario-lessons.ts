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
  "native/idioms": {
    intro:
      "Idioms make you sound natural — but only when used in the right situation. Learn a few well rather than many badly.",
    tips: [
      "“It's a piece of cake” = very easy. “Under the weather” = feeling ill.",
      "Idioms are mostly informal — fine with friends, careful in formal writing.",
      "If unsure of an idiom, plain English is always safe.",
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
};

const FALLBACK: ScenarioLesson = {
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
  return LESSONS[`${worldSlug}/${scenarioSlug}`] ?? FALLBACK;
}
