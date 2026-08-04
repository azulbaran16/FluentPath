// The VOLUME tier's vocabulary bank — the most frequent words of English,
// walked down the New General Service List from rank 1.
//
// ------------------------------------------------------------------
// THE ABSENT `tip` IS THE DESIGN, NOT AN OMISSION.
// ------------------------------------------------------------------
// A card here is `{ id, word, es, example }` and NOTHING else. There is no
// `tip` field, not even an optional one, and that is deliberate: this project's
// own rule is that an optional field is a field an author forgets, so the
// volume tier's lower quality bar is expressed by the TYPE HAVING NOWHERE TO
// PUT a register note rather than by a convention someone has to remember at
// card four hundred.
//
// So: a word that genuinely needs a register note — who says it, to whom, and
// what getting it wrong costs — does not belong in this file. It belongs in a
// scenario vocabulary bank (src/lib/content/scenario-vocabulary.ts), where the
// card gets a `tip`, a scenario around it, and a place in /review. The next
// author who reaches for `tip` here has found a scenario card, not a missing
// field. Widening this type is how the two tiers become one, and L4 exists to
// stop exactly that.
//
// ------------------------------------------------------------------
// THE ID LOOKS LIKE vocabulary.ts AND IS ITS OPPOSITE.
// ------------------------------------------------------------------
// The deck browser (src/lib/content/vocabulary.ts:35-40) builds card ids as
// `${deckId}:${i}` — from the card's ARRAY POSITION. Insert a card mid-deck
// there and every later card is renumbered, which orphans the learner's stored
// progress on all of them with no migration path and no way to detect it.
//
// Here the id is derived from the card's own CONTENT, by ONE slugifier in ONE
// place (`slug` below). A word does not move when a neighbour is inserted, and
// it cannot silently duplicate because plan 02 asserts no word repeats in the
// deck. So the rule is: INSERT FREELY, NEVER RENAME. Changing a card's `word`
// under a live id re-points a permanent Postgres key; the replacement for a bad
// card is always to retire its id and add a new one, exactly as AGENTS.md's
// one-way-door rule says, and scripts/verify-id-stability.mts makes it
// detectable by hashing the WHOLE record — so rewriting an `example` under a
// live id fails too.
//
// The stored key is NOT this `id`. This `id` is the SLUG; the key the learner's
// `srs` column holds is `vocab:${slug}`, composed by `coreVocabItemId` in
// src/lib/core-vocab-items.ts and spelled nowhere else in the app.
//
// ------------------------------------------------------------------
// ORDER AND PROVENANCE.
// ------------------------------------------------------------------
// The bank is ordered by NGSL rank, ASCENDING. Plan 02 asserts it, and the
// order is what gives the study bands on /core-vocabulary their meaning: band 1
// is the most frequent words in the language, not an arbitrary first fifty.
//
// Which words is answered by scripts/fixtures/ngsl-headwords.tsv (NGSL 1.2,
// CC BY-SA 4.0, Browne/Culligan/Phillips — full attribution in that file's
// header) and by nothing else. A word passed over is declared in
// core-vocabulary-skips.ts with a reason. The list contributes NO PROSE: every
// `es` and every `example` below is original, written for this project.
//
// No React, no hooks, no path aliases: the harness loads this under
// `node --experimental-strip-types`.

export interface CoreVocabCard {
  /**
   * Authored slug, derived from `word` by `slug()` below and by nothing else.
   * It becomes part of a permanent spaced-repetition key — see
   * `coreVocabItemId` in src/lib/core-vocab-items.ts. Never renumbered, never
   * renamed.
   */
  id: string;
  /** the English headword, exactly as the NGSL spells it */
  word: string;
  /** Spanish gloss — a translation a learner would recognise, never the word */
  es: string;
  /** one sentence somebody would actually say, containing the word */
  example: string;
}

/**
 * The ONE slugifier. A card's id is a function of its `word` and of nothing
 * else — not of its position, not of its band, not of the order it was written
 * in — so inserting a card cannot disturb any other card's stored key.
 */
function slug(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** One card, one line. The helper exists so the bank reads as a word list. */
function card(word: string, es: string, example: string): CoreVocabCard {
  return { id: slug(word), word, es, example };
}

/**
 * The volume deck, in NGSL rank order.
 *
 * Twenty cards as of plan 04.1-01 — the tracer batch, reaching rank 71. They
 * are real cards held to the volume bar, not placeholders: every `es` is a
 * natural Spanish gloss and never the English word, and every `example` is a
 * sentence somebody would say, contains the word and runs at least six words.
 *
 * The examples' OPENINGS are varied on purpose. Plan 02 gates a frame-diversity
 * ceiling — no two-word opening shape above ~5 % of the deck and no single
 * opening word above ~20 % — because at five hundred cards nobody is going to
 * read them all, and five hundred sentences that all begin "I have a…" pass
 * every other check perfectly and are exactly what "flat" means.
 */
export const CORE_VOCABULARY: CoreVocabCard[] = [
  // rank 8
  card("have", "tener", "Do you have a minute before the meeting?"),
  // rank 30
  card("say", "decir", "She didn't say anything about the change."),
  // rank 31
  card("go", "ir", "We usually go swimming early on Saturday mornings."),
  // rank 41
  card("know", "saber / conocer", "Nobody seems to know where the keys are."),
  // rank 43
  card("get", "conseguir / obtener", "Where can I get a decent coffee around here?"),
  // rank 45
  card("like", "gustar", "My daughter likes cold weather more than I do."),
  // rank 47
  card("think", "pensar / creer", "Let me think about it until tomorrow."),
  // rank 48
  card("make", "hacer", "Could you make a copy of this form?"),
  // rank 49
  card("time", "tiempo / vez", "There isn't enough time to finish today."),
  // rank 50
  card("see", "ver", "From here you can see the whole valley."),
  // rank 56
  card("good", "bueno", "That was a really good film, actually."),
  // rank 57
  card("people", "gente / personas", "Too many people were waiting at the counter."),
  // rank 58
  card("year", "año", "Prices have gone up twice this year."),
  // rank 59
  card("take", "llevar / tomar", "It'll take about twenty minutes by bus."),
  // rank 61
  card("well", "bien", "She sings remarkably well for her age."),
  // rank 65
  card("come", "venir", "Come to the front desk when you're ready."),
  // rank 67
  card("work", "trabajo / trabajar", "His work starts at six in the morning."),
  // rank 68
  card("use", "usar", "Can I use your phone for a second?"),
  // rank 70
  card("now", "ahora", "Right now the office is completely empty."),
  // rank 71
  card("then", "entonces / luego", "Finish the form, then hand it to reception."),
];
