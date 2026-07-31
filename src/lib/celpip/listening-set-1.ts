import type { CelpipListeningPart, CelpipListeningSet } from "../celpip";

// CELPIP Listening — Set 1.
// ALL original content — written from the exam FORMAT only, no text copied
// from third-party material (see .planning IP constraints for this phase).
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A PART. Declare it as its own `const` below, then append the name
// to the `parts` array at the bottom. That is the ONLY edit — the set's time
// limit is derived from the parts themselves, so nothing else moves and no
// later plan has to restructure this file. A part that is cut for the calendar
// is removed from the array the same way, and the landing's coverage line
// follows on its own.
//
// THE PER-TURN WORD CEILING IS A CORRECTNESS CONSTRAINT, NOT A STYLE NOTE.
// Chrome truncates a single utterance at roughly fifteen seconds with no error
// and sometimes no `onend` — and under D-05 the questions are revealed by that
// `onend` and by nothing else, so a turn that is too long does not merely cut
// the audio short: the learner is left on a screen with no words, no questions
// and no explanation. At the app's speaking rate of 0.95 against a nominal 150
// words per minute, fifteen seconds is about 35 words. AUTHOR EVERY TURN AT 25
// WORDS OR FEWER. `scripts/verify-celpip-content.mts` gates at 35.
//
// That is why a single-speaker news item is still written as a sequence of
// turns, all attributed to the same reader: the chunking is what protects
// playback, not the speaker count.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Part 4 shape: Listening to a News Item.
 *
 * One speaker, roughly 225 words, five questions on factual recall. The
 * distractors are drawn from facts the report really does state — a number that
 * counted something else, an event on a nearby date — because an obviously
 * wrong option teaches nothing. The difficulty of this part is that every
 * option sounds defensible until you remember what was actually said.
 */
const NEWS_ITEM_PART: CelpipListeningPart = {
  id: "ls1-news-item",
  kind: "news-item",
  title: "A second library branch for Bridgewater",
  segments: [
    {
      id: "ls1-news-seg-1",
      turns: [
        {
          speaker: "Alina Cardoso",
          text: "Good afternoon. It is four o'clock, and here is the local news for Bridgewater and the Colton Valley.",
        },
        {
          speaker: "Alina Cardoso",
          text: "The Bridgewater Public Library will open a second branch this autumn, in the former post office on Ellery Street.",
        },
        {
          speaker: "Alina Cardoso",
          text: "The branch is scheduled to welcome its first visitors on the fourteenth of October, after eleven months of renovation work.",
        },
        {
          speaker: "Alina Cardoso",
          text: "City council approved the project two years ago, but rising costs delayed construction through most of last winter.",
        },
        {
          speaker: "Alina Cardoso",
          text: "The branch will hold roughly forty thousand books, about half the collection kept at the main library on Prescott Avenue.",
        },
        {
          speaker: "Alina Cardoso",
          text: "Its opening hours will differ from the main branch. It closes at six on weekdays, and it will not open on Sundays.",
        },
        {
          speaker: "Alina Cardoso",
          text: "The head librarian, Naveen Okonjo, says the site was chosen for one reason above all the others.",
        },
        {
          speaker: "Alina Cardoso",
          text: "He explained that more than a third of borrowers live east of the river, and that the old bridge crossing takes them forty minutes.",
        },
        {
          speaker: "Alina Cardoso",
          text: "The building will also house a free after-school study room, staffed by volunteers from the community college.",
        },
        {
          speaker: "Alina Cardoso",
          text: "Residents are invited to an open house on the Saturday before the opening, when tours will run every half hour.",
        },
        {
          speaker: "Alina Cardoso",
          text: "Library cards issued at the main branch will work at both sites, and no new registration is needed.",
        },
        {
          speaker: "Alina Cardoso",
          text: "That is the local news. The weather forecast follows after this short break.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "ls1-news-q1",
      segmentId: "ls1-news-seg-1",
      stem: "When is the new branch due to open to the public?",
      options: [
        "On the Saturday of the open house",
        "On the fourteenth of October",
        "As soon as the renovation work begins",
        "Two years after the council approved it",
      ],
      answer: 1,
      explanation:
        "The report gives the fourteenth of October as the day the branch welcomes its first visitors. The open house is held on the Saturday before that, which is the detail most easily mistaken for the opening itself — the report mentions it second, and it is the one you are likelier to be holding in mind when the question arrives.",
    },
    {
      id: "ls1-news-q2",
      segmentId: "ls1-news-seg-1",
      stem: "How does the size of the new branch's collection compare with the main library's?",
      options: [
        "It is about a third as large",
        "It is about the same size",
        "It is about half as large",
        "It is about twice as large",
      ],
      answer: 2,
      explanation:
        "Forty thousand books, described as about half of what the Prescott Avenue building holds. \"A third\" is a real figure from the report, but it counts something else entirely — the share of borrowers who live east of the river. Numbers in this part are almost always attached to more than one thing, so note what each one is counting, not just the number.",
    },
    {
      id: "ls1-news-q3",
      segmentId: "ls1-news-seg-1",
      stem: "According to the head librarian, why was this site chosen?",
      options: [
        "Many borrowers live east of the river and the crossing is slow",
        "The former post office was cheaper than putting up a new building",
        "The council had already approved that street two years earlier",
        "The community college asked for a study room nearby",
      ],
      answer: 0,
      explanation:
        "He names one reason above all others: more than a third of borrowers live east of the river, and the old bridge crossing costs them forty minutes. The study room and the college volunteers are mentioned, but as something the building will contain — not as the reason for its location.",
    },
    {
      id: "ls1-news-q4",
      segmentId: "ls1-news-seg-1",
      stem: "How will the new branch's opening hours differ from the main library's?",
      options: [
        "It will keep the same hours as the main branch",
        "It will open at six in the morning on weekdays",
        "It will close at four, when the afternoon news is read",
        "It will close at six on weekdays and stay shut on Sundays",
      ],
      answer: 3,
      explanation:
        "Two facts in one sentence: a six o'clock weekday closing and no Sunday opening. Four o'clock is stated in the report as well, but it is the time of the news broadcast itself — a detail from the opening line that has nothing to do with the library.",
    },
    {
      id: "ls1-news-q5",
      segmentId: "ls1-news-seg-1",
      stem: "What does someone who already has a library card need to do to borrow from the new branch?",
      options: [
        "Register again at the Ellery Street site",
        "Nothing — the card already works at both branches",
        "Ask one of the community college volunteers for a new card",
        "Attend a tour at the open house before borrowing",
      ],
      answer: 1,
      explanation:
        "The report closes by saying that cards issued at the main branch work at both sites and that no new registration is needed. When a report ends on a practical instruction like this one, expect a question on it — the last thing said is often the thing tested, and it is also the thing a tired listener stops noting down.",
    },
  ],
};

/** Words in one turn, counted the same way the content harness counts them. */
function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * How long the whole set should take: the audio at the app's own speaking rate,
 * plus a minute per question to answer it.
 *
 * DERIVED rather than written down, so that appending a part moves the number by
 * itself. PROVISIONAL while the set is incomplete — one part shape of the
 * exam's six exists today, and this figure will grow as the rest are authored.
 * The exam gives roughly 47-55 minutes for all six parts and about 38 items.
 */
function estimatedMinutes(parts: CelpipListeningPart[]): number {
  const spoken = parts
    .flatMap((part) => part.segments)
    .flatMap((segment) => segment.turns)
    .reduce((total, turn) => total + words(turn.text), 0);
  const questions = parts.reduce((total, part) => total + part.questions.length, 0);
  // 150 words per minute is the nominal rate; celpip-speech.ts speaks at 0.95.
  const audioMinutes = spoken / (150 * 0.95);
  return Math.max(1, Math.ceil(audioMinutes + questions));
}

const SET_1_PARTS: CelpipListeningPart[] = [NEWS_ITEM_PART];

export const LISTENING_SET_1: CelpipListeningSet = {
  id: "listening-set-1",
  title: "Listening Set 1",
  timeLimitMinutes: estimatedMinutes(SET_1_PARTS),
  parts: SET_1_PARTS,
};

export const LISTENING_SET_BANK: CelpipListeningSet[] = [LISTENING_SET_1];
