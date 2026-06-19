// Speaking warm-up phrases per scenario, used by PronunciationLab.
// Keyed by `${worldSlug}/${scenarioSlug}`. Scenarios without a curated
// set fall back to a per-world generic set so every scenario works.

export interface Phrase {
  text: string;
  es: string;
  /** quick pronunciation/usage tip */
  tip?: string;
}

const SETS: Record<string, Phrase[]> = {
  "social/small-talk": [
    { text: "How's it going?", es: "¿Cómo te va?", tip: "Suena como 'hows-it-going', todo unido." },
    { text: "What do you do for a living?", es: "¿A qué te dedicas?" },
    { text: "I've heard so much about you.", es: "He oído mucho sobre ti." },
    { text: "It's been a while, hasn't it?", es: "Ha pasado un tiempo, ¿no?" },
    { text: "Anyway, it was great catching up.", es: "En fin, qué bueno ponernos al día." },
  ],
  "social/making-friends": [
    { text: "We should hang out sometime.", es: "Deberíamos salir algún día." },
    { text: "Do you want to grab a coffee?", es: "¿Quieres tomar un café?" },
    { text: "What are you into?", es: "¿Qué te gusta hacer?" },
    { text: "Let me give you my number.", es: "Déjame darte mi número." },
  ],
  "work/interviews": [
    { text: "Thanks for having me.", es: "Gracias por recibirme." },
    { text: "I'd describe myself as detail-oriented.", es: "Me describiría como detallista." },
    { text: "Could you tell me more about the role?", es: "¿Podría contarme más sobre el puesto?" },
    { text: "I'm really excited about this opportunity.", es: "Estoy muy entusiasmado con esta oportunidad." },
    { text: "When can I expect to hear back?", es: "¿Cuándo tendré noticias?" },
  ],
  "work/meetings": [
    { text: "Can I jump in here?", es: "¿Puedo intervenir aquí?" },
    { text: "Just to build on that point...", es: "Solo para ampliar ese punto..." },
    { text: "Let's circle back to this later.", es: "Volvamos a esto más tarde." },
    { text: "So, to sum up...", es: "Entonces, para resumir..." },
  ],
  "travel/airport": [
    { text: "I'd like a window seat, please.", es: "Quisiera un asiento de ventana, por favor." },
    { text: "Is the flight on time?", es: "¿El vuelo va a tiempo?" },
    { text: "Where's the baggage claim?", es: "¿Dónde está la recogida de equipaje?" },
    { text: "I think I missed my connection.", es: "Creo que perdí mi conexión." },
  ],
  "travel/restaurant": [
    { text: "Could we see the menu, please?", es: "¿Podríamos ver el menú, por favor?" },
    { text: "What do you recommend?", es: "¿Qué recomienda?" },
    { text: "I'll have the same, please.", es: "Yo quiero lo mismo, por favor." },
    { text: "Could we get the check?", es: "¿Nos trae la cuenta?" },
  ],
  "travel/directions": [
    { text: "Excuse me, how do I get to the station?", es: "Disculpe, ¿cómo llego a la estación?" },
    { text: "Is it within walking distance?", es: "¿Se puede ir caminando?" },
    { text: "Take the second left.", es: "Gire en la segunda a la izquierda." },
  ],
  "native/idioms": [
    { text: "It's a piece of cake.", es: "Es pan comido.", tip: "Idiom: algo muy fácil." },
    { text: "Let's call it a day.", es: "Dejémoslo por hoy." },
    { text: "I'm under the weather.", es: "No me siento bien." },
    { text: "Break a leg!", es: "¡Mucha suerte!" },
  ],
  "native/pronunciation": [
    { text: "She sells seashells by the seashore.", es: "(trabalenguas de la 's/sh')", tip: "Distingue /s/ de /ʃ/." },
    { text: "The thirty-three thieves thought they thrilled the throne.", es: "(la 'th')", tip: "Saca la lengua para la /θ/." },
    { text: "Red lorry, yellow lorry.", es: "(la 'r' y la 'l')" },
  ],
};

const WORLD_FALLBACK: Record<string, Phrase[]> = {
  social: [
    { text: "Nice to meet you.", es: "Encantado de conocerte." },
    { text: "How have you been?", es: "¿Cómo has estado?" },
    { text: "Let's keep in touch.", es: "Mantengámonos en contacto." },
  ],
  work: [
    { text: "Let me get back to you on that.", es: "Te respondo sobre eso más tarde." },
    { text: "That works for me.", es: "Me viene bien." },
    { text: "I'll follow up by email.", es: "Te escribo por correo para dar seguimiento." },
  ],
  travel: [
    { text: "Could you help me, please?", es: "¿Podría ayudarme, por favor?" },
    { text: "How much is it?", es: "¿Cuánto cuesta?" },
    { text: "Where's the nearest one?", es: "¿Dónde está el más cercano?" },
  ],
  academic: [
    { text: "What's the main idea here?", es: "¿Cuál es la idea principal aquí?" },
    { text: "In other words...", es: "En otras palabras..." },
    { text: "That raises an interesting point.", es: "Eso plantea un punto interesante." },
  ],
  practical: [
    { text: "I'd like to report a problem.", es: "Quisiera reportar un problema." },
    { text: "Could you put me through to support?", es: "¿Me pasa con soporte?" },
    { text: "Let me check and get back to you.", es: "Déjeme revisar y le aviso." },
  ],
  native: [
    { text: "To be honest with you...", es: "Para serte sincero..." },
    { text: "It kind of depends.", es: "Más o menos depende." },
    { text: "That makes total sense.", es: "Eso tiene todo el sentido." },
  ],
};

export function getPhrases(worldSlug: string, scenarioSlug: string): Phrase[] {
  return (
    SETS[`${worldSlug}/${scenarioSlug}`] ??
    WORLD_FALLBACK[worldSlug] ??
    WORLD_FALLBACK.social
  );
}

// ── Speaking packs (for the Speaking skill page) ──────────────
export type SpeakingLevel = "A2" | "B1" | "B2" | "C1";

export interface SpeakingPack {
  id: string;
  title: string;
  level: SpeakingLevel;
  blurb: string;
  phrases: Phrase[];
}

const TONGUE_TWISTERS: Phrase[] = [
  { text: "She sells seashells by the seashore.", es: "(trabalenguas /s/ vs /ʃ/)", tip: "Distingue 's' de 'sh'." },
  { text: "Red lorry, yellow lorry.", es: "(la 'r' y la 'l')", tip: "No las mezcles." },
  { text: "The thirty-three thieves thought they thrilled the throne.", es: "(la 'th')", tip: "Saca la lengua para /θ/." },
  { text: "I scream, you scream, we all scream for ice cream.", es: "(ritmo y enlace)", tip: "Enlaza las palabras." },
  { text: "Could you, would you, should you?", es: "(modales débiles)", tip: "Pronuncia 'd' suave." },
];

export const SPEAKING_PACKS: SpeakingPack[] = [
  {
    id: "greetings",
    title: "Greetings & small talk",
    level: "B1",
    blurb: "Break the ice and keep a casual chat going.",
    phrases: [
      ...getPhrases("social", "small-talk"),
      ...getPhrases("social", "making-friends"),
    ],
  },
  {
    id: "travel",
    title: "Travel essentials",
    level: "A2",
    blurb: "Airport, restaurant and getting around.",
    phrases: [
      ...getPhrases("travel", "airport"),
      ...getPhrases("travel", "restaurant"),
      ...getPhrases("travel", "directions"),
    ],
  },
  {
    id: "work",
    title: "At work",
    level: "B2",
    blurb: "Interviews and meetings, said with confidence.",
    phrases: [
      ...getPhrases("work", "interviews"),
      ...getPhrases("work", "meetings"),
    ],
  },
  {
    id: "sounds",
    title: "Tricky sounds",
    level: "B2",
    blurb: "Drills for the sounds Spanish speakers find hardest.",
    phrases: [...getPhrases("native", "pronunciation"), ...TONGUE_TWISTERS],
  },
  {
    id: "idioms",
    title: "Idioms",
    level: "C1",
    blurb: "Everyday expressions that make you sound native.",
    phrases: getPhrases("native", "idioms"),
  },
];

// "Learn" step for speaking: pronunciation & fluency tips.
export interface SpeakingTip {
  id: string;
  title: string;
  points: string[];
}

export const SPEAKING_TIPS: SpeakingTip[] = [
  {
    id: "th",
    title: "The 'th' sound (think / this)",
    points: [
      "Put your tongue lightly between your teeth — don't say 's' or 'd'.",
      "Voiceless /θ/: think, three, mouth.",
      "Voiced /ð/: this, the, mother.",
    ],
  },
  {
    id: "connected-speech",
    title: "Connected speech",
    points: [
      "Natives link words: 'What are you' → 'whaddaya'.",
      "Final consonant joins the next vowel: 'an apple' → 'a-napple'.",
      "Don't pronounce every word separately — let them flow.",
    ],
  },
  {
    id: "word-stress",
    title: "Word & sentence stress",
    points: [
      "Stress the right syllable: PHOtograph vs phoTOgrapher.",
      "Content words (nouns, verbs) are stressed; small words are weak.",
      "Wrong stress is the #1 reason natives misunderstand learners.",
    ],
  },
  {
    id: "intonation",
    title: "Intonation",
    points: [
      "Voice usually rises on yes/no questions, falls on statements and wh-questions.",
      "Flat intonation can sound bored or rude — let it move.",
      "Copy and imitate: listen, then repeat the melody, not just the words.",
    ],
  },
];
