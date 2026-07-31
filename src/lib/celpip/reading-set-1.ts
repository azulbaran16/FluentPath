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
// set was authored across two plans: parts 1 and 3 first, then part 2 INSERTED
// between them and part 4 appended after. `scripts/verify-celpip-content.mts`
// asserts the array is a subsequence of `CELPIP_READING_PART_KINDS`, so a part
// added in the wrong place fails the build rather than quietly running the
// exam's part 3 before its part 2. All four are present now, so the next author
// to meet this trap is whoever writes set 2 — which may again ship partial.
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
 * Part 2 shape: Reading to Apply a Diagram — 8 minutes, eight items.
 *
 * THE ORDER HERE IS THE REVERSE OF PART 1'S, AND THAT IS NOT A SLIP. The
 * correspondence part runs six questions and then five blanks; this part runs
 * **five blanks and then three questions**, because the blanks live in a short
 * message ABOUT the table and the questions are asked about the table itself.
 * The split (5 + 3, not 3 + 5) is confirmed against the beta user's own official
 * format material; the phase's research notes had the two numbers the wrong way
 * round and are wrong. `READING_PART_SHAPE` in
 * `scripts/verify-celpip-content.mts` carries the confirmed figures.
 *
 * THE STIMULUS IS STRUCTURED DATA, NOT AN IMAGE, and the choice is worth
 * restating where the content is authored rather than only where the type is
 * declared: the table stays greppable for the D-06 originality check, it reaches
 * a screen reader as a real table with row and column headers instead of as alt
 * text somebody has to remember to write, and it costs no asset pipeline — which
 * is a cost this phase cannot absorb three weeks out from the exam.
 *
 * THE EXCEPTIONS ARE THE PART. A schedule whose every row behaves the same way
 * generates no items worth asking: every question below is answerable only by
 * combining a row with a note (the visitor surcharge, the holiday make-up, the
 * forty-eight-hour hold, the age rule) or by reading a column heading that a
 * hurried learner assumes says something else ("per family", not per person).
 * The tempting wrong option in every blank is a neighbouring row's fact or a
 * note that has been superseded, never a grammatical error.
 */
const DIAGRAM_PART: CelpipReadingPart = {
  id: "rs1-diagram",
  kind: "diagram",
  title: "The winter programme at a community centre",
  minutes: 8,
  instructions:
    "Study the programme below, then choose the best option for each blank in the message about it. Three questions on the programme itself follow the message. Every option in a blank fits the sentence — only one fits what the programme and its notes actually say.",
  diagram: {
    kind: "schedule",
    caption: "Bellwood Community Centre — winter session, 12 January to 16 March",
    headers: ["Programme", "Day and time", "Ten-week fee", "Drop-in"],
    rows: [
      {
        label: "Pottery (beginners)",
        cells: ["Mondays, 6:30–8:30 pm", "$145", "not available"],
      },
      {
        label: "Lane swim",
        cells: ["Tuesdays and Thursdays, 7:00–8:30 am", "$60", "$6 a morning"],
      },
      {
        label: "Conversation circle",
        cells: ["Wednesdays, 1:00–2:30 pm", "no charge", "no charge"],
      },
      {
        label: "Weight room orientation",
        cells: ["Saturdays, 9:00–10:00 am", "$25 (one session)", "not available"],
      },
      {
        label: "Family skate",
        cells: ["Sundays, 3:00–5:00 pm", "$40 per family", "$10 per family"],
      },
    ],
    notes: [
      "The ten-week fees above are the rates for township residents. Anyone registering from outside the township adds $15 to any ten-week fee.",
      "The centre is closed on statutory holidays. The pottery class that would have fallen on Monday 16 February is made up on Monday 23 March, the week after the session ends.",
      "A place booked online is held for forty-eight hours and is released if the fee has not been paid by then.",
      "Nobody under sixteen may use the weight room without having completed the orientation.",
    ],
  },
  blankText: {
    title: "A message about the programme",
    intro: [
      "From: Delphine Okonjo",
      "To: Ray Vandermeer",
      "Subject: the winter list is out",
    ],
    segments: [
      { kind: "text", text: "Ray — the winter list came out this morning and I have put my name down for the pottery, which runs " },
      { kind: "blank", blankId: "rs1-diag-b1" },
      { kind: "text", text: ". Come and do it with me; you have been saying you would for two years." },
      { kind: "break" },
      {
        kind: "text",
        text: "Two things to know before you register. The first is the money: because you are out at Harlow Bay rather than in the township, the ten-week fee for you would be ",
      },
      { kind: "blank", blankId: "rs1-diag-b2" },
      {
        kind: "text",
        text: ". The second is the holiday. We lose the Monday in the middle of February, but that class ",
      },
      { kind: "blank", blankId: "rs1-diag-b3" },
      { kind: "text", text: ", so we are not paying for a week we do not get." },
      { kind: "break" },
      { kind: "text", text: "If you would rather try something once before committing to ten weeks of anything, " },
      { kind: "blank", blankId: "rs1-diag-b4" },
      { kind: "text", text: ". The pottery does not work that way, unfortunately — it is the whole session or nothing." },
      { kind: "break" },
      { kind: "text", text: "And do not sit on it. They hold a place " },
      { kind: "blank", blankId: "rs1-diag-b5" },
      { kind: "text", text: ", so book on an afternoon when you can pay the same day." },
      { kind: "break" },
      { kind: "text", text: "Delphine" },
    ],
    blanks: [
      {
        id: "rs1-diag-b1",
        options: [
          "on Monday evenings",
          "on Tuesday and Thursday mornings",
          "on Wednesday afternoons",
          "on Saturday mornings",
        ],
        answer: 0,
        explanation:
          "The pottery row gives Mondays, 6:30 to 8:30 in the evening. Each of the other three is a real time from this table and belongs to a different row: Tuesday and Thursday mornings is the lane swim, Wednesday afternoon is the conversation circle, and Saturday morning is the weight room orientation. In this part the wrong option is almost always a neighbouring row rather than an invention, so read down the column you are actually in.",
      },
      {
        id: "rs1-diag-b2",
        options: [
          "one hundred and sixty dollars rather than the hundred and forty-five I am paying",
          "the same hundred and forty-five dollars I am paying",
          "one hundred and thirty dollars, since you are not a member",
          "sixty dollars, which is the rate for people from outside",
        ],
        answer: 0,
        explanation:
          "This blank cannot be answered from the table alone, which is the point of the part: the pottery fee is $145, and the first note says anyone registering from outside the township adds $15 to any ten-week fee. Ray is at Harlow Bay, so $160. The second option is what you get by ignoring the note; the third invents a membership discount that appears nowhere; and sixty dollars is the lane swim's fee, lifted from the row above.",
      },
      {
        id: "rs1-diag-b3",
        options: [
          "is made up on the Monday after the session ends",
          "runs as usual, because the centre stays open on the holidays",
          "is refunded at the drop-in rate",
          "is moved to the Saturday of the same week",
        ],
        answer: 0,
        explanation:
          "The second note says the class that would have fallen on 16 February is made up on Monday 23 March, the week after the session ends. The second option contradicts the first sentence of that same note. The third is impossible on its own terms — the pottery row says drop-in is not available, so there is no drop-in rate to refund at. And nothing anywhere moves a class to a Saturday; Saturday morning belongs to the orientation.",
      },
      {
        id: "rs1-diag-b4",
        options: [
          "the lane swim takes drop-ins at six dollars a morning",
          "the orientation is free to walk into on a Saturday",
          "the family skate is the only thing here that takes drop-ins",
          "you can pay for a single pottery evening at the door",
        ],
        answer: 0,
        explanation:
          "Two rows carry a drop-in rate — the lane swim at $6 a morning and the family skate at $10 a family — and the lane swim is the one that lets a single person try a single session. The orientation costs $25 and its drop-in column says not available. The family skate does take drop-ins, but it is not the only thing that does, and the word doing the damage in that option is \"only\". The last one is contradicted twice over: by the pottery row's drop-in column and by the next sentence of the message itself.",
      },
      {
        id: "rs1-diag-b5",
        options: [
          "for forty-eight hours after you book it online",
          "until the first class of the session",
          "for as long as there is room in the programme",
          "until the end of the week you booked in",
        ],
        answer: 0,
        explanation:
          "The third note gives both halves of the rule: a place booked online is held for forty-eight hours, and it is released if the fee has not been paid by then. That is also why the sentence after the blank tells him to book on an afternoon when he can pay the same day — a detail that only makes sense once the hold is short. The other three are all longer, more comfortable readings of a rule the notes deliberately make tight.",
      },
    ],
  },
  questions: [
    {
      id: "rs1-diag-q1",
      stem: "Someone who is at work every weekday until six in the evening, and away from Bellwood every weekend, could take —",
      options: [
        "the pottery class",
        "the lane swim",
        "the conversation circle",
        "the family skate",
      ],
      answer: 0,
      explanation:
        "Only one programme in the table begins after six on a weekday: the pottery, at 6:30 on Monday evenings. The lane swim is at seven in the morning and the conversation circle at one in the afternoon, both of which fall inside the working day described. The family skate is on a Sunday, which is the half of the week this person is away for. Two constraints have to be held at once here — the hour and the day — and each of the three wrong options fails exactly one of them.",
    },
    {
      id: "rs1-diag-q2",
      stem: "Two parents and their three children, all living in the township, want to skate every Sunday of the session. What do they pay?",
      options: [
        "Forty dollars",
        "Two hundred dollars — forty dollars each",
        "Fifty dollars — the drop-in rate for five people",
        "Eighty dollars — forty dollars for each parent",
      ],
      answer: 0,
      explanation:
        "The fee column says \"$40 per family\", and the three wrong answers are the three ways of not reading those last two words. They live in the township, so no surcharge applies, and they want the whole session rather than single afternoons, so the drop-in rate is not the one to use. A column heading is as much a fact as a cell is, and this part is largely about noticing that.",
    },
    {
      id: "rs1-diag-q3",
      stem: "A fifteen-year-old who wants to use the weight room on a Wednesday afternoon must —",
      options: [
        "come to a Saturday orientation first",
        "wait until she is sixteen, whatever else she does",
        "pay the drop-in rate at the door",
        "register for the whole ten-week programme",
      ],
      answer: 0,
      explanation:
        "The last note is a condition, not an age bar, and the difference between those two is the whole question: nobody under sixteen may use the weight room without having completed the orientation — so completing it is what lets her in. There is no drop-in rate to pay, because the orientation's drop-in column says not available, and there is no ten-week weight room programme in the table at all; the orientation is a single $25 session.",
    },
  ],
};

/**
 * Part 3 shape: Reading for Information — 9 minutes, nine questions, no blanks.
 *
 * The one reading part with no drop-down blanks, and the one that tests
 * INFERENCE as much as detail. Its signature difficulty is the "the passage does
 * not say" option, which is why two questions here carry that option and one of
 * them has it as the key. **A not-stated option that is never the answer teaches
 * the learner to ignore it, which is precisely the wrong lesson** — she would
 * then meet it on the day having trained herself to discount the very option the
 * exam is testing her on. Where it is not the key, the explanation names the
 * section that states the fact; where it is, the explanation names what would
 * have had to appear for it to be wrong.
 *
 * The passage is presented in LABELLED SECTIONS, as the real thing is, so a
 * question can ask which part of the text carries something without asking her
 * to count paragraphs.
 *
 * NOT ADAPTED FROM A LISTENING SCRIPT, and that was a live temptation with six
 * finished listening parts sitting in the next file. A spoken talk and an
 * information text read differently — a talk repeats itself, signposts itself
 * and carries its speaker's voice — and reusing one as the other would blunt
 * exactly the format fidelity D-07 is buying. Recorded here so the decision is
 * on the record rather than rediscovered under time pressure.
 */
const INFORMATION_PART: CelpipReadingPart = {
  id: "rs1-information",
  kind: "information",
  title: "Visitor notes: the Kettle Bend Woollen Mill",
  minutes: 9,
  instructions:
    "Read the notes below and answer the nine questions that follow. Some questions ask what the text states; others ask what follows from it. One of the answers offered may be that the text does not say — read carefully before you accept or reject it.",
  passage: {
    title: "The Kettle Bend Woollen Mill — notes for visitors",
    paragraphs: [
      "The Kettle Bend Woollen Mill is a restored nineteenth-century mill on the Little Kettle River, open to the public from May to October and on winter weekends. The notes below cover its working history, what can be seen inside it today, and how to arrange a visit or a research request.",
    ],
    sections: [
      {
        label: "A. The years of work",
        paragraphs: [
          "The mill was built in 1867 by the Ransome family, who ran it for three generations. Water drawn from the Little Kettle River turned the wheel that drove the carding and spinning machinery, and a small dam upstream held back enough water to keep the floor running through the drier weeks of late summer. At its busiest, in the years around 1910, the mill employed about a hundred and forty people, most of them women from Kettle Bend and the farms around it.",
          "Production ended in 1954, when the company that had bought the firm from the family moved its manufacturing to a larger plant in the west. The building then stood empty. The township bought it in 1986, and the first rooms opened to visitors five years later.",
        ],
      },
      {
        label: "B. What is open to visitors",
        paragraphs: [
          "The ground floor is the mill's working floor. It holds the carding machines, four spinning frames and one of the original looms, all restored to running order. Two of the machines are run for visitors on demonstration days, which fall on the first Saturday of each month from May to October.",
          "The upper floor holds the pattern room, where the mill's designs were drawn and kept. It is reached by the original stair, which is steep and narrow. A lift was added in 2019; it serves the ground floor and the basement, where the café and the shop are, but it does not reach the upper floor. Photography without flash is welcome anywhere in the building.",
        ],
      },
      {
        label: "C. Visiting",
        paragraphs: [
          "The mill is open Wednesday to Sunday from ten until four between May and October, and on Saturdays and Sundays only for the rest of the year. Admission is by donation, and eight dollars a visitor is suggested.",
          "The site has no parking of its own. Visitors leave their cars in the municipal lot on Mill Street, about five minutes' walk away, and the county bus on route 12 stops at the corner of Mill and Draper. Groups of ten or more should write ahead, as the working floor holds no more than twenty-five people at a time.",
        ],
      },
      {
        label: "D. Volunteering",
        paragraphs: [
          "Around sixty volunteers keep the mill open, and the site could not run without them. General training is offered twice a year, in March and in September, and runs over four evenings; volunteers are then asked for one shift a month.",
          "Anyone who wishes to join the team that runs the machines on demonstration days completes a further year of training alongside an experienced operator. That team is held at eight people, so there is usually a wait.",
        ],
      },
      {
        label: "E. The archive",
        paragraphs: [
          "The mill's records were kept when the machinery was sold, and they now form the archive: payroll books covering most years between 1871 and 1954, order books, pattern sheets, and something over four thousand photographs. The archive room is open by appointment on Thursdays.",
          "Written enquiries are answered within three weeks, and copies can be supplied for private study at cost. Anyone intending to publish an image must also complete a permission form, which the archivist sends on request. The Ransome family's personal papers are not held here; they were given to the provincial archives in 1974.",
        ],
      },
    ],
  },
  questions: [
    {
      id: "rs1-info-q1",
      stem: "According to the notes, what brought the mill's working life to an end?",
      options: [
        "The river could no longer drive the machinery",
        "The company that owned it moved production elsewhere",
        "The township could not afford to keep it running",
        "The building was damaged and never repaired",
      ],
      answer: 1,
      explanation:
        "Section A says production ended in 1954 \"when the company that had bought the firm from the family moved its manufacturing to a larger plant in the west.\" The river and the dam appear in the paragraph above that one, but as an explanation of how the mill worked rather than of why it stopped. The township does not appear until 1986, thirty-two years after the closure, so it cannot be the cause of it — a date is often the fastest way to reject an option in this part.",
    },
    {
      id: "rs1-info-q2",
      stem: "In which year did the mill first open to visitors?",
      options: ["1954", "1986", "1991", "2019"],
      answer: 2,
      explanation:
        "The notes never print this year, and that is deliberate: section A says the township bought the building in 1986 and that the first rooms opened \"five years later.\" Adding those together is the whole question. 1986 is the purchase, 1954 the closure, and 2019 the year the lift was installed — every wrong option is a real date from the text, put in front of you to see whether you took the nearest number or the right one.",
    },
    {
      id: "rs1-info-q3",
      stem: "Why did the Ransome family choose Kettle Bend as the site for the mill?",
      options: [
        "Because the family already owned land along the river",
        "Because the river could be relied on to drive the machinery all year",
        "Because the railway reached the town in the same year",
        "The passage does not say",
      ],
      answer: 3,
      explanation:
        "This is the not-stated answer, and the second option is what makes it hard: section A does say the river drove the machinery and that a dam kept the floor running through the drier weeks. But that is an account of how the mill worked once it was there, not of why the site was chosen — the text never gives a reason for the choice at all. For this option to be wrong, the notes would have to contain a sentence about the family's decision, of the form \"they built here because…\" — and no sentence anywhere in the five sections does that. Land ownership and the railway are never mentioned in any form.",
    },
    {
      id: "rs1-info-q4",
      stem: "A visitor who cannot manage stairs would be unable to see —",
      options: ["the pattern room", "the carding machines", "the café and the shop", "the looms"],
      answer: 0,
      explanation:
        "Section B has to be read as a whole for this one. The pattern room is on the upper floor, the upper floor is reached by the original stair, and the lift — which reaches the ground floor and the basement — does not go there. The carding machines and the looms are on the ground floor and the café and shop are in the basement, so the lift covers all three. Nothing in the text says the pattern room is closed; it says how it is reached, and the consequence is left to you.",
    },
    {
      id: "rs1-info-q5",
      stem: "When are the machines run for visitors?",
      options: [
        "On every day the mill is open",
        "On the first Saturday of each month from May to October",
        "At weekends throughout the year",
        "The passage does not say",
      ],
      answer: 1,
      explanation:
        "Section B states it exactly: demonstration days \"fall on the first Saturday of each month from May to October.\" The last option is offered because this part always offers it, and here it is simply wrong — the fact is on the page. The third option borrows the winter opening hours from section C, which is a different fact about a different thing; noticing that a plausible detail came from the wrong section is most of the work in this part.",
    },
    {
      id: "rs1-info-q6",
      stem: "What do the notes say about parking?",
      options: [
        "There is a free lot at the mill itself",
        "Parking is covered by the suggested donation",
        "Visitors use a municipal lot a short walk away",
        "There is nowhere to leave a car near the site",
      ],
      answer: 2,
      explanation:
        "Section C says the site has no parking of its own and that visitors use the municipal lot on Mill Street, about five minutes' walk away. The first and last options are the two opposite over-readings of the same sentence — one ignores the first half, the other ignores the second. The donation is mentioned in the paragraph just above, and attaching it to the parking is the kind of join the text never makes.",
    },
    {
      id: "rs1-info-q7",
      stem: "What is required of a volunteer who wants to join the demonstration team?",
      options: [
        "A further year of training alongside an experienced operator",
        "Previous experience of working with textile machinery",
        "Two shifts a month rather than one",
        "The passage does not say",
      ],
      answer: 0,
      explanation:
        "Section D states the requirement plainly, so the not-stated option is wrong here — and it is worth noticing why it is tempting: the section also says the team is capped at eight and that there is usually a wait, which sounds like a further condition and is not one. Previous experience is exactly the sort of thing such a team might ask for, and the text never asks for it; the monthly shift is one, and that figure belongs to volunteering in general.",
    },
    {
      id: "rs1-info-q8",
      stem: "Someone who wants to reproduce one of the mill's photographs in a book must —",
      options: [
        "apply to the archive that holds the Ransome family's papers",
        "complete a permission form as well as requesting the copy",
        "visit on a Thursday and collect the copy the same day",
        "allow three weeks after publication",
      ],
      answer: 1,
      explanation:
        "Section E separates two things that are easy to run together: copies can be supplied for private study at cost, and publishing an image \"must also\" involve a permission form. The word doing the work is \"also.\" The Ransome papers went to the provincial archives and are a different collection entirely; Thursday is when the archive room is open by appointment, which is not the same as a same-day service; and the three weeks is the answering time for an enquiry, not a wait after publication.",
    },
    {
      id: "rs1-info-q9",
      stem: "Which of these best describes how the mill is run today?",
      options: [
        "As a working factory that also admits visitors",
        "As a private museum funded by its admission charges",
        "As an archive with a small display area attached",
        "As a publicly owned site that depends heavily on volunteers",
      ],
      answer: 3,
      explanation:
        "No single sentence says this; it is assembled from three. The township bought the building (section A), admission is by donation rather than a charge (section C), and about sixty volunteers keep it open, without whom \"the site could not run\" (section D). Production ended in 1954, so nothing is manufactured there now — the machines are run for visitors, which is a demonstration and not a factory. And the archive is one room of a building whose ground and upper floors are given to the machinery, so calling it an archive with a display attached inverts the proportions the notes describe.",
    },
  ],
};

/**
 * Part 4 shape: Reading for Viewpoints — 11 minutes, ten items, five questions
 * on the article and five drop-down blanks in a reader's comment beneath it.
 *
 * WHAT THIS PART TESTS IS ATTRIBUTION, NOT COMPREHENSION. Four of the five
 * questions ask *who* held a position rather than *what* the position was, and
 * that is the difference between this part and part 3. A learner who reads the
 * article for its facts and not for its speakers can answer every question about
 * content and still lose the part.
 *
 * THE POSITIONS OVERLAP ON PURPOSE, because four people disagreeing about
 * everything is both easier and less like the real thing than four people whose
 * agreements cut across each other:
 *
 *   Prewitt and Bouchard-Ng want the same outcome for different reasons.
 *   Prewitt and Sarrazin agree the trial worked and disagree on what follows.
 *   Sarrazin and Trang both end up pointing at service, from opposite premises.
 *   Trang alone disputes what the headline number means, and asks for neither
 *   outcome.
 *
 * Every question below is settled by a named sentence, and the explanation says
 * which. An attribution question whose answer rests on tone rather than on a
 * sentence is a guess dressed as an item.
 *
 * THE COMMENT'S BLANKS ARE WHERE STANCE AND ATTRIBUTION MEET. The correct option
 * agrees or disagrees with a specific named position in a way that fits both the
 * article's facts and the commenter's own argument; each wrong option is
 * grammatical and fails on one of exactly two things — it credits the wrong
 * person, or it reverses the stance the writer has already taken in her own
 * paragraph.
 */
const VIEWPOINTS_PART: CelpipReadingPart = {
  id: "rs1-viewpoints",
  kind: "viewpoints",
  title: "Four views on a town's free buses",
  minutes: 11,
  instructions:
    "Read the article and answer the five questions that follow it. Most of them ask you who said something rather than what was said, so keep track of the speakers as you read. Then choose the best option for each blank in the reader's comment printed underneath.",
  passage: {
    title: "Ellisburn's free buses: four people on what should happen in April",
    paragraphs: [
      "For eighteen months nobody in Ellisburn has paid to board a bus. The trial has been covered by a provincial grant that runs out in June, the council votes on what happens next on the ninth of April, and the four people below will all be at that meeting. Trips taken across the network are up thirty-four per cent. Almost nothing else about the last eighteen months is agreed on.",
      "Councillor Yolanda Prewitt, who chaired the committee that proposed the trial, treats the thirty-four per cent as the argument in itself. \"We were told nobody changes how they travel for the sake of two dollars and forty cents. Thirty-four per cent says otherwise.\" She is quick to add that the fare box covered eleven per cent of what it costs to run the system, and that collecting it was not free either. Her position is that the fare should not come back at all, and that the town should find the eleven per cent somewhere else in its own budget.",
      "Devin Sarrazin, who runs the town's buses, is careful about what he is not saying. \"It worked. More people rode. I am not going to stand up in April and pretend otherwise.\" His disagreement is about what follows. On three of the six routes the last bus leaves at seven in the evening, and three have no Sunday service at all; a bus that is free but not running when a shift ends is, he says, free to the wrong people. He would rather bring back a modest fare and put every dollar of it into evening and Sunday runs. \"You cannot board a bus that is not there.\"",
      "Marguerite Bouchard-Ng, who runs a home-care agency with fourteen staff, wants the fare kept at nothing and is impatient with the way the case for it is being made. Counting trips, she argues, tells you the size of the change and nothing about who it happened to. Her staff move between four and six houses a day; most of her clients no longer drive. \"Ask the councillor how many of her thirty-four per cent had another way of getting there. She does not know. That is my whole point.\" She has said more than once that she agrees with Councillor Prewitt's conclusion and not with her reasoning.",
      "Hollis Trang, who teaches economics at Ellisburn College, is the only one of the four who doubts that the number means what it is being asked to mean. Route 6, out to the Denniker Yards, opened eight months into the trial and carries shift workers to an employer that runs around the clock; most of the growth, he says, arrived after that route did. \"You cannot credit a fare change for riders on a route that did not exist when the fare changed.\" He is not asking for the fare to come back. He wants the council to separate the two effects before it votes, and he expects that exercise to point at service rather than at price — which is where Sarrazin has arrived from the opposite direction.",
      "The vote is on the ninth of April. The grant ends in June whichever way it goes.",
    ],
  },
  questions: [
    {
      id: "rs1-view-q1",
      stem: "Who argues that the rise in riders cannot be credited to the fare change?",
      options: [
        "Councillor Yolanda Prewitt",
        "Devin Sarrazin",
        "Hollis Trang",
        "Marguerite Bouchard-Ng",
      ],
      answer: 2,
      explanation:
        "Trang's sentence settles it on its own: \"You cannot credit a fare change for riders on a route that did not exist when the fare changed.\" He is the only one of the four who questions what the thirty-four per cent is evidence of. Prewitt treats that figure as her whole argument, Sarrazin accepts it in as many words (\"It worked. More people rode\"), and Bouchard-Ng's complaint is that the figure is the wrong thing to count, which is not the same as doubting it.",
    },
    {
      id: "rs1-view-q2",
      stem: "Which two speakers agree that the trial worked and disagree about what should happen next?",
      options: [
        "Sarrazin and Trang",
        "Prewitt and Sarrazin",
        "Prewitt and Bouchard-Ng",
        "Bouchard-Ng and Trang",
      ],
      answer: 1,
      explanation:
        "Both halves have to hold. Prewitt and Sarrazin both say the trial succeeded — she from the thirty-four per cent, he in a sentence written to head off exactly this misreading — and they want opposite things afterwards: no fare at all, or a modest fare spent on evening runs. Prewitt and Bouchard-Ng pass the first half and fail the second, because they want the same outcome and differ only in their reasons for it. Sarrazin and Trang fail the first half: Trang doubts what the trial showed. Bouchard-Ng and Trang agree on neither.",
    },
    {
      id: "rs1-view-q3",
      stem: "Whose case rests on which people are riding rather than on how many?",
      options: ["Prewitt's", "Sarrazin's", "Trang's", "Bouchard-Ng's"],
      answer: 3,
      explanation:
        "Bouchard-Ng says it directly — counting trips \"tells you the size of the change and nothing about who it happened to\" — and her question to the councillor is about how many of those riders had another way of getting there. Prewitt's case is the size of the change and nothing else. Sarrazin's is about when the buses run. Trang's is about what caused the number, which is a question about the same total rather than about the people inside it.",
    },
    {
      id: "rs1-view-q4",
      stem: "Which speaker would be most likely to accept a fare again if the money paid for later buses?",
      options: [
        "Devin Sarrazin",
        "Yolanda Prewitt",
        "Marguerite Bouchard-Ng",
        "Hollis Trang",
      ],
      answer: 0,
      explanation:
        "It is Sarrazin's actual proposal, not an inference about him: a modest fare, with every dollar of it going to evening and Sunday runs. Prewitt says the fare should not come back at all. Bouchard-Ng wants it kept at nothing. Trang is the trickiest of the three wrong answers, because he also ends up pointing at service — but the article says plainly that he is not asking for the fare to come back; he wants the council to measure before it decides.",
    },
    {
      id: "rs1-view-q5",
      stem: "Which of these does every one of the four accept?",
      options: [
        "That the fare change is what produced the increase",
        "That the buses should stay free after April",
        "That more trips were taken during the eighteen months than before them",
        "That the province will renew the grant",
      ],
      answer: 2,
      explanation:
        "The thirty-four per cent is the one thing nobody in the article disputes — Trang argues about what caused it, which concedes that it happened. The first option is the very thing he denies. The second is held by Prewitt and Bouchard-Ng and rejected by Sarrazin, so it is not unanimous. And the last is contradicted by the article's closing line: the grant ends in June whichever way the vote goes.",
    },
  ],
  blankText: {
    title: "From the comments",
    intro: ["Ines Marchetti, Ellisburn — rides route 2"],
    segments: [
      {
        kind: "text",
        text: "I have taken the number 2 to work and back for eleven years, and of the four people quoted here, ",
      },
      { kind: "blank", blankId: "rs1-view-b1" },
      {
        kind: "text",
        text: ". The bus I get on at half past six in the morning is full of people going in to work in kitchens and care homes, and not one of them is choosing between the bus and a car.",
      },
      { kind: "break" },
      {
        kind: "text",
        text: "Mr Trang is right that route 6 opened in the middle of all this, and I would not pretend otherwise. But ",
      },
      { kind: "blank", blankId: "rs1-view-b2" },
      { kind: "text", text: ", and that is what his argument leaves out." },
      { kind: "break" },
      {
        kind: "text",
        text: "Where I part company with Mr Sarrazin is not the evening runs — a bus that stops at seven is no use to a night shift, and he is right about that — but ",
      },
      { kind: "blank", blankId: "rs1-view-b3" },
      { kind: "text", text: "." },
      { kind: "break" },
      { kind: "text", text: "And if the council needs the money, " },
      { kind: "blank", blankId: "rs1-view-b4" },
      { kind: "text", text: "." },
      { kind: "break" },
      { kind: "text", text: "So: keep the fare where it is, " },
      { kind: "blank", blankId: "rs1-view-b5" },
      {
        kind: "text",
        text: ", and count the people on the six-thirty bus before anybody decides what the last eighteen months proved.",
      },
      { kind: "break" },
      { kind: "text", text: "Ines Marchetti" },
    ],
    blanks: [
      {
        id: "rs1-view-b1",
        options: [
          "it is Councillor Prewitt who has described my bus",
          "it is Mr Trang who has described my bus",
          "it is Ms Bouchard-Ng who has described my bus",
          "not one of them has described my bus",
        ],
        answer: 2,
        explanation:
          "The sentence after the blank is an answer to Bouchard-Ng's question and to nobody else's: it says who is on the bus and that they have no alternative, which is exactly what she asks the councillor about. Crediting Prewitt puts the total in the mouth of the one person who says the total is beside the point. Crediting Trang credits an argument about what caused the rise, which is not about passengers at all. And saying none of them described it is contradicted by the writer's own next sentence, which agrees with one of them rather than rejecting all four.",
      },
      {
        id: "rs1-view-b2",
        options: [
          "the number 2 has not changed its route or its timetable in six years, and it is fuller than it was",
          "route 6 now carries more riders than the other five put together",
          "the fare was never what kept anybody off my bus",
          "nothing much has changed on the older routes either",
        ],
        answer: 0,
        explanation:
          "Trang's argument is that the growth came from a route that did not exist before, so the reply that answers it is one about a route that did not change and grew anyway. The claim about route 6 outcarrying the rest is a figure the article never gives, and inventing evidence is the one move a comment on an article cannot make. Saying the fare never kept anyone off her bus would undo the writer's own conclusion four lines later. And conceding that nothing changed on the older routes hands Trang the argument in the middle of a sentence that begins \"But\".",
      },
      {
        id: "rs1-view-b3",
        options: [
          "his claim that the trial made no difference",
          "the idea that we have to choose between the two",
          "his view that the college students should be paying",
          "the suggestion that the evenings are good enough as they are",
        ],
        answer: 1,
        explanation:
          "What Sarrazin proposes is a trade — a fare back in exchange for evening and Sunday runs — and a trade is the thing this writer refuses, having just agreed with him about the evenings. Saying he claims the trial made no difference contradicts the sentence in which he refuses to pretend anything of the kind. The college students belong to Trang's paragraph and to no argument about fares. And nobody in the article says the evenings are adequate; Sarrazin says the opposite, which is the half of his case she has just accepted.",
      },
      {
        id: "rs1-view-b4",
        options: [
          "put the fares back where they were before the trial",
          "wait for the province to renew the grant in June",
          "charge on the new route and leave the other five alone",
          "start with the eleven per cent the fare box used to bring in and ask what else the budget is doing",
        ],
        answer: 3,
        explanation:
          "Eleven per cent is the figure Prewitt gives for what the fares covered, and hers is the argument this writer is following: find it elsewhere in the budget. The option about the grant reverses the article's closing fact — it ends in June, it is not renewed then. Putting the fares back is the outcome the whole comment argues against, three words before she argues against it. And charging on route 6 alone would fall on the shift workers whose bus is the one she has just spent a paragraph defending.",
      },
      {
        id: "rs1-view-b5",
        options: [
          "let the evening runs wait until the money turns up",
          "find the evening runs their money somewhere else",
          "admit that the evenings were never the real problem",
          "put whatever is left into the route out to the Denniker Yards",
        ],
        answer: 1,
        explanation:
          "She has already granted Sarrazin the evenings, so the only ending that keeps her own paragraph consistent is one that keeps the fare at nothing and still pays for them. Letting the evening runs wait, and denying that they were ever a problem, both walk back a concession she made two lines earlier. And the Denniker Yards route is the newest thing on the network and the one part of it nobody in the article says is short of service.",
      },
    ],
  },
};

/**
 * The set's parts, IN EXAM ORDER — see the warning in the file header. This is
 * not the order they were authored in and it is not append-only: the diagram
 * part belongs BETWEEN these two, and viewpoints after them.
 *
 * THE SET'S TOTAL ALLOWANCE IS NOT WRITTEN DOWN ANYWHERE. `CelpipReadingSet`
 * carries no `timeLimitMinutes` field on purpose (see the type in
 * `../celpip.ts`): `readingSetMinutes` sums these parts' own `minutes`, so the
 * total cannot be typed twice and cannot drift from the parts it describes. With
 * all four parts present it now reports the exam's own 39 minutes over 38 items
 * — 11 + 8 + 9 + 11, and 11 + 8 + 9 + 10 — and it reports them because they were
 * derived, not because anybody typed them here.
 */
const SET_1_PARTS: CelpipReadingPart[] = [
  CORRESPONDENCE_PART,
  DIAGRAM_PART,
  INFORMATION_PART,
  VIEWPOINTS_PART,
];

export const READING_SET_1: CelpipReadingSet = {
  id: "reading-set-1",
  title: "Reading Set 1",
  parts: SET_1_PARTS,
};

export const READING_SET_BANK: CelpipReadingSet[] = [READING_SET_1];
