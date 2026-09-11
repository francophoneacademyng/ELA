/* ============================================================
   ELA — ela/data/lead-magnets.data.js
   Source de vérité des 6 lead magnets (une par académie).
   ------------------------------------------------------------
   - Académies : FR, DE, ZH, EN, AR, RU. ES reste MASQUÉ.
   - Le contenu marketing (titre/sous-titre/puces) est fourni
     par langue d'interface ; repli automatique sur l'anglais.
   - La checklist et les phrases sont le contenu réel livré au
     prospect après capture (valeur immédiate, aucun envoi email).
   - Aucune donnée commerciale inventée : pas de témoignage, pas
     de statistique, pas de garantie d'examen, pas de partenariat.
   ============================================================ */

export const LEAD_MAGNET_SLUGS = ['fr', 'de', 'zh', 'en', 'ar', 'ru'];

export const LEAD_MAGNETS = {
  fr: {
    code: 'FR',
    key: 'french',
    slug: 'fr',
    certification: 'CECRL',
    color: '#1D4ED8',
    i18n: {
      en: {
        title: 'French A1–A2 Starter Checklist: Your 30-Day Roadmap to Real Conversations',
        subtitle: 'A practical, CEFR-aligned checklist that shows you exactly what to learn first — and how to keep going for 30 days.',
        bullets: [
          'A day-by-day 30-day plan built around CEFR A1–A2 goals',
          'Clear “can-do” checkpoints for speaking, listening, reading and writing',
          'The core grammar and vocabulary to learn first — no random word lists',
          'Common beginner mistakes and how to avoid them',
          'Simple daily routines that fit around work or school'
        ]
      },
      fr: {
        title: 'Liste de démarrage A1–A2 en français : votre feuille de route de 30 jours vers de vraies conversations',
        subtitle: 'Une liste pratique, alignée sur le CECRL, qui vous montre exactement quoi apprendre en premier — et comment tenir 30 jours.',
        bullets: [
          'Un plan de 30 jours, jour par jour, construit autour des objectifs A1–A2 du CECRL',
          'Des points de contrôle clairs en expression orale, compréhension, lecture et écriture',
          'La grammaire et le vocabulaire essentiels à apprendre en premier',
          'Les erreurs fréquentes des débutants et comment les éviter',
          'Des routines quotidiennes simples, compatibles avec le travail ou les études'
        ]
      },
      de: {
        title: 'Französisch A1–A2 Starter-Checkliste: Deine 30-Tage-Roadmap zu echten Gesprächen',
        subtitle: 'Eine praktische, GER-orientierte Checkliste, die dir genau zeigt, was du zuerst lernen solltest — und wie du 30 Tage dranbleibst.',
        bullets: [
          'Ein Tages-für-Tag-Plan für 30 Tage auf Basis der GER-Ziele A1–A2',
          'Klare „Kann“-Checkpoints für Sprechen, Hören, Lesen und Schreiben',
          'Die wichtigste Grammatik und der wichtigste Wortschatz zuerst',
          'Typische Anfängerfehler und wie du sie vermeidest',
          'Einfache Tagesroutinen, die zu Arbeit oder Studium passen'
        ]
      },
      zh: {
        title: '法语 A1–A2 入门清单：30 天通往真实对话的路线图',
        subtitle: '一份实用、对标 CEFR 的清单，清楚告诉你先学什么——以及如何坚持 30 天。',
        bullets: [
          '以 CEFR A1–A2 目标为核心的 30 天逐日计划',
          '覆盖口语、听力、阅读和写作的清晰“能做到”检查点',
          '优先掌握的核心语法和词汇',
          '初学者常见错误及避免方法',
          '适合工作或学习节奏的简单每日安排'
        ]
      },
      ar: {
        title: 'قائمة البداية في الفرنسية A1–A2: خارطة طريقك خلال 30 يومًا إلى محادثات حقيقية',
        subtitle: 'قائمة عملية متوافقة مع الإطار الأوروبي المرجعي (CECRL) تُظهر لك بالضبط ما يجب تعلّمه أولًا — وكيف تستمر 30 يومًا.',
        bullets: [
          'خطة يومية لمدة 30 يومًا مبنية على أهداف A1–A2',
          'نقاط تحقّق واضحة في التحدث والاستماع والقراءة والكتابة',
          'القواعد والمفردات الأساسية أولًا',
          'أخطاء المبتدئين الشائعة وكيفية تجنّبها',
          'روتين يومي بسيط يناسب العمل أو الدراسة'
        ]
      },
      ru: {
        title: 'Стартовый чек-лист по французскому A1–A2: ваш 30-дневный маршрут к реальным разговорам',
        subtitle: 'Практичный чек-лист по уровням CEFR, который показывает, что учить в первую очередь — и как продержаться 30 дней.',
        bullets: [
          'Пошаговый план на 30 дней на основе целей A1–A2 (CEFR)',
          'Понятные чек-пойнты «умею» для говорения, аудирования, чтения и письма',
          'Ключевая грамматика и лексика в первую очередь',
          'Частые ошибки новичков и как их избежать',
          'Простые ежедневные ритуалы, совместимые с работой или учёбой'
        ]
      }
    },
    inside: [
      'CEFR A1–A2 “can-do” checklist',
      '30-day study roadmap (weekly themes)',
      '10 essential French phrases for daily life',
      'Core grammar sequence (present, articles, questions, past)',
      'Vocabulary themes for real situations (greetings, travel, work)',
      'Pronunciation quick-start (French sounds and liaison basics)',
      'Progress tracker + weekly review prompts'
    ],
    checklist: [
      'Learn the French alphabet and the sounds that differ from English (r, u, nasal vowels an/en/on).',
      'Master greetings and introductions: Bonjour, Bonsoir, Comment vous appelez-vous ?, Enchanté(e).',
      'Learn subject pronouns and the present tense of être (to be) and avoir (to have).',
      'Build your first 100 words with articles: un/une/des, le/la/les.',
      'Learn to form questions: Est-ce que…, Qu’est-ce que…, and simple inversion.',
      'Practise numbers 0–100, days, months and telling the time.',
      'Learn the near future (aller + infinitive) for plans.',
      'Add the passé composé with avoir and common -er verbs.',
      'Practise daily-life dialogues: café, shop, directions, doctor.',
      'Do 10 minutes of listening a day (slow news, beginner podcasts).',
      'Speak out loud for 5 minutes daily; record yourself and compare.',
      'Weekly review: test yourself against the A1 “can-do” list before moving to A2.'
    ],
    phrases: {
      headers: ['French', 'English'],
      rows: [
        ['Bonjour / Bonsoir', 'Hello / Good evening'],
        ['Comment allez-vous ?', 'How are you? (formal)'],
        ['Je m’appelle…', 'My name is…'],
        ['S’il vous plaît', 'Please'],
        ['Merci beaucoup', 'Thank you very much'],
        ['Excusez-moi', 'Excuse me'],
        ['Où sont les toilettes ?', 'Where are the toilets?'],
        ['Combien ça coûte ?', 'How much does it cost?'],
        ['Je ne comprends pas', 'I don’t understand'],
        ['Pouvez-vous répéter, s’il vous plaît ?', 'Can you repeat, please?']
      ]
    },
    faq: [
      ['Do I need any French to start?', 'No. The checklist starts at absolute beginner (A1) and builds toward A2.'],
      ['Will this make me fluent in 30 days?', 'No — no honest resource can promise that. It gives you a structured A1–A2 foundation and a habit you can continue.'],
      ['Is this aligned to an exam?', 'It follows CEFR levels, which DELF/DALF and TCF are built on. It is a study roadmap, not an exam guarantee.']
    ]
  },

  de: {
    code: 'DE',
    key: 'german',
    slug: 'de',
    certification: 'Goethe-Zertifikat',
    color: '#C9A227',
    i18n: {
      en: {
        title: 'Germany Study & Ausbildung Prep Checklist (A1–B1)',
        subtitle: 'Everything you need to organise before you apply — language milestones, documents and deadlines, in one clear checklist.',
        bullets: [
          'A1–B1 language milestones mapped to Goethe-Zertifikat levels',
          'Document and deadline checklist for both study and Ausbildung routes',
          'Key German phrases for appointments, public offices and interviews',
          'Common application mistakes and how to avoid them',
          'A realistic timeline you can start today'
        ]
      },
      fr: {
        title: 'Liste de préparation études et Ausbildung en Allemagne (A1–B1)',
        subtitle: 'Tout ce qu’il faut organiser avant de postuler — étapes linguistiques, documents et délais, dans une seule liste claire.',
        bullets: [
          'Étapes linguistiques A1–B1 alignées sur les niveaux du Goethe-Zertifikat',
          'Liste de documents et de délais pour les parcours études et Ausbildung',
          'Phrases allemandes clés pour les rendez-vous, les administrations et les entretiens',
          'Erreurs de candidature fréquentes et comment les éviter',
          'Un calendrier réaliste que vous pouvez commencer aujourd’hui'
        ]
      },
      de: {
        title: 'Checkliste für Studium und Ausbildung in Deutschland (A1–B1)',
        subtitle: 'Alles, was du vor der Bewerbung organisieren musst — Sprachmeilensteine, Dokumente und Fristen in einer klaren Checkliste.',
        bullets: [
          'Sprachmeilensteine A1–B1 passend zu den Goethe-Zertifikat-Niveaus',
          'Dokumenten- und Fristenliste für Studium und Ausbildung',
          'Wichtige deutsche Phrasen für Termine, Behörden und Interviews',
          'Häufige Bewerbungsfehler und wie du sie vermeidest',
          'Ein realistischer Zeitplan, mit dem du heute starten kannst'
        ]
      },
      zh: {
        title: '德国留学与 Ausbildung（职业培训）准备清单（A1–B1）',
        subtitle: '申请前你需要安排好的一切——语言里程碑、材料和截止日期，一份清晰的清单全搞定。',
        bullets: [
          '对标歌德证书等级的 A1–B1 语言里程碑',
          '留学与职业培训两条路径的材料与截止日期清单',
          '办理预约、政府窗口和面试的常用德语表达',
          '常见申请错误及避免方法',
          '今天就能开始的现实时间表'
        ]
      },
      ar: {
        title: 'قائمة التحضير للدراسة والتدريب المهني (Ausbildung) في ألمانيا (A1–B1)',
        subtitle: 'كل ما تحتاج إلى تنظيمه قبل التقديم — محطات اللغة والمستندات والمواعيد — في قائمة واحدة واضحة.',
        bullets: [
          'محطات لغوية من A1 إلى B1 مرتبطة بمستويات شهادة غوته',
          'قائمة مستندات ومواعيد لمسارَي الدراسة والتدريب المهني',
          'عبارات ألمانية أساسية للمواعيد والدوائر الرسمية والمقابلات',
          'أخطاء شائعة في التقديم وكيفية تجنّبها',
          'جدول زمني واقعي يمكنك البدء به اليوم'
        ]
      },
      ru: {
        title: 'Чек-лист подготовки к учёбе и Ausbildung в Германии (A1–B1)',
        subtitle: 'Всё, что нужно организовать до подачи заявки — языковые этапы, документы и сроки — в одном понятном чек-листе.',
        bullets: [
          'Языковые этапы A1–B1 в соответствии с уровнями Goethe-Zertifikat',
          'Чек-лист документов и сроков для учёбы и Ausbildung',
          'Ключевые немецкие фразы для приёмов, ведомств и собеседований',
          'Частые ошибки при подаче заявки и как их избежать',
          'Реалистичный график, с которого можно начать уже сегодня'
        ]
      }
    },
    inside: [
      'Goethe-Zertifikat A1–B1 milestone checklist',
      'Study vs. Ausbildung route comparison',
      'Document checklist (passport, transcripts, proof of funds, insurance)',
      'Month-by-month application timeline',
      '10 essential German phrases for daily life and offices',
      'Vocabulary for Ausbildung interviews',
      'Progress tracker'
    ],
    checklist: [
      'Confirm your route: university/Studienkolleg vs. Ausbildung.',
      'Learn the alphabet and special sounds (ch, sch, ü, ö, r).',
      'Master A1 grammar: present tense, articles (der/die/das), personal pronouns.',
      'Learn greetings, introductions, numbers, dates and telling time.',
      'Build vocabulary for your field (your study subject or Ausbildung trade).',
      'Learn modal verbs (können, müssen, wollen) for everyday needs.',
      'Practise office/appointment dialogues: Anmeldung, Bürgeramt, bank, doctor.',
      'Collect documents: passport, transcripts, certificates, CV (Lebenslauf).',
      'Check the language requirement for each programme or employer (verify per listing).',
      'Register for a Goethe / telc / TestDaF exam at your target level when ready.',
      'Practise Ausbildung interview German: introduce yourself, strengths, availability.',
      'Weekly review against your A1–B1 “can-do” milestones.'
    ],
    phrases: {
      headers: ['German', 'English'],
      rows: [
        ['Guten Tag', 'Good day'],
        ['Wie geht es Ihnen?', 'How are you? (formal)'],
        ['Ich heiße…', 'My name is…'],
        ['Ich habe einen Termin', 'I have an appointment'],
        ['Wo ist…?', 'Where is…?'],
        ['Wie viel kostet das?', 'How much does this cost?'],
        ['Ich verstehe nicht', 'I don’t understand'],
        ['Sprechen Sie Englisch?', 'Do you speak English?'],
        ['Können Sie das wiederholen?', 'Can you repeat that?'],
        ['Vielen Dank', 'Many thanks']
      ]
    },
    faq: [
      ['Do I need B1 to start an Ausbildung?', 'Requirements vary by employer and programme; many ask for B1 or B2. Always check the specific offer. This checklist helps you build toward B1.'],
      ['Can you guarantee me a place or a visa?', 'No. Admission and visas are decided by institutions and authorities. We prepare your language and organisation, not the decision.'],
      ['Is the Goethe-Zertifikat the only option?', 'No. telc and TestDaF are also widely used. This checklist uses Goethe levels as a common reference.']
    ]
  },

  zh: {
    code: 'ZH',
    key: 'mandarin',
    slug: 'zh',
    certification: 'HSK',
    color: '#C0372F',
    i18n: {
      en: {
        title: 'China Business Mandarin Starter Kit (HSK 1–2 + Supplier Phrases)',
        subtitle: 'Speak enough Mandarin to greet, negotiate and message suppliers — built on HSK 1–2 foundations.',
        bullets: [
          'HSK 1–2 core vocabulary and sentence patterns, organised by use',
          '10 supplier phrases you can use on Alibaba, WeChat and email',
          'Pinyin and tone basics so you are understood',
          'Numbers, prices, MOQ and delivery vocabulary',
          'Simple business etiquette for first contact'
        ]
      },
      fr: {
        title: 'Kit de démarrage en mandarin des affaires pour la Chine (HSK 1–2 + phrases fournisseurs)',
        subtitle: 'Parlez assez de mandarin pour saluer, négocier et échanger avec vos fournisseurs — sur les bases HSK 1–2.',
        bullets: [
          'Vocabulaire et structures HSK 1–2 organisés par usage',
          '10 phrases fournisseurs utilisables sur Alibaba, WeChat et par e-mail',
          'Bases du pinyin et des tons pour être compris',
          'Nombres, prix, MOQ et délais de livraison',
          'Étiquette commerciale simple pour le premier contact'
        ]
      },
      de: {
        title: 'China Business-Mandarin Starter-Kit (HSK 1–2 + Lieferanten-Phrasen)',
        subtitle: 'Sprich genug Mandarin, um Lieferanten zu begrüßen, zu verhandeln und zu schreiben — auf HSK-1–2-Grundlage.',
        bullets: [
          'HSK-1–2-Kernwortschatz und Satzmuster nach Verwendung geordnet',
          '10 Lieferanten-Phrasen für Alibaba, WeChat und E-Mail',
          'Pinyin- und Ton-Grundlagen, damit du verstanden wirst',
          'Zahlen, Preise, MOQ und Lieferzeit-Wortschatz',
          'Einfache Business-Etikette für den ersten Kontakt'
        ]
      },
      zh: {
        title: '中国商务汉语入门套装（HSK 1–2 + 供应商常用语）',
        subtitle: '用 HSK 1–2 的基础，掌握与供应商打招呼、议价和沟通的实用汉语。',
        bullets: [
          '按使用场景整理的 HSK 1–2 核心词汇与句型',
          '10 句可在阿里巴巴、微信和邮件中使用的供应商常用语',
          '拼音与声调基础，让你被听懂',
          '数字、价格、起订量与交期词汇',
          '首次联系用的简单商务礼仪'
        ]
      },
      ar: {
        title: 'حزمة البداية في لغة الماندرين للأعمال مع الصين (HSK 1–2 + عبارات المورّدين)',
        subtitle: 'تحدّث بما يكفي من الماندرين للتحية والتفاوض ومراسلة المورّدين — على أساس مستويي HSK 1–2.',
        bullets: [
          'مفردات وأنماط جمل HSK 1–2 الأساسية منظّمة حسب الاستخدام',
          '10 عبارات للمورّدين على علي بابا ووي تشات والبريد الإلكتروني',
          'أساسيات البينيين والنغمات لتُفهم بوضوح',
          'مفردات الأرقام والأسعار والحد الأدنى للطلب ومدة التسليم',
          'آداب تعامل تجارية بسيطة للتواصل الأول'
        ]
      },
      ru: {
        title: 'Стартовый набор делового китайского (мандарин) для Китая (HSK 1–2 + фразы для поставщиков)',
        subtitle: 'Говорите достаточно по-китайски, чтобы приветствовать поставщиков, вести переговоры и переписку — на базе HSK 1–2.',
        bullets: [
          'Базовая лексика и конструкции HSK 1–2 по применению',
          '10 фраз для поставщиков — для Alibaba, WeChat и e-mail',
          'Основы пиньиня и тонов, чтобы вас понимали',
          'Лексика: числа, цены, MOQ и сроки поставки',
          'Простой деловой этикет для первого контакта'
        ]
      }
    },
    inside: [
      'HSK 1–2 “can-do” checklist',
      'Pinyin + tone quick-start',
      '10 essential supplier phrases (characters, pinyin, English)',
      'Numbers, money and quantity vocabulary',
      'Short, polite WeChat and email templates',
      'Business etiquette notes for first contact',
      'Progress tracker'
    ],
    checklist: [
      'Learn pinyin and the four tones; practise tone pairs daily.',
      'Master basic word order: Subject + Time + Verb + Object.',
      'Learn numbers 0–100, money and measure words (个, 件, 箱).',
      'Build HSK 1 vocabulary by theme (approx. 150 words at HSK 1).',
      'Add HSK 2 vocabulary (approx. 300 words cumulative at HSK 2).',
      'Learn question words: 什么, 谁, 哪里, 多少钱, 为什么.',
      'Practise greetings and self-introduction.',
      'Set up WeChat and learn polite message openers.',
      'Learn supplier vocabulary: 样品 (sample), 报价 (quotation), 订单 (order), 起订量 (MOQ), 交期 (lead time), 质量 (quality).',
      'Practise asking for price and negotiating politely.',
      'Use short email/WeChat templates for enquiries and follow-ups.',
      'Weekly review + role-play one supplier conversation.'
    ],
    phrases: {
      headers: ['Chinese', 'Pinyin', 'English'],
      rows: [
        ['你好', 'nǐ hǎo', 'Hello'],
        ['谢谢', 'xièxie', 'Thank you'],
        ['我叫…', 'wǒ jiào…', 'My name is…'],
        ['多少钱？', 'duōshao qián?', 'How much is it?'],
        ['太贵了', 'tài guì le', 'Too expensive'],
        ['可以便宜一点吗？', 'kěyǐ piányi yìdiǎn ma?', 'Can you make it a little cheaper?'],
        ['我要下单', 'wǒ yào xiàdān', 'I want to place an order'],
        ['最小起订量是多少？', 'zuìxiǎo qǐdìngliàng shì duōshao?', 'What is the minimum order quantity?'],
        ['请发报价单', 'qǐng fā bàojia dān', 'Please send the quotation'],
        ['交期多久？', 'jiāoqī duōjiǔ?', 'How long is the lead time?']
      ]
    },
    faq: [
      ['Do I need to read Chinese characters?', 'You can start with pinyin, but learning key characters helps with WeChat, contracts and signs. This kit introduces both.'],
      ['Is this Mandarin or Cantonese?', 'Mandarin (Putonghua) — the standard used in business across mainland China.'],
      ['Can I negotiate in Mandarin after this kit?', 'You will handle greetings, prices and basic requests. Complex negotiation still needs higher levels and often a local partner.']
    ]
  },

  en: {
    code: 'EN',
    key: 'english',
    slug: 'en',
    certification: 'IELTS',
    color: '#1E3A5F',
    i18n: {
      en: {
        title: 'IELTS 7+ Professional English Checklist',
        subtitle: 'A clear, skill-by-skill checklist to organise your IELTS preparation and aim for Band 7 — without guesswork.',
        bullets: [
          'Band-by-band breakdown of what examiners look for',
          'Skill checklists for Listening, Reading, Writing and Speaking',
          'A weekly study plan you can adapt',
          'Common Band 6 traps and how to fix them',
          'Academic vs. General Training: which one you need'
        ]
      },
      fr: {
        title: 'Liste de contrôle IELTS 7+ : anglais professionnel',
        subtitle: 'Une liste claire, compétence par compétence, pour organiser votre préparation à l’IELTS et viser le Band 7 — sans deviner.',
        bullets: [
          'Détail, bande par bande, de ce que les examinateurs recherchent',
          'Listes par compétence : compréhension orale, écrite, expression écrite et orale',
          'Plan d’étude hebdomadaire adaptable',
          'Pièges fréquents du Band 6 et comment les corriger',
          'Academic ou General Training : lequel choisir'
        ]
      },
      de: {
        title: 'IELTS 7+ Checkliste für professionelles Englisch',
        subtitle: 'Eine klare Checkliste Skill für Skill, um deine IELTS-Vorbereitung zu strukturieren und Band 7 anzustreben — ohne Rätselraten.',
        bullets: [
          'Band-für-Band-Übersicht, worauf Prüfer achten',
          'Skill-Checklisten für Listening, Reading, Writing und Speaking',
          'Anpassbarer Wochenlernplan',
          'Häufige Band-6-Fallen und wie du sie behebst',
          'Academic oder General Training: Was brauchst du?'
        ]
      },
      zh: {
        title: '雅思 7+ 专业英语清单',
        subtitle: '一份按技能划分的清晰清单，帮你系统备考雅思、冲击 7 分——不靠猜。',
        bullets: [
          '逐项拆解考官关注什么（按分数段）',
          '听力、阅读、写作、口语四项技能清单',
          '可灵活调整的每周学习计划',
          '常见的 6 分陷阱及改进方法',
          'A 类还是 G 类：你需要哪一种'
        ]
      },
      ar: {
        title: 'قائمة IELTS 7+ للغة الإنجليزية المهنية',
        subtitle: 'قائمة واضحة، مهارة بمهارة، لتنظيم تحضيرك لـ IELTS والسعي إلى النطاق 7 — دون تخمين.',
        bullets: [
          'شرح تفصيلي حسب النطاق لما يبحث عنه المصحّحون',
          'قوائم لكل مهارة: الاستماع والقراءة والكتابة والتحدث',
          'خطة دراسية أسبوعية قابلة للتعديل',
          'مصائد النطاق 6 الشائعة وكيفية تجاوزها',
          'Academic أم General Training: أيّهما تحتاج'
        ]
      },
      ru: {
        title: 'Чек-лист IELTS 7+ для профессионального английского',
        subtitle: 'Понятный чек-лист по каждому навыку, чтобы системно готовиться к IELTS и целиться в Band 7 — без догадок.',
        bullets: [
          'Разбор по диапазонам: на что смотрят экзаменаторы',
          'Чек-листы по навыкам: аудирование, чтение, письмо, говорение',
          'Адаптируемый недельный план занятий',
          'Частые ловушки Band 6 и как их исправить',
          'Academic или General Training: что нужно вам'
        ]
      }
    },
    inside: [
      'IELTS 7+ “can-do” checklist across four skills',
      'Writing Task 1 & 2 structure checklists',
      'Speaking Part 1–3 preparation prompts',
      'Listening and Reading question-type tactics',
      'Academic vs. General Training decision guide',
      'Band descriptor self-review sheet',
      'Weekly study plan + progress tracker'
    ],
    checklist: [
      'Take a full diagnostic test under timed conditions to find your starting band.',
      'Learn the band descriptors for your target (7) across all four skills.',
      'Listening: practise every question type and transfer answers carefully.',
      'Reading: practise skimming, scanning and timing (60 minutes, 40 questions).',
      'Writing Task 1: learn the structure for graphs/processes/letters (Academic vs General).',
      'Writing Task 2: practise essay structures and paragraph logic.',
      'Speaking: record yourself on Parts 1–3; work on fluency, not accent.',
      'Build topic vocabulary for common themes (education, environment, technology, health).',
      'Fix common Band 6 issues: limited grammar range, repetition, weak task response.',
      'Do one full mock test weekly; review errors, not just scores.',
      'Book your test date and work backwards from it.',
      'Weekly review against the 7+ checklist.'
    ],
    phrases: {
      headers: ['Focus', 'Action'],
      rows: [
        ['Diagnostic', 'One full timed test before you plan anything.'],
        ['Writing Task 1', 'Describe the trend first, then compare — never give opinions.'],
        ['Writing Task 2', 'Answer the question directly in the introduction and conclusion.'],
        ['Speaking', 'Fluency first: keep talking, self-correct lightly.'],
        ['Listening', 'Predict the answer type before each section starts.'],
        ['Reading', 'Do not read every word; locate and verify.'],
        ['Vocabulary', 'Learn topic collocations, not isolated words.'],
        ['Timing', 'Practise with a clock every single session.'],
        ['Review', 'Keep an error log and re-test your weak areas weekly.'],
        ['Mock tests', 'Full test weekly, review the next day.']
      ]
    },
    faq: [
      ['Can you guarantee Band 7?', 'No. No honest provider can. This checklist helps you prepare systematically; your result depends on your starting level and practice.'],
      ['Academic or General Training?', 'Academic is usually for university study; General Training for migration and some work routes. Always confirm with the institution or authority you are applying to.'],
      ['How long does it take to reach Band 7?', 'It varies by starting level and study time. Use the diagnostic in the kit to set a realistic plan.']
    ]
  },

  ar: {
    code: 'AR',
    key: 'arabic',
    slug: 'ar',
    certification: 'ALPT',
    color: '#0F766E',
    i18n: {
      en: {
        title: 'Gulf Business Arabic Phrasebook + Etiquette Guide',
        subtitle: 'Ten practical phrases and cultural notes to help you build trust in Gulf business settings.',
        bullets: [
          '10 essential business phrases in Arabic script, transliteration and English',
          'Greetings, introductions, prices and meeting language',
          'Gulf business etiquette: greetings, titles, hospitality, timing',
          'Modern Standard Arabic vs. Gulf dialect: what to use when',
          'Polite follow-up phrases for email and WhatsApp'
        ]
      },
      fr: {
        title: 'Guide de phrases en arabe des affaires du Golfe + étiquette',
        subtitle: 'Dix phrases pratiques et des notes culturelles pour vous aider à instaurer la confiance dans le monde des affaires du Golfe.',
        bullets: [
          '10 phrases commerciales essentielles en écriture arabe, translittération et anglais',
          'Salutations, présentations, prix et langage de réunion',
          'Étiquette des affaires du Golfe : salutations, titres, hospitalité, ponctualité',
          'Arabe standard (MSA) ou dialecte du Golfe : quoi utiliser et quand',
          'Formules de relance polies pour l’e-mail et WhatsApp'
        ]
      },
      de: {
        title: 'Golf-Business-Arabisch: Phrasenbuch + Etikette-Guide',
        subtitle: 'Zehn praktische Phrasen und kulturelle Hinweise, die dir helfen, Vertrauen im Golf-Business aufzubauen.',
        bullets: [
          '10 wichtige Business-Phrasen in arabischer Schrift, Umschrift und Englisch',
          'Begrüßungen, Vorstellungen, Preise und Meeting-Sprache',
          'Golf-Business-Etikette: Begrüßung, Titel, Gastfreundschaft, Timing',
          'MSA oder Golf-Dialekt: Was wann verwenden',
          'Höfliche Follow-up-Formulierungen für E-Mail und WhatsApp'
        ]
      },
      zh: {
        title: '海湾商务阿拉伯语常用语手册 + 礼仪指南',
        subtitle: '十句实用短语与文化提示，助你在海湾商务场合建立信任。',
        bullets: [
          '10 句核心商务短语：阿拉伯文、转写与英文对照',
          '问候、介绍、价格与会议用语',
          '海湾商务礼仪：问候、称谓、待客之道、时间观念',
          '标准阿拉伯语与海湾方言：何时用哪种',
          '邮件和 WhatsApp 的礼貌跟进用语'
        ]
      },
      ar: {
        title: 'كتيّب عبارات العربية للأعمال في الخليج + دليل الآداب',
        subtitle: 'عشر عبارات عملية وملاحظات ثقافية تساعدك على بناء الثقة في بيئة الأعمال الخليجية.',
        bullets: [
          '10 عبارات تجارية أساسية بالخط العربي مع النقل الصوتي والمعنى بالإنجليزية',
          'التحيات والتعريف بالنفس والأسعار ولغة الاجتماعات',
          'آداب الأعمال الخليجية: التحية والألقاب والضيافة والالتزام بالوقت',
          'الفصحى أم اللهجة الخليجية: ماذا تستخدم ومتى',
          'عبارات متابعة مهذّبة للبريد الإلكتروني وواتساب'
        ]
      },
      ru: {
        title: 'Разговорник делового арабского для Залива + гид по этикету',
        subtitle: 'Десять практичных фраз и культурные заметки, помогающие выстроить доверие в деловой среде Залива.',
        bullets: [
          '10 ключевых деловых фраз арабской графикой, транслитерацией и по-английски',
          'Приветствия, представления, цены и язык совещаний',
          'Деловой этикет Залива: приветствия, титулы, гостеприимство, пунктуальность',
          'MSA или диалект Залива: что и когда использовать',
          'Вежливые фразы follow-up в e-mail и WhatsApp'
        ]
      }
    },
    inside: [
      '10 essential Gulf business phrases (Arabic + transliteration + English)',
      'Greetings and introductions',
      'Meetings, follow-ups and polite refusals',
      'Price and negotiation phrases',
      'Etiquette guide (titles, handshakes, hospitality, Ramadan, timing)',
      'Email and WhatsApp templates',
      'Pronunciation notes'
    ],
    checklist: [
      'Learn the Arabic alphabet and letter positions (initial, medial, final).',
      'Practise sounds that are new to English speakers (ع, ح, خ, ق, غ).',
      'Learn greetings and titles (Sheikh, Sayyid, Ustadh) and when to use them.',
      'Learn basic sentence structure: nominal vs. verbal sentences.',
      'Build business vocabulary: meeting, contract, price, delivery, partnership.',
      'Practise introductions and small talk.',
      'Learn polite requests and refusals.',
      'Learn price and negotiation phrases.',
      'Study Gulf etiquette: greeting order, handshakes, hospitality, Ramadan timing.',
      'Practise email and WhatsApp templates.',
      'Role-play a first meeting and a follow-up.',
      'Weekly review with the phrasebook.'
    ],
    phrases: {
      headers: ['Arabic', 'Transliteration', 'English'],
      rows: [
        ['مرحبًا / أهلًا وسهلًا', 'Marhaban / Ahlan wa sahlan', 'Hello / Welcome'],
        ['صباح الخير', 'Sabah al-khayr', 'Good morning'],
        ['كيف حالك؟', 'Kayfa haluk?', 'How are you?'],
        ['اسمي…', 'Ismi…', 'My name is…'],
        ['تشرفنا', 'Tasharrafna', 'Pleased to meet you'],
        ['من فضلك', 'Min fadlik', 'Please'],
        ['شكرًا جزيلًا', 'Shukran jazilan', 'Thank you very much'],
        ['كم السعر؟', 'Kam al-si‘r?', 'What is the price?'],
        ['هل يمكننا الاجتماع؟', 'Hal yumkinuna al-ijtima‘?', 'Can we meet?'],
        ['أنا مهتم بالتعاون', 'Ana muhtam bil-ta‘awun', 'I am interested in cooperation']
      ]
    },
    faq: [
      ['Is this Modern Standard Arabic or a Gulf dialect?', 'It uses clear Modern Standard Arabic that is widely understood, with notes on common Gulf usage.'],
      ['Can I use this for ALPT?', 'It supports beginner listening and speaking confidence. ALPT prep needs structured study; this kit is a practical starting point, not an exam guarantee.'],
      ['Do I need to read Arabic script?', 'No — every phrase includes transliteration. Learning the script will help you progress faster.']
    ]
  },

  ru: {
    code: 'RU',
    key: 'russian',
    slug: 'ru',
    certification: 'TORFL',
    color: '#B22234',
    i18n: {
      en: {
        title: 'Russian Scholarship & TORFL A1 Prep Checklist',
        subtitle: 'A beginner-friendly roadmap for Russian language, scholarship applications and TORFL A1 preparation.',
        bullets: [
          'TORFL A1 (Elementary) milestone checklist',
          'Cyrillic reading and pronunciation quick-start',
          'Scholarship application document checklist',
          'Key Russian phrases for offices, housing and campus life',
          'A realistic preparation timeline'
        ]
      },
      fr: {
        title: 'Liste de préparation bourse en Russie et TORFL A1',
        subtitle: 'Une feuille de route accessible aux débutants : langue russe, candidatures de bourse et préparation au TORFL A1.',
        bullets: [
          'Liste d’étapes TORFL A1 (élémentaire)',
          'Démarrage rapide en lecture et prononciation du cyrillique',
          'Liste de documents pour les candidatures de bourse',
          'Phrases russes clés pour les administrations, le logement et le campus',
          'Un calendrier de préparation réaliste'
        ]
      },
      de: {
        title: 'Russland-Stipendium & TORFL-A1-Vorbereitungscheckliste',
        subtitle: 'Eine anfängerfreundliche Roadmap für Russisch, Stipendienbewerbungen und die TORFL-A1-Vorbereitung.',
        bullets: [
          'TORFL-A1-Meilenstein-Checkliste (Elementarstufe)',
          'Schnellstart für kyrillisches Lesen und Aussprache',
          'Dokumenten-Checkliste für Stipendienbewerbungen',
          'Wichtige russische Phrasen für Ämter, Wohnen und Campus',
          'Ein realistischer Vorbereitungszeitplan'
        ]
      },
      zh: {
        title: '俄罗斯奖学金与 TORFL A1 备考清单',
        subtitle: '一份适合初学者的路线图：俄语学习、奖学金申请与 TORFL A1 备考。',
        bullets: [
          'TORFL A1（初级）里程碑清单',
          '西里尔字母阅读与发音快速入门',
          '奖学金申请材料清单',
          '办理事务、住宿与校园生活常用俄语',
          '现实可行的备考时间表'
        ]
      },
      ar: {
        title: 'قائمة التحضير لمنحة روسيا واختبار TORFL A1',
        subtitle: 'خارطة طريق مناسبة للمبتدئين: اللغة الروسية وطلبات المنح والتحضير لـ TORFL A1.',
        bullets: [
          'قائمة محطات TORFL A1 (المستوى المبتدئ)',
          'بداية سريعة في قراءة ونطق الحروف السيريلية',
          'قائمة مستندات طلب المنحة',
          'عبارات روسية أساسية للدوائر الرسمية والسكن والحرم الجامعي',
          'جدول زمني واقعي للتحضير'
        ]
      },
      ru: {
        title: 'Чек-лист: стипендия в России и подготовка к TORFL A1',
        subtitle: 'Понятный новичку маршрут по русскому языку, заявкам на стипендию и подготовке к TORFL A1.',
        bullets: [
          'Чек-лист этапов TORFL A1 (элементарный уровень)',
          'Быстрый старт по чтению и произношению кириллицы',
          'Чек-лист документов для заявки на стипендию',
          'Ключевые русские фразы для ведомств, жилья и кампуса',
          'Реалистичный график подготовки'
        ]
      }
    },
    inside: [
      'TORFL A1 “can-do” checklist',
      'Cyrillic alphabet and pronunciation guide',
      'Core grammar sequence (cases introduced simply)',
      '10 essential Russian phrases for daily life',
      'Scholarship document checklist',
      'Study timeline',
      'Progress tracker'
    ],
    checklist: [
      'Learn the Cyrillic alphabet (print + handwriting) and letter sounds.',
      'Practise reading aloud for 10 minutes daily.',
      'Learn greetings, introductions and courtesy phrases.',
      'Master the present tense of common verbs.',
      'Learn the six cases gradually — start with nominative and accusative.',
      'Build vocabulary for study, housing, transport and campus.',
      'Learn numbers, dates and telling the time.',
      'Practise office and dormitory dialogues.',
      'Collect scholarship documents: passport, transcripts, motivation letter, medical certificate (verify each call).',
      'Check the specific language requirement of each scholarship and university.',
      'Register for TORFL A1 when your practice tests are stable.',
      'Weekly review against the TORFL A1 “can-do” list.'
    ],
    phrases: {
      headers: ['Russian', 'Transliteration', 'English'],
      rows: [
        ['Здравствуйте', 'Zdravstvuyte', 'Hello (formal)'],
        ['Привет', 'Privet', 'Hi (informal)'],
        ['Меня зовут…', 'Menya zovut…', 'My name is…'],
        ['Как дела?', 'Kak dela?', 'How are you?'],
        ['Спасибо', 'Spasibo', 'Thank you'],
        ['Пожалуйста', 'Pozhaluysta', 'Please / You’re welcome'],
        ['Извините', 'Izvinite', 'Excuse me / Sorry'],
        ['Сколько это стоит?', 'Skol’ko eto stoit?', 'How much does it cost?'],
        ['Я не понимаю', 'Ya ne ponimayu', 'I don’t understand'],
        ['Где находится…?', 'Gde nakhoditsya…?', 'Where is…?']
      ]
    },
    faq: [
      ['Is Russian hard for beginners?', 'It has a new alphabet and a case system, but A1 is achievable with steady practice. This checklist sequences it clearly.'],
      ['Can you guarantee a scholarship?', 'No. Scholarships are awarded by the funding bodies. We help you prepare language and documents.'],
      ['Do I need TORFL A1 to apply?', 'Requirements vary by programme and university. Check each call; TORFL A1 is a useful, recognised beginner benchmark.']
    ]
  }
};

/** Contenu localisé avec repli anglais. */
export function magnetContent(magnet, lang) {
  if (!magnet) return null;
  return (magnet.i18n && (magnet.i18n[lang] || magnet.i18n.en)) || null;
}

export function getLeadMagnet(slug) {
  return LEAD_MAGNETS[String(slug || '').toLowerCase()] || null;
}
