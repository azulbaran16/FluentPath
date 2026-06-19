# FluentPath — Design & Work Plan

> App web para aprender inglés a nivel nativo: interactiva, fácil de usar,
> que cubre todos los escenarios de la vida real con un tutor de IA.

**Decisiones base:** App web · usuario nivel B1-B2 · tutor de IA conversacional.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind v4 |
| Tutor IA | Claude API (claude-opus-4-8 / claude-sonnet-4-6) — vía `/api/tutor` |
| Voz | Web Speech API (navegador) → TTS/STT premium después |
| Progreso | `localStorage` (Fase 1) → Supabase/SQLite (Fase 5) |
| Hosting | Vercel |

## Diseño

Dirección visual: **"Diario de viajero"** — papel cálido manila, tinta profunda,
acento bermellón + teal/dorado. Tipografía Fraunces (display) + Hanken Grotesk (body).
Tokens en `src/app/globals.css`.

## Los 6 mundos (cobertura total)

1. **Social & Everyday Life** — small talk, amigos, citas, fiestas, quejas, favores, humor.
2. **Work & Professional** — entrevistas, reuniones, emails, presentaciones, negociar, networking, feedback.
3. **Travel & Errands** — aeropuerto, hotel, restaurante, direcciones, emergencias, compras.
4. **Reading & Ideas** — noticias, artículos, cuentos, resúmenes, debate.
5. **Practical Life** — llamadas, soporte técnico, vivienda, banco, citas.
6. **Sounding Native** — idioms, phrasal verbs, pronunciación, registro, cultura.

Fuente de verdad: `src/lib/curriculum.ts`.

## 4 habilidades

- **Grammar** — corregida en contexto.
- **Speaking** — role-play por voz + feedback.
- **Reading** — textos graduados.
- **Writing** — emails/mensajes reales corregidos.

## Fases

| Fase | Entrega | Estado |
|------|---------|--------|
| **F1 — Cimientos** | Proyecto, diseño, navegación, dashboard, currículo, chat UI stub | ✅ Hecho |
| **Iconos** | Reemplazo de emojis por iconos lucide-react | ✅ Hecho |
| **F3 — Speaking por voz** | PronunciationLab con Web Speech (STT/TTS), scoring, integrado en escenarios | ✅ Hecho (sin API) |
| **F4 — Reading + contenido** | ReadingRoom (textos graduados + comprensión + glosario), GrammarQuiz, WritingDesk | ✅ Hecho (sin API) |
| **F5 — Motor + progreso** | Test de nivel, SRS, racha por días, dashboard con datos vivos | ✅ Hecho (sin API) |
| **F2 — Tutor de chat** | Conectar Claude API real en `/api/tutor`, system prompt de tutor, corrección | ⏳ Último — necesita API key |
| **F6 — Nivel nativo** | Más contenido, voz premium, DB en la nube | Pendiente |

## Motor de progreso (Fase 5, hecho)

- `lib/progress.ts` v2: completado, XP total y por habilidad, racha por días reales, nivel CEFR, y mapa SRS (Leitner) — todo en localStorage tras el mismo hook.
- **Placement test**: `components/practice/DiagnosticTest.tsx` + `lib/content/diagnostic.ts` → estima A2/B1/B2/C1 y lo guarda. Ruta `/diagnostic`.
- **Repaso (SRS)**: `components/practice/ReviewView.tsx`, ruta `/review`. Lo fallado vence hoy; lo acertado se aleja en el tiempo (1,3,7,16,30 días). `GrammarQuiz` alimenta la cola.
- Dashboard: nivel, repasos pendientes, barras de progreso por habilidad, CTAs a test y repaso.

> Decisión del usuario (2026-06-19): construir todo lo gratuito primero; el tutor de IA (de pago) va al final, tras comprobar que la app es funcional.

## Práctica funcional sin API (hecha)

- **Speaking** — `components/practice/PronunciationLab.tsx`: Web Speech API (TTS + reconocimiento), puntúa palabra por palabra. Tipos en `lib/speech.d.ts`.
- **Grammar** — `components/practice/GrammarQuiz.tsx` + banco en `lib/content/grammar.ts`.
- **Reading** — `components/practice/ReadingRoom.tsx` + textos en `lib/content/reading.ts`.
- **Writing** — `components/practice/WritingDesk.tsx` (borrador en localStorage, respuesta modelo) + `lib/content/writing.ts`.
- Frases por escenario: `lib/content/phrases.ts`. Cada `/skill/*` y cada escenario ya tienen práctica real.
- Nota: el reconocimiento de voz requiere Chrome/Edge de escritorio.

## Estructura del código (F1)

```
src/
  app/
    page.tsx                      Dashboard
    tutor/page.tsx                Chat con tutor IA
    world/[slug]/page.tsx         Mundo → lista de escenarios
    world/[slug]/[scenario]/      Pantalla de práctica
    skill/[skill]/page.tsx        Escenarios por habilidad
    api/tutor/route.ts            Endpoint del tutor (stub hasta F2)
  components/                     AppShell, Sidebar, Dashboard, WorldView, etc.
  lib/
    curriculum.ts                 Los 6 mundos + escenarios (fuente de verdad)
    progress.ts                   Hook de progreso (localStorage)
```

## Cómo correr

```bash
npm run dev      # http://localhost:3000
npm run build    # build de producción
```

Para activar el tutor real (F2): crear `.env.local` con `ANTHROPIC_API_KEY=...`.
