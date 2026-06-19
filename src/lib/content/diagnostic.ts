// Placement test: questions tagged by CEFR level. The estimate is
// intentionally lightweight and clearly labelled as an estimate.

export type Cefr = "A2" | "B1" | "B2" | "C1";

export interface DiagnosticQuestion {
  id: string;
  level: Cefr;
  prompt: string; // use ___ for the gap
  options: string[];
  answer: number;
}

export const DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: "d1",
    level: "A2",
    prompt: "She ___ to work by bus every day.",
    options: ["go", "goes", "going", "gone"],
    answer: 1,
  },
  {
    id: "d2",
    level: "A2",
    prompt: "There ___ any milk in the fridge.",
    options: ["isn't", "aren't", "don't", "hasn't"],
    answer: 0,
  },
  {
    id: "d3",
    level: "B1",
    prompt: "If it rains tomorrow, we ___ stay home.",
    options: ["would", "will", "are", "did"],
    answer: 1,
  },
  {
    id: "d4",
    level: "B1",
    prompt: "I've lived here ___ five years.",
    options: ["since", "from", "for", "during"],
    answer: 2,
  },
  {
    id: "d5",
    level: "B2",
    prompt: "By the time we arrived, the film ___.",
    options: ["already started", "had already started", "has started", "starts"],
    answer: 1,
  },
  {
    id: "d6",
    level: "B2",
    prompt: "I'd rather you ___ tell anyone about this.",
    options: ["don't", "didn't", "won't", "not"],
    answer: 1,
  },
  {
    id: "d7",
    level: "C1",
    prompt: "___ had I sat down when the phone rang.",
    options: ["No sooner", "Hardly when", "As soon", "Scarcely than"],
    answer: 0,
  },
  {
    id: "d8",
    level: "C1",
    prompt: "She spoke as though she ___ the whole story herself.",
    options: ["witnessed", "had witnessed", "has witnessed", "was witnessing"],
    answer: 1,
  },
];

const RANK: Record<Cefr, number> = { A2: 1, B1: 2, B2: 3, C1: 4 };

/** Estimate a CEFR level from the set of correct question ids. */
export function estimateLevel(correctIds: Set<string>): Cefr {
  let score = 0;
  for (const q of DIAGNOSTIC) {
    if (correctIds.has(q.id)) score += RANK[q.level];
  }
  // max score = 2*(1+2+3+4) = 20
  if (score < 5) return "A2";
  if (score < 11) return "B1";
  if (score < 16) return "B2";
  return "C1";
}
