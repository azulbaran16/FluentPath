"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import {
  getReadingSet,
  readingPartBlanksFirst,
  readingPartItemCount,
  readingPartKindLabel,
  readingSetItemCount,
  readingSetMinutes,
  type CelpipObjectiveQuestion,
  type CelpipReadingBlankText,
  type CelpipReadingDiagram,
  type CelpipReadingPart,
  type CelpipReadingPassage,
  type CelpipReadingSet,
} from "@/lib/celpip";
import { formatDuration, useCelpipProgress } from "@/lib/celpip-progress";
import { DropdownBlank } from "./DropdownBlank";
import { Timer } from "./Timer";

// CELPIP Reading: brief -> one part at a time against its own clock -> results.
//
// THREE THINGS IN HERE ARE LOAD-BEARING and none of them is visible to `tsc`.
//
// 1. THE CLOCK IS ARMED PER PART, NOT ONCE FOR THE SET. The real exam paces
//    Reading part by part — 11 minutes for correspondence, 8 for the diagram, 9
//    for information, 11 for viewpoints — and that is not an implementation
//    detail of the exam, it is what the section trains. A single 39-minute
//    block lets a learner overspend on part 1 and then run out on part 4, which
//    is exactly the failure the per-part allowance exists to prevent her
//    discovering on the day.
//
// 2. SUBMISSION IS NEVER BLOCKED ON COMPLETENESS. The shipped practice room
//    disables its submit button until every question is answered
//    (ReadingRoom.tsx). This deliberately does NOT: the house rule is never to
//    gate on a quality signal — Writing's word count is a flag, not a gate —
//    and under exam conditions an unanswered item is a real outcome, not a
//    mistake to be prevented. Blanks left empty score as wrong and say so.
//
// 3. NOTHING IN PROGRESS IS PERSISTED. The answer sheet lives in React state
//    and only a SUBMITTED result reaches the store. A resumable sheet would
//    need a delete site (it has to clear on submit, or a finished attempt
//    pre-fills the next timed run), and a second deletable map riding the one
//    `updatedAt` this state carries would fight `drafts` for it — bringing back
//    a cleared writing draft, the fca41b7 defect Phase 1 paid for.
//
// Grading is an answer-key comparison over one map covering questions AND
// drop-down blanks, because the two are the same act. Per D-02 no AI is
// involved anywhere here; an answer key is not the automated scoring D-02
// forbids.

type Phase = "brief" | "reading" | "results";
type Mode = "timed" | "practice" | null;

const CARD =
  "rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]";

/**
 * A gradable item, flattened out of whichever shape authored it.
 *
 * A drop-down blank and a comprehension question differ only in what supplies
 * the stem — the surrounding sentence for one, an explicit question for the
 * other. Both are "choose an option index, compare it to a key", so they are
 * scored through ONE list against ONE answers map, and the scoring line below
 * is the same one-line filter the shipped practice room already uses.
 */
interface GradedItem {
  id: string;
  answer: number;
  options: string[];
}

function partItems(part: CelpipReadingPart): GradedItem[] {
  const blanks = (part.blankText?.blanks ?? []).map((blank) => ({
    id: blank.id,
    answer: blank.answer,
    options: blank.options,
  }));
  const questions = part.questions.map((question) => ({
    id: question.id,
    answer: question.answer,
    options: question.options,
  }));
  return [...blanks, ...questions];
}

/**
 * THE SET IS RESOLVED HERE, ON THE CLIENT, FROM AN ID — never handed down from
 * the route as a prop.
 *
 * This looks like an indirection and is not. A prop crossing from a server
 * component into a client one is serialized into the RSC payload, which Next
 * INLINES INTO THE PAGE'S OWN HTML. Plan 05 measured that on the listening
 * route: taking the resolved set as a prop put 41 of its 42 authored strings
 * into the served document, so `View source` handed over the whole answer key.
 * A reading set is worse — it is the answer key AND ~2,500 words of passage.
 *
 * Resolving from the id moves the bank into the client CHUNK instead. That is
 * not secrecy; T-02.1-41 accepts that a determined learner can read the bundle,
 * exactly as she can for the shipped practice rooms. It is the difference
 * between the key being one keystroke away in the page she is looking at and
 * being somewhere in a JavaScript file.
 *
 * No hooks above the guard, so the early return is legal.
 */
export function ReadingRunner({ setId }: { setId: string }) {
  const set = getReadingSet(setId);
  // Unreachable in practice: the route calls notFound() first. Defence for a
  // set dropped from the bank while a learner is on the page.
  if (!set) return null;
  return <SetRunner set={set} />;
}

function SetRunner({ set }: { set: CelpipReadingSet }) {
  const { addReadingAttempt } = useCelpipProgress();

  const items = useMemo(() => set.parts.flatMap(partItems), [set]);
  const totalMinutes = useMemo(() => readingSetMinutes(set), [set]);
  const totalItems = useMemo(() => readingSetItemCount(set), [set]);

  const [phase, setPhase] = useState<Phase>("brief");
  const [mode, setMode] = useState<Mode>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [partIndex, setPartIndex] = useState(0);
  /** Item id -> chosen option index. Question ids and blank ids share it. */
  const [answers, setAnswers] = useState<Record<string, number>>({});
  /** The part whose own clock has run out. Null once she moves on. */
  const [expiredPart, setExpiredPart] = useState<string | null>(null);
  /** Latched for the whole attempt: any part running out marks the result. */
  const [expired, setExpired] = useState(false);
  const [locked, setLocked] = useState(false);
  const [submittedDuration, setSubmittedDuration] = useState(0);

  const finalizedRef = useRef(false);

  const part = set.parts[partIndex];
  const lastPart = partIndex + 1 >= set.parts.length;

  // The countdown runs while a part is on screen and that part's own allowance
  // has not run out. Expiry is one-way per part; moving to the next part arms a
  // fresh clock rather than resuming this one.
  const timerRunning =
    mode !== null && phase === "reading" && part !== undefined && expiredPart !== part.id;

  function start(selected: "timed" | "practice") {
    setMode(selected);
    setStartedAt(Date.now());
    setPhase("reading");
  }

  function handleExpire() {
    if (!part) return;
    setExpiredPart(part.id);
    setExpired(true);
    setLocked(true);
  }

  /** Never discards: the two-way exit out of an expired part is submit-as-is or
   * carry on untimed, and neither throws away a single answer. */
  function continueUntimed() {
    setLocked(false);
  }

  function nextPart() {
    if (lastPart) {
      submit();
      return;
    }
    setPartIndex(partIndex + 1);
    setExpiredPart(null);
    setLocked(false);
  }

  function submit() {
    setSubmittedDuration(startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0);
    finalizedRef.current = false;
    setPhase("results");
  }

  function choose(itemId: string, optionIndex: number | undefined) {
    setAnswers((current) => {
      if (optionIndex === undefined) {
        if (!(itemId in current)) return current;
        const next = { ...current };
        delete next[itemId];
        return next;
      }
      return { ...current, [itemId]: optionIndex };
    });
  }

  // The same one-line filter the shipped practice room scores with, over one
  // list that already holds both item types.
  const correct = items.filter((item) => answers[item.id] === item.answer).length;

  // Recorded once, from every exit path out of the results view, and idempotent
  // across all of them — Phase 1's lesson, copied from the Writing simulator
  // rather than re-derived. NO IN-PROGRESS SHEET GOES IN; only this result.
  function finalizeAttempt() {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    addReadingAttempt(set.id, {
      setId: set.id,
      date: new Date().toISOString(),
      durationSeconds: submittedDuration,
      answers,
      correct,
      total: items.length,
      outOfTime: expired,
    });
  }

  function retry() {
    finalizeAttempt();
    setMode(null);
    setStartedAt(null);
    setPartIndex(0);
    setAnswers({});
    setExpiredPart(null);
    setExpired(false);
    setLocked(false);
    setSubmittedDuration(0);
    finalizedRef.current = false;
    setPhase("brief");
  }

  /* ---------------------------------------------------------------- *
   * Results — every item shows what she chose, what was right, and why.
   * ---------------------------------------------------------------- */

  if (phase === "results") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Attempt complete</h1>
        <p className="mt-2 text-ink-soft">{set.title}</p>

        <p className="mt-3 text-xs text-muted">
          {formatDuration(submittedDuration)} used · {correct} / {items.length} correct
          {expired && (
            <span className="ml-1 font-semibold" style={{ color: "var(--vermilion)" }}>
              · ran out of time on at least one part
            </span>
          )}
        </p>

        {set.parts.map((reviewed, index) => (
          <section key={reviewed.id} className={`${CARD} mt-6`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Part {index + 1} · {readingPartKindLabel(reviewed.kind)} · {reviewed.minutes} min
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">{reviewed.title}</h2>

            {reviewed.passage && <PassageView passage={reviewed.passage} />}
            {reviewed.diagram && <DiagramView diagram={reviewed.diagram} />}
            {/* Same running order as the live part — see `readingPartBlanksFirst`. */}
            {readingPartBlanksFirst(reviewed.kind) && reviewed.blankText && (
              <BlankTextView
                blankText={reviewed.blankText}
                answers={answers}
                submitted
                onChange={choose}
              />
            )}
            {reviewed.questions.length > 0 && (
              <QuestionList
                questions={reviewed.questions}
                answers={answers}
                submitted
                onChange={choose}
              />
            )}
            {!readingPartBlanksFirst(reviewed.kind) && reviewed.blankText && (
              <BlankTextView
                blankText={reviewed.blankText}
                answers={answers}
                submitted
                onChange={choose}
              />
            )}
          </section>
        ))}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={retry}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Try this set again
          </button>
          <Link
            href="/celpip"
            onClick={finalizeAttempt}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Back to tasks
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Brief
   * ---------------------------------------------------------------- */

  if (phase === "brief" || !mode || !part) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          CELPIP · Reading
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{set.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          {set.parts.length} part{set.parts.length === 1 ? "" : "s"} · {totalItems} question
          {totalItems === 1 ? "" : "s"} · {totalMinutes} minutes
        </p>

        <div
          className="mt-5 rounded-xl border p-4"
          style={{
            borderColor: "var(--sky)",
            background: "color-mix(in srgb, var(--sky) 10%, transparent)",
          }}
        >
          <h2 className="font-display text-base font-semibold">How this runs</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>
              <strong>Each part has its own clock</strong>, as the exam does — not one long
              one for the whole set. Overspending early is the mistake this trains against.
            </li>
            <li>
              Some answers are ordinary questions and some are <strong>drop-down blanks</strong>{" "}
              inside the text itself. Both count the same.
            </li>
            <li>
              You move forward through the parts and do not come back, which is how the exam
              works. You can change any answer while you are still on its part.
            </li>
            <li>
              You can move on, or submit, with items left empty. An empty item counts as
              wrong — the same as it would in the exam.
            </li>
            <li>Afterwards you get the answer key with an explanation for every item.</li>
          </ol>
          {set.parts.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              {set.parts
                .map((p, i) => `Part ${i + 1} ${readingPartKindLabel(p.kind)} ${p.minutes} min`)
                .join(" · ")}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => start("timed")}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Start Timed Attempt
          </button>
          <button
            onClick={() => start("practice")}
            className="rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Start Practice
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Practice lets you pause the clock on any part. Everything else is the same.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * The active part
   * ---------------------------------------------------------------- */

  const answeredHere = partItems(part).filter((item) => item.id in answers).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="sticky top-4 z-10 mb-4 flex items-center justify-between gap-4 rounded-xl border border-line bg-card/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <Timer
          // KEYED BY PART, not merely fed a new `totalSeconds`. Timer resets on
          // a CHANGED `totalSeconds`, and two adjacent parts can legitimately
          // share an allowance — the exam's own correspondence and viewpoints
          // parts are both 11 minutes. Relying on the value to change would
          // leave a learner carrying part 3's remaining seconds into part 4 in
          // exactly that case. Remounting cannot be got wrong by an author.
          key={part.id}
          totalSeconds={part.minutes * 60}
          running={timerRunning}
          mode={mode}
          onExpire={handleExpire}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Part {partIndex + 1} of {set.parts.length} · {answeredHere}/
          {readingPartItemCount(part)} answered
        </span>
      </div>

      {locked && (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            borderColor: "var(--vermilion)",
            background: "color-mix(in srgb, var(--vermilion) 10%, transparent)",
          }}
        >
          <h2
            className="font-display text-lg font-semibold"
            style={{ color: "var(--vermilion)" }}
          >
            Time&apos;s up on this part
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Nothing you have answered is lost. Move on to the next part, keep working on this
            one untimed, or submit the whole set now — it&apos;ll be marked as over time.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={nextPart}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-colors"
              style={{ background: "var(--sky)" }}
            >
              {lastPart ? "Submit as-is" : "Go to the next part"}
            </button>
            <button
              onClick={continueUntimed}
              className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
            >
              Continue untimed
            </button>
            {!lastPart && (
              <button
                onClick={submit}
                className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
              >
                Submit the whole set as-is
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {readingPartKindLabel(part.kind)} · {part.minutes} min
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold">{part.title}</h1>
      {part.instructions && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{part.instructions}</p>
      )}

      <section className={`${CARD} mt-4`}>
        {part.passage && <PassageView passage={part.passage} />}
        {part.diagram && <DiagramView diagram={part.diagram} />}
        {/* THE ORDER OF THESE TWO IS PER PART KIND AND IS NOT COSMETIC — see
            `readingPartBlanksFirst` in `../../lib/celpip`. The diagram part
            reads its blanks first; correspondence and viewpoints read their
            questions first, because the blank-bearing reply or comment is
            written to be met AFTER the questions about the text above it. */}
        {readingPartBlanksFirst(part.kind) && part.blankText && (
          <BlankTextView
            blankText={part.blankText}
            answers={answers}
            submitted={false}
            disabled={locked}
            onChange={choose}
          />
        )}
        {part.questions.length > 0 && (
          <QuestionList
            questions={part.questions}
            answers={answers}
            submitted={false}
            disabled={locked}
            onChange={choose}
          />
        )}
        {!readingPartBlanksFirst(part.kind) && part.blankText && (
          <BlankTextView
            blankText={part.blankText}
            answers={answers}
            submitted={false}
            disabled={locked}
            onChange={choose}
          />
        )}
        {readingPartItemCount(part) === 0 && (
          <p className="text-sm text-ink-soft">
            There is nothing to answer on this part. Move on when you are ready.
          </p>
        )}
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* NOT gated on how many items are answered — see the header. */}
        <button
          onClick={nextPart}
          disabled={locked}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          style={{ background: "var(--sky)" }}
        >
          {lastPart ? "Submit answers" : "Next part"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {lastPart
          ? "You can submit with items left empty — an empty item counts as wrong, which is what it would count as in the exam."
          : "Once you move on to the next part you cannot come back to this one. Empty items count as wrong."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The four stimulus renderers.
 *
 * EVERY ONE OF THEM PUTS AUTHORED PROSE THROUGH A REACT TEXT NODE AND
 * NOTHING ELSE. React's raw-HTML escape hatch is prohibited throughout
 * the CELPIP components and a phase gate greps the whole directory for
 * it (T-02.1-36) — the gate is token-literal, so do not name the prop in
 * a comment here either, or the gate fails on the prose about it.
 *
 * The temptation it exists to stop is specific: an author wants a bold
 * run or a line break inside a passage and reaches for a markup string.
 * Formatting is expressed as STRUCTURE instead — paragraphs are arrays
 * of strings, a diagram is rows of cells, and a blank-bearing text is an
 * ordered list of segments. Anything a passage needs to look like, the
 * content types can already say.
 * ------------------------------------------------------------------ */

function PassageView({ passage }: { passage: CelpipReadingPassage }) {
  return (
    <article className="text-[0.95rem] leading-relaxed text-ink-soft">
      {passage.title && (
        <h3 className="font-display text-base font-semibold text-ink">{passage.title}</h3>
      )}
      <div className="mt-2 space-y-3">
        {passage.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {passage.sections?.map((section) => (
        <div key={section.label} className="mt-4">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
            {section.label}
          </h4>
          <div className="mt-1 space-y-2">
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      ))}
    </article>
  );
}

/**
 * The Diagram part's stimulus, from structured data.
 *
 * A real `<table>` with a `<caption>` and `<th scope>` when there are column
 * headers, and a definition list when there are not — so a screen reader gets
 * the row/column relationships the sighted learner gets from the layout. An
 * image with alt text could not carry any of it, which is one of the four
 * reasons this is data rather than an asset.
 */
function DiagramView({ diagram }: { diagram: CelpipReadingDiagram }) {
  return (
    <div className="mt-4 rounded-xl border border-line-strong p-4">
      {diagram.headers && diagram.headers.length > 0 ? (
        <table className="w-full text-left text-sm">
          <caption className="mb-2 text-left font-display text-base font-semibold text-ink">
            {diagram.caption}
          </caption>
          <thead>
            <tr className="border-b border-line-strong">
              {diagram.headers.map((header, index) => (
                <th key={index} scope="col" className="py-1.5 pr-3 font-semibold text-ink">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diagram.rows.map((row) => (
              <tr key={row.label} className="border-b border-line last:border-0">
                <th scope="row" className="py-1.5 pr-3 font-semibold text-ink">
                  {row.label}
                </th>
                {row.cells.map((cell, index) => (
                  <td key={index} className="py-1.5 pr-3 text-ink-soft">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <h3 className="font-display text-base font-semibold text-ink">{diagram.caption}</h3>
          <dl className="mt-2 space-y-1.5 text-sm">
            {diagram.rows.map((row) => (
              <div key={row.label} className="flex flex-wrap gap-2">
                <dt className="font-semibold text-ink">{row.label}</dt>
                <dd className="text-ink-soft">{row.cells.join(" — ")}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {diagram.notes && diagram.notes.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
          {diagram.notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * A blank-bearing text: prose with the selects sitting IN it.
 *
 * Segments are walked into paragraphs, flushing at each `break`, so a blank can
 * never straddle a paragraph boundary. A `blankId` that resolves to nothing
 * renders as a visible marker rather than disappearing: an item the learner
 * never sees is a worse failure than one that looks wrong, because nothing on
 * screen would say so. Plan 09's content harness rejects one at build time.
 */
function BlankTextView({
  blankText,
  answers,
  submitted,
  disabled = false,
  onChange,
}: {
  blankText: CelpipReadingBlankText;
  answers: Record<string, number>;
  submitted: boolean;
  disabled?: boolean;
  onChange: (itemId: string, optionIndex: number | undefined) => void;
}) {
  const paragraphs: React.ReactNode[][] = [[]];
  blankText.segments.forEach((segment, index) => {
    const current = paragraphs[paragraphs.length - 1];
    if (segment.kind === "break") {
      paragraphs.push([]);
      return;
    }
    if (segment.kind === "text") {
      current.push(<span key={index}>{segment.text}</span>);
      return;
    }
    const position = blankText.blanks.findIndex((b) => b.id === segment.blankId);
    const blank = position >= 0 ? blankText.blanks[position] : undefined;
    if (!blank) {
      current.push(
        <span key={index} className="font-semibold text-vermilion">
          [missing blank: {segment.blankId}]
        </span>,
      );
      return;
    }
    current.push(
      <DropdownBlank
        key={index}
        blank={blank}
        number={position + 1}
        value={answers[blank.id]}
        submitted={submitted}
        disabled={disabled}
        onChange={(optionIndex) => onChange(blank.id, optionIndex)}
      />,
    );
  });

  return (
    <div className="mt-5 rounded-xl border border-line-strong p-4">
      {blankText.title && (
        <h3 className="font-display text-base font-semibold text-ink">{blankText.title}</h3>
      )}
      {blankText.intro && blankText.intro.length > 0 && (
        <div className="mt-1 space-y-0.5 text-xs text-muted">
          {blankText.intro.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}
      {/* `leading-loose` in both states, not only after submit: the selects are
          taller than the surrounding text, so a tight leading makes the prose
          around a blank collide with the line above it while she is reading. */}
      <div className="mt-3 space-y-3 text-[0.95rem] leading-loose text-ink-soft">
        {paragraphs.map((nodes, index) =>
          nodes.length === 0 ? null : <p key={index}>{nodes}</p>,
        )}
      </div>
    </div>
  );
}

/**
 * The plain comprehension items — the same option-button treatment, the same
 * class strings and the same disabled-after-submit rule the shipped practice
 * room uses, so "right" and "wrong" look the same everywhere in the app.
 */
function QuestionList({
  questions,
  answers,
  submitted,
  disabled = false,
  onChange,
}: {
  questions: CelpipObjectiveQuestion[];
  answers: Record<string, number>;
  submitted: boolean;
  disabled?: boolean;
  onChange: (itemId: string, optionIndex: number | undefined) => void;
}) {
  return (
    <div className="mt-5 space-y-6">
      {questions.map((question, qi) => {
        const chosen = answers[question.id];
        const right = chosen === question.answer;
        return (
          <div key={question.id}>
            <p className="font-medium text-ink">
              {qi + 1}. {question.stem}
            </p>
            <div className="mt-2 grid gap-2">
              {question.options.map((option, oi) => {
                const picked = chosen === oi;
                const isAnswer = question.answer === oi;
                let cls = "border-line-strong hover:bg-paper-deep";
                if (submitted && isAnswer)
                  cls = "border-teal bg-[color-mix(in_srgb,var(--teal)_10%,transparent)]";
                else if (submitted && picked && !isAnswer)
                  cls =
                    "border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]";
                else if (picked) cls = "border-ink";
                return (
                  <button
                    key={oi}
                    onClick={() => !submitted && !disabled && onChange(question.id, oi)}
                    disabled={submitted || disabled}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                  >
                    {option}
                    {submitted && isAnswer && (
                      <Check className="h-4 w-4 shrink-0 text-teal" strokeWidth={2.5} />
                    )}
                    {submitted && picked && !isAnswer && (
                      <X className="h-4 w-4 shrink-0 text-vermilion" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {chosen === undefined
                  ? "You left this one blank. "
                  : right
                    ? ""
                    : "That was not the answer. "}
                {question.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
