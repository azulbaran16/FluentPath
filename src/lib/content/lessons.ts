// Grammar curriculum (A2 → C1), shown as the "Learn" step before practice.
// Each lesson is short and scannable: the key rule, a couple of examples,
// and one tip. Lessons are grouped by CEFR level in the UI.

export type GrammarLevel = "A2" | "B1" | "B2" | "C1";

export interface LessonExample {
  en: string;
  es: string;
}

export interface GrammarLesson {
  id: string;
  level: GrammarLevel;
  topic: string;
  /** one- or two-sentence rule */
  rule: string;
  examples: LessonExample[];
  tip?: string;
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  // ───────────────────────── A2 ─────────────────────────
  {
    id: "present-simple-continuous",
    level: "A2",
    topic: "Present simple vs continuous",
    rule: "Present simple for habits, routines and facts. Present continuous (am/is/are + -ing) for what's happening now or temporarily.",
    examples: [
      { en: "She works in a bank.", es: "Rutina/hecho → present simple." },
      { en: "She's working from home today.", es: "Ahora/temporal → continuous." },
    ],
    tip: "Pistas de simple: always, usually, every day. De continuous: now, at the moment.",
  },
  {
    id: "past-simple",
    level: "A2",
    topic: "Past simple",
    rule: "For finished actions in the past. Regular verbs add -ed; many common verbs are irregular (go→went, have→had).",
    examples: [
      { en: "I watched a film last night.", es: "Regular: watch → watched." },
      { en: "We went to Rome in 2019.", es: "Irregular: go → went." },
    ],
    tip: "En negativo/pregunta se usa 'did' + base: I didn't go / Did you go?",
  },
  {
    id: "articles",
    level: "A2",
    topic: "Articles: a / an / the",
    rule: "'a/an' for one non-specific thing, 'the' for something specific or already known. 'an' goes before a vowel SOUND.",
    examples: [
      { en: "She's an honest person.", es: "'h' muda → suena a vocal → an." },
      { en: "I bought a house. The house is old.", es: "1ª mención: a; ya conocido: the." },
    ],
    tip: "Por el sonido: an hour, a university.",
  },
  {
    id: "there-is-are",
    level: "A2",
    topic: "there is / there are · some / any",
    rule: "'there is' + singular, 'there are' + plural. Use 'some' in affirmatives, 'any' in negatives and questions.",
    examples: [
      { en: "There are some apples.", es: "Plural + afirmativo → are + some." },
      { en: "There isn't any milk.", es: "Negativo → any." },
    ],
  },
  {
    id: "quantifiers",
    level: "A2",
    topic: "much / many / a few / a little",
    rule: "Countable nouns: many, a few. Uncountable nouns (milk, money, time): much, a little. 'a lot of' works with both.",
    examples: [
      { en: "There isn't much milk.", es: "incontable → much." },
      { en: "There aren't many cars.", es: "contable → many." },
    ],
  },
  {
    id: "comparatives",
    level: "A2",
    topic: "Comparatives & superlatives",
    rule: "Short adjectives: -er/-est (fast→faster→the fastest). Long adjectives: more/most. Never combine both.",
    examples: [
      { en: "This route is faster than the other.", es: "corto → -er." },
      { en: "It's the most interesting book.", es: "largo → most." },
    ],
    tip: "❌ more faster. Es 'faster' a secas. Irregular: good→better→best.",
  },
  {
    id: "prepositions-time",
    level: "A2",
    topic: "Prepositions of time: in / on / at",
    rule: "at + hours/points (at 6, at night); on + days/dates (on Monday); in + months/years/parts of day (in May, in the morning).",
    examples: [
      { en: "The meeting is on Monday morning.", es: "día → on." },
      { en: "I get up at 7 in the morning.", es: "hora → at; parte del día → in." },
    ],
  },
  {
    id: "future-basic",
    level: "A2",
    topic: "going to vs will",
    rule: "'be going to' for plans and intentions already decided. 'will' for instant decisions, offers and predictions.",
    examples: [
      { en: "I'm going to study tonight.", es: "Plan decidido → going to." },
      { en: "I'll help you with that.", es: "Decisión del momento → will." },
    ],
  },

  // ───────────────────────── B1 ─────────────────────────
  {
    id: "present-perfect",
    level: "B1",
    topic: "Present perfect vs past simple",
    rule: "Present perfect (have/has + participle) for past actions connected to now (no finished time). Past simple for finished moments.",
    examples: [
      { en: "I have lived here since 2019.", es: "Sigue siendo verdad → present perfect." },
      { en: "I lived in Paris in 2018.", es: "Terminado → past simple." },
    ],
    tip: "Señales: since, for, ever, never, already, yet.",
  },
  {
    id: "past-continuous",
    level: "B1",
    topic: "Past continuous vs past simple",
    rule: "Past continuous (was/were + -ing) for a longer action in progress; past simple for the shorter action that interrupts it.",
    examples: [
      { en: "I was cooking when the phone rang.", es: "En progreso + interrupción." },
    ],
  },
  {
    id: "conditionals-1-2",
    level: "B1",
    topic: "First & second conditional",
    rule: "First (real future): if + present, will + verb. Second (unreal/imaginary): if + past, would + verb.",
    examples: [
      { en: "If it rains, we'll stay home.", es: "Real → first." },
      { en: "If I had more time, I would travel.", es: "Imaginario → second." },
    ],
  },
  {
    id: "used-to",
    level: "B1",
    topic: "used to",
    rule: "'used to + base verb' = past habits/states no longer true. (≠ 'be used to + -ing' = be accustomed.)",
    examples: [
      { en: "I used to play tennis.", es: "Hábito pasado que ya no hago." },
      { en: "I'm used to waking up early.", es: "Estoy acostumbrado (otra estructura)." },
    ],
    tip: "Negativo/pregunta: didn't use to / did you use to (sin -d).",
  },
  {
    id: "modals-basic",
    level: "B1",
    topic: "Modals: obligation, advice, ability",
    rule: "must/have to = obligation; mustn't = prohibited; don't have to = optional; should = advice; can/could = ability/permission.",
    examples: [
      { en: "You mustn't smoke here.", es: "Prohibido." },
      { en: "You don't have to come.", es: "Opcional (no obligatorio)." },
    ],
    tip: "mustn't ≠ don't have to: uno prohíbe, el otro libera.",
  },
  {
    id: "gerund-infinitive",
    level: "B1",
    topic: "Gerund vs infinitive",
    rule: "Some verbs take -ing (enjoy, avoid, look forward to), others to + verb (want, decide, hope). After prepositions → -ing.",
    examples: [
      { en: "I enjoy reading.", es: "enjoy + -ing." },
      { en: "I want to learn English.", es: "want + to + verbo." },
    ],
  },
  {
    id: "relative-clauses",
    level: "B1",
    topic: "Relative clauses (who / which / that)",
    rule: "who → people, which → things, that → both, where → places, whose → possession.",
    examples: [
      { en: "That's the woman who helped me.", es: "persona → who." },
      { en: "The town where I grew up is small.", es: "lugar → where." },
    ],
  },
  {
    id: "dependent-prepositions",
    level: "B1",
    topic: "Dependent prepositions",
    rule: "Many adjectives/verbs take a fixed preposition you learn as a block; after it, verbs take -ing.",
    examples: [
      { en: "I'm good at remembering names.", es: "good at + -ing." },
      { en: "It depends on the weather.", es: "depend on." },
    ],
  },
  {
    id: "future-forms",
    level: "B1",
    topic: "Future forms",
    rule: "will (predictions/decisions), going to (plans/evidence), present continuous (fixed arrangements with people/times).",
    examples: [
      { en: "I'm meeting Sara at 5.", es: "Cita acordada → present continuous." },
      { en: "Look at those clouds — it's going to rain.", es: "Evidencia → going to." },
    ],
  },

  // ───────────────────────── B2 ─────────────────────────
  {
    id: "present-perfect-continuous",
    level: "B2",
    topic: "Present perfect continuous",
    rule: "have/has been + -ing: emphasises the duration of an action continuing up to now (often still happening).",
    examples: [
      { en: "I've been studying for three hours.", es: "Duración hasta ahora." },
      { en: "It's been raining all day.", es: "Acción prolongada y reciente." },
    ],
    tip: "Continuous = cuánto tiempo; simple (I've done) = resultado/cantidad.",
  },
  {
    id: "past-perfect",
    level: "B2",
    topic: "Past perfect",
    rule: "had + past participle: an action that happened BEFORE another past action. Adds order to the story.",
    examples: [
      { en: "By the time we arrived, the film had started.", es: "Empezó antes de llegar." },
      { en: "She had never seen snow before that trip.", es: "Anterior a otro momento pasado." },
    ],
  },
  {
    id: "passive",
    level: "B2",
    topic: "Passive voice",
    rule: "be + past participle. Use it when the action matters more than who did it. Add 'by' only if the agent is important.",
    examples: [
      { en: "The bridge was built in 1890.", es: "Importa la acción, no quién." },
      { en: "English is spoken here.", es: "Agente irrelevante." },
    ],
  },
  {
    id: "third-conditional",
    level: "B2",
    topic: "Third conditional & wish",
    rule: "Third conditional (unreal past): if + past perfect, would have + participle. 'wish + past perfect' = regret about the past.",
    examples: [
      { en: "If I had studied, I would have passed.", es: "Pasado imposible de cambiar." },
      { en: "I wish I had said yes.", es: "Arrepentimiento del pasado." },
    ],
  },
  {
    id: "reported-speech",
    level: "B2",
    topic: "Reported speech",
    rule: "Tenses shift back (is→was, will→would). Questions keep statement word order (no auxiliary); commands use 'tell sb to'.",
    examples: [
      { en: "“I'm tired.” → He said he was tired.", es: "is → was." },
      { en: "“Where do you live?” → She asked where I lived.", es: "Pregunta → orden de afirmación." },
    ],
  },
  {
    id: "modals-deduction",
    level: "B2",
    topic: "Modals of deduction (past)",
    rule: "must have (sure it happened), can't/couldn't have (sure it didn't), might/may/could have (possible).",
    examples: [
      { en: "She must have left already.", es: "Deducción casi segura." },
      { en: "He can't have known.", es: "Imposible que lo supiera." },
    ],
  },
  {
    id: "causative",
    level: "B2",
    topic: "Causative: have/get something done",
    rule: "have/get + object + past participle = you arrange for someone else to do it for you.",
    examples: [
      { en: "I had my car repaired.", es: "Otro reparó mi coche (yo lo gestioné)." },
      { en: "She's getting her hair cut.", es: "Alguien le corta el pelo." },
    ],
  },
  {
    id: "degree-structures",
    level: "B2",
    topic: "so / such · too / enough · as…as",
    rule: "so + adjective; such + (a) + noun phrase. too = more than needed; enough = the right amount. as…as = equality.",
    examples: [
      { en: "It was so cold that we left.", es: "so + adjetivo." },
      { en: "It's not big enough.", es: "enough va tras el adjetivo." },
    ],
  },
  {
    id: "future-perfect-continuous",
    level: "B2",
    topic: "Future perfect & continuous",
    rule: "will have + participle = finished before a future point. will be + -ing = in progress at a future point.",
    examples: [
      { en: "By 2030 I'll have graduated.", es: "Completado antes de 2030." },
      { en: "This time tomorrow I'll be flying.", es: "En progreso en ese momento." },
    ],
  },

  // ───────────────────────── C1 ─────────────────────────
  {
    id: "inversion",
    level: "C1",
    topic: "Inversion (emphasis)",
    rule: "After negative adverbials at the start (Never, Hardly, No sooner, Not only), invert subject and auxiliary like a question.",
    examples: [
      { en: "Never have I seen such a mess.", es: "Never + auxiliar + sujeto." },
      { en: "No sooner had I sat down than it rang.", es: "Estructura no sooner…than." },
    ],
    tip: "Suena formal/enfático. No sooner… than; Hardly… when.",
  },
  {
    id: "cleft",
    level: "C1",
    topic: "Cleft sentences (emphasis)",
    rule: "Split a sentence to stress one part: 'It was X that…' or 'What I need is…'.",
    examples: [
      { en: "It was John who broke it.", es: "Enfatiza quién." },
      { en: "What I need is a break.", es: "Enfatiza el objeto." },
    ],
  },
  {
    id: "mixed-conditionals",
    level: "C1",
    topic: "Mixed conditionals",
    rule: "Mix times: past condition → present result (if + past perfect, would + verb), or present condition → past result.",
    examples: [
      { en: "If I had saved money, I'd be rich now.", es: "Pasado → presente." },
      { en: "If I were taller, I would have made the team.", es: "Presente → pasado." },
    ],
  },
  {
    id: "discourse-markers",
    level: "C1",
    topic: "Advanced connectors",
    rule: "Link ideas precisely: despite/in spite of + noun/-ing; although + clause; however/nevertheless (contrast); whereas (comparison).",
    examples: [
      { en: "Despite the rain, we went out.", es: "despite + sustantivo/-ing." },
      { en: "He's quiet, whereas she's outgoing.", es: "whereas = contraste paralelo." },
    ],
    tip: "despite + sustantivo; although + sujeto+verbo. No '❌ despite of'.",
  },
];

export const LESSON_LEVELS: GrammarLevel[] = ["A2", "B1", "B2", "C1"];
