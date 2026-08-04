// The words the volume deck passes over, each declared with a reason.
//
// WHY THIS FILE EXISTS AT ALL. The whole justification for the volume tier is
// frequency coverage: the deck is worth building because it walks the New
// General Service List from the top, not because it holds five hundred nice
// words. Without a register, "which words" quietly stops being an NGSL decision
// and becomes an authoring convenience — five hundred cards drift towards the
// words that are easy to write an example for, and the coverage claim that
// justifies the phase stops being true with nothing failing. Silent
// cherry-picking is the failure mode; this file is the thing that makes it
// impossible to do silently.
//
// THE GATE. scripts/verify-scenario-content.mts asserts (plan 02) that for
// every rank below the deepest rank the deck has reached, the headword is
// EITHER in the deck OR in this register with a non-empty reason. So skipping a
// word costs one line here, and skipping one without saying so fails.
//
// THE REASONS ARE A CLOSED VOCABULARY — three of them, and adding a fourth is a
// decision, not a convenience:
//
//   "function-word"
//     A closed-class grammatical word — article, pronoun, preposition,
//     conjunction, determiner, quantifier, modal, auxiliary, negator, or a
//     degree/focus/discourse particle. A recall card is front, back and one
//     example: it teaches LEXICAL meaning. A closed-class word's difficulty is
//     grammatical, and this app teaches grammar in /skill/grammar and in the
//     scenario grammar banks, where it can actually be drilled.
//     The line this draws, and it is drawn on purpose: temporal and manner
//     adverbs (`now`, `then`, `well`) are lexical and ARE carded; degree and
//     focus particles (`very`, `just`, `so`) are not.
//
//   "already-taught"
//     The word already has a card in a scenario vocabulary bank. The volume
//     tier is breadth; repeating a word that already has a register note and a
//     scenario around it would be strictly worse than the card that exists.
//
//   "no-base-form-example"
//     The word's own form cannot appear in a natural example — `go` in a
//     sentence that needs `went`. The harness's inflection matcher admits
//     house/houses and run/running and REFUSES go/went, deliberately: a card
//     whose example never shows the headword's own form teaches the word by
//     assertion. This register is that rule's escape hatch, which is why the
//     matcher must never be widened instead.
//
// No React, no hooks, no path aliases: this module is imported by
// scripts/verify-scenario-content.mts under `node --experimental-strip-types`
// AND BY NOTHING ELSE. It is harness input, not app content, so it never enters
// a client bundle — plan 02 asserts that from source rather than trusting it.

export type SkipReason =
  | "function-word"
  | "already-taught"
  | "no-base-form-example";

export interface SkippedHeadword {
  /** the NGSL headword, lowercase, exactly as the committed list spells it */
  word: string;
  reason: SkipReason;
}

/**
 * Ordered by NGSL rank, ascending — the same order the bank uses, so the two
 * files read as one walk down the list rather than as two unrelated sets.
 */
export const SKIPPED_HEADWORDS: SkippedHeadword[] = [
  { word: "the", reason: "function-word" }, // article
  // The copula, and the clearest case for the rule. Its Spanish difficulty is
  // ser vs estar: one English word, two Spanish verbs, chosen by grammar. A
  // card reading "be → ser / estar" would teach a learner nothing about which.
  { word: "be", reason: "function-word" },
  { word: "and", reason: "function-word" }, // conjunction
  { word: "of", reason: "function-word" }, // preposition
  { word: "to", reason: "function-word" }, // preposition / infinitive marker
  { word: "a", reason: "function-word" }, // article
  { word: "in", reason: "function-word" }, // preposition
  { word: "it", reason: "function-word" }, // pronoun
  { word: "you", reason: "function-word" }, // pronoun
  { word: "he", reason: "function-word" }, // pronoun
  { word: "for", reason: "function-word" }, // preposition
  { word: "they", reason: "function-word" }, // pronoun
  { word: "not", reason: "function-word" }, // negator
  { word: "that", reason: "function-word" }, // determiner / complementiser
  { word: "we", reason: "function-word" }, // pronoun
  { word: "on", reason: "function-word" }, // preposition
  { word: "with", reason: "function-word" }, // preposition
  { word: "this", reason: "function-word" }, // determiner
  { word: "i", reason: "function-word" }, // pronoun
  // Also a lexical verb, but its lexical sense is "hacer", which `make`
  // (rank 48) carries as a card. The frequency that puts it at rank 21 is the
  // auxiliary's, and the auxiliary is grammar.
  { word: "do", reason: "function-word" },
  { word: "as", reason: "function-word" }, // preposition / conjunction
  { word: "at", reason: "function-word" }, // preposition
  { word: "she", reason: "function-word" }, // pronoun
  { word: "but", reason: "function-word" }, // conjunction
  { word: "from", reason: "function-word" }, // preposition
  { word: "by", reason: "function-word" }, // preposition
  { word: "will", reason: "function-word" }, // modal
  { word: "or", reason: "function-word" }, // conjunction
  { word: "so", reason: "function-word" }, // degree particle / conjunction
  { word: "all", reason: "function-word" }, // quantifier
  { word: "if", reason: "function-word" }, // conjunction
  { word: "one", reason: "function-word" }, // numeral / pronoun
  { word: "would", reason: "function-word" }, // modal
  { word: "about", reason: "function-word" }, // preposition
  { word: "can", reason: "function-word" }, // modal
  { word: "which", reason: "function-word" }, // determiner / relative pronoun
  { word: "there", reason: "function-word" }, // existential / deictic
  { word: "more", reason: "function-word" }, // comparative marker / quantifier
  { word: "who", reason: "function-word" }, // pronoun
  { word: "when", reason: "function-word" }, // interrogative / conjunction
  { word: "what", reason: "function-word" }, // interrogative
  { word: "up", reason: "function-word" }, // particle / preposition
  { word: "some", reason: "function-word" }, // determiner
  { word: "other", reason: "function-word" }, // determiner
  { word: "out", reason: "function-word" }, // particle / preposition
  { word: "no", reason: "function-word" }, // negator / determiner
  // The deck browser's "daily" deck happens to hold this one too, but that is
  // not why it is skipped: it is a conjunction, and the reason recorded has to
  // be the real one or the register stops meaning anything.
  { word: "because", reason: "function-word" },
  { word: "very", reason: "function-word" }, // degree intensifier
  // A focus/discourse particle whose senses — only, exactly, recently, simply —
  // do not survive a single gloss, which is what a volume card has room for.
  { word: "just", reason: "function-word" },
  { word: "could", reason: "function-word" }, // modal
  { word: "than", reason: "function-word" }, // comparative conjunction
];
