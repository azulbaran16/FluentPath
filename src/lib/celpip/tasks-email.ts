import type { CelpipWritingTask } from "../celpip";

// Task 1 bank: original formal-email prompts in everyday-Canadian contexts.
// ALL original content — written from the exam FORMAT only, no text copied
// from third-party material (see .planning IP constraints for this phase).
export const EMAIL_TASKS: CelpipWritingTask[] = [
  {
    id: "email-noise-complaint",
    taskType: "email",
    title: "Email to your building manager",
    scenario:
      "You live in an apartment building in Toronto. Over the past two weeks, a neighbour has been playing loud music late at night, and it has been affecting your sleep and your ability to focus on work the next day. Write an email to your building manager, Mr. Chen.",
    bullets: [
      "Explain the problem and how it has been affecting you",
      "Describe what you have already tried to resolve it yourself",
      "Suggest what you would like the manager to do next",
    ],
    timeLimitMinutes: 27,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Dear Mr. Chen,

I am writing to raise a concern about noise coming from the apartment next to mine, unit 412. Over the past two weeks, loud music has continued well past midnight on several nights, and it has become difficult for me to sleep or concentrate on work the next day.

I have already spoken to my neighbour twice, most recently on Tuesday evening, and asked politely if the volume could be lowered after 10 p.m. Unfortunately, the situation has not improved, and I would rather not approach them again on my own.

Given this, I would appreciate it if you could send a written reminder to all residents about the building's quiet hours policy, and speak directly with unit 412 if the noise continues. I am happy to share the specific dates and times if that would help.

Thank you for looking into this matter. I look forward to hearing how we can resolve it.

Yours sincerely,
Priya Patel`,
    strategyTips: [
      "Open with a one-sentence purpose statement so the reader knows immediately why you're writing.",
      "Give each bullet point its own paragraph — blending them together makes the email harder to act on.",
      "Close with a concrete next step and a formal sign-off ('Yours sincerely,' plus your full name) to match the formal register.",
    ],
  },
  {
    id: "email-02",
    taskType: "email",
    title: "Email to your supervisor about a schedule change",
    scenario:
      "You work at a marketing firm in Vancouver. You have been accepted into an evening course that meets three days a week starting next month, and you need to leave work one hour earlier on those days. Write an email to your supervisor, Ms. Alvarez.",
    bullets: [
      "Explain why you need the schedule change and when it would start",
      "Describe how you will make up for the lost time",
      "Ask for a quick meeting to discuss the arrangement",
    ],
    timeLimitMinutes: 27,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Dear Ms. Alvarez,

I am writing to request a temporary adjustment to my work schedule starting next month. I have been accepted into an evening course that meets on Mondays, Wednesdays, and Fridays from 5:30 p.m., and the timing means I would need to leave the office one hour earlier on those three days.

To make up for the lost time, I am happy to arrive thirty minutes earlier each morning and to work through part of my lunch break on the affected days. I have also spoken with my teammates, and Daniel has kindly agreed to cover urgent client calls during the last hour if needed.

Would you be available for a short meeting this week to go over the details? I want to make sure the arrangement works smoothly for the team before the course begins, and I am flexible on timing to meet whenever suits you best.

Thank you for considering this request.

Yours sincerely,
Marco Bianchi`,
    strategyTips: [
      "State the change you're requesting and its start date in your very first sentence — the reader shouldn't have to guess.",
      "Show you've already thought about the impact on others (coverage, teammates) before the reader has to ask.",
      "End requests with a clear call to action, like proposing a meeting, rather than leaving the next step open-ended.",
    ],
  },
  {
    id: "email-03",
    taskType: "email",
    title: "Email to your internet provider about billing and service",
    scenario:
      "You have had home internet service with NorthLink Communications for two years. For the past ten days, your connection has been dropping several times a day, and your latest bill charged you for a premium speed package you never ordered. Write an email to NorthLink's customer service department.",
    bullets: [
      "Describe the connection problem and how long it has been happening",
      "Point out the incorrect charge on your bill",
      "Say what you would like the company to do",
    ],
    timeLimitMinutes: 27,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Dear Customer Service Team,

I am writing about two issues with my account, number 88213-NL. Since the second week of this month, my home internet connection has been dropping several times a day, sometimes for over twenty minutes at a time, which has made it very difficult to work from home.

In addition, my latest bill includes a charge for a premium speed package that I never ordered or agreed to. I have only ever subscribed to the standard plan, and I would like this charge investigated and removed as soon as possible.

Given these problems, I would appreciate it if a technician could check the line at my address, and if the billing error could be corrected with a credit applied to my next statement. Please let me know what information you need from me to move this forward quickly, and whether a callback or an in-person visit would be more suitable for the technical issue.

I look forward to your prompt response.

Yours sincerely,
Fatima Haidari`,
    strategyTips: [
      "When two things have gone wrong, number or clearly separate them into paragraphs so neither issue gets missed.",
      "Include specifics that help the reader act quickly — account numbers, dates, and how often a problem happens.",
      "Ask a direct question near the end (what do you need from me?) to invite a fast, concrete reply.",
    ],
  },
  {
    id: "email-04",
    taskType: "email",
    title: "Email to HR requesting an employment letter",
    scenario:
      "You have worked as a research assistant at an environmental consulting firm in Calgary for the past three years, and you are now applying for a graduate program that requires a formal letter confirming your employment and duties. Write an email to your company's HR manager, Mr. Owusu.",
    bullets: [
      "Explain why you need the letter and by when",
      "Specify exactly what information the letter should include",
      "Offer to provide any documents that would help",
    ],
    timeLimitMinutes: 27,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Dear Mr. Owusu,

I am writing to request a formal letter confirming my employment, as I need it for a graduate school application with a submission deadline of the twentieth of next month. I would be grateful if the letter could be ready at least a week before then, so I have time to include it with my other documents.

For the application to be accepted, the letter needs to confirm my job title, my start date, and a brief description of my main responsibilities as a research assistant, particularly my work on the wetland monitoring project. If possible, it would also help to mention that my position is full-time and ongoing.

I am happy to provide my employee number, a copy of my original offer letter, or any other documents that would make this easier to prepare. Please let me know if you need anything from me, or if a different format would suit the university's requirements better.

Thank you very much for your help with this.

Yours sincerely,
Grace Adeyemi`,
    strategyTips: [
      "Lead with your deadline — a reader who knows the real timeline can prioritize the request correctly.",
      "List the exact content you need included; a vague request for 'a letter' often comes back missing what you actually need.",
      "Offering supporting documents upfront shows initiative and removes a round of back-and-forth email.",
    ],
  },
  {
    id: "email-05",
    taskType: "email",
    title: "Email to reschedule a dental appointment",
    scenario:
      "You have a dental cleaning appointment booked for next Tuesday at 2 p.m. at Maple Dental Clinic, but you have just found out you have a mandatory work training session that day that cannot be moved. Write an email to the clinic's front desk.",
    bullets: [
      "Explain why you need to change your appointment",
      "Suggest two or three alternative times that would work for you",
      "Ask them to confirm the new booking",
    ],
    timeLimitMinutes: 27,
    wordRange: { min: 150, max: 200 },
    modelAnswer: `Dear Maple Dental Clinic Team,

I am writing to ask about rescheduling my dental cleaning appointment currently booked for next Tuesday at 2 p.m. under the name Wei Zhang. My employer has just scheduled a mandatory training session for that same afternoon, and unfortunately I am not able to move it or attend both.

Would it be possible to move my appointment to later in the week instead? I am available on Thursday afternoon after 1 p.m., on Friday at any time, or on the following Monday morning before 11 a.m. Any of these three options would work well for my schedule, though Thursday would be my first choice if it is available.

Could you please confirm which of these times suits the clinic, or let me know if none of them work so we can find another slot together? I would also appreciate a reminder closer to the new date, if that is something the clinic normally provides for patients.

Thank you for your understanding and for helping me sort this out.

Yours sincerely,
Wei Zhang`,
    strategyTips: [
      "Give the reader options (several possible times) instead of a single fixed request — it's far easier for them to say yes.",
      "Rank your preferences if you have one, so the reader can act fast without a follow-up question.",
      "Close a rescheduling request by explicitly asking for confirmation, so nothing is left assumed.",
    ],
  },
];
