import type { CelpipSpeakingPrompt } from "../celpip";

// CELPIP Speaking prompt bank: original scenarios in everyday-Canadian contexts.
// ALL original content — written from the exam FORMAT only, no text copied
// from third-party material (see .planning IP constraints for this phase).
//
// Eight prompts, one per exam task shape. D-07's structure fidelity: what the
// learner needs is to RECOGNISE each shape when it arrives, and eight
// recognisable shapes are worth more than sixteen prompts of two shapes.

/**
 * Prep seconds then response seconds, by the exam's own task number.
 *
 * CONFIRMED, not inferred. RESEARCH logged these as assumption A2 because the
 * awarding body's site refuses automated fetch and every reachable source was a
 * third-party prep site; that assumption is now resolved against the learner's
 * own official format material.
 *
 * Only the STRUCTURE crossed over — the task names and these numbers. Times and
 * counts are facts about a test, not authorship, and not one word of that
 * material appears anywhere in this repository (D-06). Every scenario, scene
 * and tip below was written from scratch.
 *
 * One lookup rather than sixteen numbers scattered across eight objects: a
 * correction is then a single edit, and `withExamTimings` below makes it
 * impossible for a prompt to carry a pair that is not in this table.
 */
export const SPEAKING_TASK_TIMINGS: Record<
  number,
  { prepSeconds: number; responseSeconds: number }
> = {
  1: { prepSeconds: 30, responseSeconds: 90 },
  2: { prepSeconds: 30, responseSeconds: 60 },
  3: { prepSeconds: 30, responseSeconds: 60 },
  4: { prepSeconds: 30, responseSeconds: 60 },
  5: { prepSeconds: 60, responseSeconds: 60 },
  6: { prepSeconds: 60, responseSeconds: 60 },
  7: { prepSeconds: 30, responseSeconds: 90 },
  8: { prepSeconds: 30, responseSeconds: 60 },
};

/** A prompt as authored: everything except the two numbers, which are not the
 * author's to choose. */
type SpeakingPromptSeed = Omit<CelpipSpeakingPrompt, "prepSeconds" | "responseSeconds">;

function withExamTimings(seed: SpeakingPromptSeed): CelpipSpeakingPrompt {
  const timing = SPEAKING_TASK_TIMINGS[seed.taskNumber];
  if (!timing) {
    // Loud rather than silent: a prompt whose task number has no entry would
    // otherwise rehearse her against a window the exam does not give her, which
    // is the one thing this section exists to get right.
    throw new Error(
      `CELPIP Speaking: no exam timing for task ${seed.taskNumber} (prompt "${seed.id}")`,
    );
  }
  return {
    ...seed,
    prepSeconds: timing.prepSeconds,
    responseSeconds: timing.responseSeconds,
  };
}

export const SPEAKING_TASK_PROMPTS: CelpipSpeakingPrompt[] = [
  withExamTimings({
    id: "speaking-advice-first-winter",
    shape: "advice",
    taskNumber: 1,
    title: "Advice for a first Canadian winter",
    scenario:
      "Your cousin is moving to Winnipeg in October to start a new job. She has never lived through a Canadian winter and she has asked you what she should do before the cold arrives. Give her your advice: what she should buy, what she should arrange in advance, and how she should look after herself through the first few months.",
    strategyTips: [
      "Say what your advice actually is in the first sentence, then spend the rest of the window supporting it. An answer that circles the situation for forty seconds before committing has spent half its time saying nothing.",
      "Two or three pieces of advice, each with a reason, beat six with none. What is being judged is how well you develop an idea, not how many you can list.",
      "Speak to her, not to the microphone. “You should”, “if I were you” and “make sure you” keep the register right for advice and come out naturally under pressure.",
      "The recording starts on its own and you will not feel ready. Have one full opening sentence prepared during the silent window so your first ten seconds are a sentence rather than filler.",
    ],
  }),

  withExamTimings({
    id: "speaking-experience-learned-in-a-hurry",
    shape: "personal-experience",
    taskNumber: 2,
    title: "A time you had to learn something in a hurry",
    scenario:
      "Think about a time when you had to learn something new in a hurry — a task at work, a piece of software, a skill for a course, or something at home that suddenly needed doing. Tell the story: what you had to learn, why the timing was so tight, how you went about it, and how it turned out.",
    strategyTips: [
      "Choose the story during the thinking window, and choose only one. Two half-told stories inside sixty seconds is the commonest way this task goes wrong.",
      "Give it a shape: when it happened, what the problem was, what you did, how it ended. A story with an ending sounds finished even if the countdown cuts you off mid-sentence.",
      "Past tenses are what this task quietly checks. “I had never used it before, so I spent the whole evening on it” shows more control than staying in the present the whole way through.",
    ],
  }),

  withExamTimings({
    id: "speaking-scene-community-rink",
    shape: "describe-scene",
    taskNumber: 3,
    title: "Describe a scene: Saturday morning at the community rink",
    // WHY THIS ONE READS INSTEAD OF LOOKING. Task 3 is image-based in the real
    // exam: a photograph appears and you describe it. This app ships no
    // original image, and an image is a different authoring skill and a
    // different cost from prose — so under D-01's "Speaking to a usable
    // minimum" the stimulus is written out and the substitution is said out
    // loud, in the scenario below, in the section's caveat on /celpip, and in
    // this comment. Overclaiming would cost her real preparation time on a
    // shape she will meet as a picture.
    //
    // OPEN CONTENT DEPENDENCY, not a closed decision. Substituting a genuine
    // original image later needs no type change beyond an optional
    // `sceneImage` field on CelpipSpeakingPrompt: the component already renders
    // `sceneDescription` as its own paragraph in both the brief and the
    // response view, so an image would slot in beside it and the written scene
    // could stay as the accessible alternative.
    scenario:
      "In the real exam this task puts a photograph in front of you and gives you thinking time to describe what is happening in it. This app has no original photograph to offer, so the scene is written out below instead. Read it, picture it, and then describe it out loud as though it were in front of you.",
    sceneDescription:
      "It is Saturday morning at a community rink. Along the boards a coach in an orange vest is kneeling to tighten a small child's skate, while three other children wait their turn, hanging on to the rail. Two teenagers race each other down the far side of the ice. Behind the glass in the warm-up room, a man in a parka is pouring coffee from a thermos and a woman is holding up her phone to photograph the ice. A mop and a yellow wet-floor sign stand by the propped-open door, where melted snow has spread across the rubber matting.",
    strategyTips: [
      "Open with the whole scene in one sentence — where it is and what is going on — and only then move through the details, in an order somebody could follow: near to far, or one side to the other.",
      "Stay in the present continuous the whole way. A scene is happening now: “a coach is kneeling down” is the register this task wants, and “a coach knelt down” quietly turns it into a story.",
      "When you run out of people, describe what is around them — the weather, the objects, the mess by the door. Running dry at forty seconds is what loses marks here, and there is always more in the picture than you think.",
    ],
  }),

  withExamTimings({
    id: "speaking-predictions-new-transit-stop",
    shape: "predictions",
    taskNumber: 4,
    title: "What happens to this street next",
    scenario:
      "A quiet street near your home has just had a new light-rail station open at the end of it. The shops along it are mostly small and family-run, and several of the houses are rented. Say what you think will happen to that street over the next five years, and why you expect it.",
    strategyTips: [
      "The task wants futures, so use the language of futures: “is likely to”, “I expect that”, “there will probably be”. Slipping into the present tense turns a prediction back into a description.",
      "Two or three predictions, each with the reason behind it, beat a list of six. The reason is what makes it a prediction rather than a guess.",
      "You are allowed to be wrong. Nobody is checking the forecast — they are checking whether you can build an argument about something that has not happened yet.",
    ],
  }),

  withExamTimings({
    id: "speaking-compare-downtown-or-suburb",
    shape: "compare-persuade",
    taskNumber: 5,
    title: "Downtown apartment or house in the suburbs",
    scenario:
      "Your parents are moving closer to you and have narrowed it down to two places: a small apartment downtown, five minutes from a hospital and the shops, or a house with a garden in a quieter suburb forty minutes away by bus. Choose one and persuade them it is the better place for them.",
    strategyTips: [
      "You get a full minute to prepare here, and it is a minute for choosing, not for wording. Pick your option in the first ten seconds and spend the rest lining up two solid reasons.",
      "Say once, briefly, what is good about the option you did not pick, then explain why it still loses. Persuading someone who is weighing both means showing that you weighed both too.",
      "Aim it at them and at their actual life — their knees, their bus route, their winter. A general argument about apartments and houses persuades nobody in particular.",
    ],
  }),

  withExamTimings({
    id: "speaking-difficult-missed-repair-call",
    shape: "difficult-situation",
    taskNumber: 6,
    title: "The technician who never came",
    scenario:
      "You booked a furnace repair and took a day off work to wait for the technician. Nobody arrived, nobody phoned, and the company has now charged you a call-out fee anyway. You are on the phone to their office. Say what you want to say to the person who has answered.",
    strategyTips: [
      "Stay firm and stay civil — the difficulty is the point of the task, and losing your temper is not what is being marked. “I understand these things happen, but I do need this sorted out” does both jobs in one sentence.",
      "Say what happened, then say what you want done about it. An answer that only complains has done half the task and stopped.",
      "This is speech to a person, so use what people actually say on the phone: “I'm calling because”, “what I'd like is”, “could you check something for me”.",
    ],
  }),

  withExamTimings({
    id: "speaking-opinion-back-to-the-office",
    shape: "opinion",
    taskNumber: 7,
    title: "Five days a week in the office",
    scenario:
      "Some employers have started requiring staff back in the office five days a week, ending the mixed home-and-office arrangements that had become normal for a lot of people. Say whether you think that is the right call for most workplaces, and defend your view against the obvious objections to it.",
    strategyTips: [
      "Ninety seconds is the longest window in the section, and an opinion stated once and then repeated will leave you stranded at the fifty-second mark. Plan three reasons in the thinking time, not one.",
      "State your position in the first sentence and stay on it. Changing sides halfway through reads as an unclear answer rather than as an open mind.",
      "Name the strongest argument against you out loud and say why it does not move you. That single move is what separates a defended opinion from an asserted one.",
    ],
  }),

  withExamTimings({
    id: "speaking-unusual-something-you-saw",
    shape: "unusual-situation",
    taskNumber: 8,
    title: "Something strange you saw",
    scenario:
      "Think of something you have seen or been caught up in that struck you as strange or out of the ordinary — an odd sight on the street, something unexpected at work, a mix-up while you were travelling. Describe it to a friend who was not there, so that they can picture it and understand why it seemed so unusual.",
    strategyTips: [
      "Your listener cannot see it, so give them the setting before the strangeness: where you were, when it was, who else was around. Starting with the odd part leaves them lost for the rest of the answer.",
      "Say plainly why it was unusual. What made it strange to you is half the task, and it is the half people forget to say.",
      "Comparisons carry a lot of weight here — “it looked like”, “it was as if”, “I had never seen anything like it”. They make a scene vivid faster than piling on adjectives does.",
    ],
  }),
];
