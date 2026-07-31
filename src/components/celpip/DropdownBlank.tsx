"use client";

import { Check, X } from "lucide-react";
import type { CelpipReadingBlank } from "@/lib/celpip";

// The CELPIP Reading drop-down blank — a gap inside a piece of prose that the
// learner fills from a short list of options.
//
// WHY THIS IS A COMPONENT OF ITS OWN AND NOT A VARIANT OF THE OPTION LIST.
// This type appears in THREE of the exam's four reading parts (inside the reply
// in Correspondence, the short message in Diagram, and the reader comment in
// Viewpoints) and it is the one learners most often meet cold on the day. Its
// difficulty is specific and it is not vocabulary: the wrong options are
// grammatically fine and only CONTEXTUALLY wrong, so the blank can only be
// answered by reading it against the text around it. That is why it renders
// INSIDE the prose rather than as a numbered question underneath — moving it
// out would remove the very thing being tested.
//
// A NATIVE `select`, DELIBERATELY, AND NOT A CUSTOM LISTBOX. Three reasons and
// they all point the same way: it is keyboard- and screen-reader-correct for
// free (roving focus, type-ahead, the platform's own announcement), it opens as
// the system picker on a phone rather than as a cramped popover, and the exam
// itself uses a drop-down — so this trains the control she will actually meet.
// It also means this section needs no combobox library at all, which is what
// keeps the phase's zero-dependency count honest (T-02.1-SC).
//
// The grading treatment is copied verbatim from the shipped practice room's
// option buttons — the same teal-for-correct and vermilion-for-wrong
// `color-mix` fills, the same check and cross icons, the same
// disabled-after-submit rule — so a learner meets one visual language for
// "right" and "wrong" across the whole app.

export function DropdownBlank({
  blank,
  number,
  value,
  submitted,
  disabled = false,
  onChange,
}: {
  blank: CelpipReadingBlank;
  /** 1-based position in the text, used for the accessible label. */
  number: number;
  /** The chosen option index, or undefined while the blank is still empty. */
  value: number | undefined;
  /** After submission the control locks and the answer key is shown. */
  submitted: boolean;
  /** Locked mid-run — the timer expired and she has not chosen a way out yet. */
  disabled?: boolean;
  onChange: (optionIndex: number | undefined) => void;
}) {
  const right = value === blank.answer;

  let cls = "border-line-strong";
  if (submitted && right)
    cls = "border-teal bg-[color-mix(in_srgb,var(--teal)_10%,transparent)]";
  else if (submitted)
    cls = "border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]";
  else if (value !== undefined) cls = "border-ink";

  return (
    <span className="inline-flex max-w-full flex-col align-top">
      <span className="inline-flex items-center gap-1">
        <select
          // The label names WHICH blank this is. Without it a screen reader
          // announces four unlabelled combo boxes in one paragraph, and the
          // learner has no way to tell which gap she is filling.
          aria-label={`Blank ${number}`}
          value={value === undefined ? "" : String(value)}
          disabled={submitted || disabled}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
          className={`max-w-full rounded-lg border bg-card px-2 py-1 text-sm font-medium text-ink outline-none transition-colors disabled:opacity-100 ${cls}`}
        >
          {/* An empty first option, so an untouched blank reads as untouched
              rather than as a first option she never chose. Submission is never
              blocked on filling it — under exam conditions a blank left blank
              is a real outcome, and it scores as wrong. */}
          <option value="">— choose —</option>
          {blank.options.map((option, index) => (
            <option key={index} value={index}>
              {option}
            </option>
          ))}
        </select>
        {submitted && right && <Check className="h-4 w-4 text-teal" strokeWidth={2.5} />}
        {submitted && !right && <X className="h-4 w-4 text-vermilion" strokeWidth={2.5} />}
      </span>

      {/* The explanation sits with the blank rather than in a list at the foot
          of the text, and that placement is the point: this type's whole
          difficulty is that the option which FELT right was grammatical and
          merely wrong in context, so the reason has to be readable next to the
          sentence that supplies the context. CELPIP-06 requires a per-item
          explanation; on this item type it is doing the most work. */}
      {submitted && (
        <span className="mt-1 block max-w-sm rounded-lg border border-line bg-paper-deep/50 p-2 text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">
            Blank {number}: {blank.options[blank.answer]}
          </span>{" "}
          {value === undefined
            ? "You left this one empty. "
            : right
              ? ""
              : `You chose “${blank.options[value] ?? "—"}”. `}
          {blank.explanation}
        </span>
      )}
    </span>
  );
}
