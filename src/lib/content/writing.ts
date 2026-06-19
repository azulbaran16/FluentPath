// Writing prompts with a model answer and a self-assessment checklist.
// Real AI correction arrives with the tutor; until then learners
// self-check against the model and the rubric.

export interface WritingPrompt {
  id: string;
  title: string;
  level: "A2" | "B1" | "B2" | "C1";
  task: string;
  /** target length range, in words */
  minWords: number;
  maxWords: number;
  checklist: string[];
  model: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
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
    id: "opinion",
    title: "Give your opinion",
    level: "C1",
    task: "Write a short opinion paragraph: ‘Is social media good or bad for society?’ Take a position and support it with at least two reasons.",
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
      "While social media is often blamed for many of society's problems, I believe its overall impact is positive. First, it connects people across distances that would have been impossible a generation ago, allowing families and communities to stay close. Moreover, it gives a voice to individuals and movements that traditional media often ignored. It is true that misinformation spreads quickly online; however, the solution lies in better education and regulation, not in abandoning a tool that has democratized communication. On balance, social media is what we make of it.",
  },
];
