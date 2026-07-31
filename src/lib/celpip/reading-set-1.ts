import type { CelpipReadingPart, CelpipReadingSet } from "../celpip";

// CELPIP Reading — Set 1.
// ALL original content — written from the exam FORMAT only, no text copied
// from third-party material (see .planning IP constraints for this phase).
// Every person, place, business and date below is invented. The mill, the town,
// the lake cabin and everyone in the correspondence exist nowhere but here.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A PART. Declare it as its own `const` below, then put the name
// into `SET_1_PARTS` at the bottom IN EXAM ORDER — correspondence, diagram,
// information, viewpoints. That is the ONLY edit. The set's total allowance and
// its item count are DERIVED from the parts (`readingSetMinutes`,
// `readingSetItemCount` in `../celpip.ts`), so nothing else moves and no later
// plan has to restructure this file. A part cut for the calendar is removed the
// same way, and the landing's coverage line follows on its own.
//
// **THE ARRAY IS NOT APPEND-ONLY, AND THAT IS THE ONE TRAP IN THIS FILE.** This
// set ships parts 1 and 3 first; the diagram is part 2 and viewpoints is part 4,
// so plan 10 must INSERT the diagram between the two below rather than append
// it. `scripts/verify-celpip-content.mts` asserts the array is a subsequence of
// `CELPIP_READING_PART_KINDS`, so getting it wrong fails the build rather than
// quietly running the exam's part 3 before its part 2.
//
// IDS MUST BE UNIQUE ACROSS EVERY QUESTION AND EVERY BLANK IN THE SET, not just
// within a part. Question ids and blank ids share ONE answers map on the stored
// attempt (`CelpipReadingAttempt.answers`), so a collision silently overwrites
// one of two answers and mis-scores the sheet — with nothing anywhere saying so.
// The convention is `rs1-<part>-q<n>` for a question and `rs1-<part>-b<n>` for a
// blank, with the part token distinct per part (`corr`, `diag`, `info`, `view`).
// The harness gates the invariant; the prefix is what makes it hard to break by
// accident in the first place.
//
// WHERE THIS SET'S EXAM-FORMAT FIGURES COME FROM. The four part names, the
// per-part allowances (11 / 8 / 9 / 11 minutes) and the per-part item counts
// (11 / 8 / 9 / 10, and their split between questions and drop-down blanks) are
// CONFIRMED against the beta user's own official format material rather than
// estimated from prep sites. A part whose shape does not match
// `READING_PART_SHAPE` in `scripts/verify-celpip-content.mts` is a defect, not a
// judgement call. Only STRUCTURE crossed over from that material: no sentence,
// stem, option or passage line of it appears here or anywhere else in the app
// (D-06).
//
// AUTHORING A DROP-DOWN BLANK IS THE EXPENSIVE PART, AND IT IS THE POINT.
// The wrong options must be GRAMMATICALLY FINE and only CONTEXTUALLY wrong —
// each one contradicts a specific fact in the first email or clashes with the
// reply's own register. An ungrammatical distractor turns the hardest question
// type in the section into a spot-the-typo exercise, which is worse than not
// including the type at all: it teaches her to answer it the wrong way.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Part 1 shape: Reading Correspondence — 11 minutes, eleven items.
 *
 * THE SIX-THEN-FIVE ORDER IS NOT INTERCHANGEABLE. The exam lays this part out as
 * six comprehension questions on the first message followed by five drop-down
 * blanks inside the reply, and she should meet the blanks in the position she
 * will meet them on the day rather than wherever they happened to be authored.
 *
 * The blanks are the reason this part ships first: it is the only part that
 * exercises both question types at once, and every blank here can only be
 * answered by holding a fact from the FIRST email while reading the SECOND. The
 * price, the head count, who dropped out, the deposit date and the missing
 * internet each rule out one tempting option apiece.
 */
const CORRESPONDENCE_PART: CelpipReadingPart = {
  id: "rs1-correspondence",
  kind: "correspondence",
  title: "A change of plan for the cabin weekend",
  minutes: 11,
  instructions:
    "Read the email below and answer the six questions that follow it. Then read the reply and choose the best option for each blank in it. Every option in a blank fits the sentence — only one fits what the first email actually says.",
  passage: {
    title: "From Nadia Farouk to Colin Beausoleil — 4 September",
    paragraphs: [
      "Hi Colin,",
      "I have finally got the cabin sorted for the last weekend in September, though not the one we had in mind. The place near Wakefield we stayed in last year has been taken off the rental list — the owners are living in it themselves now — so I have booked a smaller cabin on Meech Lake instead. It is about twenty minutes further along the road, it sleeps six comfortably, and it has a proper kitchen and a wood stove. What it does not have is any internet at all, which I have decided to treat as a feature rather than a fault.",
      "Here is the part I wanted to put to you before I write to everyone else. Marcus and Priya have both pulled out — Priya's sister is getting married that weekend — so we are down from eight of us to six. The cabin itself is cheaper to rent than last year's was, but split six ways it comes to eighty dollars each rather than the sixty-five we each put in last time. I do not think anybody will mind, but I would rather not be the only one who has thought about it before the message goes out.",
      "Two things, then. The deposit is due on the twelfth, so I need to know by then whether you are in. And Marcus was the one who was going to drive, so if you can bring your car we will have one between us — otherwise I will book a second one, and that goes on the total too.",
      "Also: the big pot. Please.",
      "Nadia",
    ],
  },
  questions: [
    {
      id: "rs1-corr-q1",
      stem: "What is Nadia's main reason for writing to Colin?",
      options: [
        "To confirm the arrangements and get an answer she needs before a deadline",
        "To apologise for having changed the weekend without asking anyone",
        "To ask him to find a cheaper cabin than the one she has booked",
        "To warn him that the weekend may not go ahead at all",
      ],
      answer: 0,
      explanation:
        "Every paragraph is doing one of two jobs: telling him what has been settled (the cabin, the price, who has dropped out) and asking him for something she needs before the twelfth. She does not apologise anywhere — she explains, which is a different act — and the booking is already made, so asking for a cheaper cabin is not on the table. Nothing in the email suggests the weekend is at risk; the risk she names is a second car being added to the total.",
    },
    {
      id: "rs1-corr-q2",
      stem: "Why does the weekend cost more per person this year?",
      options: [
        "The new cabin is more expensive to rent than last year's",
        "Fewer people are sharing the same booking",
        "A second car has to be hired",
        "The deposit is larger than it was last year",
      ],
      answer: 1,
      explanation:
        "This is the sentence that rewards reading to the end of it: the cabin is cheaper, and the price per person still went up, because the same cost is being split six ways instead of eight. The first option is the one the email explicitly denies. The second car is a possibility she raises for later — it depends on his answer and is not in the eighty dollars — and the deposit's size is never mentioned at all, only its date.",
    },
    {
      id: "rs1-corr-q3",
      stem: "What has to happen by the twelfth?",
      options: [
        "The whole amount has to be paid",
        "The rest of the group has to be told about the new price",
        "Colin has to say whether he is coming",
        "A second car has to be booked",
      ],
      answer: 2,
      explanation:
        "The twelfth is the deposit date, and what she asks of him by then is an answer, not money: \"I need to know by then whether you are in.\" The deposit is only a deposit, so the full amount is not due. Telling the group and booking a car are both things she may do, but she gives neither of them a date.",
    },
    {
      id: "rs1-corr-q4",
      stem: "What will Nadia do if Colin cannot bring his car?",
      options: [
        "Ask somebody else in the group to drive",
        "Hire a second vehicle and add it to the total",
        "Move the weekend to somewhere closer",
        "Cancel the booking she has made",
      ],
      answer: 1,
      explanation:
        "She says it in the same sentence she asks the question in: \"otherwise I will book a second one, and that goes on the total too.\" The alternative she names is a cost, not a different person and not a different cabin — which is also why this matters to him, since it would move the eighty dollars again.",
    },
    {
      id: "rs1-corr-q5",
      stem: "What does Nadia's remark about the internet suggest about her?",
      options: [
        "She has not checked whether the cabin has a connection",
        "She expects the group to object to being out of touch",
        "She is choosing to treat a drawback as something to enjoy",
        "She is planning to do some work over the weekend",
      ],
      answer: 2,
      explanation:
        "\"Which I have decided to treat as a feature rather than a fault\" is her telling you how she has chosen to read the fact, and the choosing is the whole point of the sentence. She has clearly checked — she states it flatly — and she says nothing about how anybody else will take it or about working. A line like this one is asking about attitude rather than fact, and the attitude is in the verb.",
    },
    {
      id: "rs1-corr-q6",
      stem: "What does Nadia expect the rest of the group to make of the new price?",
      options: [
        "That they will accept it, though she wants somebody else aware of it first",
        "That they will refuse to pay it",
        "That they have already worked it out for themselves",
        "That they need not be told about it",
      ],
      answer: 0,
      explanation:
        "\"I do not think anybody will mind, but I would rather not be the only one who has thought about it\" carries both halves: she expects acceptance, and she still wants one other person to have seen the number before it goes out. She never suggests refusal, she is writing precisely because they have not been told, and she plainly intends to tell them — \"before the message goes out.\"",
    },
  ],
  blankText: {
    title: "Colin's reply — 6 September",
    intro: [
      "From: Colin Beausoleil",
      "To: Nadia Farouk",
      "Subject: Re: the cabin — one change, and a question for you",
    ],
    segments: [
      { kind: "text", text: "Nadia — count me in. And thank you for " },
      { kind: "blank", blankId: "rs1-corr-b1" },
      {
        kind: "text",
        text: ". I would far rather hear it now than in a group message with everybody typing at once. Marcus and Priya will both be missed; tell Priya I hope the wedding is a good one.",
      },
      { kind: "break" },
      {
        kind: "text",
        text: "Meech Lake is no hardship. Twenty minutes further along the road is still only twenty minutes, and I would take a wood stove over a wireless signal most weekends of the year. Eighty dollars is ",
      },
      { kind: "blank", blankId: "rs1-corr-b2" },
      { kind: "text", text: ", and I would say so plainly." },
      { kind: "break" },
      { kind: "text", text: "When you write to the others, I would " },
      { kind: "blank", blankId: "rs1-corr-b3" },
      {
        kind: "text",
        text: ". A number always lands better when the reason for it arrives beside it.",
      },
      { kind: "break" },
      { kind: "text", text: "As for the driving, " },
      { kind: "blank", blankId: "rs1-corr-b4" },
      {
        kind: "text",
        text: ". Say the word and I will pick people up on the way through the village.",
      },
      { kind: "break" },
      { kind: "text", text: "And yes, the pot. I will take the Saturday dinner and plan it for " },
      { kind: "blank", blankId: "rs1-corr-b5" },
      { kind: "text", text: ". You will have my share well before the twelfth." },
      { kind: "break" },
      { kind: "text", text: "Colin" },
    ],
    blanks: [
      {
        id: "rs1-corr-b1",
        options: [
          "asking me before the price goes out to everyone",
          "checking with the whole group before you booked",
          "holding the same cabin for us again",
          "waiting until the deposit had been paid",
        ],
        answer: 0,
        explanation:
          "All four fit the sentence, and three of them describe something that did not happen. Nadia says she is writing to him \"before I write to everyone else,\" so she has not checked with the group — that is the entire reason this email exists. The cabin near Wakefield has been taken off the rental list, so nothing was held. And the deposit is not due until the twelfth, so it has not been paid. The only one of the four that names a thing she actually did is the first.",
      },
      {
        id: "rs1-corr-b2",
        options: [
          "still a fair price for two nights",
          "the same as we each put in last year",
          "the least we have ever paid for that weekend",
          "more than I can manage this autumn",
        ],
        answer: 0,
        explanation:
          "Two of these are ruled out by one number in the first email: last year was sixty-five dollars each, so eighty is neither the same nor the lowest they have paid. The fourth is ruled out by Colin himself — he opens with \"count me in\" and closes by promising his share before the twelfth, so a sentence saying he cannot manage it contradicts the letter it is sitting in. That is the shape of this question type: the grammar never tells you, the surrounding facts do.",
      },
      {
        id: "rs1-corr-b3",
        options: [
          "give them the figure and the reason in one message",
          "leave the figure until we are all up there",
          "send it from the cabin once we have arrived",
          "let them work it out from the total",
        ],
        answer: 0,
        explanation:
          "The sentence that follows the blank does the ruling out for you: \"a number always lands better when the reason for it arrives beside it\" only makes sense after advice to send both together. Beyond that, the deposit is due on the twelfth, so waiting until they are at the cabin is too late to be advice at all, and the cabin has no internet, so nothing can be sent from it. Making people do the arithmetic themselves is the opposite of the plainness he has just recommended.",
      },
      {
        id: "rs1-corr-b4",
        options: [
          "I will bring my car, and there is room for three besides me",
          "I will come up with Marcus, the way we did last year",
          "you had better book the second car after all",
          "I will take the bus and meet you at the cabin",
        ],
        answer: 0,
        explanation:
          "Marcus has pulled out, which quietly disqualifies the second option however natural it sounds — this is the kind of detail the part is testing you for having held on to. Booking the second car is what Nadia said she would do only if he could not drive, so it contradicts the offer in the next sentence to pick people up on the way. And the cabin is twenty minutes beyond the village he is offering to drive through, on a lake, which is not somewhere a bus meets you.",
      },
      {
        id: "rs1-corr-b5",
        options: [
          "the six of us",
          "the eight of us",
          "the four of us",
          "however many end up coming",
        ],
        answer: 0,
        explanation:
          "Eight was the number before Marcus and Priya pulled out, and it is the figure the first email gives you first, which is exactly why it is the tempting one. Six is what is left, and it is the number the whole price calculation in that email rests on. Four is not in the email at all. The last option is grammatical and would be fine in a different letter, but Colin has just been told the head count is settled, and he is a man who takes the Saturday dinner and says so plainly.",
      },
    ],
  },
};

/**
 * The set's parts, IN EXAM ORDER — see the warning in the file header. This is
 * not the order they were authored in and it is not append-only: the diagram
 * part belongs between these two, and viewpoints after them.
 */
const SET_1_PARTS: CelpipReadingPart[] = [CORRESPONDENCE_PART];

export const READING_SET_1: CelpipReadingSet = {
  id: "reading-set-1",
  title: "Reading Set 1",
  parts: SET_1_PARTS,
};

export const READING_SET_BANK: CelpipReadingSet[] = [READING_SET_1];
