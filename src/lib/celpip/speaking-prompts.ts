import type { CelpipSpeakingPrompt } from "../celpip";

// CELPIP Speaking prompt bank: original scenarios in everyday-Canadian contexts.
// ALL original content — written from the exam FORMAT only, no text copied
// from third-party material (see .planning IP constraints for this phase).
//
// The two timings are the exam's own for Task 1 and are confirmed against the
// learner's official format material rather than inferred: a 30-second silent
// preparation window, then a 90-second response that starts on its own. Being
// caught mid-thought by that automatic start is part of what the test measures,
// so the rehearsal reproduces it rather than waiting for a Record button.
export const SPEAKING_TASK_PROMPTS: CelpipSpeakingPrompt[] = [
  {
    id: "speaking-advice-first-winter",
    shape: "advice",
    taskNumber: 1,
    title: "Advice for a first Canadian winter",
    scenario:
      "Your cousin is moving to Winnipeg in October to start a new job. She has never lived through a Canadian winter and she has asked you what she should do before the cold arrives. Give her your advice: what she should buy, what she should arrange in advance, and how she should look after herself through the first few months.",
    prepSeconds: 30,
    responseSeconds: 90,
    strategyTips: [
      "Say what your advice actually is in the first sentence, then spend the rest of the window supporting it. An answer that circles the situation for forty seconds before committing has spent half its time saying nothing.",
      "Two or three pieces of advice, each with a reason, beat six with none. What is being judged is how well you develop an idea, not how many you can list.",
      "Speak to her, not to the microphone. “You should”, “if I were you” and “make sure you” keep the register right for advice and come out naturally under pressure.",
      "The recording starts on its own and you will not feel ready. Have one full opening sentence prepared during the silent window so your first ten seconds are a sentence rather than filler.",
    ],
  },
];
