// Vocabulary written FOR one scenario, keyed `${worldSlug}/${scenarioSlug}` —
// the same keying scenario-lessons.ts established.
//
// Deliberately NOT the deck-browser's shape (src/lib/content/vocabulary.ts):
// that module builds card ids as `${deckId}:${i}` from the array index, so
// inserting a card mid-deck reassigns every later card's id and orphans the
// learner's progress on it. Here the id is authored, and the accessor returns
// `undefined` rather than a fallback, because "this scenario has no vocabulary
// of its own" is a thing the coverage registry has to be able to say.
//
// No React, no hooks, no module-scope clock: scripts/verify-scenario-content.mts
// loads this file under `node --experimental-strip-types`.

export interface ScenarioVocabCard {
  /**
   * Authored slug, unique WITHIN its scenario, never derived from array
   * position — it becomes part of the learner's spaced-repetition key (see
   * `scenarioItemId` in src/lib/review-items.ts). Insert freely; never renumber.
   */
  id: string;
  /** the English word or chunk being learned */
  term: string;
  /** Spanish gloss */
  es: string;
  /** one natural sentence using it */
  example: string;
}

const DECKS: Record<string, ScenarioVocabCard[]> = {
  "social/small-talk": [
    {
      id: "break-the-ice",
      term: "break the ice",
      es: "romper el hielo",
      example: "He told a bad joke to break the ice, and it worked.",
    },
    {
      id: "catch-up",
      term: "catch up",
      es: "ponerse al día",
      example: "We should catch up over coffee — it's been months.",
    },
    {
      id: "small-talk",
      term: "small talk",
      es: "charla trivial",
      example: "I'm fine one-on-one, but I'm terrible at small talk at parties.",
    },
    {
      id: "come-up",
      term: "come up",
      es: "salir a colación (un tema)",
      example: "Your name came up while we were talking about the new team.",
    },
    {
      id: "get-along",
      term: "get along",
      es: "llevarse bien",
      example: "They only met last week, but they get along really well.",
    },
    {
      id: "run-into",
      term: "run into",
      es: "encontrarse por casualidad",
      example: "I ran into an old classmate at the station this morning.",
    },
    {
      id: "how-about-you",
      term: "How about you?",
      es: "¿Y tú?",
      example: "Busy week, but a good one. How about you?",
    },
    {
      id: "no-worries",
      term: "no worries",
      es: "no hay problema",
      example: "No worries — take your time and message me when you're free.",
    },
  ],
};

/**
 * Every key the bank actually holds — see the twin in phrases.ts. Exported for
 * scripts/verify-scenario-content.mts, which uses it to catch a key that names
 * no scenario and would otherwise never be reached by anything.
 */
export function scenarioVocabularyKeys(): string[] {
  return Object.keys(DECKS);
}

/**
 * A scenario's own vocabulary deck, or nothing.
 *
 * `undefined` — never a fallback deck — because the coverage registry decides
 * what the page claims from what this returns, and a total function would make
 * every scenario look covered.
 */
export function getScenarioVocabulary(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioVocabCard[] | undefined {
  return DECKS[`${worldSlug}/${scenarioSlug}`];
}
