// The ONE author of how a recall sitting is divided into batches.
//
// Why this is a module and not four lines inside RecallDeck: Phase 4 (D-03)
// triples two banks, which turns `native/phrasal-verbs` into a 42-card deck.
// `RecallDeck` walks a deck linearly with no pause point, so depth alone would
// have made the experience worse rather than better. The chunking therefore
// gets one author, and the content harness asserts THIS module's properties
// rather than poking at the component — a property proved on a pure function
// stays proved when the component is restyled.
//
// No React, no imports, no path aliases: scripts/verify-scenario-content.mts
// loads this under `node --experimental-strip-types`, where `@/` does not
// resolve and JSX does not run. Same posture as every bank in
// src/lib/content/ and as src/lib/review-items.ts.

/**
 * The most cards a learner is asked to sit through without a rest point.
 *
 * Sixteen is chosen so that every deck in the app on the day this landed —
 * the thirty scenarios Phase 4 never touches, and every `/review` set of
 * sixteen or fewer — still renders as ONE uninterrupted run, exactly as it did
 * before. A deck at or below this number is not a batching case at all; it is
 * the old behaviour, unchanged.
 */
export const RECALL_BATCH_CEILING = 16;

/**
 * Divides a sitting into batches, and is the only place that decides how.
 *
 * The properties, which scripts/verify-scenario-content.mts asserts over
 * synthetic lengths 0–60 AND over all 35 real decks:
 *
 *   - an empty input yields NO batches (not one empty batch);
 *   - an input at or below the ceiling yields exactly ONE batch holding the
 *     whole input, so a short deck is untouched;
 *   - above the ceiling the input is divided into the FEWEST batches that all
 *     fit — `ceil(n / ceiling)` — sized as evenly as the length allows, so the
 *     last batch is never a stub of one or two cards after a full one;
 *   - no batch is empty, none exceeds the ceiling, and concatenating the
 *     batches reproduces the input exactly, in order.
 *
 * Evenness is what the remainder loop below buys: 42 cards at a ceiling of 16
 * is 14 / 14 / 14, not 16 / 16 / 10.
 */
export function recallBatches<T>(
  items: readonly T[],
  ceiling: number = RECALL_BATCH_CEILING,
): T[][] {
  // A non-positive or fractional ceiling would divide by zero or produce
  // fractional sizes. Clamping rather than throwing keeps the function total:
  // a renderer must never be able to crash a learner's deck by passing a bad
  // number, and the harness pins the real ceiling separately.
  const cap = Math.max(1, Math.floor(ceiling));

  if (items.length === 0) return [];
  if (items.length <= cap) return [[...items]];

  const count = Math.ceil(items.length / cap);
  const base = Math.floor(items.length / count);
  // The first `remainder` batches take one extra card each; every batch is
  // therefore `base` or `base + 1` long, which is as even as an integer split
  // can be. `base + 1 <= cap` always holds, because a remainder means
  // `base < items.length / count <= cap`.
  const remainder = items.length % count;

  const batches: T[][] = [];
  let cursor = 0;
  for (let batch = 0; batch < count; batch += 1) {
    const size = base + (batch < remainder ? 1 : 0);
    batches.push([...items.slice(cursor, cursor + size)]);
    cursor += size;
  }
  return batches;
}
