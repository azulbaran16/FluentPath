// The VOLUME tier's vocabulary bank — the most frequent words of English,
// walked down the New General Service List from rank 1.
//
// ------------------------------------------------------------------
// THE ABSENT `tip` IS THE DESIGN, NOT AN OMISSION.
// ------------------------------------------------------------------
// A card here is `{ id, word, es, example }` and NOTHING else. There is no
// `tip` field, not even an optional one, and that is deliberate: this project's
// own rule is that an optional field is a field an author forgets, so the
// volume tier's lower quality bar is expressed by the TYPE HAVING NOWHERE TO
// PUT a register note rather than by a convention someone has to remember at
// card four hundred.
//
// So: a word that genuinely needs a register note — who says it, to whom, and
// what getting it wrong costs — does not belong in this file. It belongs in a
// scenario vocabulary bank (src/lib/content/scenario-vocabulary.ts), where the
// card gets a `tip`, a scenario around it, and a place in /review. The next
// author who reaches for `tip` here has found a scenario card, not a missing
// field. Widening this type is how the two tiers become one, and L4 exists to
// stop exactly that.
//
// ------------------------------------------------------------------
// THE ID LOOKS LIKE vocabulary.ts AND IS ITS OPPOSITE.
// ------------------------------------------------------------------
// The deck browser (src/lib/content/vocabulary.ts:35-40) builds card ids as
// `${deckId}:${i}` — from the card's ARRAY POSITION. Insert a card mid-deck
// there and every later card is renumbered, which orphans the learner's stored
// progress on all of them with no migration path and no way to detect it.
//
// Here the id is derived from the card's own CONTENT, by ONE slugifier in ONE
// place (`slug` below). A word does not move when a neighbour is inserted, and
// it cannot silently duplicate because plan 02 asserts no word repeats in the
// deck. So the rule is: INSERT FREELY, NEVER RENAME. Changing a card's `word`
// under a live id re-points a permanent Postgres key; the replacement for a bad
// card is always to retire its id and add a new one, exactly as AGENTS.md's
// one-way-door rule says, and scripts/verify-id-stability.mts makes it
// detectable by hashing the WHOLE record — so rewriting an `example` under a
// live id fails too.
//
// The stored key is NOT this `id`. This `id` is the SLUG; the key the learner's
// `srs` column holds is `vocab:${slug}`, composed by `coreVocabItemId` in
// src/lib/core-vocab-items.ts and spelled nowhere else in the app.
//
// ------------------------------------------------------------------
// ORDER AND PROVENANCE.
// ------------------------------------------------------------------
// The bank is ordered by NGSL rank, ASCENDING. Plan 02 asserts it, and the
// order is what gives the study bands on /core-vocabulary their meaning: band 1
// is the most frequent words in the language, not an arbitrary first fifty.
//
// Which words is answered by scripts/fixtures/ngsl-headwords.tsv (NGSL 1.2,
// CC BY-SA 4.0, Browne/Culligan/Phillips — full attribution in that file's
// header) and by nothing else. A word passed over is declared in
// core-vocabulary-skips.ts with a reason. The list contributes NO PROSE: every
// `es` and every `example` below is original, written for this project.
//
// No React, no hooks, no path aliases: the harness loads this under
// `node --experimental-strip-types`.
//
// ------------------------------------------------------------------
// 04.1-08 REWROTE 37 CARDS IN PLACE. THAT WAS A ONE-TIME EXCEPTION AND
// IT HAS EXPIRED. DO NOT CITE IT AS PRECEDENT.
// ------------------------------------------------------------------
// The phase gate's reader pass (04.1-07, task 3) found three defect classes no
// assertion can see. Every fix is normally a RETIREMENT plus a new slug, because
// an id is a one-way door. Plan 08 instead rewrote `es` and `example` under the
// live ids — a deliberate re-point of 37 hashes — and the authorisation was a
// measured fact rather than a judgement:
//
//     main is 27 commits ahead of origin/main   -> the deck is local only
//     curl -sI https://fluenthapp.com/core-vocabulary -> HTTP/1.1 404
//     git cat-file -e origin/main:<this file>   -> ABSENT from the remote
//
// THE DECK HAD NEVER SHIPPED. No learner held progress under any `vocab:` key,
// so the reason the one-way-door rule exists — a rename orphans LIVE progress
// with no migration path and no way to detect it — did not yet apply. The rule
// was not weakened; its precondition was absent, and that was proved three ways
// before a card was touched rather than assumed.
//
// **The exception expires on the first deploy, and this file cannot tell you
// whether that has happened.** Assume it has. The next author who wants to fix
// a gloss here retires the id and adds a new slug, exactly as AGENTS.md says,
// and `verify-id-stability.mts` will refuse anything else. Nothing below is a
// licence to run `--update` over a changed hash.
//
// The ID SET did not move at 04.1-09: 500 before, 500 after, zero additions,
// zero removals, zero retirements. Only hashes changed.
//
// AT 04.1-10 IT DID MOVE, ON PURPOSE AND ONCE. Three cards were RETIRED —
// `idea`, `large`, `maybe` — each with a hand-declared reason in the fixture
// written BEFORE `--update` ran, and each added to the skip register. They
// were the three the 04.1-09 pass reported as unfixable in place: a front
// nothing but a displaced gloss could satisfy, and two English words whose
// Spanish front was already held by a card in this same deck. A retired id
// never comes back.

export interface CoreVocabCard {
  /**
   * Authored slug, derived from `word` by `slug()` below and by nothing else.
   * It becomes part of a permanent spaced-repetition key — see
   * `coreVocabItemId` in src/lib/core-vocab-items.ts. Never renumbered, never
   * renamed.
   */
  id: string;
  /** the English headword, exactly as the NGSL spells it */
  word: string;
  /** Spanish gloss — a translation a learner would recognise, never the word */
  es: string;
  /** one sentence somebody would actually say, containing the word */
  example: string;
}

/**
 * The ONE slugifier. A card's id is a function of its `word` and of nothing
 * else — not of its position, not of its band, not of the order it was written
 * in — so inserting a card cannot disturb any other card's stored key.
 */
function slug(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** One card, one line. The helper exists so the bank reads as a word list. */
function card(word: string, es: string, example: string): CoreVocabCard {
  return { id: slug(word), word, es, example };
}

/**
 * The volume deck, in NGSL rank order.
 *
 * 497 cards — 500 authored through plan 04.1-06 and three retired at 04.1-10
 * — and THE DECK IS FINISHED — the tracer batch of
 * twenty (04.1-01, to rank 71), the first volume batch of 120 (04.1-03, to rank
 * 238), the second (04.1-04, to rank 378), the third (04.1-05, to rank 515) and
 * the fourth and last (04.1-06, to rank 648). They are real cards held to the
 * volume bar, not placeholders: every `es` is a natural Spanish gloss and never
 * the English word, and every `example` is a sentence somebody would say,
 * contains the word and runs at least six words.
 *
 * FIVE HUNDRED IS A CEILING DECISION, NOT A STOPPING POINT SOMEBODY GOT TIRED
 * AT. The learner's whole progress record is one JSON column behind a 1 MiB
 * route cap; the harness measures what this bank costs there and prints it on
 * every run, and 497 cards land near 30 % of that cap against a 40 % stop line.
 * Another 500 would not fit under the rule. Growing this bank is therefore a
 * fresh decision with the payload RE-MEASURED first — never an assumed
 * continuation, and never an extrapolation, which is what produced the wrong
 * per-id figure this phase had to correct twice.
 *
 * THE ARITHMETIC DOES NOT ADD UP BY FOUR, AND THAT IS THE POINT. 20 + 120 +
 * 120 + 121 + 120 = 501, and the bank holds 497: 04.1-05 removed one and
 * 04.1-10 removed three more. Taking the first, 04.1-05 REMOVED a card as
 * well as
 * adding 121: `color` (rank 378) shipped in 04.1-04 glossed "color / tono", and
 * Spanish for *color* is *color*. The gate asserts `es !== word`, so the card
 * satisfied the assertion by appending a near-synonym rather than by having a
 * distinct front — a fudge, recorded as one in that plan's summary. The user's
 * decision at 04.1-05 declared `cognate` as a skip reason; under the
 * one-way-door rule the card could not be EDITED, so `vocab:color` is declared
 * RETIRED in scripts/fixtures/scheduled-item-ids.json with a reason and the
 * word now sits in core-vocabulary-skips.ts. Any learner schedule on that key
 * is orphaned, permanently and deliberately.
 *
 * THE GLOSS IS THE FRONT OF THE CARD, and that is why near-synonyms carry
 * deliberately separated glosses rather than the first dictionary word. `tell`
 * is "contar / avisar" and not "decir", because `say` (rank 30) already holds
 * "decir" and two cards with the same front expecting different answers is a
 * usability defect, not a stylistic echo. The same reasoning separates
 * leave/let, meet/know, want/love, ask/question, work/job and start/begin.
 *
 * The examples' OPENINGS are varied on purpose. Plan 02 gates a frame-diversity
 * ceiling — no two-word opening shape above ~5 % of the deck and no single
 * opening word above ~20 % — because at five hundred cards nobody is going to
 * read them all, and five hundred sentences that all begin "I have a…" pass
 * every other check perfectly and are exactly what "flat" means.
 */
export const CORE_VOCABULARY: CoreVocabCard[] = [
  // rank 8
  card("have", "tener", "Do you have a minute before the meeting?"),
  // rank 30
  card("say", "decir", "She didn't say anything about the change."),
  // rank 31
  card("go", "ir", "We usually go swimming early on Saturday mornings."),
  // rank 41
  card("know", "saber (algo)", "Nobody seems to know where the keys are."),
  // rank 43
  card("get", "conseguir / obtener", "Where can I get a decent coffee around here?"),
  // rank 45
  card("like", "gustar", "My daughter likes cold weather more than I do."),
  // rank 47
  card("think", "pensar", "Let me think about it until tomorrow."),
  // rank 48
  card("make", "hacer", "Could you make a copy of this form?"),
  // rank 49
  // NARROWED at 04.1-08 from "tiempo / vez": the example teaches the
  // uncountable sense and only that, so the second half of the front was a
  // sense the card never showed. The parenthetical also does a second job —
  // bare "tiempo" is equally the front of *weather*, which this deck does not
  // card, so a learner could answer it correctly and still be wrong.
  card("time", "tiempo (que pasa)", "There isn't enough time to finish today."),
  // rank 50
  card("see", "ver", "From here you can see the whole valley."),
  // rank 56
  card("good", "bueno", "That was a really good film, actually."),
  // rank 57
  card("people", "gente / personas", "Too many people were waiting at the counter."),
  // rank 58
  card("year", "año", "Prices have gone up twice this year."),
  // rank 59
  card("take", "llevar (algo a algún sitio)", "Take these papers to the office upstairs."),
  // rank 61
  card("well", "bien", "She sings remarkably well for her age."),
  // rank 65
  card("come", "venir", "Come to the front desk when you're ready."),
  // rank 67
  card("work", "trabajo (empleo)", "His work starts at six in the morning."),
  // rank 68
  card("use", "usar", "Can I use your phone for a second?"),
  // rank 70
  card("now", "ahora", "Right now the office is completely empty."),
  // rank 71
  card("then", "luego (después)", "Finish the form, then hand it to reception."),

  // ---------------------------------------------------------------- //
  // 04.1-03 — the first volume batch. Ranks 75 to 238, 120 cards.     //
  // Every rank in between is either below or declared in              //
  // core-vocabulary-skips.ts, and the harness proves it.              //
  // ---------------------------------------------------------------- //

  // rank 75
  card("look", "mirar", "Everyone looked towards the door at once."),
  // rank 76
  card("want", "querer", "My brother wants a dog for his birthday."),
  // rank 77
  card("give", "dar", "Give the keys to whoever arrives first."),
  // rank 78
  card("first", "primero", "The first bus leaves at half past five."),
  // rank 79
  card("new", "nuevo", "Her new job starts on Monday morning."),
  // rank 80
  // NARROWED at 04.1-08 from "manera / camino": the example shows the manner
  // sense alone, so "camino" was a front the card never paid off.
  card("way", "manera", "There must be a better way to do this."),
  // rank 81
  card("find", "encontrar", "I cannot find my keys anywhere in this flat."),
  // rank 85
  card("day", "día", "Some days are harder than others at work."),
  // rank 87
  card("thing", "cosa", "One thing still bothers me about the plan."),
  // rank 90
  card("need", "necesitar", "We need two more chairs for the table."),
  // rank 92
  card("right", "acertado", "Your answer is right, but the spelling is not."),
  // rank 94
  // NARROWED at 04.1-08 from "espalda / de vuelta": the example is the body
  // part and nothing else. "espalda" also points at *back* and at no other
  // English word, which the two-part front did not.
  card("back", "espalda", "Grandma hurt her back lifting those heavy boxes."),
  // rank 95
  card("mean", "significar", "What does this word mean in Spanish?"),
  // rank 101
  card("last", "último", "The last train left ten minutes ago."),
  // rank 102
  card("child", "niño", "Every child in the class got a prize."),
  // rank 103
  card("tell", "avisar", "Tell me if the music is too loud."),
  // rank 105
  card("call", "llamar", "Somebody should call the landlord about the heating."),
  // rank 107
  card("company", "empresa", "His company moved to a smaller office downtown."),
  // rank 110
  card("show", "mostrar", "Show me the photos from your trip."),
  // rank 111
  card("life", "vida", "Life in a small town moves slowly."),
  // rank 112
  card("man", "hombre", "An older man was reading beside the fountain."),
  // rank 113
  card("change", "cambiar", "Nothing will change until somebody complains loudly."),
  // rank 114
  card("place", "lugar", "This place gets crowded after seven o'clock."),
  // rank 115
  card("long", "largo", "That queue was longer than we expected."),
  // rank 117
  card("feel", "sentir", "How do you feel after the operation?"),
  // rank 119
  card("still", "todavía / aún", "Are you still waiting for the bus?"),
  // rank 120
  card("problem", "problema", "We solved the problem without calling anyone."),
  // rank 121
  card("write", "escribir", "Write your name at the top, please."),
  // rank 123
  card("lot", "montón / mucho", "There's a lot of traffic this morning."),
  // rank 124
  card("great", "estupendo / genial", "Your idea sounds great to all of us."),
  // rank 125
  card("try", "intentar", "She will try again after lunch."),
  // rank 126
  card("leave", "marcharse", "They leave for the airport at dawn."),
  // rank 127
  card("number", "número", "Give me the number of your room."),
  // rank 130
  card("part", "parte", "The hardest part is starting the conversation."),
  // rank 131
  card("point", "punto", "At this point nobody knew what to do."),
  // rank 133
  card("help", "ayudar", "Can somebody help me carry this table?"),
  // rank 134
  card("ask", "preguntar", "Ask the guard where the entrance is."),
  // rank 135
  card("meet", "reunirse con alguien", "Our team meets every Thursday in the café."),
  // rank 136
  card("start", "empezar", "Classes start again in the middle of September."),
  // rank 137
  card("talk", "hablar", "Talk to the manager before you sign anything."),
  // rank 139
  card("put", "poner", "Put the milk back in the fridge."),
  // rank 141
  card("become", "convertirse en", "Children become adults faster than their parents expect."),
  // rank 143
  card("country", "país", "Which country has the longest coastline?"),
  // rank 144
  card("old", "viejo", "My grandfather's watch is old but accurate."),
  // rank 146
  card("school", "escuela / colegio", "Both children walk to school by themselves."),
  // rank 147
  card("late", "tarde (con retraso)", "Sorry, the traffic made me late again."),
  // rank 148
  card("high", "alto", "Prices are much higher near the beach."),
  // rank 149
  card("different", "distinto", "Everything looks different after a fresh coat of paint."),
  // rank 151
  card("next", "próximo / siguiente", "Get off at the next stop, not this one."),
  // rank 152
  card("end", "final", "Wait until the end of the song."),
  // rank 153
  card("live", "vivir", "They live above a bakery on Green Street."),
  // rank 156
  card("world", "mundo", "Half the world was watching that match."),
  // rank 157
  card("week", "semana", "Next week we finally get the keys."),
  // rank 158
  card("play", "jugar", "Kids play in the square until dark."),
  // rank 161
  card("home", "hogar", "Nothing beats a warm home in winter."),
  // rank 162
  card("never", "nunca", "I have never tried Ethiopian food before."),
  // rank 163
  card("include", "incluir", "Does the price include breakfast and parking?"),
  // rank 164
  card("course", "curso", "That course lasts six weeks in total."),
  // rank 165
  card("house", "casa", "Their house has a garden full of lemons."),
  // rank 166
  card("report", "informe", "The report is due before Friday afternoon."),
  // rank 167
  card("group", "grupo", "A group of tourists blocked the entrance."),
  // rank 168
  card("case", "caso", "In that case we should book earlier."),
  // rank 169
  card("woman", "mujer", "The woman behind the counter spoke Portuguese."),
  // rank 171
  card("book", "libro", "Bring the book back whenever you finish it."),
  // rank 172
  card("family", "familia", "Her family moved here from Valencia."),
  // rank 173
  card("seem", "parecer", "Things seem calmer since the new manager arrived."),
  // rank 174
  card("let", "dejar / permitir", "They never let anyone park in front."),
  // rank 175
  card("again", "otra vez / de nuevo", "Say that again, more slowly this time."),
  // rank 176
  card("kind", "tipo (de cosa)", "What kind of music does your sister like?"),
  // rank 177
  card("keep", "guardar (conservar)", "Keep those photos somewhere dry and dark."),
  // rank 178
  card("hear", "oír", "Did you hear that noise upstairs?"),
  // rank 179
  card("system", "sistema", "Our heating system breaks down every winter."),
  // rank 181
  card("question", "pregunta", "Only one question came up after the talk."),
  // rank 183
  card("always", "siempre", "Buses here always run late on Sundays."),
  // rank 184
  card("big", "grande", "Such a big crowd surprised the organisers."),
  // rank 185
  card("set", "fijar / establecer", "Management set the meeting for Tuesday morning."),
  // rank 186
  card("small", "pequeño", "A small mistake cost us the contract."),
  // rank 187
  card("study", "estudiar", "My cousin is studying medicine in Bogotá."),
  // rank 188
  card("follow", "seguir", "Follow the signs until you reach the river."),
  // rank 189
  card("begin", "comenzar", "The ceremony begins at noon sharp."),
  // rank 190
  card("important", "importante", "Sleep is more important than any supplement."),
  // rank 192
  card("run", "correr", "He runs by the river every morning."),
  // rank 194
  card("turn", "girar", "Turn the key gently or it will snap."),
  // rank 196
  card("bring", "traer", "Remember to bring your passport tomorrow."),
  // rank 197
  card("early", "temprano", "Leaving early avoids most of the traffic."),
  // rank 198
  card("hand", "mano", "Raise your hand if you need more time."),
  // rank 199
  card("state", "estado", "The building is in a terrible state."),
  // rank 200
  card("move", "mover", "Let's move the sofa closer to the window."),
  // rank 201
  card("money", "dinero", "Most of the money went on rent."),
  // rank 202
  card("fact", "hecho", "That is a fact nobody can deny."),
  // rank 204
  card("area", "zona / área", "This area floods every time it rains."),
  // rank 205
  card("provide", "proporcionar", "The hotel provides towels and soap."),
  // rank 206
  card("name", "nombre", "Spell your name slowly for the receptionist."),
  // rank 207
  card("read", "leer", "She reads two novels every month."),
  // rank 208
  card("friend", "amigo", "An old friend called me out of nowhere."),
  // rank 209
  card("month", "mes", "Rent goes up again next month."),
  // rank 210
  // rank 211
  card("business", "negocio", "Her business survived two very hard years."),
  // rank 213
  card("information", "información", "The information on that website is outdated."),
  // rank 214
  card("open", "abrir", "Open the window; it is stuffy in here."),
  // rank 215
  card("order", "pedido", "Our order arrived cold and an hour late."),
  // rank 216
  card("government", "gobierno", "The government raised taxes again this year."),
  // rank 217
  card("word", "palabra", "One word from her ended the argument."),
  // rank 218
  card("issue", "asunto / tema", "Money is the real issue behind all this."),
  // rank 219
  card("market", "mercado", "Saturday's market sells the cheapest vegetables."),
  // rank 220
  card("pay", "pagar", "Who pays for the taxi tonight?"),
  // rank 221
  card("build", "construir", "Somebody wants to build flats on that field."),
  // rank 222
  card("hold", "sujetar / sostener", "Hold the door for the woman behind you."),
  // rank 223
  card("service", "servicio", "The service here is slow but friendly."),
  // rank 225
  card("believe", "creer (estar convencido)", "Nobody believed a single word of it."),
  // rank 226
  card("second", "segundo", "Give me a second to find my glasses."),
  // rank 229
  card("love", "encantar", "Kids love the sound of the ice-cream van."),
  // rank 230
  card("increase", "aumentar", "Sales increased sharply after the advert."),
  // rank 231
  card("job", "empleo", "Finding a job here takes months."),
  // rank 232
  card("plan", "planear", "We planned the trip over several weekends."),
  // rank 233
  card("result", "resultado", "The result surprised absolutely everyone in the room."),
  // rank 235
  card("example", "ejemplo", "Give a clear example before explaining the rule."),
  // rank 236
  card("happen", "ocurrir / pasar", "Whatever happens, call me when you land."),
  // rank 237
  card("offer", "ofrecer", "They offered him twice his old salary."),
  // rank 238
  card("young", "joven", "Young drivers pay more for insurance here."),

  // ---------------------------------------------------------------- //
  // 04.1-04 — the second volume batch. Ranks 239 to 378, 120 cards.   //
  // The first batch authored against a deck whose openings were       //
  // already spent: 04.1-03's recorded opening-WORD histogram was read  //
  // before a card was written, and its top entries (`the` x12,         //
  // `they` x5, `my` x4) were treated as budget already gone. Three of  //
  // these 120 open with `the` and none with `they` or `my`.            //
  // ---------------------------------------------------------------- //

  // rank 239
  card("close", "cerrar", "Close the gate behind you or the dog escapes."),
  // rank 240
  card("program", "programa", "Which program teaches you to edit video?"),
  // rank 241
  card("lead", "dirigir / encabezar", "Marta will lead the project until December."),
  // rank 242
  card("buy", "comprar", "Never buy fish from that stall on Mondays."),
  // rank 243
  card("understand", "entender", "Few people understand how the pension works."),
  // rank 244
  card("thank", "agradecer", "Thank the driver when you get off."),
  // rank 245
  card("far", "lejos", "How far is the station from here?"),
  // rank 246
  card("today", "hoy", "Today the market closes an hour early."),
  // rank 247
  card("hour", "hora", "Lunch lasts barely half an hour here."),
  // rank 248
  card("student", "estudiante", "Every student needs a card for the library."),
  // rank 249
  card("face", "cara", "Wash your face before you sit down."),
  // rank 250
  card("hope", "esperar (con ilusión)", "Everyone hopes the strike ends this week."),
  // rank 251
  // rank 252
  card("cost", "costar / coste", "It cost me twice what the bike is worth."),
  // rank 254
  card("room", "habitación", "Their room looks onto a noisy street."),
  // rank 256
  card("reason", "motivo", "Her only reason for leaving was the noise."),
  // rank 257
  card("form", "formulario", "Fill in the form with black ink."),
  // rank 258
  card("spend", "gastar", "Students spend a fortune on textbooks each term."),
  // rank 259
  card("head", "cabeza", "Mind your head on the low beam."),
  // rank 260
  card("car", "coche", "Parking a car here costs eight euros."),
  // rank 261
  card("learn", "aprender", "Children learn languages faster than adults do."),
  // rank 262
  card("level", "nivel", "We keep the noise level down after eleven."),
  // rank 263
  card("person", "persona (un individuo)", "Just one person replied to the whole advertisement."),
  // rank 264
  card("experience", "experiencia", "Teaching abroad was an unforgettable experience for her."),
  // rank 265
  card("once", "una sola vez", "Ring the bell once and wait outside."),
  // rank 266
  card("member", "socio / miembro", "Members of the club park for free."),
  // rank 268
  card("bad", "malo", "They had bad luck with the weather all weekend."),
  // rank 269
  card("city", "ciudad", "Half a million people live in this city."),
  // rank 270
  card("night", "noche", "Last night the neighbours argued until three."),
  // rank 271
  card("able", "capaz", "She is a very able and careful nurse."),
  // rank 272
  card("support", "apoyo", "Without support from the council, the project dies."),
  // rank 274
  card("line", "línea / fila", "The waiter drew a straight line under the total."),
  // rank 275
  card("present", "regalo", "Wrap the present before the guests arrive."),
  // rank 276
  card("side", "lado", "Cross to the other side near the fountain."),
  // rank 279
  card("sure", "seguro (convencido)", "Double-check the address if you aren't sure."),
  // rank 280
  card("term", "trimestre", "Nobody enjoys the last week of term."),
  // rank 282
  card("age", "edad", "At what age can you drive here?"),
  // rank 283
  card("low", "bajo", "My electricity bill is unusually low this month."),
  // rank 284
  card("speak", "hablar (un idioma)", "Does anyone at reception speak Turkish?"),
  // rank 286
  card("process", "proceso", "The whole process takes about three weeks."),
  // rank 287
  card("public", "público", "Public transport here stops well before midnight."),
  // rank 288
  card("often", "a menudo", "How often does the ferry cross the bay?"),
  // rank 289
  card("train", "tren", "I take the early train to the coast."),
  // rank 290
  card("possible", "posible", "Is it possible to change my seat?"),
  // rank 293
  card("view", "vista", "From the roof the view is spectacular."),
  // rank 294
  card("together", "juntos", "Glue the two pieces together and wait."),
  // rank 295
  card("consider", "considerar / plantearse", "Have you considered moving closer to work?"),
  // rank 296
  card("price", "precio", "Haggling over the price is normal here."),
  // rank 297
  card("parent", "padre o madre", "Parents wait outside the hall during rehearsals."),
  // rank 298
  card("hard", "difícil / duro", "Sanding the floor was harder than expected."),
  // rank 299
  card("party", "fiesta", "Bring something to drink to the party."),
  // rank 300
  card("local", "del barrio / de la zona", "Our local butcher shuts for two hours at lunchtime."),
  // rank 301
  card("control", "controlar / dominar", "Who controls the thermostat in this building?"),
  // rank 302
  // THE FIRST EXACT GLOSS COLLISION WITH THE DECK BROWSER, and it is kept on
  // purpose. `daily` holds "already → ya" too, so this is the first overlap
  // whose FRONT is byte-identical (book/kind/order overlap the word and not the
  // sense). Plan 02 decided that overlap is reported and never asserted,
  // because asserting it would force this deck to skip the high-frequency words
  // it exists to teach — and `already` is NGSL rank 302. The two are different
  // products: the deck browser is flip-and-mark and is not scheduled, this card
  // is a permanent `vocab:` key with its own example. Skipping it would need
  // reason "already-taught", which is declared for SCENARIO vocabulary banks
  // and would be the wrong reason recorded.
  card("already", "ya", "By nine the bakery had already sold out."),
  // rank 303
  card("concern", "preocupación", "Safety is my only concern with that ladder."),
  // rank 304
  card("product", "producto", "She makes her own beauty products at home."),
  // rank 305
  card("lose", "perder", "Don't lose the receipt for the warranty."),
  // rank 306
  card("story", "relato / cuento", "Grandpa tells the same story every Christmas."),
  // rank 308
  card("continue", "continuar / proseguir", "The builders continued working without a lunch break."),
  // rank 309
  card("stand", "estar de pie", "Standing for three hours ruined my knees."),
  // rank 310
  // NARROWED at 04.1-08 from "entero / completo". Two jobs: the example shows
  // "entero" alone, and giving up "completo" is what FREES that front for
  // `complete` (581), which had been pushed onto "rellenar" and was therefore
  // answered by *fill in*. One narrowing, two defects.
  card("whole", "entero", "Termites destroyed a whole section of the roof."),
  // rank 312
  card("rate", "tarifa / tasa", "They double their rates during the festival week."),
  // rank 313
  card("care", "cuidado (atención)", "Handle the box with care; it's glass."),
  // rank 314
  card("expect", "esperar (que alguien haga algo)", "Guests are expected to check out by eleven."),
  // rank 315
  card("effect", "efecto", "I felt no effect from the tablets at all."),
  // rank 316
  card("sort", "clasificar / ordenar", "Sort these papers into two neat piles."),
  // rank 319
  card("cause", "provocar", "Frozen pipes caused the flood last winter."),
  // rank 320
  card("fall", "caer(se)", "Leaves fall early along that shaded avenue."),
  // rank 321
  card("deal", "trato / acuerdo", "Both sides signed the deal on Friday."),
  // rank 322
  card("water", "agua", "Filter the water before you drink it."),
  // rank 323
  card("send", "enviar", "Who else should I send this invoice to?"),
  // rank 324
  card("allow", "permitir", "Dogs are not allowed inside the market."),
  // rank 325
  card("soon", "pronto", "Call the plumber soon or it'll get worse."),
  // rank 326
  card("watch", "vigilar / observar", "Watch the kettle so it doesn't boil over."),
  // rank 327
  card("base", "basar / fundamentar", "Producers based the series on a true crime."),
  // rank 328
  card("probably", "probablemente", "We will probably leave before the second half."),
  // rank 329
  card("suggest", "sugerir / proponer", "May I suggest a quieter table near the window?"),
  // rank 330
  card("past", "pasado", "She never talks about her past with strangers."),
  // rank 331
  card("power", "corriente (eléctrica)", "The storm cut the power for six hours."),
  // rank 332
  card("test", "análisis (médico)", "Blood tests usually take three days here."),
  // rank 333
  card("visit", "visitar", "Visit the museum early to avoid the queue."),
  // rank 334
  card("center", "centro", "Everything shuts early in the center on Sundays."),
  // rank 335
  card("grow", "crecer", "He grows taller every time I see him."),
  // rank 337
  card("return", "devolver", "Return the borrowed tools before Saturday, please."),
  // rank 338
  card("mother", "madre", "His mother taught him to sew properly."),
  // rank 339
  card("walk", "caminar / andar", "Walking home in the rain soaked her coat."),
  // rank 340
  card("matter", "importar", "Does it matter if we arrive slightly late?"),
  // rank 341
  card("mind", "mente", "Something odd crossed my mind during dinner."),
  // rank 342
  card("value", "valor", "He keeps old coins because they gain value."),
  // rank 343
  card("office", "oficina", "Our office moves to the third floor in June."),
  // rank 344
  card("record", "grabar / registrar", "Someone recorded the whole concert on a phone."),
  // rank 345
  card("stay", "quedarse", "Two of us stayed behind to lock up."),
  // rank 346
  card("force", "fuerza / obligar", "He forced me to wait outside in the rain."),
  // rank 347
  card("stop", "parar", "The driver stopped the bus at the corner."),
  // rank 349
  card("light", "luz", "Leave a light on for the cat."),
  // rank 350
  // REWRITTEN at 04.1-08. The old example was "Photographers still develop
  // film in that basement." — but developing FILM is "revelar" in Spanish, not
  // "desarrollar", so the front and the example taught different verbs. Same
  // defect class as `standard`, found in the same reader pass.
  card("develop", "desarrollar", "She developed the idea into a real business."),
  // rank 351
  card("remember", "recordar", "Nobody remembers who left the tap running."),
  // rank 352
  card("bit", "un trozo / un poco", "Everyone wanted a bit of the leftover pizza."),
  // rank 353
  card("share", "compartir", "Would you share a taxi to the airport?"),
  // rank 354
  card("real", "auténtico / de verdad", "Those flowers look real from a distance."),
  // rank 355
  // NARROWED at 04.1-08 from "respuesta / responder". The example is the verb
  // and only the verb, so "respuesta" was a front this card never paid off.
  // Narrowing it does NOT free "respuesta" for `response` (606): *answer* is a
  // card, so a bare "respuesta" front would still have two right answers inside
  // the deck. `response` took a parenthetical instead.
  card("answer", "responder", "Answer the door; I'm covered in flour."),
  // rank 356
  card("sit", "sentarse", "Sit on the floor; the chairs are wet."),
  // rank 357
  card("figure", "cifra", "These figures don't add up at all."),
  // rank 358
  card("letter", "carta", "A letter arrived for the previous tenant."),
  // rank 359
  card("decide", "decidir", "Decide quickly; the offer ends at midnight."),
  // rank 360
  card("language", "idioma", "Her sign language class is full until March."),
  // rank 361
  card("subject", "asignatura", "Maths was my worst subject at school."),
  // rank 362
  card("class", "clase (de alumnos)", "Thirty children share one class in that school."),
  // rank 363
  card("development", "desarrollo", "The development of the vaccine took two years."),
  // rank 364
  card("town", "pueblo", "Nothing opens in this town before ten."),
  // rank 365
  card("half", "mitad", "Half of the guests never replied to the invitation."),
  // rank 366
  card("minute", "minuto", "Wait five minutes and try the number again."),
  // rank 367
  card("food", "comida", "Street food here beats most restaurants easily."),
  // rank 368
  card("break", "romper", "Careful, that handle breaks if you pull hard."),
  // rank 369
  card("clear", "despejado", "Skies stayed clear all through the night."),
  // rank 370
  card("future", "futuro", "In future, book the tickets a month earlier."),
  // rank 374
  card("remain", "permanecer", "Please remain seated until the plane stops."),
  // rank 375
  card("top", "parte de arriba / cima", "Dust gathers on top of the wardrobe."),
  // rank 377
  card("win", "ganar", "Whoever wins tonight buys dinner for everyone."),
  // rank 378 held `color` until 04.1-05 retired it — see the header. The rank
  // is not a hole: it is declared in core-vocabulary-skips.ts as a cognate.

  // ------------------------------------------------------------------
  // 04.1-05 — the third volume batch, ranks 379 to 515.
  // ------------------------------------------------------------------
  // The batch where the list stops being concrete. `involve`, `sense`,
  // `particular`, `regard` and `approach` do not write their own sentences the
  // way `house` and `water` did, and the two failures that get written instead
  // are named here so the next author can see them coming:
  //
  //   AN EXAMPLE THAT IS A DEFINITION. "Perhaps is used when you are not sure"
  //   is a grammar note with no register, in a type that deliberately has
  //   nowhere to put one. The card below puts the hedging to work in a
  //   situation instead.
  //
  //   A GLOSS THAT IS A LIST. `es` is the FRONT. A front reading
  //   "quizás / tal vez / a lo mejor" is three cards pretending to be one and
  //   the learner cannot answer it. So `perhaps` is "quizás" and `maybe` is
  //   "a lo mejor" — the neutral hedge and the colloquial one, separated the
  //   way tell/say and leave/let were, not stacked behind one slash.
  // rank 379
  card("involve", "implicar", "Fixing the roof involves scaffolding and two permits."),
  // rank 380
  card("reach", "alcanzar", "Can you reach the top shelf for me?"),
  // rank 382
  card("period", "época", "During that period nobody could find work."),
  // rank 384
  card("note", "nota", "Her note said the key was under the mat."),
  // rank 385
  card("history", "historia", "My grandmother taught history for thirty years."),
  // rank 386
  card("create", "crear", "Two students created the whole poster overnight."),
  // rank 387
  card("drive", "conducir", "Who drives to the airport tomorrow morning?"),
  // NOT "tipo": `kind` (rank 87) holds "tipo / clase" and two cards with the
  // same front expecting different answers is a usability defect. The verb is
  // the sense a learner of this deck will meet on a keyboard anyway.
  // rank 389
  card("type", "teclear", "Type the code slowly; the keypad sticks."),
  // rank 390
  card("sound", "sonido", "That sound comes from the boiler upstairs."),
  // rank 391
  card("eye", "ojo", "Soap in your eye stings for ages."),
  // rank 392
  card("music", "música", "We played music until the neighbours complained."),
  // rank 393
  card("game", "juego", "The children invented a game with stones."),
  // rank 394
  card("political", "político", "Nobody mentions political arguments at family dinners."),
  // rank 395
  card("free", "gratis", "Children under six travel free on this line."),
  // rank 396
  card("receive", "recibir", "We received the parcel three weeks late."),
  // rank 397
  card("moment", "momento", "For a moment nobody said anything at all."),
  // rank 398
  card("sale", "rebajas", "These boots were half price in the sale."),
  // "normativa" and not "política": `political` two ranks up is "político", and
  // two fronts a single letter apart is the same defect as two identical ones.
  // rank 399
  card("policy", "política (de una empresa)", "Company policy forbids phones during the shift."),
  // rank 401
  card("body", "cuerpo", "Cold water wakes your whole body up."),
  // rank 402
  card("require", "exigir", "This job requires a valid driving licence."),
  // 04.1-04 glossed `expect` "dar por hecho" specifically so that this card
  // could own "esperar". The separation was planned a batch ahead; here it is.
  // rank 403
  card("wait", "esperar", "She waited an hour and then went home."),
  // rank 405
  card("appear", "aparecer", "A crack appeared in the ceiling overnight."),
  // rank 407
  card("team", "equipo", "Their team lost every match this season."),
  // rank 408
  card("easy", "fácil", "Nothing about that exam was easy."),
  // rank 409
  card("individual", "individuo", "One individual complained and the rule changed."),
  // rank 410
  card("full", "lleno", "The bin is full again already."),
  // rank 411
  card("black", "negro", "She wore a black coat to the funeral."),
  // rank 412
  card("sense", "sentido", "His answer made no sense to anybody."),
  // rank 413
  card("perhaps", "quizás", "Perhaps the train is stuck outside the station."),
  // rank 414
  card("add", "añadir", "Add salt only after the sauce thickens."),
  // rank 415
  card("rule", "regla", "House rules ban shoes past the doorway."),
  // rank 416
  card("pass", "aprobar (un examen)", "Everyone passed except the boy who overslept."),
  // rank 417
  card("produce", "producir", "Local farms produce enough milk for the valley."),
  // rank 418
  card("sell", "vender", "They sell hot bread from six in the morning."),
  // rank 419
  card("short", "corto", "My hair looks short after every haircut."),
  // rank 420
  card("agree", "coincidir", "Every expert agreed about the cause of the fire."),
  // rank 421
  card("law", "ley", "A new law bans smoking on the terraces."),
  // rank 423
  card("research", "investigación", "Her research took eleven years to finish."),
  // rank 424
  card("cover", "tapar", "Cover the dough and leave it overnight."),
  // rank 425
  card("paper", "papel", "There is no paper left in the printer."),
  // rank 426
  card("position", "puesto", "Three people applied for the same position."),
  // rank 427
  card("near", "cerca", "We live near the old railway bridge."),
  // rank 428
  card("human", "humano", "Machines cannot replace human judgement completely."),
  // rank 429
  card("computer", "ordenador", "My computer freezes whenever I open that file."),
  // rank 430
  card("situation", "situación", "By Friday the situation had calmed down."),
  // rank 431
  card("staff", "plantilla", "Nearly all the staff left after the takeover."),
  // rank 432
  card("activity", "actividad", "There was little activity on the site today."),
  // rank 433
  card("film", "película", "That film ends far too abruptly."),
  // The parenthetical is doing real work: bare "mañana" is the front of
  // *tomorrow*, and the learner would answer the wrong word without it.
  // rank 434
  card("morning", "mañana (antes del mediodía)", "Ring me in the morning, not tonight."),
  // rank 435
  card("war", "guerra", "Both grandfathers survived the war without a scratch."),
  // rank 436
  card("account", "cuenta", "Money left my account without any warning."),
  // rank 437
  card("shop", "tienda", "The shop on the corner closed last winter."),
  // rank 438
  card("major", "grave / importante", "Flooding is a major problem in that street."),
  // rank 441
  card("design", "diseño", "Whose design won the competition in the end?"),
  // rank 442
  card("event", "acontecimiento", "The moon landing was a huge event."),
  // rank 443
  card("special", "especial", "Tonight is special, so we booked a table."),
  // rank 444
  card("sometimes", "a veces", "Sometimes the heating stops for no reason."),
  // rank 445
  card("condition", "estado (en que algo se encuentra)", "The car runs, but its condition is awful."),
  // rank 446
  card("carry", "cargar con", "Don't carry that box down the stairs alone."),
  // rank 447
  card("choose", "elegir", "Choose a seat away from the speakers."),
  // rank 448
  card("father", "padre", "His father repaired watches for a living."),
  // rank 449
  card("decision", "decisión", "That decision cost the club its best player."),
  // rank 450
  card("table", "mesa", "Somebody carved initials into the table."),
  // rank 451
  card("certain", "determinado", "Certain shops shut for the whole of August."),
  // rank 453
  card("main", "principal", "The main road floods after heavy rain."),
  // rank 454
  card("die", "morir", "Every plant on that balcony died in July."),
  // rank 455
  card("bear", "aguantar", "Thin walls make the upstairs racket hard to bear."),
  // rank 456
  card("cut", "cortar", "Cut the bread thinner or it crumbles."),
  // rank 457
  card("describe", "describir", "Witnesses described the car as dark green."),
  // rank 460
  card("especially", "sobre todo", "The kitchen gets hot, especially in August."),
  // rank 461
  card("strong", "fuerte", "That coffee is far too strong for me."),
  // rank 462
  card("rise", "subir", "Bread prices rise every single January."),
  // rank 463
  card("girl", "chica", "A girl from the flat downstairs fed the cat."),
  // The colloquial hedge, deliberately not "quizás" — see the batch header.
  // rank 464
  // rank 465
  card("community", "comunidad", "Our community raised the money in a fortnight."),
  // rank 467
  card("particular", "concreto", "She wants that particular shade of green."),
  // "función" and not "papel": `paper` five ranks up holds "papel".
  // rank 468
  card("role", "papel (que algo desempeña)", "Salt has a role in bread beyond flavour."),
  // rank 469
  card("join", "unirse a", "Why not join us for lunch tomorrow?"),
  // rank 470
  card("difficult", "difícil", "Reading his handwriting is difficult even for me."),
  // rank 472
  card("detail", "detalle", "One detail in her story never added up."),
  // rank 473
  card("difference", "diferencia", "I notice no difference after the repair."),
  // rank 474
  card("action", "acción", "Quick action saved the building from the fire."),
  // rank 475
  card("health", "salud", "Night shifts wrecked his health in two years."),
  // rank 476
  card("eat", "comer", "We eat at eight, so don't be late."),
  // rank 477
  card("step", "paso", "Take one step back from the yellow line."),
  // rank 478
  card("true", "verdadero", "None of that gossip is true."),
  // rank 479
  card("phone", "teléfono", "My phone died halfway through the call."),
  // rank 481
  card("draw", "dibujar", "Children draw on that wall every summer."),
  // rank 482
  card("white", "blanco", "White shirts never survive a week here."),
  // rank 483
  card("date", "fecha", "What date suits you for the appointment?"),
  // rank 484
  card("practice", "práctica", "With enough practice the piece becomes easy."),
  // rank 485
  card("model", "modelo", "This model costs less than the older one."),
  // rank 486
  card("raise", "levantar", "Somebody raised the barrier for the ambulance."),
  // rank 487
  card("customer", "cliente", "A customer complained about the cold soup."),
  // rank 488
  card("front", "delantera", "Someone dented the front of my car."),
  // rank 489
  card("explain", "explicar", "Explain the delay before they ask again."),
  // rank 490
  card("door", "puerta", "Slam that door and the frame shakes."),
  // rank 491
  card("outside", "fuera", "It's freezing outside, so wear the thick coat."),
  // rank 493
  card("economic", "económico", "Economic news never cheers anybody up."),
  // rank 494
  card("site", "emplazamiento", "They chose a site beside the old quarry."),
  // "enfoque" here, so `focus` further down the list can own "centrarse".
  // rank 495
  card("approach", "enfoque", "Her approach to teaching changed everything."),
  // rank 496
  card("teacher", "profesor", "Our teacher marks essays on the train."),
  // rank 497
  card("land", "terreno", "Nothing grows on that land any more."),
  // rank 498
  card("charge", "cobrar", "They charge extra for luggage at the gate."),
  // rank 499
  card("finally", "por fin", "Finally the plumber rang us back."),
  // rank 500
  card("sign", "letrero", "The sign fell off during the storm."),
  // rank 501
  card("claim", "afirmar", "He claims the parcel never arrived."),
  // rank 502
  card("relationship", "relación", "Their relationship survived two years abroad."),
  // rank 503
  card("travel", "viajar", "We travel light because the car is tiny."),
  // rank 504
  card("enjoy", "disfrutar", "Did everyone enjoy the meal last night?"),
  // rank 505
  card("death", "muerte", "His death shocked the whole village."),
  // rank 506
  card("nice", "agradable", "The garden is a nice place to read."),
  // rank 507
  card("amount", "cantidad", "Only a tiny amount of glue is needed."),
  // rank 508
  card("improve", "mejorar", "Her Spanish improved after the summer course."),
  // rank 509
  card("picture", "foto", "Who took the picture on the mantelpiece?"),
  // rank 510
  card("boy", "chico", "The boy next door mows lawns for pocket money."),
  // "estima" and not "considerar": `consider` (rank 331) holds that front.
  // rank 511
  card("regard", "estima", "Colleagues hold her in high regard."),
  // rank 512
  card("organization", "organización", "Several volunteers keep the organization running."),
  // rank 513
  card("happy", "contento", "Nobody looked happy about the new rota."),
  // rank 514
  card("couple", "pareja", "The couple upstairs argue every Sunday."),
  // rank 515
  card("act", "actuar", "You must act quickly if the pipe bursts."),

  // ------------------------------------------------------------------
  // 04.1-06 — the FOURTH and LAST volume batch, ranks 516 to 648.
  // ------------------------------------------------------------------
  // THE DECK STOPS AT 500. Not because the list runs out — the NGSL has 2,809
  // headwords and rank 649 is `pause` — but because 500 is the number the
  // payload decision was taken against, measured rather than modelled. Growing
  // past it is a fresh decision with the ceiling re-measured first, and this
  // batch does not take it and does not prepare for it.
  //
  // THE CONSTRAINT THAT DOMINATES THIS BAND IS THE TAKEN FRONT, not the closed
  // class and not the cognate. Below rank 500 the list is largely Latinate and
  // largely lexical: only six of this batch's thirteen skips are function
  // words. What actually decides a gloss here is which Spanish word an earlier
  // card already owns, because `es` is the FRONT and two cards with the same
  // front expecting different answers is the usability defect this deck has
  // refused since plan 01. Fifteen of these 120 glosses were chosen against a
  // taken front rather than from a dictionary, and each carries its reason
  // beside the card.
  //
  // AND THAT STRATEGY HAS A COST THIS HEADER ORIGINALLY DID NOT NAME. Avoiding
  // a duplicate front by re-glossing pushes the gloss off the headword's
  // central sense, and far enough off, the card's most natural answer becomes a
  // DIFFERENT ENGLISH WORD. The 04.1-07 reader pass found five: `standard`
  // ("habitual" -> *usual*), `complete` ("rellenar" -> *fill in*), `evidence`
  // ("indicios" -> *clues*), `response` ("reacción" -> *reaction*) and `relate`
  // ("vincular" -> *link*). All five were re-glossed at 04.1-08 and each says
  // so beside the card. The lesson for the next author is the ORDER of
  // preference when a front is taken: first free the front by narrowing the
  // card that holds it (that is how `complete` got "completar"), then reach for
  // the PARENTHETICAL that names the sense (`evidence`, `response`, `relate`),
  // and only then accept a different sense — checking, before you do, which
  // English word the new gloss actually asks for. Reaching straight for a
  // synonym is what produced all five.
  //
  // A DERIVATIONAL PAIR IS NOT A COLLISION, AND THE LINE IS WORTH STATING.
  // `job` is "empleo" and `employee` is "empleado"; `grow` is "crecer" and
  // `growth` would be "crecimiento". Those are 1:1 in both languages, so the
  // learner who answers each front correctly has learnt something real. What is
  // forbidden is two fronts a letter apart whose answers are UNRELATED — the
  // `policy`/`political` case plan 05 avoided. Same-stem is fine; same-shape
  // with different meanings is not.

  // rank 516
  card("range", "gama", "Their range of sizes stops at extra large."),
  // rank 517
  card("quality", "calidad", "You lose sound quality on that cheap speaker."),
  // "proyecto" is also the second half of `plan`'s front ("planear / proyecto",
  // rank 232). Kept: the two fronts are different strings a learner answers
  // differently, and every honest alternative here is worse than the overlap.
  // rank 518
  card("project", "proyecto", "Which project needs the most volunteers this month?"),
  // rank 519
  card("round", "redondo", "A round table seats more guests than a square one."),
  // rank 520
  card("opportunity", "oportunidad", "Missing that opportunity kept her in the same job."),
  // rank 521
  card("road", "carretera", "The road to the beach closes every winter."),
  // rank 523
  card("list", "lista", "Pin the list where everybody can see it."),
  // rank 524
  card("wish", "desear", "We wish you luck with the new job."),
  // "llevar (ropa)" and not "llevar": `take` (rank 59) holds "llevar / tomar".
  // The parenthetical rather than "llevar puesto", which the scan put at 0.500
  // against `position` (426, "puesto") — a front wholly containing another
  // front. Same device as `morning`, `class` and `person`.
  // rank 526
  card("wear", "llevar (ropa)", "They make us wear a black apron all day."),
  // rank 527
  // REWRITTEN at 04.1-08. The old example hid the meaning inside the phrasal
  // verb *ran through*: a learner who does not already know that idiom learns
  // nothing about *funds* from the sentence.
  card("fund", "fondos", "Charity funds paid for the new playground equipment."),
  // rank 528
  card("rest", "descansar", "Rest your leg for a week, the doctor said."),
  // rank 529
  card("kid", "crío", "Both kids fell asleep before the film ended."),
  // rank 530
  card("industry", "industria", "Which industry still employs anybody in this valley?"),
  // rank 531
  card("education", "educación", "Her education stopped when the family moved abroad."),
  // rank 532
  card("measure", "medir", "Measure the window twice before ordering blinds."),
  // rank 533
  card("kill", "matar", "Frost killed every tomato plant last April."),
  // rank 534
  card("serve", "servir", "They serve breakfast until half past ten."),
  // rank 535
  card("likely", "probable", "Snow is likely above a thousand metres tonight."),
  // A stance adverb, and it is CARDED rather than skipped on the same line
  // `probably` (328) was carded on: an epistemic adverb names the speaker's
  // confidence and can be glossed, unlike the degree particles `quite` and
  // `rather`. "desde luego" and not "seguro": `sure` (279) holds that front.
  // rank 536
  card("certainly", "sin duda", "That certainly explains the smell in the hallway."),
  // rank 537
  card("national", "nacional", "Nobody warned us about the national holiday."),
  // rank 539
  card("teach", "enseñar", "Who teaches the beginners' class on Tuesdays?"),
  // rank 540
  card("field", "campo", "Our neighbour keeps two horses in that field."),
  // rank 541
  card("security", "seguridad", "I lost my nail scissors at airport security."),
  // rank 542
  card("air", "aire", "Warm air escapes through that gap under the door."),
  // "ventaja" and not "beneficio", which teaches nothing a Spanish speaker does
  // not already have — the same reasoning the `cognate` skips rest on, applied
  // to a word that DOES have a differing gloss and so stays carded.
  // rank 543
  card("benefit", "ventaja", "One benefit of night shifts is the empty roads."),
  // rank 544
  card("trade", "comercio", "Both islands lost their trade when the ferry stopped."),
  // rank 545
  card("risk", "riesgo", "Climbing that ladder alone is a real risk."),
  // rank 546
  card("news", "noticias", "She heard the news from a colleague first."),
  // RE-GLOSSED at 04.1-08, and this was the phase's sharpest content defect
  // rather than a near-miss. The card read "habitual" / "I chose standard
  // delivery and waited nine days." — the FRONT taught the customary sense and
  // the EXAMPLE taught the default-option sense. Gloss and example taught
  // DIFFERENT senses, which is exactly what 04.1-05 fixed on `agree`, and on
  // top of that "habitual" is answered by *usual*, not by this headword.
  //
  // "de serie" fixes both at once: it is the ordinary Spanish for
  // factory-fitted / included-as-standard, it is answered by *standard* and by
  // essentially nothing else, and the example now teaches the same sense the
  // front asks for. "estándar" stays rejected — a front that is the English
  // word wearing an accent teaches nothing — and "norma" stays rejected
  // because `policy` (399) holds "normativa" and the two are a letter apart.
  // rank 547
  card("standard", "de serie", "Air conditioning comes as standard on the cheapest model."),
  // rank 548
  card("vote", "votar", "We vote on the shift pattern each September."),
  // rank 549
  card("percent", "por ciento", "Barely ten percent of the seats were sold."),
  // 04.1-05 glossed `approach` "enfoque" specifically so this card could own
  // "centrarse". The separation was planned a batch ahead; here it is.
  // rank 550
  card("focus", "centrarse", "Try to focus on one chapter at a time."),
  // rank 551
  card("stage", "etapa", "The final stage of the walk is uphill."),
  // rank 552
  card("space", "espacio", "Is there space for one more suitcase?"),
  // The NGSL spells this US-style, so the example does too — the matcher admits
  // realize/realized and would refuse "realised". Same rule `center` (334)
  // follows.
  // rank 554
  card("realize", "darse cuenta", "Few passengers realized the train had changed platform."),
  // rank 555
  card("usually", "normalmente", "He usually parks behind the bakery on Fridays."),
  // rank 556
  card("data", "datos", "Our data disappeared when the laptop was stolen."),
  // rank 557
  card("single", "ni un solo (enfático)", "Not a single ticket was left for Saturday."),
  // rank 558
  card("address", "dirección", "Send the parcel to my new address, please."),
  // "rendimiento" and not "actuación", which is one suffix from `act` (515)
  // "actuar" — and the work sense is the one this deck's learner meets.
  // rank 559
  card("performance", "rendimiento", "You notice the performance drop in this heat."),
  // "casualidad" and not "oportunidad": `opportunity` (520) holds that front,
  // and the luck sense is the one that distinguishes this word anyway.
  // rank 560
  card("chance", "casualidad", "By chance we sat beside her on the plane."),
  // rank 561
  card("accept", "aceptar", "Will they accept a cheque for the deposit?"),
  // rank 562
  card("society", "sociedad", "Spanish society changed enormously in twenty years."),
  // rank 563
  card("technology", "tecnología", "Our clinic got the new technology last spring."),
  // rank 564
  card("mention", "mencionar", "She mentioned the leak twice and nobody came."),
  // "opción" and not "elección", which is both a letter from `choose` (447)
  // "elegir" and ambiguous with the political sense.
  // rank 565
  card("choice", "opción", "You have almost no choice on that menu."),
  // rank 566
  card("save", "ahorrar", "Cycling to work saves me forty euros monthly."),
  // rank 567
  card("common", "común", "Power cuts are common during the dry season."),
  // rank 568
  card("culture", "cultura", "Office culture changed once the founder retired."),
  // "demanda" (the noun) because `require` (402) holds "exigir".
  // REWRITTEN at 04.1-08: the old example turned on *allotments*, a
  // low-frequency British word that carried the whole sense.
  // rank 570
  card("demand", "demanda", "Demand for cheap flights rises every summer."),
  // rank 572
  card("limit", "límite", "Speed limits drop to thirty near the school."),
  // rank 573
  card("listen", "escuchar", "Listen carefully; the announcement is only made once."),
  // The ADJECTIVE, deliberately. "due to" is a complex preposition and would be
  // glossed "debido a", which is grammar; "the rent is due Friday" is the
  // lexical sense a learner can answer.
  // rank 574
  card("due", "previsto para (una fecha)", "Her baby is due the week after Easter."),
  // rank 575
  card("wrong", "equivocado", "You dialled the wrong number twice tonight."),
  // rank 576
  card("foot", "pie", "A blister on his foot ended the hike."),
  // rank 577
  card("effort", "esfuerzo", "Little effort went into painting the hallway."),
  // rank 578
  card("attention", "atención", "Small print rarely gets the attention it deserves."),
  // rank 580
  card("check", "comprobar", "Check the tyres before a long journey."),
  // RE-GLOSSED at 04.1-08 from "rellenar", which was answered by *fill in* —
  // a two-word phrasal verb this deck does not card — rather than by its own
  // headword. The blocker was `whole` (310) holding "entero / completo"; that
  // front was NARROWED to "entero" in this same commit, which frees the
  // completion sense here. So the card no longer teaches a secondary sense at
  // all: "completar" points at *complete* and at nothing else, and the example
  // moved off the form-filling counter to match it.
  // rank 581
  card("complete", "completar", "Nobody completed the crossword that rainy afternoon."),
  // rank 582
  card("lie", "mentir", "He lied about the mileage on the car."),
  // "recoger" and not "escoger", which is a true Spanish synonym of `choose`'s
  // front "elegir" — two fronts a learner would answer with the same word.
  // rank 583
  card("pick", "recoger", "Farmers pick olives here throughout November."),
  // rank 584
  card("reduce", "reducir", "Insulation reduced our heating bill by half."),
  // rank 586
  card("ground", "suelo", "Wet ground ruined the shoes on that walk."),
  // rank 588
  card("arrive", "llegar", "Winter arrives suddenly in these mountain villages."),
  // rank 589
  card("patient", "paciente", "Two patients waited all morning for a bed."),
  // rank 590
  card("current", "actual", "Our current landlord answers the phone at least."),
  // rank 591
  card("century", "siglo", "Nothing in this church is older than the last century."),
  // RE-GLOSSED at 04.1-08 from "indicios", which is answered by *clues*. Bare
  // "pruebas" is still refused — it is one letter from the second half of
  // `test`'s front (332, "examen / prueba") — but the PARENTHETICAL settles it,
  // the same device `morning`, `class`, `person` and `sure` already use. A
  // learner reading "pruebas (de un delito)" is not going to answer *test*, and
  // the forensic example says the same thing the front does.
  // rank 592
  card("evidence", "pruebas (de un delito)", "Investigators found no evidence of a break-in."),
  // rank 593
  card("exist", "existir", "That footpath no longer exists on the new map."),
  // rank 595
  card("fight", "pelear", "Seagulls fight over chips all along the promenade."),
  // "dirigente" and not "líder", which is the English word with an accent.
  // `lead` (241) holds "dirigir / encabezar" — a verb, so the noun is free.
  // rank 596
  card("leader", "dirigente", "Union leaders met the company on Thursday."),
  // The false friend, and it is the whole value of the card: `fine` is not
  // "fino" and not "bien".
  // rank 597
  card("fine", "multa", "A fine arrived three weeks after the trip."),
  // rank 598
  card("street", "calle", "Cyclists use that street to avoid the roundabout."),
  // rank 599
  card("former", "anterior", "Her former flatmate still owes her money."),
  // rank 600
  card("contact", "contactar", "Contact the surgery first thing on Monday morning."),
  // rank 602
  card("wife", "esposa", "His wife runs the bakery on Sunday mornings."),
  // rank 603
  card("sport", "deporte", "Rowing is the only sport she has ever enjoyed."),
  // rank 604
  card("prepare", "preparar", "Prepare the salad while the oven heats up."),
  // "debatir" and NOT "discutir", which in Spanish means to argue — the false
  // friend a bare cognate gloss would have taught backwards.
  // rank 605
  card("discuss", "hablar de", "Neighbours discussed the noise for an hour."),
  // RE-GLOSSED at 04.1-08 from "reacción", which is answered by *reaction*.
  // Bare "respuesta" is NOT available even though `answer` (355) narrowed to
  // "responder" in this same commit: *answer* is itself a card, so "respuesta"
  // would be a front with two right answers inside the deck — which is worse
  // than the defect being fixed. The parenthetical pins the uptake sense the
  // example actually shows.
  // rank 606
  card("response", "respuesta (del público)", "The response to the advert was overwhelming."),
  // rank 607
  card("voice", "voz", "Somebody's voice carried right through the wall."),
  // "pieza" because `bit` (352) holds "un trozo / un poco".
  // rank 608
  card("piece", "pieza", "A missing piece ruined the whole jigsaw."),
  // "acabar" because `end` (152) holds "final / terminar".
  // rank 609
  card("finish", "acabar", "Builders finish at three on Fridays here."),
  // rank 610
  card("suppose", "suponer", "I suppose the rain will stop eventually."),
  // "solicitar", the sense a learner needs, and `ask` (134) holds
  // "pedir / preguntar" anyway.
  // rank 611
  card("apply", "solicitar", "Anybody can apply for the grant before June."),
  // rank 612
  card("president", "presidente", "The club president resigned without any explanation."),
  // rank 613
  card("fire", "fuego", "Someone left a fire burning near the tents."),
  // rank 614
  card("compare", "comparar", "Compare the two quotes before signing anything."),
  // rank 615
  card("court", "tribunal", "The court ordered him to repay the deposit."),
  // rank 616
  card("police", "policía", "Police stopped three drivers outside the school gate."),
  // The VERB, because `shop` (437) already holds "tienda".
  // rank 617
  card("store", "almacenar", "They store the grain in metal silos."),
  // rank 618
  card("poor", "pobre", "Many poor families cannot afford the heating bills."),
  // rank 619
  card("knowledge", "conocimientos", "Practical knowledge beats a certificate in this trade."),
  // rank 620
  card("laugh", "reírse", "Everybody laughed except the man being teased."),
  // rank 621
  card("arm", "brazo", "Both arms ached for days after the move."),
  // rank 622
  card("heart", "corazón", "Coffee makes my heart race before an exam."),
  // rank 623
  card("source", "fuente", "Wind became the island's main source of power."),
  // The derivational pair with `job` (231, "empleo") is deliberate — see the
  // batch header. Spanish and English both have it, so both fronts are answerable.
  // rank 624
  card("employee", "empleado", "Employees clock in through the side entrance."),
  // rank 625
  card("manage", "gestionar", "She manages three shops and still finds time to read."),
  // rank 627
  card("bank", "banco", "Our bank closed the only branch in town."),
  // The ADJECTIVE: `company` (107) holds "empresa", so the business noun has no
  // front left, and "firme" is a real sense a learner meets on a building site.
  // rank 628
  card("firm", "firme", "Press the soil down until it feels firm."),
  // "celda" and not "célula": the prison sense is a genuinely different Spanish
  // word, and the biology one is the English word with an accent.
  // rank 629
  card("cell", "celda", "Prisoners share a cell with two other men."),
  // rank 630
  card("article", "artículo", "An article about the flood appeared on Tuesday."),
  // rank 631
  card("fast", "rápido", "Those trains are fast but always overcrowded."),
  // rank 632
  card("attack", "ataque", "The attack on the shop happened after midnight."),
  // rank 633
  card("foreign", "extranjero", "Does that machine take foreign cards at all?"),
  // rank 634
  card("surprise", "sorpresa", "The bill was a nasty surprise at the end."),
  // "característica" and not "detalle": `detail` (472) holds that front.
  // rank 635
  card("feature", "característica", "This phone's best feature is the battery."),
  // The ADJECTIVE, not the degree particle "pretty good" — a particle is the
  // class `quite` and `rather` were skipped on, and this word has a real
  // adjective a card can hold. `nice` (506) holds "agradable".
  // rank 637
  card("pretty", "bonito", "Somebody hung pretty lanterns along the whole terrace."),
  // rank 638
  card("recently", "hace poco", "She moved to Bristol quite recently."),
  // rank 639
  // REWRITTEN at 04.1-08. The old example needed BOTH *damp* as a noun and
  // *plaster* — two words above this deck's own learner, in the one place the
  // >= 6-word floor cannot look: the OTHER words.
  card("affect", "afectar", "Cold weather affects her knees every winter."),
  // "soltar" and not "dejar caer", which contains `fall`'s front (320, "caer(se)").
  // rank 640
  card("drop", "soltar", "Drop the letter in the box on your way."),
  // rank 641
  card("recent", "reciente", "Recent rain filled the reservoir at last."),
  // RE-GLOSSED at 04.1-08 from "vincular", which is answered by *link*.
  // 04.1-06 rejected "relacionar" as competing with `relationship` (502,
  // "relación") — but that call contradicted the derivational-pair rule stated
  // in this file's own 04.1-06 batch header three paragraphs later:
  // relacionar/relación is 1:1 with relate/relationship exactly as
  // empleo/empleado is with job/employee, and what the rule forbids is two
  // fronts a letter apart whose answers are UNRELATED. The parenthetical
  // removes the residual doubt by naming the verb's argument structure.
  // rank 642
  card("relate", "relacionar (dos cosas)", "Detectives related the two burglaries to one van."),
  // rank 643
  card("official", "oficial", "The official figures came out a week late."),
  // rank 644
  card("financial", "financiero", "Financial worries kept her awake for months."),
  // rank 645
  card("miss", "echar de menos", "I miss the noise of the old market."),
  // rank 646
  card("art", "arte", "Street art covers the wall behind the station."),
  // rank 647
  card("campaign", "campaña", "Their campaign collected signatures outside the library."),
  // rank 648 — the five hundredth card, and where this deck stops.
  card("private", "privado", "Those photos are private and not for sharing."),
];
