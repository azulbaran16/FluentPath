/**
 * verify-removed-cards.mts — a REMOVED CARD MUST BE A DECLARED RETIREMENT.
 *
 * ------------------------------------------------------------------
 * WHY THIS FILE EXISTS, AND WHAT IT REPLACES.
 * ------------------------------------------------------------------
 * Every authoring plan in phase 04.1 carried a "removed-line check" in its own
 * `<verify>` block: a shell one-liner that exited non-zero if the diff removed
 * any non-comment line from the bank or the skip register. It had two defects
 * and BOTH were latent rather than fixed when the phase's last authoring plan
 * finished — 04.1-06 recorded them in those words, and added the sentence this
 * file is written to answer: *a check that happens not to fire is not a check
 * that works.*
 *
 *   (a) IT FIRES ON A LEGITIMATE RETIREMENT. 04.1-05 retired `vocab:color` on
 *       an explicit user decision, which necessarily removes one card line —
 *       and the check failed, correctly by its own wording and wrongly by the
 *       project's. The plan authorising the deletion had to explain a red check
 *       in prose, which is exactly how a real deletion eventually gets waved
 *       through.
 *
 *   (b) IT FIRES ON A SEMICOLON. Appending `| "cognate"` to the `SkipReason`
 *       union moves the semicolon off the previous member, so
 *       `- | "no-base-form-example";` reads as a removed non-comment line. Not
 *       one entry was deleted. A check whose failures need prose to tell real
 *       from formatting is a check people learn to skim.
 *
 * THE RULE THE OLD CHECK WAS REACHING FOR is not "no line was removed". It is:
 *
 *     A REMOVED CARD MUST HAVE A MATCHING HAND-DECLARED ENTRY IN THE FIXTURE'S
 *     `retired` LIST, WITH A REASON.
 *
 * That is the actual one-way-door rule from AGENTS.md, it is decidable, it
 * PASSES on a correct retirement instead of failing on one, and it is immune to
 * formatting because it compares parsed RECORDS rather than raw lines.
 *
 * ------------------------------------------------------------------
 * RELATIONSHIP TO verify-id-stability.mts — they are not the same check.
 * ------------------------------------------------------------------
 * The id gate asserts the same rule over the FIXTURE: an id in the fixture and
 * absent from the banks must be declared retired. That fires only once the
 * fixture and the tree disagree, and `--update` is the thing that makes them
 * agree again. This runs over the DIFF, before any regeneration, and answers a
 * question the id gate cannot: *was this deletion intended by a human, or did
 * an edit eat a line?* It is a pre-commit check, which is why it takes a git
 * ref and is not one of the nine.
 *
 * ------------------------------------------------------------------
 * USAGE
 * ------------------------------------------------------------------
 *   node --experimental-strip-types scripts/verify-removed-cards.mts [baseRef]
 *
 * `baseRef` defaults to HEAD, so with no argument it checks the working tree
 * against the last commit — the question an author actually has. Pass an
 * earlier ref to check a whole batch or a whole phase.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BANK = "src/lib/content/core-vocabulary.ts";
const SKIPS = "src/lib/content/core-vocabulary-skips.ts";
const FIXTURE = "scripts/fixtures/scheduled-item-ids.json";
const VOCAB_PREFIX = "vocab:";

const baseRef = process.argv[2] ?? "HEAD";

let checks = 0;
let failures = 0;
function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

/** A file's contents at a ref, or "" if it did not exist there. */
function atRef(ref: string, path: string): string {
  try {
    return execFileSync("git", ["show", `${ref}:${path}`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

/** The bank's card slugs, parsed from the one call that builds a card. The
 *  slug is the FIRST argument of `card(...)`, which is the stored key's tail. */
function cardSlugs(source: string): string[] {
  return [...source.matchAll(/(?:^|\n)\s*card\(\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** The skip register's entries as `word:reason` RECORDS, not lines. This is
 *  what makes defect (b) impossible: the `SkipReason` union, the imports, the
 *  header and every semicolon are outside the parse entirely. */
function skipEntries(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/\{\s*word:\s*"([^"]+)"\s*,\s*reason:\s*"([^"]+)"\s*\}/g)].map(
      (m) => `${m[1]}:${m[2]}`,
    ),
  );
}

const beforeBank = atRef(baseRef, BANK);
const afterBank = readFileSync(BANK, "utf8");
const beforeSkips = atRef(baseRef, SKIPS);
const afterSkips = readFileSync(SKIPS, "utf8");

const fixture = JSON.parse(readFileSync(FIXTURE, "utf8")) as {
  ids: Record<string, string>;
  retired: { id: string; reason: string }[];
};
const retiredById = new Map(fixture.retired.map((r) => [r.id, r.reason]));

console.log(`verify-removed-cards: ${baseRef} → working tree`);

/* ------------------------------------------------------------------ *
 * 1. THE BANK. A card that left must be a declared retirement.
 * ------------------------------------------------------------------ */

if (beforeBank === "") {
  console.log(`  ${BANK} did not exist at ${baseRef} — creation, not an edit; nothing to check`);
} else {
  const before = cardSlugs(beforeBank);
  const after = new Set(cardSlugs(afterBank));

  // A guard on the parser itself. If the `card(` shape ever changes, every
  // slug reads as removed and this file would report a catastrophe that is
  // really a regex going stale — or, far worse, read as ZERO cards and pass
  // everything vacuously. Neither is allowed to happen silently.
  ok(
    "the bank parses: the base ref yields at least one card",
    before.length > 0,
    `parsed 0 cards out of ${BANK} at ${baseRef} — the \`card("slug", …)\` shape changed and this check is now blind. Fix the parser, never the assertion`,
  );
  ok(
    "the bank parses: the working tree yields at least one card",
    after.size > 0,
    `parsed 0 cards out of the working copy of ${BANK} — same blindness, one commit later`,
  );

  const removed = before.filter((slug) => !after.has(slug));
  console.log(
    `  bank: ${before.length} card(s) at ${baseRef}, ${after.size} now, ${removed.length} removed`,
  );

  for (const slug of removed) {
    const id = `${VOCAB_PREFIX}${slug}`;
    const reason = retiredById.get(id);
    ok(
      `the removed card ${id} is declared retired, by hand, with a reason`,
      typeof reason === "string" && reason.trim().length > 0,
      reason === undefined
        ? `${id} left the bank and appears nowhere in ${FIXTURE}'s \`retired\` list. An SRS id is a one-way door: a learner may hold a schedule under this key and there is no migration path. If the deletion is intended, write the retirement by hand WITH ITS REASON before \`--update\` runs — run the other way round, --update refuses. If it is not intended, the line was eaten by an edit and this is the check that exists to say so`
        : `${id} is listed in \`retired\` with an empty reason. The script never invents one; a retirement with no reason is a deletion nobody has to justify`,
    );
    ok(
      `the removed card ${id} is not also still recorded as live`,
      fixture.ids[id] === undefined,
      `${id} is in \`retired\` AND in \`ids\` — the fixture has not been regenerated since the card left, so the id gate will report it too`,
    );
  }

  // The symmetric direction, and it is the one nobody thinks of: a retired id
  // must not quietly come back as a card. AGENTS.md's rule 2 says a retired id
  // may never return; a replacement is a NEW slug.
  for (const [id] of retiredById) {
    if (!id.startsWith(VOCAB_PREFIX)) continue;
    ok(
      `the retired id ${id} has not come back as a card`,
      !after.has(id.slice(VOCAB_PREFIX.length)),
      "a retired id may never be re-emitted — the replacement for a bad card is a new slug of its own, so that a learner's orphaned schedule cannot silently reattach to different content",
    );
  }
}

/* ------------------------------------------------------------------ *
 * 2. THE SKIP REGISTER. Records, never lines — this is defect (b) closed.
 * ------------------------------------------------------------------ */

if (beforeSkips === "") {
  console.log(`  ${SKIPS} did not exist at ${baseRef} — creation, not an edit; nothing to check`);
} else {
  const before = skipEntries(beforeSkips);
  const after = skipEntries(afterSkips);

  ok(
    "the skip register parses: the base ref yields at least one entry",
    before.size > 0,
    `parsed 0 entries out of ${SKIPS} at ${baseRef} — the \`{ word, reason }\` shape changed and this check is now blind`,
  );

  const removed = [...before].filter((entry) => !after.has(entry));
  const reworded = removed.filter((entry) =>
    [...after].some((a) => a.split(":")[0] === entry.split(":")[0]),
  );
  const gone = removed.filter((entry) => !reworded.includes(entry));

  console.log(
    `  skips: ${before.size} entry(ies) at ${baseRef}, ${after.size} now,` +
      ` ${gone.length} removed, ${reworded.length} re-reasoned`,
  );

  ok(
    "no headword left the skip register",
    gone.length === 0,
    `${gone.join(", ")} — below the deepest rank the deck reaches, every headword is a card or a declared skip. A headword that leaves the register without becoming a card is a word passed over in silence, which is the thing this register exists to make impossible. (Note the SHAPE of this check: it compares parsed { word, reason } records, so appending a member to the SkipReason union — which moves a semicolon and reads as a removed line to a diff — is invisible here. That false positive was defect (b).)`,
  );

  // Re-reasoning is legal and is NOT a failure: 04.1-05 declared `cognate` and
  // could have re-classified an earlier skip under it. But it is a content
  // decision, so it is named rather than passed over.
  if (reworded.length > 0) {
    console.log(
      `  re-reasoned (legal, reported): ${reworded
        .map((entry) => {
          const word = entry.split(":")[0];
          const now = [...after].find((a) => a.split(":")[0] === word);
          return `${entry} → ${now}`;
        })
        .join(", ")}`,
    );
  }
}

if (failures > 0) {
  console.error(`\nverify-removed-cards: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-removed-cards: all ${checks} assertions passed.`);
