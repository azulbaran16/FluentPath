// Graded reading passages with comprehension questions and a glossary.

export interface ReadingQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface Passage {
  id: string;
  title: string;
  level: "A2" | "B1" | "B2" | "C1";
  minutes: number;
  body: string[]; // paragraphs
  glossary: { word: string; meaning: string }[];
  questions: ReadingQuestion[];
}

export const PASSAGES: Passage[] = [
  {
    id: "coffee",
    title: "A Morning Ritual",
    level: "A2",
    minutes: 3,
    body: [
      "Every morning, Maya wakes up at six. Before she does anything else, she makes a cup of coffee. The smell fills the kitchen and helps her feel awake.",
      "She drinks it slowly by the window and watches the street. People walk to work, buses pass, and the city slowly comes alive. For Maya, this quiet moment is the best part of her day.",
    ],
    glossary: [
      { word: "ritual", meaning: "something you do regularly, in the same way" },
      { word: "comes alive", meaning: "becomes busy and full of activity" },
    ],
    questions: [
      {
        q: "What does Maya do first in the morning?",
        options: ["She goes to work", "She makes coffee", "She watches TV"],
        answer: 1,
      },
      {
        q: "Why is the morning special for her?",
        options: ["It's a quiet moment she enjoys", "She meets friends", "She exercises"],
        answer: 0,
      },
    ],
  },
  {
    id: "remote",
    title: "The Rise of Remote Work",
    level: "B1",
    minutes: 4,
    body: [
      "Ten years ago, working from home was unusual. Today, millions of people do it every day. Faster internet and better tools have made it possible to do many jobs from almost anywhere.",
      "Remote work has clear advantages. People save time because they don't travel to an office, and many feel they can focus better at home. Companies can also hire talented people from other cities or countries.",
      "However, it isn't perfect. Some workers miss the social side of an office and find it hard to separate work from their personal life. The best solution, many believe, is a mix of both.",
    ],
    glossary: [
      { word: "remote", meaning: "done from a distance, not in person" },
      { word: "advantages", meaning: "good points, benefits" },
      { word: "separate", meaning: "keep two things apart" },
    ],
    questions: [
      {
        q: "What made remote work possible?",
        options: ["Cheaper offices", "Faster internet and better tools", "Longer holidays"],
        answer: 1,
      },
      {
        q: "What is one disadvantage mentioned?",
        options: ["It's more expensive", "Workers miss the social side", "Internet is slower"],
        answer: 1,
      },
      {
        q: "What solution do many people prefer?",
        options: ["Only working at home", "Only working at the office", "A mix of both"],
        answer: 2,
      },
    ],
  },
  {
    id: "sleep",
    title: "Why We Need Sleep",
    level: "B2",
    minutes: 5,
    body: [
      "We spend about a third of our lives asleep, yet for centuries scientists struggled to explain why. Sleep seemed like wasted time — hours when we could be working or hunting. Recent research, however, suggests the opposite: sleep is when some of the body's most important work takes place.",
      "During deep sleep, the brain consolidates memories, moving them from temporary to long-term storage. It also clears out waste products that build up while we are awake. People who sleep poorly often struggle to concentrate and remember things the next day.",
      "The advice from experts is surprisingly simple. Keep a regular schedule, avoid screens late at night, and treat sleep not as a luxury but as a basic need — as essential as food and water.",
    ],
    glossary: [
      { word: "consolidates", meaning: "makes stronger or more solid" },
      { word: "build up", meaning: "increase gradually over time" },
      { word: "luxury", meaning: "something pleasant but not necessary" },
    ],
    questions: [
      {
        q: "What did scientists once think about sleep?",
        options: ["It was wasted time", "It was dangerous", "It made people stronger"],
        answer: 0,
      },
      {
        q: "What happens during deep sleep?",
        options: ["The brain consolidates memories", "The body grows taller", "We burn most calories"],
        answer: 0,
      },
      {
        q: "What is the experts' main message?",
        options: ["Sleep less to do more", "Sleep is a basic need, not a luxury", "Screens help you sleep"],
        answer: 1,
      },
    ],
  },
];
