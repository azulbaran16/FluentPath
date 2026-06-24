// Vocabulary flashcard decks: useful words/phrases in chunks, with a Spanish
// gloss and an example sentence. Cards are studied with flip + self-rating;
// "known" cards are tracked in progress.

export type VocabLevel = "A2" | "B1" | "B2" | "C1";

export interface VocabCard {
  /** stable id, used to track "known" state */
  id: string;
  term: string;
  es: string;
  example: string;
}

export interface VocabDeck {
  id: string;
  title: string;
  level: VocabLevel;
  blurb: string;
  cards: VocabCard[];
}

function deck(
  id: string,
  title: string,
  level: VocabLevel,
  blurb: string,
  rows: [string, string, string][],
): VocabDeck {
  return {
    id,
    title,
    level,
    blurb,
    cards: rows.map(([term, es, example], i) => ({
      id: `${id}:${i}`,
      term,
      es,
      example,
    })),
  };
}

export const VOCAB_DECKS: VocabDeck[] = [
  deck("daily", "Everyday essentials", "A2", "Words you'll use every single day.", [
    ["actually", "en realidad / de hecho", "Actually, I'd prefer tea."],
    ["maybe", "quizá", "Maybe we can meet later."],
    ["because", "porque", "I'm tired because I didn't sleep."],
    ["enough", "suficiente", "We don't have enough time."],
    ["already", "ya", "I've already eaten, thanks."],
    ["instead", "en vez de", "Let's walk instead of driving."],
    ["each other", "el uno al otro", "We've known each other for years."],
    ["on time", "a tiempo", "The train arrived on time."],
  ]),
  deck("connectors", "Linking words", "B1", "Glue your sentences together naturally.", [
    ["however", "sin embargo", "It's expensive; however, it's worth it."],
    ["although", "aunque", "Although it rained, we had fun."],
    ["therefore", "por lo tanto", "He didn't study; therefore, he failed."],
    ["in fact", "de hecho", "In fact, it was the best day ever."],
    ["as well as", "además de", "She sings as well as plays guitar."],
    ["on the other hand", "por otro lado", "On the other hand, it's cheaper."],
    ["for example", "por ejemplo", "Eat fruit, for example apples."],
    ["in the end", "al final", "In the end, we decided to stay."],
  ]),
  deck("phrasal", "Common phrasal verbs", "B1", "The verbs natives can't live without.", [
    ["give up", "rendirse", "Don't give up — you're almost there."],
    ["find out", "averiguar", "I'll find out what time it starts."],
    ["look forward to", "tener ganas de", "I look forward to seeing you."],
    ["run out of", "quedarse sin", "We've run out of milk."],
    ["turn down", "rechazar / bajar volumen", "She turned down the offer."],
    ["work out", "resolver / hacer ejercicio", "It all worked out in the end."],
    ["come up with", "idear", "He came up with a great plan."],
    ["put off", "posponer", "Don't put off the decision."],
  ]),
  deck("work", "Workplace English", "B2", "Sound professional in any meeting.", [
    ["deadline", "fecha límite", "We have to meet the deadline."],
    ["follow up", "dar seguimiento", "I'll follow up by email."],
    ["on the same page", "de acuerdo", "Let's make sure we're on the same page."],
    ["take the lead", "tomar la iniciativa", "She took the lead on the project."],
    ["touch base", "ponerse en contacto", "Let's touch base next week."],
    ["bandwidth", "capacidad/tiempo", "I don't have the bandwidth this week."],
    ["roll out", "lanzar/desplegar", "We'll roll out the feature on Monday."],
    ["circle back", "retomar luego", "Let's circle back to this later."],
  ]),
  deck("idioms", "Everyday idioms", "C1", "Expressions that make you sound native.", [
    ["a piece of cake", "pan comido", "The exam was a piece of cake."],
    ["under the weather", "sentirse mal", "I'm a bit under the weather today."],
    ["hit the books", "ponerse a estudiar", "I need to hit the books tonight."],
    ["break the ice", "romper el hielo", "He told a joke to break the ice."],
    ["call it a day", "dejarlo por hoy", "Let's call it a day."],
    ["on the same wavelength", "en sintonía", "We're on the same wavelength."],
    ["bite the bullet", "afrontar algo difícil", "Just bite the bullet and apologise."],
    ["the bottom line", "lo esencial", "The bottom line is we need more time."],
  ]),
];

export const TOTAL_VOCAB = VOCAB_DECKS.reduce((n, d) => n + d.cards.length, 0);
