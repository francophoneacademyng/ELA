/* ============================================================
   ELA — Contenu A1 Foundations (source canonique, 5 académies)
   Ce module est la source de vérité du contenu pédagogique.
   scripts/build-seed-json.js le transforme en data/seed/*.json
   (format Firestore). Chaque leçon : title (FR + langue cible),
   objective (FR), content, vocabulary (term/meaning FR),
   grammar, exercises (qcm/complete/translate), audioScript,
   cecrLevel, academyCode, isTrial.
   ============================================================ */
'use strict';

const DE = {
  academyCode: 'DE',
  academyKey: 'german',
  level: 'A1',
  levelId: 'DE_A1',
  certification: 'Goethe-Zertifikat',
  nativeName: 'Deutsch',
  cecrLevel: 'A1',
  course: {
    title: 'German A1 — Foundations',
    titleNative: 'Deutsch A1 — Grundlagen',
    description: 'Vos premiers pas en allemand : salutations, alphabet, nombres, famille, vie quotidienne, nourriture, logement, heure, achats et voyage. Préparation au Goethe-Zertifikat A1. Contenu bilingue avec dialogues audio et exercices corrigés.',
    category: 'All',
    learningOutcomes: [
      'Saluer, se présenter et prendre congé en allemand (formel et informel)',
      'Prononcer l’alphabet et les sons spécifiques ä, ö, ü, ß',
      'Compter jusqu’à 100, lire l’heure et gérer un rendez-vous',
      'Décrire sa famille, sa routine quotidienne et ses goûts',
      'Faire des achats, demander son chemin et voyager en autonomie'
    ],
    order: 1
  },
  lessons: [
    {
      id: 'DE_A1_L01', order: 1,
      title: 'Greetings & Introductions',
      titleNative: 'Begrüßungen & Vorstellung',
      objective: 'Saluer une personne à tout moment de la journée, se présenter avec son nom, demander et dire comment on va, et prendre congé poliment.',
      objectives: [
        'Saluer selon le moment de la journée et le niveau de formalité',
        'Se présenter : Ich heiße…, Ich komme aus…, Ich wohne in…',
        'Poser la question Wie geht es Ihnen? et y répondre'
      ],
      content: 'Die Begrüßung hängt von der Tageszeit und vom Grad der Formalität ab. (Les salutations dépendent du moment de la journée et du niveau de formalité.)\n\nLe matin on dit « Guten Morgen » (bonjour le matin), puis « Guten Tag » (bonne journée, en journée), et le soir « Guten Abend » (bonsoir). Entre amis et jeunes, « Hallo » (salut) convient toujours. Pour prendre congé : « Auf Wiedersehen » (au revoir, formel) ou « Tschüss » (salut, informel).\n\nPour demander comment va quelqu’un : « Wie geht es Ihnen? » (formel) ou « Wie geht’s? » (informel). Réponses typiques : « Mir geht es gut » (je vais bien), « Es geht » (ça va), « Nicht so gut » (pas très bien).\n\nPour se présenter : « Ich heiße Anna » (je m’appelle Anna), « Ich komme aus Nigeria » (je viens du Nigeria), « Ich wohne in Lagos » (j’habite à Lagos). Verbes au présent : sein (être), heißen (s’appeler), wohnen (habiter), kommen (venir).',
      vocabulary: [
        { term: 'Hallo', meaning: 'Salut / bonjour (informel)' },
        { term: 'Guten Morgen', meaning: 'Bonjour (le matin)' },
        { term: 'Guten Tag', meaning: 'Bonjour (en journée)' },
        { term: 'Guten Abend', meaning: 'Bonsoir' },
        { term: 'Auf Wiedersehen', meaning: 'Au revoir (formel)' },
        { term: 'Tschüss', meaning: 'Salut (au revoir informel)' },
        { term: 'die Begrüßung', meaning: 'la salutation' },
        { term: 'heißen', meaning: 's’appeler' },
        { term: 'wohnen', meaning: 'habiter' },
        { term: 'kommen', meaning: 'venir' },
        { term: 'Wie geht es Ihnen?', meaning: 'Comment allez-vous ?' },
        { term: 'Mir geht es gut', meaning: 'Je vais bien' },
        { term: 'Es geht', meaning: 'Ça va (moyen)' },
        { term: 'Bitte', meaning: 'S’il vous plaît / je vous en prie' },
        { term: 'Danke', meaning: 'Merci' }
      ],
      grammar: [
        'Le « Sie » de politesse (vous) s’emploie avec les étrangers et au travail ; le « du » (tu) avec les amis, la famille et les enfants. Verbe : ich bin, du bist, er/sie ist.',
        'Le verbe conjugué occupe la 2e position : Ich heiße Anna. Question : Wie heißt du?'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: 'Quelle salutation emploie-t-on le soir ?', options: ['Guten Morgen', 'Guten Abend', 'Gute Nacht', 'Hallo Tag'], answer: 'Guten Abend' },
        { type: 'complete', instruction: 'Complétez avec le verbe correct.', question: 'Complétez : « Ich ___ Anna » (s’appeler), « Ich ___ aus Frankreich » (venir).', answer: 'heiße ; komme' },
        { type: 'translate', instruction: 'Traduisez en allemand.', question: '« Comment allez-vous ? (formel) » et « Je vais bien, merci ».', answer: 'Wie geht es Ihnen? — Mir geht es gut, danke.' }
      ],
      audioScript: {
        context: 'Anna et Ben se rencontrent le matin dans un bureau à Berlin.',
        lines: [
          { speaker: 'Anna', text: 'Guten Morgen, Ben! Wie geht es Ihnen?' },
          { speaker: 'Ben', text: 'Guten Morgen, Anna! Mir geht es gut, danke. Und Ihnen?' },
          { speaker: 'Anna', text: 'Mir geht es auch gut. Ich heiße Anna, freut mich.' },
          { speaker: 'Ben', text: 'Ich heiße Ben. Ich komme aus Lagos und wohne in Berlin.' },
          { speaker: 'Anna', text: 'Schön! Auf Wiedersehen, Ben.' },
          { speaker: 'Ben', text: 'Tschüss, Anna!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: true
    },
{
      id: 'DE_A1_L02', order: 2,
      title: 'Alphabet & Pronunciation',
      titleNative: 'Alphabet & Aussprache',
      objective: 'Reconnaître les 30 lettres de l’alphabet allemand, prononcer les Umlaute ä, ö, ü et le ß, et lire à voix haute des mots simples.',
      objectives: [
        'Reconnaître les 26 lettres + ä, ö, ü, ß',
        'Prononcer les sons spéciaux et les combinaisons de voyelles',
        'Épeler son nom en allemand'
      ],
      content: 'Das deutsche Alphabet hat 26 Buchstaben wie im Englischen, plus vier besondere Zeichen: ä, ö, ü und ß. (L’alphabet allemand a 26 lettres comme l’anglais, plus quatre signes spéciaux : ä, ö, ü et ß.)\n\nLes voyelles avec deux points (Umlaut) changent de son : « ä » se dit comme le « e » de « père », « ö » comme un « eu » arrondi, « ü » comme un « u » avec les lèvres arrondies. Le « ß » (Eszett) est un « s » dur, après voyelle longue : « Straße » (rue), « heißen » (s’appeler).\n\nRègles utiles : « w » se prononce comme le « v » français (Wasser) ; « v » se dit souvent « f » (Vater) ; « z » se dit « ts » (Zeit). Combinaisons : « ei » = aïe, « ie » = i, « eu/äu » = oï, « sch » = ch français.\n\nPour épeler : « Wie bitte? » (pardon ?), « Können Sie das buchstabieren? » (pouvez-vous épeler ?). Épelez « München » : M-U-N-C-H-E-N.',
      vocabulary: [
        { term: 'das Alphabet', meaning: 'l’alphabet' },
        { term: 'der Buchstabe', meaning: 'la lettre' },
        { term: 'die Aussprache', meaning: 'la prononciation' },
        { term: 'der Umlaut', meaning: 'le tréma (ä, ö, ü)' },
        { term: 'das ß (Eszett)', meaning: 'le s dur allemand' },
        { term: 'der Vokal', meaning: 'la voyelle' },
        { term: 'der Konsonant', meaning: 'la consonne' },
        { term: 'buchstabieren', meaning: 'épeler' },
        { term: 'die Straße', meaning: 'la rue' },
        { term: 'heißen', meaning: 's’appeler' },
        { term: 'das Wasser', meaning: 'l’eau' },
        { term: 'vier', meaning: 'quatre' },
        { term: 'die Schule', meaning: 'l’école' },
        { term: 'heute', meaning: 'aujourd’hui' },
        { term: 'München', meaning: 'Munich' },
        { term: 'die Zeit', meaning: 'le temps' }
      ],
      grammar: [
        'Le ß ne s’utilise qu’après voyelle longue ou diphtongue ; après une voyelle courte on écrit « ss » (das Wasser, mais: der Bus).',
        'Les Umlaute changent parfois le pluriel : der Vater → die Väter.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: 'En plus des 26 lettres, combien y a-t-il de signes spéciaux ?', options: ['trois (ä, ö, ü)', 'quatre (ä, ö, ü, ß)', 'cinq', 'deux'], answer: 'quatre (ä, ö, ü, ß)' },
        { type: 'complete', instruction: 'Complétez.', question: 'Dans « Straße », le ß se prononce comme un … ; dans « Wasser », on écrit … après la voyelle courte.', answer: 's dur ; ss' },
        { type: 'translate', instruction: 'Épelez en allemand.', question: 'Épelez « München » lettre par lettre.', answer: 'M-U-N-C-H-E-N' }
      ],
      audioScript: {
        context: 'Un professeur fait répéter l’alphabet à un élève en classe.',
        lines: [
          { speaker: 'Lehrer', text: 'Sagen Sie das Alphabet bitte langsam: A, B, C, D, E, F, G…' },
          { speaker: 'Schüler', text: 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z.' },
          { speaker: 'Lehrer', text: 'Sehr gut! Und jetzt die Umlaute: ä, ö, ü.' },
          { speaker: 'Schüler', text: 'ä, ö, ü. Und das Eszett: ß.' },
          { speaker: 'Lehrer', text: 'Genau. Wie schreibt man „München“?' },
          { speaker: 'Schüler', text: 'M-U-N-C-H-E-N.' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L03', order: 3,
      title: 'Numbers & Counting',
      titleNative: 'Zahlen & Zählen',
      objective: 'Compter de 0 à 100, construire les nombres composés à l’allemande (unité avant dizaine), donner un âge et un numéro de téléphone.',
      objectives: [
        'Compter de 0 à 100',
        'Construire les nombres de 21 à 99 (sens inversé)',
        'Utiliser les nombres pour l’âge, le téléphone et les quantités'
      ],
      content: 'Die Zahlen 0 bis 20: null(0), eins(1), zwei(2), drei(3), vier(4), fünf(5), sechs(6), sieben(7), acht(8), neun(9), zehn(10), elf(11), zwölf(12), dreizehn(13), vierzehn(14), fünfzehn(15), sechzehn(16), siebzehn(17), achtzehn(18), neunzehn(19), zwanzig(20).\n\nÀ partir de 21, l’ordre est renversé : l’unité d’abord puis « und » puis la dizaine. Ex. 21 = einundzwanzig (un-et-vingt), 34 = vierunddreißig, 56 = sechsundfünfzig. Les dizaines : 20 zwanzig, 30 dreißig, 40 vierzig, 50 fünfzig, 60 sechzig, 70 siebzig, 80 achtzig, 90 neunzig, 100 hundert.\n\nPour demander l’âge : « Wie alt bist du? ». Réponse : « Ich bin zwanzig Jahre alt » (j’ai vingt ans). Jusqu’à 99, on garde « Jahr » au singulier : « einundzwanzig Jahre ».\n\nPour un numéro de téléphone, on lit chaque chiffre : 0152 384 = null-eins-fünf-zwei-drei-acht-vier.',
      vocabulary: [
        { term: 'null', meaning: 'zéro' },
        { term: 'eins', meaning: 'un' },
        { term: 'zwei', meaning: 'deux' },
        { term: 'drei', meaning: 'trois' },
        { term: 'vier', meaning: 'quatre' },
        { term: 'fünf', meaning: 'cinq' },
        { term: 'sechs', meaning: 'six' },
        { term: 'sieben', meaning: 'sept' },
        { term: 'acht', meaning: 'huit' },
        { term: 'neun', meaning: 'neuf' },
        { term: 'zehn', meaning: 'dix' },
        { term: 'zwanzig', meaning: 'vingt' },
        { term: 'dreißig', meaning: 'trente' },
        { term: 'hundert', meaning: 'cent' },
        { term: 'das Jahr', meaning: 'l’année / l’âge' },
        { term: 'zählen', meaning: 'compter' },
        { term: 'die Handynummer', meaning: 'le numéro de portable' }
      ],
      grammar: [
        'Construction inversée 21–99 : unité + und + dizaine (einundzwanzig = 21).',
        '« Jahre alt » : Ich bin fünfunddreißig Jahre alt (j’ai 35 ans).'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez le nombre correct.', question: 'Comment écrit-on 74 en allemand ?', options: ['siebenundvierzig', 'vierundsiebzig', 'vierzigsieben', 'siebenvierzig'], answer: 'vierundsiebzig' },
        { type: 'complete', instruction: 'Complétez.', question: 'Écrivez en chiffres : dreiundzwanzig = … ; sechzig = … ; neunundneunzig = …', answer: '23 ; 60 ; 99' },
        { type: 'translate', instruction: 'Traduisez.', question: '« J’ai trente ans » et « cent ».', answer: 'Ich bin dreißig Jahre alt. — hundert' }
      ],
      audioScript: {
        context: 'Au téléphone, Amina donne son numéro et demande l’âge de la fille de Karl.',
        lines: [
          { speaker: 'Amina', text: 'Hallo, meine Handynummer ist null-eins-fünf-zwei-drei-acht-vier.' },
          { speaker: 'Karl', text: 'Okay: null-eins-fünf-zwei-drei-acht-vier. Ich habe es!' },
          { speaker: 'Amina', text: 'Wie alt ist deine Tochter?' },
          { speaker: 'Karl', text: 'Sie ist sieben Jahre alt. Und deine?' },
          { speaker: 'Amina', text: 'Meine Nichte ist drei Jahre alt. Tschüss!' },
          { speaker: 'Karl', text: 'Tschüss, bis bald!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L04', order: 4,
      title: 'Family & People',
      titleNative: 'die Familie & Verwandte',
      objective: 'Nommer les membres de la famille, utiliser der/die/das, décrire une personne avec des adjectifs simples et parler de ses proches.',
      objectives: [
        'Nommer les membres de la famille et les proches',
        'Reconnaître et employer les articles der, die, das',
        'Décrire une personne (taille, âge, profession)'
      ],
      content: 'Die Familie (la famille) : der Vater (le père), die Mutter (la mère), die Eltern (les parents), der Sohn (le fils), die Tochter (la fille), der Bruder (le frère), die Schwester (la sœur), der Großvater (le grand-père), die Großmutter (la grand-mère), die Großeltern (les grands-parents), der Onkel (l’oncle), die Tante (la tante), der Cousin, die Cousine (le cousin, la cousine).\n\nChaque nom a un genre : masculin « der », féminin « die », neutre « das ». On apprend chaque mot avec son article : der Bruder (m), die Schwester (f), das Kind (n, l’enfant). Le pluriel se montre par l’article « die » : die Brüder, die Kinder.\n\nPour décrire : « Mein Bruder ist groß » (mon frère est grand), « Meine Schwester ist jung » (ma sœur est jeune). Adjectifs utiles : groß (grand), klein (petit), jung (jeune), alt (vieux), nett (gentil).\n\nPour parler de sa famille : « Ich habe zwei Brüder und eine Schwester » (j’ai deux frères et une sœur).',
      vocabulary: [
        { term: 'die Familie', meaning: 'la famille' },
        { term: 'der Vater', meaning: 'le père' },
        { term: 'die Mutter', meaning: 'la mère' },
        { term: 'die Eltern', meaning: 'les parents' },
        { term: 'der Sohn', meaning: 'le fils' },
        { term: 'die Tochter', meaning: 'la fille' },
        { term: 'der Bruder', meaning: 'le frère' },
        { term: 'die Schwester', meaning: 'la sœur' },
        { term: 'die Großeltern', meaning: 'les grands-parents' },
        { term: 'das Kind', meaning: 'l’enfant' },
        { term: 'der Onkel', meaning: 'l’oncle' },
        { term: 'die Tante', meaning: 'la tante' },
        { term: 'groß', meaning: 'grand' },
        { term: 'klein', meaning: 'petit' },
        { term: 'jung', meaning: 'jeune' },
        { term: 'alt', meaning: 'vieux' },
        { term: 'nett', meaning: 'gentil' },
        { term: 'haben', meaning: 'avoir' }
      ],
      grammar: [
        'Articles : der (masculin), die (féminin), das (neutre). Le pluriel s’écrit souvent « die » (die Brüder, die Kinder).',
        'Possessifs au nominatif : mein (masculin/neutre) et meine (féminin/pluriel) : mein Bruder, meine Schwester.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez l’article correct.', question: 'Quel article pour « Bruder » (frère) ?', options: ['der', 'die', 'das', 'ein'], answer: 'der' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez avec mein ou meine : « ___ Bruder ist groß », « ___ Mutter ist nett ».', answer: 'mein ; meine' },
        { type: 'translate', instruction: 'Traduisez.', question: '« J’ai deux sœurs et un frère ».', answer: 'Ich habe zwei Schwestern und einen Bruder.' }
      ],
      audioScript: {
        context: 'Yusuf montre une photo de famille à sa camarade de classe.',
        lines: [
          { speaker: 'Yusuf', text: 'Das ist meine Familie. Das ist mein Vater, Herr Ibrahim.' },
          { speaker: 'Lena', text: 'Und das ist deine Mutter?' },
          { speaker: 'Yusuf', text: 'Ja, das ist meine Mutter. Und das sind meine Geschwister.' },
          { speaker: 'Lena', text: 'Du hast einen Bruder und eine Schwester, stimmt?' },
          { speaker: 'Yusuf', text: 'Genau. Mein Bruder heißt Adam und ist groß.' },
          { speaker: 'Lena', text: 'Sehr schön! Deine Familie ist groß und nett.' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L05', order: 5,
      title: 'Daily Routine',
      titleNative: 'der Tagesablauf',
      objective: 'Décrire sa routine quotidienne au présent, utiliser les verbes réfléchis et les adverbes de fréquence, et parler des heures simples.',
      objectives: [
        'Raconter sa journée : aufstehen, frühstücken, arbeiten, schlafen',
        'Employer quelques verbes réfléchis (sich anziehen, sich waschen)',
        'Situer les actions dans le temps (immer, oft, am Morgen)'
      ],
      content: 'Le Tagesablauf (la routine quotidienne) s’exprime avec des verbes simples au présent : aufstehen (se lever), frühstücken (prendre le petit-déjeuner), arbeiten (travailler), essen (manger), schlafen (dormir).\n\nExemple : « Ich stehe um sieben Uhr auf » (je me lève à sept heures), « Ich frühstücke um halb acht » (je prends mon petit-déjeuner à sept heures et demie), « Ich arbeite von neun bis fünf » (je travaille de neuf à cinq heures), « Ich schlafe um elf » (je dors à onze heures).\n\nVerbes réfléchis : « sich anziehen » (s’habiller) → « Ich ziehe mich an » ; « sich waschen » (se laver) → « Ich wasche mich ». Le « mich » (me) varie selon la personne : mich, dich, sich.\n\nAdverbes de fréquence : immer (toujours), oft (souvent), manchmal (parfois), nie (jamais). Am Morgen (le matin), am Vormittag (en début d’après-midi), am Abend (le soir), in der Nacht (la nuit).',
      vocabulary: [
        { term: 'aufstehen', meaning: 'se lever' },
        { term: 'frühstücken', meaning: 'prendre le petit-déjeuner' },
        { term: 'arbeiten', meaning: 'travailler' },
        { term: 'essen', meaning: 'manger' },
        { term: 'trinken', meaning: 'boire' },
        { term: 'schlafen', meaning: 'dormir' },
        { term: 'sich anziehen', meaning: 's’habiller' },
        { term: 'sich waschen', meaning: 'se laver' },
        { term: 'der Morgen', meaning: 'le matin' },
        { term: 'der Abend', meaning: 'le soir' },
        { term: 'die Nacht', meaning: 'la nuit' },
        { term: 'immer', meaning: 'toujours' },
        { term: 'oft', meaning: 'souvent' },
        { term: 'manchmal', meaning: 'parfois' },
        { term: 'nie', meaning: 'jamais' },
        { term: 'die Arbeit', meaning: 'le travail' },
        { term: 'der Termin', meaning: 'le rendez-vous' }
      ],
      grammar: [
        'Les verbes séparables : préfixe séparé placé à la fin — « Ich stehe … auf ». Le verbe conjugué reste en 2e position.',
        'Réfléchi au datif/accusatif : Ich wasche mich ; Er zieht sich an.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez le verbe correct.', question: '« Ich ___ um sieben Uhr auf » (me lever).', options: ['stehe ... auf', 'aufstehe', 'stehe', 'auf ... stehe'], answer: 'stehe ... auf' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez : « Am Morgen ___ ich früh auf » (se lever) ; « Ich ___ mich an » (s’habiller).', answer: 'stehe ; ziehe' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Je me lève à six heures » et « je travaille de neuf à cinq heures ».', answer: 'Ich stehe um sechs Uhr auf. — Ich arbeite von neun bis fünf.' }
      ],
      audioScript: {
        context: 'Chidi décrit sa journée à une collègue pendant la pause.',
        lines: [
          { speaker: 'Chidi', text: 'Um sieben Uhr stehe ich auf und frühstücke.' },
          { speaker: 'Katrin', text: 'Und wann arbeitest du?' },
          { speaker: 'Chidi', text: 'Ich arbeite von neun bis fünf Uhr. Dann esse ich zu Mittag.' },
          { speaker: 'Katrin', text: 'Was machst du am Abend?' },
          { speaker: 'Chidi', text: 'Am Abend wasche ich mich und schlafe um elf Uhr.' },
          { speaker: 'Katrin', text: 'Deine Routine ist sehr diszipliniert, Chidi!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L06', order: 6,
      title: 'Food & Drink',
      titleNative: 'Essen und Trinken',
      objective: 'Nommer les aliments et boissons courants, commander au restaurant et faire ses courses au supermarché, et exprimer ses goûts.',
      objectives: [
        'Nommer nourriture, boissons, fruits et légumes',
        'Commander au restaurant : Ich möchte …, bitte',
        'Faire des courses au supermarché et exprimer ses goûts'
      ],
      content: 'Die Nahrung (la nourriture) : das Brot (le pain), der Käse (le fromage), das Ei (l’œuf), das Fleisch (la viande), das Gemüse (les légumes), das Obst (les fruits), der Apfel (la pomme), der Reis (le riz). Boissons : das Wasser (l’eau), der Kaffee (le café), der Tee (le thé), der Saft (le jus), die Milch (le lait).\n\nAu restaurant : « Ich möchte einen Kaffee, bitte » (je voudrais un café, s’il vous plaît), « Die Rechnung, bitte » (l’addition, s’il vous plaît). Pour exprimer ses goûts : « Ich mag Kaffee » (j’aime le café), « Ich mag kein Fleisch » (je n’aime pas la viande), « Das schmeckt gut » (c’est bon).\n\nAu supermarché (der Supermarkt) : les aliments ont des articles — der Käse, das Brot, die Milch. On achète : « ein Kilo Äpfel, bitte » (un kilo de pommes, s’il vous plaît). Prix : « Was kostet das? » (combien ça coûte ?).',
      vocabulary: [
        { term: 'essen', meaning: 'manger' },
        { term: 'trinken', meaning: 'boire' },
        { term: 'das Brot', meaning: 'le pain' },
        { term: 'der Käse', meaning: 'le fromage' },
        { term: 'das Ei', meaning: 'l’œuf' },
        { term: 'das Fleisch', meaning: 'la viande' },
        { term: 'das Gemüse', meaning: 'les légumes' },
        { term: 'das Obst', meaning: 'les fruits' },
        { term: 'der Apfel', meaning: 'la pomme' },
        { term: 'der Reis', meaning: 'le riz' },
        { term: 'das Wasser', meaning: 'l’eau' },
        { term: 'der Kaffee', meaning: 'le café' },
        { term: 'der Tee', meaning: 'le thé' },
        { term: 'die Milch', meaning: 'le lait' },
        { term: 'die Rechnung', meaning: 'l’addition' },
        { term: 'möchten', meaning: 'voudrais' },
        { term: 'schmecken', meaning: 'avoir du goût' },
        { term: 'kosten', meaning: 'coûter' }
      ],
      grammar: [
        '« Ich möchte » (je voudrais) est la formule polie : Ich möchte einen Kaffee, bitte.',
        'Accusatif : der → den (Ich möchte den Kaffee) ; ein → einen (einen Kaffee).',
        'Négation de goût : Ich mag kein Fleisch (je n’aime pas la viande).'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« Ich möchte einen Kaffee » signifie…', options: ['Je veux du café maintenant', 'Je voudrais un café, s’il vous plaît', 'J’ai un café', 'Le café est bon'], answer: 'Je voudrais un café, s’il vous plaît' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez : « Ich ___ zwei Äpfel » (voudrais) ; « Die Rechnung, bitte » = l’___.', answer: 'möchte ; addition' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Je n’aime pas la viande » et « combien ça coûte ? ».', answer: 'Ich mag kein Fleisch. — Was kostet das?' }
      ],
      audioScript: {
        context: 'Patricia commande au restaurant à Berlin.',
        lines: [
          { speaker: 'Patricia', text: 'Guten Tag! Ich möchte einen Tee und ein Brot mit Käse, bitte.' },
          { speaker: 'Kellner', text: 'Sehr gerne. Möchten Sie auch ein Ei dazu?' },
          { speaker: 'Patricia', text: 'Nein, danke. Und ein Glas Wasser, bitte.' },
          { speaker: 'Kellner', text: 'Alles klar. Was kosten Sie zusammen?' },
          { speaker: 'Patricia', text: 'Das kostet zusammen acht Euro.' },
          { speaker: 'Patricia', text: 'Gut, danke! Die Rechnung, bitte.' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L07', order: 7,
      title: 'Housing & Directions',
      titleNative: 'Wohnen & Wegbeschreibung',
      objective: 'Décrire son logement, nommer les pièces, et demander et donner son chemin en ville (droite, gauche, tout droit).',
      objectives: [
        'Décrire son logement et nommer les pièces',
        'Demander son chemin et le comprendre',
        'Utiliser les prépositions de lieu et les directions'
      ],
      content: 'Das Wohnen (le logement) : das Haus (la maison), die Wohnung (l’appartement), das Zimmer (la pièce), das Wohnzimmer (le salon), das Schlafzimmer (la chambre), die Küche (la cuisine), das Badezimmer (la salle de bain), die Tür (la porte), das Fenster (la fenêtre).\n\nPour décrire : « Ich wohne in einem Haus » (j’habite dans une maison), « Meine Wohnung hat drei Zimmer » (mon appartement a trois pièces), « Das Wohnzimmer ist groß » (le salon est grand).\n\nDemander son chemin : « Entschuldigung, wo ist der Bahnhof? » (excusez-moi, où est la gare ?). Réponses : « Gehen Sie geradeaus » (allez tout droit), « Biegen Sie links ab » (tournez à gauche), « Biegen Sie rechts ab » (tournez à droite), « Es ist neben dem Supermarkt » (c’est à côté du supermarché).\n\nDirections : links (à gauche), rechts (à droite), geradeaus (tout droit), neben (à côté de), gegenüber (en face), in der Nähe (près).',
      vocabulary: [
        { term: 'das Haus', meaning: 'la maison' },
        { term: 'die Wohnung', meaning: 'l’appartement' },
        { term: 'das Zimmer', meaning: 'la pièce' },
        { term: 'das Wohnzimmer', meaning: 'le salon' },
        { term: 'das Schlafzimmer', meaning: 'la chambre' },
        { term: 'die Küche', meaning: 'la cuisine' },
        { term: 'das Badezimmer', meaning: 'la salle de bain' },
        { term: 'die Tür', meaning: 'la porte' },
        { term: 'das Fenster', meaning: 'la fenêtre' },
        { term: 'wohnen', meaning: 'habiter' },
        { term: 'geradeaus', meaning: 'tout droit' },
        { term: 'links', meaning: 'à gauche' },
        { term: 'rechts', meaning: 'à droite' },
        { term: 'neben', meaning: 'à côté de' },
        { term: 'gegenüber', meaning: 'en face' },
        { term: 'der Bahnhof', meaning: 'la gare' },
        { term: 'Entschuldigung', meaning: 'excusez-moi / pardon' }
      ],
      grammar: [
        'Prépositions de lieu avec le datif/accusatif : neben dem (datif) Supermarkt ; in die (accusatif) Küche.',
        'Abfahren/tourner : Biegen Sie links/rechts ab (verbe séparable abbiegen).',
        '« Wo ist …? » pour situer : Wo ist der Bahnhof?'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« links » signifie…', options: ['à droite', 'à gauche', 'tout droit', 'en face'], answer: 'à gauche' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez : « Gehen Sie ___ » (tout droit) ; « Biegen Sie ___ ab » (à droite).', answer: 'geradeaus ; rechts' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Où est la gare ? » et « C’est en face du supermarché ».', answer: 'Wo ist der Bahnhof? — Es ist gegenüber dem Supermarkt.' }
      ],
      audioScript: {
        context: 'Fatima demande son chemin dans la rue à Berlin.',
        lines: [
          { speaker: 'Fatima', text: 'Entschuldigung, wo ist der Bahnhof, bitte?' },
          { speaker: 'Passant', text: 'Gehen Sie geradeaus und dann biegen Sie links ab.' },
          { speaker: 'Fatima', text: 'Geradeaus und dann links. Ist es weit?' },
          { speaker: 'Passant', text: 'Nein, ganz in der Nähe, neben dem Supermarkt.' },
          { speaker: 'Fatima', text: 'Vielen Dank! Und das Hotel?' },
          { speaker: 'Passant', text: 'Das Hotel ist gegenüber dem Supermarkt. Viel Glück!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L08', order: 8,
      title: 'Time & Appointments',
      titleNative: 'die Uhrzeit & Termine',
      objective: 'Dire l’heure, les jours et les mois, fixer un rendez-vous et parler de son emploi du temps.',
      objectives: [
        'Dire l’heure : Wie spät ist es? Es ist … Uhr',
        'Nommer les jours, les mois et les parties du jour',
        'Fixer et accepter un rendez-vous'
      ],
      content: 'Pour demander/dire l’heure : « Wie spät ist es? » (quelle heure est-il ?), « Es ist drei Uhr » (il est trois heures), « Es ist halb acht » (il est sept heures et demie), « Es ist Viertel nach vier » (quatre heures et quart), « Es ist Viertel vor fünf » (cinq heures moins le quart).\n\nLes jours (die Tage) : Montag (lundi), Dienstag (mardi), Mittwoch (mercredi), Donnerstag (jeudi), Freitag (vendredi), Samstag (samedi), Sonntag (dimanche). Les mois (die Monate) : Januar, Februar, März, April, Mai, Juni, Juli, August, September, Oktober, November, Dezember.\n\nFixer un rendez-vous (der Termin) : « Haben Sie am Montag Zeit? » (avez-vous du temps lundi ?), « Ich habe um zehn Uhr einen Termin » (j’ai rendez-vous à dix heures), « Passt Ihnen neun Uhr? » (neuf heures vous convient ?), « Ja, das passt » (oui, ça va).\n\nEmploi du temps : am Montag (lundi), um drei Uhr (à trois heures), von neun bis zehn (de neuf à dix).',
      vocabulary: [
        { term: 'die Uhrzeit', meaning: 'l’heure' },
        { term: 'Wie spät ist es?', meaning: 'Quelle heure est-il ?' },
        { term: 'Es ist drei Uhr', meaning: 'Il est trois heures' },
        { term: 'halb acht', meaning: 'sept heures et demie' },
        { term: 'der Montag', meaning: 'lundi' },
        { term: 'der Dienstag', meaning: 'mardi' },
        { term: 'der Mittwoch', meaning: 'mercredi' },
        { term: 'der Donnerstag', meaning: 'jeudi' },
        { term: 'der Freitag', meaning: 'vendredi' },
        { term: 'der Samstag', meaning: 'samedi' },
        { term: 'der Sonntag', meaning: 'dimanche' },
        { term: 'der Monat', meaning: 'le mois' },
        { term: 'der Termin', meaning: 'le rendez-vous' },
        { term: 'passt', meaning: 'convient' },
        { term: 'die Woche', meaning: 'la semaine' },
        { term: 'um drei Uhr', meaning: 'à trois heures' },
        { term: 'von … bis …', meaning: 'de … à …' }
      ],
      grammar: [
        'Heure : « Es ist X Uhr » (X heures), « halb + heure suivante » = demie (halb acht = 7h30).',
        'Prépositions de temps : am + jour (am Montag), um + heure (um drei Uhr).',
        'Question : Passt Ihnen …? réponse : Ja, das passt / Nein, leider nicht.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez l’heure correcte.', question: '« halb acht » correspond à…', options: ['8h00', '7h30', '6h30', '8h30'], answer: '7h30' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez : « ___ Montag » (lundi), « ___ drei Uhr » (à trois heures).', answer: 'am ; um' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Quelle heure est-il ? » et « j’ai rendez-vous à dix heures ».', answer: 'Wie spät ist es? — Ich habe um zehn Uhr einen Termin.' }
      ],
      audioScript: {
        context: 'Leila prend rendez-vous avec un dentiste.',
        lines: [
          { speaker: 'Leila', text: 'Guten Tag! Ich möchte gern einen Termin.' },
          { speaker: 'Arzthelferin', text: 'Gerne. Hätten Sie am Dienstag um zehn Uhr Zeit?' },
          { speaker: 'Leila', text: 'Hmm, am Dienstag arbeite ich bis zwölf Uhr.' },
          { speaker: 'Arzthelferin', text: 'Passt Ihnen Donnerstag um neun Uhr?' },
          { speaker: 'Leila', text: 'Ja, das passt gut. Um neun Uhr, Donnerstag.' },
          { speaker: 'Arzthelferin', text: 'Perfekt! Ihr Termin ist also Donnerstag um neun Uhr.' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L09', order: 9,
      title: 'Shopping & Money',
      titleNative: 'Einkaufen & bezahlen',
      objective: 'Faire des achats, demander le prix, payer et comprendre la monnaie (l’euro) en allemand.',
      objectives: [
        'Demander un article et son prix',
        'Comprendre et utiliser l’euro et les centimes',
        'Payer et remercier'
      ],
      content: 'Faire les courses (einkaufen) : « Ich möchte ein T-Shirt kaufen » (je voudrais acheter un T-shirt), « Gibt es das in einer anderen Farbe? » (est-ce que ça existe dans une autre couleur ?).\n\nDemander le prix : « Was kostet das? » (combien ça coûte ?), « Das kostet zwanzig Euro » (cela coûte vingt euros). La monnaie : der Euro, der Cent (100 Cent = 1 Euro). « Wie viel kostet das? » revient au même.\n\nPayer : « Zahlen, bitte » (l’addition / je paye, s’il vous plaît), « Ich zahle mit Karte » (je paie par carte), « Ich zahle bar » (je paie en espèces). Le vendeur répond : « Das macht zusammen dreißig Euro » (cela fait trente euros au total).\n\nExemple d’achat : « Guten Tag! Ich möchte gerne eine Jacke. — Welche Größe haben Sie? — Ich habe Größe M. — Das kostet fünfundvierzig Euro. — Ich zahle bar. Danke schön! »',
      vocabulary: [
        { term: 'einkaufen', meaning: 'faire les courses' },
        { term: 'der Preis', meaning: 'le prix' },
        { term: 'kaufen', meaning: 'acheter' },
        { term: 'verkaufen', meaning: 'vendre' },
        { term: 'der Euro', meaning: 'l’euro' },
        { term: 'der Cent', meaning: 'le centime' },
        { term: 'zahlen', meaning: 'payer' },
        { term: 'mit Karte', meaning: 'par carte' },
        { term: 'bar', meaning: 'en espèces' },
        { term: 'das Geld', meaning: 'l’argent' },
        { term: 'kostet', meaning: 'coûte' },
        { term: 'die Größe', meaning: 'la taille' },
        { term: 'das T-Shirt', meaning: 'le T-shirt' },
        { term: 'die Jacke', meaning: 'la veste' },
        { term: 'die Farbe', meaning: 'la couleur' },
        { term: 'zusammen', meaning: 'au total / ensemble' }
      ],
      grammar: [
        'Accusatif : der → den (Ich kaufe den Löffel) ; ein → einen (Ich möchte einen Hut).',
        '« Das macht zusammen … Euro » pour le total.',
        'Interrogation prix : Was kostet das? / Wie viel kostet das?'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« Ich zahle bar » signifie…', options: ['je paie par carte', 'je paie en espèces', 'je ne paie pas', 'l’addition, s’il vous plaît'], answer: 'je paie en espèces' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez : « Was ___ das? » (coûter) ; « Das macht zusammen dreißig ___ » (monnaie).', answer: 'kostet ; Euro' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Combien ça coûte ? » et « je paie par carte ».', answer: 'Was kostet das? — Ich zahle mit Karte.' }
      ],
      audioScript: {
        context: 'Marco achète une veste dans un magasin à Munich.',
        lines: [
          { speaker: 'Marco', text: 'Guten Tag! Ich möchte gerne eine Jacke, bitte.' },
          { speaker: 'Verkäufer', text: 'Welche Größe und welche Farbe, bitte?' },
          { speaker: 'Marco', text: 'Größe M, in Blau, wenn möglich.' },
          { speaker: 'Verkäufer', text: 'Hier ist die Jacke. Sie kostet fünfundvierzig Euro.' },
          { speaker: 'Marco', text: 'Gut, ich kaufe sie. Ich zahle mit Karte.' },
          { speaker: 'Verkäufer', text: 'Das macht zusammen fünfundvierzig Euro. Danke schön!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    },
{
      id: 'DE_A1_L10', order: 10,
      title: 'Travel & Transport',
      titleNative: 'Reisen & Verkehrsmittel',
      objective: 'Nommer les moyens de transport, acheter un billet à la gare et apprendre les phrases utiles du voyage.',
      objectives: [
        'Nommer les moyens de transport : der Zug, das Flugzeug, der Bus',
        'Acheter un billet à la gare et à l’aéroport',
        'Comprendre les informations de voyage simples'
      ],
      content: 'Les moyens de transport (die Verkehrsmittel) : der Zug (le train), das Flugzeug (l’avion), der Bus (le bus), das Auto (la voiture), das Fahrrad (le vélo), die U-Bahn (le métro), das Taxi (le taxi).\n\nÀ la gare (der Bahnhof) : « Ich möchte eine Fahrkarte nach Hamburg, bitte » (je voudrais un billet pour Hambourg, s’il vous plaît), « Einfach oder hin und zurück? » (aller simple ou aller-retour ?), « Wann fährt der Zug nach München? » (à quelle heure part le train pour Munich ?), « Auf welchem Gleis? » (sur quel quai ?).\n\nÀ l’aéroport (der Flughafen) : der Flug (le vol), die Karte (le billet), der Pass (le passeport), das Gepäck (les bagages), die Passkontrolle (le contrôle des passeports).\n\nPhrases de voyage : « Ich habe eine Reservierung » (j’ai une réservation), « Wann komme ich an? » (à quelle heure est-ce que j’arrive ?), « Bitte öffnen Sie die Tür » (ouvrez la porte, s’il vous plaît).',
      vocabulary: [
        { term: 'reisen', meaning: 'voyager' },
        { term: 'der Zug', meaning: 'le train' },
        { term: 'das Flugzeug', meaning: 'l’avion' },
        { term: 'der Bus', meaning: 'le bus' },
        { term: 'das Auto', meaning: 'la voiture' },
        { term: 'das Fahrrad', meaning: 'le vélo' },
        { term: 'die U-Bahn', meaning: 'le métro' },
        { term: 'der Bahnhof', meaning: 'la gare' },
        { term: 'der Flughafen', meaning: 'l’aéroport' },
        { term: 'die Fahrkarte', meaning: 'le billet (de train)' },
        { term: 'hin und zurück', meaning: 'aller-retour' },
        { term: 'das Gleis', meaning: 'le quai' },
        { term: 'der Pass', meaning: 'le passeport' },
        { term: 'das Gepäck', meaning: 'les bagages' },
        { term: 'die Reservierung', meaning: 'la réservation' },
        { term: 'ankommen', meaning: 'arriver' },
        { term: 'fahren', meaning: 'partir / conduire' }
      ],
      grammar: [
        'Verbe « fahren » : der Zug fährt um neun Uhr ab (partir). Le préfixe séparable « ab » va à la fin.',
        '« mit » + moyen de transport : mit dem Zug (en train), mit dem Bus (en bus).',
        'Questions pratiques : Wann fährt …? Auf welchem Gleis?'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« der Zug » signifie…', options: ['l’avion', 'le train', 'le bus', 'le vélo'], answer: 'le train' },
        { type: 'complete', instruction: 'Complétez.', question: 'Complétez : « Ich möchte eine ___ nach Hamburg » (billet) ; « Ich reise ___ dem Zug » (en train).', answer: 'Fahrkarte ; mit' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Quand part le train pour Munich ? » et « sur quel quai ? ».', answer: 'Wann fährt der Zug nach München? — Auf welchem Gleis?' }
      ],
      audioScript: {
        context: 'Adama achète un billet à la gare de Berlin.',
        lines: [
          { speaker: 'Adama', text: 'Guten Tag! Ich möchte eine Fahrkarte nach Hamburg, bitte.' },
          { speaker: 'Schalter', text: 'Einfach oder hin und zurück?' },
          { speaker: 'Adama', text: 'Hin und zurück, bitte. Wann fährt der nächste Zug?' },
          { speaker: 'Schalter', text: 'Er fährt um vierzehn Uhr auf Gleis sechs.' },
          { speaker: 'Adama', text: 'Und wann komme ich in Hamburg an?' },
          { speaker: 'Schalter', text: 'Sie kommen um siebzehn Uhr am Hauptbahnhof an.' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'DE', isTrial: false
    }
],
  quizzes: [
    {
      id: 'DE_A1_Q1',
      title: 'Greetings & Alphabet — Quiz',
      level: 'A1',
      lessons: ['DE_A1_L01', 'DE_A1_L02'],
      questions: [
        { type: 'mcq', text: 'How do you say “good morning” in German?', options: ['Guten Abend', 'Guten Morgen', 'Gute Nacht', 'Auf Wiedersehen'], correctIndex: 1 },
        { type: 'mcq', text: '« Wie geht es Ihnen? » signifie…', options: ['D’où venez-vous ?', 'Comment vous appelez-vous ?', 'Comment allez-vous ? (formel)', 'Au revoir'], correctIndex: 2 },
        { type: 'mcq', text: 'Quelle est la salutation informelle entre amis ?', options: ['Hallo', 'Guten Tag', 'Auf Wiedersehen', 'Guten Abend'], correctIndex: 0 },
        { type: 'mcq', text: '« Mir geht es gut » signifie…', options: ['Je suis allemand', 'Je vais bien', 'Je suis fatigué', 'À plus tard'], correctIndex: 1 },
        { type: 'mcq', text: 'Comment dit-on « au revoir » de façon formelle ?', options: ['Tschüss', 'Hallo', 'Auf Wiedersehen', 'Bitte'], correctIndex: 2 },
        { type: 'tf', text: '« Guten Morgen » se dit le matin.', correct: true },
        { type: 'tf', text: 'On dit « Tschüss » de façon très formelle à un inconnu.', correct: false },
        { type: 'mcq', text: 'Comment se prononce le « w » allemand ?', options: ['« v »', '« w »', '« f »', '« b »'], correctIndex: 0 },
        { type: 'mcq', text: 'Le « ß » est un…', options: ['tréma', 's dur (Eszett)', 'i grec', 'diphtongue'], correctIndex: 1 },
        { type: 'mcq', text: 'Dans « heißen », le son « ei » se prononce…', options: ['i', 'aïe', 'oï', 'ai'], correctIndex: 1 },
        { type: 'tf', text: 'Le son « ü » se prononce les lèvres arrondies.', correct: true },
        { type: 'mcq', text: 'Quel mot contient le « ß » ?', options: ['Wasser', 'Straße', 'Zeit', 'Vater'], correctIndex: 1 },
        { type: 'mcq', text: '« Ich heiße Anna » signifie…', options: ['J’habite à Anna', 'Je m’appelle Anna', 'J’aime Anna', 'Je viens d’Anna'], correctIndex: 1 },
        { type: 'mcq', text: 'Comment demander « D’où viens-tu ? » (informel) ?', options: ['Wie alt bist du?', 'Woher kommst du?', 'Wie heißt du?', 'Was machst du?'], correctIndex: 1 },
        { type: 'tf', text: '« Wie alt bist du? » demande l’âge.', correct: true },
        { type: 'mcq', text: 'Dans « Ich heiße Chidi », le verbe est…', options: ['en 1re position', 'en 2e position', 'en 3e position', 'à la fin'], correctIndex: 1 },
        { type: 'mcq', text: 'Le « Sie » de politesse s’emploie…', options: ['entre amis', 'avec les étrangers et au travail', 'avec les enfants', 'jamais'], correctIndex: 1 },
        { type: 'mcq', text: '« Danke » signifie…', options: ['S’il vous plaît', 'Merci', 'Pardon', 'Bonjour'], correctIndex: 1 },
        { type: 'tf', text: '« Auf Wiedersehen » est une salutation informelle.', correct: false },
        { type: 'mcq', text: 'Épelez « München » : la 2e lettre est…', options: ['M', 'U', 'N', 'C'], correctIndex: 1 }
      ]
    }
,
    {
      id: 'DE_A1_Q2',
      title: 'Numbers & Family — Quiz',
      level: 'A1',
      lessons: ['DE_A1_L03', 'DE_A1_L04'],
      questions: [
        { type: 'mcq', text: 'Comment écrit-on 21 en allemand ?', options: ['zwanzigeins', 'einundzwanzig', 'zwanzigundein', 'einszwanzig'], correctIndex: 1 },
        { type: 'mcq', text: '« fünfzehn » est le nombre…', options: ['5', '15', '50', '25'], correctIndex: 1 },
        { type: 'mcq', text: 'Le nombre « achtzig » est…', options: ['18', '80', '8', '88'], correctIndex: 1 },
        { type: 'mcq', text: '« hundert » signifie…', options: ['dix', 'cent', 'mille', 'un'], correctIndex: 1 },
        { type: 'tf', text: '« dreiundzwanzig » = 23.', correct: true },
        { type: 'tf', text: 'En allemand, 56 s’écrit « sechsundfünfzig ».', correct: true },
        { type: 'tf', text: '« sechzig » = 16.', correct: false },
        { type: 'mcq', text: 'Pour demander l’âge : « Wie alt ___ du? »', options: ['sind', 'bist', 'ist', 'seid'], correctIndex: 1 },
        { type: 'mcq', text: '« Ich bin dreißig Jahre alt » signifie…', options: ['j’ai 3 ans', 'j’ai 30 ans', 'j’ai 13 ans', 'j’ai 60 ans'], correctIndex: 1 },
        { type: 'mcq', text: 'Le 0 se dit…', options: ['null', 'zero', 'eins', 'nix'], correctIndex: 0 },
        { type: 'mcq', text: 'L’article correct pour « Bruder » est…', options: ['der', 'die', 'das', 'ein'], correctIndex: 0 },
        { type: 'mcq', text: '« das Kind » signifie…', options: ['l’homme', 'la femme', 'l’enfant', 'la maison'], correctIndex: 2 },
        { type: 'mcq', text: '« die Mutter » signifie…', options: ['le père', 'la mère', 'la sœur', 'la tante'], correctIndex: 1 },
        { type: 'mcq', text: 'Les parents se disent…', options: ['die Geschwister', 'die Eltern', 'die Großeltern', 'die Tanten'], correctIndex: 1 },
        { type: 'tf', text: '« die Schwester » = la sœur.', correct: true },
        { type: 'tf', text: '« mein Bruder » = ma sœur.', correct: false },
        { type: 'mcq', text: '« groß » signifie…', options: ['petit', 'grand', 'jeune', 'gentil'], correctIndex: 1 },
        { type: 'mcq', text: '« Ich habe zwei Schwestern » =…', options: ['j’ai deux frères', 'j’ai deux sœurs', 'j’ai deux enfants', 'j’ai deux parents'], correctIndex: 1 },
        { type: 'mcq', text: 'L’adjectif « jung » signifie…', options: ['vieux', 'jeune', 'grand', 'content'], correctIndex: 1 },
        { type: 'mcq', text: '« die Großeltern » sont…', options: ['les cousins', 'les grands-parents', 'les beaux-parents', 'les voisins'], correctIndex: 1 }
      ]
    },
    {
      id: 'DE_A1_Q3',
      title: 'Daily Life & Food — Quiz',
      level: 'A1',
      lessons: ['DE_A1_L05', 'DE_A1_L06'],
      questions: [
        { type: 'mcq', text: '« aufstehen » signifie…', options: ['dormir', 'se lever', 'manger', 'travailler'], correctIndex: 1 },
        { type: 'mcq', text: '« Ich stehe um sieben Uhr auf » =…', options: ['je dors à 7h', 'je me lève à 7h', 'je mange à 7h', 'je travaille à 7h'], correctIndex: 1 },
        { type: 'mcq', text: '« frühstücken » signifie…', options: ['dîner', 'prendre le petit-déjeuner', 'déjeuner', 'goûter'], correctIndex: 1 },
        { type: 'tf', text: '« immer » = toujours.', correct: true },
        { type: 'tf', text: '« nie » = souvent.', correct: false },
        { type: 'mcq', text: 'Le réfléchi de « ich » est…', options: ['dich', 'mich', 'sich', 'uns'], correctIndex: 1 },
        { type: 'mcq', text: '« am Abend » signifie…', options: ['le matin', 'le soir', 'la nuit', 'à midi'], correctIndex: 1 },
        { type: 'mcq', text: '« schlafen » signifie…', options: ['se laver', 'dormir', 'manger', 'boire'], correctIndex: 1 },
        { type: 'mcq', text: '« Ich möchte einen Kaffee, bitte » =…', options: ['je veux du café maintenant', 'je voudrais un café, s’il vous plaît', 'j’ai un café', 'le café est bon'], correctIndex: 1 },
        { type: 'mcq', text: '« Danke schön » signifie…', options: ['s’il vous plaît', 'merci beaucoup', 'pardon', 'bon appétit'], correctIndex: 1 },
        { type: 'mcq', text: '« links » signifie…', options: ['à droite', 'à gauche', 'tout droit', 'en arrière'], correctIndex: 1 },
        { type: 'mcq', text: '« das Brot » est…', options: ['le fromage', 'le pain', 'l’œuf', 'le lait'], correctIndex: 1 },
        { type: 'mcq', text: '« die Milch » est…', options: ['le lait', 'le sucre', 'l’eau', 'le café'], correctIndex: 0 },
        { type: 'tf', text: '« das Gemüse » = les légumes.', correct: true },
        { type: 'tf', text: '« der Reis » = la viande.', correct: false },
        { type: 'mcq', text: '« Entschuldigung » sert à…', options: ['remercier', 's’excuser / demander pardon', 'saluer', 'commander'], correctIndex: 1 },
        { type: 'mcq', text: '« geradeaus » signifie…', options: ['tourner à gauche', 'tourner à droite', 'tout droit', 's’arrêter'], correctIndex: 2 },
        { type: 'mcq', text: '« was kostet das? » =…', options: ['qu’est-ce que c’est ?', 'combien ça coûte ?', 'où est-ce ?', 'qui est là ?'], correctIndex: 1 },
        { type: 'mcq', text: '« die Rechnung, bitte » =…', options: ['l’addition, s’il vous plaît', 'le menu, s’il vous plaît', 'la table, s’il vous plaît', 'le prix, s’il vous plaît'], correctIndex: 0 },
        { type: 'mcq', text: '« Ich mag kein Fleisch » =…', options: ['j’aime la viande', 'je n’aime pas la viande', 'je mange la viande', 'la viande est chère'], correctIndex: 1 }
      ]
    }
,
    {
      id: 'DE_A1_Q4',
      title: 'Housing & Time — Quiz',
      level: 'A1',
      lessons: ['DE_A1_L07', 'DE_A1_L08'],
      questions: [
        { type: 'mcq', text: '« die Wohnung » signifie…', options: ['la maison', 'l’appartement', 'la chambre', 'la cuisine'], correctIndex: 1 },
        { type: 'mcq', text: '« das Schlafzimmer » est…', options: ['le salon', 'la chambre', 'la salle de bain', 'la cuisine'], correctIndex: 1 },
        { type: 'mcq', text: '« die Küche » est…', options: ['la cuisine', 'le salon', 'la fenêtre', 'la porte'], correctIndex: 0 },
        { type: 'tf', text: '« das Fenster » = la fenêtre.', correct: true },
        { type: 'tf', text: '« neben » signifie « en face de ».', correct: false },
        { type: 'mcq', text: '« Biegen Sie rechts ab » =…', options: ['tournez à gauche', 'tournez à droite', 'allez tout droit', 'arrêtez-vous'], correctIndex: 1 },
        { type: 'mcq', text: '« geradeaus » =…', options: ['à gauche', 'à droite', 'tout droit', 'derrière'], correctIndex: 2 },
        { type: 'mcq', text: '« der Bahnhof » est…', options: ['l’aéroport', 'la gare', 'la station de bus', 'le magasin'], correctIndex: 1 },
        { type: 'mcq', text: '« Es ist drei Uhr » =…', options: ['il est trois heures', 'il est trois jours', 'il est 3h30', 'il est 13h'], correctIndex: 0 },
        { type: 'tf', text: '« halb acht » = 8h30.', correct: false },
        { type: 'mcq', text: '« Es ist halb acht » =…', options: ['8h00', '7h30', '8h30', '6h30'], correctIndex: 1 },
        { type: 'mcq', text: '« der Montag » est…', options: ['mardi', 'lundi', 'mercredi', 'dimanche'], correctIndex: 1 },
        { type: 'mcq', text: '« der Sonntag » est…', options: ['samedi', 'dimanche', 'jeudi', 'lundi'], correctIndex: 1 },
        { type: 'tf', text: '« um drei Uhr » = à trois heures.', correct: true },
        { type: 'mcq', text: '« der Termin » signifie…', options: ['le travail', 'le rendez-vous', 'le terme', 'la terrasse'], correctIndex: 1 },
        { type: 'mcq', text: '« Wie spät ist es? » =…', options: ['Quel jour sommes-nous ?', 'Quelle heure est-il ?', 'Quel âge as-tu ?', 'Combien ça coûte ?'], correctIndex: 1 },
        { type: 'mcq', text: '« Passt Ihnen neun Uhr? » =…', options: ['Neuf heures vous convient ?', 'Vous habitez à neuf ?', 'Neuf personnes viennent ?', 'Vous avez neuf euros ?'], correctIndex: 0 },
        { type: 'tf', text: '« am Montag » = lundi.', correct: true },
        { type: 'mcq', text: '« von neun bis zehn » =…', options: ['à neuf heures', 'de neuf à dix', 'à dix heures', 'neuf et dix'], correctIndex: 1 },
        { type: 'mcq', text: 'Le mois de septembre se dit…', options: ['September', 'Oktober', 'November', 'Dezember'], correctIndex: 0 }
      ]
    },
    {
      id: 'DE_A1_Q5',
      title: 'Shopping & Travel — Quiz',
      level: 'A1',
      lessons: ['DE_A1_L09', 'DE_A1_L10'],
      questions: [
        { type: 'mcq', text: '« Was kostet das? » =…', options: ['Qu’est-ce que c’est ?', 'Combien ça coûte ?', 'Où est-ce ?', 'Qui est là ?'], correctIndex: 1 },
        { type: 'mcq', text: '« der Euro » est…', options: ['le centime', 'l’euro', 'le dollar', 'la livre'], correctIndex: 1 },
        { type: 'mcq', text: '« zahlen » signifie…', options: ['acheter', 'payer', 'vendre', 'compter'], correctIndex: 1 },
        { type: 'tf', text: '« mit Karte » = par carte.', correct: true },
        { type: 'tf', text: '« bar » signifie « par carte ».', correct: false },
        { type: 'mcq', text: '« Ich zahle bar » =…', options: ['je paie par carte', 'je paie en espèces', 'je ne paie pas', 'l’addition, s’il vous plaît'], correctIndex: 1 },
        { type: 'mcq', text: '« die Jacke » est…', options: ['le T-shirt', 'la veste', 'la chaussure', 'le pantalon'], correctIndex: 1 },
        { type: 'mcq', text: '« der Zug » est…', options: ['l’avion', 'le train', 'le bus', 'le vélo'], correctIndex: 1 },
        { type: 'mcq', text: '« der Flughafen » est…', options: ['la gare', 'l’aéroport', 'le port', 'le quai'], correctIndex: 1 },
        { type: 'mcq', text: '« die Fahrkarte » est…', options: ['le passeport', 'le billet (de train)', 'les bagages', 'la réservation'], correctIndex: 1 },
        { type: 'tf', text: '« hin und zurück » = aller-retour.', correct: true },
        { type: 'tf', text: '« das Gleis » = l’aéroport.', correct: false },
        { type: 'mcq', text: '« mit dem Zug » =…', options: ['en avion', 'en train', 'en bus', 'à pied'], correctIndex: 1 },
        { type: 'mcq', text: '« Wann fährt der Zug? » =…', options: ['Où va le train ?', 'Quand part le train ?', 'Le train est cher ?', 'Qui conduit ?'], correctIndex: 1 },
        { type: 'mcq', text: '« der Pass » est…', options: ['le passeport', 'le billet', 'le quai', 'la porte'], correctIndex: 0 },
        { type: 'mcq', text: '« das Gepäck » est…', options: ['le contrôle', 'les bagages', 'le billet', 'l’adresse'], correctIndex: 1 },
        { type: 'mcq', text: '« Ich habe eine Reservierung » =…', options: ['j’ai perdu mon billet', 'j’ai une réservation', 'je cherche un hôtel', 'je suis en retard'], correctIndex: 1 },
        { type: 'tf', text: '« die U-Bahn » = le métro.', correct: true },
        { type: 'mcq', text: '« Wann komme ich an? » =…', options: ['À quelle heure je pars ?', 'À quelle heure j’arrive ?', 'Où est le quai ?', 'Quel est le prix ?'], correctIndex: 1 },
        { type: 'mcq', text: '« die Reservierung » signifie…', options: ['la réservation', 'la réservation confirmée', 'l’annulation', 'le bagage'], correctIndex: 0 }
      ]
    }
  ]
};
const ZH = {
  academyCode: 'ZH',
  academyKey: 'mandarin',
  level: 'HSK1',
  levelId: 'ZH_HSK1',
  certification: 'HSK',
  nativeName: '中文',
  cecrLevel: 'A1',
  course: {
    title: 'Mandarin HSK 1 — Foundations',
    titleNative: '中文 HSK 1 — 基础',
    description: 'Vos premiers pas en mandarin : le pinyin et les quatre tons, les salutations, les nombres, la famille, la nourriture, les directions, le temps, les achats et le voyage. Contenu bilingue (chinois pinyin + français) pour l’examen HSK 1.',
    category: 'All',
    learningOutcomes: [
      'Lire le pinyin et prononcer correctement les quatre tons',
      'Saluer et se présenter en mandarin',
      'Compter et utiliser les nombres et les dates',
      'Se repérer, commander à manger et faire des achats',
      'Poser l’heure, demander son chemin et voyager'
    ],
    order: 2
  },
  lessons: [
    {
      id: 'ZH_A1_L01', order: 1,
      title: 'Pinyin & Four Tones',
      titleNative: '拼音和声调',
      objective: 'Lire le pinyin, prononcer les quatre tons du mandarin et comprendre comment ils changent le sens des mots.',
      objectives: [
        'Identifier les 4 tons et le ton neutre',
        'Lire des syllabes en pinyin',
        'Comprendre que le ton change le sens'
      ],
      content: 'Le pinyin (拼音) est la romanisation du mandarin utilisée pour apprendre la prononciation. Chaque syllabe a une initiale (consonne) et une finale (voyelle). Par exemple « mā » : « m » (initiale) + « a » (finale).\n\nLe mandarin a quatre tons plus un ton neutre : premier ton (¯) haut et plat — mā (maman) ; deuxième ton (´) montant — má (chanvre) ; troisième ton (ˇ) descendant puis montant — mǎ (cheval) ; quatrième ton (ˋ) descendant rapide — mà (gronder). Ton neutre : léger et court — ma (particule de question).\n\nLes tons changent totalement le sens : ils sont aussi importants que les sons. Entraînez-vous : mā, má, mǎ, mà.\n\nTon 3 + ton 3 : « nĭ hǎo » (bonjour) — le premier ton 3 devient ton 2 : « ní hǎo ».',
      vocabulary: [
        { term: '拼音 pīnyīn', meaning: 'la romanisation du chinois' },
        { term: '声调 shēngdiào', meaning: 'le ton' },
        { term: '妈 mā', meaning: 'maman (1er ton)' },
        { term: '马 mǎ', meaning: 'cheval (3e ton)' },
        { term: '你 nǐ', meaning: 'tu / vous (informel)' },
        { term: '好 hǎo', meaning: 'bon / bien' },
        { term: '第一声', meaning: 'premier ton' },
        { term: '词 cí', meaning: 'le mot' },
        { term: '音节 yīnjié', meaning: 'la syllabe' },
        { term: '声母 shēngmǔ', meaning: 'l’initiale' },
        { term: '韵母 yùnmǔ', meaning: 'la finale' },
        { term: '读 dú', meaning: 'lire' },
        { term: '说 shuō', meaning: 'dire / parler' },
        { term: '听 tīng', meaning: 'écouter' },
        { term: '练习 liànxí', meaning: 's’entraîner / exercice' }
      ],
      grammar: [
        'Les 4 tons + le ton neutre : mā (1), má (2), mǎ (3), mà (4), ma (neutre).',
        'Règle du 3e ton : deux tons 3 consécutifs — le premier devient ton 2 (nǐ hǎo → ní hǎo).'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez le ton correct.', question: '« mā » (1er ton) signifie…', options: ['cheval', 'maman', 'chanvre', 'gronder'], answer: 'maman' },
        { type: 'complete', instruction: 'Complétez.', question: '« nǐ hǎo » : quand deux tons 3 se suivent, le premier devient ton ___ (numéro).', answer: '2 (deuxième ton)' },
        { type: 'translate', instruction: 'Traduisez.', question: 'Quel est l’ordre des tons de « mā, má, mǎ, mà » ?', answer: '1er, 2e, 3e, 4e ton' }
      ],
      audioScript: {
        context: 'Un professeur fait répéter les tons à deux élèves.',
        lines: [
          { speaker: 'Lǎoshī', text: 'Gēn wǒ dú: mā, má, mǎ, mà. (Lisez après moi: mā, má, mǎ, mà.)' },
          { speaker: 'Xuéshēng A', text: 'mā, má, mǎ, mà.' },
          { speaker: 'Lǎoshī', text: 'Hěn hǎo! Xiànzài: wō, wó, wǒ, wò. (Très bien! Maintenant: wō...) )' },
          { speaker: 'Xuéshēng B', text: 'wō, wó, wǒ, wò.' },
          { speaker: 'Lǎoshī', text: 'Jìzhù: shēngdiào hěn zhòngyào. (Rappelez-vous : les tons sont très importants.)' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: true
    },

module.exports = { DE };
{
      id: 'ZH_A1_L02', order: 2,
      title: 'Greetings & Introductions',
      titleNative: '问候和介绍',
      objective: 'Saluer, se présenter avec son nom et sa nationalité, demander comment va quelqu’un et prendre congé en mandarin.',
      objectives: [
        'Dire nǐ hǎo, zǎoshang hǎo et zàijiàn',
        'Se présenter : Wǒ jiào …, Wǒ shì … rén',
        'Demander et dire comment on va'
      ],
      content: 'Les salutations (问候 wènhòu) : « nǐ hǎo » (bonjour/salut), « zǎoshang hǎo » (bonjour le matin), « wǎnshang hǎo » (bonsoir). Pour prendre congé : « zàijiàn » (au revoir), « míngtiān jiàn » (à demain).\n\nDemander comment ça va : « Nǐ hǎo ma? », réponses « Wǒ hěn hǎo, xièxie » (je vais très bien, merci), « Hái kěyǐ » (ça va / pas mal). « xièxie » = merci.\n\nSe présenter : « Wǒ jiào Anna » (je m’appelle Anna), « Wǒ shì Fǎguó rén » (je suis français), « Nǐ jiào shénme míngzi? » (comment t’appelles-tu ?).\n\nExemple : A : Nǐ hǎo! Wǒ jiào Lǐ. — B : Nǐ hǎo, Wǒ jiào Hélín. Wǒ shì Yīngguó rén.',
      vocabulary: [
        { term: '你好 nǐ hǎo', meaning: 'bonjour / salut' },
        { term: '早上好 zǎoshang hǎo', meaning: 'bonjour (le matin)' },
        { term: '晚上好 wǎnshang hǎo', meaning: 'bonsoir' },
        { term: '再见 zàijiàn', meaning: 'au revoir' },
        { term: '谢谢 xièxie', meaning: 'merci' },
        { term: '不客气 bú kèqi', meaning: 'de rien' },
        { term: '你好吗？ Nǐ hǎo ma?', meaning: 'Comment vas-tu ?' },
        { term: '很好 hěn hǎo', meaning: 'très bien' },
        { term: '还可以 hái kěyǐ', meaning: 'pas mal / ça va' },
        { term: '我叫 Wǒ jiào', meaning: 'je m’appelle' },
        { term: '名字 míngzi', meaning: 'le nom' },
        { term: '是 shì', meaning: 'être' },
        { term: '人 rén', meaning: 'la personne' },
        { term: '法国人 Fǎguó rén', meaning: 'français(e)' },
        { term: '呢 ne', meaning: 'et (toi) ?' },
        { term: '请 qǐng', meaning: 's’il vous plaît' }
      ],
      grammar: [
        'Salutation : Nǐ hǎo ; question : Nǐ hǎo ma? ; réponse : Wǒ hěn hǎo.',
        'Se présenter : Wǒ jiào + nom ; Wǒ shì + nationalité + rén.',
        '« ne » en fin de question : Nǐ ne? (et toi ?).'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« zàijiàn » signifie…', options: ['bonjour', 'au revoir', 'merci', 'd’accord'], answer: 'au revoir' },
        { type: 'complete', instruction: 'Complétez.', question: '« Wǒ ___ Anna » (je m’appelle) ; « Wǒ ___ Fǎguó rén » (je suis).', answer: 'jiào ; shì' },
        { type: 'translate', instruction: 'Traduisez.', question: '« Comment vas-tu ? » et « je vais très bien, merci ».', answer: 'Nǐ hǎo ma? — Wǒ hěn hǎo, xièxie.' }
      ],
      audioScript: {
        context: 'Au campus, une étudiante salue un élève chinois pour la première fois.',
        lines: [
          { speaker: 'Anna', text: 'Nǐ hǎo! Wǒ jiào Anna. Nǐ jiào shénme míngzi?' },
          { speaker: 'Lǐ', text: 'Nǐ hǎo, Anna! Wǒ jiào Lǐ Ming. Nǐ shì Fǎguó rén ma?' },
          { speaker: 'Anna', text: 'Duì, wǒ shì Fǎguó rén. Nǐ ne?' },
          { speaker: 'Lǐ', text: 'Wǒ shì Zhōngguó rén.' },
          { speaker: 'Anna', text: 'Hěn gāoxìng rènshi nǐ! (Enchantée de te rencontrer!)' },
          { speaker: 'Lǐ', text: 'Wǒ yě hěn gāoxìng. Zàijiàn!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L03', order: 3,
      title: 'Numbers & Dates',
      titleNative: '数字和日期',
      objective: 'Compter de 0 à 100, donner son âge, dire les jours et les dates, et utiliser les nombres dans la vie courante.',
      objectives: [
        'Compter de 1 à 100 en mandarin',
        'Donner son âge et son numéro de téléphone',
        'Dire les jours, les mois et une date'
      ],
      content: 'Les nombres (数字 shùzì) : 0 líng, 1 yī, 2 èr, 3 sān, 4 sì, 5 wǔ, 6 liù, 7 qī, 8 bā, 9 jiǔ, 10 shí, 11 shí yī, 12 shí èr, 20 èr shí, 21 èr shí yī, 100 yì bǎi.\n\nLes dizaines : 20 èr shí, 30 sān shí, 40 sì shí, 50 wǔ shí, 60 liù shí, 70 qī shí, 80 bā shí, 90 jiǔ shí. Ex. 34 = sān shí sì, 56 = wǔ shí liù.\n\nDonner l’âge : « Nǐ duō dà? », « Wǒ èrshí suì » (j’ai vingt ans). « suì » = âge. Numéro de téléphone : « Nǐ de diànhuà hàomǎ shì duōshǎo? »\n\nLes jours (星期 xīngqī) : xīngqī yī (lundi), xīngqī èr (mardi), …, xīngqī tiān (dimanche). « jīntiān » (aujourd’hui), « míngtiān » (demain).',
      vocabulary: [
        { term: '一 yī', meaning: 'un' },
        { term: '二 èr', meaning: 'deux' },
        { term: '三 sān', meaning: 'trois' },
        { term: '四 sì', meaning: 'quatre' },
        { term: '五 wǔ', meaning: 'cinq' },
        { term: '十 shí', meaning: 'dix' },
        { term: '百 bǎi', meaning: 'cent' },
        { term: '岁 suì', meaning: 'ans (âge)' },
        { term: '几 jǐ', meaning: 'combien (petit nombre)' },
        { term: '星期 xīngqī', meaning: 'la semaine' },
        { term: '今天 jīntiān', meaning: 'aujourd’hui' },
        { term: '明天 míngtiān', meaning: 'demain' },
        { term: '号 hào', meaning: 'le jour (du mois)' },
        { term: '月 yuè', meaning: 'le mois' },
        { term: '年 nián', meaning: 'l’année' },
        { term: '电话 diànhuà', meaning: 'le téléphone' },
        { term: '号码 hàomǎ', meaning: 'le numéro' }
      ],
      grammar: [
        'Nombres : unité + shí + unité (34 = sān shí sì).',
        'Âge : Wǒ + nombre + suì.',
        'Jours : xīngqī + nombre ; dimanche : xīngqī tiān.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez le nombre correct.', question: '« sān shí sì » = …', options: ['34', '43', '304', '14'], answer: '34' },
        { type: 'complete', instruction: 'Complétez.', question: '« j’ai vingt ans » = « Wǒ ___ suì » ; dimanche = « xīngqī ___ ».', answer: 'èrshí ; tiān' },
        { type: 'translate', instruction: 'Traduisez.', question: 'Écrivez en chinois : « quinze » et « cent ».', answer: 'shíwǔ ; yì bǎi' }
      ],
      audioScript: {
        context: 'À l’accueil du cours de chinois, un élève donne son âge et son numéro.',
        lines: [
          { speaker: 'Yán', text: 'Nǐ duō dà?' },
          { speaker: 'Marc', text: 'Wǒ èrshí suì. Nǐ ne?' },
          { speaker: 'Yán', text: 'Wǒ shíqī suì. Nǐ de diànhuà hàomǎ shì duōshǎo?' },
          { speaker: 'Marc', text: 'Liù-wǔ-èr-sān-yī.' },
          { speaker: 'Yán', text: 'Hǎo, wǒ zhīdào le.' },
          { speaker: 'Marc', text: 'Xīngqītiān jiàn!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L04', order: 4,
      title: 'Family Members',
      titleNative: '家人',
      objective: 'Nommer les membres de la famille, utiliser les classificateurs et parler de sa famille en mandarin.',
      objectives: [
        'Nommer père, mère, frère, sœur, enfants',
        'Utiliser le classificateur « ge » pour les personnes',
        'Parler de sa famille : Wǒ jiā yǒu … rén'
      ],
      content: 'La famille (家 jiā) : 爸爸 bàba (papa), 妈妈 māma (maman), 哥哥 gēge (grand frère), 弟弟 dìdi (petit frère), 姐姐 jiějie (grande sœur), 妹妹 mèimei (petite sœur), 儿子 érzi (fils), 女儿 nǚ’ér (fille), 爷爷 yéye (grand-père), 奶奶 nǎinai (grand-mère).\n\nPour compter les personnes, on utilise le classificateur 个 gè : « yī gè rén » (une personne), « sān gè rén ». Il se place entre le nombre et le nom : 一个人 yī gè rén.\n\nParler de sa famille : « Wǒ jiā yǒu sì gè rén » (ma famille a quatre personnes), « Wǒ yǒu yī gè gēge » (j’ai un grand frère), « Māma shì lǎoshī » (maman est professeur). Le verbe « yǒu » signifie « avoir ».\n\nAdjectifs de description : 大 dà (grand), 小 xiǎo (petit), 老 lǎo (vieux), 年轻 niánqīng (jeune).',
      vocabulary: [
        { term: '爸爸 bàba', meaning: 'papa' },
        { term: '妈妈 māma', meaning: 'maman' },
        { term: '哥哥 gēge', meaning: 'grand frère' },
        { term: '弟弟 dìdi', meaning: 'petit frère' },
        { term: '姐姐 jiějie', meaning: 'grande sœur' },
        { term: '妹妹 mèimei', meaning: 'petite sœur' },
        { term: '儿子 érzi', meaning: 'le fils' },
        { term: '女儿 nǚ’ér', meaning: 'la fille' },
        { term: '爷爷 yéye', meaning: 'le grand-père' },
        { term: '奶奶 nǎinai', meaning: 'la grand-mère' },
        { term: '家 jiā', meaning: 'la famille / la maison' },
        { term: '有 yǒu', meaning: 'avoir / il y a' },
        { term: '个 gè', meaning: 'classificateur (individu)' },
        { term: '人 rén', meaning: 'la personne' },
        { term: '大 dà', meaning: 'grand' },
        { term: '小 xiǎo', meaning: 'petit' },
        { term: '老师 lǎoshī', meaning: 'le professeur' }
      ],
      grammar: [
        'Classificateur 个 : 一 + gè + substantif (一个人).',
        '« yǒu » (avoir) : Wǒ jiā yǒu sì gè rén.',
        'Qualificatifs avant le nom : dà, xiǎo, lǎo, niánqīng.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« gēge » signifie…', options: ['petit frère', 'grand frère', 'sœur', 'père'], answer: 'grand frère' },
        { type: 'complete', instruction: 'Complétez.', question: '« ma famille a quatre personnes » = « Wǒ jiā ___ sì ___ rén ».', answer: 'yǒu ; gè' },
        { type: 'translate', instruction: 'Traduisez.', question: '« j’ai un grand frère » et « maman est professeur ».', answer: 'Wǒ yǒu yī gè gēge. — Māma shì lǎoshī.' }
      ],
      audioScript: {
        context: 'Deux amis parlent de leur famille à la bibliothèque.',
        lines: [
          { speaker: 'Alain', text: 'Nǐ jiā yǒu jǐ gè rén?' },
          { speaker: 'Lǐ', text: 'Wǒ jiā yǒu sì gè rén: bàba, māma, gēge hé wǒ.' },
          { speaker: 'Alain', text: 'Nǐ yǒu yī gè gēge? Tā duō dà?' },
          { speaker: 'Lǐ', text: 'Tā èrshíwǔ suì. Nǐ jiā ne?' },
          { speaker: 'Alain', text: 'Wǒ yǒu yī gè mèimei. Tā hěn xiǎo.' },
          { speaker: 'Lǐ', text: 'Hěn hǎo! Nǐ jiā yě hěn hǎo.' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L05', order: 5,
      title: 'Colors & Objects',
      titleNative: '颜色和东西',
      objective: 'Nommer les couleurs et les objets courants, utiliser adjectif + 的 + nom et construire des phrases du type « c’est une pomme rouge ».',
      objectives: [
        'Nommer les couleurs et les objets du quotidien',
        'Employer l’adjectif + 的 + nom',
        'Identifier un objet : zhè shì …'
      ],
      content: 'Les couleurs (颜色 yánsè) : 红色 hóngsè (rouge), 蓝色 lánsè (bleu), 绿色 lǜsè (vert), 黄色 huángsè (jaune), 白色 báisè (blanc), 黑色 hēisè (noir), 咖啡色 kāfēisè (marron).\n\nLes objets (东西 dōngxi) : 书 shū (livre), 手机 shǒujī (portable), 桌子 zhuōzi (table), 椅子 yǐzi (chaise), 苹果 píngguǒ (pomme), 笔 bǐ (stylo), 杯子 bēizi (verre), 车 chē (voiture).\n\nStructure : adjectif + 的 + nom. « hóngsè de píngguǒ » (la pomme rouge), « hēisè de shǒujī » (le téléphone noir).\n\nIdentifier : « Zhè shì shénme? » (c’est quoi ?), « Zhè shì yī gè píngguǒ » (c’est une pomme), « Nà shì wǒ de shū » (c’est mon livre). 我的 wǒ de (mon), 你的 nǐ de (ton).',
      vocabulary: [
        { term: '红色 hóngsè', meaning: 'rouge' },
        { term: '蓝色 lánsè', meaning: 'bleu' },
        { term: '绿色 lǜsè', meaning: 'vert' },
        { term: '黄色 huángsè', meaning: 'jaune' },
        { term: '白色 báisè', meaning: 'blanc' },
        { term: '黑色 hēisè', meaning: 'noir' },
        { term: '东西 dōngxi', meaning: 'la chose / l’objet' },
        { term: '书 shū', meaning: 'le livre' },
        { term: '手机 shǒujī', meaning: 'le téléphone portable' },
        { term: '桌子 zhuōzi', meaning: 'la table' },
        { term: '椅子 yǐzi', meaning: 'la chaise' },
        { term: '苹果 píngguǒ', meaning: 'la pomme' },
        { term: '笔 bǐ', meaning: 'le stylo' },
        { term: '杯子 bēizi', meaning: 'le verre / la tasse' },
        { term: '车 chē', meaning: 'la voiture' },
        { term: '的 de', meaning: 'particule (possession / qualification)' },
        { term: '这个 zhège', meaning: 'ceci' },
        { term: '那个 nàge', meaning: 'cela' }
      ],
      grammar: [
        'Adjectif + 的 + nom : hóngsè de píngguǒ.',
        'Adjectifs courts sans 的 : dà píngguǒ (grosse pomme).',
        'Possessifs : wǒ de, nǐ de, tā de.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« lánsè » signifie…', options: ['rouge', 'bleu', 'vert', 'jaune'], answer: 'bleu' },
        { type: 'complete', instruction: 'Complétez.', question: '« la pomme rouge » = « hóngsè ___ píngguǒ » ; « mon livre » = « ___ de shū ».', answer: 'de ; wǒ' },
        { type: 'translate', instruction: 'Traduisez.', question: '« c’est quoi ? » et « c’est une pomme ».', answer: 'Zhè shì shénme? — Zhè shì yī gè píngguǒ.' }
      ],
      audioScript: {
        context: 'Dans un magasin, des clients regardent des articles colorés.',
        lines: [
          { speaker: 'Kāi', text: 'Zhège shǒujī shì shénme yánsè?' },
          { speaker: 'Nǚshòuyuán', text: 'Tā shì hēisè de. Nàge shì báisè de.' },
          { speaker: 'Kāi', text: 'Wǒ xǐhuan hēisè de shǒujī.' },
          { speaker: 'Nǚshòuyuán', text: 'Hěn hǎo. Zhège píngguǒ ne?' },
          { speaker: 'Kāi', text: 'Tā shì hóngsè de. Hěn piàoliang!' },
          { speaker: 'Nǚshòuyuán', text: 'Dōu hěn hǎo. Nǐ mǎi zhège ma?' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L06', order: 6,
      title: 'Food & Drink',
      titleNative: '吃饭和喝水',
      objective: 'Nommer les plats et boissons courants, commander au restaurant et exprimer ses goûts (je veux / je n’aime pas).',
      objectives: [
        'Nommer riz, viande, légumes, thé, eau',
        'Commander : Wǒ yào …, Qǐng gěi wǒ …',
        'Exprimer ses goûts : Wǒ xǐhuan / Wǒ bù xǐhuan'
      ],
      content: 'La nourriture (食物 shíwù) : 米饭 mǐfàn (riz), 面条 miàntiáo (nouilles), 鸡肉 jīròu (poulet), 牛肉 niúròu (bœuf), 菜 cài (plat / légume), 苹果 píngguǒ (pomme), 面包 miànbāo (pain). Boissons : 水 shuǐ (eau), 茶 chá (thé), 咖啡 kāfēi (café), 牛奶 niúnǎi (lait), 果汁 guǒzhī (jus de fruit).\n\nCommander (点菜 diǎncài) : « Wǒ yào yī wǎn mǐfàn » (je veux un bol de riz), « Qǐng gěi wǒ yī bēi chá » (donnez-moi une tasse de thé, s’il vous plaît), « Zhège duōshǎo qián? » (c’est combien ?). Classificateur pour les bols/tasses : 碗 wǎn (bol), 杯 bēi (tasse).\n\nExprimer ses goûts : « Wǒ xǐhuan chá » (j’aime le thé), « Wǒ bù xǐhuan kāfēi » (je n’aime pas le café), « Hěn hǎo chī » (c’est très bon à manger), « Hěn hǎo hē » (bon à boire).',
      vocabulary: [
        { term: '吃 chī', meaning: 'manger' },
        { term: '喝 hē', meaning: 'boire' },
        { term: '米饭 mǐfàn', meaning: 'le riz cuit' },
        { term: '面条 miàntiáo', meaning: 'les nouilles' },
        { term: '鸡肉 jīròu', meaning: 'le poulet' },
        { term: '牛肉 niúròu', meaning: 'le bœuf' },
        { term: '菜 cài', meaning: 'le plat / le légume' },
        { term: '面包 miànbāo', meaning: 'le pain' },
        { term: '水 shuǐ', meaning: 'l’eau' },
        { term: '茶 chá', meaning: 'le thé' },
        { term: '咖啡 kāfēi', meaning: 'le café' },
        { term: '牛奶 niúnǎi', meaning: 'le lait' },
        { term: '要 yào', meaning: 'vouloir' },
        { term: '给 gěi', meaning: 'donner' },
        { term: '喜欢 xǐhuan', meaning: 'aimer' },
        { term: '钱 qián', meaning: 'l’argent' },
        { term: '多少 duōshǎo', meaning: 'combien' },
        { term: '碗 wǎn / 杯 bēi', meaning: 'le bol / la tasse' }
      ],
      grammar: [
        'Commander : Wǒ yào + classificateur + plat (Wǒ yào yī wǎn mǐfàn).',
        'Politesse : Qǐng gěi wǒ … (veuillez me donner …).',
        'Goût : Wǒ xǐhuan … / Wǒ bù xǐhuan … ; « duōshǎo qián? » = combien pour l’argent ?'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« chá » signifie…', options: ['café', 'thé', 'eau', 'lait'], answer: 'thé' },
        { type: 'complete', instruction: 'Complétez.', question: '« je veux un bol de riz » = « Wǒ ___ yī wǎn mǐfàn » ; « je n’aime pas le café » = « Wǒ ___ xǐhuan kāfēi » (négation).', answer: 'yào ; bù' },
        { type: 'translate', instruction: 'Traduisez.', question: '« je veux une tasse de thé, s’il vous plaît » et « c’est combien ? ».', answer: 'Qǐng gěi wǒ yī bēi chá. — Zhège duōshǎo qián?' }
      ],
      audioScript: {
        context: 'Au restaurant, une cliente commande un repas.',
        lines: [
          { speaker: 'Kèrén', text: 'Qǐng gěi wǒ yī wǎn mǐfàn hé yī bēi chá.' },
          { speaker: 'Fúwùyuán', text: 'Hǎo de. Nǐ yào niúròu ma?' },
          { speaker: 'Kèrén', text: 'Bù, xièxie. Wǒ bù chī niúròu.' },
          { speaker: 'Fúwùyuán', text: 'Míngbái. Zhège duōshǎo qián?' },
          { speaker: 'Kèrén', text: 'Èrshí kuài. (Vingt yuans.)' },
          { speaker: 'Kèrén', text: 'Hǎo, hěn hǎo chī! Xièxie!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L07', order: 7,
      title: 'Places & Directions',
      titleNative: '地方和怎么走',
      objective: 'Nommer les lieux de la ville, demander son chemin et donner des directions simples en mandarin.',
      objectives: [
        'Nommer banque, hôpital, école, gare, supermarché',
        'Demander : … zài nǎr? / zěnme zǒu?',
        'Comprendre les directions : zuǒ, yòu, yīzhí zǒu'
      ],
      content: 'Les lieux (地方 dìfāng) : 学校 xuéxiào (l’école), 医院 yīyuàn (l’hôpital), 银行 yínháng (la banque), 火车站 huǒchēzhàn (la gare), 机场 jīchǎng (l’aéroport), 超市 chāoshì (le supermarché), 饭店 fàndiàn (le restaurant/l’hôtel), 厕所 cèsuǒ (les toilettes).\n\nDemander son chemin : « Xǐdà zài nǎr? » (où est la faculté ?), « Zěnme zǒu? » (comment y aller ?), « Chāoshì zài nǎlǐ? » (où est le supermarché ?).\n\nDirections : 往左走 wǎng zuǒ zǒu (allez à gauche), 往右走 wǎng yòu zǒu (à droite), 一直走 yīzhí zǒu (allez tout droit), 在附近 zài fùjìn (tout près), 对面 duìmiàn (en face).\n\nRéponses types : « Yīzhí zǒu, ránhòu wǎng zuǒ guǎi » (allez tout droit puis tournez à gauche), « Tā zài yínháng pángbiān » (c’est à côté de la banque).',
      vocabulary: [
        { term: '地方 dìfāng', meaning: 'le lieu' },
        { term: '学校 xuéxiào', meaning: 'l’école' },
        { term: '医院 yīyuàn', meaning: 'l’hôpital' },
        { term: '银行 yínháng', meaning: 'la banque' },
        { term: '火车站 huǒchēzhàn', meaning: 'la gare' },
        { term: '机场 jīchǎng', meaning: 'l’aéroport' },
        { term: '超市 chāoshì', meaning: 'le supermarché' },
        { term: '饭店 fàndiàn', meaning: 'le restaurant / l’hôtel' },
        { term: '厕所 cèsuǒ', meaning: 'les toilettes' },
        { term: '在 zài', meaning: 'être à / se trouver' },
        { term: '哪儿 nǎr', meaning: 'où' },
        { term: '怎么 zěnme', meaning: 'comment' },
        { term: '走 zǒu', meaning: 'marcher / aller' },
        { term: '左 zuǒ', meaning: 'gauche' },
        { term: '右 yòu', meaning: 'droite' },
        { term: '一直 yīzhí', meaning: 'tout droit' },
        { term: '旁边 pángbiān', meaning: 'à côté de' },
        { term: '对面 duìmiàn', meaning: 'en face' }
      ],
      grammar: [
        'Localisation : « zài + lieu ». Où est…? « … zài nǎr? »',
        'Directions : wǎng + direction + zǒu (wǎng zuǒ zǒu = allez à gauche).',
        '« zěnme zǒu? » = comment y aller ?'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« zuǒ » signifie…', options: ['droite', 'gauche', 'tout droit', 'en face'], answer: 'gauche' },
        { type: 'complete', instruction: 'Complétez.', question: '« où est la gare ? » = « Huǒchēzhàn ___ nǎr? » ; « allez tout droit » = « ___ zǒu ».', answer: 'zài ; yīzhí' },
        { type: 'translate', instruction: 'Traduisez.', question: '« comment y aller ? » et « c’est en face ».', answer: 'Zěnme zǒu? — Tā zài duìmiàn.' }
      ],
      audioScript: {
        context: 'Un touriste demande son chemin dans une ville chinoise.',
        lines: [
          { speaker: 'Touriste', text: 'Qǐngwèn, huǒchēzhàn zài nǎr?' },
          { speaker: 'Passant', text: 'Yīzhí zǒu, ránhòu wǎng yòu guǎi.' },
          { speaker: 'Touriste', text: 'Yīzhí zǒu, ránhòu yòu guǎi. Hǎo.' },
          { speaker: 'Passant', text: 'Shì de, yínháng pángbiān jiù shì.' },
          { speaker: 'Touriste', text: 'Duìmiàn yǒu chāoshì ma?' },
          { speaker: 'Passant', text: 'Yǒu, chāoshì zài fùjìn. Hěn fāngbiàn!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L08', order: 8,
      title: 'Time & Schedule',
      titleNative: '时间',
      objective: 'Dire l’heure, demander l’heure et parler de son emploi du temps avec des phrases simples du HSK 1.',
      objectives: [
        'Demander et dire l’heure : Jǐ diǎn?',
        'Dire « à quelle heure » : … diǎn',
        'Parler de son emploi du temps du jour'
      ],
      content: 'L’heure (时间 shíjiān) : « Jǐ diǎn le? » (quelle heure est-il ?), réponse « Xiànzài sān diǎn » (il est trois heures). 点 diǎn = heure, 分 fēn = minute, 半 bàn = demie, 刻 kè = quart.\n\nExemples : « qī diǎn » (sept heures), « qī diǎn bàn » (sept heures et demie), « bā diǎn shí fēn » (huit heures dix), « jiǔ diǎn yī kè » (neuf heures et quart).\n\nEmploi du temps : « Wǒ míngtiān záoshang jiǔ diǎn shàngkè » (demain matin à neuf heures j’ai cours), « Nǐ jǐ diǎn chī wǎnfàn? » (à quelle heure dînes-tu ?), « Wǒ wǎnshang qī diǎn chī fàn » (je dîne à sept heures).\n\n« jīntiān » (aujourd’hui), « míngtiān » (demain), « zǎoshang » (le matin), « xiàwǔ » (l’après-midi), « wǎnshang » (le soir).',
      vocabulary: [
        { term: '时间 shíjiān', meaning: 'le temps' },
        { term: '几点了？ Jǐ diǎn le?', meaning: 'Quelle heure est-il ?' },
        { term: '点 diǎn', meaning: 'l’heure (horloge)' },
        { term: '分 fēn', meaning: 'la minute' },
        { term: '半 bàn', meaning: 'la demie' },
        { term: '刻 kè', meaning: 'le quart' },
        { term: '早上 zǎoshang', meaning: 'le matin' },
        { term: '下午 xiàwǔ', meaning: 'l’après-midi' },
        { term: '晚上 wǎnshang', meaning: 'le soir' },
        { term: '现在 xiànzài', meaning: 'maintenant' },
        { term: '上课 shàngkè', meaning: 'avoir cours' },
        { term: '吃饭 chī fàn', meaning: 'manger (un repas)' },
        { term: '起床 qǐchuáng', meaning: 'se lever' },
        { term: '睡觉 shuìjiào', meaning: 'dormir' },
        { term: '今天 jīntiān', meaning: 'aujourd’hui' },
        { term: '明天 míngtiān', meaning: 'demain' },
        { term: '作业 zuòyè', meaning: 'les devoirs' }
      ],
      grammar: [
        'Demande : Jǐ diǎn le? ; réponse : (Xiànzài) + nombre + diǎn.',
        'Heures et demie : diǎn bàn ; heures + minutes : diǎn + nombre + fēn.',
        'Emploi du temps : Wǒ + jǐ diǎn + action (Wǒ qī diǎn qǐchuáng).'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez l’heure.', question: '« qī diǎn bàn » = …', options: ['7h00', '7h30', '8h00', '6h30'], answer: '7h30' },
        { type: 'complete', instruction: 'Complétez.', question: '« quelle heure est-il ? » = « ___ diǎn le? » : complétez.', answer: 'Jǐ' },
        { type: 'translate', instruction: 'Traduisez.', question: '« demain matin à neuf heures j’ai cours » =…', answer: 'Wǒ míngtiān záoshang jiǔ diǎn shàngkè.' }
      ],
      audioScript: {
        context: 'Deux étudiants parlent de leur journée.',
        lines: [
          { speaker: 'Anna', text: 'Xiànzài jǐ diǎn le?' },
          { speaker: 'Lǐ', text: 'Xiànzài qī diǎn bàn.' },
          { speaker: 'Anna', text: 'Wǒ zǎoshang qī diǎn qǐchuáng. Nǐ ne?' },
          { speaker: 'Lǐ', text: 'Wǒ bā diǎn shàngkè. Xiàwǔ wǒ zuò zuòyè.' },
          { speaker: 'Anna', text: 'Wǒ wǎnshang jiǔ diǎn shuìjiào.' },
          { speaker: 'Lǐ', text: 'Hěn hǎo de shíjiān. Míngtiān jiàn!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },
{
      id: 'ZH_A1_L09', order: 9,
      title: 'Shopping & Money',
      titleNative: '买东西',
      objective: 'Demander le prix, négocier et payer en mandarin (le yuan).',
      objectives: [
        'Demander : Zhège duōshǎo qián?',
        'Exprimer : trop cher / pas cher',
        'Payer et remercier'
      ],
      content: 'Acheter (买 mǎi) : « Wǒ yào mǎi yī gè dōngxi » (je veux acheter une chose), « Zhège duōshǎo qián? » (c’est combien ?), « Tài guì le! » (trop cher !), « Piányi » (pas cher).\n\nLa monnaie : 元 kuài (yuan), 角 jiǎo / 毛 máo, 分 fēn. Ex. « shí kuài » (dix yuans), « wǔ kuài qī máo » (5 yuans 70).\n\nPayer : « Wǒ mǎi zhège » (je prends ceci), « Shuākǎ » (par carte), « Fù xiànjīn » (en espèces). Le vendeur : « Yīgòng shíwǔ kuài » (ça fait quinze yuans au total).\n\nEssayer : « Kěyǐ shì yī shì ma? » (puis-je l’essayer ?). Tailles : Dà, Zhōng, Xiǎo (grand, moyen, petit).',
      vocabulary: [
        { term: '买 mǎi', meaning: 'acheter' },
        { term: '卖 mài', meaning: 'vendre' },
        { term: '多少钱？ Duōshǎo qián?', meaning: 'Combien ça coûte ?' },
        { term: '钱 qián', meaning: 'l’argent' },
        { term: '元 kuài', meaning: 'le yuan' },
        { term: '贵 guì', meaning: 'cher' },
        { term: '便宜 piányi', meaning: 'pas cher' },
        { term: '大 dà', meaning: 'grand' },
        { term: '中 zhōng', meaning: 'moyen' },
        { term: '小 xiǎo', meaning: 'petit' },
        { term: '颜色 yánsè', meaning: 'la couleur' },
        { term: '试 shì', meaning: 'essayer' },
        { term: '刷卡 shuākǎ', meaning: 'payer par carte' },
        { term: '现金 xiànjīn', meaning: 'en espèces' },
        { term: '一共 yīgòng', meaning: 'au total' },
        { term: '太 tài', meaning: 'trop' },
        { term: '给 gěi', meaning: 'donner' }
      ],
      grammar: [
        'Prix : Zhège duōshǎo qián? réponse : nombre + kuài.',
        'Appréciation : Tài … le (trop …) ; piányi (pas cher).',
        '« Wǒ yào … » pour ce qu’on désire acheter.'
      ],
      exercises: [
        { type: 'qcm', instruction: 'Choisissez la bonne réponse.', question: '« duōshǎo qián » signifie…', options: ['à quelle heure', 'combien ça coûte', 'où est l’argent', 'quel jour'], answer: 'combien ça coûte' },
        { type: 'complete', instruction: 'Complétez.', question: '« c’est trop cher ! » = « Tài ___ le! » ; « pas cher » = « ___ ».', answer: 'guì ; piányi' },
        { type: 'translate', instruction: 'Traduisez.', question: '« je prends ceci » et « ça fait quinze yuans au total ».', answer: 'Wǒ mǎi zhège. — Yīgòng shíwǔ kuài.' }
      ],
      audioScript: {
        context: 'Une cliente achète un manteau au marché.',
        lines: [
          { speaker: 'Kèrén', text: 'Zhège dàyī duōshǎo qián?' },
          { speaker: 'Shāngrén', text: 'Zhège shì yì bǎi wǔshí kuài.' },
          { speaker: 'Kèrén', text: 'Tài guì le! Kěyǐ piányi yīdiǎn ma?' },
          { speaker: 'Shāngrén', text: 'Hǎo, yì bǎi èrshí kuài, zuìhòu jiàgé.' },
          { speaker: 'Kèrén', text: 'Kěyǐ shuākǎ ma?' },
          { speaker: 'Shāngrén', text: 'Kěyǐ. Xièxie nǐ lái!' }
        ]
      },
      cecrLevel: 'A1', academyCode: 'ZH', isTrial: false
    },