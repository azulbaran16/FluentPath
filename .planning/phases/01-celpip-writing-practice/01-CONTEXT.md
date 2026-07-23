# Phase 1: CELPIP Writing Practice - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning
**Source:** PRD Express Path (docs/plans/2026-07-23-celpip-writing-design.md — approved by user via Superpowers brainstorming)

<domain>
## Phase Boundary

Free CELPIP exam-prep section for FluentPath: a `/celpip` landing plus a Writing simulator for Task 1 (formal email) and Task 2 (survey/opinion response) with real exam conditions (countdown timer, 150–200 word guidance, plain editor), original model answers, and a descriptor-based self-evaluation checklist. Attempt history persists local-first. No AI feedback, no audio, no other exam skills in this phase.

</domain>

<decisions>
## Implementation Decisions

### Audience & positioning
- Product feature visible to all users; the user's sister is the first beta user (has an exam date — this phase is prioritized first in the milestone)
- Entire self-evaluation mode is FREE, honoring the 2026-06-19 decision "free features first, paid AI tutor last"; AI feedback arrives later (tutor phase) as a Pro feature

### Content (locked)
- New module `src/lib/celpip.ts` following the `curriculum.ts` typed-data single-source-of-truth pattern
- Task bank: ~8 Task 1 (formal email: scenario + 3 bullet points to address) and ~8 Task 2 (survey: scenario + option A/B choice), ALL ORIGINAL content with everyday-Canadian themes (work, housing, services, community)
- Each task: `id`, `taskType` (`email`|`survey`), `title`, `scenario`, `bullets`/`options`, `timeLimitMinutes` (27 T1 / 26 T2), `wordRange` {min:150,max:200}, `modelAnswer` (original), `strategyTips` (rewritten: email template, intro/2-bodies/conclusion structure, linkers)
- Self-evaluation rubric derived from CELPIP level descriptors REWRITTEN IN OUR OWN WORDS, dimensions: task fulfillment (bullets covered, tone, salutations), organization (paragraphs, linkers), vocabulary (precision, don't parrot the prompt), grammar & format (sentence variety, length). Yes/no checkable items with short explanations

### IP constraints (locked, hard)
- NO text copied from the third-party academy material ("IELTS&PTEwithViv") or official CELPIP PDFs — format and strategy reference only
- `Celpip.zip` stays gitignored, never committed
- Success criterion: reviewer verifies no third-party text appears in the app

### Routes & UX (locked)
- `/celpip` landing: what CELPIP is, Task 1 / Task 2 card libraries with attempt status, disabled "coming soon" tabs for Speaking/Reading/Listening
- `/celpip/writing/[taskId]` simulator: prompt + bullets/options, countdown timer (pausable in practice mode), word counter with 150–200 range indicator, plain `textarea` editor (faithful to real exam — no rich editor/spellcheck aids)
- Timer expiry: editor locks, offer submit-as-is or continue in untimed mode flagged as out-of-time — NEVER lose text
- Post-submit results (same route, post-submit state): user's text beside model answer, interactive rubric checklist, attempt metrics (time used, words), actions: retry / next task / back
- Draft autosave to localStorage every few seconds
- Design system: existing "Traveler's Journal" (Fraunces + Hanken Grotesk, `globals.css` tokens); no new libraries; responsive with subtle desktop recommendation notice

### Progress (locked)
- Own localStorage namespace (`fluentpath.celpip.v1`) following the `progress.ts` local-first pattern: attempts per task (taskId, date, duration, wordCount, text, checked rubric items), derived completedTasks
- Shape designed serializable/migration-ready for the later Server-Side Progress phase (Phase 2) — do NOT build server persistence in this phase
- Defensive JSON parse (corrupted storage → safe empty default, no crash)

### Claude's Discretion
- Component breakdown, file organization within `src/app/celpip/` and `src/components/`
- Exact visual composition within the existing design system
- Timer implementation details (requestAnimationFrame vs interval, drift handling)
- How rubric explanations are worded (must be original text)
- Exact task topics within the everyday-Canadian constraint
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & requirements
- `docs/plans/2026-07-23-celpip-writing-design.md` — approved design spec for this phase (authoritative)
- `.planning/REQUIREMENTS.md` — CELPIP-01..05 definitions
- `.planning/ROADMAP.md` — Phase 1 goal & success criteria

### Codebase patterns to follow
- `src/lib/curriculum.ts` — typed-data content module pattern to mirror in `src/lib/celpip.ts`
- `src/lib/progress.ts` — local-first progress pattern to mirror for CELPIP attempts
- `src/app/globals.css` — design tokens ("Traveler's Journal")
- `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md` — code style, architecture, layout

</canonical_refs>

<specifics>
## Specific Ideas

- Task 1 format reference (factual, from exam format): formal email, "Dear Sir or Madam" opening, purpose-first paragraph, one paragraph per bullet point, context-referencing closing, "Yours sincerely, Full Name"
- Task 2 format reference (factual): intro (paraphrase + thesis), 2 body paragraphs (idea → explain → example), complex-sentence summary conclusion
- Exam timing: Task 1 = 27 minutes, Task 2 = 26 minutes; both 150–200 words
- Mobile users get a subtle notice that the real exam is desktop-based

</specifics>

<deferred>
## Deferred Ideas

- Speaking/Reading/Listening practice (tabs show "coming soon" only)
- AI feedback/scoring against descriptors (arrives with AI Tutor phase, Pro feature)
- Audio (TTS/STT), PDF export, premium content, task bank beyond ~16
- Server-side persistence of CELPIP attempts (Phase 2 migrates the namespace)

</deferred>

---

*Phase: 01-celpip-writing-practice*
*Context gathered: 2026-07-23 via PRD Express Path*
