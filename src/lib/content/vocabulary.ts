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

  // ── A2 ──
  deck("food", "Food & eating", "A2", "Order, taste and talk about meals.", [
    ["hungry", "con hambre", "I'm so hungry — let's eat."],
    ["thirsty", "con sed", "Are you thirsty? Here's some water."],
    ["delicious", "delicioso", "This soup is delicious."],
    ["meal", "comida (plato)", "Dinner is my favourite meal."],
    ["snack", "tentempié", "I'll just have a quick snack."],
    ["order", "pedir / pedido", "Are you ready to order?"],
    ["bill", "la cuenta", "Could we have the bill, please?"],
    ["tasty", "sabroso", "The pasta was really tasty."],
  ]),
  deck("travel", "Travel basics", "A2", "Get around without stress.", [
    ["ticket", "billete / boleto", "I bought a ticket to Madrid."],
    ["luggage", "equipaje", "My luggage is really heavy."],
    ["gate", "puerta (embarque)", "The flight leaves from gate 12."],
    ["delay", "retraso", "There's a two-hour delay."],
    ["depart", "salir / partir", "The train departs at noon."],
    ["book", "reservar", "I booked a room for two nights."],
    ["abroad", "en el extranjero", "She's studying abroad this year."],
    ["arrival", "llegada", "Check the arrival time online."],
  ]),
  deck("feelings", "Feelings & moods", "A2", "Say how you really feel.", [
    ["tired", "cansado", "I'm tired after the trip."],
    ["bored", "aburrido", "The film was boring; I got bored."],
    ["excited", "emocionado", "I'm so excited about the concert."],
    ["worried", "preocupado", "Don't be worried, it's fine."],
    ["scared", "asustado", "She's scared of spiders."],
    ["surprised", "sorprendido", "I was surprised to see him."],
    ["proud", "orgulloso", "I'm proud of you."],
    ["nervous", "nervioso", "I get nervous before exams."],
  ]),

  // ── B1 ──
  deck("people", "Describing people", "B1", "Talk about character and personality.", [
    ["kind", "amable", "She's very kind to everyone."],
    ["shy", "tímido", "He's shy with new people."],
    ["outgoing", "extrovertido", "My sister is really outgoing."],
    ["reliable", "fiable", "He's reliable — he never lets you down."],
    ["stubborn", "terco", "She's too stubborn to admit it."],
    ["generous", "generoso", "They're generous with their time."],
    ["easygoing", "relajado / de trato fácil", "My boss is pretty easygoing."],
    ["hard-working", "trabajador", "He's a hard-working student."],
  ]),
  deck("phrasal2", "More phrasal verbs", "B1", "Eight more you'll hear daily.", [
    ["get along", "llevarse bien", "We get along really well."],
    ["look after", "cuidar de", "Can you look after the dog?"],
    ["set up", "montar / configurar", "I set up the new printer."],
    ["take off", "despegar / quitarse", "The plane took off late."],
    ["bring up", "sacar (un tema) / criar", "Don't bring up politics."],
    ["carry on", "continuar", "Carry on — you're doing great."],
    ["deal with", "lidiar con", "I'll deal with it tomorrow."],
    ["sort out", "resolver / arreglar", "Let's sort out the details."],
  ]),
  deck("money", "Money & shopping", "B1", "Spend, save and sort out bills.", [
    ["afford", "poder permitirse", "I can't afford a new car."],
    ["refund", "reembolso", "Can I get a refund for this?"],
    ["discount", "descuento", "They gave me a 10% discount."],
    ["receipt", "recibo / ticket", "Keep the receipt just in case."],
    ["save up", "ahorrar (para)", "I'm saving up for a trip."],
    ["owe", "deber (dinero)", "You owe me five euros."],
    ["worth", "que vale", "It's worth every penny."],
    ["bargain", "ganga", "These shoes were a real bargain."],
  ]),

  // ── B2 ──
  deck("opinion", "Giving opinions", "B2", "Sound thoughtful, not blunt.", [
    ["I reckon", "creo que (informal)", "I reckon it'll rain later."],
    ["point out", "señalar", "She pointed out a mistake."],
    ["it seems", "parece que", "It seems we were wrong."],
    ["as far as I'm concerned", "en lo que a mí respecta", "As far as I'm concerned, it's fine."],
    ["to be honest", "para ser sincero", "To be honest, I didn't enjoy it."],
    ["bear in mind", "tener en cuenta", "Bear in mind it's a holiday."],
    ["come across as", "dar la impresión de", "He comes across as arrogant."],
    ["have a point", "tener razón (en algo)", "You have a point there."],
  ]),
  deck("collocations", "Common collocations", "B2", "Word pairings natives always use.", [
    ["make a decision", "tomar una decisión", "We need to make a decision soon."],
    ["take a risk", "correr un riesgo", "Sometimes you have to take a risk."],
    ["pay attention", "prestar atención", "Pay attention to the details."],
    ["do research", "investigar", "I did some research first."],
    ["keep in touch", "mantener el contacto", "Let's keep in touch."],
    ["break a habit", "romper un hábito", "It's hard to break a habit."],
    ["meet a deadline", "cumplir un plazo", "We just met the deadline."],
    ["raise awareness", "concienciar", "The campaign raises awareness."],
  ]),
  deck("phrasalAdv", "Advanced phrasal verbs", "B2", "Trickier ones that sound native.", [
    ["put up with", "aguantar / tolerar", "I can't put up with the noise."],
    ["look down on", "menospreciar", "Don't look down on beginners."],
    ["get away with", "salirse con la suya", "He got away with it."],
    ["come down to", "reducirse a", "It comes down to money."],
    ["fall through", "venirse abajo", "The plan fell through."],
    ["back up", "respaldar / hacer copia", "Back up your files."],
    ["wear off", "pasarse (efecto)", "The painkiller wore off."],
    ["stand out", "destacar", "Her work really stands out."],
  ]),

  // ── C1 ──
  deck("nuance", "Precise adjectives", "C1", "Swap vague words for sharp ones.", [
    ["meticulous", "meticuloso", "She's meticulous about detail."],
    ["daunting", "intimidante", "The task felt daunting at first."],
    ["compelling", "convincente / cautivador", "He made a compelling argument."],
    ["redundant", "innecesario / redundante", "That sentence is redundant."],
    ["ambiguous", "ambiguo", "The wording is ambiguous."],
    ["resilient", "resiliente", "Kids are remarkably resilient."],
    ["versatile", "versátil", "It's a versatile little tool."],
    ["profound", "profundo", "It had a profound effect on me."],
  ]),
  deck("idioms2", "More idioms", "C1", "Another set to sound effortless.", [
    ["cut corners", "hacer las cosas a medias", "Don't cut corners on safety."],
    ["the tip of the iceberg", "la punta del iceberg", "That's just the tip of the iceberg."],
    ["a blessing in disguise", "un mal que vino para bien", "Losing that job was a blessing in disguise."],
    ["on the fence", "indeciso", "I'm still on the fence about it."],
    ["raise the bar", "subir el listón", "Their album raised the bar."],
    ["jump the gun", "adelantarse / precipitarse", "Don't jump the gun — wait for details."],
    ["the ball is in your court", "te toca decidir/actuar", "I've replied; the ball is in your court."],
    ["food for thought", "algo en qué pensar", "That's certainly food for thought."],
  ]),
  deck("formal", "Formal & academic words", "C1", "Polish for essays and reports.", [
    ["nevertheless", "no obstante", "It rained; nevertheless, we went."],
    ["furthermore", "además", "Furthermore, costs are rising."],
    ["demonstrate", "demostrar", "The study demonstrates a clear link."],
    ["significant", "significativo / importante", "There was a significant increase."],
    ["consequently", "en consecuencia", "Demand fell; consequently, prices dropped."],
    ["underlying", "subyacente", "We must address the underlying cause."],
    ["comprise", "comprender / constar de", "The course comprises six modules."],
    ["notwithstanding", "a pesar de", "Notwithstanding the delay, we finished."],
  ]),
];

export const TOTAL_VOCAB = VOCAB_DECKS.reduce((n, d) => n + d.cards.length, 0);
