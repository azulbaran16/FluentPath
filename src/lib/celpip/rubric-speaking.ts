import type { CelpipRubricDimension } from "../celpip";

// Speaking self-evaluation checklist (D-02: the learner scores herself — there
// is no AI and no automated scoring anywhere in this section).
//
// Rewritten in our own words from the CELPIP Speaking level descriptors, the
// same way the Writing rubric was: the descriptors were read for what they
// MEAN, and every question and explanation below was then written from
// scratch. No descriptor text and no third-party study material is reproduced
// anywhere in this file.
//
// Every id is prefixed `speaking-` because these ids are the keys stored in an
// attempt's `checkedRubric`. A collision with an `email-` or `survey-` id would
// cross-contaminate attempt history between two different skills.
//
// One dimension ships here — Task Fulfilment, complete and final, not a
// placeholder. The remaining three are authored in plan 03.
export const CELPIP_SPEAKING_RUBRIC: CelpipRubricDimension[] = [
  {
    key: "speaking-task-fulfilment",
    label: "Task Fulfilment",
    items: [
      {
        id: "speaking-did-the-task",
        text: "Did you actually do what the task asked, rather than describe the situation back?",
        explanation:
          "A prompt that asks for advice wants sentences aimed at the person: tell them what to do. Retelling the scenario in your own words fills the time without answering, and it is the most common way a fluent-sounding response still scores low.",
      },
      {
        id: "speaking-developed-points",
        text: "Did you support at least two of your points with a reason, an example or a consequence?",
        explanation:
          "A bare list of points reads as thin no matter how correct the English is. Saying why each one matters — or what happens without it — is what turns a list into a developed answer.",
      },
      {
        id: "speaking-used-the-window",
        text: "Did you keep going for most of the response window, without a long silence or an early stop?",
        explanation:
          "The window is the amount of speech being judged. Stopping at forty seconds leaves half the evidence unrecorded, and a long mid-answer pause reads as running out of ideas rather than as thinking.",
      },
      {
        id: "speaking-right-register",
        text: "Did you speak to the person the prompt named, in the register that relationship calls for?",
        explanation:
          "Advice to a cousin and advice to a manager are not the same performance. Addressing the named person directly, at the right level of formality, is part of what the task is asking you to demonstrate.",
      },
    ],
  },
];
