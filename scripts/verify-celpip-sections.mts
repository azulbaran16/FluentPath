// Executable proof that the /celpip landing cannot overclaim.
//
//   node --experimental-strip-types scripts/verify-celpip-sections.mts
//
// Same posture as scripts/verify-merge.mts, verify-schema.mts and
// verify-headers.mts: no test runner and no new dependency. The import carries
// an explicit .ts extension because path aliases (and extensionless relative
// specifiers) only resolve inside the bundler — src/lib/celpip.ts imports its
// own bank modules the same way for the same reason.
//
// Node prints a MODULE_TYPELESS_PACKAGE_JSON warning on stderr while loading a
// .ts file from a package with no "type" field. Expected noise, not a failure —
// this script's verdict is its exit code, never its stderr.
//
// WHY THIS FILE EXISTS. Phase 2.1 authors CELPIP content across a dozen plans
// against a fixed exam date, and any of them may be dropped for the calendar.
// The landing therefore DERIVES what it claims from the banks rather than
// stating it: a section is offered when its bank exports at least one item and
// reported as not-yet-available when it exports none, and the coverage line is
// assembled from counts the code can see. That derivation is the mechanism
// behind ROADMAP criterion 5 ("honest about anything still missing"), and
// nothing else in the build would notice if a later edit quietly replaced it
// with a hard-coded claim. The learner has an exam date; an overclaim here
// costs her real preparation time.
//
// Every assertion below is about a DERIVED property. If one of them fails,
// fix the registry — never weaken the assertion.

import {
  CELPIP_SECTIONS,
  CELPIP_SPEAKING_SHAPES,
  CELPIP_TASKS,
  SPEAKING_PROMPTS,
  availableSections,
  getSection,
  pendingSections,
  type CelpipSection,
  type CelpipSkill,
} from "../src/lib/celpip.ts";

/* ------------------------------------------------------------------ *
 * Harness (mirrors scripts/verify-headers.mts)
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

function group(name: string) {
  console.log(`· ${name}`);
}

function itemsOf(section: CelpipSection) {
  return section.groups.flatMap((g) => g.items);
}

function need(skill: CelpipSkill): CelpipSection {
  const found = getSection(skill);
  if (!found) {
    console.error(`FAIL  the registry has no ${skill} section at all`);
    process.exit(1);
  }
  return found;
}

/* ------------------------------------------------------------------ *
 * Availability is derived from bank CONTENTS, never declared.
 * ------------------------------------------------------------------ */

group("availability follows the banks");

ok("every skill has exactly one section", CELPIP_SECTIONS.length === 4);
ok(
  "the four skills are registered once each",
  new Set(CELPIP_SECTIONS.map((s) => s.skill)).size === 4,
);

for (const section of CELPIP_SECTIONS) {
  const items = itemsOf(section);
  const label = section.skill;

  ok(
    `${label}: available if and only if it has at least one item`,
    section.coverage.available === items.length > 0,
    `available=${section.coverage.available} items=${items.length}`,
  );
  ok(
    `${label}: no empty group survives into the registry`,
    section.groups.every((g) => g.items.length > 0),
  );
  ok(
    `${label}: the route prefix is the skill's own`,
    section.routePrefix === `/celpip/${label}`,
    section.routePrefix,
  );
  ok(
    `${label}: a coverage summary exists if and only if the section ships`,
    section.coverage.available
      ? section.coverage.summary.length > 0
      : section.coverage.summary === "",
    JSON.stringify(section.coverage.summary),
  );
  ok(
    `${label}: a caveat is never shown for a section that does not ship`,
    section.coverage.available || section.coverage.caveat === undefined,
  );
  ok(
    `${label}: every item carries an id, title, summary, timing and icon`,
    items.every(
      (i) =>
        i.id.length > 0 &&
        i.title.length > 0 &&
        i.summary.length > 0 &&
        i.timing.length > 0 &&
        i.icon.length > 0,
    ),
  );
  ok(
    `${label}: a blurb describes the section whether or not it ships`,
    section.blurb.length > 0 && section.label.length > 0,
  );
}

/* ------------------------------------------------------------------ *
 * The coverage line is assembled from counts, not typed as prose.
 * ------------------------------------------------------------------ */

group("coverage counts come from the banks");

const writing = need("writing");
const speaking = need("speaking");

ok(
  "writing offers exactly the writing bank",
  itemsOf(writing).length === CELPIP_TASKS.length,
  `${itemsOf(writing).length} vs ${CELPIP_TASKS.length}`,
);
ok(
  "the writing coverage line carries the real prompt count",
  writing.coverage.summary.includes(String(CELPIP_TASKS.length)),
  writing.coverage.summary,
);
ok(
  "writing keeps its two exam task groups, and only those",
  writing.groups
    .map((g) => g.key)
    .sort()
    .join(",") === "email,survey",
);

ok(
  "speaking offers exactly the prompt bank",
  itemsOf(speaking).length === SPEAKING_PROMPTS.length,
);
ok("the exam's eight speaking shapes are listed once each", CELPIP_SPEAKING_SHAPES.length === 8);
ok(
  "no duplicate speaking shape",
  new Set(CELPIP_SPEAKING_SHAPES).size === CELPIP_SPEAKING_SHAPES.length,
);

const distinctShapes = new Set(SPEAKING_PROMPTS.map((p) => p.shape)).size;
const claim = /covering (\d+) of the (\d+)/.exec(speaking.coverage.summary);
ok("the speaking coverage line reports shapes out of shapes", claim !== null, speaking.coverage.summary);
ok(
  "the speaking coverage line claims no more shapes than the bank holds",
  claim !== null && Number(claim[1]) === distinctShapes,
  `claims ${claim?.[1]}, bank holds ${distinctShapes}`,
);
ok(
  "the speaking denominator is the full set of exam shapes",
  claim !== null && Number(claim[2]) === CELPIP_SPEAKING_SHAPES.length,
);

/* ------------------------------------------------------------------ *
 * Ids and helpers.
 * ------------------------------------------------------------------ */

group("ids and lookups");

const allIds = CELPIP_SECTIONS.flatMap((s) => itemsOf(s).map((i) => i.id));
ok(
  "no item id is reused across sections (they share one href space)",
  new Set(allIds).size === allIds.length,
);

ok(
  "available and pending partition the registry",
  availableSections().length + pendingSections().length === CELPIP_SECTIONS.length &&
    availableSections().every((s) => s.coverage.available) &&
    pendingSections().every((s) => !s.coverage.available),
);
ok(
  "getSection resolves every registered skill to its own entry",
  CELPIP_SECTIONS.every((s) => getSection(s.skill) === s),
);
ok("getSection of a non-skill is undefined", getSection("nope" as never) === undefined);

// Reported, never asserted: which sections ship is the phase's moving part,
// and an assertion on it would fail for most of the phase and get disabled
// rather than fixed — which is how a gate becomes decoration.
console.log(
  `  ships now: ${availableSections().map((s) => s.label).join(", ") || "(none)"}`,
);
console.log(
  `  not yet:   ${pendingSections().map((s) => s.label).join(", ") || "(none)"}`,
);

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-celpip-sections: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-celpip-sections: all ${checks} assertions passed.`);
