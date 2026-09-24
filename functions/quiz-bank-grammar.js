/* ============================================================
   ELA — functions/quiz-bank-grammar.js
   ------------------------------------------------------------
   Banque de questions de GRAMMAIRE (MCQ) par académie et niveau,
   pour les niveaux sans banque source (DE/ZH/EN/AR/RU A2–C2 et
   HSK2–HSK6). Chaque question : texte (instruction EN + contenu
   langue cible), 4 options, correctIndex (côté serveur),
   explication, compétence, difficulté.
   sourceType : GENERATED_DRAFT (aucune reconnaissance externe).
   ============================================================ */

const QUIZ_BANK_GRAMMAR = {
  DE: {
    A2: [
      { text: 'Complete: Ich ___ gestern ins Kino gegangen. (Perfekt)', options: ['bin', 'habe', 'wird', 'war'], correctIndex: 0, explanation: 'Verbs of movement (gehen) take "sein" in the Perfekt.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: Der Brief gehört ___ Mutter. (Dativ)', options: ['die', 'der', 'dem', 'den'], correctIndex: 1, explanation: 'The feminine dative article is "der".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: Ich ___ am Montag arbeiten. (Modalverb)', options: ['muss', 'mussen', 'müsst', 'müssen'], correctIndex: 0, explanation: 'First person singular of "müssen" is "muss".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: Ich stehe um 6 Uhr ___. (trennbares Verb)', options: ['auf', 'an', 'ab', 'aus'], correctIndex: 0, explanation: '"aufstehen" separates into "stehe ... auf".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: Er ist ___ als sein Bruder. (Komparativ)', options: ['groß', 'größer', 'am größten', 'größere'], correctIndex: 1, explanation: 'Comparative of "groß" is "größer".', skill: 'grammar', difficulty: 2 }
    ],
    B1: [
      { text: 'Complete: Er sagte, dass er morgen ___. (Nebensatz)', options: ['kommt', 'komme', 'kommst', 'gekommen'], correctIndex: 1, explanation: 'In an indirect "dass" clause the verb moves to the end (and here subjunctive "komme").', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: Als Kind ___ ich jeden Sommer am Meer. (Präteritum)', options: ['verbrachte', 'verbringe', 'verbracht', 'verbrachtest'], correctIndex: 0, explanation: 'Präteritum 1st person of "verbringen" is "verbrachte".', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: Ich ___ gern mehr Zeit. (Konjunktiv II)', options: ['hätte', 'habe', 'hatte', 'hab'], correctIndex: 0, explanation: 'Konjunktiv II of "haben" is "hätte".', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: Das Haus, ___ ich kaufte, ist alt. (Relativsatz)', options: ['dass', 'das', 'der', 'dem'], correctIndex: 1, explanation: 'Neuter relative pronoun is "das".', skill: 'grammar', difficulty: 3 }
    ],
    B2: [
      { text: 'Complete: Nachdem er gegessen ___, ging er. (Plusquamperfekt)', options: ['hatte', 'hat', 'wird', 'ist'], correctIndex: 0, explanation: 'Plusquamperfekt uses "hatte" + past participle.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: Der Brief ___ von mir geschrieben. (Passiv)', options: ['wurde', 'wird', 'werde', 'wurden'], correctIndex: 0, explanation: 'Passive past "wurde geschrieben".', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: Wegen ___ Regens blieben wir zu Hause. (Genitiv)', options: ['des', 'dem', 'der', 'den'], correctIndex: 0, explanation: 'Genitive masculine singular is "des".', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: Das Problem muss gelöst ___. (Passiv mit Modalverb)', options: ['werden', 'wird', 'worden', 'wurde'], correctIndex: 0, explanation: 'Passive with modal: "muss gelöst werden".', skill: 'grammar', difficulty: 4 }
    ],
    C1: [
      { text: 'Complete (Konjunktiv I): Er sagte, er ___ krank.', options: ['sei', 'ist', 'war', 'wäre'], correctIndex: 0, explanation: 'Indirect speech uses Konjunktiv I "sei".', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: ___ des Wetters gingen wir spazieren. (Partizipial)', options: ['Trotz', 'Wegen', 'Anhand', 'Trotzdem'], correctIndex: 0, explanation: '"Trotz" + Genitiv = despite.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the correct register for an official letter: ___', options: ['Sehr geehrte Damen und Herren', 'Hallo Leute', 'Hey du', 'Servus'], correctIndex: 0, explanation: '"Sehr geehrte Damen und Herren" is the formal salutation.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: Es handelt sich ___ ein Missverständnis.', options: ['um', 'für', 'über', 'auf'], correctIndex: 0, explanation: '"sich handeln um" = to be a question of.', skill: 'grammar', difficulty: 5 }
    ],
    C2: [
      { text: 'Choose the idiomatic expression meaning "to beat around the bush": ___', options: ['um den heißen Brei herumreden', 'ins kalte Wasser springen', 'die Katze im Sack kaufen', 'zwei Fliegen mit einer Klappe schlagen'], correctIndex: 0, explanation: '"um den heißen Brei herumreden" = to avoid the point.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: Er konnte nicht umhin, ___ zu lachen.', options: ['als', 'als zu', 'zu', 'statt'], correctIndex: 0, explanation: '"nicht umhin, zu ..." (here "umhin ... als zu lachen").', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the stylistically most formal: ___', options: ['Es wird ersucht', 'Man bittet', 'Bitte', 'Könnten Sie'], correctIndex: 0, explanation: '"Es wird ersucht" is a very formal register.', skill: 'grammar', difficulty: 5 }
    ]
  },
  ZH: {
    HSK2: [
      { text: 'Complete: 我吃___苹果。 (过/了)', options: ['了', '过', '在', '得'], correctIndex: 0, explanation: '"了" marks a completed action.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: 他去___中国。 (过/了)', options: ['过', '了', '在', '得'], correctIndex: 0, explanation: '"过" marks past experience.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: 他比哥哥___。 (比 comparison)', options: ['高', '更高', '很高', '高了'], correctIndex: 0, explanation: '"比" comparison uses the plain adjective.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: 我___看电视。 (正在)', options: ['正在', '已经', '就', '才'], correctIndex: 0, explanation: '"正在" marks the progressive.', skill: 'grammar', difficulty: 2 }
    ],
    HSK3: [
      { text: 'Complete: 我把书___了。 (把 construction)', options: ['看完', '看', '看过', '看着'], correctIndex: 0, explanation: '"把 + object + verb + complement".', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: 书___他拿走了。 (被 passive)', options: ['被', '把', '让', '给'], correctIndex: 0, explanation: '"被" marks the passive.', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: 他说___太累了。 (得 complement)', options: ['得', '的', '地', '了'], correctIndex: 0, explanation: '"得" introduces a degree complement.', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: 他___到上海了。 (directional complement)', options: ['回', '去', '来', '到'], correctIndex: 0, explanation: '"回到" = to return to.', skill: 'grammar', difficulty: 3 }
    ],
    HSK4: [
      { text: 'Complete: 这是___他说的。 (是…的 emphasis)', options: ['是', '的', '了', '过'], correctIndex: 0, explanation: 'The "是…的" construction emphasises the circumstance.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: ___下雨，我们也去。 (无论)', options: ['无论', '因为', '虽然', '既然'], correctIndex: 0, explanation: '"无论" = no matter / regardless.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: 他___小孩都会说英语。 (连…都)', options: ['连', '把', '被', '让'], correctIndex: 0, explanation: '"连…都" = even.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: ___你喜欢，我们就去。 (只要…就)', options: ['只要', '如果', '虽然', '因为'], correctIndex: 0, explanation: '"只要…就" = as long as.', skill: 'grammar', difficulty: 4 }
    ],
    HSK5: [
      { text: 'Choose the formal (written) register: ___', options: ['因此', '所以', '那', '然后'], correctIndex: 0, explanation: '"因此" is the formal written connector.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the idiom meaning "self-contradiction": ___', options: ['自相矛盾', '画蛇添足', '亡羊补牢', '守株待兔'], correctIndex: 0, explanation: '"自相矛盾" = to contradict oneself.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: 他不仅聪明，___很努力。', options: ['而且', '但是', '所以', '因为'], correctIndex: 0, explanation: '"不仅…而且" = not only... but also.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: 这件事___他负责。 (由)', options: ['由', '把', '被', '让'], correctIndex: 0, explanation: '"由" introduces the responsible agent.', skill: 'grammar', difficulty: 5 }
    ],
    HSK6: [
      { text: 'Choose the idiom meaning "a drop in the bucket": ___', options: ['杯水车薪', '画蛇添足', '对牛弹琴', '井底之蛙'], correctIndex: 0, explanation: '"杯水车薪" = a drop in the bucket.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: ___他说什么，我都不信。 (任凭)', options: ['任凭', '因为', '虽然', '既然'], correctIndex: 0, explanation: '"任凭" = no matter how much.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the literary/classical register: ___', options: ['岂有此理', '怎么可能', '不会吧', '真的吗'], correctIndex: 0, explanation: '"岂有此理" is a classical/literary expression.', skill: 'grammar', difficulty: 5 }
    ]
  },
  EN: {
    A2: [
      { text: 'Complete: She ___ to school yesterday. (past simple)', options: ['went', 'goes', 'gone', 'going'], correctIndex: 0, explanation: 'Past simple of "go" is "went".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: I have never ___ sushi. (present perfect)', options: ['eaten', 'ate', 'eat', 'eating'], correctIndex: 0, explanation: 'Present perfect uses "have + past participle".', skill: 'grammar', difficulty: 2 },
      { text: 'Choose the correct comparative: She is ___ than me.', options: ['taller', 'tallest', 'more tall', 'tall'], correctIndex: 0, explanation: 'Comparative of "tall" is "taller".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: You ___ wear a seatbelt. (obligation)', options: ['must', 'can', 'might', 'would'], correctIndex: 0, explanation: '"must" expresses obligation.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: They ___ visit us next week. (future)', options: ['will', 'did', 'were', 'have'], correctIndex: 0, explanation: '"will" + verb expresses future.', skill: 'grammar', difficulty: 2 }
    ],
    B1: [
      { text: 'Complete: While I ___, the phone rang. (past continuous)', options: ['was cooking', 'cooked', 'cook', 'am cooking'], correctIndex: 0, explanation: 'Past continuous "was + -ing" for background action.', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: The book ___ I read was great. (relative clause)', options: ['that', 'who', 'where', 'when'], correctIndex: 0, explanation: '"that" introduces a relative clause for things.', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: If I ___ you, I would go. (second conditional)', options: ['were', 'am', 'was', 'be'], correctIndex: 0, explanation: 'Second conditional uses "were" for hypothetical.', skill: 'grammar', difficulty: 3 },
      { text: 'Choose the passive: The letter ___ yesterday.', options: ['was sent', 'sent', 'is sending', 'sends'], correctIndex: 0, explanation: 'Passive past = "was + past participle".', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: He said he ___ come. (reported speech)', options: ['would', 'will', 'shall', 'is'], correctIndex: 0, explanation: 'Reported speech backshifts "will" to "would".', skill: 'grammar', difficulty: 3 }
    ],
    B2: [
      { text: 'Complete: If she had known, she ___ come. (third conditional)', options: ['would have', 'would', 'will have', 'has'], correctIndex: 0, explanation: 'Third conditional = "would have + past participle".', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: By the time I arrived, they ___. (past perfect)', options: ['had left', 'left', 'have left', 'leave'], correctIndex: 0, explanation: 'Past perfect "had + past participle".', skill: 'grammar', difficulty: 4 },
      { text: 'Choose the modal of deduction: They ___ be home — the lights are on.', options: ['must', 'can\'t', 'might', 'should'], correctIndex: 0, explanation: '"must" expresses strong deduction.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: ___ the heavy rain, we went out.', options: ['Despite', 'Although', 'Because of', 'Since'], correctIndex: 0, explanation: '"Despite + noun" (not a clause).', skill: 'grammar', difficulty: 4 }
    ],
    C1: [
      { text: 'Choose the inverted form: ___ had I left than it started.', options: ['No sooner', 'Sooner', 'As soon', 'Immediately'], correctIndex: 0, explanation: '"No sooner ... than" triggers inversion.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: It was the manager ___ made the decision. (cleft)', options: ['who', 'which', 'what', 'whom'], correctIndex: 0, explanation: 'Cleft sentence uses "who" for people.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the hedging expression: The results ___ suggest a trend.', options: ['appear to', 'definitely', 'clearly', 'obviously'], correctIndex: 0, explanation: '"appear to" hedges / softens the claim.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: ___ his qualifications, he got the job.', options: ['Despite', 'Because', 'Since', 'As'], correctIndex: 0, explanation: '"Despite" introduces a concessive phrase.', skill: 'grammar', difficulty: 5 }
    ],
    C2: [
      { text: 'Choose the idiom meaning "to reveal a secret": ___', options: ['let the cat out of the bag', 'break the ice', 'hit the nail on the head', 'bite the bullet'], correctIndex: 0, explanation: '"let the cat out of the bag" = reveal a secret.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: ___ the challenges, the project succeeded. (formal)', options: ['Notwithstanding', 'Despite of', 'Although of', 'In spite'], correctIndex: 0, explanation: '"Notwithstanding" is a formal concessive.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the most idiomatic: He is ___ about his mistake.', options: ['in denial', 'on denial', 'at denial', 'by denial'], correctIndex: 0, explanation: '"in denial" is the correct idiom.', skill: 'grammar', difficulty: 5 }
    ]
  },
  AR: {
    A2: [
      { text: 'Complete: ذهبتُ ___ المدرسة. (preposition)', options: ['إلى', 'في', 'من', 'على'], correctIndex: 0, explanation: '"إلى" = to (direction).', skill: 'grammar', difficulty: 2 },
      { text: 'Choose the correct negation: أنا ___ أعرف. (verbal sentence)', options: ['لا', 'لم', 'لن', 'ما'], correctIndex: 0, explanation: '"لا" negates the present tense verb.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: هذا ___ جديد. (nominal sentence)', options: ['كتابٌ', 'كتاباً', 'كتابٍ', 'كتاب'], correctIndex: 0, explanation: 'Predicate of a nominal sentence is nominative indefinite.', skill: 'grammar', difficulty: 3 },
      { text: 'Choose the comparative: هو ___ من أخيه. (أفعل)', options: ['أكبر', 'كبير', 'الكبير', 'كبائر'], correctIndex: 0, explanation: 'Comparative "أكبر" = bigger.', skill: 'grammar', difficulty: 3 }
    ],
    B1: [
      { text: 'Complete: إنّ الطالبَ ___. (إنّ and sisters)', options: ['مجتهدٌ', 'مجتهداً', 'مجتهدٍ', 'مجتهد'], correctIndex: 0, explanation: 'The predicate of "إنّ" is nominative.', skill: 'grammar', difficulty: 4 },
      { text: 'Choose the correct case after "كان": كان الجوُّ ___.', options: ['جميلاً', 'جميلٌ', 'جميلٍ', 'جميل'], correctIndex: 0, explanation: 'The predicate of "كان" is accusative.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: لن أذهبَ إلى ___. (genitive)', options: ['البيتِ', 'البيتَ', 'البيتُ', 'بيت'], correctIndex: 0, explanation: 'After a preposition the noun is genitive.', skill: 'grammar', difficulty: 4 },
      { text: 'Choose the correct conditional particle: ___ تدرس تنجح.', options: ['إنْ', 'أنّ', 'لكن', 'ثم'], correctIndex: 0, explanation: '"إنْ" introduces a condition.', skill: 'grammar', difficulty: 4 }
    ],
    B2: [
      { text: 'Choose the passive: كُتِبَ الدرسُ ___ الطالب.', options: ['بِقِبل', 'من', 'في', 'إلى'], correctIndex: 0, explanation: 'Passive agent uses "من" or "بِقِبل".', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: أريدُ أن ___ إلى الجامعة. (subjunctive)', options: ['أذهبَ', 'أذهبُ', 'ذهب', 'أذهبْ'], correctIndex: 0, explanation: '"أن + subjunctive" (منصوب).', skill: 'grammar', difficulty: 4 },
      { text: 'Choose the correct verbal noun (مصدر): ___ المعرفةِ نورٌ.', options: ['طلبُ', 'طلبَ', 'طلبٍ', 'اطلب'], correctIndex: 0, explanation: 'Verbal noun "طلب" is nominative as subject.', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: الطلابُ ___ يدرسون مجتهدون. (relative)', options: ['الذين', 'التي', 'اللتان', 'من'], correctIndex: 0, explanation: '"الذين" for plural masculine relative.', skill: 'grammar', difficulty: 4 }
    ],
    C1: [
      { text: 'Choose the rhetorical device (استعارة) in "البحرُ كريمٌ": ___', options: ['استعارة', 'طباق', 'جناس', 'سجع'], correctIndex: 0, explanation: 'Giving the sea human generosity is a metaphor.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the correct register for a formal letter: ___', options: ['السادة المحترمون', 'يا جماعة', 'أهلين', 'هلا'], correctIndex: 0, explanation: '"السادة المحترمون" is the formal salutation.', skill: 'grammar', difficulty: 5 },
      { text: 'Complete: ازداد الوضعُ ___ سوءاً. (cohesion)', options: ['سوءاً', 'سوءٌ', 'سوءٍ', 'أسوأ'], correctIndex: 0, explanation: 'Tamyiz (distinction) is accusative.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the idiom meaning "the last straw": ___', options: ['القشة التي قصمت ظهر البعير', 'في الصميم', 'على عيني ورأسي', 'من باب أولى'], correctIndex: 0, explanation: '"القشة التي قصمت ظهر البعير" = the last straw.', skill: 'grammar', difficulty: 5 }
    ],
    C2: [
      { text: 'Choose the proverb meaning "actions speak louder than words": ___', options: ['خير الكلام ما قلّ ودلّ', 'الصديق وقت الضيق', 'الجار قبل الدار', 'العقل السليم في الجسم السليم'], correctIndex: 0, explanation: '"خير الكلام ما قلّ ودلّ" = the best speech is brief.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the advanced rhetorical device: "شربنا البحر" (hyperbole): ___', options: ['مبالغة', 'طباق', 'تورية', 'استعارة'], correctIndex: 0, explanation: 'Exaggeration is مبالغة (hyperbole).', skill: 'grammar', difficulty: 5 }
    ]
  },
  RU: {
    A2: [
      { text: 'Complete: Я вижу ___ (accusative of "книга").', options: ['книгу', 'книга', 'книге', 'книгой'], correctIndex: 0, explanation: 'Accusative feminine = "книгу".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: У меня нет ___ (genitive of "время").', options: ['времени', 'время', 'временем', 'о времени'], correctIndex: 0, explanation: '"нет" requires the genitive.', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: Я дал ___ книгу. (dative)', options: ['брату', 'брат', 'брата', 'братом'], correctIndex: 0, explanation: 'Dative masculine = "брату".', skill: 'grammar', difficulty: 2 },
      { text: 'Complete: Я говорю ___ тебе. (prepositional)', options: ['о', 'в', 'на', 'за'], correctIndex: 0, explanation: '"говорить о" = to talk about.', skill: 'grammar', difficulty: 2 }
    ],
    B1: [
      { text: 'Choose the correct aspect: Я ___ книгу вчера. (perfective)', options: ['прочитал', 'читал', 'читаю', 'прочитаю'], correctIndex: 0, explanation: 'Perfective "прочитал" = completed reading.', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: Он ___ в школу пешком. (verb of motion)', options: ['идёт', 'едет', 'летит', 'плывёт'], correctIndex: 0, explanation: '"идёт" = goes on foot.', skill: 'grammar', difficulty: 3 },
      { text: 'Complete: Я бы ___ кофе. (conditional)', options: ['выпил', 'выпью', 'пью', 'выпил бы'], correctIndex: 0, explanation: 'Conditional "бы" + past tense.', skill: 'grammar', difficulty: 3 },
      { text: 'Choose the imperative: ___ сюда! (come)', options: ['Иди', 'Идёшь', 'Идёт', 'Идишь'], correctIndex: 0, explanation: 'Imperative of "идти" is "иди".', skill: 'grammar', difficulty: 3 }
    ],
    B2: [
      { text: 'Choose the correct participle: ___ письмо лежит на столе. (past passive)', options: ['Написанное', 'Написал', 'Напишет', 'Пишущее'], correctIndex: 0, explanation: 'Past passive participle "написанное".', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: Он ушёл, ___ дверь. (gerund)', options: ['закрыв', 'закрыл', 'закрывает', 'закрывая'], correctIndex: 0, explanation: 'Perfective gerund "закрыв".', skill: 'grammar', difficulty: 4 },
      { text: 'Choose the passive: Дом ___ строителями. (built by)', options: ['строится', 'строит', 'строил', 'строить'], correctIndex: 0, explanation: 'Passive reflexive "строится".', skill: 'grammar', difficulty: 4 },
      { text: 'Complete: ___ трудности, он продолжал. (connector)', options: ['Несмотря на', 'Хотя', 'Потому что', 'Если'], correctIndex: 0, explanation: '"Несмотря на" + accusative = despite.', skill: 'grammar', difficulty: 4 }
    ],
    C1: [
      { text: 'Choose the correct aspectual nuance: Он ___ окно (opened and it remains open).', options: ['открыл', 'открывал', 'открывает', 'откроет'], correctIndex: 0, explanation: 'Perfective "открыл" = result state.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the idiom meaning "to be out of place": ___', options: ['не в своей тарелке', 'в своей тарелке', 'на своей тарелке', 'за своей тарелкой'], correctIndex: 0, explanation: '"не в своей тарелке" = ill at ease.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the formal register: ___ Вас проинформировать.', options: ['Позвольте', 'Дай', 'Ну', 'Давай'], correctIndex: 0, explanation: '"Позвольте" is the formal polite form.', skill: 'grammar', difficulty: 5 }
    ],
    C2: [
      { text: 'Choose the phraseology meaning "a white lie": ___', options: ['ложь во спасение', 'белая ложь', 'ложь на благо', 'сладкая ложь'], correctIndex: 0, explanation: '"ложь во спасение" = a white lie.', skill: 'grammar', difficulty: 5 },
      { text: 'Choose the stylistically neutral form: ___', options: ['осуществить', 'сделать на скорую руку', 'забацать', 'сварганить'], correctIndex: 0, explanation: '"осуществить" is the neutral/literary verb.', skill: 'grammar', difficulty: 5 }
    ]
  }
};

module.exports = { QUIZ_BANK_GRAMMAR };
