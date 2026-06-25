// Listening clips: short monologues/dialogues played via text-to-speech,
// with the transcript hidden until the learner has tried the questions.
// Graded A2 → C1.

export interface ListeningQuestion {
  q: string;
  options: string[];
  answer: number;
}

export type ListeningLevel = "A2" | "B1" | "B2" | "C1";

export interface Clip {
  id: string;
  title: string;
  level: ListeningLevel;
  /** lines read aloud, in order (e.g. "A: …", "B: …" for dialogues) */
  lines: string[];
  questions: ListeningQuestion[];
}

export const LISTENING_LEVELS: ListeningLevel[] = ["A2", "B1", "B2", "C1"];

export const CLIPS: Clip[] = [
  {
    id: "voicemail",
    title: "A voicemail message",
    level: "A2",
    lines: [
      "Hi, this is Dr. Lee's office calling for Mr. Adams.",
      "We're calling to confirm your appointment on Thursday at 3 p.m.",
      "If you need to change it, please call us back at 555-0123.",
      "Thank you, and have a nice day.",
    ],
    questions: [
      {
        q: "Who is the message for?",
        options: ["Dr. Lee", "Mr. Adams", "The receptionist"],
        answer: 1,
      },
      {
        q: "When is the appointment?",
        options: ["Thursday at 3 p.m.", "Tuesday at 3 p.m.", "Thursday at 3 a.m."],
        answer: 0,
      },
      {
        q: "What should you do to change it?",
        options: ["Send an email", "Call back", "Visit the office"],
        answer: 1,
      },
    ],
  },
  {
    id: "coffee-order",
    title: "Ordering at a café",
    level: "A2",
    lines: [
      "A: Hi, what can I get you?",
      "B: Can I have a medium latte, please?",
      "A: Sure. Anything to eat?",
      "B: Yes, a chocolate muffin. To take away, please.",
      "A: That's five fifty. For here or to go?",
      "B: To go, thanks.",
    ],
    questions: [
      {
        q: "What does the customer order to drink?",
        options: ["A tea", "A medium latte", "A small coffee"],
        answer: 1,
      },
      {
        q: "Does the customer eat in or take away?",
        options: ["Eat in", "Take away", "They don't say"],
        answer: 1,
      },
    ],
  },
  {
    id: "weekend-plans",
    title: "Talking about the weekend",
    level: "B1",
    lines: [
      "A: Any plans for the weekend?",
      "B: Actually, yes. I'm going hiking on Saturday if the weather's good.",
      "A: Nice! And if it rains?",
      "B: Then I'll probably just stay in and finally finish that series everyone's talking about.",
      "A: Sounds relaxing. Let's grab a coffee on Sunday either way.",
      "B: Perfect, let's do that.",
    ],
    questions: [
      {
        q: "What will B do if the weather is good?",
        options: ["Stay home", "Go hiking", "Watch a series"],
        answer: 1,
      },
      {
        q: "What's the backup plan if it rains?",
        options: ["Go to the cinema", "Finish a series at home", "Go shopping"],
        answer: 1,
      },
      {
        q: "What do they agree to do on Sunday?",
        options: ["Go hiking together", "Grab a coffee", "Nothing"],
        answer: 1,
      },
    ],
  },
  {
    id: "delayed-flight",
    title: "An airport announcement",
    level: "B1",
    lines: [
      "Attention, passengers on flight BA215 to New York.",
      "We regret to inform you that your flight has been delayed by approximately two hours due to weather conditions.",
      "The new estimated departure time is 6:45 p.m.",
      "Please keep your boarding pass handy and listen for further announcements. We apologise for the inconvenience.",
    ],
    questions: [
      {
        q: "Why is the flight delayed?",
        options: ["A technical problem", "Weather conditions", "A strike"],
        answer: 1,
      },
      {
        q: "What is the new departure time?",
        options: ["4:45 p.m.", "6:45 p.m.", "8:15 p.m."],
        answer: 1,
      },
    ],
  },
  {
    id: "meeting-update",
    title: "A project update",
    level: "B2",
    lines: [
      "Okay everyone, quick update on the launch.",
      "The good news is that development is on track and we should hit Friday's deadline.",
      "However, the design team has flagged a couple of accessibility issues we need to fix first.",
      "So, to be safe, I'd suggest we move the public launch to Monday rather than rush it.",
      "I'll send a summary by email this afternoon.",
    ],
    questions: [
      {
        q: "What is the status of development?",
        options: ["Behind schedule", "On track", "Cancelled"],
        answer: 1,
      },
      {
        q: "What problem was flagged?",
        options: ["Budget issues", "Accessibility issues", "Staff shortages"],
        answer: 1,
      },
      {
        q: "What does the speaker suggest?",
        options: [
          "Launch on Friday as planned",
          "Move the launch to Monday",
          "Cancel the launch",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "podcast-habits",
    title: "A podcast clip on habits",
    level: "C1",
    lines: [
      "The thing most people get wrong about building habits is that they rely on motivation.",
      "Motivation is unreliable — it comes and goes. What actually works is designing your environment so the good choice becomes the easy one.",
      "If you want to read more, leave a book on your pillow. If you want to snack less, don't keep snacks in the house.",
      "In other words, you don't rise to the level of your goals; you fall to the level of your systems.",
    ],
    questions: [
      {
        q: "What does the speaker say is unreliable?",
        options: ["Your environment", "Motivation", "Your goals"],
        answer: 1,
      },
      {
        q: "What actually works, according to the speaker?",
        options: [
          "Designing your environment",
          "Setting bigger goals",
          "Waiting for inspiration",
        ],
        answer: 0,
      },
      {
        q: "What's the main message of the final line?",
        options: [
          "Goals matter more than systems",
          "You fall to the level of your systems",
          "Habits don't matter",
        ],
        answer: 1,
      },
    ],
  },

  // ── A2 (more) ──
  {
    id: "weather-forecast",
    title: "The weather forecast",
    level: "A2",
    lines: [
      "Good morning! Here's today's weather.",
      "It will be sunny in the morning, with a high of 22 degrees.",
      "In the afternoon, expect some clouds and a light wind.",
      "Don't forget your sunglasses!",
    ],
    questions: [
      { q: "What's the weather like in the morning?", options: ["Rainy", "Sunny", "Snowy"], answer: 1 },
      { q: "What is the high temperature?", options: ["12 degrees", "22 degrees", "32 degrees"], answer: 1 },
      { q: "What does the speaker suggest bringing?", options: ["An umbrella", "Sunglasses", "A coat"], answer: 1 },
    ],
  },
  {
    id: "train-announcement",
    title: "A train announcement",
    level: "A2",
    lines: [
      "Attention, please. The train to Manchester will leave from platform four.",
      "It is now boarding and will depart in five minutes.",
      "Please have your tickets ready.",
      "We wish you a pleasant journey.",
    ],
    questions: [
      { q: "Which platform does the train leave from?", options: ["Platform two", "Platform four", "Platform fourteen"], answer: 1 },
      { q: "When does it depart?", options: ["In five minutes", "In fifteen minutes", "At four o'clock"], answer: 0 },
      { q: "What should passengers have ready?", options: ["Their passports", "Their tickets", "Their luggage"], answer: 1 },
    ],
  },

  // ── B1 (more) ──
  {
    id: "restaurant-booking",
    title: "Booking a table",
    level: "B1",
    lines: [
      "A: Good evening, Bella Cucina, how can I help?",
      "B: Hi, I'd like to book a table for four, please.",
      "A: Of course. What day were you thinking of?",
      "B: Saturday, around eight, if possible.",
      "A: Eight is fully booked, I'm afraid, but I could do half past eight.",
      "B: That works. Thank you!",
    ],
    questions: [
      { q: "How many people is the table for?", options: ["Two", "Four", "Eight"], answer: 1 },
      { q: "What time do they finally agree on?", options: ["8:00", "8:30", "9:00"], answer: 1 },
      { q: "Why not eight o'clock?", options: ["It's too early", "It's fully booked", "The kitchen is closed"], answer: 1 },
    ],
  },
  {
    id: "gym-cancel",
    title: "Cancelling a membership",
    level: "B1",
    lines: [
      "A: Hello, I'd like to cancel my gym membership.",
      "B: I'm sorry to hear that. May I ask why?",
      "A: I'm moving to another city next month.",
      "B: I understand. There's a 30-day notice period, so it ends in November.",
      "A: That's fine. Do I need to do anything else?",
      "B: No, that's all. You'll get a confirmation email.",
    ],
    questions: [
      { q: "Why is the customer cancelling?", options: ["It's too expensive", "She's moving city", "She's unhappy with it"], answer: 1 },
      { q: "When will the membership end?", options: ["Immediately", "In November", "Next year"], answer: 1 },
      { q: "What will the customer receive?", options: ["A refund", "A confirmation email", "A phone call"], answer: 1 },
    ],
  },

  // ── B2 (more) ──
  {
    id: "sleep-podcast",
    title: "A podcast on sleep",
    level: "B2",
    lines: [
      "Welcome back to the show. Today we're talking about sleep.",
      "Most adults need between seven and nine hours, but it's not just about quantity.",
      "The timing matters too: going to bed at roughly the same time each night helps your body settle into a rhythm.",
      "So if you're always tired, look at your schedule before reaching for more coffee.",
    ],
    questions: [
      { q: "How many hours do most adults need?", options: ["Five to six", "Seven to nine", "Ten to twelve"], answer: 1 },
      { q: "What else matters besides quantity?", options: ["The room temperature", "Consistent timing", "The mattress brand"], answer: 1 },
      { q: "What does the speaker suggest checking first?", options: ["Your schedule", "Your diet", "Your phone"], answer: 0 },
    ],
  },

  // ── C1 (more) ──
  {
    id: "interview-weakness",
    title: "An interview answer",
    level: "C1",
    lines: [
      "A: So, what would you say is your biggest weakness?",
      "B: Honestly, I used to take on too much and struggle to delegate.",
      "A: And how have you addressed that?",
      "B: I've learned to trust my team and hand over tasks earlier, which has actually made the whole project run more smoothly.",
      "A: That's a thoughtful answer. Thank you.",
    ],
    questions: [
      { q: "What was the candidate's weakness?", options: ["Being late", "Taking on too much and not delegating", "Poor communication"], answer: 1 },
      { q: "How did they address it?", options: ["By working longer hours", "By trusting the team and delegating earlier", "By changing jobs"], answer: 1 },
      { q: "What was the result?", options: ["The project ran more smoothly", "They got promoted", "Nothing changed"], answer: 0 },
    ],
  },
];
