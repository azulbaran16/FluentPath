// Graded reading passages with comprehension questions and a glossary.
// Spans A2 → C1 so learners can read at (and just above) their level.

export interface ReadingQuestion {
  q: string;
  options: string[];
  answer: number;
}

export type ReadingLevel = "A2" | "B1" | "B2" | "C1";

export interface Passage {
  id: string;
  title: string;
  level: ReadingLevel;
  minutes: number;
  body: string[]; // paragraphs
  glossary: { word: string; meaning: string }[];
  questions: ReadingQuestion[];
}

export const READING_LEVELS: ReadingLevel[] = ["A2", "B1", "B2", "C1"];

export const PASSAGES: Passage[] = [
  // ───────────── A2 ─────────────
  {
    id: "coffee",
    title: "A Morning Ritual",
    level: "A2",
    minutes: 3,
    body: [
      "Every morning, Maya wakes up at six. Before she does anything else, she makes a cup of coffee. The smell fills the kitchen and helps her feel awake.",
      "She drinks it slowly by the window and watches the street. People walk to work, buses pass, and the city slowly comes alive. For Maya, this quiet moment is the best part of her day.",
    ],
    glossary: [
      { word: "ritual", meaning: "something you do regularly, the same way" },
      { word: "comes alive", meaning: "becomes busy and full of activity" },
    ],
    questions: [
      {
        q: "What does Maya do first in the morning?",
        options: ["She goes to work", "She makes coffee", "She watches TV"],
        answer: 1,
      },
      {
        q: "Why is the morning special for her?",
        options: ["It's a quiet moment she enjoys", "She meets friends", "She exercises"],
        answer: 0,
      },
    ],
  },
  {
    id: "market",
    title: "A Day at the Market",
    level: "A2",
    minutes: 3,
    body: [
      "On Saturdays, Tom goes to the market near his house. He likes it because the food is fresh and the people are friendly. He always buys fruit, vegetables and bread.",
      "His favourite seller is an old man who sells cheese. The man always gives Tom a small piece to try. Tom usually buys some, and they talk about the weather for a few minutes.",
    ],
    glossary: [
      { word: "fresh", meaning: "recently made or picked, not old" },
      { word: "seller", meaning: "a person who sells things" },
    ],
    questions: [
      {
        q: "When does Tom go to the market?",
        options: ["Every day", "On Saturdays", "On Sundays"],
        answer: 1,
      },
      {
        q: "What does the cheese seller do?",
        options: ["Gives Tom a piece to try", "Sells bread", "Talks about football"],
        answer: 0,
      },
    ],
  },
  {
    id: "friend",
    title: "My Best Friend",
    level: "A2",
    minutes: 3,
    body: [
      "My best friend is called Lucía. We met at school when we were seven years old. At first we didn't like each other, but then we discovered we both loved drawing.",
      "Now we are adults, but we still talk every week. She lives in another city, so we usually video-call. When we meet, it feels like no time has passed.",
    ],
    glossary: [
      { word: "discovered", meaning: "found out for the first time" },
      { word: "no time has passed", meaning: "it feels the same as before, nothing changed" },
    ],
    questions: [
      {
        q: "How did they become friends?",
        options: ["They both loved drawing", "They were neighbours", "They played football"],
        answer: 0,
      },
      {
        q: "How do they keep in touch now?",
        options: ["They write letters", "They video-call", "They never talk"],
        answer: 1,
      },
    ],
  },

  // ───────────── B1 ─────────────
  {
    id: "remote",
    title: "The Rise of Remote Work",
    level: "B1",
    minutes: 4,
    body: [
      "Ten years ago, working from home was unusual. Today, millions of people do it every day. Faster internet and better tools have made it possible to do many jobs from almost anywhere.",
      "Remote work has clear advantages. People save time because they don't travel to an office, and many feel they can focus better at home. Companies can also hire talented people from other cities or countries.",
      "However, it isn't perfect. Some workers miss the social side of an office and find it hard to separate work from their personal life. The best solution, many believe, is a mix of both.",
    ],
    glossary: [
      { word: "remote", meaning: "done from a distance, not in person" },
      { word: "advantages", meaning: "good points, benefits" },
      { word: "separate", meaning: "keep two things apart" },
    ],
    questions: [
      {
        q: "What made remote work possible?",
        options: ["Cheaper offices", "Faster internet and better tools", "Longer holidays"],
        answer: 1,
      },
      {
        q: "What is one disadvantage mentioned?",
        options: ["It's more expensive", "Workers miss the social side", "Internet is slower"],
        answer: 1,
      },
      {
        q: "What solution do many people prefer?",
        options: ["Only working at home", "Only working at the office", "A mix of both"],
        answer: 2,
      },
    ],
  },
  {
    id: "pizza",
    title: "The Story of Pizza",
    level: "B1",
    minutes: 4,
    body: [
      "Pizza is loved all over the world, but it began as simple food for poor people in Naples, Italy. Flatbreads with toppings had existed for centuries, but the modern pizza took shape in the 18th century.",
      "A popular legend says that in 1889 a baker made a pizza for the Italian queen with tomatoes, mozzarella and basil — red, white and green, like the flag. It was named Margherita after her.",
      "When Italians moved abroad, they took pizza with them. Today every country has its own version, and not everyone agrees on what belongs on top.",
    ],
    glossary: [
      { word: "toppings", meaning: "food put on top of a pizza" },
      { word: "took shape", meaning: "started to develop its current form" },
      { word: "legend", meaning: "a popular story that may not be completely true" },
    ],
    questions: [
      {
        q: "Where did modern pizza come from?",
        options: ["Rome", "Naples", "New York"],
        answer: 1,
      },
      {
        q: "Why was the Margherita pizza special?",
        options: ["It was very expensive", "Its colours matched the Italian flag", "It had no cheese"],
        answer: 1,
      },
      {
        q: "How did pizza spread around the world?",
        options: ["Through Italian emigrants", "Through the internet", "Through restaurants in Rome"],
        answer: 0,
      },
    ],
  },
  {
    id: "say-no",
    title: "Learning to Say No",
    level: "B1",
    minutes: 4,
    body: [
      "Many people find it very hard to say no. They agree to extra work, favours and invitations even when they have no time. They worry that saying no will disappoint others.",
      "But always saying yes has a cost. You become tired, stressed, and you do everything a little worse. Experts say that saying no to one thing is really saying yes to something more important.",
      "You don't have to be rude. A simple, honest answer is enough: 'I'd love to, but I can't right now.' With practice, it gets easier.",
    ],
    glossary: [
      { word: "favours", meaning: "kind things you do to help someone" },
      { word: "disappoint", meaning: "make someone feel let down or unhappy" },
      { word: "rude", meaning: "not polite" },
    ],
    questions: [
      {
        q: "Why do many people say yes too often?",
        options: ["They have lots of free time", "They worry about disappointing others", "They love extra work"],
        answer: 1,
      },
      {
        q: "What is the cost of always saying yes?",
        options: ["You earn less money", "You become tired and stressed", "You make new friends"],
        answer: 1,
      },
      {
        q: "What does the writer suggest?",
        options: ["Never help anyone", "Be honest and polite when you say no", "Always say yes"],
        answer: 1,
      },
    ],
  },

  // ───────────── B2 ─────────────
  {
    id: "sleep",
    title: "Why We Need Sleep",
    level: "B2",
    minutes: 5,
    body: [
      "We spend about a third of our lives asleep, yet for centuries scientists struggled to explain why. Sleep seemed like wasted time — hours when we could be working or hunting. Recent research, however, suggests the opposite: sleep is when some of the body's most important work takes place.",
      "During deep sleep, the brain consolidates memories, moving them from temporary to long-term storage. It also clears out waste products that build up while we are awake. People who sleep poorly often struggle to concentrate and remember things the next day.",
      "The advice from experts is surprisingly simple. Keep a regular schedule, avoid screens late at night, and treat sleep not as a luxury but as a basic need — as essential as food and water.",
    ],
    glossary: [
      { word: "consolidates", meaning: "makes stronger or more solid" },
      { word: "build up", meaning: "increase gradually over time" },
      { word: "luxury", meaning: "something pleasant but not necessary" },
    ],
    questions: [
      {
        q: "What did scientists once think about sleep?",
        options: ["It was wasted time", "It was dangerous", "It made people stronger"],
        answer: 0,
      },
      {
        q: "What happens during deep sleep?",
        options: ["The brain consolidates memories", "The body grows taller", "We burn most calories"],
        answer: 0,
      },
      {
        q: "What is the experts' main message?",
        options: ["Sleep less to do more", "Sleep is a basic need, not a luxury", "Screens help you sleep"],
        answer: 1,
      },
    ],
  },
  {
    id: "habit",
    title: "The Power of Habit",
    level: "B2",
    minutes: 5,
    body: [
      "Much of what we do each day is not really a decision — it's a habit. Researchers estimate that around 40% of our daily actions are repeated automatically, in the same situations, without conscious thought.",
      "Habits follow a simple loop: a cue triggers a routine, which delivers a reward. Your phone buzzes (cue), you check it (routine), and you feel a small hit of curiosity satisfied (reward). Over time, the brain stops questioning the loop.",
      "The good news is that the same mechanism can work for us. By keeping the cue and the reward but replacing the routine, we can gradually build habits that serve us instead of ones that drain us.",
    ],
    glossary: [
      { word: "cue", meaning: "a signal that starts a behaviour" },
      { word: "routine", meaning: "a fixed sequence of actions" },
      { word: "drain", meaning: "slowly use up energy or resources" },
    ],
    questions: [
      {
        q: "How much of our daily behaviour is habitual?",
        options: ["About 10%", "About 40%", "Almost none"],
        answer: 1,
      },
      {
        q: "What are the three parts of the habit loop?",
        options: ["Cue, routine, reward", "Plan, act, rest", "Want, buy, regret"],
        answer: 0,
      },
      {
        q: "How can we change a bad habit?",
        options: ["Remove the reward completely", "Keep the cue and reward, change the routine", "Ignore it"],
        answer: 1,
      },
    ],
  },
  {
    id: "cities",
    title: "Cities of the Future",
    level: "B2",
    minutes: 5,
    body: [
      "By 2050, nearly seventy percent of humanity will live in cities. This rapid growth puts enormous pressure on housing, transport and the environment, forcing planners to rethink how cities work.",
      "One promising idea is the 'fifteen-minute city', where everything a resident needs — shops, schools, work, parks — lies within a short walk or bike ride. Supporters argue it reduces traffic, pollution and isolation at the same time.",
      "Critics warn that such changes must be fair. If only wealthy neighbourhoods become greener and more convenient, cities risk deepening the very inequalities they hope to solve.",
    ],
    glossary: [
      { word: "enormous", meaning: "extremely large" },
      { word: "isolation", meaning: "the state of being alone or separated" },
      { word: "inequalities", meaning: "unfair differences between groups of people" },
    ],
    questions: [
      {
        q: "What is the main challenge described?",
        options: ["Cities are shrinking", "Rapid urban growth", "People dislike cities"],
        answer: 1,
      },
      {
        q: "What is a 'fifteen-minute city'?",
        options: [
          "A city you cross in 15 minutes",
          "A city where daily needs are a short walk away",
          "A city with no cars at all",
        ],
        answer: 1,
      },
      {
        q: "What do critics worry about?",
        options: ["The changes could be unfair", "Cities will be too quiet", "Bikes are dangerous"],
        answer: 0,
      },
    ],
  },

  // ───────────── C1 ─────────────
  {
    id: "choice",
    title: "The Paradox of Choice",
    level: "C1",
    minutes: 6,
    body: [
      "We tend to assume that more choice is always better. A supermarket with two hundred cereals seems superior to one with ten; a career with endless options feels freer than a narrow path. Yet a growing body of research suggests this assumption deserves scrutiny.",
      "When faced with too many options, people often feel paralysed rather than liberated. They postpone the decision, or, having finally chosen, they are haunted by the alternatives they rejected. Abundance, paradoxically, can breed dissatisfaction.",
      "This does not mean we should crave a world without options. Rather, it suggests that the value of choice has limits, and that learning to settle — to accept a 'good enough' decision and move on — may be a quietly radical skill in an age of infinite menus.",
    ],
    glossary: [
      { word: "scrutiny", meaning: "careful and critical examination" },
      { word: "paralysed", meaning: "unable to act or decide" },
      { word: "breed", meaning: "produce or cause something" },
    ],
    questions: [
      {
        q: "What common assumption does the text question?",
        options: [
          "That more choice is always better",
          "That supermarkets are too big",
          "That careers are unimportant",
        ],
        answer: 0,
      },
      {
        q: "How can too many options make people feel?",
        options: ["More liberated", "Paralysed and dissatisfied", "Completely indifferent"],
        answer: 1,
      },
      {
        q: "What 'radical skill' does the writer suggest?",
        options: [
          "Always choosing the cheapest option",
          "Accepting a 'good enough' decision and moving on",
          "Avoiding all decisions",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "slow-travel",
    title: "The Art of Slow Travel",
    level: "C1",
    minutes: 6,
    body: [
      "Modern tourism often resembles a race. Travellers sprint between landmarks, photographing each one before hurrying to the next, returning home exhausted and strangely unfulfilled, with little memory of the places themselves.",
      "Slow travel offers an antidote. Instead of collecting destinations, it invites us to linger: to learn a few words of the language, to return to the same café until the owner remembers our order, to let a place reveal itself gradually rather than on demand.",
      "Such an approach asks for something contemporary life rarely grants — patience. But those who practise it often report a deeper, more honest connection to the places they visit, and to themselves.",
    ],
    glossary: [
      { word: "unfulfilled", meaning: "not satisfied; lacking a sense of completion" },
      { word: "antidote", meaning: "something that counteracts a problem" },
      { word: "linger", meaning: "stay somewhere longer than necessary, by choice" },
    ],
    questions: [
      {
        q: "How does the text describe modern tourism?",
        options: ["As relaxing", "As a tiring race between landmarks", "As too cheap"],
        answer: 1,
      },
      {
        q: "What does slow travel encourage?",
        options: [
          "Visiting as many places as possible",
          "Lingering and letting a place reveal itself",
          "Travelling only by train",
        ],
        answer: 1,
      },
      {
        q: "What quality does slow travel require?",
        options: ["Money", "Patience", "Physical strength"],
        answer: 1,
      },
    ],
  },
  {
    id: "attention",
    title: "Attention in the Digital Age",
    level: "C1",
    minutes: 6,
    body: [
      "Our attention has become one of the most valuable commodities of the modern economy. Countless apps and platforms compete, with remarkable sophistication, to capture and hold it for as long as possible.",
      "The consequences are subtle but profound. Constant interruption fragments our thinking, making sustained concentration — the kind that deep work and genuine reflection demand — increasingly rare. We may consume more information than ever while understanding less.",
      "Reclaiming attention, then, is not merely a matter of willpower. It requires designing our environment deliberately: silencing notifications, creating uninterrupted blocks of time, and treating focus as the scarce and precious resource it has become.",
    ],
    glossary: [
      { word: "commodity", meaning: "something bought and sold; a valuable resource" },
      { word: "fragments", meaning: "breaks into small, disconnected pieces" },
      { word: "reclaiming", meaning: "getting something back that was lost or taken" },
    ],
    questions: [
      {
        q: "Why is attention described as valuable?",
        options: [
          "Apps compete intensely to capture it",
          "It is easy to measure",
          "Nobody wants it",
        ],
        answer: 0,
      },
      {
        q: "What is one consequence of constant interruption?",
        options: [
          "Deeper concentration",
          "Fragmented thinking and less understanding",
          "Faster reading",
        ],
        answer: 1,
      },
      {
        q: "What does reclaiming attention require, according to the text?",
        options: [
          "Only willpower",
          "Deliberately designing our environment",
          "Buying more apps",
        ],
        answer: 1,
      },
    ],
  },
];
