// Vocabulary written FOR one scenario, keyed `${worldSlug}/${scenarioSlug}` —
// the same keying scenario-lessons.ts established.
//
// Deliberately NOT the deck-browser's shape (src/lib/content/vocabulary.ts):
// that module builds card ids as `${deckId}:${i}` from the array index, so
// inserting a card mid-deck reassigns every later card's id and orphans the
// learner's progress on it. Here the id is authored, and the accessor returns
// `undefined` rather than a fallback, because "this scenario has no vocabulary
// of its own" is a thing the coverage registry has to be able to say.
//
// No React, no hooks, no module-scope clock: scripts/verify-scenario-content.mts
// loads this file under `node --experimental-strip-types`.

export interface ScenarioVocabCard {
  /**
   * Authored slug, unique WITHIN its scenario, never derived from array
   * position — it becomes part of the learner's spaced-repetition key (see
   * `scenarioItemId` in src/lib/review-items.ts). Insert freely; never renumber.
   */
  id: string;
  /** the English word or chunk being learned */
  term: string;
  /** Spanish gloss */
  es: string;
  /** one natural sentence using it */
  example: string;
}

const DECKS: Record<string, ScenarioVocabCard[]> = {
  "social/small-talk": [
    {
      id: "break-the-ice",
      term: "break the ice",
      es: "romper el hielo",
      example: "He told a bad joke to break the ice, and it worked.",
    },
    {
      id: "catch-up",
      term: "catch up",
      es: "ponerse al día",
      example: "We should catch up over coffee — it's been months.",
    },
    {
      id: "small-talk",
      term: "small talk",
      es: "charla trivial",
      example: "I'm fine one-on-one, but I'm terrible at small talk at parties.",
    },
    {
      id: "come-up",
      term: "come up",
      es: "salir a colación (un tema)",
      example: "Your name came up while we were talking about the new team.",
    },
    {
      id: "get-along",
      term: "get along",
      es: "llevarse bien",
      example: "They only met last week, but they get along really well.",
    },
    {
      id: "run-into",
      term: "run into",
      es: "encontrarse por casualidad",
      example: "I ran into an old classmate at the station this morning.",
    },
    {
      id: "how-about-you",
      term: "How about you?",
      es: "¿Y tú?",
      example: "Busy week, but a good one. How about you?",
    },
    {
      id: "no-worries",
      term: "no worries",
      es: "no hay problema",
      example: "No worries — take your time and message me when you're free.",
    },
  ],

  // The phrases for this scenario are all OPENERS. These are the words the
  // follow-through needs, so the two halves do different work.
  "social/making-friends": [
    {
      id: "have-a-lot-in-common",
      term: "have a lot in common",
      es: "tener mucho en común",
      example: "We have a lot in common — same books, same terrible taste in films.",
    },
    {
      id: "acquaintance",
      term: "an acquaintance",
      es: "un conocido (todavía no un amigo)",
      example: "He's an acquaintance from the gym, not really a friend yet.",
    },
    {
      id: "keep-in-touch",
      term: "keep in touch",
      es: "mantener el contacto",
      example: "We swapped numbers at the airport and actually kept in touch.",
    },
    {
      id: "reach-out",
      term: "reach out",
      es: "dar el primer paso, ponerse en contacto",
      example: "If you're new here, reach out first — nobody minds.",
    },
    {
      id: "tag-along",
      term: "tag along",
      es: "apuntarse, ir con alguien",
      example: "They're going climbing on Sunday and said I could tag along.",
    },
    {
      id: "bond-over",
      term: "bond over (something)",
      es: "hacer amistad a raíz de algo compartido",
      example: "We bonded over how much we both hated the training week.",
    },
    {
      id: "get-together",
      term: "a get-together",
      es: "una quedada, una reunión informal",
      example: "It's just a small get-together — five or six people.",
    },
    {
      id: "close-knit",
      term: "close-knit",
      es: "muy unido (un grupo)",
      example: "They're a close-knit group, but they're not unfriendly.",
    },
  ],

  "social/dating": [
    {
      id: "ask-someone-out",
      term: "ask someone out",
      es: "invitar a salir a alguien",
      example: "It took him three weeks to ask her out.",
    },
    {
      id: "hit-it-off",
      term: "hit it off",
      es: "congeniar enseguida",
      example: "We hit it off the moment we started talking about films.",
    },
    {
      id: "take-it-slow",
      term: "take it slow",
      es: "ir despacio",
      example: "She likes me, but she wants to take it slow.",
    },
    {
      id: "have-a-crush-on",
      term: "have a crush on someone",
      es: "estar colado por alguien",
      example: "I've had a crush on my neighbour since March and said nothing.",
    },
    {
      id: "stand-someone-up",
      term: "stand someone up",
      es: "dejar plantado a alguien",
      example: "He stood me up and then texted 'sorry, busy night'.",
    },
    {
      id: "ghost-someone",
      term: "ghost someone",
      es: "desaparecer sin dar explicaciones",
      example: "We had two great dates and then he ghosted me.",
    },
    {
      id: "out-of-my-league",
      term: "out of my league",
      es: "fuera de mi alcance",
      example: "I assumed she was out of my league, so I never said anything.",
    },
    {
      id: "mutual-friend",
      term: "a mutual friend",
      es: "un amigo en común",
      example: "We met through a mutual friend at a birthday dinner.",
    },
  ],

  "social/parties": [
    {
      id: "mingle",
      term: "mingle",
      es: "circular entre la gente",
      example: "Don't stand in the kitchen all night — go and mingle.",
    },
    {
      id: "potluck",
      term: "a potluck",
      es: "comida en la que cada invitado lleva un plato",
      example: "It's a potluck, so bring whatever you like to cook.",
    },
    {
      id: "throw-a-party",
      term: "throw a party",
      es: "dar una fiesta",
      example: "They're throwing a party for her promotion on Saturday.",
    },
    {
      id: "show-up",
      term: "show up",
      es: "aparecer, presentarse",
      example: "Half the guests showed up two hours late.",
    },
    {
      id: "life-of-the-party",
      term: "the life of the party",
      es: "el alma de la fiesta",
      example: "She's quiet at work, but she's the life of the party.",
    },
    {
      id: "rsvp",
      term: "RSVP",
      es: "confirmar asistencia",
      example: "Please RSVP by Thursday so I know how much food to buy.",
    },
    {
      id: "finger-food",
      term: "finger food",
      es: "comida para picar con la mano",
      example: "There's finger food on the table if anyone's hungry.",
    },
    {
      id: "help-yourself",
      term: "help yourself",
      es: "sírvete tú mismo",
      example: "Help yourself to anything in the fridge.",
    },
  ],

  "social/complaining": [
    {
      id: "refund",
      term: "a refund",
      es: "un reembolso",
      example: "They offered store credit, but I asked for a full refund.",
    },
    {
      id: "faulty",
      term: "faulty",
      es: "defectuoso",
      example: "The kettle was faulty out of the box.",
    },
    {
      id: "sort-out",
      term: "sort something out",
      es: "solucionar, arreglar",
      example: "Can we sort this out today rather than next week?",
    },
    {
      id: "chase-up",
      term: "chase something up",
      es: "reclamar, dar seguimiento",
      example: "I had to chase it up twice before anyone replied.",
    },
    {
      id: "the-inconvenience",
      term: "the inconvenience",
      es: "las molestias",
      example: "They apologised for the inconvenience and waived the fee.",
    },
    {
      id: "back-down",
      term: "back down",
      es: "ceder, echarse atrás",
      example: "Stay polite, but don't back down if you know you're right.",
    },
    {
      id: "out-of-order",
      term: "out of order",
      es: "fuera de servicio, averiado",
      example: "The lift has been out of order for a week.",
    },
    {
      id: "file-a-complaint",
      term: "file a complaint",
      es: "poner una reclamación formal",
      example: "If nobody answers by Friday, I'll file a complaint.",
    },
  ],

  "social/favors": [
    {
      id: "run-an-errand",
      term: "run an errand",
      es: "hacer un recado",
      example: "Could you run one errand for me while you're in town?",
    },
    {
      id: "swap-shifts",
      term: "swap shifts",
      es: "cambiar el turno",
      example: "He asked me to swap shifts so he could go to the wedding.",
    },
    {
      id: "drop-off",
      term: "drop something off",
      es: "dejar o entregar algo de paso",
      example: "Would you mind dropping this off at the post office?",
    },
    {
      id: "keep-an-eye-on",
      term: "keep an eye on",
      es: "vigilar, estar pendiente de",
      example: "Could you keep an eye on my bag for a minute?",
    },
    {
      id: "pay-someone-back",
      term: "pay someone back",
      es: "devolver el dinero o el favor",
      example: "Lend me twenty and I'll pay you back on Friday.",
    },
    {
      id: "let-someone-down",
      term: "let someone down",
      es: "fallarle a alguien",
      example: "I said yes and then cancelled — I really let her down.",
    },
    {
      id: "short-notice",
      term: "at short notice",
      es: "con poca antelación",
      example: "Sorry to ask at such short notice, but are you free tonight?",
    },
    {
      id: "return-the-favour",
      term: "return the favour",
      es: "devolver el favor",
      example: "You helped me move, so let me return the favour.",
    },
  ],

  // C1, and about TONE rather than jokes: these are the words for describing
  // how something was meant, which is the skill this scenario teaches.
  "social/humor": [
    {
      id: "deadpan",
      term: "deadpan",
      es: "con cara impasible, sin inmutarse",
      example: "Her delivery is so deadpan that half the room misses the joke.",
    },
    {
      id: "dry-humour",
      term: "dry humour",
      es: "humor seco, socarrón",
      example: "British dry humour sounds serious until you notice the pause.",
    },
    {
      id: "tongue-in-cheek",
      term: "tongue in cheek",
      es: "en tono irónico, sin ir en serio",
      example: "The whole review was tongue in cheek, but nobody realised.",
    },
    {
      id: "banter",
      term: "banter",
      es: "pique amistoso, guasa",
      example: "The banter in that office takes a month to get used to.",
    },
    {
      id: "poke-fun-at",
      term: "poke fun at",
      es: "burlarse de (sin mala intención)",
      example: "He pokes fun at his own accent before anyone else can.",
    },
    {
      id: "at-someones-expense",
      term: "at someone's expense",
      es: "a costa de alguien",
      example: "A joke at the new guy's expense is never worth the laugh.",
    },
    {
      id: "crack-up",
      term: "crack up",
      es: "partirse de risa",
      example: "The whole table cracked up when the waiter joined in.",
    },
    {
      id: "understatement",
      term: "an understatement",
      es: "una atenuación irónica",
      example: "Calling minus ten 'a bit chilly' is classic English understatement.",
    },
  ],

  // A2. Short examples, concrete nouns, and only structures an A2 learner can
  // produce at a counter under pressure.
  "travel/airport": [
    {
      id: "boarding-pass",
      term: "a boarding pass",
      es: "la tarjeta de embarque",
      example: "Have your boarding pass ready at the gate.",
    },
    {
      id: "carry-on",
      term: "a carry-on",
      es: "el equipaje de mano",
      example: "My carry-on was too big, so I had to check it.",
    },
    {
      id: "delayed",
      term: "delayed",
      es: "retrasado",
      example: "Our flight is delayed by two hours.",
    },
    {
      id: "go-through-security",
      term: "go through security",
      es: "pasar el control de seguridad",
      example: "Go through security early — the queue is long.",
    },
    {
      id: "layover",
      term: "a layover",
      es: "una escala",
      example: "We have a short layover in Lisbon.",
    },
    {
      id: "aisle-seat",
      term: "an aisle seat",
      es: "un asiento de pasillo",
      example: "I always ask for an aisle seat on long flights.",
    },
    {
      id: "one-way-ticket",
      term: "a one-way ticket",
      es: "un billete de ida",
      example: "I only booked a one-way ticket.",
    },
    {
      id: "take-off",
      term: "take off",
      es: "despegar",
      example: "The plane takes off at six.",
    },
  ],

  "travel/hotel": [
    {
      id: "double-room",
      term: "a double room",
      es: "una habitación doble",
      example: "We booked a double room with a balcony.",
    },
    {
      id: "en-suite",
      term: "en suite",
      es: "con baño privado",
      example: "All the rooms here are en suite.",
    },
    {
      id: "front-desk",
      term: "the front desk",
      es: "la recepción",
      example: "Leave the key at the front desk when you go out.",
    },
    {
      id: "housekeeping",
      term: "housekeeping",
      es: "el servicio de limpieza",
      example: "Housekeeping comes around eleven, so hang the sign up.",
    },
    {
      id: "deposit",
      term: "a deposit",
      es: "un depósito, una fianza",
      example: "They took a fifty-euro deposit on the card.",
    },
    {
      id: "fully-booked",
      term: "fully booked",
      es: "completo, sin plazas",
      example: "The hotel was fully booked, so we tried the one next door.",
    },
    {
      id: "amenities",
      term: "the amenities",
      es: "los servicios e instalaciones",
      example: "The gym and the pool are the only amenities.",
    },
    {
      id: "vacancy",
      term: "a vacancy",
      es: "una habitación libre",
      example: "The sign outside said 'no vacancies'.",
    },
  ],

  "travel/restaurant": [
    {
      id: "starter",
      term: "a starter",
      es: "un entrante",
      example: "We shared a starter and then had pasta.",
    },
    {
      id: "main-course",
      term: "the main course",
      es: "el plato principal",
      example: "The main course took forty minutes to arrive.",
    },
    {
      id: "the-bill",
      term: "the bill (UK) / the check (US)",
      es: "la cuenta",
      example: "In London, ask for the bill, not the check.",
    },
    {
      id: "a-tip",
      term: "a tip",
      es: "una propina",
      example: "We left a small tip on the table.",
    },
    {
      id: "takeaway",
      term: "a takeaway (UK) / takeout (US)",
      es: "comida para llevar",
      example: "Let's get a takeaway tonight.",
    },
    {
      id: "book-a-table",
      term: "book a table",
      es: "reservar mesa",
      example: "Should we book a table for eight?",
    },
    {
      id: "server",
      term: "the server / the waiter",
      es: "el camarero",
      example: "The server was very patient with us.",
    },
    {
      id: "side",
      term: "a side",
      es: "una guarnición",
      example: "Can I get a side of rice?",
    },
  ],

  "travel/directions": [
    {
      id: "roundabout",
      term: "a roundabout",
      es: "una rotonda",
      example: "Go past the roundabout and turn right.",
    },
    {
      id: "crossroads",
      term: "a crossroads (UK) / an intersection (US)",
      es: "un cruce",
      example: "Wait for me at the crossroads.",
    },
    {
      id: "block",
      term: "a block",
      es: "una manzana, una cuadra",
      example: "The bank is two blocks from here.",
    },
    {
      id: "traffic-lights",
      term: "the traffic lights",
      es: "el semáforo",
      example: "Turn left at the traffic lights.",
    },
    {
      id: "pavement",
      term: "the pavement (UK) / the sidewalk (US)",
      es: "la acera",
      example: "Walk along the pavement for two minutes.",
    },
    {
      id: "get-lost",
      term: "get lost",
      es: "perderse",
      example: "I got lost twice looking for the museum.",
    },
    {
      id: "around-the-corner",
      term: "just around the corner",
      es: "aquí al lado, muy cerca",
      example: "The station is just around the corner.",
    },
    {
      id: "platform",
      term: "the platform",
      es: "el andén",
      example: "The train leaves from platform four.",
    },
  ],

  // The phrases here are what SHE says. These cards are what the pharmacist,
  // the doctor and the police officer say BACK — which is the half a learner
  // never rehearses and the half that decides whether she understands.
  "travel/emergencies": [
    {
      id: "prescription",
      term: "a prescription",
      es: "una receta médica",
      example: "You'll need a prescription for that one.",
    },
    {
      id: "painkillers",
      term: "painkillers",
      es: "analgésicos",
      example: "Take these painkillers twice a day with food.",
    },
    {
      id: "rash",
      term: "a rash",
      es: "un sarpullido",
      example: "How long have you had the rash?",
    },
    {
      id: "symptoms",
      term: "symptoms",
      es: "los síntomas",
      example: "Describe your symptoms from the beginning.",
    },
    {
      id: "dizzy",
      term: "dizzy",
      es: "mareado",
      example: "Do you feel dizzy when you stand up?",
    },
    {
      id: "statement",
      term: "a statement",
      es: "una declaración",
      example: "We'll need a statement before you leave.",
    },
    {
      id: "police-report",
      term: "a police report",
      es: "una denuncia policial",
      example: "Your insurer will ask for a police report.",
    },
    {
      id: "emergency-room",
      term: "the emergency room / A&E",
      es: "urgencias",
      example: "Go straight to the emergency room, not the clinic.",
    },
  ],

  "travel/shopping": [
    {
      id: "fitting-room",
      term: "a fitting room",
      es: "un probador",
      example: "The fitting rooms are at the back, past the shoes.",
    },
    {
      id: "sold-out",
      term: "sold out",
      es: "agotado",
      example: "That size is sold out online too.",
    },
    {
      id: "bargain",
      term: "a bargain",
      es: "una ganga",
      example: "Twelve euros for a coat is a bargain.",
    },
    {
      id: "discount",
      term: "a discount",
      es: "un descuento",
      example: "Students get a ten per cent discount here.",
    },
    {
      id: "in-stock",
      term: "in stock",
      es: "disponible, en existencias",
      example: "Let me check whether we have it in stock.",
    },
    {
      id: "warranty",
      term: "a warranty",
      es: "una garantía",
      example: "The headphones still have six months of warranty.",
    },
    {
      id: "browse",
      term: "browse",
      es: "mirar sin comprar",
      example: "She likes to browse the market before buying anything.",
    },
    {
      id: "checkout",
      term: "the checkout / the till",
      es: "la caja",
      example: "There was one person at the checkout and a queue of nine.",
    },
  ],
};

/**
 * Every key the bank actually holds — see the twin in phrases.ts. Exported for
 * scripts/verify-scenario-content.mts, which uses it to catch a key that names
 * no scenario and would otherwise never be reached by anything.
 */
export function scenarioVocabularyKeys(): string[] {
  return Object.keys(DECKS);
}

/**
 * A scenario's own vocabulary deck, or nothing.
 *
 * `undefined` — never a fallback deck — because the coverage registry decides
 * what the page claims from what this returns, and a total function would make
 * every scenario look covered.
 */
export function getScenarioVocabulary(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioVocabCard[] | undefined {
  return DECKS[`${worldSlug}/${scenarioSlug}`];
}
