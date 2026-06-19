// Writing prompts with a model answer and a self-assessment checklist,
// graded A2 → C1. Real AI correction arrives with the tutor; until then
// learners self-check against the model and the rubric.

export type WritingLevel = "A2" | "B1" | "B2" | "C1";

export interface WritingPrompt {
  id: string;
  title: string;
  level: WritingLevel;
  task: string;
  /** target length range, in words */
  minWords: number;
  maxWords: number;
  checklist: string[];
  model: string;
}

export const WRITING_LEVELS: WritingLevel[] = ["A2", "B1", "B2", "C1"];

export const WRITING_PROMPTS: WritingPrompt[] = [
  // ───────── A2 ─────────
  {
    id: "text-friend",
    title: "Text a friend to make plans",
    level: "A2",
    task: "Write a short message to a friend. Invite them to do something this weekend, say when and where, and ask them to reply.",
    minWords: 25,
    maxWords: 50,
    checklist: [
      "A friendly greeting (Hi / Hey + name)",
      "What you want to do",
      "When and where",
      "A question asking them to reply",
    ],
    model:
      "Hey Sam!\n\nDo you want to see a film on Saturday afternoon? There's a new one at the cinema in the centre. We could meet at 4 outside the door. Let me know if you can come!\n\nSee you,\nAlex",
  },
  {
    id: "describe-place",
    title: "Describe where you live",
    level: "A2",
    task: "Write a short paragraph describing your town or neighbourhood: what it's like, what you can do there, and whether you like it.",
    minWords: 40,
    maxWords: 70,
    checklist: [
      "Say where it is and what it's like",
      "Mention two or three things you can do there",
      "Use 'there is / there are'",
      "Say if you like living there and why",
    ],
    model:
      "I live in a small town near the mountains. It's quiet and friendly. There is a nice park, a few cafés and a cinema. At the weekend, I usually walk in the hills or meet my friends in the square. I like living here because it's calm and the people are kind.",
  },

  // ───────── B1 ─────────
  {
    id: "intro-email",
    title: "Introduce yourself to a new team",
    level: "B1",
    task: "You just joined a new company. Write a short email to your team introducing yourself: your role, a little about your background, and that you're happy to be there.",
    minWords: 50,
    maxWords: 90,
    checklist: [
      "A clear subject line",
      "A friendly greeting (Hi team, / Hello everyone,)",
      "Your name and role",
      "One sentence about your background",
      "A warm closing (Looking forward to…, Best,)",
    ],
    model:
      "Subject: Hello from the new designer!\n\nHi team,\n\nMy name is Andrés and I've just joined as a product designer. I previously worked in healthcare software for five years, where I focused on making complex tools easier to use. I'm really excited to be here and to get to know all of you. Please feel free to reach out anytime.\n\nLooking forward to working together,\nAndrés",
  },
  {
    id: "review",
    title: "Write a review",
    level: "B1",
    task: "Write a short review of a film, restaurant or place you know. Say what it was, what you liked or didn't like, and whether you recommend it.",
    minWords: 60,
    maxWords: 100,
    checklist: [
      "Say what you are reviewing",
      "Give at least two specific details (good or bad)",
      "Use adjectives and linking words (because, however)",
      "End with a recommendation and a rating",
    ],
    model:
      "Last weekend I tried a small Italian restaurant called Da Marco. The pasta was fresh and the service was friendly, although we had to wait a little for a table. I especially loved the dessert — the tiramisu was the best I've ever had. It isn't cheap, but the quality is worth it. I'd definitely recommend it: 4 out of 5.",
  },

  // ───────── B2 ─────────
  {
    id: "complaint",
    title: "A polite complaint",
    level: "B2",
    task: "You ordered a product online and it arrived damaged. Write an email to customer support describing the problem and asking for a replacement or refund — firm but polite.",
    minWords: 60,
    maxWords: 110,
    checklist: [
      "State your order number / what you bought",
      "Describe the problem clearly and factually",
      "Say what you want (replacement or refund)",
      "Stay polite — no insults or threats",
      "A clear closing with your name",
    ],
    model:
      "Subject: Damaged item — order #48213\n\nDear Support team,\n\nI'm writing about order #48213, which arrived yesterday. Unfortunately, the screen of the device was cracked when I opened the box, even though the packaging looked intact.\n\nI've attached photos for reference. Could you please arrange a replacement, or a full refund if that isn't possible? I'd appreciate your help in resolving this quickly.\n\nThank you for your time,\nAndrés",
  },
  {
    id: "narrative",
    title: "Tell a story",
    level: "B2",
    task: "Write a short story that begins with the sentence: 'It was a decision I would never forget.' Set the scene, build to a key moment, and finish with how you felt.",
    minWords: 90,
    maxWords: 150,
    checklist: [
      "Start with the given sentence",
      "Use past tenses, including past continuous and past perfect",
      "Include some descriptive detail (setting, feelings)",
      "Have a clear turning point",
      "A satisfying ending",
    ],
    model:
      "It was a decision I would never forget. I had been offered a job abroad, and the plane left the next morning. That evening, I was walking by the river where I had grown up, trying to imagine a life somewhere else. The water moved slowly, indifferent to my doubts. By the time I reached home, I had made up my mind: I would go. Years later, I still remember that walk as the moment my real life began.",
  },

  // ───────── C1 ─────────
  {
    id: "opinion",
    title: "Give your opinion",
    level: "C1",
    task: "Write a short opinion paragraph: 'Is social media good or bad for society?' Take a position and support it with at least two reasons.",
    minWords: 80,
    maxWords: 140,
    checklist: [
      "A clear thesis (your position) in the first sentence",
      "At least two supporting reasons",
      "Linking words (however, moreover, on the other hand)",
      "A concluding sentence that restates your view",
      "Varied vocabulary, not repetitive",
    ],
    model:
      "While social media is often blamed for many of society's problems, I believe its overall impact is positive. First, it connects people across distances that would have been impossible a generation ago, allowing families and communities to stay close. Moreover, it gives a voice to individuals and movements that traditional media often ignored. It is true that misinformation spreads quickly online; however, the solution lies in better education and regulation, not in abandoning a tool that has democratised communication. On balance, social media is what we make of it.",
  },
  {
    id: "essay-pros-cons",
    title: "Advantages & disadvantages essay",
    level: "C1",
    task: "Write a balanced essay on: 'Working from home: advantages and disadvantages.' Cover both sides, then give your own view in the conclusion.",
    minWords: 120,
    maxWords: 200,
    checklist: [
      "An introduction that frames the topic",
      "One paragraph for advantages, one for disadvantages",
      "Cohesive devices (firstly, on the other hand, in contrast)",
      "A conclusion with your own balanced view",
      "Formal register throughout",
    ],
    model:
      "Remote work has become a permanent feature of modern professional life, and opinions on it remain divided.\n\nOn the one hand, the advantages are considerable. Employees save hours otherwise lost to commuting, enjoy greater flexibility, and often report higher productivity in a calmer environment. Employers, in turn, can recruit talent regardless of location.\n\nOn the other hand, there are real drawbacks. The boundary between work and personal life can blur, isolation may affect motivation, and spontaneous collaboration is harder to replicate online.\n\nIn my view, neither extreme is ideal. A hybrid model, combining the focus of home with the connection of the office, offers the most sustainable balance for both individuals and organisations.",
  },
  {
    id: "cover-letter",
    title: "A cover letter",
    level: "C1",
    task: "Write a concise cover letter for a job you'd like. Explain why you're a strong fit and what you'd bring, in a confident but professional tone.",
    minWords: 110,
    maxWords: 180,
    checklist: [
      "A professional opening and the role you're applying for",
      "Why you're a strong fit (specific skills/experience)",
      "What value you would add",
      "A confident, courteous closing with a call to action",
      "No spelling or tone slips — keep it formal",
    ],
    model:
      "Dear Hiring Manager,\n\nI am writing to apply for the Product Designer position at Northwind. With six years' experience designing software for regulated industries, I have learned to turn complex requirements into interfaces people actually enjoy using.\n\nIn my current role, I led the redesign of a clinical tool that cut task-completion time by a third and reduced support tickets significantly. I believe that same blend of user empathy and rigour would translate well to your team's ambitions.\n\nI would welcome the opportunity to discuss how I could contribute. Thank you for your consideration.\n\nKind regards,\nAndrés Zulbaran",
  },
];

// "Learn" step for writing: short, practical guides.
export interface WritingGuide {
  id: string;
  title: string;
  points: string[];
}

export const WRITING_GUIDES: WritingGuide[] = [
  {
    id: "email-structure",
    title: "Structure of an email",
    points: [
      "Subject line: short and specific ('Damaged item — order #48213').",
      "Greeting: Hi team, / Dear Mr Lee, (formal) — match the tone.",
      "Opening line: say why you're writing in one sentence.",
      "Body: one idea per paragraph; keep it scannable.",
      "Closing: a clear next step + sign-off (Best, / Kind regards,).",
    ],
  },
  {
    id: "formal-informal",
    title: "Formal vs informal",
    points: [
      "Informal: contractions (I'm, don't), phrasal verbs, 'Hi/Hey', exclamation marks.",
      "Formal: full forms (I am), precise verbs (request, require), 'Dear…', no slang.",
      "Avoid 'gonna/wanna' and emojis in formal writing.",
      "When unsure, lean slightly more formal — it's safer.",
    ],
  },
  {
    id: "linking-words",
    title: "Linking words that level you up",
    points: [
      "Adding: moreover, in addition, furthermore.",
      "Contrast: however, on the other hand, whereas, despite + noun.",
      "Result: therefore, as a result, consequently.",
      "Examples: for instance, such as, in particular.",
      "Don't overuse them — one good linker beats three weak ones.",
    ],
  },
  {
    id: "opinion-structure",
    title: "Structuring an opinion / essay",
    points: [
      "Open with your position (thesis) in the first sentence.",
      "Give 2–3 reasons, each in its own paragraph, with an example.",
      "Acknowledge the other side ('It is true that…, however…').",
      "Conclude by restating your view — don't add new ideas.",
    ],
  },
];
