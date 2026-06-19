// Grammar question bank for the interactive quiz.
// Each item: a sentence with a gap, options, the correct index, and why.

export interface GrammarQuestion {
  id: string;
  topic: string;
  prompt: string; // use ___ for the gap
  options: string[];
  answer: number; // index into options
  explain: string;
}

export const GRAMMAR_QUESTIONS: GrammarQuestion[] = [
  {
    id: "g1",
    topic: "Present perfect vs past",
    prompt: "I ___ in London since 2019.",
    options: ["live", "have lived", "lived", "am living"],
    answer: 1,
    explain: "‘Since 2019’ links the past to now → present perfect (have lived).",
  },
  {
    id: "g2",
    topic: "Articles",
    prompt: "She is ___ honest person.",
    options: ["a", "an", "the", "—"],
    answer: 1,
    explain: "‘Honest’ starts with a vowel sound (the h is silent), so we use ‘an’.",
  },
  {
    id: "g3",
    topic: "Prepositions",
    prompt: "I'm really good ___ remembering names.",
    options: ["in", "on", "at", "for"],
    answer: 2,
    explain: "‘Good at + -ing’ is the fixed pattern for skills.",
  },
  {
    id: "g4",
    topic: "Conditionals",
    prompt: "If I ___ more time, I would travel more.",
    options: ["have", "had", "will have", "would have"],
    answer: 1,
    explain: "Second conditional (unreal present): if + past simple, would + verb.",
  },
  {
    id: "g5",
    topic: "Modals",
    prompt: "You ___ smoke in here — it's not allowed.",
    options: ["mustn't", "don't have to", "shouldn't have", "couldn't"],
    answer: 0,
    explain: "‘Mustn't’ = it's prohibited. ‘Don't have to’ would mean it's optional.",
  },
  {
    id: "g6",
    topic: "Reported speech",
    prompt: "He said he ___ tired.",
    options: ["is", "was", "has been", "will be"],
    answer: 1,
    explain: "In reported speech, present (is) usually shifts back to past (was).",
  },
  {
    id: "g7",
    topic: "Gerund vs infinitive",
    prompt: "I look forward to ___ from you.",
    options: ["hear", "hearing", "heard", "be hearing"],
    answer: 1,
    explain: "‘Look forward to’ is followed by -ing (to is a preposition here).",
  },
  {
    id: "g8",
    topic: "Comparatives",
    prompt: "This route is ___ than the other one.",
    options: ["more fast", "faster", "fastest", "more faster"],
    answer: 1,
    explain: "Short adjectives form the comparative with -er: fast → faster.",
  },
  {
    id: "g9",
    topic: "Present perfect",
    prompt: "___ you ever ___ sushi?",
    options: ["Did / eat", "Have / eaten", "Do / eat", "Has / ate"],
    answer: 1,
    explain: "Life experience with ‘ever’ → present perfect: Have you ever eaten…?",
  },
  {
    id: "g10",
    topic: "Future",
    prompt: "Look at those clouds — it ___ rain.",
    options: ["will", "is going to", "rains", "would"],
    answer: 1,
    explain: "Prediction based on present evidence → ‘be going to’.",
  },
  {
    id: "g11",
    topic: "Quantifiers",
    prompt: "There isn't ___ milk left.",
    options: ["many", "much", "a few", "several"],
    answer: 1,
    explain: "Milk is uncountable → ‘much’ (not ‘many’).",
  },
  {
    id: "g12",
    topic: "Relative clauses",
    prompt: "That's the woman ___ helped me.",
    options: ["which", "who", "whom", "where"],
    answer: 1,
    explain: "‘Who’ refers to people as the subject of the clause.",
  },
  {
    id: "g13",
    topic: "Phrasal verbs",
    prompt: "Could you ___ the music? It's too loud.",
    options: ["turn down", "turn up", "turn into", "turn over"],
    answer: 0,
    explain: "‘Turn down’ = lower the volume.",
  },
  {
    id: "g14",
    topic: "Past continuous",
    prompt: "I ___ dinner when the phone rang.",
    options: ["cooked", "was cooking", "have cooked", "cook"],
    answer: 1,
    explain: "Action in progress interrupted by another → past continuous.",
  },
  {
    id: "g15",
    topic: "Used to",
    prompt: "I ___ play tennis, but I stopped years ago.",
    options: ["use to", "used to", "am used to", "was used to"],
    answer: 1,
    explain: "Past habit no longer true → ‘used to + base verb’.",
  },
  {
    id: "g16",
    topic: "Prepositions of time",
    prompt: "The meeting is ___ Monday morning.",
    options: ["in", "at", "on", "by"],
    answer: 2,
    explain: "We use ‘on’ with days and dates: on Monday.",
  },
];
