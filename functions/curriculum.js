/* ============================================================
   ELA — CURRICULUM DE DÉMARRAGE (contenu réel, propriétaire)
   Contenu pédagogique complet pour les 5 académies.
   Chaque leçon : objectifs, contenu (explications en anglais,
   exemples dans la langue cible + traduction), vocabulaire,
   grammaire, exercices, videoUrl="" (prêt à recevoir), quizz.
   ============================================================ */

module.exports = [
  /* ==================== GERMAN ACADEMY — A1 ==================== */
  {
    academy: 'german',
    level: 'A1',
    title: 'German A1 — Foundations',
    category: 'General Path',
    description: 'Your first steps in German: greetings, the alphabet, numbers, essential verbs and the basics of daily life. Built for the Goethe-Zertifikat A1.',
    learningOutcomes: [
      'Greet people and introduce yourself in German',
      'Pronounce the German alphabet and key sounds correctly',
      'Count, tell the time and handle everyday situations',
      'Use der/die/das and essential verbs (sein, haben, heißen)',
      'Form your first sentences in the present perfect (Perfekt)'
    ],
    order: 1,
    lessons: [
      {
        title: 'Greetings & Introductions',
        objectives: ['Greet someone at any time of day', 'Say goodbye politely', 'Ask how someone is'],
        content: 'In German, greetings change with the time of day and the level of formality. The most common greeting is "Guten Tag" (good day), used from late morning until the evening. In the morning you say "Guten Morgen", and in the evening "Guten Abend". Among friends and younger people, a simple "Hallo" is always correct.\n\nTo ask how someone is, use "Wie geht es Ihnen?" (formal) or "Wie geht\'s?" (informal). The usual answers are "Mir geht es gut" (I am well), "Es geht" (so-so), or "Nicht so gut" (not so well).\n\nExample dialogue:\n— Guten Morgen! Wie geht es Ihnen?\n— Guten Morgen! Mir geht es gut, danke. Und Ihnen?',
        vocabulary: [
          { term: 'Hallo', meaning: 'Hello' },
          { term: 'Guten Morgen', meaning: 'Good morning' },
          { term: 'Guten Tag', meaning: 'Good day / Hello' },
          { term: 'Guten Abend', meaning: 'Good evening' },
          { term: 'Auf Wiedersehen', meaning: 'Goodbye (formal)' },
          { term: 'Tschüss', meaning: 'Bye (informal)' }
        ],
        grammar: ['The formal "Sie" (you) vs the informal "du": use "Sie" with strangers and in business, "du" with friends and children.'],
        exercises: ['Write a short dialogue where two colleagues greet each other in the morning and ask how they are.']
      },
      {
        title: 'Alphabet & Pronunciation',
        objectives: ['Recognise the 30 German letters', 'Pronounce the special sounds ä, ö, ü and ß', 'Read simple words aloud'],
        content: 'The German alphabet has the same 26 letters as English plus four special characters: ä, ö, ü and ß. The vowels with dots (called Umlaut) change the sound: "ä" sounds like the "e" in "bed", "ö" is like the "i" in "bird" (rounded lips), and "ü" is like "ee" said with rounded lips.\n\nThe letter "ß" (Eszett or "scharfes S") is a sharp "s" and appears after long vowels, as in "Straße" (street) and "heißen" (to be called).\n\nA few pronunciation rules:\n- "w" is pronounced like the English "v" (Wasser = water).\n- "v" is often pronounced like "f" (Vater = father).\n- "z" is pronounced "ts" (Zeit = time).\n- "ei" is "eye", "ie" is "ee", "eu" is "oy".',
        vocabulary: [
          { term: 'der Buchstabe', meaning: 'the letter' },
          { term: 'das Alphabet', meaning: 'the alphabet' },
          { term: 'die Aussprache', meaning: 'the pronunciation' },
          { term: 'die Straße', meaning: 'the street' },
          { term: 'das Wasser', meaning: 'the water' },
          { term: 'die Zeit', meaning: 'the time' }
        ],
        grammar: ['Every German noun is capitalised (der Mann, die Frau, das Kind).'],
        exercises: ['Practise saying: "Weißt du, wo die Straße ist?" (Do you know where the street is?) and focus on the ß sound.']
      },
      {
        title: 'Introducing Yourself',
        objectives: ['Say your name and where you are from', 'Ask someone their name', 'Give your age and nationality'],
        content: 'To introduce yourself, say "Ich heiße..." (I am called...) or "Ich bin..." (I am...). Ask someone their name with "Wie heißt du?" (informal) or "Wie heißen Sie?" (formal).\n\nTo say where you are from: "Ich komme aus Nigeria" (I come from Nigeria). To ask: "Woher kommst du?" (Where are you from?).\n\nTo give your age: "Ich bin zwanzig Jahre alt" (I am twenty years old). To ask: "Wie alt bist du?" (How old are you?).\n\nExample:\n— Hallo! Ich heiße Ada. Wie heißt du?\n— Ich heiße Chidi. Woher kommst du?\n— Ich komme aus Lagos, aus Nigeria.',
        vocabulary: [
          { term: 'heißen', meaning: 'to be called' },
          { term: 'kommen aus', meaning: 'to come from' },
          { term: 'Ich heiße...', meaning: 'My name is...' },
          { term: 'Woher kommst du?', meaning: 'Where are you from?' },
          { term: 'Wie alt bist du?', meaning: 'How old are you?' },
          { term: 'Jahre alt', meaning: 'years old' }
        ],
        grammar: ['Verb position: in a simple statement the conjugated verb is always in the second position ("Ich heiße Ada").'],
        exercises: ['Write three sentences about yourself: your name, where you are from, and your age.']
      },
      {
        title: 'Numbers & Counting',
        objectives: ['Count from 0 to 100', 'Tell the time', 'Give prices and phone numbers'],
        content: 'German numbers from 0 to 12: null (0), eins (1), zwei (2), drei (3), vier (4), fünf (5), sechs (6), sieben (7), acht (8), neun (9), zehn (10), elf (11), zwölf (12).\n\nFrom 13 to 19, add "zehn": dreizehn (13), vierzehn (14), fünfzehn (15), sechzehn (16), siebzehn (17), achtzehn (18), neunzehn (19).\n\nTens: zwanzig (20), dreißig (30), vierzig (40), fünfzig (50), sechzig (60), siebzig (70), achtzig (80), neunzig (90).\n\nFor numbers like 21, German says "one and twenty": einundzwanzig (21), fünfunddreißig (35).\n\nTo tell the time: "Wie spät ist es?" (What time is it?). "Es ist drei Uhr" (It is three o\'clock). "Es ist halb vier" (It is half past three).',
        vocabulary: [
          { term: 'eins', meaning: 'one' },
          { term: 'zehn', meaning: 'ten' },
          { term: 'zwanzig', meaning: 'twenty' },
          { term: 'hundert', meaning: 'hundred' },
          { term: 'Wie spät ist es?', meaning: 'What time is it?' },
          { term: 'die Uhr', meaning: 'the clock / o\'clock' }
        ],
        grammar: ['Compound numbers reverse the order in German: "einundzwanzig" = one-and-twenty (21).'],
        exercises: ['Write out: 17, 25, 43, 68, 90 in German words.']
      },
      {
        title: 'Everyday Life & Useful Phrases',
        objectives: ['Order food and drink', 'Ask for directions', 'Use polite expressions'],
        content: 'In a café or restaurant you will hear "Was möchten Sie?" (What would you like?). Answer with "Ich möchte..." (I would like...). For example: "Ich möchte einen Kaffee, bitte" (I would like a coffee, please).\n\nTo ask for directions: "Entschuldigung, wo ist der Bahnhof?" (Excuse me, where is the station?). Useful answers: "links" (left), "rechts" (right), "geradeaus" (straight ahead).\n\nPolite expressions: "Bitte" (please / you\'re welcome), "Danke" (thank you), "Danke schön" (thank you very much), "Entschuldigung" (excuse me / sorry).\n\nExample:\n— Entschuldigung, wo ist der Bahnhof?\n— Gehen Sie geradeaus, dann links. Der Bahnhof ist rechts.',
        vocabulary: [
          { term: 'Ich möchte...', meaning: 'I would like...' },
          { term: 'Bitte', meaning: 'please / you\'re welcome' },
          { term: 'Danke schön', meaning: 'thank you very much' },
          { term: 'Entschuldigung', meaning: 'excuse me / sorry' },
          { term: 'links / rechts', meaning: 'left / right' },
          { term: 'geradeaus', meaning: 'straight ahead' }
        ],
        grammar: ['"Ich möchte" (I would like) is more polite than "Ich will" (I want). Use "möchte" when ordering or requesting.'],
        exercises: ['Write how you would order a tea and ask where the toilet ("die Toilette") is.']
      },
      {
        title: 'Articles: der, die, das',
        objectives: ['Understand the three grammatical genders', 'Learn common nouns with their article', 'Use the indefinite articles ein/eine'],
        content: 'German has three genders: masculine (der), feminine (die) and neuter (das). The article must always be learned together with the noun.\n\nExamples:\n- der Mann (the man), der Tisch (the table), der Tag (the day)\n- die Frau (the woman), die Stadt (the city), die Nacht (the night)\n- das Kind (the child), das Haus (the house), das Buch (the book)\n\nThe indefinite article ("a/an") is "ein" for masculine and neuter, and "eine" for feminine: ein Mann, eine Frau, ein Kind.\n\nThere is no simple rule for every noun, but some hints help: most words ending in -ung, -heit, -keit and -schaft are feminine (die Zeitung, die Freiheit); words ending in -chen and -lein are neuter (das Mädchen); most words ending in -er are masculine (der Lehrer).',
        vocabulary: [
          { term: 'der Mann', meaning: 'the man' },
          { term: 'die Frau', meaning: 'the woman' },
          { term: 'das Kind', meaning: 'the child' },
          { term: 'das Haus', meaning: 'the house' },
          { term: 'die Stadt', meaning: 'the city' },
          { term: 'ein / eine', meaning: 'a / an' }
        ],
        grammar: ['Always memorise the article with the noun: learn "der Tisch", not just "Tisch".'],
        exercises: ['Give the correct article for: ____ Auto (car), ____ Schule (school), ____ Buch (book), ____ Lehrer (teacher).']
      },
      {
        title: 'Essential Verbs: sein, haben, heißen',
        objectives: ['Conjugate sein (to be) in the present', 'Conjugate haben (to have) in the present', 'Build simple sentences'],
        content: 'The verb "sein" (to be) is irregular and essential:\n- ich bin (I am), du bist (you are), er/sie/es ist (he/she/it is)\n- wir sind (we are), ihr seid (you all are), sie/Sie sind (they are / you formal are)\n\nThe verb "haben" (to have):\n- ich habe, du hast, er/sie/es hat\n- wir haben, ihr habt, sie/Sie haben\n\nExample sentences:\n- "Ich bin Student" (I am a student).\n- "Du bist aus Nigeria" (You are from Nigeria).\n- "Wir haben Zeit" (We have time).\n- "Sie hat ein Buch" (She has a book).',
        vocabulary: [
          { term: 'sein', meaning: 'to be' },
          { term: 'haben', meaning: 'to have' },
          { term: 'ich bin', meaning: 'I am' },
          { term: 'ich habe', meaning: 'I have' },
          { term: 'wir sind', meaning: 'we are' },
          { term: 'er/sie/es ist', meaning: 'he/she/it is' }
        ],
        grammar: ['"sein" and "haben" are irregular and must be memorised; they are the two most used verbs in German.'],
        exercises: ['Complete: "Ich ___ müde" (am tired), "Er ___ einen Hund" (has a dog), "Wir ___ Studenten" (are students).']
      },
      {
        title: 'The Perfekt (Present Perfect)',
        objectives: ['Understand when the Perfekt is used', 'Form the Perfekt with haben/sein', 'Use common past participles'],
        content: 'Germans use the Perfekt (present perfect) for most spoken past-tense events. It is formed with a helping verb (haben or sein) plus the past participle.\n\nMost verbs use "haben":\n- "Ich habe gegessen" (I have eaten / I ate).\n- "Er hat gearbeitet" (He worked).\n\nVerbs of movement or change of state use "sein":\n- "Ich bin gegangen" (I went).\n- "Sie ist gekommen" (She came).\n\nRegular past participles end in -t: gemacht (made), gelernt (learned), gespielt (played). Many common verbs are irregular: gegessen (eaten), getrunken (drunk), gegangen (gone), gesehen (seen).\n\nThe participle goes to the END of the sentence:\n- "Ich habe gestern Deutsch gelernt" (I learned German yesterday).',
        vocabulary: [
          { term: 'gegessen', meaning: 'eaten' },
          { term: 'getrunken', meaning: 'drunk' },
          { term: 'gegangen', meaning: 'gone' },
          { term: 'gemacht', meaning: 'made / done' },
          { term: 'gelernt', meaning: 'learned' },
          { term: 'gestern', meaning: 'yesterday' }
        ],
        grammar: ['The helping verb is in position 2, the past participle at the very end: "Ich habe ... gelernt".'],
        exercises: ['Write in the Perfekt: "I ate", "She came", "We learned German".']
      }
    ]
  },

  /* ==================== MANDARIN ACADEMY — HSK 1 ==================== */
  {
    academy: 'mandarin',
    level: 'HSK 1',
    title: 'Mandarin HSK 1 — Foundations',
    category: 'General Path',
    description: 'Learn pinyin, the four tones, your first Chinese characters, greetings, numbers and basic sentence structure. Built for the HSK 1 exam.',
    learningOutcomes: [
      'Read pinyin and pronounce the four tones correctly',
      'Write and recognise your first Chinese characters',
      'Greet people and introduce yourself in Mandarin',
      'Count and use numbers in everyday situations',
      'Build simple SVO sentences'
    ],
    order: 2,
    lessons: [
      {
        title: 'Pinyin & the Four Tones',
        objectives: ['Read pinyin syllables', 'Pronounce the four tones', 'Understand tone changes'],
        content: 'Pinyin is the romanisation of Mandarin used to learn pronunciation. Each syllable has an initial (consonant) and a final (vowel). For example, "mā" = m (initial) + a (final).\n\nMandarin has four tones plus a neutral tone:\n- First tone (¯): high and level — mā (mother).\n- Second tone (´): rising — má (hemp).\n- Third tone (ˇ): falling then rising — mǎ (horse).\n- Fourth tone (ˋ): sharp falling — mà (scold).\n- Neutral tone: light and short — ma (question particle).\n\nTones change the meaning completely, so they are as important as the sounds. Practise: "mā, má, mǎ, mà".\n\nExample with tone marks: "nǐ hǎo" (hello) uses third tone + third tone.',
        vocabulary: [
          { term: 'pīnyīn', meaning: 'romanisation of Chinese' },
          { term: 'shēngdiào', meaning: 'tone' },
          { term: 'mā', meaning: 'mother (1st tone)' },
          { term: 'mǎ', meaning: 'horse (3rd tone)' },
          { term: 'nǐ', meaning: 'you' },
          { term: 'hǎo', meaning: 'good' }
        ],
        grammar: ['Two third tones in a row change: the first becomes a second tone. "nǐ hǎo" is pronounced "ní hǎo".'],
        exercises: ['Practise the four tones with "ma" and write the tone marks for: ni, hao, zhong, guo.']
      },
      {
        title: 'Greetings',
        objectives: ['Say hello and goodbye', 'Ask how someone is', 'Use polite forms'],
        content: 'The most common greeting is "nǐ hǎo" (你好), literally "you good", meaning "hello". To be more polite use "nín hǎo" (您好).\n\n"How are you?" is "nǐ hǎo ma?" (你好吗?). The answer is "wǒ hěn hǎo" (我很好, I am very well) or "hái hǎo" (还好, so-so).\n\nGoodbye is "zàijiàn" (再见, see you again). Thank you is "xièxie" (谢谢). You\'re welcome is "bú kèqi" (不客气).\n\nExample:\nA: Nǐ hǎo! Nǐ hǎo ma?\nB: Wǒ hěn hǎo, xièxie. Nǐ ne?\nA: Wǒ yě hěn hǎo.',
        vocabulary: [
          { term: 'nǐ hǎo', meaning: 'hello (你好)' },
          { term: 'nín hǎo', meaning: 'hello (polite, 您好)' },
          { term: 'zàijiàn', meaning: 'goodbye (再见)' },
          { term: 'xièxie', meaning: 'thank you (谢谢)' },
          { term: 'bú kèqi', meaning: 'you\'re welcome (不客气)' },
          { term: 'wǒ', meaning: 'I / me (我)' }
        ],
        grammar: ['The particle "ma" (吗) turns a statement into a yes/no question: "nǐ hǎo" → "nǐ hǎo ma?".'],
        exercises: ['Write the characters for "nǐ hǎo" and "xièxie" and say them aloud with the correct tones.']
      },
      {
        title: 'Basic Characters',
        objectives: ['Understand how characters are built', 'Write simple characters', 'Recognise stroke order'],
        content: 'Chinese characters are written with strokes in a fixed order. Simple characters to start with:\n- 人 rén — person (2 strokes)\n- 大 dà — big (3 strokes)\n- 小 xiǎo — small (3 strokes)\n- 日 rì — sun / day (4 strokes)\n- 月 yuè — moon / month (4 strokes)\n- 山 shān — mountain (3 strokes)\n\nEach character has one syllable. Many words combine two characters: 中国 Zhōngguó (China) = 中 (middle) + 国 (country).\n\nStroke order matters for writing and reading; it generally goes top to bottom, left to right, horizontal before vertical.',
        vocabulary: [
          { term: 'rén', meaning: 'person (人)' },
          { term: 'dà / xiǎo', meaning: 'big / small (大/小)' },
          { term: 'rì', meaning: 'sun / day (日)' },
          { term: 'yuè', meaning: 'moon / month (月)' },
          { term: 'Zhōngguó', meaning: 'China (中国)' },
          { term: 'zhōng', meaning: 'middle (中)' }
        ],
        grammar: ['Chinese words do not change form (no plural or tense). The same word serves all contexts.'],
        exercises: ['Practise writing 人, 大, 小, 日, 月 with correct stroke order five times each.']
      },
      {
        title: 'Introducing Yourself',
        objectives: ['Say your name', 'Ask someone\'s name', 'Say where you are from'],
        content: 'To say your name, use "wǒ jiào..." (我叫..., I am called...). Ask "nǐ jiào shénme míngzi?" (你叫什么名字?, what is your name?).\n\nTo say where you are from: "wǒ shì Nírìlìyà rén" (我是尼日利亚人, I am Nigerian). Ask "nǐ shì nǎ guó rén?" (你是哪国人?, what country are you from?).\n\nThe word "shì" (是, to be) connects the subject and noun: "wǒ shì lǎoshī" (我是老师, I am a teacher).\n\nExample:\nA: Nǐ hǎo, wǒ jiào Chén. Nǐ jiào shénme míngzi?\nB: Wǒ jiào Ada. Wǒ shì Nírìlìyà rén.',
        vocabulary: [
          { term: 'wǒ jiào', meaning: 'I am called (我叫)' },
          { term: 'shénme míngzi', meaning: 'what name (什么名字)' },
          { term: 'shì', meaning: 'to be (是)' },
          { term: 'rén', meaning: 'person (人)' },
          { term: 'nǎ guó', meaning: 'which country (哪国)' },
          { term: 'lǎoshī', meaning: 'teacher (老师)' }
        ],
        grammar: ['"shì" (是) is used with nouns ("I am a teacher") but NOT with adjectives ("I am tall" uses no 是).'],
        exercises: ['Write two sentences: your name with "wǒ jiào" and your nationality with "wǒ shì ... rén".']
      },
      {
        title: 'Numbers & Counting',
        objectives: ['Count from 0 to 100', 'Use measure words', 'Tell phone numbers and prices'],
        content: 'Mandarin numbers 0 to 10: 零 líng (0), 一 yī (1), 二 èr (2), 三 sān (3), 四 sì (4), 五 wǔ (5), 六 liù (6), 七 qī (7), 八 bā (8), 九 jiǔ (9), 十 shí (10).\n\nFrom 11 to 99, combine: 十一 shíyī (11), 二十 èrshí (20), 二十一 èrshíyī (21), 九十九 jiǔshíjiǔ (99).\n\nWhen counting objects, use a measure word: "gè" (个) is the most common: "sān gè rén" (三个人, three people), "liǎng gè píngguǒ" (two apples). Note: before a measure word, "two" is "liǎng" (两), not "èr".\n\n"yī bǎi" (一百) is 100.',
        vocabulary: [
          { term: 'yī, èr, sān', meaning: 'one, two, three (一二三)' },
          { term: 'shí', meaning: 'ten (十)' },
          { term: 'gè', meaning: 'measure word (个)' },
          { term: 'liǎng', meaning: 'two (before measure word, 两)' },
          { term: 'bǎi', meaning: 'hundred (百)' },
          { term: 'duōshao qián', meaning: 'how much money (多少钱)' }
        ],
        grammar: ['Nouns in Chinese need a measure word between the number and the noun: "sān gè rén" (three people).'],
        exercises: ['Write in pinyin: 15, 28, 47, 100. Then say "three books" (sān běn shū).']
      },
      {
        title: 'Basic Sentence Structure',
        objectives: ['Build Subject-Verb-Object sentences', 'Form questions', 'Negate with 不'],
        content: 'Mandarin follows Subject-Verb-Object order, like English: "wǒ ài nǐ" (我爱你, I love you).\n\nQuestions can be formed with the particle "ma" (吗): "nǐ chī fàn ma?" (你吃饭吗?, do you eat / are you eating?).\n\nTo negate, put "bù" (不) before the verb: "wǒ bù zhīdào" (我不知道, I don\'t know), "tā bù shì lǎoshī" (他不是老师, he is not a teacher).\n\nCommon verbs: 吃 chī (eat), 喝 hē (drink), 看 kàn (look/watch), 学 xué (study/learn), 说 shuō (speak).\n\nExample: "wǒ xué Zhōngwén" (我学中文, I study Chinese). "wǒ bù shuō Fǎyǔ" (我不说法语, I don\'t speak French).',
        vocabulary: [
          { term: 'chī', meaning: 'to eat (吃)' },
          { term: 'hē', meaning: 'to drink (喝)' },
          { term: 'xué', meaning: 'to study (学)' },
          { term: 'shuō', meaning: 'to speak (说)' },
          { term: 'bù', meaning: 'not (不)' },
          { term: 'Zhōngwén', meaning: 'Chinese language (中文)' }
        ],
        grammar: ['Negation "bù" goes directly before the verb; it changes to "bú" before a fourth-tone syllable.'],
        exercises: ['Translate: "I study Chinese", "I don\'t drink coffee", "Do you speak English?" (Nǐ shuō Yīngyǔ ma?).']
      }
    ]
  },

  /* ==================== ENGLISH ACADEMY — A1–A2 ==================== */
  {
    academy: 'english',
    level: 'A1–A2',
    title: 'English — Essential Foundations',
    category: 'Professional English',
    description: 'Essential grammar, everyday conversation and professional English for work, IELTS and international careers.',
    learningOutcomes: [
      'Use to be, to have and the present simple correctly',
      'Hold everyday conversations (greetings, questions)',
      'Introduce yourself professionally and write emails',
      'Use the past simple for work and daily life'
    ],
    order: 3,
    lessons: [
      {
        title: 'Essential Grammar: to be & to have',
        objectives: ['Use "to be" and "to have" correctly', 'Form negatives and questions', 'Use contractions'],
        content: 'The verb "to be" is the most important verb in English:\n- I am, you are, he/she/it is, we are, they are.\n\nThe verb "to have": I have, you have, he/she/it has, we have, they have.\n\nNegatives: "I am not" (I\'m not), "he is not" (he isn\'t), "I do not have" (I don\'t have), "she does not have" (she doesn\'t have).\n\nQuestions invert the subject and verb: "Are you ready?", "Is she here?", "Do you have time?", "Does he have a car?".\n\nContractions are normal in speech: I\'m, you\'re, he\'s, it\'s, we\'re, they\'re; I\'ve, he\'s got, etc.\n\nExample: "I am a student. I have a question. Are you a teacher? Do you have time?"',
        vocabulary: [
          { term: 'to be', meaning: 'am / is / are' },
          { term: 'to have', meaning: 'have / has' },
          { term: 'I\'m', meaning: 'I am (contraction)' },
          { term: 'don\'t', meaning: 'do not (negative)' },
          { term: 'doesn\'t', meaning: 'does not (negative)' },
          { term: 'ready', meaning: 'prepared' }
        ],
        grammar: ['With "he/she/it", use "is" and "has"; for negatives use "does not + base verb".'],
        exercises: ['Complete: "She ___ a doctor", "They ___ students", "___ you have a pen?", "He ___ (not) like coffee."']
      },
      {
        title: 'Everyday Conversation: Greetings & Small Talk',
        objectives: ['Greet people formally and informally', 'Ask and answer personal questions', 'Make small talk'],
        content: 'Formal greetings: "Good morning", "Good afternoon", "Good evening", "How do you do?". Informal: "Hi", "Hello", "Hey", "How\'s it going?".\n\nTo ask how someone is: "How are you?", "How are things?", "What\'s up?". Common answers: "I\'m fine, thanks", "Not bad", "Pretty good, and you?".\n\nSmall talk questions: "Where are you from?", "What do you do?", "How long have you been here?". Answers: "I\'m from Lagos", "I\'m a student", "I\'ve been here for two years".\n\nExample:\nA: Hi, how are you?\nB: I\'m good, thanks. And you?\nA: Not bad. Where are you from?\nB: I\'m from Nigeria. What about you?',
        vocabulary: [
          { term: 'How are you?', meaning: 'comment allez-vous ?' },
          { term: 'What do you do?', meaning: 'what is your job?' },
          { term: 'Where are you from?', meaning: 'your origin' },
          { term: 'Not bad', meaning: 'so-so / okay' },
          { term: 'small talk', meaning: 'light conversation' },
          { term: 'Nice to meet you', meaning: 'pleased to meet you' }
        ],
        grammar: ['Use the present simple for facts and routines; use "have/has + past participle" (present perfect) for duration up to now.'],
        exercises: ['Write a short small-talk dialogue with a new colleague: greeting, how are you, where from, job.']
      },
      {
        title: 'Professional English: Introductions at Work',
        objectives: ['Introduce yourself professionally', 'Describe your role', 'Use polite workplace phrases'],
        content: 'At work, introduce yourself clearly: "Hello, I\'m Ada. I\'m the new marketing assistant." or "Let me introduce myself — my name is Chidi, and I work in sales."\n\nTo describe your role: "I work in finance", "I\'m responsible for customer support", "I handle the accounts".\n\nPolite workplace phrases: "Could you help me with...?", "Would you mind...?", "Thank you for your time", "I\'ll get back to you".\n\nExample:\nA: Hello, I\'m Ada from HR. I don\'t think we\'ve met.\nB: Nice to meet you, Ada. I\'m Chidi, from the sales team.\nA: Nice to meet you too. Could you help me with the new report?',
        vocabulary: [
          { term: 'Let me introduce myself', meaning: 'formal self-introduction' },
          { term: 'I\'m responsible for', meaning: 'my duty is' },
          { term: 'Could you help me with', meaning: 'polite request' },
          { term: 'I\'ll get back to you', meaning: 'I will reply later' },
          { term: 'colleague', meaning: 'co-worker' },
          { term: 'role / position', meaning: 'job title' }
        ],
        grammar: ['Use "I\'m responsible for + -ing" or "I handle + noun" to describe duties.'],
        exercises: ['Write a two-sentence professional self-introduction including your name, department and one responsibility.']
      },
      {
        title: 'Essential Grammar: Present Simple',
        objectives: ['Use the present simple for routines', 'Add -s for he/she/it', 'Form questions and negatives with do/does'],
        content: 'The present simple describes habits, routines and facts:\n- "I work in an office."\n- "She lives in Abuja."\n- "They speak English every day."\n\nFor he/she/it, add -s or -es: he works, she teaches, it goes, he studies (y → ies).\n\nQuestions use do/does: "Do you work here?", "Does she like coffee?".\n\nNegatives: "I don\'t work on Sundays", "He doesn\'t live here".\n\nTime expressions that often go with it: every day, usually, always, often, sometimes, never.\n\nExample: "I always drink coffee in the morning. She never eats breakfast. Do you work on Saturdays?"',
        vocabulary: [
          { term: 'usually / always', meaning: 'frequency adverbs' },
          { term: 'sometimes / never', meaning: 'frequency adverbs' },
          { term: 'every day', meaning: 'daily' },
          { term: 'routine', meaning: 'daily habits' },
          { term: 'teach', meaning: 'to give lessons' },
          { term: 'study', meaning: 'to learn' }
        ],
        grammar: ['Remember the -s only for he/she/it; do/does for questions and negatives, with the base verb.'],
        exercises: ['Write five sentences about your daily routine using the present simple (one with he/she).']
      },
      {
        title: 'Everyday Conversation: Asking Questions',
        objectives: ['Use WH-question words', 'Form yes/no questions', 'Ask for clarification'],
        content: 'WH-question words: what, where, when, who, why, how.\n- "What is your name?"\n- "Where do you live?"\n- "When does the class start?"\n- "Who is your teacher?"\n- "Why are you learning English?"\n- "How do you get to work?"\n\nYes/no questions use do/does or be: "Do you like it?", "Are you ready?".\n\nTo ask for clarification: "Sorry, could you repeat that?", "What do you mean?", "Could you say that again, please?".\n\nExample:\nA: Excuse me, where is the station?\nB: It\'s next to the bank.\nA: Sorry, could you repeat that?\nB: Of course — the station is next to the bank.',
        vocabulary: [
          { term: 'what / where / when', meaning: 'question words' },
          { term: 'who / why / how', meaning: 'question words' },
          { term: 'Could you repeat that?', meaning: 'please say again' },
          { term: 'What do you mean?', meaning: 'please clarify' },
          { term: 'next to', meaning: 'beside' },
          { term: 'station', meaning: 'train/bus stop' }
        ],
        grammar: ['WH-questions follow the order: question word + auxiliary + subject + verb ("Where do you live?").'],
        exercises: ['Write one question for each WH-word about your English course.']
      },
      {
        title: 'Professional English: Emails & Meetings',
        objectives: ['Write a simple professional email', 'Use standard email phrases', 'Participate in a meeting'],
        content: 'A simple professional email:\n\nSubject: Meeting on Monday\nDear Mr. Ade,\nI hope this email finds you well. I am writing to confirm our meeting on Monday at 10 a.m.\nPlease let me know if the time suits you.\nBest regards,\nAda\n\nStandard phrases: "I am writing to...", "Please find attached...", "I look forward to hearing from you", "Kind regards".\n\nIn meetings: "I agree", "I\'d like to add something", "Could we go back to...?", "Let\'s move on".\n\nExample: "I\'d like to add something — I think we should start the project next week."',
        vocabulary: [
          { term: 'I am writing to', meaning: 'email opening' },
          { term: 'Please find attached', meaning: 'see attachment' },
          { term: 'I look forward to', meaning: 'polite closing' },
          { term: 'Best regards', meaning: 'email sign-off' },
          { term: 'I\'d like to add', meaning: 'contribute in a meeting' },
          { term: 'Let\'s move on', meaning: 'continue to next topic' }
        ],
        grammar: ['Emails often use polite modals: "could", "would" ("Could you confirm...?", "Would you mind...?").'],
        exercises: ['Write a short email to a colleague confirming a meeting, using at least three of the phrases above.']
      }
    ]
  },

  /* ==================== ARABIC ACADEMY — A1 ==================== */
  {
    academy: 'arabic',
    level: 'A1',
    title: 'Arabic A1 — Foundations',
    category: 'General Path',
    description: 'Master the Arabic alphabet, connect letters, greet people, introduce yourself and handle everyday life. Foundation for Quranic and Gulf Arabic.',
    learningOutcomes: [
      'Recognise and write the 28 letters of the Arabic alphabet',
      'Read words by connecting letters correctly',
      'Greet people and introduce yourself',
      'Use numbers and everyday phrases'
    ],
    order: 4,
    lessons: [
      {
        title: 'The Arabic Alphabet',
        objectives: ['Recognise the 28 letters', 'Know their sounds', 'Write the isolated forms'],
        content: 'Arabic is written from right to left and has 28 letters. Here are the first few with their sounds:\n- ا alif — a (like "father")\n- ب bā\' — b\n- ت tā\' — t\n- ث thā\' — th (as in "think")\n- ج jīm — j\n- ح ḥā\' — a deep "h"\n- خ khā\' — kh (as in "Bach")\n- د dāl — d\n\nArabic has sounds that do not exist in English, such as ع (ʿayn, a deep throat sound) and غ (ghayn, like a French "r"). Practise these slowly.\n\nLetters change shape depending on their position (isolated, beginning, middle, end), but for now learn the isolated form and the sound.',
        vocabulary: [
          { term: 'ا (alif)', meaning: 'a — first letter' },
          { term: 'ب (bā\')', meaning: 'b — second letter' },
          { term: 'ت (tā\')', meaning: 't — third letter' },
          { term: 'ج (jīm)', meaning: 'j — fifth letter' },
          { term: 'د (dāl)', meaning: 'd — eighth letter' },
          { term: 'م (mīm)', meaning: 'm — twenty-fourth letter' }
        ],
        grammar: ['Arabic has no capital letters; the same letter changes shape in the beginning, middle and end of a word.'],
        exercises: ['Write the letters ا ب ت ث ج ح خ five times each and say their sound aloud.']
      },
      {
        title: 'Reading & Connecting Letters',
        objectives: ['Connect letters into words', 'Read short words', 'Understand short vowels'],
        content: 'Arabic letters connect to form words. For example, the word "باب" (bāb, door) is ب + ا + ب: the two "b" letters connect to the "alif" in the middle.\n\nSome letters (ا د ذ ر ز و) never connect to the following letter, so a word breaks after them. Example: "دار" (dār, house) = د + ا + ر — each stays separate.\n\nShort vowels are usually not written: "كتاب" is read "kitāb" (book) but only the consonants k-t-b are visible. The short vowels are added as small marks above or below: fatha (a), kasra (i), damma (u).\n\nRead these: باب (door), كتاب (book), بيت (house), يد (hand), باب الكتاب (the door of the book).',
        vocabulary: [
          { term: 'باب', meaning: 'door (bāb)' },
          { term: 'كتاب', meaning: 'book (kitāb)' },
          { term: 'بيت', meaning: 'house (bayt)' },
          { term: 'يد', meaning: 'hand (yad)' },
          { term: 'fatha / kasra / damma', meaning: 'short vowels a / i / u' },
          { term: 'دار', meaning: 'house (dār)' }
        ],
        grammar: ['Six letters (ا د ذ ر ز و) are "non-connecting": they only join to the letter before, never after.'],
        exercises: ['Write and read aloud: باب، كتاب، بيت، يد. Identify the letters that do not connect.']
      },
      {
        title: 'Greetings',
        objectives: ['Say hello and goodbye', 'Ask how someone is', 'Reply politely'],
        content: 'The universal Arabic greeting is "السلام عليكم" (as-salāmu ʿalaykum, peace be upon you). The reply is "وعليكم السلام" (wa ʿalaykumu s-salām, and upon you be peace).\n\nA simpler hello is "مرحبا" (marḥaban) or "أهلا" (ahlan).\n\n"How are you?" is "كيف حالك؟" (kayfa ḥāluk, to a man) or "كيف حالكِ؟" (kayfa ḥāluki, to a woman). The answer is "بخير، الحمد لله" (bi-khayr, al-ḥamdu lillāh — I am well, praise be to God) or simply "بخير" (bi-khayr).\n\nGoodbye is "مع السلامة" (maʿa s-salāma). Thank you is "شكرا" (shukran).\n\nExample:\nA: السلام عليكم! كيف حالك؟\nB: وعليكم السلام! بخير، الحمد لله. وأنت؟',
        vocabulary: [
          { term: 'السلام عليكم', meaning: 'peace be upon you (hello)' },
          { term: 'مرحبا / أهلا', meaning: 'hello / welcome' },
          { term: 'كيف حالك؟', meaning: 'how are you?' },
          { term: 'بخير', meaning: 'I am well' },
          { term: 'شكرا', meaning: 'thank you' },
          { term: 'مع السلامة', meaning: 'goodbye' }
        ],
        grammar: ['Arabic distinguishes masculine and feminine "you": حالك (to a man) vs حالكِ (to a woman).'],
        exercises: ['Write a short greeting dialogue using السلام عليكم and كيف حالك.']
      },
      {
        title: 'Introducing Yourself',
        objectives: ['Say your name', 'Say where you are from', 'Use the verb "to be" (implied)'],
        content: 'To say your name: "اسمي ..." (ismī..., my name is...). Ask "ما اسمك؟" (mā ismuk, what is your name, to a man) or "ما اسمكِ؟" (mā ismuki, to a woman).\n\nTo say where you are from: "أنا من نيجيريا" (anā min Nījīriyā, I am from Nigeria). Ask "من أين أنت؟" (min ayna anta, where are you from?).\n\nArabic often leaves out "is" in the present: "أنا طالب" (anā ṭālib, I [am] a student) — there is no word for "am/is/are" in the present tense.\n\nExample:\nA: ما اسمك؟\nB: اسمي يوسف. أنا من نيجيريا. وأنت؟\nA: اسمي آدم، أنا طالب.',
        vocabulary: [
          { term: 'اسمي', meaning: 'my name is' },
          { term: 'ما اسمك؟', meaning: 'what is your name?' },
          { term: 'أنا من', meaning: 'I am from' },
          { term: 'من أين أنت؟', meaning: 'where are you from?' },
          { term: 'طالب', meaning: 'student (male)' },
          { term: 'نيجيريا', meaning: 'Nigeria' }
        ],
        grammar: ['There is no present tense of "to be" in Arabic; "أنا طالب" means "I am a student" with no verb.'],
        exercises: ['Write two sentences: your name (اسمي ...) and your country (أنا من ...).']
      },
      {
        title: 'Everyday Life',
        objectives: ['Order food and drink', 'Ask for prices', 'Use polite phrases'],
        content: 'To ask for something: "أريد ..." (urīdu..., I want...) or the politer "من فضلك" (min faḍlik, please).\n\n"أريد قهوة من فضلك" (urīdu qahwa min faḍlik — I would like a coffee, please).\n\nTo ask the price: "بكم هذا؟" (bikam hādhā?, how much is this?). The answer: "بخمسة ريال" (bi-khamsa riyāl, five riyals).\n\nPolite phrases: "من فضلك" (please), "شكرا" (thank you), "عفوا" (ʿafwan, excuse me / you\'re welcome), "أين الحمام؟" (ayna al-ḥammām?, where is the bathroom?).\n\nExample:\nA: أريد شايا من فضلك.\nB: تفضل. بكم هذا؟\nA: بخمسة ريال.',
        vocabulary: [
          { term: 'أريد', meaning: 'I want / I would like' },
          { term: 'من فضلك', meaning: 'please' },
          { term: 'بكم هذا؟', meaning: 'how much is this?' },
          { term: 'عفوا', meaning: 'excuse me / you\'re welcome' },
          { term: 'قهوة / شاي', meaning: 'coffee / tea' },
          { term: 'أين الحمام؟', meaning: 'where is the bathroom?' }
        ],
        grammar: ['"من فضلك" (please) is placed after the request: "أريد قهوة من فضلك".'],
        exercises: ['Write how to order a tea and ask where the bathroom is, using أريد and أين.']
      },
      {
        title: 'Numbers',
        objectives: ['Count from 0 to 10', 'Use numbers with nouns', 'Tell the time'],
        content: 'Arabic numbers 0 to 10 (Eastern Arabic numerals used in many countries):\n٠ ٠ (ṣifr, 0), ١ (wāḥid, 1), ٢ (ithnān, 2), ٣ (thalātha, 3), ٤ (arbaʿa, 4), ٥ (khamsa, 5), ٦ (sitta, 6), ٧ (sabʿa, 7), ٨ (thamāniya, 8), ٩ (tisʿa, 9), ١٠ (ʿashara, 10).\n\nNumbers come before the noun: "ثلاثة كتب" (thalāthat kutub, three books), "خمسة أيام" (khamsat ayyām, five days).\n\nTo tell the time: "كم الساعة؟" (kam as-sāʿa?, what time is it?). "الساعة الثالثة" (as-sāʿa ath-thālitha, it is three o\'clock).\n\nExample: "كم الساعة؟ — الساعة الخامسة." (It is five o\'clock.)',
        vocabulary: [
          { term: 'واحد / اثنان / ثلاثة', meaning: 'one / two / three' },
          { term: 'خمسة / عشرة', meaning: 'five / ten' },
          { term: 'كتب', meaning: 'books (kutub)' },
          { term: 'أيام', meaning: 'days (ayyām)' },
          { term: 'كم الساعة؟', meaning: 'what time is it?' },
          { term: 'الساعة', meaning: 'the hour / clock' }
        ],
        grammar: ['Arabic numbers have gender agreement with the noun; learn the basic forms first, the details come later.'],
        exercises: ['Write the numbers 1–10 in Arabic words and digits, then say "three books" and "five days".']
      }
    ]
  },

  /* ==================== RUSSIAN ACADEMY — A1 ==================== */
  {
    academy: 'russian',
    level: 'A1',
    title: 'Russian A1 — Foundations',
    category: 'General Path',
    description: 'Learn the Cyrillic alphabet, pronunciation, greetings, introductions, basic cases and numbers. Foundation for TORFL and study in Russia.',
    learningOutcomes: [
      'Read and write the Cyrillic alphabet',
      'Pronounce Russian sounds correctly',
      'Greet people and introduce yourself',
      'Use the nominative and accusative cases and numbers'
    ],
    order: 5,
    lessons: [
      {
        title: 'The Cyrillic Alphabet',
        objectives: ['Recognise the 33 Cyrillic letters', 'Read simple words', 'Write your name in Cyrillic'],
        content: 'Russian uses the Cyrillic alphabet of 33 letters. Some look like Latin letters and sound similar: А (a), К (k), М (m), О (o), Т (t).\n\nOthers look like Latin but sound different: В (v), Н (n), Р (r), С (s), У (u), Х (kh).\n\nNew letters include: Б (b), Г (g), Д (d), Ж (zh), З (z), И (i), Й (y), Л (l), П (p), Ф (f), Ц (ts), Ч (ch), Ш (sh), Щ (shch), Ы (hard i), Э (e), Ю (yu), Я (ya).\n\nThere are two signs: Ь (soft sign) and Ъ (hard sign), which change the pronunciation of the previous consonant.\n\nRead: мама (mama — mother), папа (papa — father), дом (dom — house), кот (kot — cat).',
        vocabulary: [
          { term: 'мама', meaning: 'mother (mama)' },
          { term: 'папа', meaning: 'father (papa)' },
          { term: 'дом', meaning: 'house (dom)' },
          { term: 'кот', meaning: 'cat (kot)' },
          { term: 'А, Б, В', meaning: 'A, B, V (first letters)' },
          { term: 'Р, С, Т', meaning: 'R, S, T (letters)' }
        ],
        grammar: ['Russian has no articles (no "the" or "a"); the noun alone carries the meaning.'],
        exercises: ['Write мама, папа, дом, кот in Cyrillic and read them aloud.']
      },
      {
        title: 'Pronunciation',
        objectives: ['Stress the right syllable', 'Pronounce hard and soft consonants', 'Reduce unstressed vowels'],
        content: 'Russian stress is unpredictable and must be learned with each word. The stressed vowel is longer and clearer; unstressed vowels are reduced. For example, in "молоко" (moloko, milk) the stress is on the last "o", so the first two "o"s sound like a weak "a".\n\nConsonants can be hard or soft. Soft consonants are marked by the following vowel (я, е, ё, ю, и) or the soft sign ь. For example, "мать" (mat\', mother) ends in a soft "t", while "мат" (mat, checkmate) ends in a hard "t".\n\nImportant sounds: "ы" (a sound like the "i" in "bit" but further back), "р" (a rolled "r"), "х" (like "ch" in "loch").\n\nExample: "здравствуйте" (zdravstvuyte, hello) — the first "в" is silent.',
        vocabulary: [
          { term: 'молоко', meaning: 'milk (moloko)' },
          { term: 'здравствуйте', meaning: 'hello (zdravstvuyte)' },
          { term: 'мать', meaning: 'mother (mat\')' },
          { term: 'ударение', meaning: 'stress / accent' },
          { term: 'мягкий', meaning: 'soft' },
          { term: 'твёрдый', meaning: 'hard' }
        ],
        grammar: ['Unstressed "о" is pronounced like "а" (akanie): "молоко" sounds like "малако".'],
        exercises: ['Practise saying молоко (stress the last о) and здравствуйте slowly.']
      },
      {
        title: 'Greetings',
        objectives: ['Say hello and goodbye', 'Ask how someone is', 'Use formal and informal forms'],
        content: 'The standard greeting is "Здравствуйте" (zdravstvuyte, hello — formal) or "Привет" (privet, hi — informal).\n\n"How are you?" is "Как дела?" (kak dela?, how are things?). Answers: "Хорошо" (khorosho, well), "Нормально" (normalno, fine), "Отлично" (otlichno, great).\n\nGoodbye: "До свидания" (do svidaniya, goodbye — formal) or "Пока" (poka, bye — informal).\n\nThank you: "Спасибо" (spasibo). Please: "Пожалуйста" (pozhaluysta).\n\nExample:\nA: Здравствуйте! Как дела?\nB: Хорошо, спасибо. А у вас?\nA: Отлично!',
        vocabulary: [
          { term: 'Здравствуйте', meaning: 'hello (formal)' },
          { term: 'Привет', meaning: 'hi (informal)' },
          { term: 'Как дела?', meaning: 'how are you?' },
          { term: 'Хорошо', meaning: 'well / good' },
          { term: 'Спасибо', meaning: 'thank you' },
          { term: 'До свидания', meaning: 'goodbye (formal)' }
        ],
        grammar: ['Use "вы" (you, formal) with strangers and "ты" (you, informal) with friends — this changes verb endings.'],
        exercises: ['Write a short greeting dialogue using Здравствуйте and Как дела.']
      },
      {
        title: 'Introducing Yourself',
        objectives: ['Say your name', 'Say where you are from', 'Use the verb "to be" (implied)'],
        content: 'To say your name: "Меня зовут ..." (menya zovut..., my name is...). Ask "Как вас зовут?" (kak vas zovut?, what is your name, formal) or "Как тебя зовут?" (kak tebya zovut?, informal).\n\nTo say where you are from: "Я из Нигерии" (ya iz Nigerii, I am from Nigeria). Ask "Откуда вы?" (otkuda vy?, where are you from?).\n\nRussian omits "to be" in the present: "Я студент" (ya student, I [am] a student).\n\nExample:\nA: Как вас зовут?\nB: Меня зовут Иван. Я из Нигерии. А вас?\nA: Меня зовут Анна. Я студентка.',
        vocabulary: [
          { term: 'Меня зовут', meaning: 'my name is' },
          { term: 'Как вас зовут?', meaning: 'what is your name? (formal)' },
          { term: 'Я из', meaning: 'I am from' },
          { term: 'Откуда вы?', meaning: 'where are you from?' },
          { term: 'студент / студентка', meaning: 'student (male / female)' },
          { term: 'Нигерия', meaning: 'Nigeria' }
        ],
        grammar: ['There is no "to be" in the Russian present tense: "Я студент" = "I am a student".'],
        exercises: ['Write two sentences: your name (Меня зовут ...) and your country (Я из ...).']
      },
      {
        title: 'Basic Cases: Nominative & Accusative',
        objectives: ['Understand what cases are', 'Use the nominative for subjects', 'Use the accusative for objects'],
        content: 'Russian has six grammatical cases. Two of the most basic are:\n- Nominative: the subject of the sentence (the dictionary form).\n- Accusative: the direct object.\n\nFor masculine and neuter nouns, the accusative usually equals the nominative: "Я читаю журнал" (ya chitayu zhurnal, I read a magazine) — журнал stays the same.\n\nFor feminine nouns ending in -а/-я, the accusative changes to -у/-ю: "Я читаю книгу" (ya chitayu knigu, I read a book) — книга (book) becomes книгу.\n\nExample:\n- "Это дом" (eto dom, this is a house) — nominative.\n- "Я вижу дом" (ya vizhu dom, I see a house) — accusative (same).\n- "Я вижу машину" (ya vizhu mashinu, I see a car) — машина → машину.',
        vocabulary: [
          { term: 'книга → книгу', meaning: 'book (nominative → accusative)' },
          { term: 'машина → машину', meaning: 'car (nominative → accusative)' },
          { term: 'журнал', meaning: 'magazine' },
          { term: 'читать', meaning: 'to read' },
          { term: 'видеть', meaning: 'to see' },
          { term: 'это', meaning: 'this is' }
        ],
        grammar: ['Feminine nouns in -а/-я change to -у/-ю in the accusative; masculine/neuter nouns usually stay the same.'],
        exercises: ['Change to the accusative: "Я читаю книга" (fix it) and "Я вижу машина" (fix it).']
      },
      {
        title: 'Numbers',
        objectives: ['Count from 0 to 10', 'Use numbers with nouns', 'Tell the time'],
        content: 'Russian numbers 0 to 10:\n0 ноль (nol\'), 1 один (odin), 2 два (dva), 3 три (tri), 4 четыре (chetyre), 5 пять (pyat\'), 6 шесть (shest\'), 7 семь (sem\'), 8 восемь (vosem\'), 9 девять (devyat\'), 10 десять (desyat\').\n\nNote: 1 = один (masc.), одна (fem.), одно (neut.).\n\nNumbers agree with the noun: "один дом" (one house), "два дома" (two houses — the noun takes a special form), "пять домов" (five houses).\n\nTo tell the time: "Который час?" (kotory chas?, what time is it?). "Сейчас три часа" (seychas tri chasa, it is three o\'clock).\n\nExample: "Сейчас пять часов." (It is five o\'clock.)',
        vocabulary: [
          { term: 'один / два / три', meaning: 'one / two / three' },
          { term: 'пять / десять', meaning: 'five / ten' },
          { term: 'дом / дома / домов', meaning: 'house (forms after numbers)' },
          { term: 'Который час?', meaning: 'what time is it?' },
          { term: 'Сейчас', meaning: 'now' },
          { term: 'час', meaning: 'hour / o\'clock' }
        ],
        grammar: ['After 1 the noun is singular; after 2-4 a special form (genitive singular); after 5+ the genitive plural.'],
        exercises: ['Write the numbers 1–10 in Russian, then say "two houses" (два дома) and "five houses" (пять домов).']
      }
    ]
  }
];
