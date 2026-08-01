// Speaking warm-up phrases per scenario, used by PronunciationLab.
// Keyed by `${worldSlug}/${scenarioSlug}`.
//
// TWO accessors live here on purpose and they are NOT interchangeable:
//
//   getScenarioPhrases()  — strict. Returns `undefined` for a scenario with no
//                           curated set. This is the one a scenario page and
//                           the coverage registry read, because "this scenario
//                           has no phrases of its own" has to be sayable.
//   getPhrases()          — lenient, kept for the global speaking page and the
//                           speaking packs only. Falls back to a per-world
//                           generic set. Deleted by plan 03-11 once all 35
//                           scenarios have their own set (03-04 closes that).

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
  "native/idioms": [
    { id: "piece-of-cake", text: "It's a piece of cake.", es: "Es pan comido.", tip: "Idiom: algo muy fácil." },
    { id: "call-it-a-day", text: "Let's call it a day.", es: "Dejémoslo por hoy." },
    { id: "under-the-weather", text: "I'm under the weather.", es: "No me siento bien." },
    { id: "hit-the-nail", text: "You hit the nail on the head.", es: "Diste en el clavo." },
    { id: "same-page", text: "We're on the same page.", es: "Estamos de acuerdo.", tip: "Muy frecuente en el trabajo." },
    { id: "break-a-leg", text: "Break a leg!", es: "¡Mucha suerte!" },
  ],
  // B2. Written to EXTEND the briefing, not restate it: the briefing already
  // demonstrates separability on "turn it down" and the get up / get on /
  // get over family, so neither appears here. One phrasal verb per line, in a
  // sentence a learner would actually say — the briefing's own method.
  //
  // Depth for this world — the fuller native-level treatment — is CONT-04 and
  // belongs to Phase 4. These six sit at the scenario's declared level.
  "native/phrasal-verbs": [
    { id: "put-up-with", text: "Honestly, how do you put up with that noise?", es: "En serio, ¿cómo aguantas ese ruido?", tip: "'Put up with' es aguantar. Las tres palabras van siempre juntas: nunca se separan." },
    { id: "get-away-with", text: "He gets away with it every single time.", es: "Se sale con la suya siempre.", tip: "'Get away with' es hacer algo malo sin sufrir las consecuencias." },
    { id: "call-it-off", text: "They called the wedding off two weeks before.", es: "Cancelaron la boda dos semanas antes.", tip: "Separable: 'call the wedding off' o 'call it off', pero jamás 'call off it'." },
    { id: "bring-it-up", text: "I didn't want to bring it up in front of everyone.", es: "No quería sacar el tema delante de todos.", tip: "'Bring something up' es sacar un tema tú; 'come up' es que salga solo." },
    { id: "whats-he-getting-at", text: "What are you getting at, exactly?", es: "¿A dónde quieres llegar, exactamente?", tip: "'Get at something' es insinuar algo sin llegar a decirlo." },
    { id: "back-out-of-it", text: "They backed out of the deal at the last minute.", es: "Se echaron atrás en el acuerdo en el último momento.", tip: "'Back out of something' es retirarse de algo ya acordado." },
  ],
  "native/pronunciation": [
    { id: "seashells", text: "She sells seashells by the seashore.", es: "(trabalenguas de la 's/sh')", tip: "Distingue /s/ de /ʃ/." },
    { id: "thirty-three-thieves", text: "The thirty-three thieves thought they thrilled the throne.", es: "(la 'th')", tip: "Saca la lengua para la /θ/." },
    { id: "red-lorry", text: "Red lorry, yellow lorry.", es: "(la 'r' y la 'l')" },
    { id: "peter-piper", text: "Peter Piper picked a peck of pickled peppers.", es: "(la 'p' aspirada)", tip: "Suelta aire en cada 'p' inicial." },
    { id: "brown-cow", text: "How now, brown cow.", es: "(el diptongo /aʊ/)", tip: "Abre la boca y ciérrala hacia la 'u'." },
    { id: "ship-sheep", text: "This ship is full of sheep.", es: "(la /ɪ/ corta frente a la /iː/ larga)", tip: "'Ship' corta, 'sheep' larga — cambia el significado." },
  ],
  // C1, and deliberately in CONTRASTING PAIRS rather than as a flat list —
  // register is a dial, and a single line cannot show a dial moving. Three
  // situations (a request, an apology, a refusal), each said twice.
  "native/register": [
    { id: "casual-send-it-over", text: "Can you send it over when you get a sec?", es: "¿Me lo pasas cuando tengas un momento?", tip: "Casual: contracción, 'a sec' y un verbo corto. Perfecto entre compañeros." },
    { id: "formal-earliest-convenience", text: "Would you be able to forward it at your earliest convenience?", es: "¿Podría remitírmelo lo antes posible?", tip: "Formal: la misma petición. 'At your earliest convenience' es cortés y a la vez marca urgencia." },
    { id: "casual-my-bad", text: "Sorry, my bad — I'll fix it now.", es: "Perdona, culpa mía; lo arreglo ahora.", tip: "'My bad' asume la culpa en dos palabras, y nunca se escribe a un cliente." },
    { id: "formal-apologise-oversight", text: "I apologise for the oversight; it has been corrected.", es: "Le pido disculpas por el descuido; ya está corregido.", tip: "Formal: sin contracciones y en pasiva, que aparta a la persona del error." },
    { id: "casual-not-going-to-work", text: "Yeah, that's not going to work for us.", es: "Ya, eso no nos va a funcionar.", tip: "Ese 'yeah' de apertura reconoce lo dicho antes de rechazarlo." },
    { id: "formal-wont-be-possible", text: "I'm afraid that won't be possible on this occasion.", es: "Me temo que no va a ser posible en esta ocasión.", tip: "'I'm afraid' es el amortiguador estándar de una negativa formal en inglés." },
  ],
  // C1. Not the references themselves — those date, and the briefing already
  // gives two — but what she says when one lands and she does not catch it.
  "native/culture": [
    { id: "is-that-from-something", text: "Is that from something, or did you just make it up?", es: "¿Eso es de algo, o te lo acabas de inventar?", tip: "La forma natural de preguntar por una referencia sin admitir que no la pillas." },
    { id: "before-my-time", text: "That one's a bit before my time.", es: "Eso es un poco anterior a mi época.", tip: "Excusa impecable para no conocer una referencia: la culpa es de la fecha, no tuya." },
    { id: "everyone-quotes-that-line", text: "Everyone quotes that line and nobody's seen the film.", es: "Todo el mundo cita esa frase y nadie ha visto la película.", tip: "Observación muy inglesa: la referencia sobrevive a su origen." },
    { id: "had-to-look-it-up", text: "I had to look that one up afterwards.", es: "Esa la tuve que buscar después.", tip: "'Look something up' es buscarlo en un diccionario o en internet." },
    { id: "had-to-be-there", text: "I guess you had to be there.", es: "Supongo que había que estar allí.", tip: "Se dice cuando cuentas algo gracioso y no funciona fuera de contexto." },
    { id: "if-you-know-you-know", text: "If you know, you know.", es: "El que lo sepa, lo sabe.", tip: "Por escrito se abrevia 'IYKYK'. Marca una referencia deliberadamente de nicho." },
  ],
};

const WORLD_FALLBACK: Record<string, Phrase[]> = {
  social: [
    { id: "w-social-nice-to-meet-you", text: "Nice to meet you.", es: "Encantado de conocerte." },
    { id: "w-social-how-have-you-been", text: "How have you been?", es: "¿Cómo has estado?" },
    { id: "w-social-keep-in-touch", text: "Let's keep in touch.", es: "Mantengámonos en contacto." },
  ],
  work: [
    { id: "w-work-get-back-to-you", text: "Let me get back to you on that.", es: "Te respondo sobre eso más tarde." },
    { id: "w-work-works-for-me", text: "That works for me.", es: "Me viene bien." },
    { id: "w-work-follow-up-by-email", text: "I'll follow up by email.", es: "Te escribo por correo para dar seguimiento." },
  ],
  travel: [
    { id: "w-travel-could-you-help-me", text: "Could you help me, please?", es: "¿Podría ayudarme, por favor?" },
    { id: "w-travel-how-much-is-it", text: "How much is it?", es: "¿Cuánto cuesta?" },
    { id: "w-travel-nearest-one", text: "Where's the nearest one?", es: "¿Dónde está el más cercano?" },
  ],
  academic: [
    { id: "w-academic-main-idea", text: "What's the main idea here?", es: "¿Cuál es la idea principal aquí?" },
    { id: "w-academic-in-other-words", text: "In other words...", es: "En otras palabras..." },
    { id: "w-academic-interesting-point", text: "That raises an interesting point.", es: "Eso plantea un punto interesante." },
  ],
  practical: [
    { id: "w-practical-report-a-problem", text: "I'd like to report a problem.", es: "Quisiera reportar un problema." },
    { id: "w-practical-put-me-through", text: "Could you put me through to support?", es: "¿Me pasa con soporte?" },
    { id: "w-practical-check-and-get-back", text: "Let me check and get back to you.", es: "Déjeme revisar y le aviso." },
  ],
  native: [
    { id: "w-native-to-be-honest", text: "To be honest with you...", es: "Para serte sincero..." },
    { id: "w-native-kind-of-depends", text: "It kind of depends.", es: "Más o menos depende." },
    { id: "w-native-makes-total-sense", text: "That makes total sense.", es: "Eso tiene todo el sentido." },
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
 * The STRICT accessor: a scenario's own curated set, or nothing.
 *
 * Read this — never `getPhrases` — from a scenario page or from the coverage
 * registry. `getPhrases` can never return empty, so a registry built on it
 * would report 35 of 35 scenarios covered on the day nine of them are.
 */
export function getScenarioPhrases(
  worldSlug: string,
  scenarioSlug: string,
): Phrase[] | undefined {
  return SETS[`${worldSlug}/${scenarioSlug}`];
}

/**
 * The LENIENT accessor, kept for the global speaking page and the speaking
 * packs below, and for nothing else.
 *
 * Its eight remaining call sites all pass curated keys, so none of them takes
 * the fallback branch — it stays only because deleting it now would leave the
 * 26 scenarios that have no curated set with nothing at all, and those sets do
 * not exist until plan 03-04. Plan 03-11 deletes it once they do.
 */
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
  { id: "tt-seashells", text: "She sells seashells by the seashore.", es: "(trabalenguas /s/ vs /ʃ/)", tip: "Distingue 's' de 'sh'." },
  { id: "tt-red-lorry", text: "Red lorry, yellow lorry.", es: "(la 'r' y la 'l')", tip: "No las mezcles." },
  { id: "tt-thirty-three-thieves", text: "The thirty-three thieves thought they thrilled the throne.", es: "(la 'th')", tip: "Saca la lengua para /θ/." },
  { id: "tt-ice-cream", text: "I scream, you scream, we all scream for ice cream.", es: "(ritmo y enlace)", tip: "Enlaza las palabras." },
  { id: "tt-could-would-should", text: "Could you, would you, should you?", es: "(modales débiles)", tip: "Pronuncia 'd' suave." },
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
