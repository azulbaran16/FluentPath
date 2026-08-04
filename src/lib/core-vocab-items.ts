// The volume tier's key space: `vocab:<slug>`. Composition, parsing,
// resolution and enumeration, together in one module — and deliberately NOT in
// src/lib/review-items.ts.
//
// ------------------------------------------------------------------
// WHY A SEPARATE MODULE, ARGUED FROM D-05 RATHER THAN AROUND IT.
// ------------------------------------------------------------------
// review-items.ts exists because composition and resolution must not drift: if
// the bank spells an id one way and the review screen reads it another, the
// symptom is an id that is stored, merged and scheduled perfectly and NEVER
// RENDERED. That is D-05, and it is a real argument. But it is an argument that
// a key space keeps its composer and its resolver TOGETHER — not that every key
// space lives in one file. This module keeps them together. It just keeps them
// somewhere else, for two reasons that both cut the same way:
//
//   1. The promise this phase makes is that `parseScenarioItemId` and
//      `resolveReviewItem` are byte-unchanged. In a separate module that is
//      checkable with `git diff --stat`. Inside review-items.ts it would be a
//      matter of care, and a one-way door on live learner data does not get to
//      depend on care.
//   2. The dangerous coupling between the two spaces is a RUNTIME import, in
//      either direction. Separate modules make the absence of that import a
//      source-level fact plan 02 asserts, instead of a property nobody can see.
//
// The only reference to review-items.ts below is a TYPE-ONLY import of
// `RecallItem`, erased at build, so there is no runtime edge. Plan 02 asserts
// that it is type-only rather than trusting the word "type" in this comment.
//
// ------------------------------------------------------------------
// TWO ENUMERATORS, AND WHICH IS WHICH (L1 superseded by L5).
// ------------------------------------------------------------------
// L1 said this bank must be listed in `reviewableIds()`, on the correct general
// rule that a SCORED bank omitted from the shared enumerator has invisible
// cards. L5 supersedes that specific instruction: /review already holds 752
// scenario items earned across Phases 3 and 4, and pouring 500 lower-tier cards
// into the same queue would bury the app's best content within days. So the
// volume deck is a different product on the same engine — the Leitner boxes,
// `recordAttempt` and the `srs` column are all shared; only the QUEUE is not.
//
// This module is therefore the first case in this app where the shared
// enumerator and a bank's own enumerator are two different functions:
//
//   reviewableIds()   — the SHARED queue. What /review counts, drills and
//                       renders. The volume ids are deliberately absent.
//   coreVocabIds()    — this tier's own. What /core-vocabulary counts and
//                       studies, and what the payload gate must measure,
//                       because these ids absolutely do reach Postgres.
//
// The cost of confusing them is symmetric and worth stating rather than
// rediscovering: put the volume ids in the shared enumerator and they flood
// /review; leave them out of BOTH and the cards are stored, scheduled and
// invisible, which is D-05 again one level up.
//
// And note what is NOT the containment mechanism: `resolveReviewItem` has no
// branch for this space, on purpose. `ReviewView` and `MistakesView` do not
// filter through `reviewableIds()` at all — they resolve every stored id — so a
// resolver branch, not the enumerator, is what would have put volume cards in
// the due list and the mistake notebook. The branch is absent by design.
//
// ------------------------------------------------------------------
// THE `:` IS THE COLLISION PROPERTY — GATED, NOT REMEMBERED.
// ------------------------------------------------------------------
// The way `/` was for the scenario space in Phase 3. But it is narrower than it
// first looks, and the narrow version is the one that bites: the deck browser
// already composes card ids as `${deckId}:${i}` (vocabulary.ts:35-40), so
// `daily:0` exists in this app TODAY. The `vocab:` prefix is safe only because
// no deck in VOCAB_DECKS is named `vocab`. That is a fact to assert, not to
// remember, and plan 02 asserts it against all four existing key spaces.
//
// No React, no hooks, no path aliases: the harness loads this under
// `node --experimental-strip-types`.

import { CORE_VOCABULARY, type CoreVocabCard } from "./content/core-vocabulary.ts";
import { recallBatches } from "./recall-batches.ts";
// TYPE-ONLY, both of them: erased at build, so this module has no runtime edge
// to review-items.ts or to the curriculum. That absence is the containment.
import type { RecallItem } from "./review-items.ts";
import type { Level, Skill } from "./curriculum.ts";

/* ------------------------------------------------------------------ *
 * The tier, said once.
 * ------------------------------------------------------------------ */

/**
 * The topic every volume card records through `recordAttempt`.
 *
 * ONE string for the whole tier, not one per card. `recordAttempt` stores
 * `attempts[id].topic` and `weakTopics()` groups by it, so five hundred topics
 * would give the learner five hundred one-card "weak spots". One string means
 * the tier shows up in /review's weak-spots tab as a single recognisable thing
 * that ReviewHub can point at /core-vocabulary — which is the whole of what
 * that screen is allowed to know about this space.
 */
export const CORE_VOCAB_TOPIC = "Core vocabulary";

/**
 * The chip `RecallDeck` stamps on EVERY card of this tier.
 *
 * Deliberately the same string as the topic, and named separately because the
 * two are different jobs that happen to agree: one is stored progress metadata,
 * the other is what the learner reads. Their agreeing is the point — the pill
 * in the weak-spots tab and the chip on the card say the same words, so a
 * learner is never told she is weak at something she cannot find.
 */
export const CORE_VOCAB_TITLE = CORE_VOCAB_TOPIC;

/**
 * The tier's declared CEFR level — one value for the whole deck.
 *
 * The top of a frequency list is beginner core by construction, so a per-card
 * level would be five hundred guesses dressed as data. It is stored as attempt
 * metadata and is deliberately NOT rendered as a claim on the surface.
 */
export const CORE_VOCAB_LEVEL: Level = "A1";

/**
 * Which skill's XP a rating credits. `reading`, matching the convention the
 * scenario vocabulary already uses (review-items.ts:207) and the deck browser's
 * match game before it — one store, one convention.
 */
export const CORE_VOCAB_XP_SKILL: Skill = "reading";

/* ------------------------------------------------------------------ *
 * The id.
 * ------------------------------------------------------------------ */

/** The prefix that separates this key space from every other one. */
export const CORE_VOCAB_PREFIX = "vocab:";

/**
 * Composes the stored id. NOTHING outside this module spells the format by
 * hand — the same rule `scenarioItemId` holds for the scenario space, and for
 * the same reason: the id is a one-way door on live learner data, so it gets
 * exactly one author.
 *
 * `coreVocabItemId("house")` → `"vocab:house"`
 */
export function coreVocabItemId(slug: string): string {
  return `${CORE_VOCAB_PREFIX}${slug}`;
}

// Slug → card. Built at module scope, which is safe here in a way it would not
// be inside review-items.ts: core-vocabulary.ts imports nothing at all, so
// there is no ESM cycle and no temporal-dead-zone trap of the kind
// scenario-grammar.ts's header describes.
const BY_SLUG: Map<string, CoreVocabCard> = new Map(
  CORE_VOCABULARY.map((c) => [c.id, c]),
);

/**
 * The inverse, and its own parser: no reference to `parseScenarioItemId`, no
 * scenario lookup, no shared code path that could later be "unified".
 *
 * Returns the slug only for exactly `vocab:` + a non-empty slug THE BANK
 * ACTUALLY HOLDS. A well-formed id for a card that has since been retired
 * returns nothing, which is the same answer `resolveReviewItem` gives for a
 * deleted scenario item: the stored `srs` entry stays (the merge cannot delete
 * keys and must not try) and the surface simply skips it.
 */
export function parseCoreVocabItemId(id: string): string | undefined {
  if (!id.startsWith(CORE_VOCAB_PREFIX)) return undefined;
  const slug = id.slice(CORE_VOCAB_PREFIX.length);
  if (!slug) return undefined;
  return BY_SLUG.has(slug) ? slug : undefined;
}

/* ------------------------------------------------------------------ *
 * The deck.
 * ------------------------------------------------------------------ */

function toRecallItem(card: CoreVocabCard): RecallItem {
  return {
    id: coreVocabItemId(card.id),
    // Spanish first, English revealed — the same direction the scenario recall
    // cards use, so a learner who moves between the two tiers is never asked to
    // flip her head around as well as her card.
    front: card.es,
    back: card.word,
    hint: card.example,
    topic: CORE_VOCAB_TOPIC,
    level: CORE_VOCAB_LEVEL,
    xpSkill: CORE_VOCAB_XP_SKILL,
  };
}

/** The whole bank as recall cards, in NGSL rank order. */
export function coreVocabRecallItems(): RecallItem[] {
  return CORE_VOCABULARY.map(toRecallItem);
}

/**
 * One id back into something renderable, or nothing. This tier's own resolver,
 * used by this tier's own surface — `resolveReviewItem` never learns the space
 * exists.
 */
export function resolveCoreVocabItem(id: string): RecallItem | undefined {
  const slug = parseCoreVocabItemId(id);
  if (!slug) return undefined;
  const card = BY_SLUG.get(slug);
  return card ? toRecallItem(card) : undefined;
}

/**
 * Every id this bank can emit — THIS TIER'S ENUMERATOR, not the shared one.
 * See the header: `reviewableIds()` is what /review counts, and these ids are
 * deliberately absent from it. They are, however, exactly the ids that reach
 * the `srs` column, so the payload gate measures this list too (plan 02).
 */
export function coreVocabIds(): string[] {
  return CORE_VOCABULARY.map((c) => coreVocabItemId(c.id));
}

/* ------------------------------------------------------------------ *
 * The bands.
 * ------------------------------------------------------------------ */

/**
 * How many cards a study band holds at most.
 *
 * Larger than `RECALL_BATCH_CEILING` on purpose: a band is a UNIT OF THE DECK
 * the learner chooses from a list, not a sitting she is walked through. Inside
 * a band, `RecallDeck` applies the ceiling again and inserts its own rest
 * points, so choosing 50 here never means fifty cards without a pause.
 */
export const CORE_VOCAB_BAND_SIZE = 50;

/**
 * The deck divided into study bands, in rank order.
 *
 * The split is computed by `recallBatches` and NOT by arithmetic written here.
 * That module is the ONE author of a split in this app; its properties are
 * already asserted over synthetic lengths 0-60 and over all 35 real decks, so a
 * band inherits every one of them for free: no empty band, none over the
 * ceiling, none a stub of two after a full one, and concatenating the bands
 * reproduces the deck exactly, in order. Writing `Math.ceil` here would be
 * re-deriving a proved function unproved.
 *
 * Bands are `RecallItem[][]` rather than `CoreVocabCard[][]` because the
 * surface needs both halves — `item.id` for the learner's own due/met counts
 * and `item.back` for the band's word range — and one shape means the list and
 * the deck it launches cannot disagree about what a band contains.
 */
export function coreVocabBands(): RecallItem[][] {
  return recallBatches(coreVocabRecallItems(), CORE_VOCAB_BAND_SIZE);
}
