/* ============================================================
   ELA — functions/curriculum-vocabulary.js
   ------------------------------------------------------------
   Vocabulaire thématique par niveau (B1–C2) et par langue,
   afin que les leçons générées soient réellement adaptées au
   niveau (et non pas un simple remplissage A1). Chaque entrée
   est [terme cible, glose anglaise]. Source : ELA (draft).
   ============================================================ */

const LEVEL_VOCAB = {
  B1: {
    'Travel and transport': {
      FR: [['la gare', 'the station'], ['le billet', 'the ticket'], ['l\u2019horaire', 'the timetable'], ['le quai', 'the platform'], ['la correspondance', 'the connection'], ['les bagages', 'the luggage'], ['réserver', 'to book']],
      DE: [['der Bahnhof', 'the station'], ['die Fahrkarte', 'the ticket'], ['der Fahrplan', 'the timetable'], ['das Gleis', 'the platform'], ['der Anschluss', 'the connection'], ['das Gepäck', 'the luggage'], ['buchen', 'to book']],
      ZH: [['车站 (chēzhàn)', 'the station'], ['票 (piào)', 'the ticket'], ['时刻表 (shíkèbiǎo)', 'the timetable'], ['站台 (zhàntái)', 'the platform'], ['换乘 (huànchéng)', 'the transfer'], ['行李 (xíngli)', 'the luggage'], ['预订 (yùdìng)', 'to book']],
      EN: [['the station', 'the station'], ['the ticket', 'the ticket'], ['the timetable', 'the timetable'], ['the platform', 'the platform'], ['the connection', 'the connection'], ['the luggage', 'the luggage'], ['to book', 'to book']],
      AR: [['المحطة (al-maḥaṭṭa)', 'the station'], ['التذكرة (at-tadhkira)', 'the ticket'], ['الجدول (al-jadwal)', 'the timetable'], ['الرصيف (ar-raṣīf)', 'the platform'], ['التحويل (at-taḥwīl)', 'the transfer'], ['الأمتعة (al-amtiʿa)', 'the luggage'], ['يحجز (yaḥjiz)', 'to book']],
      RU: [['вокзал (vokzal)', 'the station'], ['билет (bilet)', 'the ticket'], ['расписание (raspisaniye)', 'the timetable'], ['платформа (platforma)', 'the platform'], ['пересадка (peresadka)', 'the transfer'], ['багаж (bagazh)', 'the luggage'], ['бронировать (bronirovat\u2019)', 'to book']]
    },
    'Health and well-being': {
      FR: [['la santé', 'health'], ['le médecin', 'the doctor'], ['le rendez-vous', 'the appointment'], ['le médicament', 'the medicine'], ['la douleur', 'the pain'], ['se reposer', 'to rest'], ['guérir', 'to recover']],
      DE: [['die Gesundheit', 'health'], ['der Arzt', 'the doctor'], ['der Termin', 'the appointment'], ['das Medikament', 'the medicine'], ['der Schmerz', 'the pain'], ['sich ausruhen', 'to rest'], ['heilen', 'to heal']],
      ZH: [['健康 (jiànkāng)', 'health'], ['医生 (yīshēng)', 'the doctor'], ['预约 (yùyuē)', 'the appointment'], ['药 (yào)', 'the medicine'], ['疼痛 (téngtòng)', 'the pain'], ['休息 (xiūxi)', 'to rest'], ['康复 (kāngfù)', 'to recover']],
      EN: [['health', 'health'], ['the doctor', 'the doctor'], ['the appointment', 'the appointment'], ['the medicine', 'the medicine'], ['the pain', 'the pain'], ['to rest', 'to rest'], ['to recover', 'to recover']],
      AR: [['الصحة (aṣ-ṣiḥḥa)', 'health'], ['الطبيب (aṭ-ṭabīb)', 'the doctor'], ['الموعد (al-mawʿid)', 'the appointment'], ['الدواء (ad-dawāʾ)', 'the medicine'], ['الألم (al-alam)', 'the pain'], ['يستريح (yastarīḥ)', 'to rest'], ['يتعافى (yataʿāfā)', 'to recover']],
      RU: [['здоровье (zdorov\u2019ye)', 'health'], ['врач (vrach)', 'the doctor'], ['приём (priyom)', 'the appointment'], ['лекарство (lekarstvo)', 'the medicine'], ['боль (bol\u2019)', 'the pain'], ['отдыхать (otdykhat\u2019)', 'to rest'], ['выздоравливать (vyzdoravlivat\u2019)', 'to recover']]
    },
    'Work and study': {
      FR: [['le métier', 'the profession'], ['l\u2019entreprise', 'the company'], ['le collègue', 'the colleague'], ['la réunion', 'the meeting'], ['le stage', 'the internship'], ['la formation', 'the training'], ['embaucher', 'to hire']],
      DE: [['der Beruf', 'the profession'], ['das Unternehmen', 'the company'], ['der Kollege', 'the colleague'], ['die Besprechung', 'the meeting'], ['das Praktikum', 'the internship'], ['die Ausbildung', 'the training'], ['einstellen', 'to hire']],
      ZH: [['职业 (zhíyè)', 'the profession'], ['公司 (gōngsī)', 'the company'], ['同事 (tóngshì)', 'the colleague'], ['会议 (huìyì)', 'the meeting'], ['实习 (shíxí)', 'the internship'], ['培训 (péixùn)', 'the training'], ['雇用 (gùyòng)', 'to hire']],
      EN: [['the profession', 'the profession'], ['the company', 'the company'], ['the colleague', 'the colleague'], ['the meeting', 'the meeting'], ['the internship', 'the internship'], ['the training', 'the training'], ['to hire', 'to hire']],
      AR: [['المهنة (al-mihna)', 'the profession'], ['الشركة (ash-sharika)', 'the company'], ['الزميل (az-zamīl)', 'the colleague'], ['الاجتماع (al-ijtimāʿ)', 'the meeting'], ['التدريب العملي (at-tadrīb al-ʿamalī)', 'the internship'], ['التكوين (at-takwīn)', 'the training'], ['يوظّف (yuwazziẓ)', 'to hire']],
      RU: [['профессия (professiya)', 'the profession'], ['компания (kompaniya)', 'the company'], ['коллега (kollega)', 'the colleague'], ['совещание (soveshchaniye)', 'the meeting'], ['стажировка (stazhirovka)', 'the internship'], ['обучение (obucheniye)', 'the training'], ['нанимать (nanimat\u2019)', 'to hire']]
    },
    'Media and technology': {
      FR: [['l\u2019écran', 'the screen'], ['l\u2019application', 'the application'], ['le réseau social', 'the social network'], ['l\u2019information', 'the news'], ['le message', 'the message'], ['télécharger', 'to download'], ['partager', 'to share']],
      DE: [['der Bildschirm', 'the screen'], ['die App', 'the application'], ['das soziale Netzwerk', 'the social network'], ['die Nachricht', 'the news'], ['die Mitteilung', 'the message'], ['herunterladen', 'to download'], ['teilen', 'to share']],
      ZH: [['屏幕 (píngmù)', 'the screen'], ['应用 (yìngyòng)', 'the application'], ['社交网络 (shèjiāo wǎngluò)', 'the social network'], ['新闻 (xīnwén)', 'the news'], ['信息 (xìnxī)', 'the message'], ['下载 (xiàzài)', 'to download'], ['分享 (fēnxiǎng)', 'to share']],
      EN: [['the screen', 'the screen'], ['the application', 'the application'], ['the social network', 'the social network'], ['the news', 'the news'], ['the message', 'the message'], ['to download', 'to download'], ['to share', 'to share']],
      AR: [['الشاشة (ash-shāsha)', 'the screen'], ['التطبيق (at-taṭbīq)', 'the application'], ['الشبكة الاجتماعية (ash-shabaka al-ijtimāʿiyya)', 'the social network'], ['الأخبار (al-akhbār)', 'the news'], ['الرسالة (ar-risāla)', 'the message'], ['يحمل (yuḥammil)', 'to download'], ['يشارك (yushārik)', 'to share']],
      RU: [['экран (ekran)', 'the screen'], ['приложение (prilozheniye)', 'the application'], ['социальная сеть (sotsial\u2019naya set\u2019)', 'the social network'], ['новости (novosti)', 'the news'], ['сообщение (soobshcheniye)', 'the message'], ['скачивать (skachivat\u2019)', 'to download'], ['делиться (delit\u2019sya)', 'to share']]
    },
    'Community and society': {
      FR: [['la communauté', 'the community'], ['le quartier', 'the neighbourhood'], ['le voisin', 'the neighbour'], ['le bénévole', 'the volunteer'], ['la solidarité', 'the solidarity'], ['s\u2019engager', 'to get involved'], ['aider', 'to help']],
      DE: [['die Gemeinschaft', 'the community'], ['das Viertel', 'the neighbourhood'], ['der Nachbar', 'the neighbour'], ['der Freiwillige', 'the volunteer'], ['die Solidarität', 'the solidarity'], ['sich engagieren', 'to get involved'], ['helfen', 'to help']],
      ZH: [['社区 (shèqū)', 'the community'], ['街区 (jiēqū)', 'the neighbourhood'], ['邻居 (línjū)', 'the neighbour'], ['志愿者 (zhìyuànzhě)', 'the volunteer'], ['团结 (tuánjié)', 'the solidarity'], ['参与 (cānyù)', 'to get involved'], ['帮助 (bāngzhù)', 'to help']],
      EN: [['the community', 'the community'], ['the neighbourhood', 'the neighbourhood'], ['the neighbour', 'the neighbour'], ['the volunteer', 'the volunteer'], ['solidarity', 'the solidarity'], ['to get involved', 'to get involved'], ['to help', 'to help']],
      AR: [['المجتمع (al-mujtamaʿ)', 'the community'], ['الحي (al-ḥayy)', 'the neighbourhood'], ['الجار (al-jār)', 'the neighbour'], ['المتطوع (al-mutaṭawwiʿ)', 'the volunteer'], ['التضامن (at-taḍāmun)', 'the solidarity'], ['ينخرط (yankhariṭ)', 'to get involved'], ['يساعد (yusāʿid)', 'to help']],
      RU: [['общество (obshchestvo)', 'the community'], ['район (rayon)', 'the neighbourhood'], ['сосед (sosed)', 'the neighbour'], ['волонтёр (volontyor)', 'the volunteer'], ['солидарность (solidarnost\u2019)', 'the solidarity'], ['участвовать (uchastvovat\u2019)', 'to get involved'], ['помогать (pomogat\u2019)', 'to help']]
    },
    'Environment and sustainability': {
      FR: [['l\u2019environnement', 'the environment'], ['le recyclage', 'the recycling'], ['la pollution', 'the pollution'], ['le déchet', 'the waste'], ['l\u2019énergie', 'the energy'], ['protéger', 'to protect'], ['économiser', 'to save']],
      DE: [['die Umwelt', 'the environment'], ['das Recycling', 'the recycling'], ['die Verschmutzung', 'the pollution'], ['der Abfall', 'the waste'], ['die Energie', 'the energy'], ['schützen', 'to protect'], ['sparen', 'to save']],
      ZH: [['环境 (huánjìng)', 'the environment'], ['回收 (huíshōu)', 'the recycling'], ['污染 (wūrǎn)', 'the pollution'], ['垃圾 (lājī)', 'the waste'], ['能源 (néngyuán)', 'the energy'], ['保护 (bǎohù)', 'to protect'], ['节省 (jiéshěng)', 'to save']],
      EN: [['the environment', 'the environment'], ['recycling', 'the recycling'], ['pollution', 'the pollution'], ['waste', 'the waste'], ['energy', 'the energy'], ['to protect', 'to protect'], ['to save', 'to save']],
      AR: [['البيئة (al-bīʾa)', 'the environment'], ['إعادة التدوير (iʿādat at-tadwīr)', 'the recycling'], ['التلوث (at-talawwuth)', 'the pollution'], ['النفايات (an-nifāyāt)', 'the waste'], ['الطاقة (aṭ-ṭāqa)', 'the energy'], ['يحمي (yaḥmī)', 'to protect'], ['يوفّر (yuwaffir)', 'to save']],
      RU: [['окружающая среда (okruzhayushchaya sreda)', 'the environment'], ['переработка (pererabotka)', 'the recycling'], ['загрязнение (zagryazneniye)', 'the pollution'], ['отходы (otkhody)', 'the waste'], ['энергия (energiya)', 'the energy'], ['защищать (zashchishchat\u2019)', 'to protect'], ['экономить (ekonomit\u2019)', 'to save']]
    }
  },
  B2: {
    'Culture and identity': {
      FR: [['le patrimoine', 'the heritage'], ['l\u2019identité', 'the identity'], ['la tradition', 'the tradition'], ['la diversité', 'the diversity'], ['l\u2019héritage', 'the legacy'], ['s\u2019identifier', 'to identify'], ['transmettre', 'to pass on']],
      DE: [['das Erbe', 'the heritage'], ['die Identität', 'the identity'], ['die Tradition', 'the tradition'], ['die Vielfalt', 'the diversity'], ['das Vermächtnis', 'the legacy'], ['sich identifizieren', 'to identify'], ['weitergeben', 'to pass on']],
      ZH: [['遗产 (yíchǎn)', 'the heritage'], ['身份 (shēnfèn)', 'the identity'], ['传统 (chuántǒng)', 'the tradition'], ['多样性 (duōyàngxìng)', 'the diversity'], ['传承 (chuánchéng)', 'the legacy'], ['认同 (rèntóng)', 'to identify'], ['传递 (chuándì)', 'to pass on']],
      EN: [['heritage', 'the heritage'], ['identity', 'the identity'], ['tradition', 'the tradition'], ['diversity', 'the diversity'], ['legacy', 'the legacy'], ['to identify', 'to identify'], ['to pass on', 'to pass on']],
      AR: [['التراث (at-turāth)', 'the heritage'], ['الهوية (al-huwiyya)', 'the identity'], ['التقليد (at-taqlīd)', 'the tradition'], ['التنوع (at-tanawwuʿ)', 'the diversity'], ['الإرث (al-irth)', 'the legacy'], ['يتماهى (yatamāhā)', 'to identify'], ['ينقل (yanqul)', 'to pass on']],
      RU: [['наследие (naslediye)', 'the heritage'], ['идентичность (identichnost\u2019)', 'the identity'], ['традиция (traditsiya)', 'the tradition'], ['разнообразие (raznoobraziye)', 'the diversity'], ['наследие (naslediye)', 'the legacy'], ['идентифицировать (identifitsirovat\u2019)', 'to identify'], ['передавать (peredavat\u2019)', 'to pass on']]
    },
    'Science and innovation': {
      FR: [['la recherche', 'the research'], ['la découverte', 'the discovery'], ['l\u2019innovation', 'the innovation'], ['la technologie', 'the technology'], ['l\u2019expérience', 'the experiment'], ['développer', 'to develop'], ['inventer', 'to invent']],
      DE: [['die Forschung', 'the research'], ['die Entdeckung', 'the discovery'], ['die Innovation', 'the innovation'], ['die Technologie', 'the technology'], ['das Experiment', 'the experiment'], ['entwickeln', 'to develop'], ['erfinden', 'to invent']],
      ZH: [['研究 (yánjiū)', 'the research'], ['发现 (fāxiàn)', 'the discovery'], ['创新 (chuàngxīn)', 'the innovation'], ['技术 (jìshù)', 'the technology'], ['实验 (shíyàn)', 'the experiment'], ['发展 (fāzhǎn)', 'to develop'], ['发明 (fāmíng)', 'to invent']],
      EN: [['research', 'the research'], ['discovery', 'the discovery'], ['innovation', 'the innovation'], ['technology', 'the technology'], ['experiment', 'the experiment'], ['to develop', 'to develop'], ['to invent', 'to invent']],
      AR: [['البحث (al-baḥth)', 'the research'], ['الاكتشاف (al-iktishāf)', 'the discovery'], ['الابتكار (al-ibtikār)', 'the innovation'], ['التكنولوجيا (at-tiknūlūjiyā)', 'the technology'], ['التجربة (at-tajriba)', 'the experiment'], ['يطوّر (yuṭawwir)', 'to develop'], ['يخترع (yakhtariʿ)', 'to invent']],
      RU: [['исследование (issledovaniye)', 'the research'], ['открытие (otkrytiye)', 'the discovery'], ['инновация (innovatsiya)', 'the innovation'], ['технология (tekhnologiya)', 'the technology'], ['эксперимент (eksperiment)', 'the experiment'], ['разрабатывать (razrabatyvat\u2019)', 'to develop'], ['изобретать (izobretat\u2019)', 'to invent']]
    },
    'Economy and work': {
      FR: [['l\u2019économie', 'the economy'], ['le marché', 'the market'], ['la croissance', 'the growth'], ['l\u2019emploi', 'the employment'], ['l\u2019investissement', 'the investment'], ['produire', 'to produce'], ['exporter', 'to export']],
      DE: [['die Wirtschaft', 'the economy'], ['der Markt', 'the market'], ['das Wachstum', 'the growth'], ['die Beschäftigung', 'the employment'], ['die Investition', 'the investment'], ['produzieren', 'to produce'], ['exportieren', 'to export']],
      ZH: [['经济 (jīngjì)', 'the economy'], ['市场 (shìchǎng)', 'the market'], ['增长 (zēngzhǎng)', 'the growth'], ['就业 (jiùyè)', 'the employment'], ['投资 (tóuzī)', 'the investment'], ['生产 (shēngchǎn)', 'to produce'], ['出口 (chūkǒu)', 'to export']],
      EN: [['the economy', 'the economy'], ['the market', 'the market'], ['growth', 'the growth'], ['employment', 'the employment'], ['investment', 'the investment'], ['to produce', 'to produce'], ['to export', 'to export']],
      AR: [['الاقتصاد (al-iqtiṣād)', 'the economy'], ['السوق (as-sūq)', 'the market'], ['النمو (an-numūw)', 'the growth'], ['التوظيف (at-tawẓīf)', 'the employment'], ['الاستثمار (al-istithmār)', 'the investment'], ['ينتج (yuntij)', 'to produce'], ['يصدّر (yuṣaddir)', 'to export']],
      RU: [['экономика (ekonomika)', 'the economy'], ['рынок (rynok)', 'the market'], ['рост (rost)', 'the growth'], ['занятость (zanyatost\u2019)', 'the employment'], ['инвестиция (investitsiya)', 'the investment'], ['производить (proizvodit\u2019)', 'to produce'], ['экспортировать (eksportirovat\u2019)', 'to export']]
    },
    'Global issues': {
      FR: [['le réchauffement climatique', 'global warming'], ['la pauvreté', 'the poverty'], ['la migration', 'the migration'], ['le conflit', 'the conflict'], ['la coopération', 'the cooperation'], ['résoudre', 'to solve'], ['coopérer', 'to cooperate']],
      DE: [['die Erderwärmung', 'global warming'], ['die Armut', 'the poverty'], ['die Migration', 'the migration'], ['der Konflikt', 'the conflict'], ['die Zusammenarbeit', 'the cooperation'], ['lösen', 'to solve'], ['kooperieren', 'to cooperate']],
      ZH: [['全球变暖 (quánqiú biànnuǎn)', 'global warming'], ['贫困 (pínkùn)', 'the poverty'], ['移民 (yímín)', 'the migration'], ['冲突 (chōngtū)', 'the conflict'], ['合作 (hézuò)', 'the cooperation'], ['解决 (jiějué)', 'to solve'], ['协作 (xiézuò)', 'to cooperate']],
      EN: [['global warming', 'global warming'], ['poverty', 'the poverty'], ['migration', 'the migration'], ['conflict', 'the conflict'], ['cooperation', 'the cooperation'], ['to solve', 'to solve'], ['to cooperate', 'to cooperate']],
      AR: [['الاحتباس الحراري (al-iḥtibās al-ḥarārī)', 'global warming'], ['الفقر (al-faqr)', 'the poverty'], ['الهجرة (al-hijra)', 'the migration'], ['النزاع (an-nizāʿ)', 'the conflict'], ['التعاون (at-taʿāwun)', 'the cooperation'], ['يحل (yaḥull)', 'to solve'], ['يتعاون (yataʿāwan)', 'to cooperate']],
      RU: [['глобальное потепление (global\u2019noye potepleniye)', 'global warming'], ['бедность (bednost\u2019)', 'the poverty'], ['миграция (migratsiya)', 'the migration'], ['конфликт (konflikt)', 'the conflict'], ['сотрудничество (sotrudnichestvo)', 'the cooperation'], ['решать (reshat\u2019)', 'to solve'], ['сотрудничать (sotrudnichat\u2019)', 'to cooperate']]
    },
    'Education and careers': {
      FR: [['le diplôme', 'the diploma'], ['la compétence', 'the skill'], ['le parcours', 'the career path'], ['l\u2019orientation', 'the guidance'], ['la reconversion', 'the career change'], ['se former', 'to train'], ['réussir', 'to succeed']],
      DE: [['das Diplom', 'the diploma'], ['die Kompetenz', 'the skill'], ['der Werdegang', 'the career path'], ['die Beratung', 'the guidance'], ['der Berufswechsel', 'the career change'], ['sich fortbilden', 'to train'], ['erfolgreich sein', 'to succeed']],
      ZH: [['文凭 (wénpíng)', 'the diploma'], ['技能 (jìnéng)', 'the skill'], ['职业道路 (zhíyè dàolù)', 'the career path'], ['指导 (zhǐdǎo)', 'the guidance'], ['转行 (zhuǎnháng)', 'the career change'], ['进修 (jìnxiū)', 'to train'], ['成功 (chénggōng)', 'to succeed']],
      EN: [['the diploma', 'the diploma'], ['the skill', 'the skill'], ['the career path', 'the career path'], ['the guidance', 'the guidance'], ['the career change', 'the career change'], ['to train', 'to train'], ['to succeed', 'to succeed']],
      AR: [['الدبلوم (ad-diblūm)', 'the diploma'], ['المهارة (al-mahāra)', 'the skill'], ['المسار المهني (al-masār al-mihanī)', 'the career path'], ['التوجيه (at-tawjīh)', 'the guidance'], ['تغيير المهنة (taghyīr al-mihna)', 'the career change'], ['يتكوّن (yatakawwan)', 'to train'], ['ينجح (yanjaḥ)', 'to succeed']],
      RU: [['диплом (diplom)', 'the diploma'], ['навык (navyk)', 'the skill'], ['карьера (kar\u2019yera)', 'the career path'], ['профориентация (proforiyentatsiya)', 'the guidance'], ['смена профессии (smena professii)', 'the career change'], ['обучаться (obuchat\u2019sya)', 'to train'], ['преуспевать (preuspevat\u2019)', 'to succeed']]
    },
    'Arts and literature': {
      FR: [['l\u2019œuvre', 'the work'], ['le roman', 'the novel'], ['la poésie', 'the poetry'], ['l\u2019auteur', 'the author'], ['la critique', 'the critique'], ['créer', 'to create'], ['interpréter', 'to interpret']],
      DE: [['das Werk', 'the work'], ['der Roman', 'the novel'], ['die Poesie', 'the poetry'], ['der Autor', 'the author'], ['die Kritik', 'the critique'], ['schaffen', 'to create'], ['interpretieren', 'to interpret']],
      ZH: [['作品 (zuòpǐn)', 'the work'], ['小说 (xiǎoshuō)', 'the novel'], ['诗歌 (shīgē)', 'the poetry'], ['作者 (zuòzhě)', 'the author'], ['评论 (pínglùn)', 'the critique'], ['创作 (chuàngzuò)', 'to create'], ['诠释 (quánshì)', 'to interpret']],
      EN: [['the work', 'the work'], ['the novel', 'the novel'], ['poetry', 'the poetry'], ['the author', 'the author'], ['the critique', 'the critique'], ['to create', 'to create'], ['to interpret', 'to interpret']],
      AR: [['العمل (al-ʿamal)', 'the work'], ['الرواية (ar-riwāya)', 'the novel'], ['الشعر (ash-shiʿr)', 'the poetry'], ['الكاتب (al-kātib)', 'the author'], ['النقد (an-naqd)', 'the critique'], ['يبدع (yubdiʿ)', 'to create'], ['يفسّر (yufassir)', 'to interpret']],
      RU: [['произведение (proizvedeniye)', 'the work'], ['роман (roman)', 'the novel'], ['поэзия (poeziya)', 'the poetry'], ['автор (avtor)', 'the author'], ['критика (kritika)', 'the critique'], ['создавать (sozdavat\u2019)', 'to create'], ['интерпретировать (interpretirovat\u2019)', 'to interpret']]
    }
  },
  C1: {
    'Academic discourse': {
      FR: [['l\u2019hypothèse', 'the hypothesis'], ['l\u2019argument', 'the argument'], ['la démonstration', 'the demonstration'], ['la source', 'the source'], ['le paradigme', 'the paradigm'], ['démontrer', 'to demonstrate'], ['nuancer', 'to qualify']],
      DE: [['die Hypothese', 'the hypothesis'], ['das Argument', 'the argument'], ['die Darlegung', 'the demonstration'], ['die Quelle', 'the source'], ['das Paradigma', 'the paradigm'], ['darlegen', 'to demonstrate'], ['nuancieren', 'to qualify']],
      ZH: [['假设 (jiǎshè)', 'the hypothesis'], ['论点 (lùndiǎn)', 'the argument'], ['论证 (lùnzhèng)', 'the demonstration'], ['来源 (láiyuán)', 'the source'], ['范式 (fànshì)', 'the paradigm'], ['论证 (lùnzhèng)', 'to demonstrate'], ['细化 (xìhuà)', 'to qualify']],
      EN: [['hypothesis', 'the hypothesis'], ['argument', 'the argument'], ['demonstration', 'the demonstration'], ['source', 'the source'], ['paradigm', 'the paradigm'], ['to demonstrate', 'to demonstrate'], ['to qualify', 'to qualify']],
      AR: [['الفرضية (al-farḍiyya)', 'the hypothesis'], ['الحجة (al-ḥujja)', 'the argument'], ['البرهان (al-burhān)', 'the demonstration'], ['المصدر (al-maṣdar)', 'the source'], ['النموذج (an-namūdhaj)', 'the paradigm'], ['يبرهن (yubarhin)', 'to demonstrate'], ['يدقّق (yudaqqiq)', 'to qualify']],
      RU: [['гипотеза (gipoteza)', 'the hypothesis'], ['аргумент (argument)', 'the argument'], ['доказательство (dokazatel\u2019stvo)', 'the demonstration'], ['источник (istochnik)', 'the source'], ['парадигма (paradigma)', 'the paradigm'], ['доказывать (dokazyvat\u2019)', 'to demonstrate'], ['уточнять (utochnyat\u2019)', 'to qualify']]
    },
    'Professional communication': {
      FR: [['la négociation', 'the negotiation'], ['le compte rendu', 'the report'], ['la proposition', 'the proposal'], ['l\u2019échéance', 'the deadline'], ['le prestataire', 'the provider'], ['négocier', 'to negotiate'], ['synthétiser', 'to synthesize']],
      DE: [['die Verhandlung', 'the negotiation'], ['der Bericht', 'the report'], ['der Vorschlag', 'the proposal'], ['die Frist', 'the deadline'], ['der Anbieter', 'the provider'], ['verhandeln', 'to negotiate'], ['zusammenfassen', 'to synthesize']],
      ZH: [['谈判 (tánpàn)', 'the negotiation'], ['报告 (bàogào)', 'the report'], ['提案 (tí\u2019àn)', 'the proposal'], ['截止日期 (jiézhǐ rìqī)', 'the deadline'], ['供应商 (gōngyìngshāng)', 'the provider'], ['谈判 (tánpàn)', 'to negotiate'], ['综合 (zōnghé)', 'to synthesize']],
      EN: [['negotiation', 'the negotiation'], ['report', 'the report'], ['proposal', 'the proposal'], ['deadline', 'the deadline'], ['provider', 'the provider'], ['to negotiate', 'to negotiate'], ['to synthesize', 'to synthesize']],
      AR: [['التفاوض (at-tafāwuḍ)', 'the negotiation'], ['التقرير (at-taqrīr)', 'the report'], ['الاقتراح (al-iqtirāḥ)', 'the proposal'], ['الموعد النهائي (al-mawʿid an-nihāʾī)', 'the deadline'], ['المورّد (al-muwarrid)', 'the provider'], ['يتفاوض (yatafāwaḍ)', 'to negotiate'], ['يلخّص (yulakhkhiṣ)', 'to synthesize']],
      RU: [['переговоры (peregovory)', 'the negotiation'], ['отчёт (otchyot)', 'the report'], ['предложение (predlozheniye)', 'the proposal'], ['срок (srok)', 'the deadline'], ['поставщик (postavshchik)', 'the provider'], ['вести переговоры (vesti peregovory)', 'to negotiate'], ['обобщать (obobshchat\u2019)', 'to synthesize']]
    },
    'Argumentation and debate': {
      FR: [['la thèse', 'the thesis'], ['le contre-argument', 'the counter-argument'], ['la réfutation', 'the refutation'], ['le consensus', 'the consensus'], ['la polémique', 'the controversy'], ['réfuter', 'to refute'], ['concilier', 'to reconcile']],
      DE: [['die These', 'the thesis'], ['das Gegenargument', 'the counter-argument'], ['die Widerlegung', 'the refutation'], ['der Konsens', 'the consensus'], ['die Kontroverse', 'the controversy'], ['widerlegen', 'to refute'], ['vereinbaren', 'to reconcile']],
      ZH: [['论点 (lùndiǎn)', 'the thesis'], ['反论 (fǎnlùn)', 'the counter-argument'], ['反驳 (fǎnbó)', 'the refutation'], ['共识 (gòngshí)', 'the consensus'], ['争议 (zhēngyì)', 'the controversy'], ['反驳 (fǎnbó)', 'to refute'], ['调和 (tiáohé)', 'to reconcile']],
      EN: [['thesis', 'the thesis'], ['counter-argument', 'the counter-argument'], ['refutation', 'the refutation'], ['consensus', 'the consensus'], ['controversy', 'the controversy'], ['to refute', 'to refute'], ['to reconcile', 'to reconcile']],
      AR: [['الأطروحة (al-uṭrūḥa)', 'the thesis'], ['الحجة المضادة (al-ḥujja al-muḍādda)', 'the counter-argument'], ['التفنيد (at-tafnīd)', 'the refutation'], ['الإجماع (al-ijmāʿ)', 'the consensus'], ['الجدل (al-jadal)', 'the controversy'], ['يفنّد (yufannid)', 'to refute'], ['يوفّق (yuwaffiq)', 'to reconcile']],
      RU: [['тезис (tezis)', 'the thesis'], ['контраргумент (kontrargument)', 'the counter-argument'], ['опровержение (oproverzheniye)', 'the refutation'], ['консенсус (konsensus)', 'the consensus'], ['полемика (polemika)', 'the controversy'], ['опровергать (oprovergat\u2019)', 'to refute'], ['примирять (primiryat\u2019)', 'to reconcile']]
    },
    'Research and referencing': {
      FR: [['la méthodologie', 'the methodology'], ['la citation', 'the citation'], ['la bibliographie', 'the bibliography'], ['l\u2019échantillon', 'the sample'], ['la variable', 'the variable'], ['citer', 'to cite'], ['analyser', 'to analyse']],
      DE: [['die Methodik', 'the methodology'], ['das Zitat', 'the citation'], ['die Bibliographie', 'the bibliography'], ['die Stichprobe', 'the sample'], ['die Variable', 'the variable'], ['zitieren', 'to cite'], ['analysieren', 'to analyse']],
      ZH: [['方法论 (fāngfǎlùn)', 'the methodology'], ['引用 (yǐnyòng)', 'the citation'], ['参考书目 (cānkǎo shūmù)', 'the bibliography'], ['样本 (yàngběn)', 'the sample'], ['变量 (biànliàng)', 'the variable'], ['引用 (yǐnyòng)', 'to cite'], ['分析 (fēnxī)', 'to analyse']],
      EN: [['methodology', 'the methodology'], ['citation', 'the citation'], ['bibliography', 'the bibliography'], ['sample', 'the sample'], ['variable', 'the variable'], ['to cite', 'to cite'], ['to analyse', 'to analyse']],
      AR: [['المنهجية (al-manhajiyya)', 'the methodology'], ['الاقتباس (al-iqtibās)', 'the citation'], ['المراجع (al-marājiʿ)', 'the bibliography'], ['العينة (al-ʿayyina)', 'the sample'], ['المتغير (al-mutaghayyir)', 'the variable'], ['يقتبس (yaqtabis)', 'to cite'], ['يحلل (yuḥallil)', 'to analyse']],
      RU: [['методология (metodologiya)', 'the methodology'], ['цитата (tsitata)', 'the citation'], ['библиография (bibliografiya)', 'the bibliography'], ['выборка (vyborka)', 'the sample'], ['переменная (peremennaya)', 'the variable'], ['цитировать (tsitirovat\u2019)', 'to cite'], ['анализировать (analizirovat\u2019)', 'to analyse']]
    },
    'Intercultural negotiation': {
      FR: [['la culture d\u2019entreprise', 'the corporate culture'], ['le malentendu', 'the misunderstanding'], ['la médiation', 'the mediation'], ['l\u2019interlocuteur', 'the interlocutor'], ['le compromis', 'the compromise'], ['médier', 'to mediate'], ['s\u2019adapter', 'to adapt']],
      DE: [['die Unternehmenskultur', 'the corporate culture'], ['das Missverständnis', 'the misunderstanding'], ['die Vermittlung', 'the mediation'], ['der Gesprächspartner', 'the interlocutor'], ['der Kompromiss', 'the compromise'], ['vermitteln', 'to mediate'], ['sich anpassen', 'to adapt']],
      ZH: [['企业文化 (qǐyè wénhuà)', 'the corporate culture'], ['误解 (wùjiě)', 'the misunderstanding'], ['调解 (tiáojiě)', 'the mediation'], ['对方 (duìfāng)', 'the interlocutor'], ['折中 (zhézhōng)', 'the compromise'], ['调解 (tiáojiě)', 'to mediate'], ['适应 (shìyìng)', 'to adapt']],
      EN: [['corporate culture', 'the corporate culture'], ['misunderstanding', 'the misunderstanding'], ['mediation', 'the mediation'], ['interlocutor', 'the interlocutor'], ['compromise', 'the compromise'], ['to mediate', 'to mediate'], ['to adapt', 'to adapt']],
      AR: [['ثقافة الشركة (thaqāfat ash-sharika)', 'the corporate culture'], ['سوء الفهم (sūʾ al-fahm)', 'the misunderstanding'], ['الوساطة (al-wasāṭa)', 'the mediation'], ['المحاور (al-muḥāwir)', 'the interlocutor'], ['الحل الوسط (al-ḥall al-wasaṭ)', 'the compromise'], ['يتوسّط (yatawassaṭ)', 'to mediate'], ['يتكيّف (yatakayyaf)', 'to adapt']],
      RU: [['корпоративная культура (korporativnaya kul\u2019tura)', 'the corporate culture'], ['недопонимание (nedoponimaniye)', 'the misunderstanding'], ['посредничество (posrednichestvo)', 'the mediation'], ['собеседник (sobesednik)', 'the interlocutor'], ['компромисс (kompromiss)', 'the compromise'], ['посредничать (posrednichat\u2019)', 'to mediate'], ['адаптироваться (adaptirovat\u2019sya)', 'to adapt']]
    },
    'Specialised registers': {
      FR: [['le jargon', 'the jargon'], ['le registre', 'the register'], ['la terminologie', 'the terminology'], ['le style formel', 'the formal style'], ['la convention', 'the convention'], ['formuler', 'to formulate'], ['transposer', 'to transpose']],
      DE: [['der Jargon', 'the jargon'], ['das Register', 'the register'], ['die Terminologie', 'the terminology'], ['der formelle Stil', 'the formal style'], ['die Konvention', 'the convention'], ['formulieren', 'to formulate'], ['übertragen', 'to transpose']],
      ZH: [['行话 (hánghuà)', 'the jargon'], ['语体 (yǔtǐ)', 'the register'], ['术语 (shùyǔ)', 'the terminology'], ['正式风格 (zhèngshì fēnggé)', 'the formal style'], ['惯例 (guànlì)', 'the convention'], ['表达 (biǎodá)', 'to formulate'], ['转换 (zhuǎnhuàn)', 'to transpose']],
      EN: [['jargon', 'the jargon'], ['register', 'the register'], ['terminology', 'the terminology'], ['formal style', 'the formal style'], ['convention', 'the convention'], ['to formulate', 'to formulate'], ['to transpose', 'to transpose']],
      AR: [['المصطلحات المتخصصة (al-muṣṭalaḥāt al-mutakhaṣṣiṣa)', 'the jargon'], ['الأسلوب (al-uslūb)', 'the register'], ['المصطلحية (al-muṣṭalaḥiyya)', 'the terminology'], ['الأسلوب الرسمي (al-uslūb ar-rasmī)', 'the formal style'], ['العرف (al-ʿurf)', 'the convention'], ['يصوغ (yaṣūgh)', 'to formulate'], ['يحوّل (yuḥawwil)', 'to transpose']],
      RU: [['жаргон (zhargon)', 'the jargon'], ['регистр (registr)', 'the register'], ['терминология (terminologiya)', 'the terminology'], ['формальный стиль (formal\u2019nyy stil\u2019)', 'the formal style'], ['конвенция (konventsiya)', 'the convention'], ['формулировать (formulirovat\u2019)', 'to formulate'], ['переносить (perenosit\u2019)', 'to transpose']]
    }
  },
  C2: {
    'Advanced rhetoric': {
      FR: [['la rhétorique', 'the rhetoric'], ['l\u2019éloquence', 'the eloquence'], ['la métaphore', 'the metaphor'], ['l\u2019anaphore', 'the anaphora'], ['le syllogisme', 'the syllogism'], ['persuader', 'to persuade'], ['disserter', 'to discourse']],
      DE: [['die Rhetorik', 'the rhetoric'], ['die Beredsamkeit', 'the eloquence'], ['die Metapher', 'the metaphor'], ['die Anapher', 'the anaphora'], ['der Syllogismus', 'the syllogism'], ['überzeugen', 'to persuade'], ['erörtern', 'to discourse']],
      ZH: [['修辞 (xiūcí)', 'the rhetoric'], ['雄辩 (xióngbiàn)', 'the eloquence'], ['比喻 (bǐyù)', 'the metaphor'], ['反复 (fǎnfù)', 'the anaphora'], ['三段论 (sānduànlùn)', 'the syllogism'], ['说服 (shuōfú)', 'to persuade'], ['论述 (lùnshù)', 'to discourse']],
      EN: [['rhetoric', 'the rhetoric'], ['eloquence', 'the eloquence'], ['metaphor', 'the metaphor'], ['anaphora', 'the anaphora'], ['syllogism', 'the syllogism'], ['to persuade', 'to persuade'], ['to discourse', 'to discourse']],
      AR: [['البلاغة (al-balāgha)', 'the rhetoric'], ['الفصاحة (al-faṣāḥa)', 'the eloquence'], ['الاستعارة (al-istiʿāra)', 'the metaphor'], ['التكرار (at-takrār)', 'the anaphora'], ['القياس (al-qiyās)', 'the syllogism'], ['يقنع (yuqniʿ)', 'to persuade'], ['يباحث (yubāḥith)', 'to discourse']],
      RU: [['риторика (ritorika)', 'the rhetoric'], ['красноречие (krasnorechiye)', 'the eloquence'], ['метафора (metafora)', 'the metaphor'], ['анафора (anafora)', 'the anaphora'], ['силлогизм (sillogizm)', 'the syllogism'], ['убеждать (ubezhdat\u2019)', 'to persuade'], ['рассуждать (rassuzhdat\u2019)', 'to discourse']]
    },
    'Literary and stylistic analysis': {
      FR: [['le style', 'the style'], ['la tonalité', 'the tone'], ['le narrateur', 'the narrator'], ['la figure de style', 'the figure of speech'], ['l\u2019intrigue', 'the plot'], ['analyser', 'to analyse'], ['comparer', 'to compare']],
      DE: [['der Stil', 'the style'], ['der Tonfall', 'the tone'], ['der Erzähler', 'the narrator'], ['das Stilmittel', 'the figure of speech'], ['die Handlung', 'the plot'], ['analysieren', 'to analyse'], ['vergleichen', 'to compare']],
      ZH: [['风格 (fēnggé)', 'the style'], ['语气 (yǔqì)', 'the tone'], ['叙述者 (xùshùzhě)', 'the narrator'], ['修辞手法 (xiūcí shǒufǎ)', 'the figure of speech'], ['情节 (qíngjié)', 'the plot'], ['分析 (fēnxī)', 'to analyse'], ['比较 (bǐjiào)', 'to compare']],
      EN: [['style', 'the style'], ['tone', 'the tone'], ['narrator', 'the narrator'], ['figure of speech', 'the figure of speech'], ['plot', 'the plot'], ['to analyse', 'to analyse'], ['to compare', 'to compare']],
      AR: [['الأسلوب (al-uslūb)', 'the style'], ['النبرة (an-nabra)', 'the tone'], ['الراوي (ar-rāwī)', 'the narrator'], ['المحسن البديعي (al-muḥassin al-badīʿī)', 'the figure of speech'], ['الحبكة (al-ḥabka)', 'the plot'], ['يحلل (yuḥallil)', 'to analyse'], ['يقارن (yuqārin)', 'to compare']],
      RU: [['стиль (stil\u2019)', 'the style'], ['тон (ton)', 'the tone'], ['рассказчик (rasskazchik)', 'the narrator'], ['стилистическая фигура (stilisticheskaya figura)', 'the figure of speech'], ['сюжет (syuzhet)', 'the plot'], ['анализировать (analizirovat\u2019)', 'to analyse'], ['сравнивать (sravnivat\u2019)', 'to compare']]
    },
    'Domain expertise': {
      FR: [['l\u2019expertise', 'the expertise'], ['le domaine', 'the domain'], ['la spécialisation', 'the specialisation'], ['la maîtrise', 'the mastery'], ['le corpus', 'the corpus'], ['approfondir', 'to deepen'], ['vulgariser', 'to popularise']],
      DE: [['die Expertise', 'the expertise'], ['das Gebiet', 'the domain'], ['die Spezialisierung', 'the specialisation'], ['die Beherrschung', 'the mastery'], ['der Korpus', 'the corpus'], ['vertiefen', 'to deepen'], ['verständlich machen', 'to popularise']],
      ZH: [['专长 (zhuāncháng)', 'the expertise'], ['领域 (lǐngyù)', 'the domain'], ['专业化 (zhuānyèhuà)', 'the specialisation'], ['精通 (jīngtōng)', 'the mastery'], ['语料 (yǔliào)', 'the corpus'], ['深入 (shēnrù)', 'to deepen'], ['普及 (pǔjí)', 'to popularise']],
      EN: [['expertise', 'the expertise'], ['domain', 'the domain'], ['specialisation', 'the specialisation'], ['mastery', 'the mastery'], ['corpus', 'the corpus'], ['to deepen', 'to deepen'], ['to popularise', 'to popularise']],
      AR: [['الخبرة (al-khibra)', 'the expertise'], ['المجال (al-majāl)', 'the domain'], ['التخصص (at-takhaṣṣuṣ)', 'the specialisation'], ['الإتقان (al-itqān)', 'the mastery'], ['المدونة (al-mudawwana)', 'the corpus'], ['يتعمق (yataʿammaq)', 'to deepen'], ['يبسّط (yubassiṭ)', 'to popularise']],
      RU: [['компетентность (kompetentnost\u2019)', 'the expertise'], ['область (oblast\u2019)', 'the domain'], ['специализация (spetsializatsiya)', 'the specialisation'], ['мастерство (masterstvo)', 'the mastery'], ['корпус (korpus)', 'the corpus'], ['углублять (uglublyat\u2019)', 'to deepen'], ['популяризировать (populyarizirovat\u2019)', 'to popularise']]
    },
    'Nuanced argumentation': {
      FR: [['la nuance', 'the nuance'], ['le paradoxe', 'the paradox'], ['la concession', 'the concession'], ['l\u2019implicite', 'the implicit'], ['la relativisation', 'the relativisation'], ['nuancer', 'to nuance'], ['relativiser', 'to relativise']],
      DE: [['die Nuance', 'the nuance'], ['das Paradox', 'the paradox'], ['das Zugeständnis', 'the concession'], ['das Implizite', 'the implicit'], ['die Relativierung', 'the relativisation'], ['nuancieren', 'to nuance'], ['relativieren', 'to relativise']],
      ZH: [['细微差别 (xìwēi chābié)', 'the nuance'], ['悖论 (bèilùn)', 'the paradox'], ['让步 (ràngbù)', 'the concession'], ['隐含 (yǐnhán)', 'the implicit'], ['相对化 (xiāngduìhuà)', 'the relativisation'], ['细化 (xìhuà)', 'to nuance'], ['相对看待 (xiāngduì kàndài)', 'to relativise']],
      EN: [['nuance', 'the nuance'], ['paradox', 'the paradox'], ['concession', 'the concession'], ['the implicit', 'the implicit'], ['relativisation', 'the relativisation'], ['to nuance', 'to nuance'], ['to relativise', 'to relativise']],
      AR: [['الفارق الدقيق (al-fāriq ad-daqīq)', 'the nuance'], ['المفارقة (al-mufāraqa)', 'the paradox'], ['التنازل (at-tanāzul)', 'the concession'], ['الضمني (aḍ-ḍimnī)', 'the implicit'], ['النسبية (an-nisbiyya)', 'the relativisation'], ['يدقّق (yudaqqiq)', 'to nuance'], ['ينسب (yansib)', 'to relativise']],
      RU: [['нюанс (nyuans)', 'the nuance'], ['парадокс (paradoks)', 'the paradox'], ['уступка (ustupka)', 'the concession'], ['подразумеваемое (podrazumevayemoye)', 'the implicit'], ['относительность (otnositel\u2019nost\u2019)', 'the relativisation'], ['нюансировать (nyuansirovat\u2019)', 'to nuance'], ['относить к относительному (otnosit\u2019 k otnositel\u2019nomu)', 'to relativise']]
    },
    'Language policy and variation': {
      FR: [['la politique linguistique', 'the language policy'], ['la variation', 'the variation'], ['le dialecte', 'the dialect'], ['la norme', 'the norm'], ['le bilinguisme', 'the bilingualism'], ['normaliser', 'to standardise'], ['préserver', 'to preserve']],
      DE: [['die Sprachpolitik', 'the language policy'], ['die Variation', 'the variation'], ['der Dialekt', 'the dialect'], ['die Norm', 'the norm'], ['die Zweisprachigkeit', 'the bilingualism'], ['normieren', 'to standardise'], ['bewahren', 'to preserve']],
      ZH: [['语言政策 (yǔyán zhèngcè)', 'the language policy'], ['变体 (biàntǐ)', 'the variation'], ['方言 (fāngyán)', 'the dialect'], ['规范 (guīfàn)', 'the norm'], ['双语 (shuāngyǔ)', 'the bilingualism'], ['规范化 (guīfànhuà)', 'to standardise'], ['保护 (bǎohù)', 'to preserve']],
      EN: [['language policy', 'the language policy'], ['variation', 'the variation'], ['dialect', 'the dialect'], ['norm', 'the norm'], ['bilingualism', 'the bilingualism'], ['to standardise', 'to standardise'], ['to preserve', 'to preserve']],
      AR: [['السياسة اللغوية (as-siyāsa al-lughawiyya)', 'the language policy'], ['التنوع اللغوي (at-tanawwuʿ al-lughawī)', 'the variation'], ['اللهجة (al-lahja)', 'the dialect'], ['المعيار (al-miʿyār)', 'the norm'], ['ثنائية اللغة (thunāʾiyyat al-lugha)', 'the bilingualism'], ['يوحّد (yuwaḥḥid)', 'to standardise'], ['يحافظ (yuḥāfiẓ)', 'to preserve']],
      RU: [['языковая политика (yazykovaya politika)', 'the language policy'], ['вариантность (variantnost\u2019)', 'the variation'], ['диалект (dialekt)', 'the dialect'], ['норма (norma)', 'the norm'], ['двуязычие (dvuyazychiye)', 'the bilingualism'], ['нормировать (normirovat\u2019)', 'to standardise'], ['сохранять (sokhranyat\u2019)', 'to preserve']]
    },
    'Mastery project': {
      FR: [['le chef-d\u2019œuvre', 'the masterpiece'], ['la synthèse', 'the synthesis'], ['la révision', 'the revision'], ['la soutenance', 'the defence'], ['l\u2019aboutissement', 'the culmination'], ['peaufiner', 'to polish'], ['soutenir', 'to defend']],
      DE: [['das Meisterwerk', 'the masterpiece'], ['die Synthese', 'the synthesis'], ['die Überarbeitung', 'the revision'], ['die Verteidigung', 'the defence'], ['der Höhepunkt', 'the culmination'], ['feilen', 'to polish'], ['verteidigen', 'to defend']],
      ZH: [['杰作 (jiézuò)', 'the masterpiece'], ['综合 (zōnghé)', 'the synthesis'], ['修订 (xiūdìng)', 'the revision'], ['答辩 (dábiàn)', 'the defence'], ['顶点 (dǐngdiǎn)', 'the culmination'], ['润色 (rùnsè)', 'to polish'], ['答辩 (dábiàn)', 'to defend']],
      EN: [['masterpiece', 'the masterpiece'], ['synthesis', 'the synthesis'], ['revision', 'the revision'], ['defence', 'the defence'], ['culmination', 'the culmination'], ['to polish', 'to polish'], ['to defend', 'to defend']],
      AR: [['التحفة (at-tuḥfa)', 'the masterpiece'], ['التوليف (at-tawlīf)', 'the synthesis'], ['المراجعة (al-murājaʿa)', 'the revision'], ['المناقشة (al-munāqasha)', 'the defence'], ['الذروة (adh-dhurwa)', 'the culmination'], ['يصقل (yaṣqul)', 'to polish'], ['يناقش (yunāqish)', 'to defend']],
      RU: [['шедевр (shedevr)', 'the masterpiece'], ['синтез (sintez)', 'the synthesis'], ['пересмотр (peresmotr)', 'the revision'], ['защита (zashchita)', 'the defence'], ['кульминация (kul\u2019minatsiya)', 'the culmination'], ['оттачивать (ottachivat\u2019)', 'to polish'], ['защищать (zashchishchat\u2019)', 'to defend']]
    }
  }
};

module.exports = { LEVEL_VOCAB };
