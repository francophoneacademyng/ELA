/* ============================================================
   ELA — QUIZZ PAR LEÇON (5 questions, 4 options, bonne réponse)
   Clé : "<academy>|<titre de la leçon>"
   ============================================================ */

module.exports = {
  /* ---------------- GERMAN ---------------- */
  'german|Greetings & Introductions': {
    questions: [
      { text: 'How do you say "good morning" in German?', options: ['Guten Abend', 'Guten Morgen', 'Gute Nacht', 'Auf Wiedersehen'], correctIndex: 1 },
      { text: '"Wie geht es Ihnen?" means...', options: ['Where are you from?', 'What is your name?', 'How are you? (formal)', 'Goodbye'], correctIndex: 2 },
      { text: 'Which is the informal greeting among friends?', options: ['Hallo', 'Guten Tag', 'Auf Wiedersehen', 'Guten Abend'], correctIndex: 0 },
      { text: 'The polite answer "Mir geht es gut" means...', options: ['I am from Germany', 'I am well', 'I am tired', 'See you later'], correctIndex: 1 },
      { text: 'How do you say "goodbye" formally?', options: ['Tschüss', 'Hallo', 'Auf Wiedersehen', 'Bitte'], correctIndex: 2 }
    ]
  },
  'german|Alphabet & Pronunciation': {
    questions: [
      { text: 'The German letter "w" is pronounced like the English...', options: ['w', 'v', 'f', 'b'], correctIndex: 1 },
      { text: 'The letter "ß" is called...', options: ['Umlaut', 'Eszett (sharp s)', 'Delta', 'Sigma'], correctIndex: 1 },
      { text: 'In "heißen", the "ei" sounds like...', options: ['ee', 'eye', 'oy', 'ay'], correctIndex: 1 },
      { text: 'The sound "ü" is produced with...', options: ['open lips', 'rounded lips', 'no tongue', 'a nasal sound'], correctIndex: 1 },
      { text: 'Which word contains the sharp "s" (ß)?', options: ['Wasser', 'Straße', 'Zeit', 'Vater'], correctIndex: 1 }
    ]
  },
  'german|Introducing Yourself': {
    questions: [
      { text: '"Ich heiße Ada" means...', options: ['I live in Ada', 'My name is Ada', 'I like Ada', 'I am from Ada'], correctIndex: 1 },
      { text: 'How do you ask "Where are you from?" (informal)?', options: ['Wie alt bist du?', 'Woher kommst du?', 'Wie heißt du?', 'Was machst du?'], correctIndex: 1 },
      { text: '"Ich komme aus Nigeria" means...', options: ['I come from Nigeria', 'I go to Nigeria', 'I live in Nigeria', 'I like Nigeria'], correctIndex: 0 },
      { text: '"Wie alt bist du?" means...', options: ['How are you?', 'How old are you?', 'Where are you?', 'Who are you?'], correctIndex: 1 },
      { text: 'Which verb is in the second position in "Ich heiße Chidi"?', options: ['Ich', 'heiße', 'Chidi', 'none'], correctIndex: 1 }
    ]
  },
  'german|Numbers & Counting': {
    questions: [
      { text: 'How do you write 21 in German?', options: ['zwanzigeins', 'einundzwanzig', 'zwanzigundein', 'einszwanzig'], correctIndex: 1 },
      { text: '"fünfzehn" is the number...', options: ['5', '15', '50', '25'], correctIndex: 1 },
      { text: '"Wie spät ist es?" means...', options: ['What day is it?', 'What time is it?', 'How old are you?', 'How much is it?'], correctIndex: 1 },
      { text: 'The number "achtzig" is...', options: ['18', '80', '8', '88'], correctIndex: 1 },
      { text: '"Es ist drei Uhr" means...', options: ['It is three o\'clock', 'It is three days', 'It is half past three', 'It is thirteen hours'], correctIndex: 0 }
    ]
  },
  'german|Everyday Life & Useful Phrases': {
    questions: [
      { text: '"Ich möchte einen Kaffee, bitte" means...', options: ['I want coffee now', 'I would like a coffee, please', 'I have a coffee', 'The coffee is good'], correctIndex: 1 },
      { text: 'How do you say "thank you very much"?', options: ['Bitte', 'Entschuldigung', 'Danke schön', 'Guten Tag'], correctIndex: 2 },
      { text: '"links" means...', options: ['right', 'left', 'straight', 'back'], correctIndex: 1 },
      { text: '"Entschuldigung" is used to say...', options: ['thank you', 'excuse me / sorry', 'goodbye', 'please'], correctIndex: 1 },
      { text: '"geradeaus" means...', options: ['turn left', 'turn right', 'straight ahead', 'stop'], correctIndex: 2 }
    ]
  },
  'german|Articles: der, die, das': {
    questions: [
      { text: 'The masculine article is...', options: ['die', 'das', 'der', 'ein'], correctIndex: 2 },
      { text: 'The correct article for "Mann" (man) is...', options: ['der', 'die', 'das', 'eine'], correctIndex: 0 },
      { text: '"das Kind" means...', options: ['the man', 'the woman', 'the child', 'the house'], correctIndex: 2 },
      { text: 'The indefinite article for a feminine noun is...', options: ['ein', 'eine', 'das', 'der'], correctIndex: 1 },
      { text: 'Words ending in "-chen" are usually...', options: ['masculine', 'feminine', 'neuter', 'plural'], correctIndex: 2 }
    ]
  },
  'german|Essential Verbs: sein, haben, heißen': {
    questions: [
      { text: 'The correct form is "ich ___ Student" (to be)', options: ['ist', 'bin', 'bist', 'sind'], correctIndex: 1 },
      { text: '"du bist" means...', options: ['I am', 'you are (informal)', 'he is', 'we are'], correctIndex: 1 },
      { text: '"Sie hat ein Buch" means...', options: ['She has a book', 'She is a book', 'She reads a book', 'They have a book'], correctIndex: 0 },
      { text: 'The correct form is "wir ___ Zeit" (to have)', options: ['habe', 'hast', 'haben', 'hat'], correctIndex: 2 },
      { text: '"sein" means...', options: ['to have', 'to be', 'to be called', 'to go'], correctIndex: 1 }
    ]
  },
  'german|The Perfekt (Present Perfect)': {
    questions: [
      { text: 'The Perfekt of "machen" is...', options: ['gemacht', 'gemachen', 'machte', 'gemach'], correctIndex: 0 },
      { text: '"Ich habe gegessen" means...', options: ['I ate / have eaten', 'I am eating', 'I will eat', 'I drink'], correctIndex: 0 },
      { text: 'Which verb uses "sein" in the Perfekt?', options: ['machen', 'gehen', 'lernen', 'spielen'], correctIndex: 1 },
      { text: '"Ich bin gegangen" means...', options: ['I have gone / went', 'I am going', 'I go', 'I will go'], correctIndex: 0 },
      { text: 'In "Ich habe gestern Deutsch gelernt", the participle goes...', options: ['at the beginning', 'after haben', 'at the end', 'nowhere'], correctIndex: 2 }
    ]
  },

  /* ---------------- MANDARIN ---------------- */
  'mandarin|Pinyin & the Four Tones': {
    questions: [
      { text: 'How many tones does Mandarin have (plus neutral)?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { text: 'The third tone is...', options: ['high and level', 'rising', 'falling then rising', 'sharp falling'], correctIndex: 2 },
      { text: '"mā" (1st tone) means...', options: ['horse', 'mother', 'scold', 'hemp'], correctIndex: 1 },
      { text: 'Pinyin is...', options: ['a dialect', 'the romanisation of Chinese', 'a type of character', 'a tone'], correctIndex: 1 },
      { text: 'In "nǐ hǎo", the two third tones are pronounced...', options: ['both third tone', 'first becomes second tone', 'both neutral', 'both first tone'], correctIndex: 1 }
    ]
  },
  'mandarin|Greetings': {
    questions: [
      { text: '"nǐ hǎo" (你好) means...', options: ['goodbye', 'hello', 'thank you', 'sorry'], correctIndex: 1 },
      { text: '"Nǐ hǎo ma?" means...', options: ['How are you?', 'What is your name?', 'Where are you?', 'Good morning'], correctIndex: 0 },
      { text: '"xièxie" (谢谢) means...', options: ['please', 'thank you', 'hello', 'bye'], correctIndex: 1 },
      { text: '"zàijiàn" (再见) means...', options: ['see you again / goodbye', 'welcome', 'good morning', 'please'], correctIndex: 0 },
      { text: 'The polite "hello" using 您 is...', options: ['nǐ hǎo', 'nín hǎo', 'zàijiàn', 'bú kèqi'], correctIndex: 1 }
    ]
  },
  'mandarin|Basic Characters': {
    questions: [
      { text: '人 (rén) means...', options: ['big', 'person', 'sun', 'mountain'], correctIndex: 1 },
      { text: '大 (dà) means...', options: ['small', 'big', 'day', 'moon'], correctIndex: 1 },
      { text: '中国 (Zhōngguó) means...', options: ['Japan', 'China', 'Korea', 'Beijing'], correctIndex: 1 },
      { text: '日 (rì) means...', options: ['moon', 'sun / day', 'person', 'big'], correctIndex: 1 },
      { text: 'Stroke order generally goes...', options: ['bottom to top', 'top to bottom, left to right', 'right to left', 'random'], correctIndex: 1 }
    ]
  },
  'mandarin|Introducing Yourself': {
    questions: [
      { text: '"Wǒ jiào..." (我叫) means...', options: ['I am called...', 'I am from...', 'I like...', 'I have...'], correctIndex: 0 },
      { text: '"Nǐ jiào shénme míngzi?" means...', options: ['How old are you?', 'What is your name?', 'Where are you from?', 'How are you?'], correctIndex: 1 },
      { text: '"Wǒ shì Nírìlìyà rén" means...', options: ['I am Chinese', 'I am Nigerian', 'I am a teacher', 'I am a student'], correctIndex: 1 },
      { text: '"shì" (是) means...', options: ['to have', 'to be', 'to go', 'to eat'], correctIndex: 1 },
      { text: '"Nǐ shì nǎ guó rén?" means...', options: ['What is your name?', 'What country are you from?', 'Where do you live?', 'What do you do?'], correctIndex: 1 }
    ]
  },
  'mandarin|Numbers & Counting': {
    questions: [
      { text: 'The number 10 in pinyin is...', options: ['sān', 'shí', 'wǔ', 'bā'], correctIndex: 1 },
      { text: '"èrshíyī" (二十一) is the number...', options: ['12', '21', '11', '20'], correctIndex: 1 },
      { text: 'Before a measure word, "two" is...', options: ['èr', 'liǎng', 'sān', 'yī'], correctIndex: 1 },
      { text: '"sān gè rén" (三个人) means...', options: ['three people', 'three books', 'three days', 'three apples'], correctIndex: 0 },
      { text: '"yī bǎi" (一百) is the number...', options: ['10', '100', '1000', '1'], correctIndex: 1 }
    ]
  },
  'mandarin|Basic Sentence Structure': {
    questions: [
      { text: 'Mandarin word order is...', options: ['SOV', 'SVO', 'VSO', 'OVS'], correctIndex: 1 },
      { text: '"wǒ xué Zhōngwén" (我学中文) means...', options: ['I speak Chinese', 'I study Chinese', 'I like Chinese', 'I am Chinese'], correctIndex: 1 },
      { text: 'The negation "bù" (不) goes...', options: ['after the verb', 'before the verb', 'at the end', 'nowhere'], correctIndex: 1 },
      { text: 'The particle "ma" (吗) turns a sentence into...', options: ['a negative', 'a question', 'a past tense', 'a plural'], correctIndex: 1 },
      { text: '"wǒ bù shuō Fǎyǔ" means...', options: ['I speak French', 'I don\'t speak French', 'I study French', 'I like French'], correctIndex: 1 }
    ]
  },

  /* ---------------- ENGLISH ---------------- */
  'english|Essential Grammar: to be & to have': {
    questions: [
      { text: 'Choose the correct form: "She ___ a doctor."', options: ['am', 'is', 'are', 'be'], correctIndex: 1 },
      { text: 'Choose the correct form: "They ___ students."', options: ['is', 'are', 'am', 'be'], correctIndex: 1 },
      { text: '"Does he have a car?" is...', options: ['a question', 'a negative', 'a statement', 'a command'], correctIndex: 0 },
      { text: 'The contraction "I\'m" means...', options: ['I have', 'I am', 'I was', 'I will'], correctIndex: 1 },
      { text: 'With "he/she/it", we use...', options: ['have', 'has', 'having', 'had'], correctIndex: 1 }
    ]
  },
  'english|Everyday Conversation: Greetings & Small Talk': {
    questions: [
      { text: 'A formal morning greeting is...', options: ['Hey', 'Good morning', 'What\'s up?', 'Yo'], correctIndex: 1 },
      { text: '"What do you do?" asks about...', options: ['your name', 'your job', 'your age', 'your home'], correctIndex: 1 },
      { text: 'A natural answer to "How are you?" is...', options: ['I am a student', 'I\'m fine, thanks', 'I\'m from Lagos', 'Nice to meet you'], correctIndex: 1 },
      { text: '"Nice to meet you" is said...', options: ['when leaving', 'when meeting someone', 'when apologising', 'when ordering'], correctIndex: 1 },
      { text: '"Not bad" means...', options: ['terrible', 'so-so / okay', 'excellent', 'angry'], correctIndex: 1 }
    ]
  },
  'english|Professional English: Introductions at Work': {
    questions: [
      { text: 'A polite way to introduce yourself at work is...', options: ['Hey dude', 'Let me introduce myself', 'Yo', 'What\'s up'], correctIndex: 1 },
      { text: '"I\'m responsible for customer support" means...', options: ['it is my duty', 'I dislike it', 'I quit', 'I ignore it'], correctIndex: 0 },
      { text: '"Could you help me with...?" is a...', options: ['polite request', 'command', 'complaint', 'greeting'], correctIndex: 0 },
      { text: '"I\'ll get back to you" means...', options: ['I will reply later', 'I am leaving', 'I forgot', 'I disagree'], correctIndex: 0 },
      { text: 'A "colleague" is...', options: ['a friend', 'a co-worker', 'a boss', 'a customer'], correctIndex: 1 }
    ]
  },
  'english|Essential Grammar: Present Simple': {
    questions: [
      { text: 'The present simple describes...', options: ['past events', 'habits and routines', 'future plans only', 'single past action'], correctIndex: 1 },
      { text: 'Choose the correct form: "She ___ in Abuja."', options: ['live', 'lives', 'living', 'lived'], correctIndex: 1 },
      { text: '"Do you work here?" is...', options: ['a negative', 'a question', 'a statement', 'a command'], correctIndex: 1 },
      { text: 'Choose the negative: "He ___ (not) like coffee."', options: ['don\'t', 'doesn\'t', 'isn\'t', 'aren\'t'], correctIndex: 1 },
      { text: '"She studies" (study → studies) shows the rule...', options: ['add -s for he/she/it', 'add -ed', 'add -ing', 'no change'], correctIndex: 0 }
    ]
  },
  'english|Everyday Conversation: Asking Questions': {
    questions: [
      { text: 'The WH-word for a place is...', options: ['what', 'where', 'who', 'why'], correctIndex: 1 },
      { text: '"Where do you live?" asks about...', options: ['time', 'place', 'reason', 'person'], correctIndex: 1 },
      { text: '"Sorry, could you repeat that?" is used to...', options: ['apologise for a mistake', 'ask for clarification', 'say goodbye', 'refuse'], correctIndex: 1 },
      { text: '"What do you mean?" asks for...', options: ['clarification', 'a date', 'a name', 'a price'], correctIndex: 0 },
      { text: 'The correct question order is...', options: ['question word + auxiliary + subject + verb', 'subject + verb + question word', 'verb + question word + subject', 'question word + verb + auxiliary'], correctIndex: 0 }
    ]
  },
  'english|Professional English: Emails & Meetings': {
    questions: [
      { text: 'A common email opening is...', options: ['I am writing to...', 'Hey!', 'Whatever', 'Bye'], correctIndex: 0 },
      { text: '"Please find attached" means...', options: ['see the attachment', 'I lost it', 'delete it', 'ignore it'], correctIndex: 0 },
      { text: 'A polite email sign-off is...', options: ['Best regards', 'Later', 'Ok bye', 'Whatever'], correctIndex: 0 },
      { text: '"I\'d like to add something" is said...', options: ['in a meeting to contribute', 'to end a meeting', 'to refuse', 'to leave'], correctIndex: 0 },
      { text: '"Let\'s move on" means...', options: ['continue to the next topic', 'stop the meeting', 'leave the room', 'change jobs'], correctIndex: 0 }
    ]
  },

  /* ---------------- ARABIC ---------------- */
  'arabic|The Arabic Alphabet': {
    questions: [
      { text: 'How many letters does the Arabic alphabet have?', options: ['26', '28', '30', '22'], correctIndex: 1 },
      { text: 'Arabic is written...', options: ['left to right', 'right to left', 'top to bottom', 'in columns'], correctIndex: 1 },
      { text: 'The letter ا (alif) sounds like...', options: ['b', 'a', 'm', 't'], correctIndex: 1 },
      { text: 'The letter ب (bā\') sounds like...', options: ['b', 't', 'j', 'd'], correctIndex: 0 },
      { text: 'The deep throat sound ع is called...', options: ['alif', 'ʿayn', 'bā\'', 'dāl'], correctIndex: 1 }
    ]
  },
  'arabic|Reading & Connecting Letters': {
    questions: [
      { text: 'The word باب (bāb) means...', options: ['book', 'door', 'house', 'hand'], correctIndex: 1 },
      { text: 'كتاب (kitāb) means...', options: ['door', 'book', 'house', 'hand'], correctIndex: 1 },
      { text: 'Which letters never connect to the following letter?', options: ['ب ت ث', 'ا د ذ ر ز و', 'ج ح خ', 'م ن ه'], correctIndex: 1 },
      { text: 'The short vowel "a" is called...', options: ['kasra', 'damma', 'fatha', 'sukun'], correctIndex: 2 },
      { text: 'بيت (bayt) means...', options: ['house', 'book', 'door', 'hand'], correctIndex: 0 }
    ]
  },
  'arabic|Greetings': {
    questions: [
      { text: '"السلام عليكم" means...', options: ['goodbye', 'peace be upon you (hello)', 'thank you', 'how are you'], correctIndex: 1 },
      { text: 'The reply to السلام عليكم is...', options: ['شكرا', 'وعليكم السلام', 'مرحبا', 'مع السلامة'], correctIndex: 1 },
      { text: '"كيف حالك؟" means...', options: ['how are you?', 'what is your name?', 'where are you from?', 'goodbye'], correctIndex: 0 },
      { text: '"شكرا" means...', options: ['please', 'thank you', 'hello', 'sorry'], correctIndex: 1 },
      { text: '"مع السلامة" means...', options: ['hello', 'goodbye', 'welcome', 'please'], correctIndex: 1 }
    ]
  },
  'arabic|Introducing Yourself': {
    questions: [
      { text: '"اسمي" means...', options: ['my name is', 'I am from', 'I like', 'I have'], correctIndex: 0 },
      { text: '"ما اسمك؟" means...', options: ['how are you?', 'what is your name?', 'where are you?', 'how old are you?'], correctIndex: 1 },
      { text: '"أنا من نيجيريا" means...', options: ['I am in Nigeria', 'I am from Nigeria', 'I go to Nigeria', 'I like Nigeria'], correctIndex: 1 },
      { text: 'In "أنا طالب" (I am a student), the verb "to be"...', options: ['is present', 'is omitted', 'is "is"', 'is "am"'], correctIndex: 1 },
      { text: '"من أين أنت؟" means...', options: ['where are you from?', 'what is your name?', 'how are you?', 'where do you live?'], correctIndex: 0 }
    ]
  },
  'arabic|Everyday Life': {
    questions: [
      { text: '"أريد" means...', options: ['I want / I would like', 'I have', 'I am', 'I go'], correctIndex: 0 },
      { text: '"بكم هذا؟" means...', options: ['where is this?', 'how much is this?', 'what is this?', 'who is this?'], correctIndex: 1 },
      { text: '"من فضلك" means...', options: ['thank you', 'please', 'sorry', 'goodbye'], correctIndex: 1 },
      { text: '"أين الحمام؟" means...', options: ['where is the bathroom?', 'where is the station?', 'where is the shop?', 'what time is it?'], correctIndex: 0 },
      { text: '"قهوة" (qahwa) means...', options: ['tea', 'coffee', 'water', 'milk'], correctIndex: 1 }
    ]
  },
  'arabic|Numbers': {
    questions: [
      { text: 'The number 5 in Arabic is...', options: ['ثلاثة', 'خمسة', 'عشرة', 'واحد'], correctIndex: 1 },
      { text: 'The number 10 in Arabic is...', options: ['خمسة', 'عشرة', 'سبعة', 'تسعة'], correctIndex: 1 },
      { text: '"ثلاثة كتب" means...', options: ['three books', 'three days', 'three people', 'three houses'], correctIndex: 0 },
      { text: '"كم الساعة؟" means...', options: ['what time is it?', 'how much?', 'where is it?', 'how are you?'], correctIndex: 0 },
      { text: 'The Arabic digit ٥ is...', options: ['3', '5', '7', '9'], correctIndex: 1 }
    ]
  },

  /* ---------------- RUSSIAN ---------------- */
  'russian|The Cyrillic Alphabet': {
    questions: [
      { text: 'How many letters are in the Cyrillic alphabet?', options: ['26', '33', '28', '30'], correctIndex: 1 },
      { text: 'The Cyrillic letter "В" sounds like...', options: ['b', 'v', 'w', 'f'], correctIndex: 1 },
      { text: 'The Cyrillic letter "Р" sounds like...', options: ['p', 'r', 'b', 'd'], correctIndex: 1 },
      { text: '"дом" (dom) means...', options: ['cat', 'house', 'mother', 'book'], correctIndex: 1 },
      { text: 'The Cyrillic letter "С" sounds like...', options: ['k', 's', 'c', 't'], correctIndex: 1 }
    ]
  },
  'russian|Pronunciation': {
    questions: [
      { text: 'Unstressed "о" in Russian is pronounced like...', options: ['o', 'a', 'u', 'e'], correctIndex: 1 },
      { text: '"молоко" (milk) is stressed on...', options: ['the first о', 'the second о', 'the last о', 'no vowel'], correctIndex: 2 },
      { text: 'The soft sign "ь" makes the previous consonant...', options: ['hard', 'soft', 'silent', 'double'], correctIndex: 1 },
      { text: 'The letter "х" sounds like...', options: ['h', 'ch in "loch"', 'sh', 'k'], correctIndex: 1 },
      { text: '"здравствуйте" means...', options: ['goodbye', 'hello', 'thank you', 'please'], correctIndex: 1 }
    ]
  },
  'russian|Greetings': {
    questions: [
      { text: '"Привет" (privet) means...', options: ['hello (informal)', 'goodbye', 'thank you', 'please'], correctIndex: 0 },
      { text: '"Здравствуйте" is the...', options: ['informal hello', 'formal hello', 'goodbye', 'sorry'], correctIndex: 1 },
      { text: '"Как дела?" means...', options: ['how are you?', 'what is your name?', 'where are you?', 'what time is it?'], correctIndex: 0 },
      { text: '"Спасибо" means...', options: ['please', 'thank you', 'hello', 'goodbye'], correctIndex: 1 },
      { text: '"До свидания" means...', options: ['hello', 'goodbye (formal)', 'welcome', 'sorry'], correctIndex: 1 }
    ]
  },
  'russian|Introducing Yourself': {
    questions: [
      { text: '"Меня зовут ..." means...', options: ['my name is...', 'I am from...', 'I like...', 'I have...'], correctIndex: 0 },
      { text: '"Как вас зовут?" means...', options: ['how are you?', 'what is your name? (formal)', 'where are you from?', 'how old are you?'], correctIndex: 1 },
      { text: '"Я из Нигерии" means...', options: ['I am in Nigeria', 'I am from Nigeria', 'I go to Nigeria', 'I like Nigeria'], correctIndex: 1 },
      { text: 'In "Я студент" (I am a student), the verb "to be"...', options: ['is present', 'is omitted', 'is "am"', 'is "is"'], correctIndex: 1 },
      { text: '"Откуда вы?" means...', options: ['where are you from?', 'what is your name?', 'how are you?', 'where do you live?'], correctIndex: 0 }
    ]
  },
  'russian|Basic Cases: Nominative & Accusative': {
    questions: [
      { text: 'The nominative case is used for...', options: ['the subject', 'the object', 'possession', 'location'], correctIndex: 0 },
      { text: 'The accusative case is used for...', options: ['the subject', 'the direct object', 'possession', 'time'], correctIndex: 1 },
      { text: '"книга" (book) in the accusative becomes...', options: ['книгу', 'книги', 'книгой', 'книге'], correctIndex: 0 },
      { text: '"Я вижу машину" means...', options: ['I see a car', 'I have a car', 'I drive a car', 'I like a car'], correctIndex: 0 },
      { text: 'Masculine nouns in the accusative usually...', options: ['change a lot', 'stay the same as the nominative', 'add -у', 'add -и'], correctIndex: 1 }
    ]
  },
  'russian|Numbers': {
    questions: [
      { text: 'The number 5 in Russian is...', options: ['три', 'пять', 'десять', 'семь'], correctIndex: 1 },
      { text: 'The number 10 in Russian is...', options: ['пять', 'десять', 'восемь', 'два'], correctIndex: 1 },
      { text: '"два дома" means...', options: ['two houses', 'five houses', 'one house', 'ten houses'], correctIndex: 0 },
      { text: '"Который час?" means...', options: ['what time is it?', 'how much?', 'where?', 'how are you?'], correctIndex: 0 },
      { text: '"Сейчас три часа" means...', options: ['It is three o\'clock', 'It is three days', 'It is five o\'clock', 'It is three houses'], correctIndex: 0 }
    ]
  }
};
