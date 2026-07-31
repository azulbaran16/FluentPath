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
// Four dimensions, mirroring the axes the official descriptors use for SPOKEN
// performance — task fulfilment, content and coherence, vocabulary, and
// listenability — rather than the writing ones. Only those four axis names
// crossed over, the same way exam task names and timings do: they are labels
// for what is being judged, not authorship. Every question and every
// explanation below was written from scratch.
//
// The questions are deliberately answerable WHILE LISTENING BACK to a sixty-
// second recording. "Was your vocabulary at a high level?" is not answerable
// and would make the whole self-check decorative; "is there a word you reached
// for over and over?" is something she can actually hear.
//
// There is no check-all gate here or anywhere downstream. A partly-ticked list
// is a valid, persisted result on purpose (RubricChecklist says the same in its
// own header), and nothing in this section is ever blocked on a quality signal.
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
  {
    key: "speaking-content-coherence",
    label: "Content & Coherence",
    items: [
      {
        id: "speaking-order-you-can-follow",
        text: "Could someone who had not read the prompt follow the order you said things in?",
        explanation:
          "Coherence is heard, not planned. If the second half of your answer doubles back to repair the first half, the ideas arrived in the wrong order — and the fix is deciding that order during the silent window, not speaking faster.",
      },
      {
        id: "speaking-concrete-detail",
        text: "Did you get to something concrete — a place, a number, a specific example — rather than staying general throughout?",
        explanation:
          "General statements are cheap to produce and sound identical at every level. One concrete detail is what makes an answer sound like it came from someone who has actually thought about the situation.",
      },
      {
        id: "speaking-reasons-not-just-claims",
        text: "When you made a point, did the reason follow it — or did you move straight on to the next point?",
        explanation:
          "Presenting information and supporting it are judged separately. 'Because', 'which means', 'otherwise' and 'so' are the joins that turn a list of statements into reasoning a listener can follow.",
      },
      {
        id: "speaking-finished-the-thought",
        text: "Did your final sentence finish the thought, rather than the countdown finishing it for you?",
        explanation:
          "Nobody expects a formal conclusion in sixty seconds, but trailing off mid-clause reads as losing control of the answer. Glancing at the last ten seconds and landing one closing sentence is a habit worth building now.",
      },
    ],
  },
  {
    key: "speaking-vocabulary",
    label: "Vocabulary",
    items: [
      {
        id: "speaking-not-the-prompt-words",
        text: "Did you say the central idea in your own words instead of reusing the prompt's wording?",
        explanation:
          "Echoing the prompt back demonstrates nothing about your range. Rephrasing its key words is one of the quickest visible signals of vocabulary, and it is entirely within your control during the thinking window.",
      },
      {
        id: "speaking-avoided-one-word-repeat",
        text: "Listening back, is there one word you reached for over and over — 'good', 'thing', 'nice', 'a lot'?",
        explanation:
          "A word used four times in a minute is the clearest sign of a narrow range and the easiest one to catch on playback. Write it down, choose two alternatives, and use them in the next attempt.",
      },
      {
        id: "speaking-precise-words",
        text: "Did you name things precisely — 'my Tuesday shift', 'the lease', 'a walk-in appointment' — rather than vaguely?",
        explanation:
          "Naming things exactly is what a wider vocabulary sounds like in practice. 'A thing at work' and 'my Tuesday shift' report the same fact and are not heard the same way.",
      },
      {
        id: "speaking-natural-phrasing",
        text: "Did any everyday expression come out naturally — the kind of phrase a fluent speaker uses without thinking?",
        explanation:
          "Ordinary idiomatic phrasing ('to be honest', 'in the long run', 'it was worth it') is part of the range being listened for. This is not about rare idioms: one forced in where it does not belong sounds worse than none at all.",
      },
    ],
  },
  {
    key: "speaking-listenability",
    label: "Listenability",
    items: [
      {
        id: "speaking-steady-pace",
        text: "Was your pace steady enough that you would have understood it easily if someone else had said it?",
        explanation:
          "Playback is the only honest test of this. Speeding up under pressure is the usual reflex, and pronunciation is the first casualty — the ends of words disappear well before you notice you are rushing.",
      },
      {
        id: "speaking-few-restarts",
        text: "Did you get through it with few restarts — beginning a sentence, abandoning it, and starting over?",
        explanation:
          "The occasional self-correction is normal speech. A restart every second or third sentence makes the listener reassemble your point for you, and that effort is exactly what this dimension measures.",
      },
      {
        id: "speaking-pauses-in-sensible-places",
        text: "Were your pauses short and between ideas, rather than long gaps or filler in the middle of a sentence?",
        explanation:
          "A pause between two ideas reads as composure; a pause mid-clause reads as being stuck. The cure is not talking faster — it is choosing the next idea before you finish the sentence you are on.",
      },
      {
        id: "speaking-word-endings-survived",
        text: "Did the ends of your words survive at full speed — plurals, past tenses, the third-person 's'?",
        explanation:
          "These vanish first under time pressure and they are plainly audible on playback. Grammatical control is judged from what was actually said out loud, never from what you knew while saying it.",
      },
    ],
  },
];
