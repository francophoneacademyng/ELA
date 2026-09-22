/* ============================================================
   ELA — functions/academic-framework.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Cadre académique ELA : compétences, descripteurs de niveau,
   alignements de référentiels, définitions de programmes,
   learning outcomes, blueprints d'évaluation et d'examen,
   rubriques, et blueprint de curriculum.

   HONNÊTETÉ DES RÉFÉRENTIELS :
   - Les programmes ELA sont « alignés sur » / « référencés contre »
     les référentiels externes (CEFR, Goethe, HSK, IELTS, ALPT, TORFL).
   - ELA n'est PAS un centre d'examen officiel ni un organisme de
     certification de ces référentiels. Aucune revendication
     d'agrément, de licence ou de partenariat n'est faite.
   - Les contenus d'examen propriétaires ne sont pas reproduits.
   ============================================================ */

const crypto = require('crypto');

/* ---------- Compétences ---------- */
const COMPETENCY_DOMAINS = [
  { id: 'C-LIS', domain: 'listening', label: 'Listening comprehension' },
  { id: 'C-REA', domain: 'reading', label: 'Reading comprehension' },
  { id: 'C-WRI', domain: 'writing', label: 'Written production' },
  { id: 'C-SPE', domain: 'speaking', label: 'Spoken production' },
  { id: 'C-GRA', domain: 'grammar', label: 'Grammatical competence' },
  { id: 'C-VOC', domain: 'vocabulary', label: 'Lexical competence' },
  { id: 'C-PRO', domain: 'pronunciation', label: 'Phonological control' },
  { id: 'C-INT', domain: 'interaction', label: 'Spoken interaction' },
  { id: 'C-MED', domain: 'mediation', label: 'Mediation' },
  { id: 'C-ICU', domain: 'intercultural', label: 'Intercultural competence' }
];

/* ---------- Descripteurs de niveau (rédaction ELA, informée par le CEFR) ---------- */
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_DESCRIPTORS = {
  A1: {
    purpose: 'Survival and introductory communication in predictable everyday situations.',
    learnerProfile: 'Absolute or false beginner with no prior systematic study.',
    canDo: {
      listening: 'Can recognise familiar words and very basic phrases about self, family and immediate surroundings when spoken slowly and clearly.',
      reading: 'Can understand very short, simple texts and locate familiar names, words and basic phrases.',
      writing: 'Can write short, simple messages and fill in forms with personal details.',
      speaking: 'Can use simple phrases and sentences to describe where one lives and people one knows.',
      interaction: 'Can ask and answer simple questions on very familiar topics if the interlocutor speaks slowly.'
    }
  },
  A2: {
    purpose: 'Elementary communication on routine matters and immediate needs.',
    learnerProfile: 'Learner who can handle short exchanges in familiar contexts.',
    canDo: {
      listening: 'Can understand phrases and high-frequency vocabulary related to areas of immediate personal relevance.',
      reading: 'Can read short, simple texts and find specific, predictable information.',
      writing: 'Can write short, simple notes and messages on familiar matters.',
      speaking: 'Can use a series of phrases and sentences to describe family, conditions and background.',
      interaction: 'Can communicate in simple, routine tasks requiring a direct exchange of information.'
    }
  },
  B1: {
    purpose: 'Independent handling of familiar and some unfamiliar situations.',
    learnerProfile: 'Learner able to sustain communication and express opinions.',
    canDo: {
      listening: 'Can understand the main points of clear standard speech on familiar matters.',
      reading: 'Can understand texts that consist mainly of high-frequency everyday or job-related language.',
      writing: 'Can write connected text on familiar topics and describe experiences and impressions.',
      speaking: 'Can give reasons and explanations for opinions and plans.',
      interaction: 'Can deal with most situations likely to arise while travelling and enter unprepared conversation.'
    }
  },
  B2: {
    purpose: 'Confident independent use across a broad range of topics.',
    learnerProfile: 'Learner able to interact with fluency and argue a case.',
    canDo: {
      listening: 'Can understand extended speech and follow complex lines of argument on familiar topics.',
      reading: 'Can read articles and reports concerned with contemporary problems and identify positions.',
      writing: 'Can write clear, detailed text on a wide range of subjects and explain a viewpoint.',
      speaking: 'Can present clear, detailed descriptions and develop arguments systematically.',
      interaction: 'Can interact with a degree of fluency and spontaneity with native speakers.'
    }
  },
  C1: {
    purpose: 'Effective operational proficiency for academic and professional life.',
    learnerProfile: 'Learner able to use language flexibly and efficiently.',
    canDo: {
      listening: 'Can understand extended speech even when not clearly structured and recognise implicit meaning.',
      reading: 'Can understand long, complex factual and literary texts and appreciate distinctions of style.',
      writing: 'Can express ideas fluently in well-structured text appropriate to the reader.',
      speaking: 'Can present clear, detailed descriptions of complex subjects integrating sub-themes.',
      interaction: 'Can express oneself fluently and spontaneously without much obvious searching for expressions.'
    }
  },
  C2: {
    purpose: 'Mastery-level comprehension and expression.',
    learnerProfile: 'Learner approaching native-like command across domains.',
    canDo: {
      listening: 'Can understand with ease virtually everything heard, including rapid native speech.',
      reading: 'Can read with ease virtually all forms of written language, including abstract texts.',
      writing: 'Can write clear, smoothly flowing text appropriate in style and structure.',
      speaking: 'Can present a clear, smoothly flowing description with an effective logical structure.',
      interaction: 'Can take part effortlessly in any conversation and express oneself with precision.'
    }
  }
};

/* ---------- Alignement des référentiels par académie (HONNÊTE) ---------- */
const FRAMEWORK_ALIGNMENTS = {
  FR: {
    framework: 'CEFR',
    alignmentStatement: 'ELA French programmes are aligned with the Common European Framework of Reference for Languages (CEFR) level descriptors. ELA is not an official CEFR certification body and issues ELA credentials only.',
    levels: CEFR_LEVELS,
    levelSystem: 'CEFR A1–C2'
  },
  DE: {
    framework: 'Goethe-aligned',
    alignmentStatement: 'ELA German programmes are aligned with Goethe-Institut level descriptors (A1–C2). ELA is not a Goethe-Institut examination centre and does not issue Goethe certificates.',
    levels: CEFR_LEVELS,
    levelSystem: 'Goethe-aligned A1–C2'
  },
  ZH: {
    framework: 'HSK',
    alignmentStatement: 'ELA Mandarin programmes are mapped to HSK 1–6 vocabulary and grammar scope. ELA is not an official HSK test centre and does not issue HSK certificates. Any HSK-to-CEFR relationship is indicative, not an official equivalence.',
    levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
    levelSystem: 'HSK 1–6'
  },
  EN: {
    framework: 'IELTS-aligned',
    alignmentStatement: 'The ELA English curriculum follows a CEFR-based language progression, with IELTS-oriented competencies incorporated at upper levels. ELA is not an IELTS test centre and does not issue IELTS results.',
    levels: CEFR_LEVELS,
    levelSystem: 'CEFR A1–C2 (IELTS-oriented at B1+)'
  },
  AR: {
    framework: 'ALPT',
    alignmentStatement: 'ELA Arabic programmes are referenced against Arabic Language Proficiency Test (ALPT) level expectations. ELA is not an official ALPT provider and does not issue ALPT certificates.',
    levels: CEFR_LEVELS,
    levelSystem: 'CEFR A1–C2 (ALPT-referenced)'
  },
  RU: {
    framework: 'TORFL',
    alignmentStatement: 'ELA Russian programmes are referenced against TORFL/ТРКИ level expectations. ELA is not an official TORFL centre and does not issue TORFL certificates.',
    levels: CEFR_LEVELS,
    levelSystem: 'CEFR A1–C2 (TORFL-referenced)'
  }
};

/* ---------- Durées / charge de travail (décisions de conception ELA) ----------
   Ce sont des CHOIX DE CONCEPTION ELA, pas des minima réglementaires. */
const WORKLOAD_BY_LEVEL = {
  A1: { guidedHours: 80, independentHours: 40, durationWeeks: 10 },
  A2: { guidedHours: 90, independentHours: 50, durationWeeks: 11 },
  B1: { guidedHours: 120, independentHours: 80, durationWeeks: 14 },
  B2: { guidedHours: 120, independentHours: 90, durationWeeks: 14 },
  C1: { guidedHours: 150, independentHours: 120, durationWeeks: 18 },
  C2: { guidedHours: 160, independentHours: 140, durationWeeks: 20 },
  HSK1: { guidedHours: 70, independentHours: 40, durationWeeks: 10 },
  HSK2: { guidedHours: 80, independentHours: 50, durationWeeks: 10 },
  HSK3: { guidedHours: 100, independentHours: 70, durationWeeks: 12 },
  HSK4: { guidedHours: 120, independentHours: 90, durationWeeks: 14 },
  HSK5: { guidedHours: 140, independentHours: 110, durationWeeks: 16 },
  HSK6: { guidedHours: 160, independentHours: 140, durationWeeks: 20 }
};

const ACADEMY_META = {
  FR: { label: 'Francophone Academy', language: 'French' },
  DE: { label: 'Germanophone Academy', language: 'German' },
  ZH: { label: 'Sinophone Academy', language: 'Mandarin Chinese' },
  EN: { label: 'Anglophone Pro Academy', language: 'English' },
  AR: { label: 'Arabophone Academy', language: 'Arabic' },
  RU: { label: 'Russophone Academy', language: 'Russian' }
};

/* ---------- Learning outcomes ----------
   Outcomes mesurables, générés par niveau à partir de gabarits
   propres à ELA (non copiés d'un référentiel protégé). */
function outcomeTemplates(level) {
  const L = level;
  return [
    { n: 1, skill: 'C-SPE', text: 'Can introduce oneself and provide basic personal information in a short structured interaction (' + L + ').' },
    { n: 2, skill: 'C-LIS', text: 'Can identify key information in short spoken texts on familiar topics (' + L + ').' },
    { n: 3, skill: 'C-REA', text: 'Can extract specific information from short written texts on familiar topics (' + L + ').' },
    { n: 4, skill: 'C-WRI', text: 'Can produce a short connected written text on a familiar topic (' + L + ').' },
    { n: 5, skill: 'C-INT', text: 'Can ask and answer questions on familiar topics in a controlled exchange (' + L + ').' },
    { n: 6, skill: 'C-GRA', text: 'Can apply core grammatical structures appropriate to ' + L + ' with reasonable accuracy.' },
    { n: 7, skill: 'C-VOC', text: 'Can use the core vocabulary set targeted at ' + L + ' in context.' },
    { n: 8, skill: 'C-PRO', text: 'Can produce target sounds and prosody intelligibly for ' + L + '.' },
    { n: 9, skill: 'C-ICU', text: 'Can recognise basic cultural conventions relevant to the target language community (' + L + ').' }
  ];
}

function outcomeId(academy, level, n) {
  return academy + '-' + level + '-LO-' + String(n).padStart(2, '0');
}

function buildOutcomes(academy, level) {
  return outcomeTemplates(level).map((o) => ({
    id: outcomeId(academy, level, o.n),
    academyCode: academy,
    level: level,
    skill: o.skill,
    statement: o.text,
    measurable: true,
    status: 'APPROVED' // architecture-level outcomes are institutionally defined
  }));
}

/* ---------- Blueprints d'évaluation ---------- */
function buildAssessmentBlueprint(academy, level) {
  return {
    id: 'AB-' + academy + '-' + level,
    academyCode: academy,
    level: level,
    purpose: 'Define ELA assessment types, weights and progression implications.',
    types: [
      { type: 'PRACTICE_ACTIVITY', weight: 0, scored: false, purpose: 'Formative practice; no progression impact.' },
      { type: 'FORMATIVE_QUIZ', weight: 0, scored: true, purpose: 'Diagnostic; informs remediation; not certification.' },
      { type: 'UNIT_ASSESSMENT', weight: 20, scored: true, purpose: 'Checks unit mastery; contributes to level assessment readiness.' },
      { type: 'LEVEL_ASSESSMENT', weight: 20, scored: true, purpose: 'Confirms readiness for the certification examination.' },
      { type: 'FINAL_CERTIFICATION_EXAMINATION', weight: 60, scored: true, purpose: 'Authoritative four-skill certification examination.' }
    ],
    passMark: 60,
    rationale: 'ELA design decision: the certification examination carries the majority weight (60%) because it is the authoritative, examiner-moderated measure. Continuous assessment totals 40% to reward consistent engagement.',
    status: 'APPROVED'
  };
}

/* ---------- Blueprint d'examen + rubriques (ELA-owned) ---------- */
function buildExaminationBlueprint(academy, level) {
  const rubric = (criteria) => criteria.map((c) => ({ criterion: c, max: 5 }));
  return {
    id: 'EX-' + academy + '-' + level,
    academyCode: academy,
    level: level,
    version: 1,
    durationMinutes: level.indexOf('C') === 0 && level !== 'C1' && level !== 'C2' ? 150 : (level === 'C1' || level === 'C2' ? 180 : 150),
    sections: [
      { id: 'listening', skill: 'listening', type: 'objective', weight: 25, passMark: 50, competencies: ['C-LIS', 'C-VOC'] },
      { id: 'reading', skill: 'reading', type: 'objective', weight: 25, passMark: 50, competencies: ['C-REA', 'C-VOC', 'C-GRA'] },
      { id: 'writing', skill: 'writing', type: 'subjective', weight: 25, passMark: 50, competencies: ['C-WRI', 'C-GRA', 'C-VOC'], rubric: rubric(['Task achievement', 'Coherence and cohesion', 'Lexical range', 'Grammatical range and accuracy']) },
      { id: 'speaking', skill: 'speaking', type: 'subjective', weight: 25, passMark: 50, competencies: ['C-SPE', 'C-INT', 'C-PRO', 'C-ICU'], rubric: rubric(['Fluency', 'Interaction', 'Lexical resource', 'Grammatical range and pronunciation']) }
    ],
    passRules: { overall: 60, allSkillsMinimum: 50, requiresAllSkills: true },
    retakeRules: { allowed: true, maxAttempts: 2, cooldownDays: 30 },
    examinerInvolvement: 'Writing and speaking sections are graded by authorized examiners using the ELA rubric.',
    moderationRequired: true,
    status: 'APPROVED',
    rationale: 'Equal 25% weighting across the four skills reflects the ELA commitment to balanced four-skill certification. A 50% per-skill floor prevents compensating a failed skill with a strong one.'
  };
}

/* ---------- Définition de programme ---------- */
function buildProgrammeDefinition(academy, level) {
  const meta = ACADEMY_META[academy];
  const align = FRAMEWORK_ALIGNMENTS[academy];
  const workload = WORKLOAD_BY_LEVEL[level] || WORKLOAD_BY_LEVEL.A1;
  return {
    id: 'prog_' + academy + '_' + level,
    academyCode: academy,
    academyLabel: meta.label,
    language: meta.language,
    title: meta.language + ' ' + level + ' Programme',
    shortTitle: academy + ' ' + level,
    description: 'Institutional ' + meta.language + ' programme at ' + level + ', designed for learners progressing toward the ELA ' + level + ' certification examination.',
    targetLearners: 'Learners placed at ' + level + ' through ELA placement or prior evidence.',
    entryRequirements: level === 'A1' || level === 'HSK1' ? 'No prior study required.' : 'Completion of the preceding ELA level or equivalent placement evidence.',
    level: level,
    framework: align.framework,
    frameworkAlignment: align.alignmentStatement,
    levelSystem: align.levelSystem,
    durationWeeks: workload.durationWeeks,
    guidedLearningHours: workload.guidedHours,
    independentLearningHours: workload.independentHours,
    totalEstimatedWorkload: workload.guidedHours + workload.independentHours,
    workloadNote: 'ELA programme design decision; not a regulatory minimum.',
    learningOutcomes: buildOutcomes(academy, level).map((o) => o.id),
    competencyDomains: COMPETENCY_DOMAINS.map((c) => c.id),
    courseStructure: 'Foundation → Development → Application → Integration → Assessment',
    assessmentStructure: 'Formative activities and quizzes, unit assessments, level assessment, final certification examination.',
    examinationStructure: 'Four sections (listening, reading, writing, speaking), equal weighting, examiner-moderated.',
    progressionRequirements: 'Level assessment pass and eligibility for the certification examination.',
    completionRequirements: 'Pass the final certification examination (overall ≥60%, each skill ≥50%) and obtain examiner validation.',
    certificateType: 'certification',
    version: 1,
    status: 'DRAFT',
    contentState: 'DRAFT',
    reviewDate: null,
    academicOwner: 'ELA Academic Board',
    qualityReviewStatus: 'REVIEW_REQUIRED'
  };
}

/* ---------- Curriculum : français A1 (blueprint réel) ----------
   Structure pédagogique ELA-owned. Les corps de leçon ne sont pas
   encore rédigés : les leçons sont marquées DRAFT (contenu à produire
   et à réviser). Aucun contenu d'examen propriétaire n'est reproduit. */
const FR_A1_MODULES = [
  {
    title: 'Se présenter et saluer', theme: 'Greetings and introductions', outcomes: [1, 2, 5],
    units: [
      { title: 'Bonjour et au revoir', vocab: ['salutations', 'formules de politesse'], grammar: ['pronoms sujets'], pronunciation: ['voyelles nasales'], lessons: [
        { title: 'Saluer à différents moments', objective: 'Greet and take leave appropriately.', activities: ['écoute', 'répétition', 'jeu de rôle'] },
        { title: 'Dire son nom', objective: 'State and ask names.', activities: ['dialogue guidé', 'production orale'] }
      ] },
      { title: 'Nationalités et langues', vocab: ['pays', 'nationalités', 'langues'], grammar: ['être + adjectif'], pronunciation: ['liaison'], lessons: [
        { title: 'Dire d’où l’on vient', objective: 'State origin and nationality.', activities: ['écoute', 'association'] },
        { title: 'Parler des langues', objective: 'Name languages spoken.', activities: ['interaction', 'fiche'] }
      ] },
      { title: 'Chiffres et alphabet', vocab: ['nombres 0–20', 'alphabet'], grammar: ['genre des noms'], pronunciation: ['alphabet'], lessons: [
        { title: 'Compter de 0 à 20', objective: 'Count and spell numbers.', activities: ['répétition', 'dictée courte'] },
        { title: 'Épeler son nom', objective: 'Spell names using the alphabet.', activities: ['écoute', 'interaction'] }
      ] }
    ]
  },
  {
    title: 'Identité personnelle', theme: 'Personal identity', outcomes: [1, 4, 6],
    units: [
      { title: 'Âge et anniversaire', vocab: ['âge', 'mois', 'dates'], grammar: ['avoir + âge'], pronunciation: ['voyelles'], lessons: [
        { title: 'Dire son âge', objective: 'Give and ask age.', activities: ['dialogue', 'production écrite'] },
        { title: 'Les mois de l’année', objective: 'Name months and give a date.', activities: ['écoute', 'classement'] }
      ] },
      { title: 'Famille et amis', vocab: ['famille', 'relations'], grammar: ['adjectifs possessifs'], pronunciation: ['élision'], lessons: [
        { title: 'Présenter sa famille', objective: 'Introduce family members.', activities: ['image', 'production orale'] },
        { title: 'Décrire une personne', objective: 'Give simple physical descriptions.', activities: ['vocabulaire', 'production écrite'] }
      ] },
      { title: 'Adresse et contact', vocab: ['adresse', 'ville', 'téléphone'], grammar: ['prépositions de lieu'], pronunciation: ['rythme'], lessons: [
        { title: 'Donner son adresse', objective: 'Give a simple address.', activities: ['formulaire', 'interaction'] },
        { title: 'Demander des informations', objective: 'Ask for contact details.', activities: ['jeu de rôle'] }
      ] }
    ]
  },
  {
    title: 'Vie quotidienne', theme: 'Daily life', outcomes: [3, 6, 7],
    units: [
      { title: 'L’heure et l’emploi du temps', vocab: ['heures', 'activités quotidiennes'], grammar: ['verbes en -er'], pronunciation: ['intonation'], lessons: [
        { title: 'Dire l’heure', objective: 'Tell the time.', activities: ['écoute', 'production orale'] },
        { title: 'Décrire sa journée', objective: 'Describe a daily routine.', activities: ['séquence', 'production écrite'] }
      ] },
      { title: 'Nourriture et boissons', vocab: ['aliments', 'boissons'], grammar: ['articles partitifs'], pronunciation: ['nasales'], lessons: [
        { title: 'Au café', objective: 'Order food and drink.', activities: ['dialogue', 'jeu de rôle'] },
        { title: 'Les repas', objective: 'Name meals and preferences.', activities: ['vocabulaire', 'interaction'] }
      ] },
      { title: 'Lieux de la ville', vocab: ['lieux', 'directions'], grammar: ['impératif'], pronunciation: ['liaison'], lessons: [
        { title: 'Demander son chemin', objective: 'Ask for and give simple directions.', activities: ['carte', 'jeu de rôle'] },
        { title: 'Comprendre un plan', objective: 'Identify places on a simple map.', activities: ['écoute', 'association'] }
      ] }
    ]
  },
  {
    title: 'Loisirs et goûts', theme: 'Leisure and preferences', outcomes: [2, 4, 5],
    units: [
      { title: 'Activités et sports', vocab: ['loisirs', 'sports'], grammar: ['aimer + infinitif'], pronunciation: ['voyelles'], lessons: [
        { title: 'Exprimer ses goûts', objective: 'Express likes and dislikes.', activities: ['interaction', 'production écrite'] },
        { title: 'Parler de ses loisirs', objective: 'Describe free-time activities.', activities: ['écoute', 'production orale'] }
      ] },
      { title: 'Météo et saisons', vocab: ['météo', 'saisons'], grammar: ['il fait…'], pronunciation: ['rythme'], lessons: [
        { title: 'La météo du jour', objective: 'Describe the weather.', activities: ['écoute', 'production écrite'] },
        { title: 'Les saisons', objective: 'Talk about seasons and activities.', activities: ['vocabulaire', 'interaction'] }
      ] },
      { title: 'Invitations', vocab: ['invitations', 'sorties'], grammar: ['futur proche'], pronunciation: ['intonation'], lessons: [
        { title: 'Proposer une sortie', objective: 'Make and accept invitations.', activities: ['dialogue', 'jeu de rôle'] },
        { title: 'Fixer un rendez-vous', objective: 'Agree a time and place.', activities: ['interaction'] }
      ] }
    ]
  },
  {
    title: 'Environnement immédiat', theme: 'Immediate environment', outcomes: [3, 7, 9],
    units: [
      { title: 'Logement', vocab: ['pièces', 'meubles'], grammar: ['il y a'], pronunciation: ['élision'], lessons: [
        { title: 'Décrire son logement', objective: 'Describe where one lives.', activities: ['image', 'production écrite'] },
        { title: 'Les pièces de la maison', objective: 'Name rooms and furniture.', activities: ['vocabulaire', 'écoute'] }
      ] },
      { title: 'Travail et études', vocab: ['métiers', 'études'], grammar: ['verbes usuels'], pronunciation: ['liaison'], lessons: [
        { title: 'Parler de son travail', objective: 'State occupation or study.', activities: ['interaction', 'production orale'] },
        { title: 'Les lieux d’études', objective: 'Identify study places.', activities: ['lecture', 'association'] }
      ] },
      { title: 'Culture et fêtes', vocab: ['fêtes', 'traditions'], grammar: ['adjectifs'], pronunciation: ['voyelles'], lessons: [
        { title: 'Les fêtes francophones', objective: 'Recognise major cultural celebrations.', activities: ['lecture', 'discussion'] },
        { title: 'Comparer les traditions', objective: 'Note simple cultural similarities.', activities: ['interaction', 'culture'] }
      ] }
    ]
  },
  {
    title: 'Intégration et évaluation', theme: 'Integration and assessment', outcomes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    units: [
      { title: 'Révision intégrée', vocab: ['révision'], grammar: ['révision'], pronunciation: ['révision'], lessons: [
        { title: 'Tâche intégrée A1', objective: 'Complete a short integrated communicative task.', activities: ['tâche'] },
        { title: 'Préparation à l’évaluation', objective: 'Practise four-skill tasks.', activities: ['entraînement'] }
      ] },
      { title: 'Évaluation de niveau A1', vocab: [], grammar: [], pronunciation: [], lessons: [
        { title: 'Compréhension orale et écrite', objective: 'Demonstrate receptive skills.', activities: ['évaluation'] },
        { title: 'Production orale et écrite', objective: 'Demonstrate productive skills.', activities: ['évaluation'] }
      ] },
      { title: 'Préparation à l’examen', vocab: [], grammar: [], pronunciation: [], lessons: [
        { title: 'Format de l’examen', objective: 'Understand the certification examination format.', activities: ['orientation'] },
        { title: 'Stratégies d’examen', objective: 'Apply practical examination strategies.', activities: ['entraînement'] }
      ] }
    ]
  }
];

function buildFrenchA1Curriculum() {
  const academy = 'FR';
  const level = 'A1';
  const modules = [];
  FR_A1_MODULES.forEach((m, mi) => {
    const moduleId = 'FR-A1-M' + String(mi + 1).padStart(2, '0');
    const units = [];
    m.units.forEach((u, ui) => {
      const unitId = moduleId + '-U' + String(ui + 1).padStart(2, '0');
      const lessons = [];
      u.lessons.forEach((l, li) => {
        lessons.push({
          id: unitId + '-L' + String(li + 1).padStart(2, '0'),
          type: 'lesson',
          title: l.title,
          objective: l.objective,
          vocabularyFocus: u.vocab || [],
          grammarFocus: u.grammar || [],
          pronunciationFocus: u.pronunciation || [],
          activities: l.activities || [],
          outcomeIds: m.outcomes.map((n) => outcomeId(academy, level, n)),
          competencyIds: ['C-LIS', 'C-SPE', 'C-REA', 'C-WRI', 'C-INT'].slice(0, 3 + (li % 3)),
          estimatedMinutes: 45,
          status: 'DRAFT',
          contentState: 'DRAFT'
        });
      });
      units.push({
        id: unitId, type: 'unit', title: u.title, theme: m.theme,
        vocabularyFocus: u.vocab || [], grammarFocus: u.grammar || [], pronunciationFocus: u.pronunciation || [],
        culturalContext: 'Francophone contexts',
        outcomeIds: m.outcomes.map((n) => outcomeId(academy, level, n)),
        competencyIds: ['C-LIS', 'C-SPE', 'C-REA', 'C-WRI', 'C-INT', 'C-ICU'],
        lessons: lessons, status: 'DRAFT', contentState: 'DRAFT'
      });
    });
    modules.push({
      id: moduleId, type: 'module', title: m.title, description: m.theme,
      outcomes: m.outcomes.map((n) => outcomeId(academy, level, n)),
      competencyIds: ['C-LIS', 'C-SPE', 'C-REA', 'C-WRI', 'C-INT', 'C-GRA', 'C-VOC', 'C-PRO', 'C-ICU'],
      units: units, status: 'DRAFT', contentState: 'DRAFT'
    });
  });
  return {
    programmeId: 'prog_FR_A1', academyCode: academy, level: level,
    structure: 'Foundation → Development → Application → Integration → Assessment',
    modules: modules,
    contentState: 'DRAFT',
    note: 'French A1 pedagogical blueprint authored by ELA. Lesson bodies are not yet written; all lessons are DRAFT pending content authoring and academic review.'
  };
}

/* ---------- Squelette pour les autres programmes ----------
   Architecture présente ; contenu non fabriqué. Les nœuds sont
   marqués MISSING jusqu'à production et révision. */
function buildSkeletonCurriculum(academy, level) {
  const outcomes = buildOutcomes(academy, level).map((o) => o.id);
  const stages = ['Foundation', 'Development', 'Application', 'Integration', 'Assessment'];
  const modules = stages.map((stage, i) => ({
    id: academy + '-' + level + '-M' + String(i + 1).padStart(2, '0'),
    type: 'module',
    title: stage + ' — ' + ACADEMY_META[academy].language + ' ' + level,
    description: 'Curriculum stage placeholder; content not yet authored.',
    outcomes: outcomes,
    competencyIds: COMPETENCY_DOMAINS.map((c) => c.id),
    units: [],
    status: 'MISSING',
    contentState: 'MISSING'
  }));
  return {
    programmeId: 'prog_' + academy + '_' + level,
    academyCode: academy, level: level,
    structure: 'Foundation → Development → Application → Integration → Assessment',
    modules: modules,
    contentState: 'MISSING',
    note: 'Architecture defined; lesson content MISSING (to be authored and academically reviewed).'
  };
}

function buildCurriculum(academy, level) {
  // Contenu réel spécifique à la langue pour les 36 programmes (voir curriculum-content.js).
  const content = require('./curriculum-content.js');
  return content.buildLevelContent(academy, level);
}

/* ---------- Catalogue complet ---------- */
function buildFullFramework() {
  const framework = { programmes: [], outcomes: [], competencies: COMPETENCY_DOMAINS.slice(), assessmentBlueprints: [], examinationBlueprints: [], curricula: [] };
  for (const academy of Object.keys(FRAMEWORK_ALIGNMENTS)) {
    for (const level of FRAMEWORK_ALIGNMENTS[academy].levels) {
      framework.programmes.push(buildProgrammeDefinition(academy, level));
      framework.outcomes.push.apply(framework.outcomes, buildOutcomes(academy, level));
      framework.assessmentBlueprints.push(buildAssessmentBlueprint(academy, level));
      framework.examinationBlueprints.push(buildExaminationBlueprint(academy, level));
      framework.curricula.push(buildCurriculum(academy, level));
    }
  }
  framework.checksum = crypto.createHash('sha256')
    .update(JSON.stringify({ p: framework.programmes.map((x) => x.id), c: framework.curricula.map((x) => x.programmeId + ':' + x.contentState) }))
    .digest('hex');
  return framework;
}

module.exports = {
  COMPETENCY_DOMAINS,
  CEFR_LEVELS,
  LEVEL_DESCRIPTORS,
  FRAMEWORK_ALIGNMENTS,
  ACADEMY_META,
  WORKLOAD_BY_LEVEL,
  outcomeId,
  buildOutcomes,
  buildAssessmentBlueprint,
  buildExaminationBlueprint,
  buildProgrammeDefinition,
  buildFrenchA1Curriculum,
  buildSkeletonCurriculum,
  buildCurriculum,
  buildFullFramework
};
