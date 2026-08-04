// Speaking warm-up phrases per scenario, used by PronunciationLab.
// Keyed by `${worldSlug}/${scenarioSlug}`.
//
// ONE accessor lives here, and it is STRICT.
//
//   getScenarioPhrases()  — returns `undefined` for a scenario with no curated
//                           set of its own, and a neighbour's set NEVER. It is
//                           what the scenario page, the coverage registry, the
//                           review items and the speaking packs all read.
//
// There used to be a second, lenient one (`getPhrases`) reading through a
// per-world generic record (`WORLD_FALLBACK`) — three lines shared by every
// scenario in a world. Both were deleted at plan 03-11, and the deletion is the
// rule rather than a tidy-up: a scenario with no phrase set of its own must
// FAIL rather than be handed a neighbour's, because a silent substitution is
// indistinguishable on screen from real content and is exactly what D-01
// rejected. What stands in its place is an assertion in
// scripts/verify-scenario-content.mts — "every scenario in the curriculum
// resolves to a NON-EMPTY phrase set" — which fails loudly at authoring time.
// So: ADD A SCENARIO, ADD ITS SIX PHRASES HERE IN THE SAME CHANGE.

export interface Phrase {
  /**
   * Authored slug, unique WITHIN its scenario, and never derived from array
   * position. This id becomes part of the learner's spaced-repetition key
   * (see `scenarioItemId` in src/lib/review-items.ts), which is stored in
   * Postgres and merged blindly by key: an id that moves when a neighbour is
   * inserted silently re-points somebody's box-4 schedule onto a different
   * phrase, with no way to detect it afterwards. Insert freely; never renumber.
   */
  id: string;
  text: string;
  es: string;
  /** quick pronunciation/usage tip */
  tip?: string;
}

const SETS: Record<string, Phrase[]> = {
  "social/small-talk": [
    { id: "hows-it-going", text: "How's it going?", es: "¿Cómo te va?", tip: "Suena como 'hows-it-going', todo unido." },
    { id: "what-do-you-do", text: "What do you do for a living?", es: "¿A qué te dedicas?" },
    { id: "heard-so-much", text: "I've heard so much about you.", es: "He oído mucho sobre ti." },
    { id: "been-a-while", text: "It's been a while, hasn't it?", es: "Ha pasado un tiempo, ¿no?" },
    { id: "how-was-your-weekend", text: "How was your weekend?", es: "¿Qué tal tu fin de semana?", tip: "El arranque más seguro un lunes por la mañana." },
    { id: "great-catching-up", text: "Anyway, it was great catching up.", es: "En fin, qué bueno ponernos al día." },
  ],
  "social/making-friends": [
    { id: "hang-out-sometime", text: "We should hang out sometime.", es: "Deberíamos salir algún día." },
    { id: "grab-a-coffee", text: "Do you want to grab a coffee?", es: "¿Quieres tomar un café?" },
    { id: "what-are-you-into", text: "What are you into?", es: "¿Qué te gusta hacer?" },
    { id: "up-to-this-weekend", text: "What are you up to this weekend?", es: "¿Qué planes tienes este fin de semana?" },
    { id: "count-me-in", text: "Count me in!", es: "¡Cuenten conmigo!", tip: "Respuesta entusiasta a una invitación." },
    { id: "give-you-my-number", text: "Let me give you my number.", es: "Déjame darte mi número." },
  ],
  "social/dating": [
    { id: "been-meaning-to-ask", text: "I've been meaning to ask — are you seeing anyone?", es: "Llevo tiempo queriendo preguntarte: ¿estás con alguien?", tip: "'Seeing someone' es más suave y menos definitivo que 'dating someone'." },
    { id: "if-youd-be-up-for-it", text: "I don't know if you'd be up for it, but there's a jazz place I love.", es: "No sé si te apetecería, pero hay un sitio de jazz que me encanta." },
    { id: "easy-to-talk-to", text: "You're really easy to talk to.", es: "Contigo se habla muy fácil." },
    { id: "no-pressure-either-way", text: "No pressure either way.", es: "Sin presión, como prefieras.", tip: "Cierra la invitación dejando la puerta abierta al 'no'." },
    { id: "id-like-to-do-this-again", text: "This was fun — I'd like to do it again.", es: "Me lo he pasado muy bien; me gustaría repetir." },
    { id: "not-feeling-a-spark", text: "You're great, but I'm not feeling a spark.", es: "Eres genial, pero no siento chispa.", tip: "La fórmula estándar para decir que no sin herir." },
  ],
  "social/parties": [
    { id: "brought-something-for-the-table", text: "I brought something for the table.", es: "Traje algo para compartir.", tip: "Llegar con algo se da por hecho en la mayoría de casas." },
    { id: "can-i-get-you-a-drink", text: "Can I get you a drink?", es: "¿Te traigo algo de beber?" },
    { id: "mind-if-i-join-you", text: "Do you mind if I join you?", es: "¿Os importa si me uno?" },
    { id: "whose-playlist-is-this", text: "The music's great — whose playlist is this?", es: "La música está genial, ¿de quién es la lista?" },
    { id: "should-get-going", text: "I should probably get going.", es: "Creo que ya me voy yendo.", tip: "Anuncia la salida sin cortar la conversación de golpe." },
    { id: "let-me-help-you-clean-up", text: "Let me help you clean up.", es: "Déjame ayudarte a recoger." },
  ],
  "social/complaining": [
    { id: "hate-to-be-that-person", text: "I hate to be that person, but this really isn't good enough.", es: "Odio ser esa persona, pero esto no es aceptable.", tip: "El softener protege la relación; la segunda mitad no cede nada." },
    { id: "been-waiting-over-an-hour", text: "We've been waiting over an hour now.", es: "Llevamos más de una hora esperando.", tip: "Un hecho concreto convence más que un adjetivo." },
    { id: "id-appreciate-it-if", text: "I'd appreciate it if someone could look into this today.", es: "Agradecería que alguien lo revisara hoy.", tip: "'I'd appreciate it if…' es firme y cortés a la vez." },
    { id: "whoever-is-in-charge", text: "Could I speak to whoever's in charge?", es: "¿Podría hablar con el responsable?" },
    { id: "where-that-leaves-me", text: "I'm not sure where that leaves me.", es: "No sé en qué situación me deja eso.", tip: "Rechaza una respuesta insuficiente sin entrar en discusión." },
    { id: "take-this-further", text: "If that's not possible, I'll have to take this further.", es: "Si no es posible, tendré que llevarlo más arriba." },
  ],
  "social/favors": [
    { id: "do-me-a-huge-favour", text: "Could you do me a huge favour?", es: "¿Me harías un favor enorme?", tip: "Avisar antes de pedir da margen al otro para decir que no." },
    { id: "any-chance-you-could", text: "Any chance you could pick me up at eight?", es: "¿Hay alguna posibilidad de que me recojas a las ocho?" },
    { id: "not-too-much-trouble", text: "Only if it's not too much trouble.", es: "Solo si no es mucha molestia." },
    { id: "sure-happy-to", text: "Sure, happy to.", es: "Claro, encantado." },
    { id: "wish-i-could-but", text: "I wish I could, but I'm tied up on Friday.", es: "Ojalá pudiera, pero el viernes estoy liado.", tip: "El 'no' estándar: no exige dar más explicaciones." },
    { id: "i-owe-you-one", text: "Thanks — I owe you one.", es: "Gracias, te debo una." },
  ],
  "social/humor": [
    { id: "only-winding-you-up", text: "Relax, I'm only winding you up.", es: "Tranquilo, solo te estoy tomando el pelo.", tip: "Muy británico; en EE.UU. se oye más 'I'm just messing with you'." },
    { id: "too-soon", text: "Too soon?", es: "¿Demasiado pronto?", tip: "Se dice tras un chiste que quizá ha cruzado la línea." },
    { id: "laugh-at-myself", text: "I can laugh at myself — it's a survival skill.", es: "Sé reírme de mí mismo; es cuestión de supervivencia." },
    { id: "went-over-my-head", text: "That one went completely over my head.", es: "Ese chiste se me escapó del todo.", tip: "Admite que no lo pillaste sin quedar mal." },
    { id: "none-taken", text: "None taken.", es: "No me ofendo.", tip: "Respuesta fija a 'no offence' — nunca se dice entera." },
    { id: "assume-that-was-sarcasm", text: "I'm going to assume that was sarcasm.", es: "Voy a dar por hecho que eso era sarcasmo." },
  ],
  "work/interviews": [
    { id: "thanks-for-having-me", text: "Thanks for having me.", es: "Gracias por recibirme." },
    { id: "detail-oriented", text: "I'd describe myself as detail-oriented.", es: "Me describiría como detallista." },
    { id: "walk-you-through", text: "Let me walk you through my experience.", es: "Permítame explicarle mi experiencia paso a paso.", tip: "'Walk you through' = llevar a alguien punto por punto." },
    { id: "more-about-the-role", text: "Could you tell me more about the role?", es: "¿Podría contarme más sobre el puesto?" },
    { id: "excited-opportunity", text: "I'm really excited about this opportunity.", es: "Estoy muy entusiasmado con esta oportunidad." },
    { id: "hear-back", text: "When can I expect to hear back?", es: "¿Cuándo tendré noticias?" },
  ],
  "work/meetings": [
    { id: "hear-me-okay", text: "Can everyone hear me okay?", es: "¿Se me escucha bien?" },
    { id: "jump-in-here", text: "Can I jump in here?", es: "¿Puedo intervenir aquí?" },
    { id: "build-on-that", text: "Just to build on that point...", es: "Solo para ampliar ese punto..." },
    { id: "park-that", text: "Let's park that for now.", es: "Dejemos eso apartado por ahora.", tip: "Aplaza un tema sin descartarlo." },
    { id: "circle-back", text: "Let's circle back to this later.", es: "Volvamos a esto más tarde." },
    { id: "to-sum-up", text: "So, to sum up...", es: "Entonces, para resumir..." },
  ],
  // B1, and this scenario's WRITING half belongs to plan 03-06. These six are
  // the spoken half only: talking ABOUT a message — chasing it, resending it,
  // owning a mistake in it — on a call or across a desk.
  "work/emails": [
    { id: "did-you-get-my-email", text: "Did you get my email from Friday?", es: "¿Te llegó mi correo del viernes?", tip: "En el habla se dice 'did you get', casi nunca 'have you received'." },
    { id: "put-it-in-writing", text: "I'll put it in writing so we both have it.", es: "Te lo mando por escrito para que quede constancia.", tip: "'Put it in writing' cierra un acuerdo verbal sin desconfiar de nadie." },
    { id: "copy-you-in", text: "I'll copy you in on the thread.", es: "Te pongo en copia en el hilo.", tip: "'Copy someone in' (UK) = 'CC someone' (US)." },
    { id: "landed-in-your-spam", text: "It might have landed in your spam folder.", es: "Puede que haya caído en tu carpeta de spam." },
    { id: "hit-reply-all", text: "I hit reply all by mistake.", es: "Le di a «responder a todos» sin querer.", tip: "'Hit' es pulsar un botón: hit send, hit reply, hit delete." },
    { id: "gentle-nudge", text: "I'll send them a gentle nudge.", es: "Les mando un recordatorio suave.", tip: "'A nudge' suena mucho mejor que un tercer 'reminder'." },
  ],
  "work/presentations": [
    { id: "bear-with-me", text: "Bear with me while I find the right slide.", es: "Un momento, que busco la diapositiva.", tip: "'Bear with me' es la fórmula fija para pedir paciencia en público." },
    { id: "three-things", text: "There are three things I want you to take away from this.", es: "Hay tres cosas que quiero que os llevéis de esto.", tip: "Anunciar el número al principio hace que la sala te siga." },
    { id: "outside-my-area", text: "That's outside my area, but I'll find out and get back to you.", es: "Eso se sale de mi área, pero lo averiguo y te digo.", tip: "En el turno de preguntas, admitirlo cuesta menos que improvisar." },
    { id: "does-that-answer", text: "Does that answer your question?", es: "¿Responde eso a tu pregunta?", tip: "Cierra cada respuesta con esto y recuperas el control de la sala." },
    { id: "shape-of-the-line", text: "Don't worry about reading the numbers — the shape of the line is the point.", es: "No os preocupéis por leer los números; lo importante es la forma de la curva." },
    { id: "leave-you-with-one-thought", text: "I'll leave you with one thought.", es: "Os dejo con una idea.", tip: "Un cierre con contenido; nunca termines con 'that's it'." },
  ],
  // C1. Concession and counter-offer, not assertion: every line either buys
  // information, trades something, or marks a limit without shutting the door.
  "work/negotiating": [
    { id: "struggle-to-justify", text: "I'd struggle to justify that internally.", es: "Me costaría justificarlo internamente.", tip: "Rechaza sin culpar a nadie: el obstáculo es la organización, no tú." },
    { id: "any-movement-on", text: "Is there any movement on the price?", es: "¿Hay margen en el precio?", tip: "'Movement' pregunta si algo es negociable sin llegar a pedir un descuento." },
    { id: "if-we-absorbed-the-shipping", text: "If we absorbed the shipping, could you commit to twelve months?", es: "Si nosotros asumimos el envío, ¿os comprometeríais a doce meses?", tip: "La condicional pone la concesión y la contrapartida en la misma frase." },
    { id: "as-far-as-i-can-go", text: "That's about as far as I can go.", es: "Hasta ahí puedo llegar.", tip: "Marca un límite sin cerrar la conversación." },
    { id: "not-far-apart", text: "We're not far apart on this.", es: "No estamos tan lejos.", tip: "Reencuadra el desacuerdo como algo prácticamente resuelto." },
    { id: "on-that-basis", text: "On that basis, I think we've got a deal.", es: "Sobre esa base, creo que tenemos un acuerdo.", tip: "'On that basis' fija exactamente lo acordado justo antes de cerrar." },
  ],
  "work/networking": [
    { id: "whats-brought-you-here", text: "So what's brought you here today?", es: "¿Y qué te trae por aquí?", tip: "El arranque estándar en un evento: pregunta por el motivo, no por el cargo." },
    { id: "im-the-one-who", text: "I'm the one who keeps the data from falling over.", es: "Soy el que evita que los datos se vengan abajo.", tip: "Una imagen se recuerda; un cargo, no." },
    { id: "do-you-two-know-each-other", text: "Do you two know each other? Ana, this is Marc.", es: "¿Os conocéis? Ana, este es Marc.", tip: "Presentar a dos personas es la forma más rápida de hacerte útil en una sala." },
    { id: "pick-your-brain", text: "I'd love to pick your brain about that sometime.", es: "Me encantaría que me contaras más sobre eso algún día.", tip: "'Pick someone's brain' halaga; 'ask you for advice' obliga." },
    { id: "have-you-got-a-card", text: "Have you got a card, or shall I find you on LinkedIn?", es: "¿Tienes tarjeta, o te busco en LinkedIn?" },
    { id: "i-wont-keep-you", text: "I won't keep you — I can see you're being pulled away.", es: "No te entretengo, que veo que te reclaman.", tip: "La salida elegante de un evento: te vas tú, no te echan." },
  ],
  // B2, and deliberately both halves: three lines for giving feedback and three
  // for taking it, because the second half is the one nobody rehearses.
  "work/feedback": [
    { id: "can-i-be-straight-with-you", text: "Can I be straight with you about the report?", es: "¿Puedo ser franco contigo sobre el informe?", tip: "Anunciar la franqueza baja la guardia; empezar a criticar la sube." },
    { id: "two-things-worked", text: "Two things worked, and there's one I'd change.", es: "Dos cosas funcionaron y hay una que yo cambiaría.", tip: "Anunciar la estructura evita que el elogio suene a preámbulo del golpe." },
    { id: "came-across-as", text: "I don't think you meant it this way, but it came across as dismissive.", es: "No creo que fuera tu intención, pero sonó despectivo.", tip: "'Come across as' describe el efecto, no la intención: por eso se acepta." },
    { id: "that-one-stings", text: "That one stings a bit, but you're right.", es: "Eso escuece un poco, pero tienes razón.", tip: "Reconocer la incomodidad y aceptar la crítica a la vez desarma la conversación." },
    { id: "let-me-sit-with-that", text: "Let me sit with that for a day before I respond.", es: "Déjame darle una vuelta antes de responderte.", tip: "Gana tiempo sin rechazar la crítica ni aceptarla en caliente." },
    { id: "what-would-that-look-like", text: "What would that look like in practice?", es: "¿Y eso cómo se traduciría en la práctica?", tip: "Convierte una crítica vaga en algo accionable sin discutirla." },
  ],
  "travel/airport": [
    { id: "check-this-bag", text: "I'd like to check this bag.", es: "Quisiera documentar esta maleta.", tip: "'Check a bag' es facturarla; la de mano es 'carry-on'." },
    { id: "window-seat", text: "I'd like a window seat, please.", es: "Quisiera un asiento de ventana, por favor." },
    { id: "flight-on-time", text: "Is the flight on time?", es: "¿El vuelo va a tiempo?" },
    { id: "which-gate", text: "Which gate does it leave from?", es: "¿De qué puerta sale?" },
    { id: "baggage-claim", text: "Where's the baggage claim?", es: "¿Dónde está la recogida de equipaje?" },
    { id: "missed-connection", text: "I think I missed my connection.", es: "Creo que perdí mi conexión." },
  ],
  "travel/hotel": [
    { id: "any-rooms-available", text: "Do you have any rooms available for tonight?", es: "¿Tienen habitaciones libres para esta noche?" },
    { id: "leave-my-bags-here", text: "Could I leave my bags here until check-in?", es: "¿Puedo dejar las maletas aquí hasta la hora de entrada?", tip: "'Check-in' es también la HORA a partir de la cual puedes subir." },
    { id: "is-breakfast-included", text: "Is breakfast included?", es: "¿El desayuno está incluido?" },
    { id: "room-next-door-is-noisy", text: "The room next door is really noisy — could you move us?", es: "La habitación de al lado hace mucho ruido, ¿nos podrían cambiar?" },
    { id: "wifi-password", text: "What's the Wi-Fi password?", es: "¿Cuál es la contraseña del wifi?" },
    { id: "settle-the-bill", text: "We're checking out — could we settle the bill?", es: "Nos vamos; ¿podemos pagar la cuenta?", tip: "'Settle the bill' es la fórmula del mostrador al marcharse." },
  ],
  "travel/restaurant": [
    { id: "table-for-two", text: "A table for two, please.", es: "Una mesa para dos, por favor." },
    { id: "see-the-menu", text: "Could we see the menu, please?", es: "¿Podríamos ver el menú, por favor?" },
    { id: "what-do-you-recommend", text: "What do you recommend?", es: "¿Qué recomienda?" },
    { id: "allergic-to-nuts", text: "I'm allergic to nuts — does this have any?", es: "Soy alérgico a los frutos secos, ¿esto lleva?" },
    { id: "have-the-same", text: "I'll have the same, please.", es: "Yo quiero lo mismo, por favor." },
    { id: "get-the-check", text: "Could we get the check?", es: "¿Nos trae la cuenta?" },
  ],
  "travel/directions": [
    { id: "how-do-i-get-to", text: "Excuse me, how do I get to the station?", es: "Disculpe, ¿cómo llego a la estación?" },
    { id: "walking-distance", text: "Is it within walking distance?", es: "¿Se puede ir caminando?" },
    { id: "how-long-on-foot", text: "How long does it take on foot?", es: "¿Cuánto se tarda a pie?" },
    { id: "second-left", text: "Take the second left.", es: "Gire en la segunda a la izquierda." },
    { id: "going-the-right-way", text: "Am I going the right way?", es: "¿Voy por buen camino?" },
    { id: "which-stop", text: "Which stop should I get off at?", es: "¿En qué parada me bajo?", tip: "'Get off' sirve para bus, tren y metro." },
  ],
  "travel/emergencies": [
    { id: "without-a-prescription", text: "Do you have something for this without a prescription?", es: "¿Tiene algo para esto sin receta?", tip: "Lo que se vende así se llama 'over the counter'." },
    { id: "im-on-medication", text: "I'm on medication for my blood pressure.", es: "Estoy tomando medicación para la tensión.", tip: "'To be ON medication' es la fórmula fija — no 'take medication'." },
    { id: "wallet-has-been-stolen", text: "My wallet's been stolen.", es: "Me han robado la cartera.", tip: "La pasiva evita decir quién; es lo natural al denunciar." },
    { id: "report-it-for-insurance", text: "I need to report it for my insurance.", es: "Necesito denunciarlo para el seguro." },
    { id: "been-like-this-since", text: "It's been like this since yesterday morning.", es: "Está así desde ayer por la mañana.", tip: "El present perfect es lo que un médico espera oír para 'desde cuándo'." },
    { id: "is-it-serious", text: "Is it serious? Should I see a doctor?", es: "¿Es grave? ¿Debería ver a un médico?" },
  ],
  "travel/shopping": [
    { id: "could-i-try-this-on", text: "Could I try this on?", es: "¿Me lo puedo probar?", tip: "'Try on' es solo para ropa; para lo demás, 'try out'." },
    { id: "come-in-another-colour", text: "Does this come in another colour?", es: "¿Lo tienen en otro color?" },
    { id: "whats-your-return-policy", text: "What's your return policy?", es: "¿Cuál es la política de devoluciones?" },
    { id: "can-i-pay-by-card", text: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" },
    { id: "exchange-it-for-a-bigger-size", text: "Could I exchange it for a bigger size?", es: "¿Podría cambiarlo por una talla más grande?", tip: "'Exchange' es cambiar por otro artículo; 'refund', que te devuelvan el dinero." },
    { id: "is-this-on-sale", text: "Is this on sale, or is that the full price?", es: "¿Esto está rebajado o es el precio normal?", tip: "'On sale' = rebajado. 'For sale' = en venta. No los mezcles." },
  ],
  // ── Reading & Ideas ────────────────────────────────────────────
  // Four of these five declare READING and not speaking, so their phrases are
  // deliberately not comprehension questions (that is the reading pair, owned
  // by plans 03-07 and 03-08). They are the language of working with a text
  // OUT LOUD: asking what a paragraph is driving at, hedging an inference,
  // marking a shift in an argument, saying what a narrator is doing.
  // `academic/debate` is the one that declares speaking, and it gets the
  // language of conceding, rebutting and building.

  // B2. Not "what does it say" but "how is it saying it" — the reading a
  // learner has to do out loud before she can spot an angle.
  "academic/news": [
    { id: "headline-says-one-thing", text: "The headline says one thing, but the article says another.", es: "El titular dice una cosa y el artículo dice otra.", tip: "El titular suele escribirlo otra persona: por eso a veces no encaja con el texto." },
    { id: "whos-the-source", text: "Who's the source for that?", es: "¿De dónde sale ese dato?", tip: "'A source' es la persona o el documento del que viene la información." },
    { id: "claims-not-happened", text: "It says he claims it, not that it happened.", es: "Dice que él lo afirma, no que ocurriera.", tip: "'Claims' avisa de que el periódico no responde por ese dato." },
    { id: "that-word-is-doing-a-lot", text: "That word's doing a lot of work in that sentence.", es: "Esa palabra está haciendo mucho trabajo en esa frase.", tip: "Así se señala una palabra tendenciosa sin acusar a nadie de mentir." },
    { id: "only-skimmed-the-top", text: "I only skimmed the top of it.", es: "Solo le eché un vistazo por encima.", tip: "'Skim' es leer rápido para lo general; 'scan' es buscar un dato concreto." },
    { id: "buried-halfway-down", text: "The actual news is buried halfway down.", es: "La noticia de verdad está enterrada a mitad del texto.", tip: "'Bury' un dato es dejarlo lejos del principio, a veces a propósito." },
  ],
  // C1, and the level where an author most easily writes vocabulary that is
  // merely long. These six are about tracking an argument ACROSS paragraphs:
  // hedging an inference, hearing a connector turn, admitting a loss of thread.
  "academic/articles": [
    { id: "if-im-reading-this-right", text: "If I'm reading this right, she's arguing the opposite.", es: "Si lo estoy entendiendo bien, defiende justo lo contrario.", tip: "'If I'm reading this right' matiza tu interpretación sin dejar de darla." },
    { id: "that-however-changes-everything", text: "That 'however' changes everything that follows.", es: "Ese 'however' cambia todo lo que viene después.", tip: "Los conectores son el esqueleto del argumento: búscalos antes que los adjetivos." },
    { id: "setting-up-the-counterargument", text: "He's setting up the counterargument so he can knock it down.", es: "Está montando el contraargumento para luego desmontarlo.", tip: "'Knock down an argument' es refutarlo; es lo que hace un autor justo antes de concluir." },
    { id: "not-saying-it-outright", text: "She's not saying it outright, but that's the implication.", es: "No lo dice abiertamente, pero es lo que se da a entender.", tip: "En prensa larga, lo importante suele estar implícito y no afirmado." },
    { id: "lost-the-thread", text: "I lost the thread around the third page.", es: "Perdí el hilo por la tercera página.", tip: "'Lose the thread' es exactamente el mismo hilo que en español." },
    { id: "three-paragraphs-to-get-there", text: "It takes him three paragraphs to get to the point.", es: "Tarda tres párrafos en llegar al grano.", tip: "'Get to the point' es ir al grano; 'have a point', tener razón. No los confundas." },
  ],
  // B2. Voice and subtext: what the narrator is doing, and what a reader is
  // allowed to say about it without having finished the book.
  "academic/stories": [
    { id: "narrator-isnt-telling-us-everything", text: "The narrator isn't telling us everything.", es: "El narrador no nos lo está contando todo.", tip: "'An unreliable narrator' es un recurso clásico de la ficción en inglés." },
    { id: "saw-that-coming", text: "I saw that coming from the first page.", es: "Me lo veía venir desde la primera página.", tip: "'See it coming' vale igual para un giro de la trama que para la vida real." },
    { id: "its-set-in", text: "It's set in a village in the fifties.", es: "Está ambientada en un pueblo en los años cincuenta.", tip: "Para ficción, el lugar y la época van siempre con 'set in'." },
    { id: "never-warmed-to-her", text: "I never really warmed to the sister.", es: "La hermana nunca me llegó a caer bien.", tip: "'Warm to someone' es irle cogiendo aprecio poco a poco." },
    { id: "nothing-much-happens", text: "Nothing much happens, and that's the point.", es: "No pasa gran cosa, y ahí está la gracia.", tip: "Defensa estándar de un relato lento; se dice sin ironía." },
    { id: "ending-left-me-hanging", text: "The ending left me hanging.", es: "El final me dejó con la intriga.", tip: "'Leave someone hanging' es dejar algo sin resolver — también en una conversación." },
  ],
  // B2, and the WRITING half belongs to plan 03-06. These six are spoken: the
  // language of REDUCING a text. `academic/debate` gets the language of making
  // a case; this one gets the language of cutting one down.
  "academic/summaries": [
    { id: "boils-down-to", text: "The whole thing boils down to one idea.", es: "Todo se reduce a una sola idea.", tip: "'Boil down to' es lo que queda cuando quitas todo lo demás." },
    { id: "in-a-nutshell", text: "In a nutshell, the tax didn't work.", es: "En pocas palabras, el impuesto no funcionó.", tip: "'In a nutshell' anuncia un resumen de una frase, no de un párrafo." },
    { id: "thats-just-an-example", text: "That paragraph's just an example — it can go.", es: "Ese párrafo es solo un ejemplo; se puede quitar.", tip: "Al resumir, lo primero que cae son los ejemplos." },
    { id: "in-my-own-words", text: "Let me put that in my own words.", es: "Déjame decirlo con mis propias palabras.", tip: "'In my own words' demuestra que lo has entendido, no que lo has copiado." },
    { id: "leaving-anything-out", text: "Am I leaving anything important out?", es: "¿Me estoy dejando algo importante?", tip: "'Leave out' es omitir, y con pronombre va en medio: 'leave it out'." },
    { id: "cut-it-down-to-half", text: "I need to cut this down to half a page.", es: "Tengo que reducirlo a media página.", tip: "'Cut down' es acortar; 'cut out' es eliminar del todo." },
  ],
  // C1, and the one scenario in this world that declares SPEAKING. Conceding,
  // rebutting and building — the three moves the briefing names but does not
  // give her the words for.
  "academic/debate": [
    { id: "take-your-point-but", text: "I take your point, but it only holds in the short term.", es: "Acepto tu argumento, pero solo se sostiene a corto plazo.", tip: "'I take your point' concede de verdad; 'I hear you' suena a que no piensas moverte." },
    { id: "youre-conflating-two-things", text: "I think you're conflating two different things here.", es: "Creo que estás mezclando dos cosas distintas.", tip: "'Conflate' señala el error de razonamiento sin llamar confuso a nadie." },
    { id: "by-that-logic", text: "By that logic, we'd have to ban bicycles too.", es: "Siguiendo esa lógica, habría que prohibir también las bicicletas.", tip: "Lleva el argumento del otro al extremo: muy eficaz y nada amable." },
    { id: "start-with-where-we-agree", text: "Let's start with where we agree.", es: "Empecemos por donde sí coincidimos.", tip: "Abrir por el acuerdo desarma mucho antes que abrir atacando." },
    { id: "evidence-or-a-feeling", text: "Is there evidence for that, or is it a feeling?", es: "¿Hay pruebas de eso, o es una impresión?", tip: "Pide la base sin negar la conclusión, que es lo que la hace difícil de esquivar." },
    { id: "ill-grant-you-that-one", text: "I'll grant you that one.", es: "Eso te lo concedo.", tip: "Conceder algo pequeño da credibilidad a todo lo que no concedes." },
  ],
  // The one scenario where she cannot see the other person. These six are the
  // lines that survive a bad line: getting volume, spelling out, reading a
  // number back, and ending a call without either party guessing.
  "practical/phone-calls": [
    { id: "could-you-speak-up", text: "Could you speak up a little? The line's not great.", es: "¿Puedes hablar un poco más alto? La línea no es buena.", tip: "'Speak up' es subir el volumen; 'slow down', bajar la velocidad. No son lo mismo." },
    { id: "let-me-spell-that", text: "Let me spell that for you: B for Bravo, A for Alpha.", es: "Te lo deletreo: B de Bravo, A de Alfa.", tip: "En inglés se deletrea con palabras; decir solo la letra no se entiende por teléfono." },
    { id: "so-thats-double-seven", text: "So that's double seven, four, one — is that right?", es: "Entonces es siete siete, cuatro, uno, ¿correcto?", tip: "'Double seven' = 77. Los dígitos repetidos se agrupan así al leerlos en voz alta." },
    { id: "is-this-a-good-time", text: "Is this a good time, or shall I call back later?", es: "¿Te pillo bien, o te llamo luego?" },
    { id: "we-got-cut-off", text: "Sorry, I think we got cut off.", es: "Perdona, creo que se cortó.", tip: "'Get cut off' es que se corte la llamada; 'hang up' es colgar a propósito." },
    { id: "ill-let-you-go", text: "I'll let you go — thanks for your time.", es: "Te dejo; gracias por tu tiempo.", tip: "La fórmula fija para cerrar una llamada sin parecer brusco." },
  ],
  // The written half (a support ticket) is plan 03-06's. These are spoken:
  // what she says to a human who is following a script on the other end.
  "practical/tech-support": [
    { id: "worked-fine-until", text: "It worked fine until the update on Tuesday.", es: "Funcionaba bien hasta la actualización del martes.", tip: "Dar el momento en que empezó ahorra media conversación." },
    { id: "every-time-i", text: "It happens every time I open a second tab.", es: "Pasa cada vez que abro una segunda pestaña.", tip: "'Every time I…' describe un patrón reproducible; es lo primero que te van a pedir." },
    { id: "that-didnt-fix-it", text: "That didn't fix it — same message.", es: "Eso no lo ha solucionado; el mismo mensaje." },
    { id: "stay-on-the-line", text: "Can you stay on the line while I try it?", es: "¿Puede quedarse en línea mientras lo pruebo?" },
    { id: "reference-number", text: "Could I have a reference number for this?", es: "¿Me da un número de referencia?", tip: "Pedirlo al final de cada llamada evita empezar de cero en la siguiente." },
    { id: "this-needs-escalating", text: "This needs escalating, I'm afraid.", es: "Me temo que esto hay que escalarlo.", tip: "'It needs escalating' afirma en vez de pedir, y esa sola palabra hace más que cinco frases de queja." },
  ],
  // B2, and the READING half (a lease) belongs to plan 03-07. These six are a
  // spoken viewing checklist: the questions that decide whether she signs.
  "practical/housing": [
    { id: "much-damp-in-winter", text: "Is there much damp in the winter?", es: "¿Entra mucha humedad en invierno?", tip: "La pregunta que más dinero ahorra en una visita, y la que casi nadie hace." },
    { id: "responsible-for-repairs", text: "Who's responsible for repairs — you or the landlord?", es: "¿Quién se encarga de las reparaciones, usted o el propietario?" },
    { id: "how-much-notice", text: "How much notice do I have to give if I leave early?", es: "¿Con cuánta antelación tengo que avisar si me voy antes?", tip: "'Give notice' es avisar formalmente; sin plazo claro puedes perder la fianza." },
    { id: "see-the-meter-readings", text: "Could I see the meter readings before I sign?", es: "¿Puedo ver las lecturas de los contadores antes de firmar?", tip: "Anotarlas el día de entrada evita pagar el consumo del inquilino anterior." },
    { id: "when-could-i-move-in", text: "When could I move in, realistically?", es: "¿Cuándo podría mudarme, siendo realistas?", tip: "'Realistically' pide la fecha verdadera, no la del anuncio." },
    { id: "boiler-last-serviced", text: "When was the boiler last serviced?", es: "¿Cuándo se revisó la caldera por última vez?", tip: "'Serviced' es la revisión; 'repaired', la avería. Preguntar por la primera evita la segunda." },
  ],
  "practical/banking": [
    { id: "monthly-fee-on-this-account", text: "Is there a monthly fee on this account?", es: "¿Esta cuenta tiene comisión mensual?", tip: "'A fee' es una comisión; 'a fine', una multa. En un banco no los confundas." },
    { id: "payment-i-didnt-make", text: "There's a payment here I didn't make.", es: "Hay un cargo aquí que yo no he hecho.", tip: "Empieza por el hecho; la palabra 'fraud' asusta y ralentiza la gestión." },
    { id: "freeze-the-card", text: "Can I freeze the card from the app, or do you have to do it?", es: "¿Puedo bloquear la tarjeta desde la app o tienen que hacerlo ustedes?" },
    { id: "how-long-to-clear", text: "How long will the transfer take to clear?", es: "¿Cuánto tarda en hacerse efectiva la transferencia?", tip: "'To clear' es que el dinero quede realmente disponible, no solo enviado." },
    { id: "im-a-bit-overdrawn", text: "I think I'm a bit overdrawn this month.", es: "Creo que estoy un poco en números rojos este mes.", tip: "'Overdrawn' es tener saldo negativo; el permiso para tenerlo es 'an overdraft'." },
    { id: "print-me-the-transactions", text: "Could you print me the last three months of transactions?", es: "¿Me puede imprimir los movimientos de los últimos tres meses?" },
  ],
  // A2 and staying A2: short, concrete, produceable at a desk under pressure.
  "practical/appointments": [
    { id: "make-an-appointment", text: "I'd like to make an appointment, please.", es: "Quisiera pedir cita, por favor.", tip: "Se dice 'make an appointment', nunca 'take an appointment'." },
    { id: "first-free-slot", text: "When's your first free slot?", es: "¿Cuál es el primer hueco que tiene?", tip: "'A slot' es un hueco en la agenda." },
    { id: "is-the-morning-possible", text: "Is the morning possible?", es: "¿Puede ser por la mañana?" },
    { id: "do-i-need-to-bring-anything", text: "Do I need to bring anything?", es: "¿Tengo que llevar algo?" },
    { id: "cant-make-it-on-friday", text: "I can't make it on Friday.", es: "El viernes no puedo.", tip: "'Make it' es poder ir. Es lo que se dice para cancelar." },
    { id: "can-i-come-earlier", text: "Can I come earlier?", es: "¿Puedo venir antes?" },
  ],
  // C1. Phase 4 (CONT-04, D-04) RE-SELECTED this bank rather than extending it.
  //
  // The six phrases that stood here — piece of cake, call it a day, under the
  // weather, hit the nail on the head, on the same page, break a leg — were
  // RETIRED at 04-03 Task 1 by an explicit human decision, each recorded in
  // scripts/fixtures/scheduled-item-ids.json under "retired" with its reason.
  // None may ever return. They were not edited in place: re-pointing an id
  // moves a learner's box and due date onto material she has never seen, so the
  // only legal replacement is delete-the-old-id, add-a-new-one-with-its-own-
  // slug. Every id below is therefore new.
  //
  // WHY re-selected and not merely lengthened. Research (04-RESEARCH §1) found
  // those six were almost exactly the classic "core idioms" — which corpus
  // linguistics repeatedly shows to be the RAREST phraseology in English (Grant
  // 2005: none of 104 reaches the top 5,000 items; 0.14–0.25 per million
  // words). Twenty more canonical idioms would have made the bank longer and no
  // more native. So the criterion changed, and the criterion is the work:
  //
  //   1. FREQUENCY-ATTESTED, not dictionary-attested — a native would produce
  //      it this month. The class to aim at is Martinez & Schmitt's PHRASE List:
  //      mundane discourse formulae that are non-transparent but DECOMPOSABLE.
  //      Fully opaque set-piece idioms are what this bank was rescued from.
  //   2. REGISTER-MARKED, and the mark is part of the item. Every one of the
  //      eighteen carries a tip that says who says it, to whom, and what getting
  //      that wrong costs. A tip that translates the expression does not count
  //      and FAILS the harness (MIN_TIP_WORDS, and the no-verbatim-`es` rule).
  //   3. CHOSEN BECAUSE A C1 LEARNER GETS THAT PARTICULAR THING WRONG, which
  //      for idiom is over-use and mis-placement — deploying one where a plain
  //      sentence belongs. The briefing says "learn a few well rather than many
  //      badly" and the rehearsal drills exactly that, so eighteen items must
  //      not contradict them: a share of these are expressions whose whole value
  //      is that they are UNREMARKABLE, and the tips carry the restraint.
  //
  // TWO HARD EXCLUSIONS, both asserted by the harness:
  //   · Nothing here is one of the four expressions this scenario's own reading
  //     passage withholds — cross that bridge when we come to it, the writing is
  //     on the wall, clear the air, put my foot in it. Its glossary is silent on
  //     them ON PURPOSE so the reader has to recover them from context, which is
  //     the actual skill; glossing one here would convert a reading exercise
  //     into a memorised definition.
  //   · Nothing here repeats the scenario's deck or its briefing. Those surfaces
  //     are 04-04's and this bank leaves them a clean field.
  "native/idioms": [
    // ── Disagreeing without ever saying no ──────────────────────
    { id: "to-be-fair-she-did", text: "To be fair, she did tell us on Friday.", es: "Hay que reconocerlo: sí nos avisó el viernes.", tip: "'To be fair' introduce el dato que favorece a quien estás criticando, y por eso quien lo dice suena justo y no blando. Delante de un elogio no aporta nada y el nativo lo oye vacío." },
    { id: "true-up-to-a-point", text: "That's true up to a point.", es: "Eso es cierto hasta cierto punto.", tip: "Parece un acuerdo y es un desacuerdo: concede la mitad para quedarse con la otra. Entre colegas resulta elegante; a un cliente que espera un sí rotundo le suena a 'no' con buenos modales." },
    { id: "wouldnt-go-that-far", text: "I wouldn't go that far.", es: "Yo no diría tanto.", tip: "Es la forma más suave que tiene el inglés de decir 'eso es exagerado'. Va contra la afirmación, nunca contra la persona: si le añades 'you're wrong' detrás pierdes justo lo que habías comprado." },
    { id: "one-way-of-putting-it", text: "Well, that's one way of putting it.", es: "Bueno, esa es una forma de decirlo.", tip: "Literalmente admite la frase; en realidad la desaprueba. Con amigos es humor seco; en una reunión, con el aludido delante, es una pulla que oye todo el mundo. No lo digas si de verdad te parece bien dicho." },

    // ── The formula that manages the topic itself ───────────────
    { id: "at-the-end-of-the-day", text: "At the end of the day, it's her decision.", es: "A fin de cuentas, la decisión es suya.", tip: "Cierra la discusión apelando a lo único que de verdad pesa. Es tan frecuente que ya roza la muletilla: una vez por conversación convence, tres veces seguidas te delata como alguien que se ha quedado sin argumentos." },
    { id: "leave-it-at-that", text: "Let's leave it at that.", es: "Dejémoslo ahí.", tip: "No es 'terminemos por hoy' sino 'no añadamos nada más', y casi siempre porque lo siguiente sería peor. Dicho a tiempo salva una reunión; dicho a destiempo parece que escondes algo." },
    // `same-page` was RETIRED with the other five, but the expression itself was
    // always the best thing in the old bank — frequent, non-transparent and
    // decomposable, the PHRASE-List class exactly. What could not be saved was
    // the ITEM: its tip was a five-word frequency note, and amending a tip under
    // a live id is a re-point. So the expression comes back the only legal way,
    // under a NEW slug, as a question rather than an assertion — which is also
    // the more useful move, since asking lets the other person say no.
    { id: "are-we-on-the-same-page", text: "Are we on the same page here?", es: "¿Estamos hablando de lo mismo?", tip: "Comprueba que los dos entendéis lo mismo antes de seguir, y en pregunta —no en afirmación— porque así el otro puede decir que no sin tener que discutir. Entre colegas es prudencia; lanzado con retintín a quien acaba de contradecirte, se oye como un reproche." },
    { id: "long-story-short", text: "Long story short, we didn't go.", es: "Resumiendo: no fuimos.", tip: "Anuncia que te saltas el detalle, así que lo que viene detrás tiene que ser corto de verdad. Si después hablas dos minutos, el nativo lo registra como que no sabes editarte." },

    // ── Understatement doing the work of a strong statement ─────
    { id: "timing-isnt-ideal", text: "The timing isn't ideal.", es: "El momento no es el mejor.", tip: "Atenuación británica pura: 'not ideal' abarca desde 'un poco incómodo' hasta 'un desastre', y quien escucha calcula cuál por tu tono. Por escrito se lee siempre como el problema pequeño, así que no lo uses para el grande." },
    { id: "had-better-weeks", text: "I've had better weeks.", es: "He tenido semanas mejores.", tip: "Responde a 'how are you?' admitiendo que va mal sin contar nada y sin pedir consuelo. Con un compañero deja la puerta abierta por si quiere preguntar; con tu jefa deja el problema sin nombre y puede sonar a excusa." },
    { id: "hardly-the-end-of-the-world", text: "It's hardly the end of the world.", es: "Tampoco es una tragedia.", tip: "Quita hierro, y suele decirlo quien no ha sufrido el problema. De uno mismo tranquiliza; dicho del disgusto ajeno suena a que lo estás minimizando, que es lo contrario de consolar. No lo confundas con 'at the end of the day': se parecen por fuera y hacen cosas distintas, aquel resume y este resta importancia." },
    { id: "that-was-a-bit-much", text: "That was a bit much, wasn't it?", es: "Se pasó un poco, ¿no?", tip: "Critica el exceso sin nombrar a nadie: se dice de un comentario, de un precio o de una reacción, casi siempre después y en voz baja. A la cara de quien se pasó deja de ser un comentario y es una bronca." },

    // ── Who decides, and what you owe the other person ──────────
    { id: "not-my-call", text: "That one's not my call, I'm afraid.", es: "Eso no lo decido yo, lo siento.", tip: "'A call' aquí es una decisión, no una llamada. Sirve para declinar sin culpar a nadie, pero repetido demasiado te describe como alguien que nunca decide nada." },
    { id: "benefit-of-the-doubt", text: "I'd give her the benefit of the doubt.", es: "Yo le daría el beneficio de la duda.", tip: "Se concede cuando las pruebas no bastan para condenar a alguien. Entre amigos es generosidad; escrito en una evaluación de trabajo significa que dudas haberlas hay, y quien la lea lo entenderá así." },
    { id: "no-hard-feelings", text: "No hard feelings if you'd rather not.", es: "Sin rencores si prefieres que no.", tip: "Lo dice quien deja claro que no guardará rencor pase lo que pase, y por eso va ANTES del resultado. Dicho después de ganar suena a victoria disfrazada de cortesía, y el que ha perdido lo nota." },

    // ── The unremarkable ones, whose value is being unremarkable ─
    { id: "off-the-top-of-my-head", text: "Off the top of my head, about forty.", es: "Así de memoria, unos cuarenta.", tip: "Avisa de que la cifra es aproximada y de memoria, de modo que nadie te la exigirá luego. Es lo que se dice en lugar de inventar un número con aplomo: en el trabajo protege más que quedar rápido." },
    { id: "for-what-its-worth", text: "For what it's worth, I'd go.", es: "Por lo que valga mi opinión, yo iría.", tip: "Rebaja tu propia opinión antes de darla para que el otro pueda descartarla sin quedar mal. Es cortesía, no inseguridad; pero delante de un consejo importante suena a que ni tú te lo crees." },
    { id: "as-it-happens", text: "As it happens, I've just done that.", es: "Pues mira, precisamente acabo de hacerlo.", tip: "Introduce una coincidencia real y oportuna. Es de las expresiones cuyo valor está en no llamar la atención: aquí la frase corriente es la buena, y colocar un idiom de color en su lugar es exactamente el error que este escenario enseña a evitar." },
  ],
  // B2. Written to EXTEND the briefing, not restate it: the briefing already
  // demonstrates separability on "turn it down" and the get up / get on /
  // get over family, so neither appears here. One phrasal verb per line, in a
  // sentence a learner would actually say — the briefing's own method.
  //
  // Phase 4 (CONT-04) took this set from six to eighteen, and the twelve
  // additions are authored on a DIFFERENT rule from the first six: the unit is
  // verb + particle + SENSE, not verb + particle. Ten of the twelve are a
  // second or third sense of a verb this scenario already teaches somewhere —
  // `bring up` (raise a child, not raise a topic), `catch on` (understand, not
  // become popular), `pick up`, `run into`, `fall out`, `take on`, `get away`,
  // `look into`, `make up for`, `turn up` — because the frequent phrasal verbs
  // are heavily polysemous and what a C1 learner still gets wrong is the sense,
  // not the verb (04-RESEARCH §1.4: Gardner & Davies 2007; PHaVE 2015). The tip
  // is where the senses are told apart, and every one of the eighteen carries
  // one: a native-level tip says who says it, to whom, and what it costs to get
  // that wrong, never a Spanish gloss.
  //
  // Nothing here repeats the briefing, the eight existing cards or the five
  // grammar questions. The six original phrases are UNTOUCHED and always will
  // be: every id below is a live spaced-repetition key.
  "native/phrasal-verbs": [
    { id: "put-up-with", text: "Honestly, how do you put up with that noise?", es: "En serio, ¿cómo aguantas ese ruido?", tip: "'Put up with' es aguantar. Las tres palabras van siempre juntas: nunca se separan." },
    { id: "get-away-with", text: "He gets away with it every single time.", es: "Se sale con la suya siempre.", tip: "'Get away with' es hacer algo malo sin sufrir las consecuencias." },
    { id: "call-it-off", text: "They called the wedding off two weeks before.", es: "Cancelaron la boda dos semanas antes.", tip: "Separable: 'call the wedding off' o 'call it off', pero jamás 'call off it'." },
    { id: "bring-it-up", text: "I didn't want to bring it up in front of everyone.", es: "No quería sacar el tema delante de todos.", tip: "'Bring something up' es sacar un tema tú; 'come up' es que salga solo." },
    { id: "whats-he-getting-at", text: "What are you getting at, exactly?", es: "¿A dónde quieres llegar, exactamente?", tip: "'Get at something' es insinuar algo sin llegar a decirlo." },
    { id: "back-out-of-it", text: "They backed out of the deal at the last minute.", es: "Se echaron atrás en el acuerdo en el último momento.", tip: "'Back out of something' es retirarse de algo ya acordado." },
    { id: "get-away-for-a-few-days", text: "We're trying to get away for a few days before term starts.", es: "Estamos intentando escaparnos unos días antes de que empiece el curso.", tip: "'Get away' a secas es irse de escapada; con 'with' es librarse del castigo. A tu jefa dile el primero: el segundo le cuenta que te has salido con la tuya." },
    { id: "brought-up-in-leeds", text: "She was brought up in Leeds, so she says 'bath' the short way.", es: "Se crio en Leeds, así que dice 'bath' con la 'a' corta.", tip: "Segundo sentido de 'bring up': criar. Casi siempre en pasiva — 'I was brought up…' —, y contado así suena a biografía; 'my parents educated me' suena a expediente académico." },
    { id: "catch-on-understand", text: "Don't spell it out — he'll catch on.", es: "No se lo expliques con detalle: ya lo pillará.", tip: "Aquí 'catch on' es entender, no ponerse de moda. Dicho de alguien presente es un cumplido; con retintín ('he finally caught on') es una pulla que se nota." },
    { id: "taken-on-too-much", text: "I've taken on too much this month, honestly.", es: "La verdad es que he asumido demasiado este mes.", tip: "'Take on' es aceptar carga de trabajo. Ante un jefe reconoce un límite y suena responsable; el formal 'assume' aquí suena a informe escrito, no a persona hablando." },
    // `ran-into-at-the-airport` stood here and was RETIRED at 04-01 Task 3, not
    // edited: social/small-talk's deck already teaches `run into` in the same
    // sense, so two scenarios were being handed the same material (D-01). The
    // id is recorded in scripts/fixtures/scheduled-item-ids.json under
    // "retired" with that reason and may never be reused — the replacement
    // below carries its own slug, because re-pointing an id moves a learner's
    // box and due date onto material she has never seen.
    { id: "didnt-think-wed-pull-it-off", text: "I honestly didn't think we'd pull it off.", es: "La verdad, no pensaba que lo fuéramos a conseguir.", tip: "'Pull something off' es lograr algo difícil contra pronóstico. De otra persona es un elogio fuerte; de uno mismo suena a fanfarronada, así que casi siempre va en pasado y en plural: 'we pulled it off'." },
    { id: "fell-out-over-something", text: "They fell out over something and neither will say what.", es: "Se enemistaron por algo y ninguno de los dos dice por qué.", tip: "'Fall out with someone' es romper la relación, no discutir un rato. Dicho de dos compañeros delante de terceros ya es cotilleo, así que se dice bajito o no se dice." },
    { id: "wound-up-staying", text: "We wound up staying till two in the morning.", es: "Acabamos quedándonos hasta las dos de la mañana.", tip: "'Wind up' (/waɪnd/, pasado 'wound' /waʊnd/) es acabar de una forma que no planeaste. En una anécdota suena divertido; de un contrato, a desastre." },
    { id: "picked-up-in-a-kitchen", text: "I picked up most of my Italian in a kitchen.", es: "Casi todo el italiano lo aprendí en una cocina.", tip: "'Pick up' un idioma es cogerlo sin estudiarlo. Presume de facilidad, así que dicho de algo que sí estudiaste suena a falsa modestia y el nativo lo nota." },
    { id: "went-through-with-it", text: "I nearly cancelled, but I went through with it.", es: "Casi lo cancelo, pero al final seguí adelante.", tip: "'Go through with' es cumplir lo que te daba miedo; 'go through' a secas es pasar por un mal trago. Sobra o falta la preposición y pasas de valiente a víctima." },
    { id: "turned-up-an-hour-late", text: "He turned up an hour late with no explanation.", es: "Apareció una hora tarde y sin dar explicaciones.", tip: "'Turn up' es aparecer, normalmente sin avisar. De una persona es un reproche contenido; de algo perdido es alivio: 'it turned up in the car'." },
    { id: "look-into-it", text: "Leave it with me and I'll look into it.", es: "Déjamelo a mí y lo miro.", tip: "'Look into' es investigar, y en atención al cliente es la frase que compra tiempo sin prometer solución. 'Look over' es solo echar un vistazo: prometer eso a un cliente enfadado le suena a que no piensas hacer nada." },
    { id: "make-up-for-last-week", text: "Let me buy lunch to make up for last week.", es: "Déjame invitarte a comer para compensar lo de la semana pasada.", tip: "'Make up for' es compensar; 'make up' a secas es inventarse algo y 'make up with someone' es reconciliarse. Ofrecer compensación reconoce la deuda sin tener que pedir perdón otra vez." },
  ],
  // B2, and DELIBERATELY THE SMALLEST OF THE FIVE SOUNDING-NATIVE SETS —
  // twelve phrases where its neighbours hold eighteen, and sixteen cards where
  // they hold twenty-four or forty-two. That is a judgement, not an oversight,
  // and it is written here so no later reader mistakes it for one.
  //
  // WHY. The drills pronunciation actually needs are minimal pairs as an
  // exercise, word stress as an exercise and intonation as an exercise — and
  // those are precisely the new drill components this phase's D-01 rules out.
  // Under that decision the only shapes available here are a warm-up line and a
  // recall card, so volume buys less in this scenario than in any other: a
  // thirteenth tongue-twister teaches nothing a sixth did not. Padding this set
  // to the same floor as `native/idioms` or `native/culture` would imply the
  // five scenarios were deepened equally when they were not, which is a claim
  // made with content instead of with words. The phase says so instead.
  //
  // WHAT WOULD CHANGE THE VERDICT: the deferred premium TTS/STT work (VOICE-01,
  // v2 backlog). This scenario's whole feedback loop today is the browser
  // recogniser plus the learner's own ear, and PronunciationLab scores an
  // attempt WORD BY WORD against what the recogniser returned — it cannot hear
  // a vowel length, an aspiration or a stress position, only whether the word
  // came back. A real voice model would make every drill D-01 rejected buildable
  // and would make this the cheapest scenario to deepen rather than the dearest.
  // Named here as evidence for that case; NOT acted on in this phase.
  //
  // THE TWO SHAPES IN THIS SET, AND THE SECOND IS THE ONE TO COPY:
  //
  //  1. The first five entries are TONGUE-TWISTERS. `scenario-vocabulary.ts`'s
  //     own header calls that "a legitimate shape for this scenario and a poor
  //     model for anything else", and it is right on both halves. They stay,
  //     untouched, and NOTHING WAS ADDED IN THAT SHAPE — six more would be
  //     volume with no gain.
  //  2. `ship-sheep` is the one entry that is not a twister, and it is the best
  //     item in the set for exactly that reason: the contrast sits inside an
  //     ordinary sentence, so the recogniser has a real WORD to get right or
  //     wrong and the learner's score means something. The six additions below
  //     all follow it — a sentence somebody would actually say to another
  //     person, with the contrast on a word whose mis-articulation produces a
  //     DIFFERENT WORD and therefore a different meaning.
  //
  // THIS IS NOT A MINIMAL-PAIRS COMPONENT AND MUST NOT BE READ AS ONE. The
  // deferred item under D-01 is a new drill with a new renderer; this adds
  // neither. It is six more entries in the array `PronunciationLab` has always
  // rendered, authored on the model of an item that was already in this bank.
  //
  // The contrasts are the ones a Spanish speaker loses meaning on: /v/ against
  // /b/ (no /v/ exists in Spanish), the two dental fricatives against their
  // nearest neighbours, an initial s-cluster that invites a vowel in front of
  // it, a final voiced consonant that carries a tense, and the stress shift that
  // turns a noun into a verb. `es` names the contrast in the parenthetical style
  // this set already uses rather than pretending a drill line has a translation,
  // and every `tip` says what the MOUTH does, never what the sentence means.
  //
  // The short/long vowel pair was ALSO on the list and was cut: `ship-sheep`
  // below already teaches it, and the gloss drafted for it turned out to be a
  // word-for-word permutation of that live entry's own `es`. Measured before it
  // was written; /v/–/b/ took its slot because nothing in this bank covers it.
  //
  // The six original entries are UNTOUCHED in every field and always will be:
  // each id is a live spaced-repetition key and the fixture's hash covers the
  // whole record, so rewriting even a tip under one of them is a re-point.
  "native/pronunciation": [
    { id: "seashells", text: "She sells seashells by the seashore.", es: "(trabalenguas de la 's/sh')", tip: "Distingue /s/ de /ʃ/." },
    { id: "thirty-three-thieves", text: "The thirty-three thieves thought they thrilled the throne.", es: "(la 'th')", tip: "Saca la lengua para la /θ/." },
    { id: "red-lorry", text: "Red lorry, yellow lorry.", es: "(la 'r' y la 'l')" },
    { id: "peter-piper", text: "Peter Piper picked a peck of pickled peppers.", es: "(la 'p' aspirada)", tip: "Suelta aire en cada 'p' inicial." },
    { id: "brown-cow", text: "How now, brown cow.", es: "(el diptongo /aʊ/)", tip: "Abre la boca y ciérrala hacia la 'u'." },
    { id: "ship-sheep", text: "This ship is full of sheep.", es: "(la /ɪ/ corta frente a la /iː/ larga)", tip: "'Ship' corta, 'sheep' larga — cambia el significado." },
    // ── SIX SENTENCES SOMEBODY WOULD ACTUALLY SAY ── each one puts its
    // contrast on a word the recogniser has to return, so a wrong articulation
    // comes back as a different word and the score means something.
    { id: "taking-the-dog-to-the-vet", text: "I'm taking the dog to the vet tomorrow.", es: "(la /v/ labiodental frente a la /b/)", tip: "Muerde un poco el labio de abajo con los dientes de arriba y deja pasar el aire: eso es la /v/, y en español no existe. Si juntas los dos labios sale 'bet', y entonces has dicho que apuestas, no que llevas al perro." },
    { id: "thursday-not-tuesday", text: "I thought we said Thursday, not Tuesday.", es: "(la /θ/ frente a la /t/)", tip: "La punta de la lengua asoma entre los dientes en 'thought' y en 'Thursday'. Si la apoyas por detrás, lo que oye el otro es 'Tuesday', y esa es justo la confusión que te hace aparecer dos días antes de la reunión." },
    { id: "hang-those-clothes-up", text: "Hang those clothes up — they're still damp.", es: "(la /ð/ sonora frente a la /d/)", tip: "Misma lengua entre los dientes que en 'think', pero con la garganta vibrando: 'those', 'clothes' y 'they're' llevan las tres esa /ð/. Con una /d/ dura quedan en 'doze' y en 'close', y ya no hay ropa en la frase." },
    { id: "state-school-not-estate", text: "It's a state school, not a private one.", es: "(el grupo 'st-' inicial, sin vocal delante)", tip: "Arranca directamente en la 's', sin coger impulso: en inglés el grupo 'st-' abre la palabra. La 'e' que se cuela delante te deja en 'estate', que es una urbanización y no un tipo de colegio." },
    { id: "send-an-update-every-friday", text: "I send an update every Friday morning.", es: "(la /d/ final sonora frente a la /t/)", tip: "La /d/ del final de 'send' vibra y alarga un poco la vocal de delante. Ensordecida suena 'sent', y ahí el sonido se lleva puesto el tiempo verbal: has contado algo que hiciste una vez en lugar de lo que haces cada semana." },
    { id: "record-it-and-a-record", text: "Someone should record this — I want a record of what he actually said.", es: "(el acento en la segunda sílaba del verbo y en la primera del sustantivo)", tip: "Verbo re-CORD, sustantivo RE-cord: la misma palabra con el peso en otra sílaba y en otra categoría. Aviso honesto — el corrector de esta pantalla puntúa palabra a palabra y no oye dónde cae el acento, así que esta la juzgas tú con el botón de escuchar." },
  ],
  // C1, and deliberately in CONTRASTING PAIRS rather than as a flat list —
  // register is a dial, and a single line cannot show a dial moving. NINE
  // situations, each said twice: a request, an apology, a refusal (the three
  // this set opened with at Phase 3), then bad news, a chase-up, a
  // disagreement, an ask for more time, a piece of praise and a correction.
  //
  // THREE RULES THIS ARRAY OBEYS, AND THE THIRD IS LOAD-BEARING IN CODE:
  //
  //  1. The two halves of a pair carry the SAME FACTS. Softening the content
  //     out of the polite version is the real-world failure the scenario
  //     exists to prevent, and its writing task says so in as many words.
  //  2. They differ in ways the learner can NAME — a contraction against a
  //     full form, `till` against `until`, a direct ask against a distancing
  //     past, an active subject against an agentless passive. A pair whose
  //     only difference is politeness teaches nothing, and this scenario's own
  //     rehearsal explicitly forbids "more polite" as an answer.
  //  3. ADJACENCY CARRIES THE PAIRING AND NOTHING ELSE DOES. Both renderers
  //     (PronunciationLab and RecallDeck) walk this array in order, and no
  //     field records which entry pairs with which — so a pair is legible only
  //     while its casual half sits immediately before its formal half. Insert
  //     a new pair as two consecutive entries, casual first, keeping the
  //     `casual-` / `formal-` slug prefixes. verify-scenario-content.mts
  //     asserts the even length, the alternation and the adjacency, so an
  //     insertion that breaks the contrast fails loudly instead of silently.
  "native/register": [
    { id: "casual-send-it-over", text: "Can you send it over when you get a sec?", es: "¿Me lo pasas cuando tengas un momento?", tip: "Casual: contracción, 'a sec' y un verbo corto. Perfecto entre compañeros." },
    { id: "formal-earliest-convenience", text: "Would you be able to forward it at your earliest convenience?", es: "¿Podría remitírmelo lo antes posible?", tip: "Formal: la misma petición. 'At your earliest convenience' es cortés y a la vez marca urgencia." },
    { id: "casual-my-bad", text: "Sorry, my bad — I'll fix it now.", es: "Perdona, culpa mía; lo arreglo ahora.", tip: "'My bad' asume la culpa en dos palabras, y nunca se escribe a un cliente." },
    { id: "formal-apologise-oversight", text: "I apologise for the oversight; it has been corrected.", es: "Le pido disculpas por el descuido; ya está corregido.", tip: "Formal: sin contracciones y en pasiva, que aparta a la persona del error." },
    { id: "casual-not-going-to-work", text: "Yeah, that's not going to work for us.", es: "Ya, eso no nos va a funcionar.", tip: "Ese 'yeah' de apertura reconoce lo dicho antes de rechazarlo." },
    { id: "formal-wont-be-possible", text: "I'm afraid that won't be possible on this occasion.", es: "Me temo que no va a ser posible en esta ocasión.", tip: "'I'm afraid' es el amortiguador estándar de una negativa formal en inglés." },
    // Pair 4 — BAD NEWS. The mark is where the softening goes: in the form
    // ('Unfortunately' at the front) and never in the fact.
    { id: "casual-slight-problem-friday", text: "Right, slight problem — we're not going to hit Friday.", es: "A ver, un problemilla: no vamos a llegar al viernes.", tip: "Ese 'slight problem' encoge la noticia antes de darla, y 'we're not going to' la dice en activo, con sujeto. Entre compañeros suena honesto y rápido; a quien te paga, 'slight' suena a que le quitas importancia a algo que le cuesta dinero." },
    { id: "formal-friday-no-longer-realistic", text: "Unfortunately, the Friday date is no longer realistic.", es: "Lamentablemente, la fecha del viernes ya no es realista.", tip: "'Unfortunately' abriendo la frase avisa de la mala noticia antes de darla, y por escrito eso ya es medio punto de cortesía. Lo que no hace es tocar el hecho: el amortiguador va en la forma y nunca en los datos." },
    // Pair 5 — CHASING SOMETHING OVERDUE. The mark is whether the line leaves
    // a record: a date said in full turns a nudge into evidence.
    { id: "casual-any-joy-with-those-figures", text: "Any joy with those figures yet?", es: "¿Se sabe ya algo de esas cifras?", tip: "'Any joy?' reclama algo pendiente sin acusar a nadie: es informal británico y de compañero a compañero. Por escrito a un proveedor no se lee como reclamación, y luego no tienes nada que enseñar." },
    { id: "formal-still-awaiting-those-figures", text: "We are still awaiting the figures requested on the 4th.", es: "Seguimos a la espera de las cifras solicitadas el día 4.", tip: "'Still awaiting' más la fecha convierte el recordatorio en registro escrito: es lo que se manda cuando la siguiente llamada puede acabar en queja. Dicho al compañero de al lado suena a expediente." },
    // Pair 6 — DISAGREEING WITH A DECISION. The mark is a nominalisation:
    // 'reservations' is a thing you have, 'I disagree' is a thing you do.
    { id: "casual-not-sold-on-that", text: "I'm not sold on that, to be honest.", es: "No me convence, la verdad.", tip: "'Not sold on something' discrepa entre iguales: dice que no te convence sin decir que está mal. Hacia arriba en la jerarquía suena a que estás valorando una compra, no una decisión de tu jefa." },
    { id: "formal-reservations-about-the-approach", text: "I do have some reservations about the approach.", es: "Sí tengo algunas reservas sobre este enfoque.", tip: "El 'do' enfático concede antes de discrepar, y 'reservations' evita decir 'I disagree'. Es la discrepancia que se puede dejar por escrito; entre amigos suena a acta de reunión." },
    // Pair 7 — ASKING FOR MORE TIME. The mark is the distancing past: 'I was
    // wondering' is happening now, and the tense is there to shrink the ask.
    { id: "casual-give-me-till-monday", text: "Could you give me till Monday on this?", es: "¿Me lo puedes dejar para el lunes?", tip: "'Till' en vez de 'until' y la petición directa con 'could you': entre compañeros es rapidez, no descaro. En un correo a un cliente, un 'till' escrito es lo que delata que has escrito como hablas." },
    { id: "formal-wondering-about-an-extension", text: "I was wondering whether an extension until Monday might be possible.", es: "Quería consultarle si sería posible una prórroga hasta el lunes.", tip: "El pasado que aleja: 'I was wondering' no habla de ayer, hace pequeña la petición de ahora. Encadenado con 'might be possible' es lo normal hacia fuera; entre compañeros suena a que pides un riñón." },
    // Pair 8 — GIVING CREDIT. Both halves name Marta and both give her the
    // whole of it; what moves is whether the praise survives in writing.
    { id: "casual-nice-one-that-was-all-you", text: "Nice one, Marta — that was all you.", es: "¡Muy bien, Marta! Eso ha sido cosa tuya.", tip: "'Nice one' es el elogio corto entre iguales, y 'that was all you' da el mérito entero sin repartirlo. Dicho delante del equipo vale más que un correo; escrito a un cliente no se entiende." },
    { id: "formal-acknowledge-martas-part", text: "I would like to acknowledge Marta's part in this, which was decisive.", es: "Quisiera reconocer la aportación de Marta, que ha sido decisiva.", tip: "'Acknowledge' con el nombre completo es el elogio que queda por escrito y que cuenta en una evaluación. Dicho de viva voz en una comida suena a discurso." },
    // Pair 9 — CORRECTING A MISTAKE. The sharpest contrast in the set: 'you'
    // plus an active verb against an agentless passive that removes the
    // person from the sentence entirely.
    { id: "casual-cced-the-wrong-sarah", text: "I think you've cc'd the wrong Sarah.", es: "Creo que has puesto en copia a la Sarah equivocada.", tip: "Ese 'I think' delante no es duda: es el amortiguador que deja al otro corregirse solo. Aun así el sujeto sigue siendo 'you', así que esto se dice en privado o entre iguales." },
    { id: "formal-appears-to-have-been-copied", text: "The message appears to have been copied to the wrong recipient.", es: "Parece que el mensaje se envió en copia al destinatario equivocado.", tip: "La pasiva sin agente aparta a la persona de la frase: nadie se ha equivocado, algo ha ocurrido. Es la forma estándar de corregir hacia arriba o hacia fuera; entre amigos suena a que abres un expediente." },
  ],
  // C1. Not the references themselves — those date, and the briefing already
  // gives two — but what she says when one lands and she does not catch it.
  //
  // THE RULE THIS SET OBEYS, AND IT IS THE SCENARIO'S WHOLE DESIGN CONSTRAINT:
  // NOTHING HERE HAS A SHELF LIFE. Not one entry's meaning depends on a film, a
  // song, a programme, an advert, a person or a year. A culture bank built out
  // of the references themselves would be stale before a learner reached it —
  // this one is built out of the MACHINERY of a missed reference, which does
  // not date. If an item would need a footnote in five years, it does not go in.
  //
  // Eighteen repairs across three axes, because a repair is only right for one
  // room at one speed:
  //
  //   THE ROOM. What works at lunch with four friends is wrong in a meeting,
  //   wrong on a call where nobody can read your face, wrong in a group chat
  //   where the moment has already gone, and wrong with someone senior who
  //   assumed you would get it.
  //
  //   THE SPEED. Sometimes the repair has to be instant and invisible — answer
  //   the point, not the reference, and look nothing up. Sometimes it can be
  //   open. Sometimes the right move is to let the moment go entirely, and the
  //   phrase is what you say two turns later.
  //
  //   THE DIRECTION. She is not only the person who misses one. She is also the
  //   person whose own reference lands on nobody, the person who can rescue
  //   somebody else's, and the person who offers one back and hands the turn on.
  //
  // THE TIP IS THE USE NOTE, never a translation of the line: who this works
  // with, when it would sound like an excuse, and what it costs in the wrong
  // room. And NOTHING HERE NAMES A REFERENCE THE SCENARIO'S READING PASSAGE
  // ASKS THE READER TO RECOVER — that passage insures its references by context
  // on purpose, and glossing one here would turn a reading exercise into recall.
  // verify-scenario-content.mts asserts both properties.
  "native/culture": [
    { id: "is-that-from-something", text: "Is that from something, or did you just make it up?", es: "¿Eso es de algo, o te lo acabas de inventar?", tip: "La forma natural de preguntar por una referencia sin admitir que no la pillas." },
    { id: "before-my-time", text: "That one's a bit before my time.", es: "Eso es un poco anterior a mi época.", tip: "Excusa impecable para no conocer una referencia: la culpa es de la fecha, no tuya." },
    { id: "everyone-quotes-that-line", text: "Everyone quotes that line and nobody's seen the film.", es: "Todo el mundo cita esa frase y nadie ha visto la película.", tip: "Observación muy inglesa: la referencia sobrevive a su origen." },
    { id: "had-to-look-it-up", text: "I had to look that one up afterwards.", es: "Esa la tuve que buscar después.", tip: "'Look something up' es buscarlo en un diccionario o en internet." },
    { id: "had-to-be-there", text: "I guess you had to be there.", es: "Supongo que había que estar allí.", tip: "Se dice cuando cuentas algo gracioso y no funciona fuera de contexto." },
    { id: "if-you-know-you-know", text: "If you know, you know.", es: "El que lo sepa, lo sabe.", tip: "Por escrito se abrevia 'IYKYK'. Marca una referencia deliberadamente de nicho." },

    // ── THE ROOM ── the same admission, priced differently in four places.
    { id: "got-the-tone-not-the-reference", text: "I got the tone but not the reference — keep going, I'll catch up.", es: "He pillado el tono pero no la referencia; sigue, ya te alcanzo.", tip: "En una reunión, donde parar la sala cuesta dinero: reconoces el vacío y devuelves el turno en la misma frase, así que nadie se detiene por ti. Entre amigos suena a que no quieres la explicación, y a veces sí la quieres." },
    { id: "give-me-that-one-again", text: "Sorry — you'll have to give me that one again.", es: "Perdona, esa me la vas a tener que repetir.", tip: "Por teléfono nadie te ve la cara, así que la confusión hay que decirla en voz alta o no existe. Pides la frase entera, no la explicación: el otro la repite y tú decides si te hace falta más. En persona, con el gesto ya puesto, sobra." },
    { id: "scrolled-back-twice", text: "I've scrolled back twice and I still don't get it.", es: "He vuelto a leerlo dos veces y sigo sin pillarlo.", tip: "Para un grupo de mensajes, donde el momento ya pasó y preguntar no interrumpe a nadie. Enseña que lo has intentado antes de preguntar, que es lo que evita que suene a pereza. En vivo no sirve: no hay nada que releer." },
    { id: "new-one-on-me", text: "That's a new one on me.", es: "Esa no la había oído nunca.", tip: "Hacia arriba, con quien daba por hecho que lo pillarías: en plano, sin disculpa y sin chiste, cierra el asunto en tres segundos y de paso suena a interés. Lo que no admite es repetirlo cada cuarto de hora; a la tercera deja de ser franqueza." },

    // ── THE SPEED ── invisible, open, delayed, and the one that arrives late.
    { id: "whatever-thats-from", text: "Whatever that's from, you're right about the second half.", es: "Venga de donde venga, tienes razón en la segunda parte.", tip: "La reparación invisible: contestas al argumento en lugar de a la referencia y la conversación no se detiene. Vale en cualquier sala y tiene un precio: te quedas sin saber qué era, porque ya nadie va a volver sobre ello." },
    { id: "what-am-i-missing", text: "Go on then — what am I missing?", es: "Venga, ¿qué me estoy perdiendo?", tip: "Abierta y rápida, con gente de confianza: ese arranque la convierte en curiosidad y no en reproche. Hacia arriba o delante de un cliente suena a que les encargas el trabajo de explicártelo." },
    { id: "go-back-a-second", text: "Actually, go back a second — what was the thing you said before?", es: "Espera, vuelve un momento: ¿qué era eso que has dicho antes?", tip: "La reparación tardía: dejas pasar el instante y lo recoges cuando la mesa ya ha cambiado de tema, así nadie repite una gracia para una sola persona. Pasadas dos o tres intervenciones ya no se sostiene." },
    { id: "ten-seconds-behind", text: "Don't mind me — I'm always about ten seconds behind.", es: "No me hagas caso, siempre voy diez segundos por detrás.", tip: "Se dice a toro pasado y sobre una misma: admite lo que ya se ha visto y de paso lo convierte en broma propia. Con desconocidos llama la atención justo sobre unos segundos que nadie había contado." },

    // ── THE OTHER DIRECTION ── hers lands on nobody, she rescues somebody
    // else's, she offers one back, and then she gets the room off the subject.
    { id: "doesnt-travel", text: "Sorry, that doesn't travel — it only works where I'm from.", es: "Perdona, esa no viaja: solo funciona en mi tierra.", tip: "Para cuando la que no aterriza es la tuya. Llamarla intraducible es más rápido que explicarla y devuelve el turno a la mesa; contarla entera la mata y además gasta un minuto que nadie te había dado." },
    { id: "i-got-it-even-if-nobody-else-did", text: "I got it, even if nobody else did.", es: "Yo sí la he pillado, aunque los demás no.", tip: "Esta no es para cuando fallas tú, sino para cuando la referencia de otro cae en el vacío y tú eras el único que la tenía. Rescata a quien la soltó y no cuesta nada; dicha con retintín, subraya que los demás no llegaron." },
    { id: "same-job-back-home", text: "We've got one that does the same job back home.", es: "En mi tierra tenemos una que sirve para lo mismo.", tip: "Convierte el hueco en intercambio: en lugar de quedarte fuera, pones una tuya al lado. Funciona con quien quiere oírla; en una reunión con prisa alarga un turno que ya se estaba cerrando." },
    { id: "held-everybody-up-enough", text: "Right, sorted — I've held everybody up enough.", es: "Vale, ya está; que os he parado bastante.", tip: "Cierra la reparación para que la mesa no se quede otro minuto contigo de tema. Una vez es cortesía; cada vez que preguntas algo, te convierte justo en el asunto del que querías salir." },
  ],
};

/**
 * Every key the curated bank actually holds.
 *
 * Exported for scripts/verify-scenario-content.mts alone: iterating the
 * curriculum only ever finds keys that ARE scenarios, so a typo'd key like
 * `"travel/resturant"` would sit here forever, silently serving nobody. This
 * is how the harness sees it.
 */
export function scenarioPhraseKeys(): string[] {
  return Object.keys(SETS);
}

/**
 * The ONLY accessor: a scenario's own curated set, or nothing.
 *
 * `undefined` means "this scenario has no phrases of its own" and is the whole
 * point — the coverage registry counts what the bank HOLDS, so it could never
 * report 35 of 35 on the day nine of them are written. There is deliberately no
 * lenient sibling: a caller that wants a list rather than an absence coalesces
 * to `[]` at its own call site, which shows an empty warm-up rather than
 * another scenario's phrases.
 */
export function getScenarioPhrases(
  worldSlug: string,
  scenarioSlug: string,
): Phrase[] | undefined {
  return SETS[`${worldSlug}/${scenarioSlug}`];
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
  { id: "tt-seashells", text: "She sells seashells by the seashore.", es: "(trabalenguas /s/ vs /ʃ/)", tip: "Distingue 's' de 'sh'." },
  { id: "tt-red-lorry", text: "Red lorry, yellow lorry.", es: "(la 'r' y la 'l')", tip: "No las mezcles." },
  { id: "tt-thirty-three-thieves", text: "The thirty-three thieves thought they thrilled the throne.", es: "(la 'th')", tip: "Saca la lengua para /θ/." },
  { id: "tt-ice-cream", text: "I scream, you scream, we all scream for ice cream.", es: "(ritmo y enlace)", tip: "Enlaza las palabras." },
  { id: "tt-could-would-should", text: "Could you, would you, should you?", es: "(modales débiles)", tip: "Pronuncia 'd' suave." },
];

// Every key below is curated and asserted non-empty by the content harness
// ("every scenario resolves to its own phrase set"), so the `?? []` can only be
// reached by deleting a set — in which case this pack shrinks rather than
// silently serving another scenario's lines.
export const SPEAKING_PACKS: SpeakingPack[] = [
  {
    id: "greetings",
    title: "Greetings & small talk",
    level: "B1",
    blurb: "Break the ice and keep a casual chat going.",
    phrases: [
      ...(getScenarioPhrases("social", "small-talk") ?? []),
      ...(getScenarioPhrases("social", "making-friends") ?? []),
    ],
  },
  {
    id: "travel",
    title: "Travel essentials",
    level: "A2",
    blurb: "Airport, restaurant and getting around.",
    phrases: [
      ...(getScenarioPhrases("travel", "airport") ?? []),
      ...(getScenarioPhrases("travel", "restaurant") ?? []),
      ...(getScenarioPhrases("travel", "directions") ?? []),
    ],
  },
  {
    id: "work",
    title: "At work",
    level: "B2",
    blurb: "Interviews and meetings, said with confidence.",
    phrases: [
      ...(getScenarioPhrases("work", "interviews") ?? []),
      ...(getScenarioPhrases("work", "meetings") ?? []),
    ],
  },
  {
    id: "sounds",
    title: "Tricky sounds",
    level: "B2",
    blurb: "Drills for the sounds Spanish speakers find hardest.",
    phrases: [
      ...(getScenarioPhrases("native", "pronunciation") ?? []),
      ...TONGUE_TWISTERS,
    ],
  },
  {
    id: "idioms",
    title: "Idioms",
    level: "C1",
    blurb: "Everyday expressions that make you sound native.",
    phrases: getScenarioPhrases("native", "idioms") ?? [],
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
