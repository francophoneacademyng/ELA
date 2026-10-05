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

const { LEVEL_VOCAB } = require('./curriculum-vocabulary.js');

const LANGUAGES = {
  FR: {
    language: 'French', script: 'Latin',
    pronunciation: ['voyelles nasales (on, an, in)', 'liaison', 'élision (l’ami)', 'rythme et accentuation finale'],
    culture: ['salutations formelles/informelles', 'politesse et « vous »', 'repas et convivialité', 'fêtes francophones'],
    advancedExamples: {
      B1: [
        "Quand j'étais enfant, je passais mes vacances chez mes grands-parents.",
        "Si j'avais plus de temps, je voyagerais davantage.",
        'Il faut que tu apprennes les règles de grammaire.',
        "Ce que je préfère, c'est la littérature francophone.",
        "On m'a demandé de présenter le projet.",
        'Plus on pratique, plus on progresse.',
        'Le livre que je lis est très intéressant.',
        'Je vais partir en vacances la semaine prochaine.',
        'Elle a dit qu’elle viendrait demain.',
        'Nous aimerions visiter ce musée.'
      ],
      B2: [
        'Le rapport a été publié la semaine dernière.',
        "Bien qu'il soit fatigué, il continue à travailler.",
        'Malgré la pluie, nous sommes sortis.',
        'Les mesures prises ont amélioré la situation.',
        "Si j'avais su, je serais venu plus tôt.",
        'Il est essentiel que chacun respecte les règles.',
        'Le problème, dont nous avons parlé, a été résolu.',
        'Ayant terminé son travail, elle est rentrée.',
        'Ce projet est financé par l’État.',
        'Non seulement il travaille, mais il étudie aussi.'
      ],
      C1: [
        'Il aurait fallu que nous en discutions avant la réunion.',
        'Quoi qu’il en soit, la décision a été prise.',
        'Ce débat témoigne d’une évolution des mentalités.',
        'Force est de constater que la situation s’est améliorée.',
        'L’auteur souligne que cette tendance est irréversible.',
        'En dépit des obstacles, le projet a abouti.',
        'Il est peu probable que cette hypothèse se vérifie.',
        'La question n’en reste pas moins épineuse.',
        'Autant que je sache, rien n’a été décidé.',
        'Cette approche s’avère particulièrement pertinente.'
      ],
      C2: [
        'À y regarder de plus près, l’argument ne tient pas.',
        'Il va sans dire que cette œuvre a marqué son époque.',
        'La plume de l’auteur se distingue par sa sobriété.',
        'Ce constat ne laisse pas d’étonner.',
        'Qui vivra verra, dit le proverbe.',
        'Le style, ici, frôle la perfection formelle.',
        'Rarement une œuvre n’aura suscité pareil débat.',
        'Il s’agit là d’une question de la plus haute importance.',
        'On ne saurait trop insister sur cette nuance.',
        'Telle est, en somme, la leçon de ce texte.'
      ]
    },
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
    advancedExamples: {
      B1: [
        'Als ich Kind war, verbrachte ich die Ferien bei meinen Großeltern.',
        'Wenn ich mehr Zeit hätte, würde ich mehr reisen.',
        'Es ist wichtig, dass man die Grammatikregeln lernt.',
        'Ich hoffe, dass du morgen kommen kannst.',
        'Das Buch, das ich lese, ist sehr interessant.',
        'Er sagte, dass er später anrufen werde.',
        'Ich würde gern einmal nach Berlin fahren.',
        'Weil es regnete, blieben wir zu Hause.',
        'Die Stadt, in der ich wohne, ist klein.',
        'Obwohl es kalt war, gingen wir spazieren.'
      ],
      B2: [
        'Der Bericht wurde letzte Woche veröffentlicht.',
        'Obwohl er müde ist, arbeitet er weiter.',
        'Trotz des Regens sind wir ausgegangen.',
        'Die ergriffenen Maßnahmen haben die Lage verbessert.',
        'Nachdem er gegessen hatte, ging er spazieren.',
        'Wenn ich das gewusst hätte, wäre ich früher gekommen.',
        'Das Problem, von dem wir sprachen, wurde gelöst.',
        'Die Brücke wird gerade neu gebaut.',
        'Er ist einer der besten Lehrer, die ich kenne.',
        'Das muss bis morgen erledigt werden.'
      ],
      C1: [
        'Er behauptet, er sei krank gewesen.',
        'Trotz des schlechten Wetters fand die Veranstaltung statt.',
        'Es handelt sich um ein weit verbreitetes Missverständnis.',
        'Die Veröffentlichung des Berichts sorgte für Aufsehen.',
        'Dem Experten zufolge ist diese Entwicklung unumkehrbar.',
        'Angesichts der Lage ist Vorsicht geboten.',
        'Die vorliegende Studie bestätigt diese Annahme.',
        'Es wird ersucht, die Unterlagen fristgerecht einzureichen.',
        'In Anbetracht der Umstände wurde die Frist verlängert.',
        'Die Frage bleibt nach wie vor offen.'
      ],
      C2: [
        'Er redete um den heißen Brei herum.',
        'Diese Maßnahme ist ein zweischneidiges Schwert.',
        'Der Autor bedient sich einer ausgesuchten Sprache.',
        'Man kann nicht umhin, diese Entwicklung zu begrüßen.',
        'Hierbei handelt es sich um ein Novum.',
        'Die Ausführungen sind von bestechender Klarheit.',
        'Es wäre vermessen, eine endgültige Antwort zu geben.',
        'Die Argumentation lässt keine Wünsche offen.',
        'Dieses Werk gilt als Meilenstein der Epoche.',
        'Der Kern der Sache liegt im Detail.'
      ]
    },
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
    advancedExamples: {
      B1: [
        '我把作业做完了。 (Wǒ bǎ zuòyè zuò wán le.)',
        '这本书被他借走了。 (Zhè běn shū bèi tā jiè zǒu le.)',
        '因为他生病了，所以没来上课。 (Yīnwèi tā shēngbìng le, suǒyǐ méi lái shàngkè.)',
        '只要努力，就一定能成功。 (Zhǐyào nǔlì, jiù yídìng néng chénggōng.)',
        '他汉语说得很好。 (Tā Hànyǔ shuō de hěn hǎo.)',
        '我打算明年去中国旅行。 (Wǒ dǎsuàn míngnián qù Zhōngguó lǚxíng.)',
        '这个问题不难解决。 (Zhège wèntí bù nán jiějué.)',
        '他跑得比我还快。 (Tā pǎo de bǐ wǒ hái kuài.)',
        '虽然下雨了，比赛还是继续进行。 (Suīrán xià yǔ le, bǐsài háishi jìxù jìnxíng.)',
        '我们边走边聊。 (Wǒmen biān zǒu biān liáo.)'
      ],
      B2: [
        '既然你已经决定了，就去做吧。 (Jìrán nǐ yǐjīng juédìng le, jiù qù zuò ba.)',
        '只有不断练习，才能提高水平。 (Zhǐyǒu búduàn liànxí, cái néng tígāo shuǐpíng.)',
        '无论多忙，他每天都会读书。 (Wúlùn duō máng, tā měitiān dōu huì dú shū.)',
        '这是去年建成的图书馆。 (Zhè shì qùnián jiàn chéng de túshūguǎn.)',
        '连小孩子都知道这个道理。 (Lián xiǎoháizi dōu zhīdào zhège dàolǐ.)',
        '由于天气原因，航班被取消了。 (Yóuyú tiānqì yuányīn, hángbān bèi qǔxiāo le.)',
        '他不仅会英语，而且会法语。 (Tā bùjǐn huì Yīngyǔ, érqiě huì Fǎyǔ.)',
        '这件事对公司的影响很大。 (Zhè jiàn shì duì gōngsī de yǐngxiǎng hěn dà.)',
        '经过讨论，大家达成了共识。 (Jīngguò tǎolùn, dàjiā dáchéng le gòngshí.)',
        '他之所以迟到，是因为路上堵车。 (Tā zhīsuǒyǐ chídào, shì yīnwèi lùshang dǔchē.)'
      ],
      C1: [
        '因此，我们需要重新考虑这个问题。 (Yīncǐ, wǒmen xūyào chóngxīn kǎolǜ zhège wèntí.)',
        '这篇报告详细分析了市场趋势。 (Zhè piān bàogào xiángxì fēnxī le shìchǎng qūshì.)',
        '做事情不能半途而废。 (Zuò shìqing bù néng bàntú\u2019érfèi.)',
        '这项政策引起了广泛关注。 (Zhè xiàng zhèngcè yǐnqǐ le guǎngfàn guānzhù.)',
        '值得注意的是，经济正在复苏。 (Zhídé zhùyì de shì, jīngjì zhèngzài fùsū.)',
        '总而言之，这是一个难得的机会。 (Zǒng\u2019éryánzhī, zhè shì yí ge nándé de jīhuì.)',
        '面对困难，他从容不迫。 (Miànduì kùnnan, tā cóngróngbúpò.)',
        '这一发现具有深远的意义。 (Zhè yì fāxiàn jùyǒu shēnyuǎn de yìyì.)',
        '他不遗余力地帮助他人。 (Tā bùyíyúlì de bāngzhù tārén.)',
        '从长远来看，这项投资是值得的。 (Cóng chángyuǎn lái kàn, zhè xiàng tóuzī shì zhídé de.)'
      ],
      C2: [
        '学而时习之，不亦说乎？ (Xué ér shí xí zhī, bú yì yuè hū?)',
        '千里之行，始于足下。 (Qiānlǐ zhī xíng, shǐ yú zúxià.)',
        '他的演讲慷慨激昂，令人动容。 (Tā de yǎnjiǎng kāngkǎi jī\u2019áng, lìng rén dòngróng.)',
        '此乃前所未有之创举。 (Cǐ nǎi qiánsuǒwèiyǒu zhī chuàngjǔ.)',
        '君子和而不同。 (Jūnzǐ hé ér bù tóng.)',
        '滴水穿石，非一日之功。 (Dīshuǐ chuān shí, fēi yí rì zhī gōng.)',
        '他引经据典，说服了众人。 (Tā yǐnjīngjùdiǎn, shuōfú le zhòngrén.)',
        '此说虽有争议，却不无道理。 (Cǐ shuō suī yǒu zhēngyì, què bù wú dàolǐ.)',
        '工欲善其事，必先利其器。 (Gōng yù shàn qí shì, bì xiān lì qí qì.)',
        '文如其人，字如其人。 (Wén rú qí rén, zì rú qí rén.)'
      ]
    },
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
    advancedExamples: {
      B1: [
        'While I was cooking, the phone rang.',
        'The book that I read was great.',
        'If I were you, I would go.',
        'The letter was sent yesterday.',
        'He said he would come.',
        'I have been working here for two years.',
        'She is the friend who helped me.',
        'We could go out if it stops raining.',
        'I have never seen such a beautiful place.',
        'They are planning to visit us next month.'
      ],
      B2: [
        'If she had known, she would have come.',
        'By the time I arrived, they had left.',
        'They must be home — the lights are on.',
        'Despite the heavy rain, we went out.',
        'The bridge is being repaired at the moment.',
        'He suggested that we take a break.',
        'The project was completed ahead of schedule.',
        'I would rather stay at home tonight.',
        'She is used to working under pressure.',
        'The more you practise, the better you become.'
      ],
      C1: [
        'No sooner had I left than it started raining.',
        'It was the manager who made the decision.',
        'The results appear to suggest a trend.',
        'Not only did he win, but he also broke the record.',
        'Little did we know what was about to happen.',
        'The findings, however, remain inconclusive.',
        'This approach is widely regarded as effective.',
        'In light of the evidence, the claim seems justified.',
        'There is a strong case for further research.',
        'The issue was raised at the outset of the meeting.'
      ],
      C2: [
        'He let the cat out of the bag.',
        'Notwithstanding the challenges, the project succeeded.',
        'The proposal is by no means without merit.',
        'It goes without saying that this is a landmark work.',
        'She is nothing if not meticulous.',
        'The argument is elegant, if somewhat reductive.',
        'At the end of the day, the decision is yours.',
        'This is, to all intents and purposes, a new era.',
        'His remarks were lost on the audience.',
        'The distinction is subtle but nonetheless crucial.'
      ]
    },
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
    advancedExamples: {
      B1: [
        'عندما كنت طفلا، كنت أقضي العطلة عند جدي وجدتي. (ʿIndamā kuntu ṭiflan, kuntu aqḍī l-ʿuṭla ʿinda jaddī wa-jaddatī.)',
        'لو كان لدي وقت أكثر، لسافرت أكثر. (Law kāna ladayya waqtun akthar, lasāfartu akthar.)',
        'من المهم أن تتعلم قواعد النحو. (Min al-muhimmi an tataʿallama qawāʿida n-naḥw.)',
        'أريد أن أزور هذا المتحف. (Urīdu an azūra hādhā l-matḥaf.)',
        'الكتابُ الذي أقرأه ممتعٌ. (Al-kitābu lladhī aqraʾuhu mumtiʿun.)',
        'سأسافرُ الأسبوعَ القادمَ. (Sa-usāfiru l-usbūʿa l-qādima.)',
        'إذا درستَ، نجحتَ. (Idhā darasta, najaḥta.)',
        'قالَ إنه سيأتي غدا. (Qāla innahu sayaʾtī ghadan.)',
        'أحبُّ أن أتعلمَ اللغاتِ. (Uḥibbu an ataʿallama l-lughāti.)',
        'نذهبُ إلى المدرسةِ كلَّ يومٍ. (Nadhhabu ilā l-madrasati kulla yawmin.)'
      ],
      B2: [
        'نُشر التقرير الأسبوع الماضي. (Nushira t-taqrīr al-usbūʿa l-māḍī.)',
        'رغم المطر، خرجنا. (Raghma l-maṭar, kharajnā.)',
        'الإجراءاتُ المتخذةُ حسّنت الوضعَ. (Al-ijrāʾāt al-muttakhadha ḥassanat al-waḍʿ.)',
        'أريدُ أن أذهبَ إلى الجامعةِ. (Urīdu an adhhaba ilā l-jāmiʿati.)',
        'الطلابُ الذين يدرسونَ مجتهدونَ. (Aṭ-ṭullābu lladhīna yadrusūna mujtahidūna.)',
        'طلبُ العلمِ نورٌ. (Ṭalabu l-ʿilmi nūrun.)',
        'كُتِبَ الدرسُ من قبلِ الطالبِ. (Kutiba d-darsu min qibali ṭ-ṭālibi.)',
        'لولا مساعدتكَ، لفشلتُ. (Lawlā musāʿadatuka, lafashiltu.)',
        'يجبُ أن نُنجزَ العملَ في الوقتِ المحددِ. (Yajibu an nunjiza l-ʿamala fī l-waqti l-muḥaddadi.)',
        'على الرغم من صعوبةِ الامتحانِ، نجحتُ. (ʿAlā r-raghmi min ṣuʿūbati l-imtiḥāni, najaḥtu.)'
      ],
      C1: [
        'البحرُ كريمٌ، يعطي ولا يأخذُ. (Al-baḥru karīmun, yuʿṭī wa-lā yaʾkhudhu.)',
        'السادةُ المحترمون، نحيطكم علما بأن... (As-sādatu l-muḥtaramūna, nuḥīṭukum ʿilman bi-anna...)',
        'ازداد الوضعُ سوءاً يوما بعد يوم. (Izdāda l-waḍʿu sūʾan yawman baʿda yawmin.)',
        'القشةُ التي قصمت ظهرَ البعيرِ. (Al-qashatu llatī qaṣamat ẓahra l-baʿīri.)',
        'من بابِ أولى أن نبدأَ بأنفسنا. (Min bābi awlā an nabdaʾa bi-anfusinā.)',
        'يُضربُ المثلُ به في الصبرِ. (Yuḍrabu l-mathalu bihi fī ṣ-ṣabri.)',
        'لا يُعقلُ أن نُهملَ هذه القضيةَ. (Lā yuʿqalu an nuhmila hādhihi l-qaḍiyyata.)',
        'على الرغمِ من ذلكَ، بقيَ متفائلا. (ʿAlā r-raghmi min dhālika, baqiya mutafāʾilan.)',
        'يتجلى ذلكَ في أعمالهِ الأخيرةِ. (Yatajallā dhālika fī aʿmālihi l-akhīrati.)',
        'باختصارٍ، لا بدَّ من إعادةِ النظرِ. (Bikhtiṣārin, lā budda min iʿādati n-naẓari.)'
      ],
      C2: [
        'خيرُ الكلامِ ما قلَّ ودلَّ. (Khayru l-kalāmi mā qalla wa-dalla.)',
        'الصديقُ وقتَ الضيقِ. (Aṣ-ṣadīqu waqta ḍ-ḍīqi.)',
        'شربنا البحرَ مبالغةً في الكرمِ. (Sharibnā l-baḥra mubālaghatan fī l-karami.)',
        'العقلُ السليمُ في الجسمِ السليمِ. (Al-ʿaqlu s-salīmu fī l-jismi s-salīmi.)',
        'الجارُ قبلَ الدارِ. (Al-jāru qabla d-dāri.)',
        'رُبَّ ضارةٍ نافعةٌ. (Rubba ḍārratin nāfiʿatun.)',
        'ما كلُّ ما يُعلمُ يُقالُ. (Mā kullu mā yuʿlamu yuqālu.)',
        'تلكَ حكمةٌ بليغةٌ لا تحتاجُ إلى تفسيرٍ. (Tilka ḥikmatun balīghatun lā taḥtāju ilā tafsīrin.)',
        'في التأني السلامةُ وفي العجلةِ الندامةُ. (Fī t-taʾannī s-salāmatu wa-fī l-ʿajalati n-nadāmatu.)',
        'يدٌ واحدةٌ لا تُصفقُ. (Yadun wāḥidatun lā tuṣaffiqu.)'
      ]
    },
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
    advancedExamples: {
      B1: [
        'Я прочитал эту книгу вчера. (Ya prochital etu knigu vchera.)',
        'Он идёт в школу пешком. (On idyot v shkolu peshkom.)',
        'Я бы выпил кофе. (Ya by vypil kofe.)',
        'Иди сюда! (Idi syuda!)',
        'Когда я был ребёнком, я проводил каникулы у бабушки. (Kogda ya byl rebyonkom, ya provodil kanikuly u babushki.)',
        'Если бы у меня было больше времени, я бы больше путешествовал. (Yesli by u menya bylo bolshe vremeni, ya by bolshe puteshestvoval.)',
        'Мне нужно выучить эти слова. (Mne nuzhno vyuchit eti slova.)',
        'Он сказал, что придёт завтра. (On skazal, chto pridyot zavtra.)',
        'Мы едем в Москву на поезде. (My yedem v Moskvu na poyezde.)',
        'Я читаю книгу, которую мне подарили. (Ya chitayu knigu, kotoruyu mne podarili.)'
      ],
      B2: [
        'Отчёт был опубликован на прошлой неделе. (Otchyot byl opublikovan na proshloy nedele.)',
        'Несмотря на дождь, мы вышли. (Nesmotrya na dozhd, my vyshli.)',
        'Принятые меры улучшили ситуацию. (Prinyatyye mery uluchshili situatsiyu.)',
        'Написанное письмо лежит на столе. (Napisannoye pismo lezhit na stole.)',
        'Он ушёл, закрыв дверь. (On ushyol, zakryv dver.)',
        'Дом строится строителями. (Dom stroitsya stroitelyami.)',
        'Несмотря на трудности, он продолжал. (Nesmotrya na trudnosti, on prodolzhal.)',
        'Прочитав книгу, я вернул её в библиотеку. (Prochitav knigu, ya vernul yeyo v biblioteku.)',
        'Законченная работа была сдана вовремя. (Zakonchennaya rabota byla sdana vovremya.)',
        'Хотя было поздно, мы продолжили работу. (Khotya bylo pozdno, my prodolzhili rabotu.)'
      ],
      C1: [
        'Он открыл окно, и оно осталось открытым. (On otkryl okno, i ono ostalos otkrytym.)',
        'Я чувствую себя не в своей тарелке. (Ya chuvstvuyu sebya ne v svoyey tarelke.)',
        'Позвольте Вас проинформировать. (Pozvolte Vas proinformirovat.)',
        'Докладчик подчеркнул важность этой проблемы. (Dokladchik podcherknul vazhnost etoy problemy.)',
        'Ввиду сложившихся обстоятельств срок был продлён. (Vvidu slozhivshikhsya obstoyatelstv srok byl prodlyon.)',
        'Вряд ли это решение можно считать окончательным. (Vryad li eto resheniye mozhno schitat okonchatelnym.)',
        'Следует отметить, что ситуация изменилась. (Sleduyet otmetit, chto situatsiya izmenilas.)',
        'Он прочитал доклад, произведя сильное впечатление. (On prochital doklad, proizvedya silnoye vpechatleniye.)',
        'Это обстоятельство сыграло решающую роль. (Eto obstoyatelstvo sygralo reshayushchuyu rol.)',
        'По сути дела, ничего не изменилось. (Po suti dela, nichego ne izmenilos.)'
      ],
      C2: [
        'Это была ложь во спасение. (Eto byla lozh vo spaseniye.)',
        'Необходимо осуществить задуманное. (Neobkhodimo osushchestvit zadumannoye.)',
        'Он владеет словом виртуозно. (On vladeyet slovom virtuozno.)',
        'Как говорится, не всё то золото, что блестит. (Kak govoritsya, ne vsyo to zoloto, chto blestit.)',
        'Автор прибегает к тонким стилистическим приёмам. (Avtor pribegayet k tonkim stilisticheskim priyomam.)',
        'Этот роман считается вершиной эпохи. (Etot roman schitayetsya vershinoy epokhi.)',
        'Он внёс неоценимый вклад в науку. (On vnyos neotsenimyy vklad v nauku.)',
        'Суть вопроса заключается в деталях. (Sut voprosa zaklyuchayetsya v detalyakh.)',
        'Нельзя не признать справедливость этого замечания. (Nelzya ne priznat spravedlivost etogo zamechaniya.)',
        'Он выразил мысль с предельной ясностью. (On vyrazil mysl s predelnoy yasnostyu.)'
      ]
    },
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

/* ---------- Contenu A2 spécifique (défini au niveau A2, distinct du noyau A1) ----------
   Corrige H-001 : les programmes A2 ne réutilisent plus le contenu A1. */
const A2_MODULES = {
  FR: [
    { theme: 'La routine quotidienne', vocab: [['se réveiller', 'to wake up'], ['s\u2019habiller', 'to get dressed'], ['le petit-déjeuner', 'breakfast'], ['partir', 'to leave'], ['rentrer', 'to come home'], ['se coucher', 'to go to bed'], ['faire la cuisine', 'to cook']],
      examples: ["Je me réveille à sept heures.", "Je prends mon petit-déjeuner à sept heures et demie.", "Je pars au travail à huit heures.", "Je rentre à la maison à six heures.", "Le soir, je fais la cuisine.", "Je me couche à dix heures."],
      dialogue: ['À quelle heure tu te réveilles ?', 'À sept heures, puis je prends mon petit-déjeuner.', 'Tu te couches tôt le soir ?', 'Oui, vers dix heures.'] },
    { theme: 'Nourriture et achats', vocab: [['le marché', 'market'], ['le prix', 'price'], ['acheter', 'to buy'], ['le kilo', 'kilo'], ['coûter', 'to cost'], ['bon marché', 'cheap'], ['cher', 'expensive']],
      examples: ["Je vais au marché le samedi.", "Combien coûte un kilo de tomates ?", "Ce fromage est bon marché.", "Ce restaurant est trop cher pour moi.", "J'achète du pain et des légumes.", "Les prix ont augmenté cette année."],
      dialogue: ['Tu vas où pour faire les courses ?', 'Je vais au marché le samedi matin.', "C'est cher au marché ?", "Non, c'est souvent bon marché."] },
    { theme: 'Voyages et transports', vocab: [['le train', 'train'], ['la gare', 'station'], ['le billet', 'ticket'], ['le passeport', 'passport'], ["l'arrêt", 'stop'], ['réserver', 'to book'], ['en retard', 'late']],
      examples: ["Je prends le train pour Paris.", "Le train part de la gare à neuf heures.", "J'ai réservé un billet en ligne.", "Mon train est en retard de dix minutes.", "N'oublie pas ton passeport.", "Le bus s'arrête à cet arrêt."],
      dialogue: ['Tu pars en voyage ce week-end ?', 'Oui, je prends le train samedi.', 'Tu as réservé ton billet ?', 'Oui, et mon passeport est prêt.'] },
    { theme: 'Santé et corps', vocab: [['le médecin', 'doctor'], ['le médicament', 'medicine'], ['la douleur', 'pain'], ['malade', 'ill'], ['la pharmacie', 'pharmacy'], ['avoir mal', 'to hurt'], ['se reposer', 'to rest']],
      examples: ["J'ai mal à la tête.", "Je vais chez le médecin demain.", "La pharmacie est ouverte le soir.", "Il est malade et il se repose.", "Prends ce médicament après le repas.", "La douleur a disparu."],
      dialogue: ["Tu n'as pas l'air bien. Qu'est-ce que tu as ?", "J'ai mal au ventre depuis ce matin.", 'Tu es allé chez le médecin ?', "Oui, il m'a donné un médicament."] },
    { theme: 'Souvenirs et passé', vocab: [['hier', 'yesterday'], ['la semaine dernière', 'last week'], ['avant', 'before'], ['visiter', 'to visit'], ['rencontrer', 'to meet'], ['il y a', 'ago'], ["l'enfance", 'childhood']],
      examples: ["Hier, j'ai visité un musée.", "La semaine dernière, nous avons voyagé.", "Avant, j'habitais dans un petit village.", "J'ai rencontré un vieil ami.", "Il y a deux ans, je suis allé au Maroc.", "Mon enfance était heureuse."],
      dialogue: ["Qu'est-ce que tu as fait hier ?", "J'ai visité un musée avec des amis.", "C'était intéressant ?", 'Oui, surtout les tableaux anciens.'] },
    { theme: 'Projets et avenir', vocab: [['demain', 'tomorrow'], ['la semaine prochaine', 'next week'], ['bientôt', 'soon'], ['projeter', 'to plan'], ['espérer', 'to hope'], ["avoir l'intention", 'to intend'], ['prévoir', 'to foresee']],
      examples: ["Demain, je vais commencer un cours.", "La semaine prochaine, nous allons déménager.", "Bientôt, je vais voyager en France.", "Je projette d'apprendre l'allemand.", "J'espère trouver un bon travail.", "Nous prévoyons de visiter Dakar."],
      dialogue: ["Quels sont tes projets pour l'année prochaine ?", 'Je vais voyager et chercher un travail.', 'Tu espères trouver quoi ?', 'Un poste dans une entreprise française.'] }
  ],
  DE: [
    { theme: 'Tagesablauf', vocab: [['aufstehen', 'to get up'], ['sich anziehen', 'to get dressed'], ['das Frühstück', 'breakfast'], ['losgehen', 'to leave'], ['nach Hause kommen', 'to come home'], ['ins Bett gehen', 'to go to bed'], ['kochen', 'to cook']],
      examples: ['Ich stehe um sieben Uhr auf.', 'Ich frühstücke um halb acht.', 'Ich gehe um acht Uhr los.', 'Ich komme um sechs Uhr nach Hause.', 'Abends koche ich.', 'Ich gehe um zehn Uhr ins Bett.'],
      dialogue: ['Wann stehst du auf?', 'Um sieben Uhr, dann frühstücke ich.', 'Gehst du früh ins Bett?', 'Ja, gegen zehn Uhr.'] },
    { theme: 'Essen und Einkaufen', vocab: [['der Markt', 'market'], ['der Preis', 'price'], ['kaufen', 'to buy'], ['das Kilo', 'kilo'], ['kosten', 'to cost'], ['billig', 'cheap'], ['teuer', 'expensive']],
      examples: ['Ich gehe am Samstag auf den Markt.', 'Was kostet ein Kilo Tomaten?', 'Dieser Käse ist billig.', 'Dieses Restaurant ist zu teuer.', 'Ich kaufe Brot und Gemüse.', 'Die Preise sind dieses Jahr gestiegen.'],
      dialogue: ['Wo kaufst du ein?', 'Am Samstag gehe ich auf den Markt.', 'Ist es auf dem Markt teuer?', 'Nein, es ist oft billig.'] },
    { theme: 'Reisen und Verkehr', vocab: [['der Zug', 'train'], ['der Bahnhof', 'station'], ['die Fahrkarte', 'ticket'], ['der Reisepass', 'passport'], ['die Haltestelle', 'stop'], ['buchen', 'to book'], ['die Verspätung', 'delay']],
      examples: ['Ich nehme den Zug nach Berlin.', 'Der Zug fährt um neun Uhr ab.', 'Ich habe eine Fahrkarte online gebucht.', 'Mein Zug hat zehn Minuten Verspätung.', 'Vergiss deinen Reisepass nicht.', 'Der Bus hält an dieser Haltestelle.'],
      dialogue: ['Verreist du dieses Wochenende?', 'Ja, ich nehme am Samstag den Zug.', 'Hast du deine Fahrkarte gebucht?', 'Ja, und mein Reisepass ist fertig.'] },
    { theme: 'Gesundheit und Körper', vocab: [['der Arzt', 'doctor'], ['das Medikament', 'medicine'], ['der Schmerz', 'pain'], ['krank', 'ill'], ['die Apotheke', 'pharmacy'], ['wehtun', 'to hurt'], ['sich ausruhen', 'to rest']],
      examples: ['Ich habe Kopfschmerzen.', 'Ich gehe morgen zum Arzt.', 'Die Apotheke ist abends geöffnet.', 'Er ist krank und ruht sich aus.', 'Nimm dieses Medikament nach dem Essen.', 'Der Schmerz ist weg.'],
      dialogue: ['Du siehst nicht gut aus. Was hast du?', 'Ich habe seit heute Morgen Bauchschmerzen.', 'Warst du beim Arzt?', 'Ja, er hat mir ein Medikament gegeben.'] },
    { theme: 'Erinnerungen und Vergangenheit', vocab: [['gestern', 'yesterday'], ['letzte Woche', 'last week'], ['früher', 'before'], ['besuchen', 'to visit'], ['treffen', 'to meet'], ['vor', 'ago'], ['die Kindheit', 'childhood']],
      examples: ['Gestern habe ich ein Museum besucht.', 'Letzte Woche sind wir verreist.', 'Früher wohnte ich in einem kleinen Dorf.', 'Ich habe einen alten Freund getroffen.', 'Vor zwei Jahren war ich in Österreich.', 'Meine Kindheit war glücklich.'],
      dialogue: ['Was hast du gestern gemacht?', 'Ich habe mit Freunden ein Museum besucht.', 'War es interessant?', 'Ja, besonders die alten Bilder.'] },
    { theme: 'Pläne und Zukunft', vocab: [['morgen', 'tomorrow'], ['nächste Woche', 'next week'], ['bald', 'soon'], ['planen', 'to plan'], ['hoffen', 'to hope'], ['vorhaben', 'to intend'], ['erwarten', 'to expect']],
      examples: ['Morgen beginne ich einen Kurs.', 'Nächste Woche ziehen wir um.', 'Bald reise ich nach Deutschland.', 'Ich plane, Deutsch zu lernen.', 'Ich hoffe, eine gute Arbeit zu finden.', 'Wir erwarten, Berlin zu besuchen.'],
      dialogue: ['Was sind deine Pläne für nächstes Jahr?', 'Ich will reisen und Arbeit suchen.', 'Was hoffst du zu finden?', 'Eine Stelle in einer deutschen Firma.'] }
  ],
  ZH: [
    { theme: '日常生活 Daily routine', vocab: [['起床 (qǐchuáng)', 'to get up'], ['穿衣 (chuānyī)', 'to get dressed'], ['早餐 (zǎocān)', 'breakfast'], ['出门 (chūmén)', 'to leave'], ['回家 (huíjiā)', 'to come home'], ['睡觉 (shuìjiào)', 'to go to bed'], ['做饭 (zuòfàn)', 'to cook']],
      examples: ['我七点起床。 (Wǒ qī diǎn qǐchuáng.)', '我七点半吃早餐。 (Wǒ qī diǎn bàn chī zǎocān.)', '我八点出门。 (Wǒ bā diǎn chūmén.)', '我六点回家。 (Wǒ liù diǎn huíjiā.)', '晚上我做饭。 (Wǎnshang wǒ zuòfàn.)', '我十点睡觉。 (Wǒ shí diǎn shuìjiào.)'],
      dialogue: ['你几点起床？ (Nǐ jǐ diǎn qǐchuáng?)', '七点，然后吃早餐。 (Qī diǎn, ránhòu chī zǎocān.)', '你晚上睡得早吗？ (Nǐ wǎnshang shuì de zǎo ma?)', '对，十点左右。 (Duì, shí diǎn zuǒyòu.)'] },
    { theme: '食物和购物 Food & shopping', vocab: [['市场 (shìchǎng)', 'market'], ['价格 (jiàgé)', 'price'], ['买 (mǎi)', 'to buy'], ['公斤 (gōngjīn)', 'kilo'], ['花费 (huāfèi)', 'to cost'], ['便宜 (piányi)', 'cheap'], ['贵 (guì)', 'expensive']],
      examples: ['我星期六去市场。 (Wǒ xīngqīliù qù shìchǎng.)', '一公斤西红柿多少钱？ (Yì gōngjīn xīhóngshì duōshao qián?)', '这个奶酪很便宜。 (Zhège nǎilào hěn piányi.)', '这家饭馆太贵了。 (Zhè jiā fànguǎn tài guì le.)', '我买面包和蔬菜。 (Wǒ mǎi miànbāo hé shūcài.)', '今年价格上涨了。 (Jīnnián jiàgé shàngzhǎng le.)'],
      dialogue: ['你去哪里买菜？ (Nǐ qù nǎlǐ mǎi cài?)', '我星期六早上在市场买。 (Wǒ xīngqīliù zǎoshang zài shìchǎng mǎi.)', '市场贵吗？ (Shìchǎng guì ma?)', '不贵，常常很便宜。 (Bú guì, chángcháng hěn piányi.)'] },
    { theme: '旅行和交通 Travel & transport', vocab: [['火车 (huǒchē)', 'train'], ['车站 (chēzhàn)', 'station'], ['票 (piào)', 'ticket'], ['护照 (hùzhào)', 'passport'], ['站 (zhàn)', 'stop'], ['预订 (yùdìng)', 'to book'], ['迟到 (chídào)', 'late']],
      examples: ['我坐火车去北京。 (Wǒ zuò huǒchē qù Běijīng.)', '火车九点从车站出发。 (Huǒchē jiǔ diǎn cóng chēzhàn chūfā.)', '我在网上订了票。 (Wǒ zài wǎngshang dìng le piào.)', '我的火车晚点十分钟。 (Wǒ de huǒchē wǎndiǎn shí fēnzhōng.)', '别忘了你的护照。 (Bié wàng le nǐ de hùzhào.)', '公共汽车在这一站停。 (Gōnggòng qìchē zài zhè yí zhàn tíng.)'],
      dialogue: ['你这个周末去旅行吗？ (Nǐ zhège zhōumò qù lǚxíng ma?)', '去，我星期六坐火车。 (Qù, wǒ xīngqīliù zuò huǒchē.)', '你订票了吗？ (Nǐ dìng piào le ma?)', '订了，护照也准备好了。 (Dìng le, hùzhào yě zhǔnbèi hǎo le.)'] },
    { theme: '健康 Health', vocab: [['医生 (yīshēng)', 'doctor'], ['药 (yào)', 'medicine'], ['疼痛 (téngtòng)', 'pain'], ['生病 (shēngbìng)', 'ill'], ['药店 (yàodiàn)', 'pharmacy'], ['疼 (téng)', 'to hurt'], ['休息 (xiūxi)', 'to rest']],
      examples: ['我头疼。 (Wǒ tóuténg.)', '我明天去看医生。 (Wǒ míngtiān qù kàn yīshēng.)', '药店晚上开门。 (Yàodiàn wǎnshang kāimén.)', '他生病了，在休息。 (Tā shēngbìng le, zài xiūxi.)', '饭后吃这个药。 (Fàn hòu chī zhège yào.)', '疼痛消失了。 (Téngtòng xiāoshī le.)'],
      dialogue: ['你看起来不舒服，怎么了？ (Nǐ kàn qǐlái bù shūfu, zěnme le?)', '我从早上开始肚子疼。 (Wǒ cóng zǎoshang kāishǐ dùzi téng.)', '你去看医生了吗？ (Nǐ qù kàn yīshēng le ma?)', '去了，他给了我药。 (Qù le, tā gěi le wǒ yào.)'] },
    { theme: '回忆 Past & memories', vocab: [['昨天 (zuótiān)', 'yesterday'], ['上周 (shàngzhōu)', 'last week'], ['以前 (yǐqián)', 'before'], ['参观 (cānguān)', 'to visit'], ['见面 (jiànmiàn)', 'to meet'], ['前 (qián)', 'ago'], ['童年 (tóngnián)', 'childhood']],
      examples: ['昨天我参观了一个博物馆。 (Zuótiān wǒ cānguān le yí ge bówùguǎn.)', '上周我们去旅行了。 (Shàngzhōu wǒmen qù lǚxíng le.)', '以前我住在一个小村子。 (Yǐqián wǒ zhù zài yí ge xiǎo cūnzi.)', '我遇见了一位老朋友。 (Wǒ yùjiàn le yí wèi lǎo péngyou.)', '两年前我去了中国。 (Liǎng nián qián wǒ qù le Zhōngguó.)', '我的童年很快乐。 (Wǒ de tóngnián hěn kuàilè.)'],
      dialogue: ['你昨天做了什么？ (Nǐ zuótiān zuò le shénme?)', '我和朋友参观了一个博物馆。 (Wǒ hé péngyou cānguān le yí ge bówùguǎn.)', '有意思吗？ (Yǒu yìsi ma?)', '有，特别是那些古画。 (Yǒu, tèbié shì nàxiē gǔhuà.)'] },
    { theme: '计划 Plans & future', vocab: [['明天 (míngtiān)', 'tomorrow'], ['下周 (xiàzhōu)', 'next week'], ['很快 (hěnkuài)', 'soon'], ['计划 (jìhuà)', 'to plan'], ['希望 (xīwàng)', 'to hope'], ['打算 (dǎsuàn)', 'to intend'], ['预计 (yùjì)', 'to expect']],
      examples: ['明天我开始上课。 (Míngtiān wǒ kāishǐ shàngkè.)', '下周我们要搬家。 (Xiàzhōu wǒmen yào bānjiā.)', '很快我要去中国旅行。 (Hěnkuài wǒ yào qù Zhōngguó lǚxíng.)', '我计划学汉语。 (Wǒ jìhuà xué Hànyǔ.)', '我希望找到好工作。 (Wǒ xīwàng zhǎodào hǎo gōngzuò.)', '我们预计参观上海。 (Wǒmen yùjì cānguān Shànghǎi.)'],
      dialogue: ['你明年有什么计划？ (Nǐ míngnián yǒu shénme jìhuà?)', '我要旅行和找工作。 (Wǒ yào lǚxíng hé zhǎo gōngzuò.)', '你希望找到什么？ (Nǐ xīwàng zhǎodào shénme?)', '一家中国公司的职位。 (Yì jiā Zhōngguó gōngsī de zhíwèi.)'] }
  ],
  EN: [
    { theme: 'Daily routine', vocab: [['wake up', 'to wake up'], ['get dressed', 'to get dressed'], ['breakfast', 'breakfast'], ['leave', 'to leave'], ['come home', 'to come home'], ['go to bed', 'to go to bed'], ['cook', 'to cook']],
      examples: ['I wake up at seven o\u2019clock.', 'I have breakfast at half past seven.', 'I leave for work at eight.', 'I come home at six.', 'In the evening, I cook.', 'I go to bed at ten.'],
      dialogue: ['What time do you wake up?', 'At seven, then I have breakfast.', 'Do you go to bed early?', 'Yes, around ten o\u2019clock.'] },
    { theme: 'Food and shopping', vocab: [['market', 'market'], ['price', 'price'], ['buy', 'to buy'], ['kilo', 'kilo'], ['cost', 'to cost'], ['cheap', 'cheap'], ['expensive', 'expensive']],
      examples: ['I go to the market on Saturday.', 'How much does a kilo of tomatoes cost?', 'This cheese is cheap.', 'That restaurant is too expensive for me.', 'I buy bread and vegetables.', 'Prices went up this year.'],
      dialogue: ['Where do you shop?', 'I go to the market on Saturday morning.', 'Is it expensive at the market?', 'No, it is often cheap.'] },
    { theme: 'Travel and transport', vocab: [['train', 'train'], ['station', 'station'], ['ticket', 'ticket'], ['passport', 'passport'], ['stop', 'stop'], ['book', 'to book'], ['late', 'late']],
      examples: ['I take the train to London.', 'The train leaves the station at nine.', 'I booked a ticket online.', 'My train is ten minutes late.', 'Do not forget your passport.', 'The bus stops at this stop.'],
      dialogue: ['Are you travelling this weekend?', 'Yes, I am taking the train on Saturday.', 'Did you book your ticket?', 'Yes, and my passport is ready.'] },
    { theme: 'Health and the body', vocab: [['doctor', 'doctor'], ['medicine', 'medicine'], ['pain', 'pain'], ['ill', 'ill'], ['pharmacy', 'pharmacy'], ['hurt', 'to hurt'], ['rest', 'to rest']],
      examples: ['I have a headache.', 'I am going to the doctor tomorrow.', 'The pharmacy is open in the evening.', 'He is ill and is resting.', 'Take this medicine after the meal.', 'The pain is gone.'],
      dialogue: ['You do not look well. What is wrong?', 'My stomach has hurt since this morning.', 'Did you see a doctor?', 'Yes, he gave me some medicine.'] },
    { theme: 'Past and memories', vocab: [['yesterday', 'yesterday'], ['last week', 'last week'], ['before', 'before'], ['visit', 'to visit'], ['meet', 'to meet'], ['ago', 'ago'], ['childhood', 'childhood']],
      examples: ['Yesterday I visited a museum.', 'Last week we travelled.', 'Before, I lived in a small village.', 'I met an old friend.', 'Two years ago I went to Spain.', 'My childhood was happy.'],
      dialogue: ['What did you do yesterday?', 'I visited a museum with friends.', 'Was it interesting?', 'Yes, especially the old paintings.'] },
    { theme: 'Plans and future', vocab: [['tomorrow', 'tomorrow'], ['next week', 'next week'], ['soon', 'soon'], ['plan', 'to plan'], ['hope', 'to hope'], ['intend', 'to intend'], ['expect', 'to expect']],
      examples: ['Tomorrow I am starting a course.', 'Next week we are moving.', 'Soon I am going to travel abroad.', 'I plan to learn Spanish.', 'I hope to find a good job.', 'We expect to visit a new city.'],
      dialogue: ['What are your plans for next year?', 'I am going to travel and look for work.', 'What do you hope to find?', 'A job at an international company.'] }
  ],
  AR: [
    { theme: 'الروتين اليومي Daily routine', vocab: [['يستيقظ (yastayqiẓ)', 'to wake up'], ['يرتدي (yartadī)', 'to get dressed'], ['الفطور (al-fuṭūr)', 'breakfast'], ['يغادر (yughādir)', 'to leave'], ['يعود (yaʿūd)', 'to come home'], ['ينام (yanām)', 'to go to bed'], ['يطبخ (yaṭbukh)', 'to cook']],
      examples: ['أستيقظ في السابعة. (Astayqiẓ fī s-sābiʿa.)', 'أتناول الفطور في السابعة والنصف. (Atanāwalu l-fuṭūr fī s-sābiʿa wa-n-niṣf.)', 'أغادر للعمل في الثامنة. (Ughādiru lil-ʿamal fī th-thāmina.)', 'أعود إلى البيت في السادسة. (Aʿūdu ilā l-bayt fī s-sādisa.)', 'في المساء أطبخ. (Fī l-masāʾ aṭbukh.)', 'أنام في العاشرة. (Anāmu fī l-ʿāshira.)'],
      dialogue: ['متى تستيقظ؟ (Matā tastayqiẓ?)', 'في السابعة، ثم أتناول الفطور. (Fī s-sābiʿa, thumma atanāwalu l-fuṭūr.)', 'هل تنام مبكرا؟ (Hal tanāmu mubakkiran?)', 'نعم، حوالي العاشرة. (Naʿam, ḥawālay al-ʿāshira.)'] },
    { theme: 'الطعام والتسوق Food & shopping', vocab: [['السوق (as-sūq)', 'market'], ['السعر (as-siʿr)', 'price'], ['يشتري (yashtarī)', 'to buy'], ['الكيلو (al-kīlū)', 'kilo'], ['يكلّف (yukallif)', 'to cost'], ['رخيص (rakhīṣ)', 'cheap'], ['غالٍ (ghālin)', 'expensive']],
      examples: ['أذهب إلى السوق يوم السبت. (Adhhabu ilā s-sūq yawma s-sabt.)', 'كم يكلّف كيلو الطماطم؟ (Kam yukallifu kīlū aṭ-ṭamāṭim?)', 'هذا الجبن رخيص. (Hādhā l-jubn rakhīṣ.)', 'هذا المطعم غالٍ جدا. (Hādhā l-maṭʿam ghālin jiddan.)', 'أشتري الخبز والخضار. (Ashtarī l-khubz wa-l-khuḍār.)', 'ارتفعت الأسعار هذه السنة. (Irtafaʿat al-asʿār hādhihi s-sana.)'],
      dialogue: ['أين تتسوق؟ (Ayna tatasawwaq?)', 'أذهب إلى السوق صباح السبت. (Adhhabu ilā s-sūq ṣabāḥa s-sabt.)', 'هل السوق غالٍ؟ (Hal as-sūq ghālin?)', 'لا، غالبا ما يكون رخيصا. (Lā, ghāliban mā yakūnu rakhīṣan.)'] },
    { theme: 'السفر والنقل Travel & transport', vocab: [['القطار (al-qiṭār)', 'train'], ['المحطة (al-maḥaṭṭa)', 'station'], ['التذكرة (at-tadhkira)', 'ticket'], ['جواز السفر (jawāz as-safar)', 'passport'], ['الموقف (al-mawqif)', 'stop'], ['يحجز (yaḥjiz)', 'to book'], ['متأخر (mutaʾakhkhir)', 'late']],
      examples: ['آخذ القطار إلى المدينة. (Ākhudhu l-qiṭār ilā l-madīna.)', 'يغادر القطار المحطة في التاسعة. (Yughādiru l-qiṭār al-maḥaṭṭa fī t-tāsiʿa.)', 'حجزت تذكرة عبر الإنترنت. (Ḥajaztu tadhkiratan ʿabra l-intarnit.)', 'قطاري متأخر عشر دقائق. (Qiṭārī mutaʾakhkhir ʿashr daqāʾiq.)', 'لا تنسَ جواز سفرك. (Lā tansa jawāza safarik.)', 'تقف الحافلة في هذا الموقف. (Taqifu l-ḥāfila fī hādhā l-mawqif.)'],
      dialogue: ['هل تسافر في نهاية الأسبوع؟ (Hal tusāfiru fī nihāyati l-usbūʿ?)', 'نعم، آخذ القطار يوم السبت. (Naʿam, ākhudhu l-qiṭār yawma s-sabt.)', 'هل حجزت تذكرتك؟ (Hal ḥajazta tadhkiratak?)', 'نعم، وجواز السفر جاهز. (Naʿam, wa-jawāzu s-safar jāhiz.)'] },
    { theme: 'الصحة Health', vocab: [['الطبيب (aṭ-ṭabīb)', 'doctor'], ['الدواء (ad-dawāʾ)', 'medicine'], ['الألم (al-alam)', 'pain'], ['مريض (marīḍ)', 'ill'], ['الصيدلية (aṣ-ṣaydaliyya)', 'pharmacy'], ['يؤلم (yuʾlim)', 'to hurt'], ['يستريح (yastarīḥ)', 'to rest']],
      examples: ['عندي صداع. (ʿIndī ṣudāʿ.)', 'سأذهب إلى الطبيب غدا. (Sa-adhhabu ilā ṭ-ṭabīb ghadan.)', 'الصيدلية مفتوحة في المساء. (Aṣ-ṣaydaliyya maftūḥa fī l-masāʾ.)', 'هو مريض ويستريح. (Huwa marīḍ wa-yastarīḥ.)', 'خذ هذا الدواء بعد الطعام. (Khudh hādhā d-dawāʾ baʿda ṭ-ṭaʿām.)', 'اختفى الألم. (Ikhtafā l-alam.)'],
      dialogue: ['لا تبدو بخير. ما بك؟ (Lā tabdū bikhayr. Mā bik?)', 'أشعر بألم في البطن منذ الصباح. (Ashʿuru bi-alam fī l-baṭn mundhu ṣ-ṣabāḥ.)', 'هل ذهبت إلى الطبيب؟ (Hal dhahabta ilā ṭ-ṭabīb?)', 'نعم، أعطاني دواء. (Naʿam, aʿṭānī dawāʾan.)'] },
    { theme: 'الماضي والذكريات Past & memories', vocab: [['أمس (ams)', 'yesterday'], ['الأسبوع الماضي (al-usbūʿ al-māḍī)', 'last week'], ['قبل (qabl)', 'before'], ['يزور (yazūr)', 'to visit'], ['يلتقي (yaltaqī)', 'to meet'], ['منذ (mundhu)', 'ago'], ['الطفولة (aṭ-ṭufūla)', 'childhood']],
      examples: ['زرت متحفا أمس. (Zurtu matḥafan ams.)', 'سافرنا الأسبوع الماضي. (Sāfarnā al-usbūʿa l-māḍī.)', 'قبل، كنت أعيش في قرية صغيرة. (Qabl, kuntu aʿīshu fī qarya ṣaghīra.)', 'التقيت بصديق قديم. (Ilaqaytu bi-ṣadīq qadīm.)', 'منذ سنتين ذهبت إلى المغرب. (Mundhu sanatayni dhahabtu ilā l-Maghrib.)', 'كانت طفولتي سعيدة. (Kānat ṭufūlatī saʿīda.)'],
      dialogue: ['ماذا فعلت أمس؟ (Mādhā faʿalta ams?)', 'زرت متحفا مع الأصدقاء. (Zurtu matḥafan maʿa l-aṣdiqāʾ.)', 'هل كان ممتعا؟ (Hal kāna mumtiʿan?)', 'نعم، خاصة اللوحات القديمة. (Naʿam, khāṣṣatan al-lawḥāt al-qadīma.)'] },
    { theme: 'الخطط والمستقبل Plans & future', vocab: [['غدا (ghadan)', 'tomorrow'], ['الأسبوع القادم (al-usbūʿ al-qādim)', 'next week'], ['قريبا (qarīban)', 'soon'], ['يخطط (yukhaṭṭiṭ)', 'to plan'], ['يأمل (yaʾmul)', 'to hope'], ['ينوي (yanwī)', 'to intend'], ['يتوقع (yatawaqqaʿ)', 'to expect']],
      examples: ['غدا سأبدأ دورة. (Ghadan sa-abdaʾu dawra.)', 'سننتقل الأسبوع القادم. (Sanantaqilu al-usbūʿa l-qādim.)', 'قريبا سأسافر. (Qarīban sa-usāfiru.)', 'أخطط لتعلم العربية. (Ukhaṭṭiṭu litaʿallumi l-ʿarabiyya.)', 'آمل أن أجد عملا جيدا. (Āmulu an ajida ʿamalan jayyidan.)', 'نتوقع زيارة مدينة جديدة. (Natawaqqaʿu ziyārata madīna jadīda.)'],
      dialogue: ['ما خططك للسنة القادمة؟ (Mā khiṭaṭuka lis-sanati l-qādima?)', 'سأسافر وأبحث عن عمل. (Sa-usāfiru wa-abḥathu ʿan ʿamal.)', 'ماذا تأمل أن تجد؟ (Mādhā taʾmulu an tajid?)', 'وظيفة في شركة عربية. (Waẓīfa fī sharika ʿarabiyya.)'] }
  ],
  RU: [
    { theme: 'Распорядок дня Daily routine', vocab: [['вставать (vstavat\u2019)', 'to wake up'], ['одеваться (odevat\u2019sya)', 'to get dressed'], ['завтрак (zavtrak)', 'breakfast'], ['уходить (ukhodit\u2019)', 'to leave'], ['возвращаться (vozvrashchat\u2019sya)', 'to come home'], ['ложиться спать (lozhit\u2019sya spat\u2019)', 'to go to bed'], ['готовить (gotovit\u2019)', 'to cook']],
      examples: ['Я встаю в семь часов. (Ya vstayu v sem\u2019 chasov.)', 'Я завтракаю в половине восьмого. (Ya zavtrakayu v polovine vos\u2019mogo.)', 'Я ухожу на работу в восемь. (Ya ukhozhu na rabotu v vosem\u2019.)', 'Я возвращаюсь домой в шесть. (Ya vozvrashchayus\u2019 domoy v shest\u2019.)', 'Вечером я готовлю. (Vecherom ya gotovlyu.)', 'Я ложусь спать в десять. (Ya lozhus\u2019 spat\u2019 v desyat\u2019.)'],
      dialogue: ['Когда ты встаёшь? (Kogda ty vstayosh\u2019?)', 'В семь, потом завтракаю. (V sem\u2019, potom zavtrakayu.)', 'Ты рано ложишься спать? (Ty rano lozhish\u2019sya spat\u2019?)', 'Да, около десяти. (Da, okolo desyati.)'] },
    { theme: 'Еда и покупки Food & shopping', vocab: [['рынок (rynok)', 'market'], ['цена (tsena)', 'price'], ['покупать (pokupat\u2019)', 'to buy'], ['килограмм (kilogramm)', 'kilo'], ['стоить (stoit\u2019)', 'to cost'], ['дешёвый (deshyovyy)', 'cheap'], ['дорогой (dorogoy)', 'expensive']],
      examples: ['Я хожу на рынок в субботу. (Ya khozhu na rynok v subbotu.)', 'Сколько стоит килограмм помидоров? (Skol\u2019ko stoit kilogramm pomidorov?)', 'Этот сыр дешёвый. (Etot syr deshyovyy.)', 'Этот ресторан слишком дорогой. (Etot restoran slishkom dorogoy.)', 'Я покупаю хлеб и овощи. (Ya pokupayu khleb i ovoshchi.)', 'Цены выросли в этом году. (Tseny vyrosli v etom godu.)'],
      dialogue: ['Где ты покупаешь продукты? (Gde ty pokupayesh\u2019 produkty?)', 'Я хожу на рынок в субботу утром. (Ya khozhu na rynok v subbotu utrom.)', 'На рынке дорого? (Na rynke dorogo?)', 'Нет, часто дешёво. (Net, chasto deshyovo.)'] },
    { theme: 'Путешествия и транспорт Travel & transport', vocab: [['поезд (poyezd)', 'train'], ['вокзал (vokzal)', 'station'], ['билет (bilet)', 'ticket'], ['паспорт (pasport)', 'passport'], ['остановка (ostanovka)', 'stop'], ['бронировать (bronirovat\u2019)', 'to book'], ['опоздать (opozdat\u2019)', 'late']],
      examples: ['Я еду на поезде в Москву. (Ya yedu na poyezde v Moskvu.)', 'Поезд отправляется с вокзала в девять. (Poyezd otpravlyayetsya s vokzala v devyat\u2019.)', 'Я забронировал билет онлайн. (Ya zabroniroval bilet onlayn.)', 'Мой поезд опоздал на десять минут. (Moy poyezd opozdal na desyat\u2019 minut.)', 'Не забудь паспорт. (Ne zabud\u2019 pasport.)', 'Автобус останавливается на этой остановке. (Avtobus ostanavlivayetsya na etoy ostanovke.)'],
      dialogue: ['Ты едешь куда-нибудь в выходные? (Ty yedesh\u2019 kuda-nibud\u2019 v vykhodnyye?)', 'Да, я еду на поезде в субботу. (Da, ya yedu na poyezde v subbotu.)', 'Ты забронировал билет? (Ty zabroniroval bilet?)', 'Да, и паспорт готов. (Da, i pasport gotov.)'] },
    { theme: 'Здоровье Health', vocab: [['врач (vrach)', 'doctor'], ['лекарство (lekarstvo)', 'medicine'], ['боль (bol\u2019)', 'pain'], ['больной (bol\u2019noy)', 'ill'], ['аптека (apteka)', 'pharmacy'], ['болеть (bolet\u2019)', 'to hurt'], ['отдыхать (otdykhat\u2019)', 'to rest']],
      examples: ['У меня болит голова. (U menya bolit golova.)', 'Я иду к врачу завтра. (Ya idu k vrachu zavtra.)', 'Аптека открыта вечером. (Apteka otkryta vecherom.)', 'Он болен и отдыхает. (On bolen i otdykhayet.)', 'Прими это лекарство после еды. (Primi eto lekarstvo posle yedy.)', 'Боль прошла. (Bol\u2019 proshla.)'],
      dialogue: ['Ты плохо выглядишь. Что случилось? (Ty plokho vyglyadish\u2019. Chto sluchilos\u2019?)', 'У меня болит живот с утра. (U menya bolit zhivot s utra.)', 'Ты ходил к врачу? (Ty khodil k vrachu?)', 'Да, он дал мне лекарство. (Da, on dal mne lekarstvo.)'] },
    { theme: 'Прошлое и воспоминания Past & memories', vocab: [['вчера (vchera)', 'yesterday'], ['на прошлой неделе (na proshloy nedele)', 'last week'], ['раньше (ran\u2019she)', 'before'], ['посещать (poseshchat\u2019)', 'to visit'], ['встречать (vstrechat\u2019)', 'to meet'], ['назад (nazad)', 'ago'], ['детство (detstvo)', 'childhood']],
      examples: ['Вчера я посетил музей. (Vchera ya posetil muzey.)', 'На прошлой неделе мы путешествовали. (Na proshloy nedele my puteshestvovali.)', 'Раньше я жил в маленькой деревне. (Ran\u2019she ya zhil v malen\u2019koy derevne.)', 'Я встретил старого друга. (Ya vstretil starogo druga.)', 'Два года назад я ездил в Испанию. (Dva goda nazad ya yezdil v Ispaniyu.)', 'Моё детство было счастливым. (Moyo detstvo bylo schastlivym.)'],
      dialogue: ['Что ты делал вчера? (Chto ty delal vchera?)', 'Я посетил музей с друзьями. (Ya posetil muzey s druz\u2019yami.)', 'Было интересно? (Bylo interesno?)', 'Да, особенно старые картины. (Da, osobenno staryye kartiny.)'] },
    { theme: 'Планы и будущее Plans & future', vocab: [['завтра (zavtra)', 'tomorrow'], ['на следующей неделе (na sleduyushchey nedele)', 'next week'], ['скоро (skoro)', 'soon'], ['планировать (planirovat\u2019)', 'to plan'], ['надеяться (nadeyat\u2019sya)', 'to hope'], ['намереваться (namerevat\u2019sya)', 'to intend'], ['ожидать (ozhidat\u2019)', 'to expect']],
      examples: ['Завтра я начинаю курс. (Zavtra ya nachinayu kurs.)', 'На следующей неделе мы переезжаем. (Na sleduyushchey nedele my pereyezzhayem.)', 'Скоро я поеду за границу. (Skoro ya poyedu za granitsu.)', 'Я планирую учить испанский. (Ya planiruyu uchit\u2019 ispanskiy.)', 'Я надеюсь найти хорошую работу. (Ya nadeyus\u2019 nayti khoroshuyu rabotu.)', 'Мы ожидаем посетить новый город. (My ozhidayem posetit\u2019 novyy gorod.)'],
      dialogue: ['Какие у тебя планы на следующий год? (Kakiye u tebya plany na sleduyushchiy god?)', 'Я поеду путешествовать и искать работу. (Ya poyedu puteshestvovat\u2019 i iskat\u2019 rabotu.)', 'Что ты надеешься найти? (Chto ty nadeyesh\u2019sya nayti?)', 'Работу в международной компании. (Rabotu v mezhdunarodnoy kompanii.)'] }
  ]
};

/* Prononciation et culture nivelées pour les niveaux avancés (corrige C-006 :
   les leçons B1–C2 ne réutilisent plus la prononciation/culture A1). */
const LEVEL_PRONUNCIATION = {
  FR: { B1: ['intonation expressive', 'groupes rythmiques'], B2: ['accentuation de phrase', 'liaisons facultatives'], C1: ['registres prosodiques', 'prosodie argumentative'], C2: ['style oral soutenu', 'rythme stylistique'] },
  DE: { B1: ['Satzintonation', 'Wortgruppenbetonung'], B2: ['Sprechmelodie', 'emphatische Betonung'], C1: ['Registerprosodie', 'Argumentationsintonation'], C2: ['stilistischer Vortrag', 'rhetorische Pausen'] },
  ZH: { B1: ['sentence intonation', 'tone in connected speech'], B2: ['discourse intonation', 'emphasis and contrast'], C1: ['formal oral register', 'rhetorical pacing'], C2: ['classical recitation rhythm', 'stylistic prosody'] },
  EN: { B1: ['sentence stress', 'linking'], B2: ['discourse intonation', 'emphasis'], C1: ['academic prosody', 'hedging intonation'], C2: ['rhetorical delivery', 'stylistic rhythm'] },
  AR: { B1: ['sentence stress', 'pausal forms'], B2: ['emphatic intonation', 'connected speech'], C1: ['formal register prosody', 'rhetorical emphasis'], C2: ['oratorical style', 'stylistic intonation'] },
  RU: { B1: ['sentence intonation', 'phrasal stress'], B2: ['expressive intonation', 'connected speech'], C1: ['formal register prosody', 'argumentative intonation'], C2: ['oratorical style', 'stylistic rhythm'] }
};

const LEVEL_CULTURE = {
  FR: { B1: 'société et médias francophones', B2: 'institutions et débats de société', C1: 'discours académique et professionnel', C2: 'patrimoine littéraire et variation linguistique' },
  DE: { B1: 'Alltag und Gesellschaft', B2: 'Institutionen und gesellschaftliche Debatten', C1: 'akademischer und beruflicher Diskurs', C2: 'Literatur und Sprachvariation' },
  ZH: { B1: 'daily life and media', B2: 'society and institutions', C1: 'academic and professional discourse', C2: 'classical and literary heritage' },
  EN: { B1: 'society and media', B2: 'institutions and public debate', C1: 'academic and professional discourse', C2: 'literary and stylistic heritage' },
  AR: { B1: 'المجتمع ووسائل الإعلام', B2: 'المؤسسات والنقاش العام', C1: 'الخطاب الأكاديمي والمهني', C2: 'التراث الأدبي والبلاغي' },
  RU: { B1: 'общество и средства массовой информации', B2: 'институты и общественные дискуссии', C1: 'академический и профессиональный дискурс', C2: 'литературное и стилистическое наследие' }
};

/* Durées de production nivelées (corrige H-003). */
const BAND_TASK = {
  A1: { speak: '30–45 s', write: '40–60' },
  A2: { speak: '45–60 s', write: '60–90' },
  B1: { speak: '1–2 min', write: '120–180' },
  B2: { speak: '2–3 min', write: '180–250' },
  C1: { speak: '3–4 min', write: '250–350' },
  C2: { speak: '4–5 min', write: '350–450' }
};

/* Dialogues authentiques nivelés pour les niveaux B1–C2 (corrige H-004 :
   les leçons d'interaction n'utilisent plus 4 phrases d'exemple). */
const LEVEL_DIALOGUES = {
  FR: {
    B1: ["Tu as voyagé l'année dernière ?", "Oui, je suis allé à Dakar pour le travail.", "Tu as eu le temps de visiter la ville ?", "Un peu, le week-end. J'ai adoré l'île de Gorée."],
    B2: ["À ton avis, le télétravail est-il un progrès ?", "D'un côté, il offre plus de liberté ; de l'autre, il isole les équipes.", "Comment trouver un équilibre ?", "Il faut sans doute alterner présence et distance."],
    C1: ["Peux-tu synthétiser les conclusions de l'étude ?", "L'étude souligne une tendance de fond, bien que les données restent partielles.", "Quelles réserves faut-il émettre ?", "La taille de l'échantillon limite la portée des résultats."],
    C2: ["Cet argument vous paraît-il recevable ?", "À y regarder de plus près, il ne résiste pas à l'analyse.", "Pourtant, sa rhétorique est séduisante.", "Certes, mais la forme ne saurait tenir lieu de fond."]
  },
  DE: {
    B1: ['Bist du letztes Jahr verreist?', 'Ja, ich war beruflich in Berlin.', 'Hattest du Zeit, die Stadt zu sehen?', 'Ein bisschen, am Wochenende. Es hat mir gut gefallen.'],
    B2: ['Ist Homeoffice deiner Meinung nach ein Fortschritt?', 'Einerseits bietet es mehr Freiheit, andererseits isoliert es die Teams.', 'Wie findet man ein Gleichgewicht?', 'Man sollte wohl Präsenz und Distanz abwechseln.'],
    C1: ['Kannst du die Ergebnisse der Studie zusammenfassen?', 'Die Studie zeigt einen klaren Trend, obwohl die Daten unvollständig sind.', 'Welche Vorbehalte muss man anbringen?', 'Die Stichprobengröße schränkt die Aussagekraft ein.'],
    C2: ['Erscheint Ihnen dieses Argument stichhaltig?', 'Bei näherer Betrachtung hält es der Analyse nicht stand.', 'Die Rhetorik ist dennoch verführerisch.', 'Gewiss, aber die Form kann den Inhalt nicht ersetzen.']
  },
  ZH: {
    B1: ['你去年去旅行了吗？ (Nǐ qùnián qù lǚxíng le ma?)', '去了，我因为工作去了上海。 (Qù le, wǒ yīnwèi gōngzuò qù le Shànghǎi.)', '你有时间参观城市吗？ (Nǐ yǒu shíjiān cānguān chéngshì ma?)', '有一点，周末去了。我很喜欢。 (Yǒu yìdiǎn, zhōumò qù le. Wǒ hěn xǐhuan.)'],
    B2: ['你认为远程办公是进步吗？ (Nǐ rènwéi yuǎnchéng bàngōng shì jìnbù ma?)', '一方面，它提供更多自由；另一方面，它让团队孤立。 (Yì fāngmiàn, tā tígōng gèng duō zìyóu; lìng yì fāngmiàn, tā ràng tuánduì gūlì.)', '怎么找到平衡？ (Zěnme zhǎodào pínghéng?)', '也许应该交替使用办公室和远程。 (Yěxǔ yīnggāi jiāotì shǐyòng bàngōngshì hé yuǎnchéng.)'],
    C1: ['你能总结一下研究的结论吗？ (Nǐ néng zǒngjié yíxià yánjiū de jiélùn ma?)', '研究强调了一个基本趋势，尽管数据还不完整。 (Yánjiū qiángdiào le yí ge jīběn qūshì, jǐnguǎn shùjù hái bù wánzhěng.)', '需要提出什么保留意见？ (Xūyào tíchū shénme bǎoliú yìjiàn?)', '样本量限制了结果的适用范围。 (Yàngběn liàng xiànzhì le jiéguǒ de shìyòng fànwéi.)'],
    C2: ['这个论点您认为站得住脚吗？ (Zhège lùndiǎn nín rènwéi zhàn de zhù jiǎo ma?)', '仔细一看，它经不起分析。 (Zǐxì yí kàn, tā jīng bu qǐ fēnxī.)', '但它的修辞很吸引人。 (Dàn tā de xiūcí hěn xīyǐn rén.)', '的确，但形式不能代替内容。 (Díquè, dàn xíngshì bù néng dàitì nèiróng.)']
  },
  EN: {
    B1: ['Did you travel last year?', 'Yes, I went to London for work.', 'Did you have time to see the city?', 'A bit, at the weekend. I really enjoyed it.'],
    B2: ['Is remote work progress, in your view?', 'On the one hand it offers freedom; on the other it isolates teams.', 'How do you find a balance?', 'We should probably alternate presence and distance.'],
    C1: ['Can you summarise the findings of the study?', 'The study points to a clear trend, although the data remain partial.', 'What reservations should be raised?', 'The sample size limits the scope of the results.'],
    C2: ['Would you regard this argument as sound?', 'On closer inspection, it does not withstand analysis.', 'Its rhetoric is nonetheless appealing.', 'Granted, but form cannot substitute for substance.']
  },
  AR: {
    B1: ['هل سافرت العام الماضي؟ (Hal sāfarta al-ʿāma l-māḍī?)', 'نعم، سافرت إلى القاهرة للعمل. (Naʿam, sāfartu ilā l-Qāhira lil-ʿamal.)', 'هل كان لديك وقت لزيارة المدينة؟ (Hal kāna ladayka waqt liziyārati l-madīna?)', 'قليلا، في نهاية الأسبوع. أعجبتني كثيرا. (Qalīlan, fī nihāyati l-usbūʿ. Aʿjabatnī kathīran.)'],
    B2: ['هل العمل عن بعد تقدّم برأيك؟ (Hal al-ʿamal ʿan buʿd taqaddum bi-raʾyik?)', 'من جهة يوفر حرية أكبر، ومن جهة أخرى يعزل الفرق. (Min jiha yuwaqqir ḥurriyya akbar, wa-min jiha ukhrā yaʿzilu l-firaq.)', 'كيف نجد التوازن؟ (Kayfa najidu t-tawāzun?)', 'ربما نتبادل بين الحضور والبعد. (Rubamā natabādalu bayna l-ḥuḍūr wa-l-buʿd.)'],
    C1: ['هل يمكنك تلخيص نتائج الدراسة؟ (Hal yumkinuka talkhīṣ natāʾiji d-dirāsa?)', 'تشير الدراسة إلى اتجاه واضح، رغم أن البيانات غير مكتملة. (Tushīru d-dirāsa ilā ittijāh wāḍiḥ, raghma anna l-bayānāt ghayr mukmila.)', 'ما التحفظات التي يجب إبداؤها؟ (Mā t-taḥaffuẓāt allatī yajibu ibdāʾuhā?)', 'حجم العينة يحدّ من نطاق النتائج. (Ḥajmu l-ʿayyina yuḥaddidu min niṭāqi n-natāʾij.)'],
    C2: ['هل ترى أن هذه الحجة مقنعة؟ (Hal tarā anna hādhihi l-ḥujja muqniʿa?)', 'عند التدقيق، لا تصمد أمام التحليل. (ʿInda t-tadqīq, lā taṣmudu amāma t-taḥlīl.)', 'لكن بلاغتها جذابة. (Lakinna balāghatahā jadhdhāba.)', 'صحيح، لكن الشكل لا يغني عن المضمون. (Ṣaḥīḥ, lakinna sh-shakl lā yughnī ʿan al-maḍmūn.)']
  },
  RU: {
    B1: ['Ты путешествовал в прошлом году? (Ty puteshestvoval v proshlom godu?)', 'Да, я ездил в Москву по работе. (Da, ya yezdil v Moskvu po rabote.)', 'У тебя было время посмотреть город? (U tebya bylo vremya posmotret\u2019 gorod?)', 'Немного, в выходные. Мне очень понравилось. (Nemnogo, v vykhodnyye. Mne ochen\u2019 ponravilos\u2019.)'],
    B2: ['Удалённая работа — это прогресс? (Udalyonnaya rabota — eto progress?)', 'С одной стороны, больше свободы; с другой — команды изолированы. (S odnoy storony, bol\u2019she svobody; s drugoy — komandy izolirovany.)', 'Как найти баланс? (Kak nayti balans?)', 'Наверное, чередовать офис и удалёнку. (Navernoye, cheredovat\u2019 ofis i udalyonku.)'],
    C1: ['Можете обобщить выводы исследования? (Mozhete obobshchit\u2019 vyvody issledovaniya?)', 'Исследование выявляет устойчивую тенденцию, хотя данные неполны. (Issledovaniye vyyavlyayet ustoychivuyu tendentsiyu, khotya dannyye nepolny.)', 'Какие оговорки следует сделать? (Kakiye ogovorki sleduyet sdelat\u2019?)', 'Размер выборки ограничивает выводы. (Razmer vyborki ogranichivayet vyvody.)'],
    C2: ['Считаете ли вы этот довод убедительным? (Schitayete li vy etot dovod ubeditel\u2019nym?)', 'При ближайшем рассмотрении он не выдерживает анализа. (Pri blizhayshem rassmotrenii on ne vyderzhivayet analiza.)', 'Однако его риторика привлекательна. (Odnako yego ritorika privlekatel\u2019na.)', 'Верно, но форма не заменит содержания. (Verno, no forma ne zamenit soderzhaniya.)']
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

function isAdvancedBand(band) {
  return band === 'B1' || band === 'B2' || band === 'C1' || band === 'C2';
}

function pickExamples(L, academy, band, mi, g) {
  if (band === 'A1' || band === 'A2') {
    const base = band === 'A2' ? A2_MODULES[academy][mi] : L.modules[mi];
    const e1 = base.examples[g % base.examples.length];
    const e2 = base.dialogue[g % base.dialogue.length];
    return [e1, e2];
  }
  const adv = (L.advancedExamples && L.advancedExamples[band]) || [];
  if (!adv.length) return ['', ''];
  return [adv[g % adv.length], adv[(g + 1) % adv.length]];
}

/** Vocabulaire ciblé adapté au niveau : A1 → banque A1, A2 → banque A2,
    B1–C2 → vocabulaire thématique spécifique (LEVEL_VOCAB). */
function levelVocab(L, academy, band, moduleIndex, unitIndex) {
  if (band === 'A1') {
    return (L.modules[moduleIndex].vocab || []).slice(unitIndex * 2, unitIndex * 2 + 3).map((v) => v[0]);
  }
  if (band === 'A2') {
    return (A2_MODULES[academy][moduleIndex].vocab || []).slice(unitIndex * 2, unitIndex * 2 + 3).map((v) => v[0]);
  }
  const themeKey = (LEVEL_THEMES[band] && LEVEL_THEMES[band][moduleIndex]) || '';
  const words = (LEVEL_VOCAB[band] && LEVEL_VOCAB[band][themeKey] && LEVEL_VOCAB[band][themeKey][academy]) || [];
  return words.slice(unitIndex * 2, unitIndex * 2 + 3).map((w) => w[0]);
}

function buildLesson(academy, level, band, moduleIndex, unitIndex, lessonIndex, globalIndex, L, grammarPoint, theme, state) {
  const type = LESSON_TYPES[globalIndex % LESSON_TYPES.length];
  const pair = pickExamples(L, academy, band, moduleIndex, globalIndex);
  const e1 = pair[0];
  const e2 = pair[1];
  const vocabSlice = levelVocab(L, academy, band, moduleIndex, unitIndex);
  const dialogue = (band === 'A1')
    ? L.modules[moduleIndex].dialogue
    : (band === 'A2')
      ? A2_MODULES[academy][moduleIndex].dialogue
      : (LEVEL_DIALOGUES[academy][band] || []);
  const isInteraction = type.key === 'speaking' || type.key === 'listening';
  const fr = academy === 'FR';
  const vocabList = vocabSlice.join(', ');
  const advanced = isAdvancedBand(band);

  const explanation = fr
    ? '[' + type.name + '] ' + theme + '. Focus grammatical : ' + grammarPoint + '. ' +
      'Contenu ciblé : ' + vocabList + '. ' +
      (isInteraction ? 'Les apprenants travaillent le dialogue fourni en situation.' : 'Les apprenants observent, manipulent puis produisent la structure cible.')
    : '[' + type.name + '] ' + theme + '. Grammar focus: ' + grammarPoint + '. ' +
      'Target language: ' + vocabList + '. ' +
      (isInteraction ? 'Work with the dialogue in a real situation.' : 'Observe, manipulate, then produce the target structure.');

  const guided = (fr ? {
    input: 'Écoute/lis les exemples et identifie les éléments cibles : ' + vocabList + '.',
    vocab: 'Associe chaque élément à sa signification puis complète trois phrases à trous.',
    grammar: 'Observe la structure « ' + grammarPoint + ' » dans les exemples, puis complète les transformations.',
    listening: 'Écoute le dialogue et réponds à trois questions de compréhension.',
    speaking: 'Joue le dialogue en binôme en remplaçant les informations personnelles.',
    writing: 'Rédige un court texte guidé en réutilisant la structure et le vocabulaire cibles.'
  } : {
    input: 'Listen to / read the examples and identify the target items: ' + vocabList + '.',
    vocab: 'Match each item to its meaning, then complete three gap-fill sentences.',
    grammar: 'Study the pattern "' + grammarPoint + '" in the examples, then complete the transformations.',
    listening: 'Listen to the dialogue and answer three comprehension questions.',
    speaking: 'Act out the dialogue in pairs, replacing the personal information.',
    writing: 'Write a short guided text reusing the target structure and vocabulary.'
  })[type.key];

  const independent = (fr ? {
    input: 'Note deux nouvelles occurrences de la structure dans un texte authentique court.',
    vocab: 'Produis cinq phrases originales avec le vocabulaire cible.',
    grammar: 'Rédige trois phrases personnelles utilisant « ' + grammarPoint + ' ».',
    listening: 'Réécoute et résume le dialogue en trois phrases.',
    speaking: 'Présente oralement une situation personnelle liée au thème (' + BAND_TASK[band].speak + ').',
    writing: 'Rédige un texte sur le thème de ' + BAND_TASK[band].write + ' mots.'
  } : {
    input: 'Note two new occurrences of the structure in a short authentic text.',
    vocab: 'Produce five original sentences using the target vocabulary.',
    grammar: 'Write three personal sentences using "' + grammarPoint + '".',
    listening: 'Listen again and summarise the dialogue in three sentences.',
    speaking: 'Present a personal situation related to the topic orally (' + BAND_TASK[band].speak + ').',
    writing: 'Write a text on the topic of ' + BAND_TASK[band].write + ' words.'
  })[type.key];

  const assessment = (fr ? {
    input: 'Auto-évaluation : identifier 4/5 éléments cibles à l’écoute.',
    vocab: 'Quiz formatif : 5 items de vocabulaire (réponses ouvertes auto-vérifiées).',
    grammar: 'Tâche formative : appliquer « ' + grammarPoint + ' » dans 5 phrases.',
    listening: 'Compréhension orale formative : 3 questions ouvertes.',
    speaking: 'Production orale formative évaluée par les pairs selon les critères.',
    writing: 'Production écrite formative évaluée avec la rubrique ELA.'
  } : {
    input: 'Self-assessment: identify 4/5 target items by listening.',
    vocab: 'Formative quiz: 5 vocabulary items (self-checked open answers).',
    grammar: 'Formative task: apply "' + grammarPoint + '" in 5 sentences.',
    listening: 'Formative listening comprehension: 3 open questions.',
    speaking: 'Formative speaking production, peer-assessed against the criteria.',
    writing: 'Formative written production, assessed with the ELA rubric.'
  })[type.key];

  const mastery = (fr ? {
    input: 'Reconnaît au moins 4/5 éléments cibles avec exactitude.',
    vocab: 'Utilise au moins 5 éléments du vocabulaire cible correctement.',
    grammar: 'Applique « ' + grammarPoint + ' » avec une exactitude d’au moins 4/5.',
    listening: 'Répond correctement à au moins 2/3 questions de compréhension.',
    speaking: 'S’exprime de façon intelligible et pertinente pendant au moins 30 s.',
    writing: 'Produit un texte cohérent respectant la structure cible.'
  } : {
    input: 'Recognises at least 4/5 target items accurately.',
    vocab: 'Uses at least 5 target vocabulary items correctly.',
    grammar: 'Applies "' + grammarPoint + '" with at least 4/5 accuracy.',
    listening: 'Answers at least 2/3 comprehension questions correctly.',
    speaking: 'Speaks intelligibly and relevantly for at least 30 seconds.',
    writing: 'Produces a coherent text respecting the target structure.'
  })[type.key];

  const lessonId = 'prog_' + academy + '_' + level + '-M' + String(moduleIndex + 1).padStart(2, '0') +
    '-U' + String(unitIndex + 1).padStart(2, '0') + '-L' + String(lessonIndex + 1).padStart(2, '0');

  return {
    id: lessonId, type: 'lesson', lessonType: type.key, lessonTypeName: type.name,
    title: theme + ' — ' + type.name,
    objective: fr
      ? '[' + type.name + '] ' + theme + ': ' + (isInteraction ? 'interagir' : 'maîtriser') + ' la structure cible au niveau ' + level + '.'
      : '[' + type.name + '] ' + theme + ': ' + (isInteraction ? 'interact using' : 'master') + ' the target structure at ' + level + ' level.',
    prerequisites: lessonIndex === 0 ? [] : ['prog_' + academy + '_' + level + '-M' + String(moduleIndex + 1).padStart(2, '0') + '-U' + String(unitIndex + 1).padStart(2, '0') + '-L01'],
    estimatedDuration: 45,
    explanation: explanation,
    languageContent: vocabSlice,
    examples: [e1, e2],
    dialogue: isInteraction ? dialogue : [],
    guidedPractice: guided,
    independentPractice: independent,
    interaction: isInteraction
      ? (fr ? 'Tâche interactive : ' : 'Interactive task: ') + dialogue[0]
      : (fr ? 'Échange en binôme sur le thème.' : 'Pair exchange on the topic.'),
    assessment: assessment,
    masteryCriteria: mastery,
    vocabularyFocus: vocabSlice,
    grammarFocus: [grammarPoint],
    pronunciationFocus: advanced ? (LEVEL_PRONUNCIATION[academy][band] || L.pronunciation.slice(0, 2)) : L.pronunciation.slice(0, 2),
    culturalContext: advanced ? (LEVEL_CULTURE[academy][band] || theme) : L.culture[moduleIndex % L.culture.length],
    culturalReflection: fr
      ? 'Réflexion interculturelle : compare les conventions culturelles de « ' + (advanced ? (LEVEL_CULTURE[academy][band] || theme) : L.culture[moduleIndex % L.culture.length]) + ' » avec celles de ta propre culture.'
      : 'Intercultural reflection: compare the cultural conventions of "' + (advanced ? (LEVEL_CULTURE[academy][band] || theme) : L.culture[moduleIndex % L.culture.length]) + '" with those of your own culture.',
    activities: type.act,
    outcomeIds: [
      academy + '-' + level + '-LO-0' + ((globalIndex % 9) + 1),
      academy + '-' + level + '-LO-0' + (((globalIndex + 1) % 9) + 1)
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
  const advanced = isAdvancedBand(band);
  const state = levelContentState(level);
  const themes = LEVEL_THEMES[band] || LEVEL_THEMES.B1;
  const modules = [];
  let programmeIndex = 0;

  for (let mi = 0; mi < 6; mi++) {
    const base = useCore ? (band === 'A2' ? A2_MODULES[academy][mi] : L.modules[mi]) : null;
    const theme = useCore ? base.theme : (themes[mi] + ' — ' + L.language);
    const grammarPoint = grammar[mi] || '';
    const moduleId = 'prog_' + academy + '_' + level + '-M' + String(mi + 1).padStart(2, '0');
    const units = [];

    for (let ui = 0; ui < 3; ui++) {
      const unitId = moduleId + '-U' + String(ui + 1).padStart(2, '0');
      const vocabSlice = levelVocab(L, academy, band, mi, ui);
      const lessons = [];
      for (let li = 0; li < 2; li++) {
        lessons.push(buildLesson(academy, level, band, mi, ui, li, programmeIndex, L, grammarPoint, theme, state));
        programmeIndex++;
      }
      const fr = academy === 'FR';
      const unitOutcomeIds = Array.from(new Set(lessons.reduce((a, l) => a.concat(l.outcomeIds), [])));
      units.push({
        id: unitId, type: 'unit', title: theme + (fr ? ' — unité ' : ' — unit ') + (ui + 1),
        theme: theme, communicativeContext: (fr ? 'Usage courant et institutionnel de ' : 'Everyday and institutional use of ') + L.language,
        vocabularyFocus: vocabSlice, grammarFocus: [grammarPoint],
        pronunciationFocus: advanced ? (LEVEL_PRONUNCIATION[academy][band] || L.pronunciation.slice(0, 2)) : L.pronunciation.slice(0, 2),
        culturalContext: advanced ? (LEVEL_CULTURE[academy][band] || theme) : L.culture[mi % L.culture.length],
        outcomeIds: unitOutcomeIds,
        competencyIds: ['C-LIS', 'C-REA', 'C-WRI', 'C-SPE', 'C-GRA', 'C-VOC', 'C-INT', 'C-ICU'],
        lessons: lessons, status: state, contentState: state
      });
    }

    const moduleOutcomes = Array.from(new Set(units.reduce((a, u) => a.concat(u.outcomeIds), [])));
    modules.push({
      id: moduleId, type: 'module', title: theme, description: theme + ' — ' + L.language,
      outcomes: moduleOutcomes,
      competencyIds: ['C-LIS', 'C-REA', 'C-WRI', 'C-SPE', 'C-GRA', 'C-VOC', 'C-PRO', 'C-INT', 'C-ICU'],
      units: units, status: state, contentState: state
    });
  }

  const result = {
    programmeId: 'prog_' + academy + '_' + level,
    academyCode: academy, level: level, band: band,
    structure: 'Foundation → Development → Practice → Application → Integration → Assessment',
    modules: modules, contentState: state,
    note: state === 'DRAFT'
      ? 'ELA-authored draft curriculum (' + L.language + ' ' + level + '): real language-specific vocabulary, examples, dialogue, grammar progression and tasks. Pending ELA academic review before APPROVED/PUBLISHED.'
      : 'Advanced-level ELA draft (' + L.language + ' ' + level + '): themes, advanced examples, grammar and outcomes authored; full lesson bodies require specialist academic review.'
  };

  // Consolidation FR-A1 : fusionne le blueprint humain (titres/objectifs/
  // activités) avec le contenu réel, SANS modifier les IDs ni le contenu.
  if (academy === 'FR' && level === 'A1') {
    return require('./fr-a1-blueprint.js').enrichFrA1Curriculum(result);
  }
  return result;
}

module.exports = { LANGUAGES, GRAMMAR_BY_LEVEL, LEVEL_THEMES, LEVEL_BAND, LESSON_TYPES, levelContentState, buildLevelContent };
