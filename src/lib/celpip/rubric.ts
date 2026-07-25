import type { CelpipRubric } from "../celpip";

// Self-evaluation rubric, rewritten in our own words from the CELPIP Writing
// level descriptors (task fulfillment, organization, vocabulary, grammar &
// format). This is a real seed rubric for this plan; plan 04 enriches it.
export const CELPIP_RUBRIC: CelpipRubric = {
  email: [
    {
      key: "task-fulfillment",
      label: "Task Fulfillment",
      items: [
        {
          id: "email-bullets",
          text: "Did you address all three bullet points from the prompt?",
          explanation:
            "Missing even one bullet point caps how high this dimension can score, no matter how well the rest is written.",
        },
        {
          id: "email-salutation",
          text: "Does your email open with a matching greeting and close with a formal sign-off?",
          explanation:
            "A formal request needs a formal frame — a proper greeting at the start and 'Yours sincerely' plus your name at the end.",
        },
      ],
    },
    {
      key: "organization",
      label: "Organization",
      items: [
        {
          id: "email-paragraphs",
          text: "Does each bullet point get its own paragraph?",
          explanation:
            "One paragraph per idea keeps the email scannable and shows the reader you've structured your response deliberately.",
        },
        {
          id: "email-linkers",
          text: "Did you connect ideas with linking words (however, in addition, as a result)?",
          explanation:
            "Linkers signal how your sentences relate to each other, which reads as more fluent than a list of disconnected statements.",
        },
      ],
    },
    {
      key: "vocabulary",
      label: "Vocabulary",
      items: [
        {
          id: "email-precision",
          text: "Did you use specific, precise words instead of repeating the prompt's own wording?",
          explanation:
            "Reusing the prompt's exact phrases suggests limited vocabulary; paraphrasing shows you can express the same idea another way.",
        },
      ],
    },
    {
      key: "grammar-format",
      label: "Grammar & Format",
      items: [
        {
          id: "email-sentence-variety",
          text: "Does your email mix short and complex sentences rather than repeating the same pattern?",
          explanation:
            "Sentence variety, including at least one complex sentence with a linking word, demonstrates stronger grammatical control.",
        },
        {
          id: "email-length",
          text: "Is your email within the 150–200 word target?",
          explanation:
            "Writing far under 150 words under-develops your ideas; writing far over 200 risks losing focus and running out of time.",
        },
      ],
    },
  ],
  survey: [
    {
      key: "task-fulfillment",
      label: "Task Fulfillment",
      items: [
        {
          id: "survey-thesis",
          text: "Does your first sentence clearly state which option you chose?",
          explanation:
            "The reader should know your position immediately — burying it later in the response makes the essay harder to follow.",
        },
        {
          id: "survey-acknowledge-other-option",
          text: "Did you briefly acknowledge the other option before explaining your choice?",
          explanation:
            "Recognizing the alternative, even in one sentence, shows you considered both sides rather than picking one at random.",
        },
      ],
    },
    {
      key: "organization",
      label: "Organization",
      items: [
        {
          id: "survey-two-body-paragraphs",
          text: "Do you have two body paragraphs, each built as idea → explanation → example?",
          explanation:
            "This idea-explain-example pattern is what separates a developed argument from a list of unsupported opinions.",
        },
        {
          id: "survey-linkers",
          text: "Did you connect ideas with linking words (moreover, on the other hand, as a result)?",
          explanation:
            "Linkers make the relationship between your reasons explicit instead of leaving the reader to infer it.",
        },
      ],
    },
    {
      key: "vocabulary",
      label: "Vocabulary",
      items: [
        {
          id: "survey-precision",
          text: "Did you use specific, precise words instead of repeating the prompt's own wording?",
          explanation:
            "Reusing the prompt's exact phrases suggests limited vocabulary; paraphrasing shows you can express the same idea another way.",
        },
      ],
    },
    {
      key: "grammar-format",
      label: "Grammar & Format",
      items: [
        {
          id: "survey-complex-conclusion",
          text: "Does your conclusion use at least one complex sentence to restate your position?",
          explanation:
            "A complex closing sentence, rather than a simple restatement, shows control over sentence structure at the end of the response.",
        },
        {
          id: "survey-length",
          text: "Is your response within the 150–200 word target?",
          explanation:
            "Writing far under 150 words under-develops your argument; writing far over 200 risks losing focus and running out of time.",
        },
      ],
    },
  ],
};
