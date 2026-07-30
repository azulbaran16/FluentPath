// Read-only audit of the live User.progress rows against the Phase 02 contract.
//
// Why this exists: research refused to assume that every progress blob already
// stored in production survives the new schema. If one does not, safeReadProgress
// returns the empty state and merge-on-write then replaces the row with
// EMPTY merged into whatever that browser happened to hold — permanent loss for a
// real learner. This checks that assumption against the rows production actually
// holds, before the branch merges (merging to `main` is the deploy).
//
// It only ever runs SELECT. It never writes, and it never prints a connection string.
//
// Run:  node --experimental-strip-types scripts/audit-stored-progress.mts
// Reads DATABASE_URL from .env.production.local, falling back to the environment.
//
// NOTE: it must NOT select "celpipProgress". Production does not have that column
// until this branch merges, so naming it would fail the whole query. The column's
// absence is proven separately by the schema diff in 02-05.

import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { safeReadProgress, EMPTY, progressSchema } from "../src/lib/progress-schema.ts";

const ENV_FILE = ".env.production.local";

function loadUrl(): string {
  if (existsSync(ENV_FILE)) {
    const raw = readFileSync(ENV_FILE, "utf8");
    const m = raw.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m);
    if (m) return m[1];
  }
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  console.error(
    `No production DATABASE_URL found.\n` +
      `Create ${ENV_FILE} with a single line:\n` +
      `  DATABASE_URL="postgresql://…"\n` +
      `(the value from Coolify -> FluentPath -> Environment Variables).`,
  );
  process.exit(2);
}

/** Fields whose loss would be visible to a learner. */
const TRACKED = [
  "completed",
  "xp",
  "skillXp",
  "streak",
  "lastActive",
  "level",
  "srs",
  "vocab",
  "attempts",
  "todayXp",
  "xpDay",
  "goalXp",
] as const;

function size(v: unknown): number {
  if (v && typeof v === "object") return Object.keys(v as object).length;
  return v === null || v === undefined ? 0 : 1;
}

const url = loadUrl();
const host = (() => {
  try {
    return new URL(url).host;
  } catch {
    return "(unparseable)";
  }
})();

const prisma = new PrismaClient({ datasources: { db: { url } } });

type Row = { id: string; progress: string | null };

const rows = await prisma.$queryRawUnsafe<Row[]>(
  'SELECT "id", "progress" FROM "User" ORDER BY "createdAt" ASC',
);

console.log(`Audit target host: ${host}`);
console.log(`Rows examined: ${rows.length}\n`);

let empties = 0;
let unreadable = 0;
let lossy = 0;

for (const row of rows) {
  if (row.progress === null || row.progress.trim() === "") {
    empties++;
    continue;
  }

  const parsedOk = (() => {
    try {
      const j = JSON.parse(row.progress);
      return progressSchema.safeParse(j).success ? j : j;
    } catch {
      return null;
    }
  })();

  const read = safeReadProgress(row.progress);
  const fellBack =
    parsedOk === null || JSON.stringify(read) === JSON.stringify(EMPTY);

  if (fellBack) {
    unreadable++;
    console.error(
      `UNREADABLE  user=${row.id}  bytes=${row.progress.length}\n` +
        `            this row would load as the empty state and be overwritten on the next save.\n` +
        `            first 300 chars: ${row.progress.slice(0, 300)}`,
    );
    continue;
  }

  // Field-level shrink check: did the contract silently drop learner data?
  const before = parsedOk as Record<string, unknown>;
  const shrunk: string[] = [];
  for (const f of TRACKED) {
    const a = size(before?.[f]);
    const b = size((read as unknown as Record<string, unknown>)[f]);
    if (a > b) shrunk.push(`${f}: ${a} -> ${b}`);
  }
  if (shrunk.length > 0) {
    lossy++;
    console.error(`LOSSY       user=${row.id}  ${shrunk.join(", ")}`);
  }
}

await prisma.$disconnect();

console.log(`\n--- audit result ---`);
console.log(`  rows total       : ${rows.length}`);
console.log(`  empty / null     : ${empties}   (nothing to lose)`);
console.log(`  unreadable       : ${unreadable}`);
console.log(`  lossy under new  : ${lossy}`);

if (unreadable > 0 || lossy > 0) {
  console.error(
    `\nSTOP. ${unreadable + lossy} row(s) would lose data under the new contract.\n` +
      `Do not merge to main. Widen the schema to accept these shapes first.`,
  );
  process.exit(1);
}

console.log(`\nOK — every stored progress row survives the new contract intact.`);
