// Executable proof of the CELPIP speech driver.
//
//   node --experimental-strip-types scripts/verify-celpip-speech.mts
//
// Same posture as the other five verification scripts: plain node, no test
// runner, no new dependency, `.mts`, explicit `.ts` import extensions because
// path aliases only resolve inside the bundler.
//
// WHY THIS SCRIPT EXISTS. `src/lib/celpip-speech.ts` encodes four rules that are
// invisible to the compiler, invisible to lint, and invisible in a desktop
// browser — they only show up on an iPhone, on Android, or on a script long
// enough to hit Chrome's truncation point. Every one of them is the kind of rule
// a later editor "simplifies" in good faith:
//
//   1. Every utterance is queued synchronously inside ONE call. iOS Safari
//      rejects a `speak()` that is not part of a user gesture, and a call
//      chained from a previous utterance's `onend` is not part of one. Chaining
//      is the obvious refactor and it silently breaks the whole section on the
//      one device the learner is most likely to practise on.
//   2. `onCompleted` is attached to the LAST utterance and nowhere else. Under
//      D-05 that callback is the only thing allowed to reveal the questions, so
//      attaching it to every utterance would show them after the first line.
//   3. A deliberate `cancel()` is not reported as a failure. The engine raises
//      an error on every queued utterance when cancelled, so a driver that does
//      not filter it shows the learner a fault every time she leaves the page.
//   4. Hiding the page stops playback and SAYS SO. Safari can wedge its
//      synthesizer when backgrounded mid-utterance; pretending playback carried
//      on would leave her answering questions on audio she never heard.
//
// The engine below is a mock, deliberately. A real `speechSynthesis` cannot be
// asserted against in CI, and the properties above are about what this module
// hands the engine, not about what the engine then does with it.
//
// If an assertion here exposes a real defect, fix the module — never weaken the
// assertion.

/* ------------------------------------------------------------------ *
 * Harness (mirrors scripts/verify-merge.mts)
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (!condition) {
    failures += 1;
    console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
  }
}

function group(name: string) {
  console.log(`\n· ${name}`);
}

/* ------------------------------------------------------------------ *
 * The mock engine.
 *
 * Modelled on the real one where it matters: `speak` enqueues, `cancel`
 * empties the queue AND raises `error: "canceled"` on everything it
 * dropped — which is exactly the behaviour rule 3 above exists for.
 * ------------------------------------------------------------------ */

interface FakeVoice {
  name: string;
  lang: string;
}

interface FakeUtteranceShape {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  voice: FakeVoice | undefined;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

class FakeUtterance implements FakeUtteranceShape {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  voice: FakeVoice | undefined = undefined;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

interface FakeEngine {
  speakCalls: number;
  cancelCalls: number;
  queue: FakeUtteranceShape[];
  getVoices: () => FakeVoice[];
  speak: (u: FakeUtteranceShape) => void;
  cancel: () => void;
  addEventListener: (type: string, fn: () => void) => void;
  removeEventListener: (type: string) => void;
}

interface Installed {
  engine: FakeEngine;
  docListeners: Map<string, () => void>;
}

const globals = globalThis as unknown as Record<string, unknown>;

function install(voiceNames: string[] = []): Installed {
  const queue: FakeUtteranceShape[] = [];
  const engineListeners = new Map<string, () => void>();
  const engine: FakeEngine = {
    speakCalls: 0,
    cancelCalls: 0,
    queue,
    getVoices: () => voiceNames.map((name) => ({ name, lang: "en-US" })),
    speak(u) {
      engine.speakCalls += 1;
      queue.push(u);
    },
    cancel() {
      engine.cancelCalls += 1;
      const dropped = [...queue];
      queue.length = 0;
      for (const u of dropped) u.onerror?.({ error: "canceled" });
    },
    addEventListener: (type, fn) => engineListeners.set(type, fn),
    removeEventListener: (type) => engineListeners.delete(type),
  };
  const docListeners = new Map<string, () => void>();
  globals.window = { speechSynthesis: engine };
  globals.SpeechSynthesisUtterance = FakeUtterance;
  globals.document = {
    visibilityState: "visible",
    addEventListener: (type: string, fn: () => void) => docListeners.set(type, fn),
    removeEventListener: (type: string) => docListeners.delete(type),
  };
  return { engine, docListeners };
}

function setVisibility(state: "visible" | "hidden") {
  (globals.document as { visibilityState: string }).visibilityState = state;
}

// The globals have to exist BEFORE the module is evaluated, so this is a
// dynamic import rather than a static one.
install();
const { cancelSpeech, planVoices, speakTurns, speechSupported } = await import(
  "../src/lib/celpip-speech.ts"
);

const TURNS = [
  { speaker: "Fern", text: "First line." },
  { speaker: "Owen", text: "Second line." },
  { speaker: "Fern", text: "Third line." },
];

/* ------------------------------------------------------------------ *
 * 1. The iOS gesture rule, and the Chrome truncation rule — one shape
 *    solving both.
 * ------------------------------------------------------------------ */

group("queueing — every utterance inside one synchronous call (iOS), one per turn (Chrome)");
{
  const { engine } = install(["Voice A", "Voice B"]);
  const queued = speakTurns(TURNS);
  ok("speakTurns reports that it queued", queued === true);
  ok(
    "EVERY utterance reached speak() inside the one call — nothing is chained from onend",
    engine.speakCalls === 3,
    `speak() called ${engine.speakCalls} times, expected 3`,
  );
  ok("cancel() ran first, before any of them", engine.cancelCalls === 1);
  ok(
    "one utterance per speaker turn, never one joined string",
    engine.queue.map((u) => u.text).join("|") === "First line.|Second line.|Third line.",
    engine.queue.map((u) => u.text).join("|"),
  );
  ok(
    "every utterance carries the app's shared lang and rate",
    engine.queue.every((u) => u.lang === "en-US" && u.rate === 0.95),
  );
  cancelSpeech();
}

/* ------------------------------------------------------------------ *
 * 2. Voices are a preference, never a requirement.
 * ------------------------------------------------------------------ */

group("voices — a preference, never a requirement");
{
  const { engine } = install(["Zoe", "Adam", "Mia"]);
  speakTurns(TURNS, { voices: engine.getVoices() as unknown as SpeechSynthesisVoice[] });
  const [u1, u2, u3] = engine.queue;
  ok("two distinct speakers get two distinct voices", u1.voice?.name !== u2.voice?.name);
  ok("the same speaker gets the same voice every time", u1.voice?.name === u3.voice?.name);
  ok(
    "assignment is deterministic — sorted by name, so an unstable getVoices() order cannot change it",
    u1.voice?.name === "Adam",
    `got ${String(u1.voice?.name)}`,
  );
  ok("with enough voices, no pitch offset is applied", engine.queue.every((u) => u.pitch === 1));
  cancelSpeech();
}
{
  const { engine } = install();
  speakTurns(TURNS, { voices: [] });
  ok("with NO voices at all, playback still happens", engine.speakCalls === 3);
  ok("no utterance is given a voice", engine.queue.every((u) => u.voice === undefined));
  const pitches = engine.queue.map((u) => u.pitch);
  ok(
    "and the two speakers are distinguished by a pitch offset instead",
    pitches[0] !== pitches[1],
    JSON.stringify(pitches),
  );
  ok("the same speaker keeps the same pitch", pitches[0] === pitches[2]);
  cancelSpeech();
}
{
  const { engine } = install(["Only One"]);
  speakTurns(TURNS, { voices: engine.getVoices() as unknown as SpeechSynthesisVoice[] });
  ok(
    "one voice for two speakers falls through to pitch rather than voicing them identically",
    engine.queue[0].pitch !== engine.queue[1].pitch,
  );
  cancelSpeech();
}
{
  const plan = planVoices(["Fern", "Owen", "Fern"], []);
  ok("planVoices returns one entry per DISTINCT speaker", plan.size === 2);
  ok("an empty speaker name is not given a voice slot", planVoices(["", "Fern"], []).size === 1);
}
{
  // FOUND BY MUTATION. A turn whose speaker name is empty gets NO entry in the
  // plan at all, so `plan.get(...)` is undefined — and every assertion above
  // passed with `assigned!.voice!` in place of `assigned?.voice`, because in a
  // mock a voice of `undefined` looks identical to no voice. On a real engine
  // that dereference throws, and it throws inside the click handler, so the
  // learner gets silence with no error state and — under D-05 — no questions
  // either. A narrator part authored without a speaker label is exactly how
  // this arrives.
  const { engine } = install(["Zoe", "Adam"]);
  let threw = false;
  let queued = false;
  try {
    queued = speakTurns(
      [
        { speaker: "", text: "An unlabelled narrator line." },
        { speaker: "Fern", text: "And a labelled one." },
      ],
      { voices: engine.getVoices() as unknown as SpeechSynthesisVoice[] },
    );
  } catch {
    threw = true;
  }
  ok("a turn with no speaker label does not throw", !threw);
  ok("it still plays", queued === true && engine.speakCalls === 2);
  ok(
    "the unlabelled turn simply gets the browser default",
    engine.queue[0].voice === undefined && engine.queue[0].pitch === 1,
  );
  ok("and its labelled neighbour is still voiced", engine.queue[1].voice !== undefined);
  cancelSpeech();
}

/* ------------------------------------------------------------------ *
 * 3. D-05 — the last utterance's onend is the ONLY completion signal.
 * ------------------------------------------------------------------ */

group("D-05 — only the last utterance may reveal the questions");
{
  const { engine } = install();
  let started = 0;
  let completed = 0;
  const failed: string[] = [];
  speakTurns(TURNS, {
    onStarted: () => (started += 1),
    onCompleted: () => (completed += 1),
    onFailed: (r) => failed.push(r),
  });
  const [u1, u2, u3] = engine.queue;
  ok(
    "only the FIRST utterance reports started",
    typeof u1.onstart === "function" && u2.onstart === null && u3.onstart === null,
  );
  ok(
    "only the LAST utterance carries onend",
    u1.onend === null && u2.onend === null && typeof u3.onend === "function",
  );
  u1.onstart?.();
  ok("started fires once", started === 1);
  u1.onend?.();
  u2.onend?.();
  ok("finishing a MIDDLE utterance does not reveal the questions", completed === 0);
  u3.onend?.();
  ok("finishing the last one does", completed === 1);
  u3.onend?.();
  ok("and a duplicate onend cannot reveal them twice", completed === 1);
  ok("nothing was reported as a failure", failed.length === 0, JSON.stringify(failed));
}

/* ------------------------------------------------------------------ *
 * 4. A deliberate cancel is not a failure; a real error is.
 * ------------------------------------------------------------------ */

group("cancel vs failure — the engine errors on every cancelled utterance");
{
  const { engine } = install();
  let completed = 0;
  const failed: string[] = [];
  speakTurns(TURNS, { onCompleted: () => (completed += 1), onFailed: (r) => failed.push(r) });
  cancelSpeech();
  ok("cancelSpeech cancels the engine", engine.cancelCalls === 2);
  ok(
    "a deliberate cancel reports NO failure, even though the engine errored on all three",
    failed.length === 0,
    JSON.stringify(failed),
  );
  ok("and reports no completion either", completed === 0);
}
{
  const { engine } = install();
  const failed: string[] = [];
  speakTurns(TURNS, { onFailed: (r) => failed.push(r) });
  engine.queue[1].onerror?.({ error: "synthesis-failed" });
  ok("a real engine error IS reported", failed.length === 1 && failed[0] === "engine", JSON.stringify(failed));
  engine.queue[2].onerror?.({ error: "synthesis-failed" });
  ok("and reported once, not once per queued utterance", failed.length === 1);
  cancelSpeech();
}

/* ------------------------------------------------------------------ *
 * 5. Backgrounding — cancel and say so, never pretend.
 * ------------------------------------------------------------------ */

group("backgrounding — Safari can wedge mid-utterance, so this stops and says so");
{
  const { engine, docListeners } = install();
  const failed: string[] = [];
  let completed = 0;
  speakTurns(TURNS, { onCompleted: () => (completed += 1), onFailed: (r) => failed.push(r) });
  ok("a visibilitychange listener is installed for the duration", docListeners.has("visibilitychange"));
  setVisibility("hidden");
  docListeners.get("visibilitychange")?.();
  ok("hiding the page cancels rather than pretending playback continued", engine.cancelCalls === 2);
  ok("and reports it as interrupted", failed.length === 1 && failed[0] === "interrupted", JSON.stringify(failed));
  ok("the listener is removed once settled", !docListeners.has("visibilitychange"));
  engine.queue[2]?.onend?.();
  ok("a late onend cannot then reveal the questions", completed === 0);
}
{
  const { engine, docListeners } = install();
  const failed: string[] = [];
  speakTurns(TURNS, { onFailed: (r) => failed.push(r) });
  setVisibility("visible");
  docListeners.get("visibilitychange")?.();
  ok("a visibilitychange back to VISIBLE is not an interruption", failed.length === 0);
  ok("and does not cancel", engine.cancelCalls === 1);
  cancelSpeech();
}
{
  const { engine, docListeners } = install();
  speakTurns(TURNS);
  engine.queue[2].onend?.();
  ok("completing normally removes the visibility listener too", !docListeners.has("visibilitychange"));
}

/* ------------------------------------------------------------------ *
 * 6. Nothing to say, and nothing to say it with.
 * ------------------------------------------------------------------ */

group("degenerate input and no engine at all");
{
  install();
  ok("an empty turn list is refused", speakTurns([]) === false);
  ok("whitespace-only turns are refused", speakTurns([{ speaker: "A", text: "   " }]) === false);
}
{
  const { engine } = install();
  speakTurns([
    { speaker: "A", text: "  " },
    { speaker: "B", text: "real" },
  ]);
  ok("an empty turn is skipped but its neighbours still play", engine.speakCalls === 1);
  ok(
    "and the last SPOKEN turn is the one carrying onend",
    typeof engine.queue[0].onend === "function",
  );
  cancelSpeech();
}
{
  globals.window = {};
  const failed: string[] = [];
  ok("with no engine, speakTurns refuses", speakTurns(TURNS, { onFailed: (r) => failed.push(r) }) === false);
  ok("and says why, rather than going quiet", failed[0] === "unsupported");
  ok("speechSupported agrees", speechSupported() === false);
  let threw = false;
  try {
    cancelSpeech();
  } catch {
    threw = true;
  }
  ok("cancelSpeech with no engine does not throw", !threw);
}

/* ------------------------------------------------------------------ *
 * 7. Restarting — the previous playback must not fire late.
 * ------------------------------------------------------------------ */

group("restart — a stale playback cannot complete over the top of a new one");
{
  const { engine } = install();
  let firstCompleted = 0;
  let secondCompleted = 0;
  speakTurns(TURNS, { onCompleted: () => (firstCompleted += 1) });
  const firstQueue = [...engine.queue];
  speakTurns(TURNS, { onCompleted: () => (secondCompleted += 1) });
  firstQueue[2].onend?.();
  ok("the first playback's onend cannot complete after a restart", firstCompleted === 0);
  engine.queue[engine.queue.length - 1].onend?.();
  ok("but the second playback's does", secondCompleted === 1);
  cancelSpeech();
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-celpip-speech: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-celpip-speech: all ${checks} assertions passed.`);
