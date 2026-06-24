// Sentence-building drills: tap the word tiles in the right order.
// `words` is the CORRECT order; the UI shuffles them for the learner.
// Hands-on practice of word order, a common stumbling block for Spanish speakers.

export type SentenceLevel = "A2" | "B1" | "B2" | "C1";

export interface SentenceDrill {
  id: string;
  level: SentenceLevel;
  /** the correct word order */
  words: string[];
  /** short hint shown above (often the Spanish meaning) */
  hint: string;
}

export const SENTENCE_DRILLS: SentenceDrill[] = [
  { id: "s1", level: "A2", words: ["I", "would", "like", "a", "coffee", "please"], hint: "Pedir un café con cortesía" },
  { id: "s2", level: "A2", words: ["What", "time", "does", "the", "train", "leave"], hint: "Preguntar la hora del tren" },
  { id: "s3", level: "A2", words: ["She", "doesn't", "live", "here", "anymore"], hint: "Ella ya no vive aquí" },
  { id: "s4", level: "A2", words: ["Can", "you", "help", "me", "find", "the", "exit"], hint: "Pedir ayuda para salir" },
  { id: "s5", level: "B1", words: ["I've", "been", "learning", "English", "for", "two", "years"], hint: "Llevo dos años aprendiendo" },
  { id: "s6", level: "B1", words: ["If", "I", "were", "you", "I", "would", "apply"], hint: "Dar un consejo (2nd conditional)" },
  { id: "s7", level: "B1", words: ["The", "meeting", "has", "been", "moved", "to", "Friday"], hint: "La reunión se movió (passive)" },
  { id: "s8", level: "B1", words: ["I", "wish", "I", "had", "studied", "harder"], hint: "Arrepentimiento sobre el pasado" },
  { id: "s9", level: "B2", words: ["By", "the", "time", "we", "arrived", "it", "had", "started"], hint: "Past perfect en contexto" },
  { id: "s10", level: "B2", words: ["I'd", "rather", "you", "didn't", "mention", "it"], hint: "Preferencia educada" },
  { id: "s11", level: "B2", words: ["Not", "only", "is", "she", "smart", "but", "also", "kind"], hint: "Inversión enfática" },
  { id: "s12", level: "C1", words: ["Had", "I", "known", "earlier", "I", "would", "have", "called"], hint: "Inversión del 3rd conditional" },
];
