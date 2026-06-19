// Short, scannable grammar lessons shown BEFORE practice ("Learn" step).
// Kept intentionally light: the key rule, a couple of examples, one tip.
// Topics mirror the grammar quiz so studying reinforces what's tested.

export interface LessonExample {
  en: string;
  es: string;
}

export interface GrammarLesson {
  id: string;
  topic: string;
  /** one- or two-sentence rule */
  rule: string;
  examples: LessonExample[];
  tip?: string;
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: "present-perfect",
    topic: "Present perfect vs past simple",
    rule: "Use the present perfect (have/has + past participle) for past actions still connected to now (no finished time). Use the past simple for finished moments (yesterday, in 2019).",
    examples: [
      { en: "I have lived here since 2019.", es: "Vivo aquí desde 2019 (y sigo)." },
      { en: "I lived in Paris in 2018.", es: "Viví en París en 2018 (terminado)." },
      { en: "Have you ever eaten sushi?", es: "¿Alguna vez has comido sushi?" },
    ],
    tip: "Señales de present perfect: since, for, ever, never, already, yet.",
  },
  {
    id: "articles",
    topic: "Articles: a / an / the",
    rule: "Use 'a/an' for one non-specific thing, 'the' for something specific or already known. 'an' goes before a vowel SOUND, not just a vowel letter.",
    examples: [
      { en: "She's an honest person.", es: "La 'h' es muda → suena a vocal → an." },
      { en: "I bought a house. The house is old.", es: "Primera mención: a; ya conocido: the." },
      { en: "He's a university student.", es: "'university' suena 'yu' → a, no an." },
    ],
    tip: "Es por el sonido: an hour, a European country.",
  },
  {
    id: "prepositions",
    topic: "Dependent prepositions",
    rule: "Many adjectives and verbs take a fixed preposition you simply have to learn. After a preposition, a verb takes -ing.",
    examples: [
      { en: "I'm good at remembering names.", es: "good at + -ing." },
      { en: "She's interested in art.", es: "interested in." },
      { en: "I look forward to hearing from you.", es: "'to' aquí es preposición → -ing." },
    ],
    tip: "Apréndelas en bloque: depend on, good at, afraid of.",
  },
  {
    id: "conditionals",
    topic: "Conditionals (if)",
    rule: "First conditional (real future): if + present, will + verb. Second conditional (unreal/imaginary): if + past, would + verb.",
    examples: [
      { en: "If it rains, we'll stay home.", es: "Real → first conditional." },
      { en: "If I had more time, I would travel.", es: "Imaginario → second conditional." },
    ],
    tip: "En el second conditional, 'had/were' no es pasado real, es hipótesis.",
  },
  {
    id: "modals",
    topic: "Modal verbs",
    rule: "must/have to = obligation; mustn't = prohibited; don't have to = optional; should = advice; can/could = ability or permission.",
    examples: [
      { en: "You mustn't smoke here.", es: "Prohibido." },
      { en: "You don't have to come.", es: "No es obligatorio (opcional)." },
      { en: "You should rest.", es: "Consejo." },
    ],
    tip: "mustn't ≠ don't have to. Uno prohíbe, el otro libera.",
  },
  {
    id: "gerund-infinitive",
    topic: "Gerund vs infinitive",
    rule: "Some verbs take -ing (enjoy, look forward to, avoid), others take to + verb (want, decide, hope). After prepositions, always -ing.",
    examples: [
      { en: "I enjoy reading.", es: "enjoy + -ing." },
      { en: "I want to learn English.", es: "want + to + verbo." },
      { en: "I'm thinking about moving.", es: "preposición → -ing." },
    ],
  },
  {
    id: "tenses-narrative",
    topic: "Past simple vs past continuous",
    rule: "Past continuous (was/were + -ing) sets a longer action in progress; the past simple is the shorter action that interrupts it.",
    examples: [
      { en: "I was cooking when the phone rang.", es: "En progreso + interrupción." },
      { en: "While we were talking, it started to rain.", es: "Fondo + evento." },
    ],
  },
  {
    id: "comparatives",
    topic: "Comparatives & superlatives",
    rule: "Short adjectives: add -er/-est (fast → faster). Long adjectives: more/most (interesting → more interesting). Never combine both.",
    examples: [
      { en: "This route is faster than the other.", es: "corto → -er." },
      { en: "It's the most interesting book.", es: "largo → most." },
    ],
    tip: "❌ more faster. Es 'faster' a secas.",
  },
  {
    id: "quantifiers",
    topic: "much / many / a few / a little",
    rule: "Countable nouns: many, a few. Uncountable nouns (milk, money, time): much, a little.",
    examples: [
      { en: "There isn't much milk.", es: "milk = incontable → much." },
      { en: "There aren't many cars.", es: "cars = contable → many." },
    ],
  },
  {
    id: "relative-clauses",
    topic: "Relative clauses (who / which / that)",
    rule: "who → people, which → things, that → both, where → places, whose → possession.",
    examples: [
      { en: "That's the woman who helped me.", es: "persona → who." },
      { en: "The book which I read was great.", es: "cosa → which." },
    ],
  },
  {
    id: "reported-speech",
    topic: "Reported speech",
    rule: "When you report what someone said, the tense usually shifts back one step (present → past, will → would).",
    examples: [
      { en: "“I'm tired.” → He said he was tired.", es: "is → was." },
      { en: "“I'll call.” → She said she would call.", es: "will → would." },
    ],
  },
  {
    id: "used-to",
    topic: "used to",
    rule: "'used to + base verb' describes past habits or states that are no longer true. (Different from 'be used to + -ing' = be accustomed.)",
    examples: [
      { en: "I used to play tennis.", es: "Hábito pasado que ya no hago." },
      { en: "I'm used to waking up early.", es: "Estoy acostumbrado (otra estructura)." },
    ],
    tip: "En negativo/pregunta: didn't use to / did you use to (sin -d).",
  },
];
