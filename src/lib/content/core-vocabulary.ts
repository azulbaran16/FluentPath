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
 * 260 cards as of plan 04.1-04 — the tracer batch of twenty (04.1-01, to rank
 * 71), the first volume batch of 120 (04.1-03, to rank 238) and the second
 * (04.1-04, to rank 378). They are real cards held to the volume bar, not
 * placeholders: every `es` is a natural Spanish gloss and never the English
 * word, and every `example` is a sentence somebody would say, contains the word
 * and runs at least six words.
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
  card("know", "saber / conocer", "Nobody seems to know where the keys are."),
  // rank 43
  card("get", "conseguir / obtener", "Where can I get a decent coffee around here?"),
  // rank 45
  card("like", "gustar", "My daughter likes cold weather more than I do."),
  // rank 47
  card("think", "pensar / creer", "Let me think about it until tomorrow."),
  // rank 48
  card("make", "hacer", "Could you make a copy of this form?"),
  // rank 49
  card("time", "tiempo / vez", "There isn't enough time to finish today."),
  // rank 50
  card("see", "ver", "From here you can see the whole valley."),
  // rank 56
  card("good", "bueno", "That was a really good film, actually."),
  // rank 57
  card("people", "gente / personas", "Too many people were waiting at the counter."),
  // rank 58
  card("year", "año", "Prices have gone up twice this year."),
  // rank 59
  card("take", "llevar / tomar", "It'll take about twenty minutes by bus."),
  // rank 61
  card("well", "bien", "She sings remarkably well for her age."),
  // rank 65
  card("come", "venir", "Come to the front desk when you're ready."),
  // rank 67
  card("work", "trabajo / trabajar", "His work starts at six in the morning."),
  // rank 68
  card("use", "usar", "Can I use your phone for a second?"),
  // rank 70
  card("now", "ahora", "Right now the office is completely empty."),
  // rank 71
  card("then", "entonces / luego", "Finish the form, then hand it to reception."),

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
  card("give", "dar", "Please give me a call when you arrive."),
  // rank 78
  card("first", "primero", "The first bus leaves at half past five."),
  // rank 79
  card("new", "nuevo", "Her new job starts on Monday morning."),
  // rank 80
  card("way", "manera / camino", "There must be a better way to do this."),
  // rank 81
  card("find", "encontrar", "I cannot find my keys anywhere in this flat."),
  // rank 85
  card("day", "día", "Some days are harder than others at work."),
  // rank 87
  card("thing", "cosa", "One thing still bothers me about the plan."),
  // rank 90
  card("need", "necesitar", "We need two more chairs for the table."),
  // rank 92
  card("right", "correcto", "Your answer is right, but the spelling is not."),
  // rank 94
  card("back", "espalda / de vuelta", "Grandma hurt her back lifting those heavy boxes."),
  // rank 95
  card("mean", "significar", "What does this word mean in Spanish?"),
  // rank 101
  card("last", "último", "The last train left ten minutes ago."),
  // rank 102
  card("child", "niño / hijo", "Every child in the class got a prize."),
  // rank 103
  card("tell", "contar / avisar", "Tell me if the music is too loud."),
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
  card("change", "cambiar / cambio", "Nothing will change until somebody complains loudly."),
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
  card("try", "intentar", "Let's try the other entrance instead."),
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
  card("ask", "pedir / preguntar", "Ask the guard where the entrance is."),
  // rank 135
  card("meet", "reunirse con alguien", "Our team meets every Thursday in the café."),
  // rank 136
  card("start", "empezar", "Classes start again in the middle of September."),
  // rank 137
  card("talk", "hablar", "Talk to the manager before you sign anything."),
  // rank 139
  card("put", "poner", "Put the milk back in the fridge."),
  // rank 141
  card("become", "convertirse en", "Winters here become milder with every passing year."),
  // rank 143
  card("country", "país", "Which country has the longest coastline?"),
  // rank 144
  card("old", "viejo", "My grandfather's watch is old but accurate."),
  // rank 146
  card("school", "escuela / colegio", "Both children walk to school by themselves."),
  // rank 147
  card("late", "tarde", "Sorry, the traffic made me late again."),
  // rank 148
  card("high", "alto", "Prices are much higher near the beach."),
  // rank 149
  card("different", "distinto", "Everything looks different after a fresh coat of paint."),
  // rank 151
  card("next", "próximo / siguiente", "Get off at the next stop, not this one."),
  // rank 152
  card("end", "final / terminar", "Wait until the end of the song."),
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
  card("kind", "tipo / clase", "What kind of music does your sister like?"),
  // rank 177
  card("keep", "guardar / mantener", "Keep those photos somewhere dry and dark."),
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
  card("move", "mover / mudarse", "Let's move the sofa closer to the window."),
  // rank 201
  card("money", "dinero", "Most of the money went on rent."),
  // rank 202
  card("fact", "hecho", "In fact, nobody noticed the mistake."),
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
  card("large", "amplio / extenso", "They ordered a large table for twelve people."),
  // rank 211
  card("business", "negocio", "Her business survived two very hard years."),
  // rank 213
  card("information", "información", "The information on that website is outdated."),
  // rank 214
  card("open", "abrir", "Open the window; it is stuffy in here."),
  // rank 215
  card("order", "pedido / orden", "Our order arrived cold and an hour late."),
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
  card("love", "amar / encantar", "Kids love the sound of the ice-cream van."),
  // rank 230
  card("increase", "aumentar", "Sales increased sharply after the advert."),
  // rank 231
  card("job", "empleo", "Finding a job here takes months."),
  // rank 232
  card("plan", "planear / proyecto", "What's the plan for Saturday evening?"),
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
  card("hope", "tener esperanza", "Everyone hopes the strike ends this week."),
  // rank 251
  card("idea", "ocurrencia", "Whose idea was it to paint everything green?"),
  // rank 252
  card("cost", "costar / coste", "Repairs cost more than the bike is worth."),
  // rank 254
  card("room", "habitación", "Their room looks onto a noisy street."),
  // rank 256
  card("reason", "motivo", "Health was the only reason she resigned."),
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
  card("level", "nivel", "Noise levels rise every night after eleven."),
  // rank 263
  card("person", "persona (un individuo)", "Just one person replied to the whole advertisement."),
  // rank 264
  card("experience", "experiencia", "Teaching abroad was an unforgettable experience for her."),
  // rank 265
  card("once", "una sola vez", "Ring the bell once and wait outside."),
  // rank 266
  card("member", "socio / miembro", "Members of the club park for free."),
  // rank 268
  card("bad", "malo", "Bad weather ruined the whole weekend for us."),
  // rank 269
  card("city", "ciudad", "Airports outside the city are always cheaper."),
  // rank 270
  card("night", "noche", "Last night the neighbours argued until three."),
  // rank 271
  card("able", "capaz", "Were you able to reach the doctor?"),
  // rank 272
  card("support", "apoyo / apoyar", "Without support from the council, the project dies."),
  // rank 274
  card("line", "línea / fila", "Draw a straight line under the total."),
  // rank 275
  card("present", "regalo", "Wrap the present before the guests arrive."),
  // rank 276
  card("side", "lado", "Cross to the other side near the fountain."),
  // rank 279
  card("sure", "seguro (convencido)", "Double-check the address if you aren't sure."),
  // rank 280
  card("term", "trimestre", "Exams fall at the end of term."),
  // rank 282
  card("age", "edad", "At what age can you drive here?"),
  // rank 283
  card("low", "bajo", "Petrol prices are unusually low this month."),
  // rank 284
  card("speak", "hablar (un idioma)", "Does anyone at reception speak Turkish?"),
  // rank 286
  card("process", "proceso", "The whole process takes about three weeks."),
  // rank 287
  card("public", "público", "Public transport here stops well before midnight."),
  // rank 288
  card("often", "a menudo", "How often does the ferry cross the bay?"),
  // rank 289
  card("train", "tren", "Trains to the coast run every hour."),
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
  card("local", "del barrio / de la zona", "Local shops shut for two hours at lunchtime."),
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
  card("product", "producto", "Cheap products usually break within a single month."),
  // rank 305
  card("lose", "perder", "Don't lose the receipt for the warranty."),
  // rank 306
  card("story", "relato / cuento", "Grandpa tells the same story every Christmas."),
  // rank 308
  card("continue", "continuar / proseguir", "Rain continued all afternoon without a break."),
  // rank 309
  card("stand", "estar de pie", "Standing for three hours ruined my knees."),
  // rank 310
  card("whole", "entero / completo", "Termites destroyed a whole section of the roof."),
  // rank 312
  card("rate", "tarifa / tasa", "Hotel rates double during the festival week."),
  // rank 313
  card("care", "cuidado / cuidar", "Handle the box with care; it's glass."),
  // rank 314
  card("expect", "dar por hecho", "Guests are expected to check out by eleven."),
  // rank 315
  card("effect", "efecto", "The pills had no effect on her cough."),
  // rank 316
  card("sort", "clasificar / ordenar", "Sort these papers into two neat piles."),
  // rank 319
  card("cause", "causa / provocar", "Frozen pipes caused the flood last winter."),
  // rank 320
  card("fall", "caer(se)", "Leaves fall early along that shaded avenue."),
  // rank 321
  card("deal", "trato / acuerdo", "Both sides signed the deal on Friday."),
  // rank 322
  card("water", "agua", "Filter the water before you drink it."),
  // rank 323
  card("send", "enviar", "Send me the address when you decide."),
  // rank 324
  card("allow", "autorizar / dar permiso", "Dogs are not allowed inside the market."),
  // rank 325
  card("soon", "pronto", "Call the plumber soon or it'll get worse."),
  // rank 326
  card("watch", "vigilar / observar", "Watch the kettle so it doesn't boil over."),
  // rank 327
  card("base", "basar / fundamentar", "Producers based the series on a true crime."),
  // rank 328
  card("probably", "probablemente", "Traffic will probably be terrible after the match."),
  // rank 329
  card("suggest", "sugerir / proponer", "May I suggest a quieter table near the window?"),
  // rank 330
  card("past", "pasado", "Walk past the bakery and cross the square."),
  // rank 331
  card("power", "poder / energía", "The storm cut the power for six hours."),
  // rank 332
  card("test", "examen / prueba", "Blood tests usually take three days here."),
  // rank 333
  card("visit", "visitar / visita", "Visit the museum early to avoid the queue."),
  // rank 334
  card("center", "centro", "Everything shuts early in the center on Sundays."),
  // rank 335
  card("grow", "crecer", "Tomatoes grow well on that sunny balcony."),
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
  card("value", "valor", "Old coins gain value if nobody cleans them."),
  // rank 343
  card("office", "oficina", "Post arrives at the office before nine."),
  // rank 344
  card("record", "grabar / registrar", "Someone recorded the whole concert on a phone."),
  // rank 345
  card("stay", "quedarse", "Stay under the awning until the rain stops."),
  // rank 346
  card("force", "fuerza / obligar", "Wind forced the ferry back to port."),
  // rank 347
  card("stop", "parar", "Buses stop running at half past eleven."),
  // rank 349
  card("light", "luz", "Leave a light on for the cat."),
  // rank 350
  card("develop", "desarrollar", "Photographers still develop film in that basement."),
  // rank 351
  card("remember", "recordar", "Nobody remembers who left the tap running."),
  // rank 352
  card("bit", "un trozo / un poco", "Cut a bit of cheese for the sauce."),
  // rank 353
  card("share", "compartir", "Would you share a taxi to the airport?"),
  // rank 354
  card("real", "auténtico / de verdad", "Those flowers look real from a distance."),
  // rank 355
  card("answer", "respuesta / responder", "Answer the door; I'm covered in flour."),
  // rank 356
  card("sit", "sentarse", "Sit on the floor; the chairs are wet."),
  // rank 357
  card("figure", "cifra", "These figures don't add up at all."),
  // rank 358
  card("letter", "carta", "A letter arrived for the previous tenant."),
  // rank 359
  card("decide", "decidir", "Decide quickly; the offer ends at midnight."),
  // rank 360
  card("language", "idioma", "Sign language classes fill up very fast."),
  // rank 361
  card("subject", "asignatura", "Maths was my worst subject at school."),
  // rank 362
  card("class", "clase (de alumnos)", "Thirty children share one class in that school."),
  // rank 363
  card("development", "desarrollo", "Housing development stopped when the money ran out."),
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
  card("clear", "claro / despejado", "Skies stayed clear all through the night."),
  // rank 370
  card("future", "futuro", "In future, book the tickets a month earlier."),
  // rank 374
  card("remain", "permanecer", "Only three seats remain for Friday's concert."),
  // rank 375
  card("top", "parte de arriba / cima", "Dust gathers on top of the wardrobe."),
  // rank 377
  card("win", "ganar", "Whoever wins tonight buys dinner for everyone."),
  // rank 378
  card("color", "color / tono", "This color looks orange under artificial light."),
];
