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

  // The phrases here are what SHE says in the room. These cards are the words
  // the PROCESS uses around her — the ones in the job ad, the recruiter's call
  // and the contract — which is where a B2 candidate actually gets lost.
  "work/interviews": [
    {
      id: "shortlist",
      term: "a shortlist",
      es: "la lista de finalistas",
      example: "You're on the shortlist, so expect a call this week.",
    },
    {
      id: "track-record",
      term: "a track record",
      es: "una trayectoria demostrable",
      example: "She has a track record of turning failing teams around.",
    },
    {
      id: "transferable-skills",
      term: "transferable skills",
      es: "competencias transferibles",
      example: "Most of my transferable skills come from managing volunteers.",
    },
    {
      id: "hands-on",
      term: "hands-on",
      es: "práctico, con implicación directa",
      example: "The role is very hands-on for the first six months.",
    },
    {
      id: "good-fit",
      term: "to be a good fit",
      es: "encajar bien",
      example: "They liked me but said I wasn't a good fit for that team.",
    },
    {
      id: "probation-period",
      term: "a probation period",
      es: "el periodo de prueba",
      example: "There's a six-month probation period on every new contract.",
    },
    {
      id: "notice-period",
      term: "a notice period",
      es: "el plazo de preaviso",
      example: "I'd have to work a month's notice period before I could start.",
    },
    {
      id: "salary-expectations",
      term: "salary expectations",
      es: "las expectativas salariales",
      example: "They asked about my salary expectations before the second round.",
    },
  ],

  "work/meetings": [
    {
      id: "agenda",
      term: "the agenda",
      es: "el orden del día",
      example: "Can we add one item to the agenda before we start?",
    },
    {
      id: "action-points",
      term: "action points",
      es: "las tareas acordadas",
      example: "Let's finish with the action points and who owns each one.",
    },
    {
      id: "take-the-minutes",
      term: "take the minutes",
      es: "levantar acta",
      example: "Someone needs to take the minutes — I did it last time.",
    },
    {
      id: "talk-over-someone",
      term: "talk over someone",
      es: "pisarle la palabra a alguien",
      example: "On video calls people talk over each other constantly.",
    },
    {
      id: "on-mute",
      term: "on mute",
      es: "con el micrófono silenciado",
      example: "You're on mute — we can see you but we can't hear you.",
    },
    {
      id: "run-over",
      term: "run over",
      es: "alargarse más de la cuenta",
      example: "The demo ran over by twenty minutes and we skipped the budget.",
    },
    {
      id: "show-of-hands",
      term: "a show of hands",
      es: "una votación a mano alzada",
      example: "Let's have a show of hands: who's in favour?",
    },
    {
      id: "touch-base",
      term: "touch base",
      es: "hacer una puesta en común breve",
      example: "I'll touch base with you on Thursday before the client call.",
    },
  ],

  // The writing half of this scenario belongs to plan 03-06. These cards are
  // the machinery a learner has to RECOGNISE in someone else's message.
  "work/emails": [
    {
      id: "subject-line",
      term: "the subject line",
      es: "el asunto",
      example: "Put the deadline in the subject line and people actually read it.",
    },
    {
      id: "attachment",
      term: "an attachment",
      es: "un archivo adjunto",
      example: "The attachment didn't come through — could you resend it?",
    },
    {
      id: "out-of-office",
      term: "an out-of-office",
      es: "una respuesta automática de ausencia",
      example: "His out-of-office says he's back on the ninth.",
    },
    {
      id: "bounce-back",
      term: "bounce back",
      es: "ser devuelto (un correo)",
      example: "The email bounced back — that address doesn't exist any more.",
    },
    {
      id: "recipient",
      term: "the recipient",
      es: "el destinatario",
      example: "Check the recipient twice before you send anything sensitive.",
    },
    {
      id: "flag-something",
      term: "flag something",
      es: "marcar algo para no perderlo",
      example: "I flagged your message so it wouldn't disappear down the list.",
    },
    {
      id: "sign-off",
      term: "a sign-off",
      es: "la despedida de un correo",
      example: "'Kind regards' is a safe sign-off with a client you've never met.",
    },
    {
      id: "snowed-under",
      term: "snowed under",
      es: "hasta arriba de trabajo",
      example: "Apologies for the slow reply — I've been snowed under all week.",
    },
  ],

  "work/presentations": [
    {
      id: "slide-deck",
      term: "a slide deck",
      es: "una presentación (el conjunto de diapositivas)",
      example: "Send me the slide deck the night before, not five minutes before.",
    },
    {
      id: "signpost",
      term: "signpost",
      es: "ir anunciando la estructura",
      example: "Good speakers signpost constantly so nobody gets lost.",
    },
    {
      id: "q-and-a",
      term: "the Q&A",
      es: "el turno de preguntas",
      example: "We overran, so the Q&A was cut to four minutes.",
    },
    {
      id: "handout",
      term: "a handout",
      es: "un documento de apoyo que se reparte",
      example: "There's a handout at the back with all the figures.",
    },
    {
      id: "go-off-on-a-tangent",
      term: "go off on a tangent",
      es: "irse por las ramas",
      example: "He went off on a tangent about the office move and lost the room.",
    },
    {
      id: "lose-your-train-of-thought",
      term: "lose your train of thought",
      es: "perder el hilo",
      example: "I lost my train of thought halfway through the second slide.",
    },
    {
      id: "dry-run",
      term: "a dry run",
      es: "un ensayo previo",
      example: "The dry run on Tuesday cut it from forty minutes to twenty-five.",
    },
    {
      id: "filler-word",
      term: "a filler word",
      es: "una muletilla",
      example: "Her only filler word is 'so', and she uses it once a minute.",
    },
  ],

  // C1. The words that let a learner push back without closing the door — a
  // vocabulary of positions and trades rather than of disagreement.
  "work/negotiating": [
    {
      id: "sticking-point",
      term: "a sticking point",
      es: "un punto de fricción",
      example: "The only sticking point left is who pays for shipping.",
    },
    {
      id: "deal-breaker",
      term: "a deal-breaker",
      es: "una condición innegociable",
      example: "Exclusivity is a deal-breaker for us, I'm afraid.",
    },
    {
      id: "meet-someone-halfway",
      term: "meet someone halfway",
      es: "llegar a un punto medio",
      example: "We'll meet you halfway on the fee if you sign this month.",
    },
    {
      id: "concession",
      term: "a concession",
      es: "una concesión",
      example: "That's the third concession we've made and we've had none back.",
    },
    {
      id: "leverage",
      term: "leverage",
      es: "poder de negociación",
      example: "Once they knew we had another offer, we had real leverage.",
    },
    {
      id: "walk-away",
      term: "walk away",
      es: "levantarse de la mesa",
      example: "Being willing to walk away is worth more than any argument.",
    },
    {
      id: "ballpark-figure",
      term: "a ballpark figure",
      es: "una cifra aproximada",
      example: "Give me a ballpark figure and I'll tell you if it's worth continuing.",
    },
    {
      id: "counter-offer",
      term: "a counter-offer",
      es: "una contraoferta",
      example: "Their counter-offer was barely different, so we let it sit a week.",
    },
  ],

  "work/networking": [
    {
      id: "elevator-pitch",
      term: "an elevator pitch",
      es: "una presentación de treinta segundos",
      example: "Her elevator pitch is two sentences and you remember both.",
    },
    {
      id: "work-the-room",
      term: "work the room",
      es: "moverse por la sala hablando con todos",
      example: "He worked the room for an hour and left with nine cards.",
    },
    {
      id: "lead",
      term: "a lead",
      es: "un contacto con posible recorrido",
      example: "That conversation turned into our best lead of the year.",
    },
    {
      id: "follow-up",
      term: "follow up",
      es: "dar seguimiento",
      example: "Follow up within two days or the conversation is wasted.",
    },
    {
      id: "warm-introduction",
      term: "a warm introduction",
      es: "una presentación hecha por alguien de confianza",
      example: "A warm introduction beats a cold email every single time.",
    },
    {
      id: "peer",
      term: "a peer",
      es: "alguien de tu mismo nivel profesional",
      example: "It helps to have peers outside your own company.",
    },
    {
      id: "put-a-face-to-a-name",
      term: "put a face to a name",
      es: "poner cara a un nombre",
      example: "It's good to finally put a face to the name.",
    },
    {
      id: "on-my-radar",
      term: "on my radar",
      es: "presente, en mente",
      example: "I'll keep you on my radar if anything opens up.",
    },
  ],

  "work/feedback": [
    {
      id: "constructive-criticism",
      term: "constructive criticism",
      es: "crítica constructiva",
      example: "There's a difference between constructive criticism and venting.",
    },
    {
      id: "blind-spot",
      term: "a blind spot",
      es: "un punto ciego sobre uno mismo",
      example: "Interrupting people was a blind spot until someone told me.",
    },
    {
      id: "sugarcoat",
      term: "sugarcoat",
      es: "endulzar, suavizar de más",
      example: "Don't sugarcoat it — I'd rather know now.",
    },
    {
      id: "defensive",
      term: "defensive",
      es: "a la defensiva",
      example: "The moment he got defensive, the conversation was over.",
    },
    {
      id: "performance-review",
      term: "a performance review",
      es: "una evaluación de desempeño",
      example: "Nothing in a performance review should ever be a surprise.",
    },
    {
      id: "take-on-board",
      term: "take something on board",
      es: "asumir algo, tenerlo en cuenta",
      example: "She took the note on board and rewrote the whole section.",
    },
    {
      id: "praise",
      term: "praise",
      es: "elogios, reconocimiento",
      example: "Praise in public, criticise in private.",
    },
    {
      id: "call-someone-out",
      term: "call someone out",
      es: "señalar públicamente a alguien",
      example: "Calling someone out in a meeting rarely changes behaviour.",
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

  // ── Reading & Ideas ────────────────────────────────────────────

  // B2. The phrases are how she TALKS about a story; these cards are the
  // machinery of the newsroom that produced it, which is what decides how much
  // weight a line deserves.
  "academic/news": [
    {
      id: "outlet",
      term: "an outlet",
      es: "un medio de comunicación",
      example: "The same story ran in three outlets with three different angles.",
    },
    {
      id: "byline",
      term: "a byline",
      es: "la firma del autor",
      example: "Check the byline — she covers the courts, so she knows the case.",
    },
    {
      id: "op-ed",
      term: "an op-ed",
      es: "un artículo de opinión",
      example: "It reads like reporting, but it's an op-ed and it's labelled one.",
    },
    {
      id: "break-a-story",
      term: "break a story",
      es: "dar una noticia en primicia",
      example: "A local paper broke the story a week before anyone else.",
    },
    {
      id: "allegedly",
      term: "allegedly",
      es: "presuntamente",
      example: "He allegedly signed the contract himself, though nobody has seen it.",
    },
    {
      id: "bias",
      term: "bias",
      es: "el sesgo",
      example: "Every paper has some bias; the useful skill is knowing which.",
    },
    {
      id: "retraction",
      term: "a retraction",
      es: "una rectificación",
      example: "The correction ran on page nineteen, weeks after the retraction.",
    },
    {
      id: "coverage",
      term: "coverage",
      es: "la cobertura informativa",
      example: "The coverage died down the moment the trial ended.",
    },
  ],

  // C1, and chosen against the trap the plan names: these are the words that
  // let a reader TRACK an argument across paragraphs, not impressive nouns.
  "academic/articles": [
    {
      id: "premise",
      term: "a premise",
      es: "una premisa",
      example: "The argument is careful, but the premise it rests on is never defended.",
    },
    {
      id: "qualify",
      term: "qualify (a claim)",
      es: "matizar una afirmación",
      example: "He qualifies it two paragraphs later: 'in most cases', not 'always'.",
    },
    {
      id: "caveat",
      term: "a caveat",
      es: "una salvedad",
      example: "She offers one caveat, and it quietly undoes half the chapter.",
    },
    {
      id: "underpin",
      term: "underpin",
      es: "sustentar, servir de base a",
      example: "One study underpins the whole piece, and it is twenty years old.",
    },
    {
      id: "case-in-point",
      term: "a case in point",
      es: "un ejemplo que lo demuestra",
      example: "The 2008 crash is a case in point, and he spends four pages on it.",
    },
    {
      id: "ostensibly",
      term: "ostensibly",
      es: "en apariencia, supuestamente",
      example: "The essay is ostensibly about housing, but it's really about class.",
    },
    {
      id: "upshot",
      term: "the upshot",
      es: "la conclusión práctica",
      example: "The upshot is that nothing changes until the funding does.",
    },
    {
      id: "gloss-over",
      term: "gloss over",
      es: "pasar por alto, tratar de puntillas",
      example: "He glosses over the cost, which is the only question that matters.",
    },
  ],

  // B2. The words a reader needs to say what a story DID to her — and to talk
  // about fiction with someone who has read it.
  "academic/stories": [
    {
      id: "plot-twist",
      term: "a plot twist",
      es: "un giro argumental",
      example: "The plot twist works because she planted it in chapter two.",
    },
    {
      id: "cliffhanger",
      term: "a cliffhanger",
      es: "un final en suspense",
      example: "Every chapter ends on a cliffhanger, which gets tiring by page 200.",
    },
    {
      id: "flashback",
      term: "a flashback",
      es: "un salto al pasado",
      example: "The middle third is one long flashback to his first winter there.",
    },
    {
      id: "foreshadowing",
      term: "foreshadowing",
      es: "los indicios de lo que va a pasar",
      example: "The broken clock is foreshadowing — you only see it afterwards.",
    },
    {
      id: "far-fetched",
      term: "far-fetched",
      es: "inverosímil",
      example: "The ending is a bit far-fetched, but by then you don't mind.",
    },
    {
      id: "bittersweet",
      term: "bittersweet",
      es: "agridulce",
      example: "It's a bittersweet story: she wins, and it costs her everything.",
    },
    {
      id: "page-turner",
      term: "a page-turner",
      es: "un libro que engancha",
      example: "It's a proper page-turner — I read it in two evenings.",
    },
    {
      id: "give-away-the-ending",
      term: "give away the ending",
      es: "destripar el final",
      example: "Don't give away the ending; she's only halfway through.",
    },
  ],

  // B2, and the vocabulary of REDUCTION — the qualities a summary is judged on,
  // rather than the moves the phrases already teach.
  "academic/summaries": [
    {
      id: "gist",
      term: "the gist",
      es: "la idea general",
      example: "I didn't follow every word, but I got the gist of it.",
    },
    {
      id: "paraphrase",
      term: "paraphrase",
      es: "parafrasear",
      example: "Paraphrase it properly; changing two words is still copying.",
    },
    {
      id: "concise",
      term: "concise",
      es: "conciso",
      example: "Her summary was concise and still answered the question.",
    },
    {
      id: "long-winded",
      term: "long-winded",
      es: "prolijo, farragoso",
      example: "The original is long-winded, which is exactly why it needs a summary.",
    },
    {
      id: "redundant",
      term: "redundant",
      es: "superfluo, que sobra",
      example: "That last sentence is redundant — the paragraph already said it.",
    },
    {
      id: "abstract",
      term: "an abstract",
      es: "un resumen inicial",
      example: "Read the abstract first and you'll know whether the paper is for you.",
    },
    {
      id: "verbatim",
      term: "verbatim",
      es: "literalmente, palabra por palabra",
      example: "Don't quote it verbatim unless the wording itself is the point.",
    },
    {
      id: "word-count",
      term: "the word count",
      es: "el número de palabras",
      example: "It's good, but it's double the word count they asked for.",
    },
  ],

  // C1. The phrases are the moves she MAKES; these cards are what she needs to
  // name the moves being made at her.
  "academic/debate": [
    {
      id: "rebuttal",
      term: "a rebuttal",
      es: "una réplica, una refutación",
      example: "His rebuttal was three sentences long and it ended the argument.",
    },
    {
      id: "straw-man",
      term: "a straw man",
      es: "un argumento de paja",
      example: "That's a straw man — nobody in the room said anything that extreme.",
    },
    {
      id: "anecdotal",
      term: "anecdotal",
      es: "anecdótico, basado en casos sueltos",
      example: "The evidence is anecdotal: two friends of his and a taxi driver.",
    },
    {
      id: "undermine",
      term: "undermine",
      es: "socavar, restar fuerza a",
      example: "One wrong figure undermined everything she said after it.",
    },
    {
      id: "compelling",
      term: "compelling",
      es: "convincente, difícil de rebatir",
      example: "I disagree with him, but the case he made was compelling.",
    },
    {
      id: "double-standard",
      term: "a double standard",
      es: "un doble rasero",
      example: "There's a double standard here, and it's worth naming out loud.",
    },
    {
      id: "double-down",
      term: "double down",
      es: "reafirmarse aún más",
      example: "Instead of correcting it, he doubled down and lost the room.",
    },
    {
      id: "devils-advocate",
      term: "play devil's advocate",
      es: "hacer de abogado del diablo",
      example: "Let me play devil's advocate for a minute — what if she's right?",
    },
  ],

  // The phrases are what she SAYS into the handset. These cards are the state
  // the call can be in — on hold, cut off, in a voicemail — which is what the
  // other end will tell her is happening.
  "practical/phone-calls": [
    {
      id: "on-hold",
      term: "on hold",
      es: "en espera",
      example: "I was on hold for twenty minutes and then the line went dead.",
    },
    {
      id: "hang-up",
      term: "hang up",
      es: "colgar",
      example: "Don't hang up — I'm transferring you now.",
    },
    {
      id: "landline",
      term: "a landline",
      es: "un teléfono fijo",
      example: "The signal's bad in here; call me on the landline.",
    },
    {
      id: "transfer-a-call",
      term: "transfer a call",
      es: "pasar una llamada",
      example: "She transferred the call and I had to explain it all again.",
    },
    {
      id: "extension",
      term: "an extension",
      es: "una extensión",
      example: "Her extension is two-oh-four.",
    },
    {
      id: "voicemail",
      term: "voicemail",
      es: "el buzón de voz",
      example: "I left a voicemail, but she never checks it.",
    },
    {
      id: "get-through",
      term: "get through",
      es: "conseguir contactar",
      example: "I tried four times before I got through to a human.",
    },
    {
      id: "cold-call",
      term: "a cold call",
      es: "una llamada comercial no solicitada",
      example: "I don't answer numbers I don't know — they're all cold calls.",
    },
  ],

  "practical/tech-support": [
    {
      id: "crash",
      term: "crash",
      es: "colgarse, cerrarse de golpe",
      example: "The app crashes the moment I upload a photo.",
    },
    {
      id: "freeze",
      term: "freeze",
      es: "quedarse congelado",
      example: "The screen froze and the cursor stopped moving.",
    },
    {
      id: "error-message",
      term: "an error message",
      es: "un mensaje de error",
      example: "Read me the error message exactly as it appears.",
    },
    {
      id: "reboot",
      term: "reboot",
      es: "reiniciar",
      example: "Reboot it and tell me if the light turns green.",
    },
    {
      id: "glitch",
      term: "a glitch",
      es: "un fallo puntual",
      example: "It was a glitch, not a fault — it hasn't happened since.",
    },
    {
      id: "log-out",
      term: "log someone out",
      es: "cerrarle la sesión a alguien",
      example: "It logs me out every ten minutes for no reason.",
    },
    {
      id: "workaround",
      term: "a workaround",
      es: "una solución provisional",
      example: "There's a workaround, but it isn't a fix.",
    },
    {
      id: "be-down",
      term: "be down",
      es: "estar caído (un servicio)",
      example: "The whole system's been down since nine this morning.",
    },
  ],

  // B2. The nouns on the paperwork, not the questions at the viewing — the
  // phrases already cover what she asks out loud.
  "practical/housing": [
    {
      id: "landlord",
      term: "a landlord",
      es: "el casero, el propietario",
      example: "The landlord lives abroad, so an agency handles everything.",
    },
    {
      id: "tenancy-agreement",
      term: "a tenancy agreement",
      es: "un contrato de arrendamiento",
      example: "Read the tenancy agreement before you transfer anything.",
    },
    {
      id: "utilities",
      term: "the utilities",
      es: "los suministros (luz, agua, gas)",
      example: "The rent looks cheap until you add the utilities.",
    },
    {
      id: "inventory",
      term: "an inventory",
      es: "el inventario de entrada",
      example: "Photograph everything on the inventory the day you move in.",
    },
    {
      id: "break-clause",
      term: "a break clause",
      es: "una cláusula de salida anticipada",
      example: "There's a break clause at six months, which is why I took it.",
    },
    {
      id: "unfurnished",
      term: "unfurnished",
      es: "sin muebles",
      example: "It's unfurnished, so budget for a bed and a fridge.",
    },
    {
      id: "viewing",
      term: "a viewing",
      es: "una visita a la vivienda",
      example: "We had three viewings booked on the same afternoon.",
    },
    {
      id: "estate-agent",
      term: "an estate agent",
      es: "un agente inmobiliario",
      example: "The estate agent turned up late with the wrong keys.",
    },
  ],

  "practical/banking": [
    {
      id: "current-account",
      term: "a current account (UK) / a checking account (US)",
      es: "una cuenta corriente",
      example: "You'll need a current account before they set up the salary payment.",
    },
    {
      id: "direct-debit",
      term: "a direct debit",
      es: "una domiciliación bancaria",
      example: "The gym takes it by direct debit on the first of the month.",
    },
    {
      id: "standing-order",
      term: "a standing order",
      es: "una orden de pago periódica",
      example: "Rent goes out by standing order, not direct debit.",
    },
    {
      id: "overdraft",
      term: "an overdraft",
      es: "un descubierto autorizado",
      example: "The first five hundred of the overdraft is interest-free.",
    },
    {
      id: "sort-code",
      term: "a sort code (UK) / a routing number (US)",
      es: "el código de la entidad bancaria",
      example: "They need the sort code and the account number, nothing else.",
    },
    {
      id: "balance",
      term: "the balance",
      es: "el saldo",
      example: "Check the balance before the rent goes out on Friday.",
    },
    {
      id: "withdraw",
      term: "withdraw",
      es: "sacar dinero",
      example: "There's a limit on how much you can withdraw in one day.",
    },
    {
      id: "interest",
      term: "interest",
      es: "los intereses",
      example: "The account pays almost no interest, but it's free to run.",
    },
  ],

  // A2, and the examples stay A2 too: one clause, present or past simple, a
  // concrete noun. A card a learner cannot say back is not a card.
  "practical/appointments": [
    {
      id: "waiting-list",
      term: "a waiting list",
      es: "una lista de espera",
      example: "There's a waiting list of three weeks.",
    },
    {
      id: "cancel",
      term: "cancel",
      es: "cancelar",
      example: "Please cancel it if you can't come.",
    },
    {
      id: "reschedule",
      term: "reschedule",
      es: "cambiar de fecha",
      example: "Can we reschedule for next Monday?",
    },
    {
      id: "receptionist",
      term: "the receptionist",
      es: "el recepcionista",
      example: "Ask the receptionist when you arrive.",
    },
    {
      id: "reminder",
      term: "a reminder",
      es: "un recordatorio",
      example: "They send a reminder by text the day before.",
    },
    {
      id: "available",
      term: "available",
      es: "libre, disponible",
      example: "Is the doctor available on Thursday?",
    },
    {
      id: "running-late",
      term: "be running late",
      es: "ir con retraso",
      example: "The doctor is running twenty minutes late.",
    },
    {
      id: "check-up",
      term: "a check-up",
      es: "una revisión",
      example: "It's only a check-up. It takes ten minutes.",
    },
  ],

  // ── Sounding Native ───────────────────────────────────────────
  //
  // All five sit at their DECLARED CEFR level and at the same D-04 floors as
  // every other scenario. The fuller native-level treatment of this world —
  // deeper idiom work, phrasal-verb families, pronunciation drills, register
  // and culture at native level — is CONT-04, and 03-CONTEXT defers it to
  // Phase 4. A deck that tried to be that here would overshoot this phase and
  // leave Phase 4 nothing to add.

  // C1. The six existing PHRASES are the six best-known idioms; these are eight
  // more, so the deck extends the set rather than glossing it a second time.
  "native/idioms": [
    {
      id: "once-in-a-blue-moon",
      term: "once in a blue moon",
      es: "muy de vez en cuando",
      example: "We only go into town once in a blue moon these days.",
    },
    {
      id: "beat-around-the-bush",
      term: "beat around the bush",
      es: "andarse por las ramas",
      example: "Stop beating around the bush and tell me what it cost.",
    },
    {
      id: "bite-the-bullet",
      term: "bite the bullet",
      es: "hacer de tripas corazón",
      example: "I bit the bullet and booked the flight before I changed my mind.",
    },
    {
      id: "last-straw",
      term: "the last straw",
      es: "la gota que colma el vaso",
      example: "Losing the keys again was the last straw.",
    },
    {
      id: "arm-and-a-leg",
      term: "cost an arm and a leg",
      es: "costar un ojo de la cara",
      example: "The tickets cost an arm and a leg, and it rained all weekend.",
    },
    {
      id: "cat-out-of-the-bag",
      term: "let the cat out of the bag",
      es: "irse de la lengua",
      example: "His brother let the cat out of the bag about the party.",
    },
    {
      id: "on-the-ball",
      term: "on the ball",
      es: "espabilado, muy al tanto",
      example: "Ask Marta — she's completely on the ball with the new system.",
    },
    {
      id: "blessing-in-disguise",
      term: "a blessing in disguise",
      es: "no hay mal que por bien no venga",
      example: "Missing that train turned out to be a blessing in disguise.",
    },
  ],

  // B2. The first eight cards were authored on a "one verb per card" rule —
  // eight verbs the six phrases did not use. Phase 4 (CONT-04) took the deck to
  // twenty-four and the sixteen additions are authored on a DIFFERENT rule,
  // which is what makes them native-level rather than merely more:
  //
  //   THE UNIT IS VERB + PARTICLE + SENSE, NOT VERB + PARTICLE.
  //
  // Where a frequent verb carries two or three distinct dominant senses, there
  // is one card per SENSE, the `term` names the sense in parentheses, and the
  // `example` is written so it could not be reworded into the other sense.
  // `take in`, `go off` and `break down` each get two; `work out` gets three.
  // That is how the published frequency lists present them (PHaVE 2015:
  // 150 phrasal verbs carrying 280 dominant senses), and it is the failure a C1
  // learner actually still has — she knows the verb and picks the wrong sense.
  //
  // Nothing here repeats the eighteen phrases, the eight cards above, the five
  // grammar questions or the briefing. The eight original ids are UNTOUCHED:
  // `vocab` is a scheduled kind, so each is a live key in learner data.
  "native/phrasal-verbs": [
    {
      id: "take-after",
      term: "take after someone",
      es: "parecerse a alguien (de familia)",
      example: "She takes after her grandmother — same laugh, same temper.",
    },
    {
      id: "pick-up-on",
      term: "pick up on something",
      es: "captar algo, darse cuenta de algo",
      example: "He picked up on the fact that nobody had said yes.",
    },
    {
      id: "wear-off",
      term: "wear off",
      es: "pasarse el efecto de algo",
      example: "The novelty wore off after about a week.",
    },
    {
      id: "fall-through",
      term: "fall through",
      es: "venirse abajo (un plan)",
      example: "The whole trip fell through when the flights doubled in price.",
    },
    {
      id: "put-someone-up",
      term: "put someone up",
      es: "alojar a alguien",
      example: "They put me up for three nights and wouldn't take any money.",
    },
    {
      id: "talk-someone-into",
      term: "talk someone into something",
      es: "convencer a alguien de hacer algo",
      example: "She talked me into running it with her, and I'm still tired.",
    },
    {
      id: "run-something-by",
      term: "run something by someone",
      es: "consultar algo con alguien",
      example: "Let me run it by my manager before I promise anything.",
    },
    {
      id: "catch-on",
      term: "catch on",
      es: "cuajar, ponerse de moda",
      example: "The word caught on quickly, and now everybody says it.",
    },
    {
      id: "come-across-find",
      term: "come across something (find it by chance)",
      // Deliberately NOT "encontrarse algo por casualidad": `es` is the FRONT of
      // the recall card, and social/small-talk's `run-into` card already fronts
      // "encontrarse por casualidad". Two near-identical fronts expecting
      // different answers is a defect the byte-identity harness cannot see.
      es: "dar con algo sin ir buscándolo",
      example: "I came across an old photo of the two of them at the back of a drawer.",
    },
    {
      id: "hold-up-delay",
      term: "hold something up (delay it)",
      es: "retrasar algo, dejarlo parado",
      example: "The whole move was held up by one missing signature.",
    },
    {
      id: "go-off-alarm",
      term: "go off (an alarm, a bomb)",
      es: "sonar de golpe, estallar",
      example: "The fire alarm went off during the exam and nobody moved.",
    },
    {
      id: "go-off-food",
      term: "go off (food that has spoiled)",
      es: "echarse a perder, ponerse malo un alimento",
      example: "The milk has gone off, so it's black tea or nothing.",
    },
    {
      id: "take-in-absorb",
      term: "take something in (absorb what you are told)",
      es: "asimilar información",
      example: "There was too much in that briefing to take in at one sitting.",
    },
    {
      id: "take-up-hobby",
      term: "take something up (start doing it regularly)",
      es: "aficionarse a algo, empezar a practicarlo",
      example: "He has taken up running, which none of us saw coming.",
    },
    {
      id: "work-out-calculate",
      term: "work something out (calculate it, puzzle it out)",
      es: "calcular algo, deducir algo",
      example: "It took me most of the meeting to work out who actually decided things.",
    },
    {
      id: "work-out-turn-out-well",
      term: "work out (end up fine in the end)",
      es: "salir bien, acabar arreglándose",
      example: "Stop rehearsing the disaster — these things usually work out.",
    },
    {
      id: "work-out-exercise",
      term: "work out (train at a gym)",
      es: "entrenar, hacer ejercicio",
      example: "He works out before work, which explains the alarm at five.",
    },
    {
      id: "set-up-arrange",
      term: "set something up (arrange or organise it)",
      es: "organizar algo, montarlo",
      example: "I've set up a call with them for Thursday afternoon.",
    },
    {
      id: "set-off-journey",
      term: "set off (start a journey)",
      es: "ponerse en camino, salir de viaje",
      example: "We set off at six to get ahead of the traffic on the ring road.",
    },
    {
      id: "break-down-machine",
      term: "break down (a machine stops working)",
      es: "averiarse, estropearse",
      example: "The car broke down twenty minutes short of the ferry.",
    },
    {
      id: "break-down-person",
      term: "break down (a person loses their composure)",
      es: "derrumbarse, romper a llorar",
      example: "He broke down halfway through the speech and everybody waited.",
    },
    {
      id: "take-in-deceive",
      term: "take somebody in (fool them completely)",
      es: "engañar a alguien, colárselo",
      example: "Don't be taken in by the first quote — ask two more firms.",
    },
    {
      id: "sort-out-fix",
      term: "sort something out (fix or settle a problem)",
      es: "arreglar un asunto, solucionar un lío",
      example: "We can't ship anything until somebody sorts out the licence.",
    },
    {
      id: "turn-out-transpire",
      term: "turn out (prove to be the case in the end)",
      es: "resultar que, acabar siendo",
      example: "It turned out we had been in the same class for a year.",
    },
  ],

  // B2. The existing phrases here are TONGUE-TWISTERS — a legitimate shape for
  // this scenario and a poor model for anything else, so it is deliberately not
  // spread. The deck is the metalanguage instead: the words she needs to say
  // what her mouth is doing wrong and to be told how to fix it.
  "native/pronunciation": [
    {
      id: "word-stress",
      term: "word stress",
      es: "el acento tónico de una palabra",
      example: "The word stress is on the second syllable: com-FOR-table.",
    },
    {
      id: "silent-letter",
      term: "a silent letter",
      es: "una letra muda",
      example: "The 'b' in 'doubt' is a silent letter — don't say it.",
    },
    {
      id: "homophone",
      term: "a homophone",
      es: "un homófono",
      example: "'Their' and 'there' are homophones: same sound, different word.",
    },
    {
      id: "enunciate",
      term: "enunciate",
      es: "vocalizar, pronunciar con claridad",
      example: "Slow down and enunciate — the endings are disappearing.",
    },
    {
      id: "mumble",
      term: "mumble",
      es: "hablar entre dientes",
      example: "I mumble when I'm nervous, so nobody catches my name.",
    },
    {
      id: "intonation",
      term: "intonation",
      es: "la entonación",
      example: "Your intonation fell, so it sounded like an order, not a question.",
    },
    {
      id: "tongue-twister",
      term: "a tongue-twister",
      es: "un trabalenguas",
      example: "It's a tongue-twister, and saying it slowly is the whole exercise.",
    },
    {
      id: "rhyme-with",
      term: "rhyme with",
      es: "rimar con",
      example: "'Tough' rhymes with 'stuff', not with 'though'.",
    },
  ],

  // C1. The plan asks for the MARKERS that signal which register she is in —
  // the things a listener reads the dial from — rather than more example
  // sentences, which the contrasting phrase pairs already supply.
  "native/register": [
    {
      id: "contraction",
      term: "a contraction",
      es: "una contracción (I'm, don't)",
      example: "Take the contractions out and the email immediately sounds colder.",
    },
    {
      id: "slang",
      term: "slang",
      es: "la jerga coloquial",
      example: "It's slang, so it's fine in a text and wrong in a covering letter.",
    },
    {
      id: "jargon",
      term: "jargon",
      es: "el argot técnico de un oficio",
      example: "Cut the jargon — half the room doesn't work in engineering.",
    },
    {
      id: "hedge",
      term: "a hedge (sort of, kind of)",
      es: "una fórmula para no comprometerse",
      example: "Three hedges in one sentence and nobody knows what you decided.",
    },
    {
      id: "blunt",
      term: "blunt",
      es: "directo hasta resultar brusco",
      example: "That reads as blunt in English, even though it's normal in Spanish.",
    },
    {
      id: "stilted",
      term: "stilted",
      es: "rígido, forzado",
      example: "'I should be most grateful' sounds stilted in a message to a friend.",
    },
    {
      id: "pleasantries",
      term: "pleasantries",
      es: "las cortesías de rigor",
      example: "Two lines of pleasantries first, then the request. That's the pattern.",
    },
    {
      id: "overfamiliar",
      term: "overfamiliar",
      es: "demasiado confianzudo",
      example: "Using her first name there would come across as overfamiliar.",
    },
  ],

  // C1. Not a list of references — those date within a year — but the words
  // for how a reference behaves, which do not.
  "native/culture": [
    {
      id: "catchphrase",
      term: "a catchphrase",
      es: "una frase icónica, una muletilla",
      example: "It's a catchphrase from a sitcom, and everyone over thirty knows it.",
    },
    {
      id: "household-name",
      term: "a household name",
      es: "un nombre que conoce todo el mundo",
      example: "She's a household name here and completely unknown abroad.",
    },
    {
      id: "in-joke",
      term: "an in-joke",
      es: "un chiste privado del grupo",
      example: "Don't worry, it's an in-joke — it isn't funny to anyone else either.",
    },
    {
      id: "name-drop",
      term: "name-drop",
      es: "soltar nombres para presumir",
      example: "He name-dropped three directors before the starters arrived.",
    },
    {
      id: "mainstream",
      term: "mainstream",
      es: "mayoritario, comercial",
      example: "The band went mainstream, and their first fans have not forgiven them.",
    },
    {
      id: "niche",
      term: "niche",
      es: "de nicho, para unos pocos",
      example: "It's a niche reference, so half the table will just blink at you.",
    },
    {
      id: "dated",
      term: "dated",
      es: "desfasado, que ha envejecido mal",
      example: "That expression sounds dated now — my parents say it, I don't.",
    },
    {
      id: "go-viral",
      term: "go viral",
      es: "hacerse viral",
      example: "The clip went viral, and now it's a reference in its own right.",
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
