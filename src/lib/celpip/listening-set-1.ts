import type { CelpipListeningPart, CelpipListeningSet } from "../celpip";

// CELPIP Listening — Set 1.
// ALL original content — written from the exam FORMAT only, no text copied
// from third-party material (see .planning IP constraints for this phase).
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A PART. Declare it as its own `const` below, then put the name
// into the `parts` array at the bottom IN EXAM ORDER — problem solving, daily
// conversation, information, news item, discussion, viewpoints. That is the
// ONLY edit — the set's time limit is derived from the parts themselves, so
// nothing else moves and no later plan has to restructure this file. A part
// that is cut for the calendar is removed from the array the same way, and the
// landing's coverage line follows on its own.
//
// The array's order is the order she HEARS the parts in, and D-07 is that the
// rehearsal should have the shape of the exam. Declaration order in this file
// is therefore chronological (whichever plan wrote it) while ARRAY order is the
// exam's; `scripts/verify-celpip-content.mts` asserts the array is a
// subsequence of `CELPIP_LISTENING_PART_KINDS`, so an append in the wrong place
// fails the build rather than quietly playing part four first.
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

/**
 * Part 1 shape: Listening to Problem Solving.
 *
 * The ONLY part in the exam where the questions follow EACH segment rather than
 * the whole part, which is why every question below names its `segmentId`. The
 * player needs no special case for it — a part has always been an array of
 * segments and the runner has always asked after each one — but a question that
 * named no segment, or named one from another part, would be asked in the wrong
 * place or never asked at all. The harness gates both.
 *
 * Two speakers, a tenant and her building manager, working a practical problem
 * through to an arrangement: dates, deadlines, a deductible, a locker number, a
 * time to meet. That is what this part tests, and it is what makes the note pad
 * earn its place on the screen — almost every question here turns on a number
 * or a day that is stated once and then talked past.
 *
 * The distractors are built from the segment's OWN facts wearing the wrong hat:
 * the day the building found the leak against the day she found it, the day the
 * wall comes out against the day the file is due, the room her locker is next
 * to against the place the water came from.
 */
const PROBLEM_SOLVING_PART: CelpipListeningPart = {
  id: "ls1-problem-solving",
  kind: "problem-solving",
  title: "Water in the storage locker",
  segments: [
    {
      id: "ls1-problem-seg-1",
      turns: [
        {
          speaker: "Marisol Ferrand",
          text: "Desmond, I'm glad I caught you. I've just come up from the basement, and there's water all through my storage locker.",
        },
        {
          speaker: "Desmond Achebe",
          text: "Water? Which locker is yours, Marisol?",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Twenty-seven. The one at the far end, past the laundry room. The floor is soaked and two of my boxes have gone soft.",
        },
        {
          speaker: "Desmond Achebe",
          text: "That end backs onto the riser. A pipe behind the wall let go on the weekend, and we only found it Monday.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Nobody told me. I went down last night after work and stepped straight into it.",
        },
        {
          speaker: "Desmond Achebe",
          text: "We put a notice on the lobby board Monday afternoon. I'm sorry — that clearly wasn't enough.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "So Tuesday evening is when I found out, and by then it had been sitting there for three days.",
        },
        {
          speaker: "Desmond Achebe",
          text: "What's in there? I need to know before I call anyone.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Books, mostly — four boxes of them. A folding table, my winter tires, and a box of my daughter's school things.",
        },
        {
          speaker: "Desmond Achebe",
          text: "When did you last open the locker?",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Three weeks ago, before I went away. The tires were up on the pallet, the boxes were on the floor beside it.",
        },
        {
          speaker: "Desmond Achebe",
          text: "That's the difference, then. The tires were out of the water and the cardboard was standing in it.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Can I move anything today? I don't want to leave it down there getting worse.",
        },
        {
          speaker: "Desmond Achebe",
          text: "Leave it exactly where it is until you've photographed it. I'll explain why in a moment.",
        },
      ],
    },
    {
      id: "ls1-problem-seg-2",
      turns: [
        {
          speaker: "Desmond Achebe",
          text: "There are two ways to claim, and they run at different speeds. Listen to both before you decide.",
        },
        {
          speaker: "Desmond Achebe",
          text: "The building's insurer covers the failure itself. That claim is thorough, but it takes six to eight weeks to pay out.",
        },
        {
          speaker: "Desmond Achebe",
          text: "Your own tenant policy would pay in about two weeks, but you'd carry the deductible yourself. Most are five hundred dollars.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Mine is four hundred. But the books alone are worth more than that, so the deductible isn't the whole question.",
        },
        {
          speaker: "Desmond Achebe",
          text: "It isn't. Either way I need an inventory from you — every item, what you paid, and a photograph of each.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "How long do I have?",
        },
        {
          speaker: "Desmond Achebe",
          text: "Ten days from today. The insurer won't look at anything filed after that, and I can't get you an extension.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "I don't have receipts for boxes I packed years ago.",
        },
        {
          speaker: "Desmond Achebe",
          text: "Then write what you remember and say it's an estimate. An honest estimate is accepted; a guess dressed as a receipt is not.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "And the locker itself? I can't leave everything on a wet floor for ten days.",
        },
        {
          speaker: "Desmond Achebe",
          text: "The wall comes out on Thursday and the repair runs to the end of the month. Twenty-seven is unusable until then.",
        },
        {
          speaker: "Desmond Achebe",
          text: "I can give you forty-one on the north side. It's dry, but it's about half the size of yours.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Half. So the table stays behind.",
        },
        {
          speaker: "Desmond Achebe",
          text: "The table wasn't going anywhere anyway. Anything you're claiming for has to stay put until the adjuster has seen it.",
        },
      ],
    },
    {
      id: "ls1-problem-seg-3",
      turns: [
        {
          speaker: "Marisol Ferrand",
          text: "So what do I actually do first?",
        },
        {
          speaker: "Desmond Achebe",
          text: "Photograph everything tonight, before anything dries out or gets moved. Wet cardboard looks like dry cardboard in a week.",
        },
        {
          speaker: "Desmond Achebe",
          text: "I'll email you the inventory form this afternoon. Fill it in as far as you can and send it back to me.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Not to the insurer directly?",
        },
        {
          speaker: "Desmond Achebe",
          text: "No. Everything goes through this office, or the claim gets a second file number and the two never meet.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "And the key for forty-one?",
        },
        {
          speaker: "Desmond Achebe",
          text: "Pick it up at the office. We're open nine to four on weekdays, but we close for lunch between twelve and one.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "I could come tomorrow afternoon, around two.",
        },
        {
          speaker: "Desmond Achebe",
          text: "I'm at the Fairlawn building all day Thursday. Friday morning is better — I'm here from nine.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Friday morning, then. Can somebody help me carry the tires up? They're heavier than they look.",
        },
        {
          speaker: "Desmond Achebe",
          text: "Ravi is on site Friday until noon. Ask him when you collect the key, not before — he's on the boiler until then.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Understood. Photographs tonight, the form back to you, key on Friday.",
        },
        {
          speaker: "Desmond Achebe",
          text: "And the inventory inside ten days. That's the only date in this that nobody can move, including me.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Ten days. I'll have it to you long before that.",
        },
        {
          speaker: "Desmond Achebe",
          text: "One more thing. Don't throw out anything you've claimed for, even the boxes that are falling apart.",
        },
        {
          speaker: "Marisol Ferrand",
          text: "Even the ruined ones?",
        },
        {
          speaker: "Desmond Achebe",
          text: "Especially those. The adjuster pays for what he can see, and a photograph of an empty corner proves nothing.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "ls1-problem-q1",
      segmentId: "ls1-problem-seg-1",
      stem: "What has happened to the woman's storage locker?",
      options: [
        "A pipe behind the wall failed and flooded it",
        "The laundry room next to it overflowed",
        "Someone opened it while she was away",
        "Rain came in through a vent in the ceiling",
      ],
      answer: 0,
      explanation:
        "The manager says a pipe behind the wall let go on the weekend. The laundry room is named in this segment, but only as a landmark for where her locker is — \"the one at the far end, past the laundry room\". A place given as a direction is the easiest thing in a spoken description to remember as a cause.",
    },
    {
      id: "ls1-problem-q2",
      segmentId: "ls1-problem-seg-1",
      stem: "When did the woman herself find out about the water?",
      options: [
        "On the weekend, when the pipe failed",
        "On Monday afternoon, from the notice in the lobby",
        "On Tuesday evening, when she went down after work",
        "Three weeks ago, the last time she opened the locker",
      ],
      answer: 2,
      explanation:
        "Four different days are named in half a minute and each one belongs to a different event: the pipe failed on the weekend, the building found it Monday and posted a notice that afternoon, she went down after work on Tuesday evening, and three weeks ago is when she last opened the locker. The question asks when SHE found out, and she says so herself — \"so Tuesday evening is when I found out\".",
    },
    {
      id: "ls1-problem-q3",
      segmentId: "ls1-problem-seg-1",
      stem: "Why were her tires undamaged when her boxes were not?",
      options: [
        "She had taken the tires out of the locker before going away",
        "The tires were up on a pallet and the boxes were on the floor",
        "The boxes were stacked against the wall the water came from",
        "The tires had been wrapped in plastic for the summer",
      ],
      answer: 1,
      explanation:
        "She describes the arrangement and he draws the conclusion: the tires were out of the water and the cardboard was standing in it. The third option is the tempting one, because the wall really is where the water came from — but nothing in the conversation says the boxes were nearer to it. An answer that merely sounds like the right kind of reason is the characteristic trap of this part.",
    },
    {
      id: "ls1-problem-q4",
      segmentId: "ls1-problem-seg-2",
      stem: "How do the two ways of claiming differ?",
      options: [
        "The building's insurer pays sooner, but it covers less of the damage",
        "Her own policy pays sooner, but she would pay the deductible herself",
        "Her own policy pays more, but it takes six to eight weeks to arrive",
        "The building's insurer needs no inventory, but it pays only for furniture",
      ],
      answer: 1,
      explanation:
        "The building's insurer takes six to eight weeks; her own tenant policy pays in about two, with the deductible coming out of her pocket. The first option reverses the two speeds, which is what happens if you hold on to \"six to eight weeks\" without holding on to whose claim it was. And the inventory is required either way — he says so before he names any deadline at all.",
    },
    {
      id: "ls1-problem-q5",
      segmentId: "ls1-problem-seg-2",
      stem: "What must she supply, and by when?",
      options: [
        "Receipts for every item, within ten days",
        "A list of the items with a photograph of each, within ten days",
        "A list of the items with photographs, before the end of the month",
        "Receipts and photographs, before the wall is opened on Thursday",
      ],
      answer: 1,
      explanation:
        "Every item, what she paid, and a photograph of each, ten days from today. Receipts are the deliberate trap: she says she has none, and his answer is that an honest written estimate is accepted instead. The end of the month and Thursday are both real dates in this segment — the repair finishing and the wall coming out — and neither is the filing deadline.",
    },
    {
      id: "ls1-problem-q6",
      segmentId: "ls1-problem-seg-2",
      stem: "What is the drawback of the locker he offers her?",
      options: [
        "It is damp as well",
        "It is only hers until the end of the month",
        "It is about half the size of her own",
        "It is on the far side of the laundry room",
      ],
      answer: 2,
      explanation:
        "Forty-one is dry — he says so — but about half the size. The end of the month is in the segment as when the repair to her own locker finishes, not as a date the loan runs out, and reading a deadline onto the wrong thing is exactly the mistake this part is built to catch.",
    },
    {
      id: "ls1-problem-q7",
      segmentId: "ls1-problem-seg-3",
      stem: "When have they agreed she will collect the key?",
      options: [
        "Tomorrow afternoon, at about two",
        "Friday morning, from nine",
        "Friday at noon, when the caretaker finishes",
        "Thursday, at the Fairlawn building",
      ],
      answer: 1,
      explanation:
        "She proposes tomorrow afternoon; he is at the Fairlawn building all day Thursday and offers Friday morning from nine; she agrees. Noon is in the segment as when Ravi's shift ends, not as a time to meet. In this part the first time somebody names is rarely the time they settle on — note the proposal, then wait for the agreement before you write it down.",
    },
    {
      id: "ls1-problem-q8",
      segmentId: "ls1-problem-seg-3",
      stem: "What does he tell her to do with the ruined boxes?",
      options: [
        "Bring them to the office with the completed form",
        "Throw them out once she has photographed them",
        "Keep them until the adjuster has seen them",
        "Move them into locker forty-one on Friday",
      ],
      answer: 2,
      explanation:
        "\"Don't throw out anything you've claimed for, even the boxes that are falling apart\" — because the adjuster pays for what he can see. Photographing them is required too, but that is in addition, not instead. Moving them is the opposite of what he asks: anything being claimed for stays where it is until the adjuster has been.",
    },
  ],
};

/**
 * Part 2 shape: Listening to a Daily Life Conversation.
 *
 * Two friends, one segment, casual register — and the part where the answer is
 * often something neither speaker ever says. Problem solving above tests
 * whether she caught a number; this tests whether she caught a decision that
 * was made without being announced.
 *
 * THREE of the five questions below are answered by implication rather than by
 * recall, and that is deliberate: a conversation part answered entirely by
 * looking up stated facts is a news item with two voices, not the part shape it
 * claims to be. One speaker here declines two things without once saying no —
 * she answers a question about going back to her class by talking about the
 * fees, and answers an invitation by naming a plan that has not been made — and
 * the other names both refusals out loud so that the transcript, read after
 * answering, shows the learner where the evidence was.
 *
 * The short turns are the register, not only the word ceiling. Real
 * conversation interrupts itself, and two- and three-word turns are what make
 * the pauses land as pauses when the engine speaks them one utterance at a time.
 */
const DAILY_CONVERSATION_PART: CelpipListeningPart = {
  id: "ls1-daily-conversation",
  kind: "daily-conversation",
  title: "The bag she keeps carrying",
  segments: [
    {
      id: "ls1-daily-seg-1",
      turns: [
        {
          speaker: "Amir Haddad",
          text: "You've got your bag with you. Aren't you supposed to be at the studio tonight?",
        },
        {
          speaker: "Delphine Roy",
          text: "I was. I've been carrying that bag around on Tuesdays for a month without opening it.",
        },
        {
          speaker: "Amir Haddad",
          text: "A month? I thought you loved that class. You talked about nothing else in February.",
        },
        {
          speaker: "Delphine Roy",
          text: "February was Nadia. She left in March, and the man who took over teaches it like a driving test.",
        },
        {
          speaker: "Amir Haddad",
          text: "That bad?",
        },
        {
          speaker: "Delphine Roy",
          text: "He's very good. He corrects your hands while you're working, and I can't think with someone doing that.",
        },
        {
          speaker: "Amir Haddad",
          text: "Have you said anything to him?",
        },
        {
          speaker: "Delphine Roy",
          text: "What would I say? He's doing exactly what he was hired to do, and doing it well.",
        },
        {
          speaker: "Amir Haddad",
          text: "The term runs to June, doesn't it? That's another eight weeks of Tuesdays.",
        },
        {
          speaker: "Delphine Roy",
          text: "The fees are paid through June, yes.",
        },
        {
          speaker: "Amir Haddad",
          text: "That's not what I asked.",
        },
        {
          speaker: "Delphine Roy",
          text: "I know.",
        },
        {
          speaker: "Amir Haddad",
          text: "So you're not going back.",
        },
        {
          speaker: "Delphine Roy",
          text: "I didn't say that. I said the fees are paid.",
        },
        {
          speaker: "Amir Haddad",
          text: "You've said it four times now, in four different ways.",
        },
        {
          speaker: "Delphine Roy",
          text: "Anyway. Are you still driving out to the coast on the long weekend?",
        },
        {
          speaker: "Amir Haddad",
          text: "That's a change of subject.",
        },
        {
          speaker: "Delphine Roy",
          text: "It is. Are you?",
        },
        {
          speaker: "Amir Haddad",
          text: "Saturday morning, early. There's room in the car if you want it — Ines dropped out.",
        },
        {
          speaker: "Delphine Roy",
          text: "That's kind. My sister might be down that weekend. I'd hate to say yes and leave you short.",
        },
        {
          speaker: "Amir Haddad",
          text: "Might be.",
        },
        {
          speaker: "Delphine Roy",
          text: "She hasn't booked anything yet.",
        },
        {
          speaker: "Amir Haddad",
          text: "So that's a no as well.",
        },
        {
          speaker: "Delphine Roy",
          text: "That's a maybe. Ask me Thursday.",
        },
        {
          speaker: "Amir Haddad",
          text: "I asked you last Thursday, and the Thursday before that.",
        },
        {
          speaker: "Delphine Roy",
          text: "Then you already know the answer, and you're making me say it out loud.",
        },
        {
          speaker: "Amir Haddad",
          text: "I'm not making you do anything. I'll give the seat to somebody else on Thursday.",
        },
        {
          speaker: "Delphine Roy",
          text: "That's probably sensible.",
        },
        {
          speaker: "Amir Haddad",
          text: "It is. And take the bag home, Delphine. Carrying it isn't keeping the class open for you.",
        },
        {
          speaker: "Delphine Roy",
          text: "I'll take it home.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "ls1-daily-q1",
      segmentId: "ls1-daily-seg-1",
      stem: "Why has the woman stopped enjoying her class?",
      options: [
        "The class moved to a night she cannot make",
        "The teacher she liked left and the new one works differently",
        "The fees went up at the start of the term",
        "She has run out of things she wants to make",
      ],
      answer: 1,
      explanation:
        "Nadia left in March, and the man who replaced her corrects the students' hands while they work. Notice how carefully she avoids criticising him — \"he's very good\", \"doing exactly what he was hired to do\". The objection is to being interrupted mid-thought, not to his ability, and hearing that difference is what tells you the class is what changed rather than her.",
    },
    {
      id: "ls1-daily-q2",
      segmentId: "ls1-daily-seg-1",
      stem: "What has the woman decided, without ever saying it directly?",
      options: [
        "To speak to the new teacher about how he teaches",
        "To ask for the rest of her fees back",
        "To stop going to the class",
        "To wait until June and then sign up again",
      ],
      answer: 2,
      explanation:
        "She never says she has quit. She says she has carried the bag on Tuesdays for a month without opening it; she answers \"so you're not going back\" by repeating that the fees are paid; and at the end she agrees to take the bag home. Her friend names it for her — \"you've said it four times now, in four different ways\" — and she does not argue. In this part, the thing somebody keeps not answering is usually the answer.",
    },
    {
      id: "ls1-daily-q3",
      segmentId: "ls1-daily-seg-1",
      stem: "Why does she ask about the trip to the coast when she does?",
      options: [
        "She wants him to invite her along",
        "She wants to get off the subject of the class",
        "She has already made plans for the long weekend",
        "She wants him to leave later on Saturday",
      ],
      answer: 1,
      explanation:
        "He says it in four words — \"that's a change of subject\" — and she agrees that it is. The invitation comes anyway, which is what makes the first option sound reasonable, but the offer is his idea and he only makes it because someone else dropped out. She asks the question to end the previous one.",
    },
    {
      id: "ls1-daily-q4",
      segmentId: "ls1-daily-seg-1",
      stem: "What does the man offer her?",
      options: [
        "A seat in his car to the coast, now that someone has dropped out",
        "A lift to the studio on Tuesday evenings",
        "To speak to the new teacher on her behalf",
        "To carry the bag home for her",
      ],
      answer: 0,
      explanation:
        "Ines dropped out, so there is room in the car, leaving Saturday morning early. He does tell her to take the bag home, but that is an instruction to her, not an offer to do it himself — and telling the two apart is a matter of noticing who would be doing the carrying.",
    },
    {
      id: "ls1-daily-q5",
      segmentId: "ls1-daily-seg-1",
      stem: "How does the man treat her answer about the weekend?",
      options: [
        "He accepts that she will decide by Thursday",
        "He offers to hold the seat until her sister has booked",
        "He treats it as a refusal and says he will give the seat away",
        "He agrees to ask her again next week",
      ],
      answer: 2,
      explanation:
        "\"So that's a no as well.\" She asks him to ask again on Thursday, which is what she asked on the two previous Thursdays, and he declines to do it a fourth time: he will give the seat to somebody else. Thursday is said three times in this conversation and only the last one is a decision — the other two are requests to be asked later, which is the polite shape a no takes here.",
    },
  ],
};

/**
 * Part 3 shape: Listening for Information.
 *
 * One speaker, one segment, and the part that tests SEQUENCE as much as detail.
 * The script is a structured explanation with a fixed internal order — four
 * benches a bicycle passes through, a three-colour classification assigned at
 * one of them, an order of operations inside the longest stage, and a rule about
 * where a failure sends the work back to. Three of the six questions below can
 * only be answered by someone who tracked that order; knowing every fact in the
 * talk and none of its shape answers them wrong.
 *
 * That is the whole reason this part exists in the exam and the reason it is
 * hard to rehearse on paper: a written explanation can be re-read in any order,
 * and a spoken one arrives once, in one order, and is gone.
 *
 * NOT a reading passage in disguise. A spoken talk and an information text read
 * differently — the talk repeats itself, addresses the listener, and signposts
 * its own structure out loud ("bench two is assessment") because the listener
 * cannot scan back. Reusing a script as a Reading passage, or the reverse, is
 * rejected on the record: it would blunt exactly the format fidelity D-07 buys.
 *
 * The distractors follow the house rule — every one of them is a fact the talk
 * really does state, standing in the wrong place in the sequence.
 */
const INFORMATION_PART: CelpipListeningPart = {
  id: "ls1-information",
  kind: "information",
  title: "What happens to a donated bicycle",
  segments: [
    {
      id: "ls1-information-seg-1",
      turns: [
        {
          speaker: "Priya Ramnath",
          text: "Welcome to your first shift. Before you pick up a tool, you need the order a donated bicycle moves through.",
        },
        {
          speaker: "Priya Ramnath",
          text: "There are four benches in this workshop, and every bicycle visits them in the same fixed sequence. Nothing skips ahead.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Bench one is intake. You wheel the bicycle in, wipe the frame down, and tie a numbered tag to the handlebar.",
        },
        {
          speaker: "Priya Ramnath",
          text: "At intake we write down three things only: the frame size, the wheel size, and whether the frame is cracked.",
        },
        {
          speaker: "Priya Ramnath",
          text: "A cracked frame ends it there. It goes straight to the metal bin, and nobody wastes an hour finding out later.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Bench two is assessment. This is where the colour code is decided: green, amber or red.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Green means cleaning and adjustment only. Amber means it needs parts we already keep in the drawers behind you.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Red means a part we would have to buy, so a coordinator decides before any work starts.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Bench three is the repair bench, and it is the longest stage by far.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Work outward from the wheels. Tyres and tubes first, then the brakes, then the drivetrain, then the seat and handlebars.",
        },
        {
          speaker: "Priya Ramnath",
          text: "That order is not a preference. A brake set before the wheel is trued has to be set a second time.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Bench four is the safety check, and you never sign your own. Somebody else checks what you did.",
        },
        {
          speaker: "Priya Ramnath",
          text: "The checker rides it round the yard, tests both brakes from walking speed, and pulls hard on the bars.",
        },
        {
          speaker: "Priya Ramnath",
          text: "If anything fails, the bicycle goes back to bench three, not to bench two. It keeps the colour code it already has.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Once it passes, the tag is signed and dated and the bicycle goes to the rack by the door.",
        },
        {
          speaker: "Priya Ramnath",
          text: "From that rack they leave in one of two ways, and a coordinator decides which. That is not ours to decide.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Adult bicycles are sold here on Saturday mornings, and that money is what buys the parts in the drawers.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Children's bicycles are given away, every one of them, through the two family centres on Corley Road.",
        },
        {
          speaker: "Priya Ramnath",
          text: "One last rule, about the tags. A tag stays on until the bicycle leaves the building.",
        },
        {
          speaker: "Priya Ramnath",
          text: "Find an untagged bicycle anywhere in here and walk it back to bench one. It starts again from intake.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "ls1-information-q1",
      segmentId: "ls1-information-seg-1",
      stem: "In what order does a bicycle move through the four benches?",
      options: [
        "Assessment, intake, repair, safety check",
        "Intake, repair, assessment, safety check",
        "Intake, assessment, repair, safety check",
        "Intake, assessment, safety check, repair",
      ],
      answer: 2,
      explanation:
        "Intake, assessment, repair, safety check — she numbers the benches out loud as she goes, which is the signposting a spoken explanation has to do because you cannot scan back. Every one of the four names appears in the talk, so recognising the words is no help here at all; only the order separates the options. This is the question to answer by writing four short words down the side of your page as she says them, rather than by trying to hold the sequence in your head to the end.",
    },
    {
      id: "ls1-information-q2",
      segmentId: "ls1-information-seg-1",
      stem: "What is written down at the first bench?",
      options: [
        "The frame size, the wheel size, and whether the frame is cracked",
        "The colour code and the parts the bicycle will need",
        "The frame size and the name of the person who donated it",
        "The wheel size and the Saturday the bicycle will be sold",
      ],
      answer: 0,
      explanation:
        "Three things only, and she says \"three things only\" before naming them. The colour code is real but it belongs to bench two, one stage later, and the Saturday sale is real but it is decided at the very end by a coordinator. Both wrong options are made entirely of true statements filed at the wrong bench — which is the characteristic mistake in this part, and the reason a note that records WHEN something was said beats a note that only records what.",
    },
    {
      id: "ls1-information-q3",
      segmentId: "ls1-information-seg-1",
      stem: "What does an amber code mean?",
      options: [
        "The bicycle needs cleaning and adjustment only",
        "The bicycle needs parts the workshop already keeps in stock",
        "The bicycle needs a part that would have to be bought",
        "The bicycle's frame is cracked and it will be scrapped",
      ],
      answer: 1,
      explanation:
        "Amber sits between the other two: green is cleaning and adjustment, red is a part that has to be bought and therefore needs a coordinator's decision first. A three-way classification spoken aloud in one breath is one of the two things this part is built to test, and the trap is that all three colours are defined in the same twenty seconds, in order, so the definitions blur together unless you write the colour beside its meaning as it arrives.",
    },
    {
      id: "ls1-information-q4",
      segmentId: "ls1-information-seg-1",
      stem: "In what order should the repairs themselves be done?",
      options: [
        "Brakes first, then the wheels, then the drivetrain, then the seat",
        "The wheels first, then the brakes, then the drivetrain, then the seat and handlebars",
        "The drivetrain first, then the brakes, then the wheels",
        "Whatever is most obviously broken, in any order that suits you",
      ],
      answer: 1,
      explanation:
        "Outward from the wheels: tyres and tubes, brakes, drivetrain, seat and handlebars. She also gives the reason, which is the part worth holding on to — a brake set before the wheel is trued has to be set twice — and the reason is what makes the first option identifiable as the reversal it is. When a talk explains WHY an order is what it is, the explanation is usually there because a question is coming.",
    },
    {
      id: "ls1-information-q5",
      segmentId: "ls1-information-seg-1",
      stem: "What happens to a bicycle that fails the safety check?",
      options: [
        "It is scrapped, because it has already had its turn at the repair bench",
        "It goes back to the repair bench and keeps the colour code it was given",
        "It goes back to assessment and is given a new colour code",
        "It goes back to intake and is issued with a new tag",
      ],
      answer: 1,
      explanation:
        "Back to bench three, not to bench two, and the code does not change. She states the distinction as a negative — \"not to bench two\" — which is easy to hear as the opposite of what it means if you catch only the bench number. Going back to intake is a real rule in this talk as well, but it applies to an untagged bicycle, not to a failed check. Where a process sends a failure is exactly the kind of thing you can only answer by having followed the shape of it.",
    },
    {
      id: "ls1-information-q6",
      segmentId: "ls1-information-seg-1",
      stem: "How do finished bicycles leave the workshop?",
      options: [
        "All of them are sold at the Saturday morning sale",
        "All of them are given away through the two family centres",
        "Adult bicycles are sold, and children's bicycles are given away",
        "The volunteer who repaired the bicycle decides which way it goes",
      ],
      answer: 2,
      explanation:
        "Two routes, split by who the bicycle is for: adult bicycles are sold on Saturday mornings and children's are given away through the family centres. The last option is the one to reject on principle rather than on memory — she says twice that a coordinator makes this decision and that it is not the volunteers' to make. Sales and gifts are also connected: the Saturday money is what fills the parts drawers, which is why an amber bicycle costs the workshop nothing extra and a red one has to be approved.",
    },
  ],
};

/**
 * Part 6 shape: Listening to Viewpoints.
 *
 * The longest script in the set and the FEWEST items on it — five questions
 * across roughly four hundred and fifty words. That ratio is not an oversight in
 * the exam's design, it is the difficulty: there is no rhythm of question after
 * question to keep attention up, and a listener who drifts for twenty seconds
 * has no way of knowing whether the thing she missed was one of the five.
 *
 * One speaker, several positions. What this part tests is not what was said but
 * WHO HOLDS IT and IN WHAT WAY — a counted measurement, a position attributed to
 * a named person, a position attributed to a group that turns out to be divided,
 * a claim the speaker explicitly declines to endorse, and finally the speaker's
 * own view, which she flags as a view. Four of the five questions turn on that
 * distinction rather than on recall, because a viewpoints part answered entirely
 * by looking up stated facts is the wrong part shape wearing the right label.
 *
 * The speaker signposts the distinction out loud — "some of what I am going to
 * tell you was measured, some of it is what people believe" — which is what a
 * talk has to do and what an article does not, because a reader can go back and
 * a listener cannot. That signposting is also the trap: she says it once, near
 * the start, and everything afterwards depends on having believed her.
 */
const VIEWPOINTS_PART: CelpipListeningPart = {
  id: "ls1-viewpoints",
  kind: "viewpoints",
  title: "The street that stopped taking cars",
  segments: [
    {
      id: "ls1-viewpoints-seg-1",
      turns: [
        {
          speaker: "Constance Ilesanmi",
          text: "Good evening. Ferren Street has been closed to cars for eighteen months, and in March the council votes on making that permanent.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "I have spent six weeks talking to people, and tonight I want to be careful about which is which.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Some of what I am about to tell you was measured. Some of it is what people believe. Those are different things.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Start with the measurement. The transport office counted foot traffic on the street every Saturday for a year.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Saturday footfall is up thirty-four per cent on the year before the closure. That figure is a count, not an argument.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "What it does not tell you is whether those people spent money. Nobody has measured that, and I will not pretend otherwise.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Now the positions. The shopkeepers' association wants the street reopened, and its chair has said so at three public meetings.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "His case is deliveries. He says his members are unloading forty metres from their own doors, in all weather.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "But the association is not the same thing as the shopkeepers. It surveyed its own members and they split almost evenly.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Nineteen wanted the cars back. Seventeen wanted the street left as it is. Four did not answer at all.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "So when you hear that the shopkeepers want the street reopened, that is one man's position and a very narrow majority.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "The café owners at the north end want the closure kept, and they are the loudest voice in favour of it.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "They also have eleven pavement tables that did not exist two years ago.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "The residents of Wendle Road and Ashcombe Lane have a different complaint, and it is the one I find most persuasive.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "The cars did not disappear. They park on those two streets now, and the people living there did not vote for that.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "That is a real cost, carried by people who get none of the benefit, and nobody at the council has answered it.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "One more claim, and this is the one I would like you to be careful with.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "You will hear that the closure has cut emissions across the town. It may have done. Nobody has measured it here.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "That number comes from other towns, and other towns are not this one. Treat it as a belief until somebody counts something.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Here is my own view, and I will say plainly that it is a view and not a finding.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Keep Ferren Street closed. It has made the middle of this town a better place to stand in, and that matters.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "But not in March. Not before the parking on Wendle and Ashcombe has been dealt with properly.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "Moving a problem two streets over is not a policy. It is a postponement.",
        },
        {
          speaker: "Constance Ilesanmi",
          text: "You will hear tonight's numbers again before the vote. Ask each time whether somebody counted it, or somebody believes it.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "ls1-viewpoints-q1",
      segmentId: "ls1-viewpoints-seg-1",
      stem: "What is the council due to decide in March?",
      options: [
        "Whether to close Ferren Street to cars for a trial period",
        "Whether to make the closure of Ferren Street permanent",
        "Whether to bring in parking permits on Wendle Road and Ashcombe Lane",
        "Whether the cafés may keep their tables on the pavement",
      ],
      answer: 1,
      explanation:
        "The closure has already run for eighteen months as a trial; March is the vote on making it permanent. This is the only straightforwardly factual question in this part, and it is deliberately the first — in a talk this long the opening sentence is the one you are most likely to hear properly, and the one you are most likely to have stopped holding on to by the end.",
    },
    {
      id: "ls1-viewpoints-q2",
      segmentId: "ls1-viewpoints-seg-1",
      stem: "Which of these does the speaker present as something that was actually measured?",
      options: [
        "That the closure has reduced emissions across the town",
        "That the street is a better place to stand in than it was",
        "That Saturday foot traffic rose by thirty-four per cent",
        "That shoppers on the street are spending more than they used to",
      ],
      answer: 2,
      explanation:
        "Only the footfall was counted, every Saturday for a year, and she says of it that a figure is a count and not an argument. Each wrong option is something the talk really does contain: emissions she explicitly refuses to endorse, the street being pleasant to stand in is her own stated view, and spending she names as the thing nobody has measured. Hearing a number is not the same as hearing that it was counted here — and in this part that is the whole difference.",
    },
    {
      id: "ls1-viewpoints-q3",
      segmentId: "ls1-viewpoints-seg-1",
      stem: "What does she say about the shopkeepers' position?",
      options: [
        "The shopkeepers are united in wanting the cars back",
        "The association's chair wants the cars back, but its members are close to evenly split",
        "The shopkeepers have refused to give the association any position at all",
        "The shopkeepers now agree with the café owners at the north end",
      ],
      answer: 1,
      explanation:
        "Nineteen to seventeen with four silent, against a chair who has argued for reopening at three public meetings. She then does the work for you — \"that is one man's position and a very narrow majority\" — which is the sentence to be listening for. A group is named as holding a view and then shown to be divided about it, and telling the two apart is the skill this part exists to test.",
    },
    {
      id: "ls1-viewpoints-q4",
      segmentId: "ls1-viewpoints-seg-1",
      stem: "How does she treat the claim that the closure has cut the town's emissions?",
      options: [
        "She accepts it, because it has been measured in other towns",
        "She rejects it as untrue",
        "She says it may be true, but that nobody has measured it here",
        "She says the transport office is measuring it at the moment",
      ],
      answer: 2,
      explanation:
        "\"It may have done. Nobody has measured it here.\" She neither accepts nor rejects it — she reclassifies it, from a finding to a belief, and asks you to hold it that way until someone counts something. Rejecting it outright is the tempting misreading, because she warns you about the claim before she states it; but a warning to be careful with something is not a denial of it, and this part will punish the difference.",
    },
    {
      id: "ls1-viewpoints-q5",
      segmentId: "ls1-viewpoints-seg-1",
      stem: "What is the speaker's own position?",
      options: [
        "Reopen the street, because the residents' complaint outweighs the benefit",
        "Keep the street closed, and vote for it in March",
        "Keep the street closed, but not until the displaced parking has been dealt with",
        "Take no position until somebody has counted what shoppers spend",
      ],
      answer: 2,
      explanation:
        "She is for the closure and against the timing: keep the street closed, but not in March, and not before Wendle and Ashcombe are sorted out. The second option is the trap, and it is a good one — she does say keep it closed, and it takes the next sentence to learn that she would vote against it in March anyway. A position with a condition attached is still one position, and dropping the condition changes it into a different answer.",
    },
  ],
};

/** Words in one turn, counted the same way the content harness counts them. */
function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * How long the whole set should take, and WHERE THE NUMBER COMES FROM.
 *
 * Two terms, both derived from the parts themselves:
 *
 *   1. The audio. Every turn in every segment of every part, totalled, divided
 *      by the app's actual speaking rate — a nominal 150 words per minute at the
 *      rate 0.95 that `celpip-speech.ts` sets, so about 142 words a minute.
 *   2. The answering. One minute per question, across every part.
 *
 * The sum is rounded up. Nothing here is typed in by hand, which is the point:
 * a limit shorter than the audio would run the clock out on a learner who is
 * still listening and has not yet been shown a question, and that is a defect no
 * assertion can find because the two numbers would both look reasonable.
 *
 * PROVISIONAL while the set is incomplete, and it MOVES ON ITS OWN the moment a
 * part is appended or removed — including the exam part shapes this set does not
 * carry yet. No count of what exists is written into this comment on purpose:
 * coverage is derived from `SET_1_PARTS` everywhere it is reported, on the
 * landing and in the harness summary, and a number repeated in prose is the one
 * that goes stale. The real exam gives roughly 47-55 minutes for all six parts.
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

/**
 * IN EXAM ORDER, not in the order the parts were written. See the note at the
 * top of the file: this array is the order she hears them in, and the harness
 * asserts it is a subsequence of the exam's six.
 */
const SET_1_PARTS: CelpipListeningPart[] = [
  PROBLEM_SOLVING_PART,
  DAILY_CONVERSATION_PART,
  INFORMATION_PART,
  NEWS_ITEM_PART,
  VIEWPOINTS_PART,
];

export const LISTENING_SET_1: CelpipListeningSet = {
  id: "listening-set-1",
  title: "Listening Set 1",
  timeLimitMinutes: estimatedMinutes(SET_1_PARTS),
  parts: SET_1_PARTS,
};

export const LISTENING_SET_BANK: CelpipListeningSet[] = [LISTENING_SET_1];
