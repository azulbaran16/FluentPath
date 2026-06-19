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
