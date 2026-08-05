// The words the volume deck passes over, each declared with a reason.
//
// WHY THIS FILE EXISTS AT ALL. The whole justification for the volume tier is
// frequency coverage: the deck is worth building because it walks the New
// General Service List from the top, not because it holds five hundred nice
// words. Without a register, "which words" quietly stops being an NGSL decision
// and becomes an authoring convenience — five hundred cards drift towards the
// words that are easy to write an example for, and the coverage claim that
// justifies the phase stops being true with nothing failing. Silent
// cherry-picking is the failure mode; this file is the thing that makes it
// impossible to do silently.
//
// THE GATE. scripts/verify-scenario-content.mts asserts (plan 02) that for
// every rank below the deepest rank the deck has reached, the headword is
// EITHER in the deck OR in this register with a non-empty reason. So skipping a
// word costs one line here, and skipping one without saying so fails.
//
// THE REASONS ARE A CLOSED VOCABULARY — four of them, and adding a fifth is a
// decision, not a convenience. The fourth was added exactly that way: plan
// 04.1-04 hit `color`, could not gloss it honestly, shipped a fudge and
// RECORDED it as one; the user then decided `cognate` at 04.1-05, and only
// then was it declared here and used.
//
//   "function-word"
//     A closed-class grammatical word — article, pronoun, preposition,
//     conjunction, determiner, quantifier, modal, auxiliary, negator, or a
//     degree/focus/discourse particle. A recall card is front, back and one
//     example: it teaches LEXICAL meaning. A closed-class word's difficulty is
//     grammatical, and this app teaches grammar in /skill/grammar and in the
//     scenario grammar banks, where it can actually be drilled.
//     The line this draws, and it is drawn on purpose: temporal and manner
//     adverbs (`now`, `then`, `well`) are lexical and ARE carded; degree and
//     focus particles (`very`, `just`, `so`) are not.
//
//   "already-taught"
//     The word already has a card in a scenario vocabulary bank. The volume
//     tier is breadth; repeating a word that already has a register note and a
//     scenario around it would be strictly worse than the card that exists.
//
//   "no-base-form-example"
//     The word's own form cannot appear in a natural example — `go` in a
//     sentence that needs `went`. The harness's inflection matcher admits
//     house/houses and run/running and REFUSES go/went, deliberately: a card
//     whose example never shows the headword's own form teaches the word by
//     assertion. This register is that rule's escape hatch, which is why the
//     matcher must never be widened instead.
//
//   "cognate"
//     No honest Spanish gloss DIFFERS from the English word. `social` is
//     "social", `general` is "general", `total` is "total". A Spanish speaker
//     does not need a flashcard to learn that, and the card would exist only
//     to satisfy a rank.
//     WHY THIS IS A SKIP AND NOT A GLOSS. The quality floor asserts
//     `es !== word`, so such a card can only pass by appending a near-synonym
//     it does not need — "color / tono" — which makes the FRONT of the card a
//     small lie about what the learner is being asked to answer. Rank
//     completeness stays derived and total because this register absorbs the
//     word, which is exactly what the register is for.
//     WHERE THE LINE IS, AND IT IS NARROW. This is NOT for a word that merely
//     LOOKS Spanish. `local` → "del barrio / de la zona", `real` →
//     "auténtico / de verdad", `idea` → "ocurrencia", `individual` →
//     "individuo" and `particular` → "concreto" all have real, differing
//     Spanish and are all CARDED. Reach for this reason only when forcing a
//     gloss would produce a slash-fudge.
//
// No React, no hooks, no path aliases: this module is imported by
// scripts/verify-scenario-content.mts under `node --experimental-strip-types`
// AND BY NOTHING ELSE. It is harness input, not app content, so it never enters
// a client bundle — plan 02 asserts that from source rather than trusting it.

export type SkipReason =
  | "function-word"
  | "already-taught"
  | "no-base-form-example"
  | "cognate";

export interface SkippedHeadword {
  /** the NGSL headword, lowercase, exactly as the committed list spells it */
  word: string;
  reason: SkipReason;
}

/**
 * Ordered by NGSL rank, ascending — the same order the bank uses, so the two
 * files read as one walk down the list rather than as two unrelated sets.
 */
export const SKIPPED_HEADWORDS: SkippedHeadword[] = [
  { word: "the", reason: "function-word" }, // article
  // The copula, and the clearest case for the rule. Its Spanish difficulty is
  // ser vs estar: one English word, two Spanish verbs, chosen by grammar. A
  // card reading "be → ser / estar" would teach a learner nothing about which.
  { word: "be", reason: "function-word" },
  { word: "and", reason: "function-word" }, // conjunction
  { word: "of", reason: "function-word" }, // preposition
  { word: "to", reason: "function-word" }, // preposition / infinitive marker
  { word: "a", reason: "function-word" }, // article
  { word: "in", reason: "function-word" }, // preposition
  { word: "it", reason: "function-word" }, // pronoun
  { word: "you", reason: "function-word" }, // pronoun
  { word: "he", reason: "function-word" }, // pronoun
  { word: "for", reason: "function-word" }, // preposition
  { word: "they", reason: "function-word" }, // pronoun
  { word: "not", reason: "function-word" }, // negator
  { word: "that", reason: "function-word" }, // determiner / complementiser
  { word: "we", reason: "function-word" }, // pronoun
  { word: "on", reason: "function-word" }, // preposition
  { word: "with", reason: "function-word" }, // preposition
  { word: "this", reason: "function-word" }, // determiner
  { word: "i", reason: "function-word" }, // pronoun
  // Also a lexical verb, but its lexical sense is "hacer", which `make`
  // (rank 48) carries as a card. The frequency that puts it at rank 21 is the
  // auxiliary's, and the auxiliary is grammar.
  { word: "do", reason: "function-word" },
  { word: "as", reason: "function-word" }, // preposition / conjunction
  { word: "at", reason: "function-word" }, // preposition
  { word: "she", reason: "function-word" }, // pronoun
  { word: "but", reason: "function-word" }, // conjunction
  { word: "from", reason: "function-word" }, // preposition
  { word: "by", reason: "function-word" }, // preposition
  { word: "will", reason: "function-word" }, // modal
  { word: "or", reason: "function-word" }, // conjunction
  { word: "so", reason: "function-word" }, // degree particle / conjunction
  { word: "all", reason: "function-word" }, // quantifier
  { word: "if", reason: "function-word" }, // conjunction
  { word: "one", reason: "function-word" }, // numeral / pronoun
  { word: "would", reason: "function-word" }, // modal
  { word: "about", reason: "function-word" }, // preposition
  { word: "can", reason: "function-word" }, // modal
  { word: "which", reason: "function-word" }, // determiner / relative pronoun
  { word: "there", reason: "function-word" }, // existential / deictic
  { word: "more", reason: "function-word" }, // comparative marker / quantifier
  { word: "who", reason: "function-word" }, // pronoun
  { word: "when", reason: "function-word" }, // interrogative / conjunction
  { word: "what", reason: "function-word" }, // interrogative
  { word: "up", reason: "function-word" }, // particle / preposition
  { word: "some", reason: "function-word" }, // determiner
  { word: "other", reason: "function-word" }, // determiner
  { word: "out", reason: "function-word" }, // particle / preposition
  { word: "no", reason: "function-word" }, // negator / determiner
  // The deck browser's "daily" deck happens to hold this one too, but that is
  // not why it is skipped: it is a conjunction, and the reason recorded has to
  // be the real one or the register stops meaning anything.
  { word: "because", reason: "function-word" },
  { word: "very", reason: "function-word" }, // degree intensifier
  // A focus/discourse particle whose senses — only, exactly, recently, simply —
  // do not survive a single gloss, which is what a volume card has room for.
  { word: "just", reason: "function-word" },
  { word: "could", reason: "function-word" }, // modal
  { word: "than", reason: "function-word" }, // comparative conjunction

  // ------------------------------------------------------------------
  // 04.1-03 — the first volume batch, ranks 72 to 238.
  // ------------------------------------------------------------------
  // 47 skips against 120 cards: the function words thin out fast below rank
  // 100, exactly as the top of a frequency list predicts. The line drawn at
  // rank 71 is held without exception here — deictic PRO-FORMS (`here`, to go
  // with `there` at rank 40) are closed class and skipped, while temporal and
  // frequency adverbs (`still`, `never`, `always`, `again`, `early`, `late`)
  // are lexical and ARE carded.
  { word: "also", reason: "function-word" }, // additive focus particle
  { word: "into", reason: "function-word" }, // preposition
  { word: "only", reason: "function-word" }, // focus particle
  { word: "over", reason: "function-word" }, // preposition / particle
  { word: "any", reason: "function-word" }, // determiner / quantifier
  { word: "after", reason: "function-word" }, // preposition / conjunction
  { word: "where", reason: "function-word" }, // interrogative / relative
  { word: "most", reason: "function-word" }, // superlative marker / quantifier
  { word: "should", reason: "function-word" }, // modal
  { word: "much", reason: "function-word" }, // quantifier
  { word: "how", reason: "function-word" }, // interrogative
  { word: "even", reason: "function-word" }, // focus particle
  { word: "may", reason: "function-word" }, // modal
  // The locative pro-form, and the pair `there` (rank 40) already sets the
  // rule: a deictic points at something rather than naming it, so a front/back
  // card teaches nothing a sentence would not have to teach anyway.
  { word: "here", reason: "function-word" },
  { word: "many", reason: "function-word" }, // quantifier
  { word: "such", reason: "function-word" }, // determiner
  { word: "really", reason: "function-word" }, // degree / discourse intensifier
  { word: "before", reason: "function-word" }, // preposition / conjunction
  { word: "through", reason: "function-word" }, // preposition
  { word: "down", reason: "function-word" }, // particle / preposition
  { word: "between", reason: "function-word" }, // preposition
  { word: "too", reason: "function-word" }, // degree particle
  { word: "same", reason: "function-word" }, // determiner (always "the same")
  { word: "both", reason: "function-word" }, // quantifier / determiner
  // Its rank-129 frequency is the intensifying determiner of "my own room",
  // not the verb "poseer" — the same argument `do` (rank 21) was skipped on.
  { word: "own", reason: "function-word" },
  // A degree quantifier at this frequency: "a little tired", "a little of it".
  // `small` (rank 186) carries the adjective sense "pequeño" as a card, but
  // that is not why this one is skipped — the reason recorded has to be the
  // real one, and the real one is the quantifier.
  { word: "little", reason: "function-word" },
  { word: "something", reason: "function-word" }, // indefinite pronoun
  { word: "another", reason: "function-word" }, // determiner
  // The FIRST use of this reason, and the register was declared for the whole
  // batch precisely so that it existed before it was needed:
  // scenario-vocabulary.ts already teaches "interest" with a tip, a scenario
  // around it and a place in /review, which is strictly the better card.
  { word: "interest", reason: "already-taught" },
  { word: "each", reason: "function-word" }, // determiner / quantifier
  { word: "off", reason: "function-word" }, // particle / preposition
  { word: "why", reason: "function-word" }, // interrogative
  { word: "while", reason: "function-word" }, // conjunction
  { word: "might", reason: "function-word" }, // modal
  { word: "must", reason: "function-word" }, // modal
  { word: "around", reason: "function-word" }, // preposition / particle
  { word: "every", reason: "function-word" }, // determiner / quantifier
  { word: "during", reason: "function-word" }, // preposition
  { word: "since", reason: "function-word" }, // preposition / conjunction
  { word: "under", reason: "function-word" }, // preposition
  { word: "few", reason: "function-word" }, // quantifier
  { word: "however", reason: "function-word" }, // conjunctive adverb / connective
  { word: "without", reason: "function-word" }, // preposition
  { word: "against", reason: "function-word" }, // preposition
  { word: "though", reason: "function-word" }, // conjunction
  { word: "yes", reason: "function-word" }, // response particle
  { word: "away", reason: "function-word" }, // directional particle

  // ------------------------------------------------------------------
  // 04.1-04 — the second volume batch, ranks 239 to 378.
  // ------------------------------------------------------------------
  // 20 skips against 120 cards (14 %), down from 28 % in the previous 167
  // ranks and 72 % in the first 71: the closed class is nearly exhausted by
  // rank 250 and what remains below 378 is almost all lexical.
  //
  // The line drawn at rank 71 and held at rank 238 is held again, and the two
  // sides of it are worth naming because this batch sits right on the seam:
  // TEMPORAL, FREQUENCY, MANNER and SPATIAL adverbs are lexical and ARE carded
  // — `today` (246), `once` (265), `often` (288), `already` (302), `soon`
  // (325), `together` (294), `far` (245), `probably` (328). DEGREE, FOCUS,
  // APPROXIMATIVE and DISCOURSE particles are not — `quite`, `rather`,
  // `almost`, `actually`, and the comparative/superlative markers `less` and
  // `least` that pair with `more` (38) and `most` (88).
  { word: "less", reason: "function-word" }, // comparative marker, pairs with `more` (rank 38)
  { word: "until", reason: "function-word" }, // preposition / conjunction
  { word: "enough", reason: "function-word" }, // quantifier
  { word: "whether", reason: "function-word" }, // subordinating conjunction
  { word: "quite", reason: "function-word" }, // degree particle
  { word: "although", reason: "function-word" }, // conjunction
  { word: "least", reason: "function-word" }, // superlative marker, pairs with `most` (rank 88)
  { word: "within", reason: "function-word" }, // preposition
  // A discourse particle of exactly the class `really` (rank 104) was skipped
  // on: it marks the speaker's stance towards the utterance rather than naming
  // anything, and its Spanish ("en realidad", "de hecho", "la verdad es que")
  // is chosen by what the sentence is doing, not by a gloss.
  { word: "actually", reason: "function-word" },
  { word: "rather", reason: "function-word" }, // degree particle
  { word: "almost", reason: "function-word" }, // approximative degree particle
  // Polarity-sensitive: it needs a negative or interrogative host ("not yet",
  // "have you eaten yet?") or else it is the adversative conjunction. Both
  // difficulties are grammatical. Its one-word Spanish would also be
  // "todavía", which is already the FRONT of `still` (rank 119), and two cards
  // with the same front expecting different answers is a usability defect.
  { word: "yet", reason: "function-word" },
  { word: "ever", reason: "function-word" }, // polarity-sensitive particle
  { word: "anything", reason: "function-word" }, // indefinite pronoun, pairs with `something` (138)
  { word: "nothing", reason: "function-word" }, // indefinite pronoun
  { word: "several", reason: "function-word" }, // quantifier
  { word: "either", reason: "function-word" }, // determiner / correlative conjunction
  // A postpositional temporal marker, and the reason is structural rather than
  // semantic: it cannot stand alone. "Ago" is ungrammatical without a measure
  // phrase in front of it ("two years ago"), which is a fact about syntax and
  // not a meaning a front/back card can hold.
  { word: "ago", reason: "function-word" },
  { word: "per", reason: "function-word" }, // preposition
  { word: "among", reason: "function-word" }, // preposition

  // ------------------------------------------------------------------
  // 04.1-05 — the third volume batch, ranks 379 to 515.
  // ------------------------------------------------------------------
  // 17 skips against 121 cards added. The closed class really is exhausted
  // here — only 15 of the 17 are function words, and what replaces them is the
  // constraint plan 04 predicted would take over below rank 400: not "is this
  // word grammar?" but "does this word have a Spanish that differs from it?".
  //
  // THIS ENTRY IS OUT OF BATCH AND IN RANK ORDER ON PURPOSE. `color` is rank
  // 378, which belongs to 04.1-04, and it was CARDED there — "color / tono".
  // That plan recorded the gloss as a fudge in its own summary rather than
  // presenting it as solved, the user decided `cognate` at 04.1-05, and the
  // repair is a RETIREMENT and not an edit: a live id's content may never be
  // rewritten, so `vocab:color` is declared in the `retired` list of
  // scripts/fixtures/scheduled-item-ids.json, by hand and with a reason, and
  // the word arrives here. It is the first word this deck has ever un-carded.
  { word: "color", reason: "cognate" }, // rank 378 — retired from the bank at 04.1-05
  { word: "social", reason: "cognate" }, // "social"
  { word: "across", reason: "function-word" }, // preposition
  { word: "along", reason: "function-word" }, // preposition / particle
  // A comparative marker, skipped on the same ground as `less` (253) and
  // `least` (281): it is the comparative of `far`, which is carded at 245.
  { word: "further", reason: "function-word" },
  { word: "general", reason: "cognate" }, // "general"
  { word: "toward", reason: "function-word" }, // preposition
  { word: "everything", reason: "function-word" }, // indefinite pronoun, pairs with `anything` (318) and `nothing` (336)
  { word: "someone", reason: "function-word" }, // indefinite pronoun
  { word: "above", reason: "function-word" }, // preposition
  // A directional particle, the class `away` was skipped on in 04.1-03. The
  // spatial ADVERBS stay carded — `outside` (491) is one, and it names a place
  // rather than pointing along an axis.
  { word: "forward", reason: "function-word" },
  { word: "himself", reason: "function-word" }, // reflexive pronoun
  // The SECOND use of this reason, and only the second in 380 cards:
  // scenario-vocabulary.ts already teaches "available" with a tip and a
  // scenario around it, which is strictly the better card. The harness would
  // have forced the issue anyway; declaring it is cheaper than discovering it.
  { word: "available", reason: "already-taught" },
  { word: "else", reason: "function-word" }, // postnominal determiner ("something else")
  // Not the verb "agradar" at this frequency: rank 471 is the politeness
  // particle, and a particle marking how a request is delivered is exactly the
  // discourse class `just` (49) and `actually` (291) were skipped on.
  { word: "please", reason: "function-word" },
  { word: "themselves", reason: "function-word" }, // reflexive pronoun
  { word: "behind", reason: "function-word" }, // preposition

  // ------------------------------------------------------------------
  // 04.1-06 — the fourth and last volume batch, ranks 516 to 648.
  // ------------------------------------------------------------------
  // 13 skips against 120 cards: 9.8 % of the band, DOWN from 11.7 % in the
  // previous 137 ranks and 14 % before that. The rate falling in the last batch
  // matters as evidence rather than as trivia — reaching for this register more
  // often near the finish line is the fatigue signal 04.1-06 was told to watch
  // for, and the rate went the other way.
  //
  // ONLY SIX OF THE THIRTEEN ARE FUNCTION WORDS. Below rank 500 the closed
  // class is spent, and what does the deciding here is neither grammar nor
  // cognate status but the TAKEN FRONT — which is a gloss problem, not a skip
  // problem, so it produced fifteen re-glossed cards and zero skips. The five
  // cognates below are the residue: words whose Spanish is the English word.
  { word: "accord", reason: "function-word" }, // the rank-522 frequency is "according to", a complex preposition; the noun sense would be "acuerdo", which `deal` (321) holds
  { word: "therefore", reason: "function-word" }, // conjunctive adverb, the class `however` (215) was skipped on
  { word: "itself", reason: "function-word" }, // reflexive pronoun, pairs with `himself` (458) and `themselves` (480)
  // A connective adverb of the `however` / `therefore` class. The deck browser
  // also holds it ("en vez de"), but that is not the reason recorded: overlap
  // with that deck is reported and never asserted, and the reason has to be the
  // real one or the register stops meaning anything.
  { word: "instead", reason: "function-word" },
  { word: "total", reason: "cognate" }, // "total" — predicted by 04.1-05 and met
  { word: "material", reason: "cognate" }, // "material" — likewise
  { word: "upon", reason: "function-word" }, // preposition
  { word: "personal", reason: "cognate" }, // "personal"
  { word: "animal", reason: "cognate" }, // "animal"
  { word: "similar", reason: "cognate" }, // "similar"
  // A degree/focus intensifier ("particularly difficult"), the class `quite`
  // (285), `rather` (299) and `almost` (300) were skipped on. Its focus
  // reading's honest Spanish is "sobre todo", which is already the front of
  // `especially` (460), so a card here could only duplicate a front or fudge one.
  { word: "particularly", reason: "function-word" },
  { word: "simply", reason: "function-word" }, // focus particle, the class `just` (49) and `really` (104) were skipped on
  { word: "factor", reason: "cognate" }, // "factor"
];
