# CELPIP Exam Prep — Writing v1 (Design)

**Fecha:** 2026-07-23 · **Estado:** aprobado por el usuario (brainstorming Superpowers)
**Origen:** material de estudio CELPIP aportado por la hermana del usuario (candidata a residencia en Canadá). El material es de terceros (academia "IELTS&PTEwithViv" + PDFs oficiales CELPIP): se usa SOLO como referencia de formato y estrategia. Todo el contenido de la app es original. El zip no se committea.

## Decisiones

- **Audiencia:** feature del producto para todos los usuarios; la hermana del usuario es la primera usuaria beta.
- **Alcance v1:** solo Writing — Task 1 (email formal) y Task 2 (respuesta a encuesta/opinión). Speaking/Reading/Listening quedan como pestañas "próximamente".
- **Feedback v1:** autoevaluación (sin IA). Respuesta modelo + checklist de descriptores. El feedback con IA llega con la fase del tutor (Fase 4 del roadmap) como feature Pro.
- **Prioridad:** nueva fase inicial del roadmap GSD (la hermana tiene fecha de examen); el resto del milestone se corre.
- **Monetización:** todo el modo autoevaluación es gratis, coherente con la decisión registrada 2026-06-19 "free features first, paid AI tutor last".

## Arquitectura

### Datos — `src/lib/celpip.ts`
Mismo patrón que `curriculum.ts`: datos tipados, fuente única de verdad.

- `CelpipWritingTask`: `id`, `taskType` (`email` | `survey`), `title`, `scenario` (contexto), `bullets` (T1: 3 puntos a cubrir) o `options` (T2: opción A/B), `timeLimitMinutes` (27 T1 / 26 T2), `wordRange` ({min:150, max:200}), `modelAnswer` (original), `strategyTips` (plantilla de email, estructura intro/2 bodies/conclusión, conectores — todo reescrito).
- Banco v1: ~8 tareas Task 1 + ~8 tareas Task 2, originales, temática canadiense cotidiana (trabajo, vivienda, servicios, comunidad) siguiendo el formato del examen.
- `CelpipRubric`: checklist de autoevaluación por dimensión, derivado de los descriptores CELPIP (información factual): cumplimiento de la tarea (bullets cubiertos, tono, saludo/cierre), organización (párrafos, conectores), vocabulario (precisión, no repetir el enunciado), gramática y formato (variedad de oraciones, longitud). Ítems marcables sí/no con explicación corta.

### Rutas — App Router
- `/celpip` — landing: qué es CELPIP, tarjetas de Task 1 y Task 2 con lista de tareas y estado (intentos/completadas), pestañas deshabilitadas para Speaking/Reading/Listening.
- `/celpip/writing/[taskId]` — simulador: enunciado + bullets/opciones, temporizador de examen (cuenta atrás, pausable en modo práctica; aviso al agotarse — no borra el texto), contador de palabras con indicador del rango 150–200, editor `textarea` plano (fiel al examen: sin corrector rico). Botón enviar → pantalla de resultados.
- Resultados (misma ruta, estado post-envío): texto del usuario junto a la respuesta modelo, checklist interactivo de la rúbrica, métricas del intento (tiempo usado, palabras). Botones: reintentar, siguiente tarea, volver.

### Progreso — patrón `progress.ts`
- Namespace propio en localStorage (`fluentpath.celpip.v1`): intentos por tarea (`taskId`, fecha, duración, wordCount, texto, checklist marcado), derivado `completedTasks`.
- Local-first igual que el resto; migra a Postgres cuando se ejecute la fase "Server-Side Progress" (el shape se diseña serializable para esa migración).

### UI
Design system "Traveler's Journal" existente (Fraunces + Hanken Grotesk, tokens de `globals.css`). Sin librerías nuevas. Responsive (el simulador debe ser usable en móvil, aunque el examen real es en desktop — aviso sutil recomendando desktop).

## Manejo de errores
- Autosave del borrador en localStorage cada pocos segundos (perder un writing de 25 min es inaceptable).
- Si el timer expira: se bloquea el editor y se ofrece enviar tal cual (como el examen real) o seguir en "modo libre" marcado como fuera de tiempo.
- JSON corrupto en localStorage: mismo tratamiento defensivo que adopte la fase de progreso (parse seguro, fallback a vacío).

## Testing
- Unit: rúbrica y helpers de progreso CELPIP (serialización, derivados).
- Componente: timer (expiración, pausa), word counter (límites), flujo enviar→resultados.
- Manual/UAT: la hermana del usuario completa 1 tarea de cada tipo end-to-end en producción.

## Fuera de alcance v1
Speaking/Reading/Listening (solo pestañas), feedback/scoring con IA, audio (STT/TTS), export PDF, contenido premium, banco >16 tareas.

## Notas de propiedad intelectual
- No se copia texto, ejercicios ni respuestas modelo del material de la academia.
- Los descriptores CELPIP se usan como referencia factual para redactar el checklist con palabras propias; no se reproducen los PDFs.
- `Celpip.zip` permanece fuera del repositorio (añadir a `.gitignore`).
