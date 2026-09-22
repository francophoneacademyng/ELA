/* ============================================================
   ELA — functions/curriculum-content.js
   ------------------------------------------------------------
   Contenu curriculaire ELA-owned, spécifique à chaque langue.
   Version 2 (deep authoring) :
     - vocabulaire élargi
     - 6 exemples par module (uniques par leçon)
     - dialogue authentique par module
     - banque d'exemples avancés par langue (B1+)
     - 6 types de leçon distincts par module
     - évaluations formatives productives (pas de corrigé côté client)

   États : A1/A2/B1/B2 → DRAFT ; C1/C2 (+HSK5/6) → REVIEW_REQUIRED.
   Aucun contenu n'est APPROVED/PUBLISHED : la revue académique ELA
   reste à effectuer.
   ============================================================ */

const LANGUAGES = {
  FR: {
    language: 'French', script: 'Latin',
    pronunciation: ['voyelles nasales (on, an, in)', 'liaison', 'élision (l’ami)', 'rythme et accentuation finale'],
    culture: ['salutations formelles/informelles', 'politesse et « vous »', 'repas et convivialité', 'fêtes francophones'],
    advancedExamples: [
      "Quand j'étais enfant, je passais mes vacances chez mes grands-parents.",
      "Si j'avais plus de temps, je voyagerais davantage.",
      'Il faut que tu apprennes les règles de grammaire.',
      'Le rapport a été publié la semaine dernière.',
      'Malgré la pluie, nous sommes sortis.',
      "Ce que je préfère, c'est la littérature francophone.",
      "Bien qu'il soit fatigué, il continue à travailler.",
      'Les mesures prises ont amélioré la situation.',
      "On m'a demandé de présenter le projet.",
      'Plus on pratique, plus on progresse.'
    ],
    modules: [
      { theme: 'Salutations et présentations', vocab: [['bonjour', 'hello'], ['bonsoir', 'good evening'], ['au revoir', 'goodbye'], ['merci', 'thank you'], ["s'il vous plaît", 'please'], ['oui / non', 'yes / no'], ['excusez-moi', 'excuse me']],
        examples: ["Bonjour, je m'appelle Awa.", 'Comment allez-vous ?', 'Très bien, merci.', 'Au revoir, à demain !', "S'il vous plaît, parlez lentement.", 'Excusez-moi, je ne comprends pas.'],
        dialogue: ['Bonjour ! Vous vous appelez comment ?', "Je m'appelle Awa. Et vous ?", "Moi, c'est Paul. Enchanté !", 'Enchantée, Paul.'] },
      { theme: 'Identité personnelle', vocab: [["je m'appelle", 'my name is'], ['j’ai … ans', 'I am … years old'], ['la famille', 'the family'], ['la mère / le père', 'mother / father'], ['le frère / la sœur', 'brother / sister'], ["l'ami / l'amie", 'friend (m/f)']],
        examples: ["J'ai vingt ans.", "J'habite à Lagos.", 'Voici ma sœur.', 'Ma mère est professeur.', "Mon père travaille à l'hôpital.", "J'ai un frère et une sœur."],
        dialogue: ['Tu as des frères et sœurs ?', "Oui, j'ai un frère et une sœur.", 'Ils ont quel âge ?', 'Mon frère a dix ans et ma sœur a quinze ans.'] },
      { theme: 'Vie quotidienne', vocab: [["l'heure", 'the time'], ['le matin', 'the morning'], ['manger / boire', 'to eat / to drink'], ['le pain', 'bread'], ["l'eau", 'water'], ['le café', 'coffee'], ['se lever', 'to get up']],
        examples: ['Je me lève à sept heures.', 'Je prends du café le matin.', 'Je vais au travail à huit heures.', 'Le soir, je lis un livre.', 'Je dîne à dix-neuf heures.', 'Je me couche à vingt-deux heures.'],
        dialogue: ['À quelle heure tu te lèves ?', 'À sept heures. Et toi ?', 'Moi, je me lève à six heures.', 'Tu te couches tôt ?'] },
      { theme: 'Environnement immédiat', vocab: [['la maison', 'house'], ['la ville', 'city'], ['la rue', 'street'], ['à gauche / à droite', 'left / right'], ['tout droit', 'straight on'], ['la gare', 'station'], ['le magasin', 'shop']],
        examples: ["J'habite dans une petite ville.", 'La gare est à droite.', 'Le magasin est en face de la banque.', 'Tournez à gauche, puis tout droit.', 'Il y a un marché près de chez moi.', "C'est loin d'ici ?"],
        dialogue: ['Excusez-moi, où est la gare ?', "C'est tout droit, à droite.", "C'est loin ?", 'Non, cinq minutes à pied.'] },
      { theme: 'Travail et loisirs', vocab: [['le travail', 'work'], ["l'école", 'school'], ['lire / écrire', 'to read / to write'], ['jouer', 'to play'], ['le sport', 'sport'], ['la musique', 'music'], ['aimer', 'to like']],
        examples: ["J'aime la musique et le sport.", 'Elle travaille dans une école.', 'Je joue au football le week-end.', 'Il étudie le français.', 'Nous aimons voyager.', 'Ils regardent un film ce soir.'],
        dialogue: ["Qu'est-ce que tu aimes faire ?", "J'aime lire et écouter de la musique.", "Tu joues d'un instrument ?", 'Oui, je joue du piano.'] },
      { theme: 'Culture et intégration', vocab: [['la fête', 'festival'], ['la tradition', 'tradition'], ['la cuisine', 'cooking/food'], ['le musée', 'museum'], ['la langue', 'language'], ['le pays', 'country'], ['voyager', 'to travel']],
        examples: ['Nous découvrons la cuisine locale.', 'La fête nationale est en juillet.', "J'aime la musique africaine.", 'Il y a un musée intéressant ici.', 'Nous apprenons la langue et la culture.', "Voyager ouvre l'esprit."],
        dialogue: ['Tu connais la fête des cultures ?', "Oui, c'est en octobre.", 'On y va ensemble ?', 'Avec plaisir !'] }
    ]
  },
  DE: {
    language: 'German', script: 'Latin',
    pronunciation: ['Umlaute (ä, ö, ü)', 'ich-Laut / ach-Laut', 'Auslautverhärtung', 'Wortakzent'],
    culture: ['formelle/informelle Begrüßung (Sie/du)', 'Pünktlichkeit', 'Sonntagsruhe', 'Feste und Traditionen'],
    advancedExamples: [
      'Als ich Kind war, verbrachte ich die Ferien bei meinen Großeltern.',
      'Wenn ich mehr Zeit hätte, würde ich mehr reisen.',
      'Es ist wichtig, dass man die Grammatikregeln lernt.',
      'Der Bericht wurde letzte Woche veröffentlicht.',
      'Trotz des Regens sind wir ausgegangen.',
      'Was mir am besten gefällt, ist die deutschsprachige Literatur.',
      'Obwohl er müde ist, arbeitet er weiter.',
      'Die ergriffenen Maßnahmen haben die Lage verbessert.',
      'Man hat mich gebeten, das Projekt vorzustellen.',
      'Je mehr man übt, desto mehr Fortschritte macht man.'
    ],
    modules: [
      { theme: 'Begrüßungen und Vorstellung', vocab: [['hallo', 'hello'], ['guten Tag', 'good day'], ['auf Wiedersehen', 'goodbye'], ['danke', 'thank you'], ['bitte', 'please'], ['ja / nein', 'yes / no'], ['Entschuldigung', 'excuse me']],
        examples: ['Hallo, ich heiße Awa.', 'Wie geht es Ihnen?', 'Gut, danke.', 'Auf Wiedersehen, bis morgen!', 'Bitte sprechen Sie langsam.', 'Entschuldigung, ich verstehe nicht.'],
        dialogue: ['Hallo! Wie heißen Sie?', 'Ich heiße Awa. Und Sie?', 'Ich bin Paul. Freut mich!', 'Freut mich auch.'] },
      { theme: 'Persönliche Identität', vocab: [['ich heiße', 'my name is'], ['ich bin … Jahre alt', 'I am … years old'], ['die Familie', 'family'], ['die Mutter / der Vater', 'mother / father'], ['der Bruder / die Schwester', 'brother / sister'], ['der Freund', 'friend']],
        examples: ['Ich bin zwanzig Jahre alt.', 'Ich wohne in Lagos.', 'Das ist meine Schwester.', 'Meine Mutter ist Lehrerin.', 'Mein Vater arbeitet im Krankenhaus.', 'Ich habe einen Bruder und eine Schwester.'],
        dialogue: ['Hast du Geschwister?', 'Ja, ich habe einen Bruder und eine Schwester.', 'Wie alt sind sie?', 'Mein Bruder ist zehn und meine Schwester ist fünfzehn.'] },
      { theme: 'Alltag', vocab: [['die Uhrzeit', 'time'], ['der Morgen', 'morning'], ['essen / trinken', 'to eat / to drink'], ['das Brot', 'bread'], ['das Wasser', 'water'], ['der Kaffee', 'coffee'], ['aufstehen', 'to get up']],
        examples: ['Ich stehe um sieben Uhr auf.', 'Ich trinke morgens Kaffee.', 'Ich gehe um acht zur Arbeit.', 'Abends lese ich ein Buch.', 'Ich esse um sieben Uhr zu Abend.', 'Ich gehe um zehn Uhr schlafen.'],
        dialogue: ['Wann stehst du auf?', 'Um sieben Uhr. Und du?', 'Ich stehe um sechs Uhr auf.', 'Gehst du früh schlafen?'] },
      { theme: 'Nähere Umgebung', vocab: [['das Haus', 'house'], ['die Stadt', 'city'], ['die Straße', 'street'], ['links / rechts', 'left / right'], ['geradeaus', 'straight on'], ['der Bahnhof', 'station'], ['der Laden', 'shop']],
        examples: ['Ich wohne in einer kleinen Stadt.', 'Der Bahnhof ist rechts.', 'Der Laden ist gegenüber der Bank.', 'Gehen Sie links, dann geradeaus.', 'Es gibt einen Markt bei mir.', 'Ist es weit von hier?'],
        dialogue: ['Entschuldigung, wo ist der Bahnhof?', 'Geradeaus, dann rechts.', 'Ist es weit?', 'Nein, fünf Minuten zu Fuß.'] },
      { theme: 'Arbeit und Freizeit', vocab: [['die Arbeit', 'work'], ['die Schule', 'school'], ['lesen / schreiben', 'to read / to write'], ['spielen', 'to play'], ['der Sport', 'sport'], ['die Musik', 'music'], ['mögen', 'to like']],
        examples: ['Ich mag Musik und Sport.', 'Sie arbeitet in einer Schule.', 'Am Wochenende spiele ich Fußball.', 'Er lernt Deutsch.', 'Wir reisen gern.', 'Sie sehen heute Abend einen Film.'],
        dialogue: ['Was machst du gern?', 'Ich lese gern und höre Musik.', 'Spielst du ein Instrument?', 'Ja, ich spiele Klavier.'] },
      { theme: 'Kultur und Integration', vocab: [['das Fest', 'festival'], ['die Tradition', 'tradition'], ['das Essen', 'food'], ['das Museum', 'museum'], ['die Sprache', 'language'], ['das Land', 'country'], ['reisen', 'to travel']],
        examples: ['Wir entdecken die lokale Küche.', 'Das Nationalfest ist im Juli.', 'Ich mag afrikanische Musik.', 'Hier gibt es ein interessantes Museum.', 'Wir lernen Sprache und Kultur.', 'Reisen öffnet den Geist.'],
        dialogue: ['Kennst du das Kulturfest?', 'Ja, es ist im Oktober.', 'Gehen wir zusammen hin?', 'Gern!'] }
    ]
  },
  ZH: {
    language: 'Mandarin Chinese', script: 'Chinese characters (simplified) + pinyin',
    pronunciation: ['four tones + neutral tone', 'initials/finals', 'tone sandhi (不 bù, 一 yī)', 'retroflex zh/ch/sh'],
    culture: ['greetings and politeness', 'family and hierarchy', 'festivals (春节, 中秋)', 'food culture'],
    advancedExamples: [
      '我小时候常常去爷爷奶奶家。 (Wǒ xiǎoshíhou chángcháng qù yéye nǎinai jiā.)',
      '如果我有更多时间，我就会去旅行。 (Rúguǒ wǒ yǒu gèng duō shíjiān, wǒ jiù huì qù lǚxíng.)',
      '学好语法很重要。 (Xué hǎo yǔfǎ hěn zhòngyào.)',
      '报告是上星期发表的。 (Bàogào shì shàng xīngqī fābiǎo de.)',
      '尽管下雨，我们还是出去了。 (Jǐnguǎn xià yǔ, wǒmen háishi chūqù le.)',
      '我最喜欢的是中文文学。 (Wǒ zuì xǐhuan de shì Zhōngwén wénxué.)',
      '虽然他很累，但他还在工作。 (Suīrán tā hěn lèi, dàn tā hái zài gōngzuò.)',
      '采取的措施改善了情况。 (Cǎiqǔ de cuòshī gǎishàn le qíngkuàng.)',
      '有人请我介绍这个项目。 (Yǒu rén qǐng wǒ jièshào zhège xiàngmù.)',
      '越练习，进步越大。 (Yuè liànxí, jìnbù yuè dà.)'
    ],
    modules: [
      { theme: '问候 Greetings', vocab: [['你好 (nǐ hǎo)', 'hello'], ['再见 (zàijiàn)', 'goodbye'], ['谢谢 (xièxie)', 'thank you'], ['请 (qǐng)', 'please'], ['是 (shì)', 'to be'], ['不 (bù)', 'not'], ['对不起 (duìbuqǐ)', 'sorry']],
        examples: ['你好，我叫阿瓦。 (Nǐ hǎo, wǒ jiào Āwǎ.)', '你好吗？ (Nǐ hǎo ma?)', '我很好，谢谢。 (Wǒ hěn hǎo, xièxie.)', '再见，明天见！ (Zàijiàn, míngtiān jiàn!)', '请说慢一点。 (Qǐng shuō màn yìdiǎn.)', '对不起，我不懂。 (Duìbuqǐ, wǒ bù dǒng.)'],
        dialogue: ['你好！你叫什么名字？ (Nǐ hǎo! Nǐ jiào shénme míngzi?)', '我叫阿瓦。你呢？ (Wǒ jiào Āwǎ. Nǐ ne?)', '我叫保罗。很高兴认识你。 (Wǒ jiào Bǎoluó. Hěn gāoxìng rènshi nǐ.)', '我也很高兴。 (Wǒ yě hěn gāoxìng.)'] },
      { theme: '身份 Identity', vocab: [['我叫 (wǒ jiào)', 'my name is'], ['岁 (suì)', 'years old'], ['家 (jiā)', 'family/home'], ['妈妈 (māma)', 'mother'], ['爸爸 (bàba)', 'father'], ['哥哥 (gēge)', 'older brother'], ['朋友 (péngyou)', 'friend']],
        examples: ['我二十岁。 (Wǒ èrshí suì.)', '我住在拉各斯。 (Wǒ zhù zài Lāgèsī.)', '这是我妈妈。 (Zhè shì wǒ māma.)', '我妈妈是老师。 (Wǒ māma shì lǎoshī.)', '我爸爸在医院工作。 (Wǒ bàba zài yīyuàn gōngzuò.)', '我有一个哥哥和一个姐姐。 (Wǒ yǒu yí ge gēge hé yí ge jiějie.)'],
        dialogue: ['你有兄弟姐妹吗？ (Nǐ yǒu xiōngdì jiěmèi ma?)', '有，我有一个哥哥。 (Yǒu, wǒ yǒu yí ge gēge.)', '他多大了？ (Tā duō dà le?)', '他十五岁。 (Tā shíwǔ suì.)'] },
      { theme: '日常生活 Daily life', vocab: [['时间 (shíjiān)', 'time'], ['早上 (zǎoshang)', 'morning'], ['吃 (chī)', 'to eat'], ['喝 (hē)', 'to drink'], ['面包 (miànbāo)', 'bread'], ['水 (shuǐ)', 'water'], ['起床 (qǐchuáng)', 'to get up']],
        examples: ['我早上七点起床。 (Wǒ zǎoshang qī diǎn qǐchuáng.)', '我早上喝咖啡。 (Wǒ zǎoshang hē kāfēi.)', '我八点去上班。 (Wǒ bā diǎn qù shàngbān.)', '晚上我看书。 (Wǎnshang wǒ kàn shū.)', '我七点吃晚饭。 (Wǒ qī diǎn chī wǎnfàn.)', '我十点睡觉。 (Wǒ shí diǎn shuìjiào.)'],
        dialogue: ['你几点起床？ (Nǐ jǐ diǎn qǐchuáng?)', '七点。你呢？ (Qī diǎn. Nǐ ne?)', '我六点起床。 (Wǒ liù diǎn qǐchuáng.)', '你睡得早吗？ (Nǐ shuì de zǎo ma?)'] },
      { theme: '周围环境 Environment', vocab: [['房子 (fángzi)', 'house'], ['城市 (chéngshì)', 'city'], ['路 (lù)', 'road'], ['左边 (zuǒbian)', 'left'], ['右边 (yòubian)', 'right'], ['一直走 (yìzhí zǒu)', 'go straight'], ['车站 (chēzhàn)', 'station']],
        examples: ['我住在一个小城市。 (Wǒ zhù zài yí ge xiǎo chéngshì.)', '车站在右边。 (Chēzhàn zài yòubian.)', '商店在银行对面。 (Shāngdiàn zài yínháng duìmiàn.)', '往左走，然后一直走。 (Wǎng zuǒ zǒu, ránhòu yìzhí zǒu.)', '我家附近有一个市场。 (Wǒ jiā fùjìn yǒu yí ge shìchǎng.)', '离这里远吗？ (Lí zhèlǐ yuǎn ma?)'],
        dialogue: ['请问，车站在哪里？ (Qǐngwèn, chēzhàn zài nǎlǐ?)', '一直走，然后往右。 (Yìzhí zǒu, ránhòu wǎng yòu.)', '远吗？ (Yuǎn ma?)', '不远，走五分钟。 (Bù yuǎn, zǒu wǔ fēnzhōng.)'] },
      { theme: '工作娱乐 Work & leisure', vocab: [['工作 (gōngzuò)', 'work'], ['学校 (xuéxiào)', 'school'], ['读 (dú)', 'to read'], ['写 (xiě)', 'to write'], ['玩 (wán)', 'to play'], ['运动 (yùndòng)', 'sport'], ['音乐 (yīnyuè)', 'music']],
        examples: ['我喜欢音乐和运动。 (Wǒ xǐhuan yīnyuè hé yùndòng.)', '她在学校工作。 (Tā zài xuéxiào gōngzuò.)', '周末我踢足球。 (Zhōumò wǒ tī zúqiú.)', '他学中文。 (Tā xué Zhōngwén.)', '我们喜欢旅行。 (Wǒmen xǐhuan lǚxíng.)', '他们今晚看电影。 (Tāmen jīnwǎn kàn diànyǐng.)'],
        dialogue: ['你喜欢做什么？ (Nǐ xǐhuan zuò shénme?)', '我喜欢看书和听音乐。 (Wǒ xǐhuan kàn shū hé tīng yīnyuè.)', '你会弹乐器吗？ (Nǐ huì tán yuèqì ma?)', '会，我会弹钢琴。 (Huì, wǒ huì tán gāngqín.)'] },
      { theme: '文化 Culture', vocab: [['节日 (jiérì)', 'festival'], ['传统 (chuántǒng)', 'tradition'], ['菜 (cài)', 'dish/food'], ['博物馆 (bówùguǎn)', 'museum'], ['语言 (yǔyán)', 'language'], ['国家 (guójiā)', 'country'], ['旅行 (lǚxíng)', 'travel']],
        examples: ['我们了解当地文化。 (Wǒmen liǎojiě dāngdì wénhuà.)', '国庆节在十月。 (Guóqìngjié zài shíyuè.)', '我喜欢中国菜。 (Wǒ xǐhuan Zhōngguó cài.)', '这里有一个博物馆。 (Zhèlǐ yǒu yí ge bówùguǎn.)', '我们学习语言和文化。 (Wǒmen xuéxí yǔyán hé wénhuà.)', '旅行开阔眼界。 (Lǚxíng kāikuò yǎnjiè.)'],
        dialogue: ['你知道中秋节吗？ (Nǐ zhīdào Zhōngqiūjié ma?)', '知道，在九月或十月。 (Zhīdào, zài jiǔyuè huò shíyuè.)', '我们一起去吧？ (Wǒmen yìqǐ qù ba?)', '好啊！ (Hǎo a!)'] }
    ]
  },
  EN: {
    language: 'English', script: 'Latin',
    pronunciation: ['vowel length', 'word stress', 'connected speech', 'th/th sounds'],
    culture: ['politeness and register', 'small talk', 'academic vs informal English', 'global varieties'],
    advancedExamples: [
      'When I was a child, I used to spend my holidays at my grandparents’ house.',
      'If I had more time, I would travel more.',
      'It is important that you learn the grammar rules.',
      'The report was published last week.',
      'Despite the rain, we went out.',
      'What I enjoy most is English-language literature.',
      'Although he is tired, he keeps working.',
      'The measures taken have improved the situation.',
      'I was asked to present the project.',
      'The more you practise, the more you improve.'
    ],
    modules: [
      { theme: 'Greetings and introductions', vocab: [['hello', 'hello'], ['good morning', 'good morning'], ['goodbye', 'goodbye'], ['thank you', 'thank you'], ['please', 'please'], ['yes / no', 'yes / no'], ['excuse me', 'excuse me']],
        examples: ['Hello, my name is Awa.', 'How are you?', 'I am fine, thank you.', 'Goodbye, see you tomorrow!', 'Please speak slowly.', 'Sorry, I do not understand.'],
        dialogue: ['Hello! What is your name?', 'My name is Awa. And you?', 'I am Paul. Nice to meet you!', 'Nice to meet you too.'] },
      { theme: 'Personal identity', vocab: [['my name is', 'my name is'], ['I am … years old', 'I am … years old'], ['family', 'family'], ['mother / father', 'mother / father'], ['brother / sister', 'brother / sister'], ['friend', 'friend']],
        examples: ['I am twenty years old.', 'I live in Lagos.', 'This is my sister.', 'My mother is a teacher.', 'My father works at a hospital.', 'I have one brother and one sister.'],
        dialogue: ['Do you have any brothers or sisters?', 'Yes, I have a brother and a sister.', 'How old are they?', 'My brother is ten and my sister is fifteen.'] },
      { theme: 'Daily life', vocab: [['the time', 'the time'], ['morning', 'morning'], ['eat / drink', 'eat / drink'], ['bread', 'bread'], ['water', 'water'], ['coffee', 'coffee'], ['get up', 'get up']],
        examples: ['I get up at seven o’clock.', 'I drink coffee in the morning.', 'I go to work at eight.', 'In the evening, I read a book.', 'I have dinner at seven.', 'I go to bed at ten.'],
        dialogue: ['What time do you get up?', 'At seven. And you?', 'I get up at six.', 'Do you go to bed early?'] },
      { theme: 'Immediate environment', vocab: [['house', 'house'], ['city', 'city'], ['street', 'street'], ['left / right', 'left / right'], ['straight on', 'straight on'], ['station', 'station'], ['shop', 'shop']],
        examples: ['I live in a small town.', 'The station is on the right.', 'The shop is opposite the bank.', 'Turn left, then go straight on.', 'There is a market near my home.', 'Is it far from here?'],
        dialogue: ['Excuse me, where is the station?', 'Go straight on, then turn right.', 'Is it far?', 'No, it is a five-minute walk.'] },
      { theme: 'Work and leisure', vocab: [['work', 'work'], ['school', 'school'], ['read / write', 'read / write'], ['play', 'play'], ['sport', 'sport'], ['music', 'music'], ['like', 'like']],
        examples: ['I like music and sport.', 'She works at a school.', 'I play football at the weekend.', 'He is learning English.', 'We like travelling.', 'They are watching a film tonight.'],
        dialogue: ['What do you like doing?', 'I like reading and listening to music.', 'Do you play an instrument?', 'Yes, I play the piano.'] },
      { theme: 'Culture and integration', vocab: [['festival', 'festival'], ['tradition', 'tradition'], ['food', 'food'], ['museum', 'museum'], ['language', 'language'], ['country', 'country'], ['travel', 'travel']],
        examples: ['We discover the local food.', 'The national festival is in July.', 'I like African music.', 'There is an interesting museum here.', 'We learn the language and culture.', 'Travel broadens the mind.'],
        dialogue: ['Do you know the culture festival?', 'Yes, it is in October.', 'Shall we go together?', 'With pleasure!'] }
    ]
  },
  AR: {
    language: 'Arabic', script: 'Arabic script (RTL), Modern Standard Arabic',
    pronunciation: ['emphatic consonants (ص ض ط ظ)', 'pharyngeals (ع ح)', 'short/long vowels', 'sun and moon letters'],
    culture: ['greetings and hospitality', 'formality and respect', 'calligraphy', 'family and community'],
    note: 'ELA teaches Modern Standard Arabic (MSA) as the core register; regional dialect exposure is documented separately and is not the assessment target.',
    advancedExamples: [
      'عندما كنت طفلا، كنت أقضي العطلة عند جدي وجدتي. (ʿIndamā kuntu ṭiflan, kuntu aqḍī l-ʿuṭla ʿinda jaddī wa-jaddatī.)',
      'لو كان لدي وقت أكثر، لسافرت أكثر. (Law kāna ladayya waqtun akthar, lasāfartu akthar.)',
      'من المهم أن تتعلم قواعد النحو. (Min al-muhimmi an tataʿallama qawāʿida n-naḥw.)',
      'نُشر التقرير الأسبوع الماضي. (Nushira t-taqrīr al-usbūʿa l-māḍī.)',
      'رغم المطر، خرجنا. (Raghma l-maṭar, kharajnā.)',
      'ما أحبه أكثر هو الأدب العربي. (Mā uḥibbuhu akthar huwa l-adab al-ʿarabī.)',
      'على الرغم من أنه متعب، فإنه يواصل العمل. (ʿAlā r-raghmi min annahu mutʿab, fa-innahu yuwāṣilu l-ʿamal.)',
      'الإجراءات المتخذة حسّنت الوضع. (Al-ijrāʾāt al-muttakhadha ḥassanat al-waḍʿ.)',
      'طُلب مني تقديم المشروع. (Ṭuliba minnī taqdīm al-mashrūʿ.)',
      'كلما تدربت أكثر، تقدمت أكثر. (Kullamā tadarrabta akthar, taqaddamta akthar.)'
    ],
    modules: [
      { theme: 'التحيات Greetings', vocab: [['مرحبا (marhaban)', 'hello'], ['السلام عليكم (as-salāmu ʿalaykum)', 'peace be upon you'], ['مع السلامة (maʿa s-salāma)', 'goodbye'], ['شكرا (shukran)', 'thank you'], ['من فضلك (min faḍlik)', 'please'], ['نعم / لا (naʿam / lā)', 'yes / no'], ['عفوا (ʿafwan)', 'excuse me']],
        examples: ['مرحبا، اسمي أوا. (Marhaban, ismī Awa.)', 'كيف حالك؟ (Kayfa ḥāluk?)', 'بخير، شكرا. (Bikhayr, shukran.)', 'مع السلامة، إلى الغد! (Maʿa s-salāma, ilā l-ghad!)', 'من فضلك تكلم ببطء. (Min faḍlik takallam bibuṭʾ.)', 'آسف، لا أفهم. (Āsif, lā afham.)'],
        dialogue: ['مرحبا! ما اسمك؟ (Marhaban! Mā ismuk?)', 'اسمي أوا. وأنت؟ (Ismī Awa. Wa-anta?)', 'أنا بول. تشرفنا! (Anā Būl. Tasharrafnā!)', 'تشرفنا بك أيضا. (Tasharrafnā bika ayḍan.)'] },
      { theme: 'الهوية Identity', vocab: [['اسمي (ismī)', 'my name is'], ['سنة (sana)', 'year'], ['عائلة (ʿāʾila)', 'family'], ['أم (umm)', 'mother'], ['أب (ab)', 'father'], ['أخ / أخت (akh / ukht)', 'brother / sister'], ['صديق (ṣadīq)', 'friend']],
        examples: ['عمري عشرون سنة. (ʿUmrī ʿishrūn sana.)', 'أعيش في لاغوس. (Aʿīshu fī Lāghūs.)', 'هذه أختي. (Hādhihi ukhtī.)', 'أمي معلمة. (Ummī muʿallima.)', 'أبي يعمل في المستشفى. (Abī yaʿmalu fī l-mustashfā.)', 'لدي أخ وأخت. (Ladayya akh wa-ukht.)'],
        dialogue: ['هل لديك إخوة؟ (Hal ladayka ikhwa?)', 'نعم، لدي أخ وأخت. (Naʿam, ladayya akh wa-ukht.)', 'كم عمرهما؟ (Kam ʿumruhumā?)', 'أخي عشرة أعوام وأختي خمسة عشر. (Akhī ʿashara aʿwām wa-ukhtī khamsata ʿashar.)'] },
      { theme: 'الحياة اليومية Daily life', vocab: [['الوقت (al-waqt)', 'time'], ['صباح (ṣabāḥ)', 'morning'], ['يأكل (yaʾkul)', 'to eat'], ['يشرب (yashrab)', 'to drink'], ['خبز (khubz)', 'bread'], ['ماء (māʾ)', 'water'], ['قهوة (qahwa)', 'coffee']],
        examples: ['أستيقظ في السابعة. (Astayqiẓ fī s-sābiʿa.)', 'أشرب القهوة صباحا. (Ashrubu l-qahwa ṣabāḥan.)', 'أذهب إلى العمل في الثامنة. (Adhhabu ilā l-ʿamal fī th-thāmina.)', 'أقرأ كتابا في المساء. (Aqraʾu kitāban fī l-masāʾ.)', 'أتعشى في السابعة. (Ataʿashshā fī s-sābiʿa.)', 'أنام في العاشرة. (Anāmu fī l-ʿāshira.)'],
        dialogue: ['متى تستيقظ؟ (Matā tastayqiẓ?)', 'في السابعة. وأنت؟ (Fī s-sābiʿa. Wa-anta?)', 'أستيقظ في السادسة. (Astayqiẓu fī s-sādisa.)', 'هل تنام مبكرا؟ (Hal tanāmu mubakkiran?)'] },
      { theme: 'المحيط Environment', vocab: [['بيت (bayt)', 'house'], ['مدينة (madīna)', 'city'], ['شارع (shāriʿ)', 'street'], ['يسار (yasār)', 'left'], ['يمين (yamīn)', 'right'], ['مباشرة (mubāshara)', 'straight on'], ['محطة (maḥaṭṭa)', 'station']],
        examples: ['أعيش في مدينة صغيرة. (Aʿīshu fī madīna ṣaghīra.)', 'المحطة على اليمين. (Al-maḥaṭṭa ʿalā l-yamīn.)', 'المتجر مقابل البنك. (Al-matjar muqābil al-bank.)', 'اتجه يسارا ثم مباشرة. (Ittajih yasāran thumma mubāshara.)', 'هناك سوق قريب من بيتي. (Hunāka sūq qarīb min baytī.)', 'هل هو بعيد من هنا؟ (Hal huwa baʿīd min hunā?)'],
        dialogue: ['عفوا، أين المحطة؟ (ʿAfwan, ayna l-maḥaṭṭa?)', 'مباشرة ثم يمينا. (Mubāshara thumma yamīnan.)', 'هل هي بعيدة؟ (Hal hiya baʿīda?)', 'لا، خمس دقائق سيرا. (Lā, khams daqāʾiq sayran.)'] },
      { theme: 'العمل والترفيه Work & leisure', vocab: [['عمل (ʿamal)', 'work'], ['مدرسة (madrasa)', 'school'], ['يقرأ (yaqraʾ)', 'to read'], ['يكتب (yaktub)', 'to write'], ['يلعب (yalʿab)', 'to play'], ['رياضة (riyāḍa)', 'sport'], ['موسيقى (mūsīqā)', 'music']],
        examples: ['أحب الموسيقى والرياضة. (Uḥibbu l-mūsīqā wa-r-riyāḍa.)', 'تعمل في مدرسة. (Taʿmalu fī madrasa.)', 'ألعب كرة القدم في عطلة الأسبوع. (Alʿabu kurata l-qadam fī ʿuṭlati l-usbūʿ.)', 'هو يتعلم العربية. (Huwa yataʿallamu l-ʿarabiyya.)', 'نحب السفر. (Nuḥibbu s-safar.)', 'يشاهدون فيلما الليلة. (Yushāhidūna filmā l-layla.)'],
        dialogue: ['ماذا تحب أن تفعل؟ (Mādhā tuḥibbu an tafʿal?)', 'أحب القراءة والاستماع إلى الموسيقى. (Uḥibbu l-qirāʾa wa-l-istimāʿ ilā l-mūsīqā.)', 'هل تعزف آلة؟ (Hal taʿzifu āla?)', 'نعم، أعزف البيانو. (Naʿam, aʿzifu l-biyānū.)'] },
      { theme: 'الثقافة Culture', vocab: [['عيد (ʿīd)', 'festival'], ['تقليد (taqlīd)', 'tradition'], ['طعام (ṭaʿām)', 'food'], ['متحف (matḥaf)', 'museum'], ['لغة (lugha)', 'language'], ['بلد (balad)', 'country'], ['يسافر (yusāfir)', 'to travel']],
        examples: ['نتعرف على الثقافة المحلية. (Nataʿarrafu ʿalā th-thaqāfa l-maḥalliyya.)', 'العيد الوطني في يوليو. (Al-ʿīd al-waṭanī fī Yūliyū.)', 'أحب الموسيقى الإفريقية. (Uḥibbu l-mūsīqā l-ifrīqiyya.)', 'هناك متحف مثير هنا. (Hunāka matḥaf muthīr hunā.)', 'نتعلم اللغة والثقافة. (Nataʿallamu l-lugha wa-th-thaqāfa.)', 'السفر يوسع الأفق. (As-safar yuwassiʿu l-ufuq.)'],
        dialogue: ['هل تعرف مهرجان الثقافة؟ (Hal taʿrifu mahrajān ath-thaqāfa?)', 'نعم، إنه في أكتوبر. (Naʿam, innahu fī Uktūbir.)', 'هل نذهب معا؟ (Hal nadhhabu maʿan?)', 'بكل سرور! (Bikulli surūr!)'] }
    ]
  },
  RU: {
    language: 'Russian', script: 'Cyrillic',
    pronunciation: ['palatalisation (soft consonants)', 'vowel reduction (akanye)', 'stress and unstressed vowels', 'ы vs и'],
    culture: ['formal/informal ты vs вы', 'tea culture', 'holidays (Новый год, Масленица)', 'literature and art'],
    advancedExamples: [
      'Когда я был ребёнком, я проводил каникулы у бабушки с дедушкой.',
      'Если бы у меня было больше времени, я бы больше путешествовал.',
      'Важно, чтобы ты выучил правила грамматики.',
      'Отчёт был опубликован на прошлой неделе.',
      'Несмотря на дождь, мы вышли.',
      'Больше всего мне нравится русская литература.',
      'Хотя он устал, он продолжает работать.',
      'Принятые меры улучшили ситуацию.',
      'Меня попросили представить проект.',
      'Чем больше практикуешься, тем больше успеваешь.'
    ],
    modules: [
      { theme: 'Приветствия Greetings', vocab: [['привет (privet)', 'hi'], ['здравствуйте (zdravstvuyte)', 'hello (formal)'], ['до свидания (do svidaniya)', 'goodbye'], ['спасибо (spasibo)', 'thank you'], ['пожалуйста (pozhaluysta)', 'please'], ['да / нет (da / net)', 'yes / no'], ['извините (izvinite)', 'excuse me']],
        examples: ['Привет, меня зовут Ава. (Privet, menya zovut Ava.)', 'Как дела? (Kak dela?)', 'Хорошо, спасибо. (Khorosho, spasibo.)', 'До свидания, до завтра! (Do svidaniya, do zavtra!)', 'Пожалуйста, говорите медленно. (Pozhaluysta, govorite medlenno.)', 'Извините, я не понимаю. (Izvinite, ya ne ponimayu.)'],
        dialogue: ['Привет! Как тебя зовут? (Privet! Kak tebya zovut?)', 'Меня зовут Ава. А тебя? (Menya zovut Ava. A tebya?)', 'Я Павел. Очень приятно! (Ya Pavel. Ochen priyatno!)', 'Мне тоже приятно. (Mne tozhe priyatno.)'] },
      { theme: 'Личность Identity', vocab: [['меня зовут (menya zovut)', 'my name is'], ['год (god)', 'year'], ['семья (sem\u2019ya)', 'family'], ['мама (mama)', 'mother'], ['папа (papa)', 'father'], ['брат / сестра (brat / sestra)', 'brother / sister'], ['друг (drug)', 'friend']],
        examples: ['Мне двадцать лет. (Mne dvadtsat\u2019 let.)', 'Я живу в Лагосе. (Ya zhivu v Lagose.)', 'Это моя сестра. (Eto moya sestra.)', 'Моя мама — учитель. (Moya mama — uchitel\u2019.)', 'Мой папа работает в больнице. (Moy papa rabotayet v bol\u2019nitse.)', 'У меня есть брат и сестра. (U menya yest\u2019 brat i sestra.)'],
        dialogue: ['У тебя есть братья или сёстры? (U tebya yest\u2019 brat\u2019ya ili syostry?)', 'Да, у меня есть брат и сестра. (Da, u menya yest\u2019 brat i sestra.)', 'Сколько им лет? (Skol\u2019ko im let?)', 'Брату десять, а сестре пятнадцать. (Bratu desyat\u2019, a sestre pyatnadtsat\u2019.)'] },
      { theme: 'Быт Daily life', vocab: [['время (vremya)', 'time'], ['утро (utro)', 'morning'], ['есть (yest\u2019)', 'to eat'], ['пить (pit\u2019)', 'to drink'], ['хлеб (khleb)', 'bread'], ['вода (voda)', 'water'], ['кофе (kofe)', 'coffee']],
        examples: ['Я встаю в семь часов. (Ya vstayu v sem\u2019 chasov.)', 'Я пью кофе утром. (Ya p\u2019yu kofe utrom.)', 'Я иду на работу в восемь. (Ya idu na rabotu v vosem\u2019.)', 'Вечером я читаю книгу. (Vecherom ya chitayu knigu.)', 'Я ужинаю в семь. (Ya uzhinayu v sem\u2019.)', 'Я ложусь спать в десять. (Ya lozhus\u2019 spat\u2019 v desyat\u2019.)'],
        dialogue: ['Когда ты встаёшь? (Kogda ty vstayosh\u2019?)', 'В семь. А ты? (V sem\u2019. A ty?)', 'Я встаю в шесть. (Ya vstayu v shest\u2019.)', 'Ты рано ложишься спать? (Ty rano lozhish\u2019sya spat\u2019?)'] },
      { theme: 'Окружение Environment', vocab: [['дом (dom)', 'house'], ['город (gorod)', 'city'], ['улица (ulitsa)', 'street'], ['налево / направо (nalevo / napravo)', 'left / right'], ['прямо (pryamo)', 'straight on'], ['вокзал (vokzal)', 'station'], ['магазин (magazin)', 'shop']],
        examples: ['Я живу в маленьком городе. (Ya zhivu v malen\u2019kom gorode.)', 'Вокзал направо. (Vokzal napravo.)', 'Магазин напротив банка. (Magazin naprotiv banka.)', 'Идите налево, потом прямо. (Idite nalevo, potom pryamo.)', 'Рядом с домом есть рынок. (Ryadom s domom yest\u2019 rynok.)', 'Это далеко отсюда? (Eto daleko otsyuda?)'],
        dialogue: ['Извините, где вокзал? (Izvinite, gde vokzal?)', 'Прямо, потом направо. (Pryamo, potom napravo.)', 'Это далеко? (Eto daleko?)', 'Нет, пять минут пешком. (Net, pyat\u2019 minut peshkom.)'] },
      { theme: 'Работа и досуг Work & leisure', vocab: [['работа (rabota)', 'work'], ['школа (shkola)', 'school'], ['читать / писать (chitat\u2019 / pisat\u2019)', 'to read / to write'], ['играть (igrat\u2019)', 'to play'], ['спорт (sport)', 'sport'], ['музыка (muzyka)', 'music'], ['любить (lyubit\u2019)', 'to like/love']],
        examples: ['Я люблю музыку и спорт. (Ya lyublyu muzyku i sport.)', 'Она работает в школе. (Ona rabotayet v shkole.)', 'По выходным я играю в футбол. (Po vykhodnym ya igrayu v futbol.)', 'Он учит русский. (On uchit russkiy.)', 'Мы любим путешествовать. (My lyubim puteshestvovat\u2019.)', 'Они смотрят фильм сегодня. (Oni smotryat fil\u2019m segodnya.)'],
        dialogue: ['Что ты любишь делать? (Chto ty lyubish\u2019 delat\u2019?)', 'Я люблю читать и слушать музыку. (Ya lyublyu chitat\u2019 i slushat\u2019 muzyku.)', 'Ты играешь на инструменте? (Ty igrayesh\u2019 na instrumente?)', 'Да, я играю на пианино. (Da, ya igrayu na pianino.)'] },
      { theme: 'Культура Culture', vocab: [['праздник (prazdnik)', 'festival'], ['традиция (traditsiya)', 'tradition'], ['еда (yeda)', 'food'], ['музей (muzey)', 'museum'], ['язык (yazyk)', 'language'], ['страна (strana)', 'country'], ['путешествовать (puteshestvovat\u2019)', 'to travel']],
        examples: ['Мы знакомимся с местной культурой. (My znakomimsya s mestnoy kul\u2019turoy.)', 'Национальный праздник в июле. (Natsional\u2019nyy prazdnik v iyule.)', 'Я люблю африканскую музыку. (Ya lyublyu afrikanskuyu muzyku.)', 'Здесь есть интересный музей. (Zdes\u2019 yest\u2019 interesnyy muzey.)', 'Мы учим язык и культуру. (My uchim yazyk i kul\u2019turu.)', 'Путешествия расширяют кругозор. (Puteshestviya rasshiryayut krugozor.)'],
        dialogue: ['Ты знаешь праздник культуры? (Ty znayesh\u2019 prazdnik kul\u2019tury?)', 'Да, он в октябре. (Da, on v oktyabre.)', 'Пойдём вместе? (Poydyom vmeste?)', 'С удовольствием! (S udovol\u2019stviyem!)'] }
    ]
  }
};

/* Progression grammaticale réelle par niveau. */
const GRAMMAR_BY_LEVEL = {
  FR: { A1: ['présent des verbes en -er', 'être et avoir', 'articles définis/indéfinis', 'genre et nombre des noms', 'négation ne… pas', 'questions avec est-ce que'], A2: ['passé composé', 'imparfait', 'futur proche', 'comparatif', 'pronoms COD/COI', 'adjectifs possessifs'], B1: ['futur simple', 'conditionnel présent', 'subjonctif présent (introduction)', 'pronoms relatifs qui/que', 'discours indirect', 'gérondif'], B2: ['plus-que-parfait', 'conditionnel passé', 'subjonctif (approfondi)', 'voix passive', 'connecteurs logiques', 'nominalisation'], C1: ['concordance des temps', 'subjonctif avancé', 'style indirect libre', 'registres de langue', 'expressions idiomatiques', 'cohésion avancée'], C2: ['nuances aspectuelles', 'stylistique', 'rhétorique', 'expressions figées', 'variation régionale', 'maîtrise idiomatique'] },
  DE: { A1: ['Präsens', 'sein und haben', 'bestimmte/unbestimmte Artikel', 'Nominativ und Akkusativ', 'Negation (nicht/kein)', 'W-Fragen'], A2: ['Perfekt', 'Dativ', 'Modalverben', 'trennbare Verben', 'Komparativ', 'Possessivartikel'], B1: ['Präteritum', 'Nebensätze (weil, dass)', 'Konjunktiv II', 'Relativsätze', 'Passiv', 'Infinitiv mit zu'], B2: ['Plusquamperfekt', 'Genitiv', 'Konjunktiv II der Vergangenheit', 'Passiv mit Modalverben', 'Konnektoren', 'Nominalisierung'], C1: ['Partizipialkonstruktionen', 'indirekte Rede', 'Konjunktiv I', 'Stilregister', 'Kollokationen', 'Textkohäsion'], C2: ['stilistische Nuancen', 'Idiomatik', 'Rhetorik', 'Fachsprache', 'Varietäten', 'stilistische Feinheiten'] },
  ZH: { A1: ['是 sentences', '有 (have)', 'measure word 个', 'questions with 吗/什么', 'negation 不/没', 'basic word order (SVO)'], A2: ['了 (completed action)', '过 (experience)', '在/正在 (progressive)', '得 (complement)', 'comparison with 比', '因为…所以 (because…so)'], B1: ['把 construction', '被 (passive)', 'result complements', 'directional complements', '只要…就 (as long as)', 'discourse connectors'], B2: ['既然/只有/无论', 'complex complements', '是…的 emphasis', '连…都 (even)', 'formal connectors', 'rhetorical structures'], C1: ['written register (书面语)', '成语 (idioms)', '紧缩句', 'advanced rhetorical structures', '语体 (register)', 'classical influences'], C2: ['文言 influence', '修辞 (rhetoric)', '语体 variation', '惯用语', 'discourse cohesion', 'near-native nuances'] },
  EN: { A1: ['present simple', 'be and have', 'articles', 'plurals', 'present continuous', 'questions and negation'], A2: ['past simple', 'present perfect', 'comparatives', 'modals (can/must/should)', 'future (will/going to)', 'prepositions'], B1: ['past continuous', 'relative clauses', 'first/second conditional', 'passive', 'reported speech', 'gerunds and infinitives'], B2: ['past perfect', 'third conditional', 'modals of deduction', 'advanced passive', 'linking devices', 'nominalisation'], C1: ['inversion', 'cleft sentences', 'hedging', 'discourse markers', 'academic register', 'complex noun phrases'], C2: ['stylistic variation', 'idiomatic mastery', 'rhetorical devices', 'nuanced modality', 'cohesion', 'register shifting'] },
  AR: { A1: ['nominal sentence (mubtadaʾ/khabar)', 'definite article al-', 'gender', 'idafa (possessive)', 'personal pronouns', 'question words'], A2: ['verbal sentence', 'past and present tense', 'negation', 'broken plurals', 'prepositions', 'comparatives'], B1: ['derived verb forms II–X (intro)', 'cases (nominative/accusative/genitive)', 'conditionals', 'relative clauses', 'connectors', 'kāna and sisters'], B2: ['passive', 'subjunctive', 'inna and sisters', 'masdar (verbal noun)', 'formal connectors', 'complex sentences'], C1: ['rhetoric (balāgha) intro', 'classical structures', 'register', 'stylistic variation', 'idioms', 'textual cohesion'], C2: ['advanced balāgha', 'literary styles', 'nuances', 'register mastery', 'proverbs', 'near-native command'] },
  RU: { A1: ['Cyrillic alphabet', 'gender of nouns', 'nominative case', 'present tense', 'personal pronouns', 'negation and questions'], A2: ['accusative case', 'genitive case', 'dative case', 'instrumental case', 'prepositional case', 'past tense'], B1: ['verb aspect', 'verbs of motion', 'conditional (бы)', 'complex sentences', 'participles (intro)', 'imperative'], B2: ['participles', 'gerunds', 'passive', 'subjunctive nuances', 'connectors', 'nominalisation'], C1: ['aspectual nuance', 'advanced syntax', 'style registers', 'idioms', 'textual cohesion', 'complex subordination'], C2: ['stylistic mastery', 'phraseology', 'rhetoric', 'register variation', 'nuanced aspect', 'near-native command'] }
};

const LEVEL_THEMES = {
  B1: ['Travel and transport', 'Health and well-being', 'Work and study', 'Media and technology', 'Community and society', 'Environment and sustainability'],
  B2: ['Culture and identity', 'Science and innovation', 'Economy and work', 'Global issues', 'Education and careers', 'Arts and literature'],
  C1: ['Academic discourse', 'Professional communication', 'Argumentation and debate', 'Research and referencing', 'Intercultural negotiation', 'Specialised registers'],
  C2: ['Advanced rhetoric', 'Literary and stylistic analysis', 'Domain expertise', 'Nuanced argumentation', 'Language policy and variation', 'Mastery project']
};

const LEVEL_BAND = { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', HSK1: 'A1', HSK2: 'A2', HSK3: 'B1', HSK4: 'B2', HSK5: 'C1', HSK6: 'C2' };

/* Six types de leçon par module → variété pédagogique. */
const LESSON_TYPES = [
  { key: 'input', name: 'Receptive input', comps: ['C-LIS', 'C-VOC'], act: ['listening', 'reading'], mode: 'recognition' },
  { key: 'vocab', name: 'Vocabulary application', comps: ['C-VOC', 'C-REA'], act: ['vocabulary', 'matching'], mode: 'controlled production' },
  { key: 'grammar', name: 'Grammar discovery', comps: ['C-GRA', 'C-WRI'], act: ['grammar discovery', 'completion'], mode: 'controlled production' },
  { key: 'listening', name: 'Listening & response', comps: ['C-LIS', 'C-INT'], act: ['listening task', 'information gap'], mode: 'guided interaction' },
  { key: 'speaking', name: 'Speaking & interaction', comps: ['C-SPE', 'C-INT', 'C-PRO'], act: ['role play', 'dialogue'], mode: 'guided interaction' },
  { key: 'writing', name: 'Writing & self-assessment', comps: ['C-WRI', 'C-REA', 'C-ICU'], act: ['guided writing', 'reflection'], mode: 'independent production' }
];

function levelContentState(level) {
  const band = LEVEL_BAND[level] || 'A1';
  if (band === 'C1' || band === 'C2') return 'REVIEW_REQUIRED';
  return 'DRAFT';
}

function examplePool(L, band, mi) {
  if (band === 'A1' || band === 'A2') return L.modules[mi].examples;
  return L.advancedExamples;
}

function pickExamples(L, band, mi, g) {
  const base = L.modules[mi];
  const e1 = base.examples[g % base.examples.length];
  const e2 = (band === 'A1' || band === 'A2')
    ? base.dialogue[g % base.dialogue.length]
    : L.advancedExamples[g % L.advancedExamples.length];
  return [e1, e2];
}

function buildLesson(academy, level, band, moduleIndex, unitIndex, lessonIndex, globalIndex, L, grammarPoint, theme, state) {
  const type = LESSON_TYPES[globalIndex % LESSON_TYPES.length];
  const pair = pickExamples(L, band, moduleIndex, globalIndex);
  const e1 = pair[0];
  const e2 = pair[1];
  const vocabSlice = L.modules[moduleIndex].vocab.slice(unitIndex * 2, unitIndex * 2 + 3).map((v) => v[0]);
  const dialogue = L.modules[moduleIndex].dialogue;
  const isInteraction = type.key === 'speaking' || type.key === 'listening';

  const explanation = '[' + type.name + '] ' + theme + '. Focus grammatical : ' + grammarPoint + '. ' +
    'Contenu ciblé : ' + vocabSlice.join(', ') + '. ' +
    (isInteraction ? 'Les apprenants travaillent le dialogue fourni en situation.' : 'Les apprenants observent, manipulent puis produisent la structure cible.');

  const guided = {
    input: 'Écoute/lis les exemples et identifie les éléments cibles : ' + vocabSlice.join(', ') + '.',
    vocab: 'Associe chaque élément à sa signification puis complète trois phrases à trous.',
    grammar: 'Observe la structure « ' + grammarPoint + ' » dans les exemples, puis complète les transformations.',
    listening: 'Écoute le dialogue et réponds à trois questions de compréhension.',
    speaking: 'Joue le dialogue en binôme en remplaçant les informations personnelles.',
    writing: 'Rédige un court texte guidé en réutilisant la structure et le vocabulaire cibles.'
  }[type.key];

  const independent = {
    input: 'Note deux nouvelles occurrences de la structure dans un texte authentique court.',
    vocab: 'Produis cinq phrases originales avec le vocabulaire cible.',
    grammar: 'Rédige trois phrases personnelles utilisant « ' + grammarPoint + ' ».',
    listening: 'Réécoute et résume le dialogue en trois phrases.',
    speaking: 'Présente oralement une situation personnelle liée au thème (30–45 s).',
    writing: (band === 'A1' || band === 'A2') ? 'Écris un paragraphe de 40–60 mots sur le thème.' : 'Produis un texte structuré de 120–180 mots sur le thème.'
  }[type.key];

  const assessment = {
    input: 'Auto-évaluation : identifier 4/5 éléments cibles à l’écoute.',
    vocab: 'Quiz formatif : 5 items de vocabulaire (réponses ouvertes auto-vérifiées).',
    grammar: 'Tâche formative : appliquer « ' + grammarPoint + ' » dans 5 phrases.',
    listening: 'Compréhension orale formative : 3 questions ouvertes.',
    speaking: 'Production orale formative évaluée par les pairs selon les critères.',
    writing: 'Production écrite formative évaluée avec la rubrique ELA.'
  }[type.key];

  const mastery = {
    input: 'Reconnaît au moins 4/5 éléments cibles avec exactitude.',
    vocab: 'Utilise au moins 5 éléments du vocabulaire cible correctement.',
    grammar: 'Applique « ' + grammarPoint + ' » avec une exactitude d’au moins 4/5.',
    listening: 'Répond correctement à au moins 2/3 questions de compréhension.',
    speaking: 'S’exprime de façon intelligible et pertinente pendant au moins 30 s.',
    writing: 'Produit un texte cohérent respectant la structure cible.'
  }[type.key];

  const lessonId = academy + '-' + level + '-M' + String(moduleIndex + 1).padStart(2, '0') +
    '-U' + String(unitIndex + 1).padStart(2, '0') + '-L' + String(lessonIndex + 1).padStart(2, '0');

  return {
    id: lessonId, type: 'lesson', lessonType: type.key, lessonTypeName: type.name,
    title: theme + ' — ' + type.name,
    objective: '[' + type.name + '] ' + theme + ': ' + (isInteraction ? 'interagir' : 'maîtriser') + ' la structure cible au niveau ' + level + '.',
    prerequisites: lessonIndex === 0 ? [] : [academy + '-' + level + '-M' + String(moduleIndex + 1).padStart(2, '0') + '-U' + String(unitIndex + 1).padStart(2, '0') + '-L01'],
    estimatedDuration: 45,
    explanation: explanation,
    languageContent: vocabSlice,
    examples: [e1, e2],
    dialogue: isInteraction ? dialogue : [],
    guidedPractice: guided,
    independentPractice: independent,
    interaction: isInteraction ? 'Tâche interactive : ' + dialogue[0] : 'Échange en binôme sur le thème.',
    assessment: assessment,
    masteryCriteria: mastery,
    vocabularyFocus: vocabSlice,
    grammarFocus: [grammarPoint],
    pronunciationFocus: L.pronunciation.slice(0, 2),
    culturalContext: L.culture[moduleIndex % L.culture.length],
    activities: type.act,
    outcomeIds: [
      academy + '-' + level + '-LO-0' + ((globalIndex % 8) + 1),
      academy + '-' + level + '-LO-0' + (((globalIndex + 1) % 8) + 1)
    ],
    competencyIds: type.comps,
    status: state, contentState: state
  };
}

function buildLevelContent(academy, level) {
  const L = LANGUAGES[academy];
  if (!L) throw new Error('unknown-academy:' + academy);
  const band = LEVEL_BAND[level] || 'A1';
  const grammar = (GRAMMAR_BY_LEVEL[academy] && GRAMMAR_BY_LEVEL[academy][band]) || [];
  const useCore = band === 'A1' || band === 'A2';
  const state = levelContentState(level);
  const themes = LEVEL_THEMES[band] || LEVEL_THEMES.B1;
  const modules = [];
  let programmeIndex = 0;

  for (let mi = 0; mi < 6; mi++) {
    const base = L.modules[mi];
    const theme = useCore ? base.theme : (themes[mi] + ' — ' + L.language);
    const grammarPoint = grammar[mi] || '';
    const moduleId = academy + '-' + level + '-M' + String(mi + 1).padStart(2, '0');
    const units = [];

    for (let ui = 0; ui < 3; ui++) {
      const unitId = moduleId + '-U' + String(ui + 1).padStart(2, '0');
      const vocabSlice = base.vocab.slice(ui * 2, ui * 2 + 3).map((v) => v[0]);
      const lessons = [];
      for (let li = 0; li < 2; li++) {
        lessons.push(buildLesson(academy, level, band, mi, ui, li, programmeIndex, L, grammarPoint, theme, state));
        programmeIndex++;
      }
      units.push({
        id: unitId, type: 'unit', title: theme + ' — unité ' + (ui + 1),
        theme: theme, communicativeContext: 'Usage courant et institutionnel de ' + L.language,
        vocabularyFocus: vocabSlice, grammarFocus: [grammarPoint],
        pronunciationFocus: L.pronunciation.slice(0, 2),
        culturalContext: L.culture[mi % L.culture.length],
        outcomeIds: [academy + '-' + level + '-LO-01', academy + '-' + level + '-LO-03'],
        competencyIds: ['C-LIS', 'C-REA', 'C-WRI', 'C-SPE', 'C-GRA', 'C-VOC', 'C-INT', 'C-ICU'],
        lessons: lessons, status: state, contentState: state
      });
    }

    modules.push({
      id: moduleId, type: 'module', title: theme, description: theme + ' — ' + L.language,
      outcomes: [1, 2, 3, 4, 5].map((n) => academy + '-' + level + '-LO-0' + n),
      competencyIds: ['C-LIS', 'C-REA', 'C-WRI', 'C-SPE', 'C-GRA', 'C-VOC', 'C-PRO', 'C-INT', 'C-ICU'],
      units: units, status: state, contentState: state
    });
  }

  return {
    programmeId: 'prog_' + academy + '_' + level,
    academyCode: academy, level: level, band: band,
    structure: 'Foundation → Development → Practice → Application → Integration → Assessment',
    modules: modules, contentState: state,
    note: state === 'DRAFT'
      ? 'ELA-authored draft curriculum (' + L.language + ' ' + level + '): real language-specific vocabulary, examples, dialogue, grammar progression and tasks. Pending ELA academic review before APPROVED/PUBLISHED.'
      : 'Advanced-level ELA draft (' + L.language + ' ' + level + '): themes, advanced examples, grammar and outcomes authored; full lesson bodies require specialist academic review.'
  };
}

module.exports = { LANGUAGES, GRAMMAR_BY_LEVEL, LEVEL_THEMES, LEVEL_BAND, LESSON_TYPES, levelContentState, buildLevelContent };
