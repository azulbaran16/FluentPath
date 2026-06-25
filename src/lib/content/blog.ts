// SEO blog posts aimed at Spanish-speaking English learners — they target the
// kinds of queries that audience actually searches in Google. Spanish framing,
// English examples. Each post links back into the app.

export interface BlogSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  tags: string[];
  intro: string;
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "errores-comunes-de-ingles-hispanohablantes",
    title: "10 errores comunes de inglés en hispanohablantes (y cómo corregirlos)",
    description:
      "Los 10 errores de inglés más típicos de los hispanohablantes — falsos amigos, preposiciones, el verbo 'to be' — con ejemplos y la forma correcta de decirlo.",
    date: "2026-06-24",
    minutes: 7,
    tags: ["errores comunes", "gramática", "vocabulario"],
    intro:
      "Si tu idioma materno es el español, cometes errores muy predecibles en inglés — y eso es una buena noticia: significa que se pueden corregir rápido. Aquí están los 10 más frecuentes con la versión correcta.",
    sections: [
      {
        heading: "1. Confundir 'to be' con 'to have' para la edad",
        paragraphs: [
          "En español 'tienes' años; en inglés 'eres' años.",
        ],
        bullets: ["❌ I have 25 years.", "✅ I am 25 (years old)."],
      },
      {
        heading: "2. Falsos amigos: 'actually', 'assist', 'realize'",
        paragraphs: ["Se parecen al español pero significan otra cosa."],
        bullets: [
          "actually = en realidad (no 'actualmente' → currently)",
          "to assist = ayudar (no 'asistir a' → to attend)",
          "to realize = darse cuenta (no 'realizar' → to carry out)",
        ],
      },
      {
        heading: "3. Olvidar la -s de la tercera persona",
        bullets: ["❌ He work in a bank.", "✅ He works in a bank."],
      },
      {
        heading: "4. Usar 'people' en singular",
        paragraphs: ["'People' ya es plural."],
        bullets: ["❌ People is friendly.", "✅ People are friendly."],
      },
      {
        heading: "5. Preposiciones: in / on / at",
        bullets: [
          "at + hora: at 7 o'clock",
          "on + día: on Monday",
          "in + mes/año: in June, in 2026",
        ],
      },
      {
        heading: "6. 'Make' vs 'do'",
        bullets: ["make a decision, make a mistake", "do homework, do exercise"],
      },
      {
        heading: "7. Doble negación",
        bullets: ["❌ I don't know nothing.", "✅ I don't know anything."],
      },
      {
        heading: "8. Pronunciar la 'h' muda o comerse la del inicio",
        paragraphs: [
          "La 'h' de 'hour' es muda, pero la de 'house' sí suena. Practícalo en voz alta.",
        ],
      },
      {
        heading: "9. Traducir 'desde hace' literalmente",
        bullets: ["❌ I live here since 3 years.", "✅ I've lived here for 3 years."],
      },
      {
        heading: "10. Decir 'how is it called' en vez de 'what'",
        bullets: ["❌ How is it called?", "✅ What's it called?"],
      },
    ],
  },
  {
    slug: "como-responder-entrevista-de-trabajo-en-ingles",
    title: "Cómo responder una entrevista de trabajo en inglés: frases clave",
    description:
      "Frases listas para una entrevista de trabajo en inglés: cómo hablar de ti, responder 'tell me about yourself', tus fortalezas y debilidades, y hacer buenas preguntas.",
    date: "2026-06-24",
    minutes: 6,
    tags: ["trabajo", "speaking", "entrevistas"],
    intro:
      "Una entrevista en inglés se gana con preparación: las preguntas son casi siempre las mismas. Memoriza estas frases y adáptalas a tu historia.",
    sections: [
      {
        heading: "‘Tell me about yourself’",
        paragraphs: ["No cuentes tu vida: 30–60 segundos de presente, pasado y futuro."],
        bullets: [
          "I'm a [role] with [X] years of experience in…",
          "Most recently, I worked at… where I…",
          "I'm now looking for…",
        ],
      },
      {
        heading: "Tus fortalezas",
        bullets: [
          "One of my strengths is…",
          "I'm particularly good at…",
          "People often say I'm reliable / a fast learner.",
        ],
      },
      {
        heading: "Tu mayor debilidad",
        paragraphs: ["Elige algo real y di cómo lo trabajas."],
        bullets: ["I used to struggle with… but I've learned to…"],
      },
      {
        heading: "Preguntas que TÚ haces al final",
        bullets: [
          "What does a typical day look like in this role?",
          "What would success look like in the first 3 months?",
          "What are the next steps?",
        ],
      },
      {
        heading: "Cierre",
        bullets: ["Thank you for your time — I'm very excited about this opportunity."],
      },
    ],
  },
  {
    slug: "50-frases-en-ingles-para-viajar",
    title: "50 frases en inglés para viajar sin estrés",
    description:
      "Las frases en inglés que de verdad necesitas para viajar: aeropuerto, hotel, restaurante, pedir indicaciones y emergencias. Cortas, claras y fáciles de recordar.",
    date: "2026-06-24",
    minutes: 5,
    tags: ["viajes", "frases", "speaking"],
    intro:
      "No necesitas inglés perfecto para viajar — necesitas las frases correctas. Aquí tienes las esenciales, agrupadas por situación.",
    sections: [
      {
        heading: "En el aeropuerto",
        bullets: [
          "Where is the check-in for [airline]?",
          "Is the flight on time?",
          "Which gate is it?",
          "I'd like a window/aisle seat, please.",
        ],
      },
      {
        heading: "En el hotel",
        bullets: [
          "I have a reservation under [name].",
          "What time is checkout?",
          "Could I get an extra towel?",
          "The AC isn't working.",
        ],
      },
      {
        heading: "En el restaurante",
        bullets: [
          "A table for two, please.",
          "What do you recommend?",
          "I'm allergic to…",
          "Could we have the bill, please?",
        ],
      },
      {
        heading: "Pidiendo indicaciones",
        bullets: [
          "Excuse me, how do I get to…?",
          "Is it far from here?",
          "Could you show me on the map?",
        ],
      },
      {
        heading: "Emergencias",
        bullets: [
          "Can you help me, please?",
          "I've lost my passport.",
          "I need a doctor.",
          "Call the police, please.",
        ],
      },
    ],
  },
  {
    slug: "present-perfect-vs-past-simple",
    title: "Present perfect vs past simple: guía para hispanohablantes",
    description:
      "La diferencia entre present perfect y past simple explicada para hispanohablantes, con la regla del 'tiempo terminado', ejemplos y errores típicos.",
    date: "2026-06-24",
    minutes: 6,
    tags: ["gramática", "tiempos verbales"],
    intro:
      "Es uno de los temas que más cuesta en español, porque a veces traducimos los dos con el pretérito. La clave está en si el tiempo ya terminó o no.",
    sections: [
      {
        heading: "La regla de oro",
        paragraphs: [
          "Past simple = momento terminado y específico en el pasado. Present perfect = el pasado conecta con el presente, o el tiempo todavía no termina.",
        ],
        bullets: [
          "I saw her yesterday. (yesterday = terminado → past simple)",
          "I've seen her today. (today = aún no termina → present perfect)",
        ],
      },
      {
        heading: "Palabras que avisan past simple",
        bullets: ["yesterday, last week, in 2019, two days ago, when I was a child"],
      },
      {
        heading: "Palabras que avisan present perfect",
        bullets: ["already, yet, just, ever, never, since, for, so far, today"],
      },
      {
        heading: "for vs since",
        bullets: [
          "for + duración: for two years",
          "since + punto de inicio: since 2019",
        ],
      },
      {
        heading: "Errores típicos",
        bullets: [
          "❌ I have seen her yesterday. ✅ I saw her yesterday.",
          "❌ I live here since 2019. ✅ I've lived here since 2019.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
