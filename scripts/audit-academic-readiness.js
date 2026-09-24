'use strict';
/* ============================================================
   ELA — scripts/audit-academic-readiness.js  (LECTURE SEULE)
   ------------------------------------------------------------
   Audit de QUALITÉ pédagogique + préparation de package de revue
   académique + calcul de readiness technique par programme.

   Aucune écriture production. Produit :
     - scripts/data/academic-readiness-report.json
     - scripts/data/academic-review-package.json
   Chaque vérification est réelle (contenu scanné, pas de comptage pur).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const rest = require('./lib/firestore-rest.js');
const content = require(path.join('..', 'functions', 'curriculum-content.js'));

const ACADEMIES = ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'];
const BAND = { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', HSK1: 'A1', HSK2: 'A2', HSK3: 'B1', HSK4: 'B2', HSK5: 'C1', HSK6: 'C2' };
const bandOf = (l) => BAND[String(l || '').toUpperCase()] || String(l || '');

// Scripts cibles par académie (vérifie que le contenu porte bien l'écriture de la langue).
const SCRIPT = {
  FR: { re: /[a-zA-Zà-ÿÀ-ÝœŒ]/ , label: 'Latin (French)' },
  DE: { re: /[a-zA-ZäöüßÄÖÜ]/, label: 'Latin (German)' },
  ZH: { re: /[\u4e00-\u9fff]/, label: 'CJK' },
  EN: { re: /[a-zA-Z]/, label: 'Latin (English)' },
  AR: { re: /[\u0600-\u06ff]/, label: 'Arabic' },
  RU: { re: /[\u0400-\u04ff]/, label: 'Cyrillic' }
};

// Indices de "fuite" du méta-langage français dans les académies non-FR.
const FRENCH_LEAK_WORDS = ['grammatical', 'ciblé', 'apprenants', 'structure cible', 'contenu ciblé', 'Focus grammatical', 'Les apprenants', 'Écoute/lis', 'unité'];

function hasTargetScript(ac, text) {
  if (!text) return false;
  return SCRIPT[ac].re.test(text);
}

function lessonScriptText(l) {
  const parts = [];
  if (typeof l.content === 'string') parts.push(l.content);
  if (Array.isArray(l.examples)) parts.push(l.examples.join(' '));
  if (Array.isArray(l.languageContent)) parts.push(l.languageContent.join(' '));
  if (Array.isArray(l.vocabularyFocus)) parts.push(l.vocabularyFocus.join(' '));
  if (Array.isArray(l.vocabulary)) parts.push(l.vocabulary.map((v) => (typeof v === 'string' ? v : (v.word || v.term || ''))).join(' '));
  return parts.join(' ');
}

function frenchLeak(text) {
  if (!text) return [];
  const found = [];
  for (const w of FRENCH_LEAK_WORDS) if (text.indexOf(w) >= 0) found.push(w);
  return found;
}

async function main() {
  const token = await rest.accessToken();
  const courses = await rest.listAll('courses', token);
  const lessons = await rest.listAll('lessons', token);
  const quizzes = await rest.listAll('quizzes', token);
  const programmes = await rest.listAll('programmes', token);
  const nodes = await rest.listAll('curriculum_nodes', token);
  const outcomes = await rest.listAll('learning_outcomes', token);
  const competencies = await rest.listAll('competencies', token);
  const blueprints = await rest.listAll('assessment_blueprints', token);

  const quizByAcLevel = {};
  for (const q of quizzes) {
    const k = (q.academyCode || q.academy || '') + '|' + (q.level || '');
    quizByAcLevel[k] = (quizByAcLevel[k] || 0) + 1;
  }

  // Leçons atteignables (avec courseId) et leur corps.
  const reachable = lessons.filter((l) => l.courseId);
  const courseMap = {};
  for (const c of courses) courseMap[c.id] = c;

  const report = { timestamp: new Date().toISOString(), project: rest.PROJECT, academies: {}, summary: {} };

  for (const ac of ACADEMIES) {
    const acLessons = reachable.filter((l) => l.academyCode === ac);
    const acNodes = nodes.filter((n) => n.academyCode === ac && n.type === 'lesson');
    const acCourses = courses.filter((c) => c.academyCode === ac);

    // ---- script authenticity (leçons générées) ----
    let scriptChecked = 0, scriptOk = 0, scriptFail = 0;
    const scriptFailSamples = [];
    for (const l of acLessons) {
      if (l.sourceType !== 'GENERATED_DRAFT') continue;
      const text = lessonScriptText(l);
      if (!text) continue;
      scriptChecked++;
      if (hasTargetScript(ac, text)) scriptOk++;
      else { scriptFail++; if (scriptFailSamples.length < 5) scriptFailSamples.push(l.id); }
    }

    // ---- fuite de méta-langage français (non-FR uniquement) ----
    let leakChecked = 0, leakFound = 0;
    const leakSamples = [];
    if (ac !== 'FR') {
      for (const l of acLessons) {
        if (l.sourceType !== 'GENERATED_DRAFT') continue;
        const text = lessonScriptText(l);
        const leaks = frenchLeak(text);
        leakChecked++;
        if (leaks.length) { leakFound++; if (leakSamples.length < 5) leakSamples.push({ id: l.id, leaks }); }
      }
    }

    // ---- duplication (signatures d'exemples / d'objectifs) ----
    const exampleSigs = new Set(), exampleDups = 0;
    const objectiveSigs = new Set(), objectiveDups = 0;
    for (const l of acLessons) {
      if (l.sourceType !== 'GENERATED_DRAFT') continue;
      const ex = Array.isArray(l.examples) ? l.examples.join('||') : '';
      if (ex) { if (exampleSigs.has(ex)) exampleDups++; else exampleSigs.add(ex); }
      const obj = String(l.objectives && l.objectives[0] || l.objective || '');
      if (obj) { if (objectiveSigs.has(obj)) objectiveDups++; else objectiveSigs.add(obj); }
    }

    // ---- corps vides / vocabulaire / exercices ----
    let emptyContent = 0, noVocab = 0, noExercises = 0;
    for (const l of acLessons) {
      if (l.sourceType !== 'GENERATED_DRAFT') continue;
      const c = l.content;
      const contentLen = Array.isArray(c) ? c.length : (typeof c === 'string' ? c.trim().length : 0);
      if (contentLen < 40) emptyContent++;
      if (!Array.isArray(l.vocabulary) || !l.vocabulary.length) noVocab++;
      if (!Array.isArray(l.exercises) || !l.exercises.length) noExercises++;
    }

    // ---- couverture par niveau ----
    const levels = {};
    for (const l of acLessons) {
      const lv = l.level || '?';
      levels[lv] = levels[lv] || { lessons: 0, generated: 0, source: 0, quizCoverage: (quizByAcLevel[ac + '|' + lv] || 0) };
      levels[lv].lessons++;
      if (l.sourceType === 'GENERATED_DRAFT') levels[lv].generated++; else levels[lv].source++;
    }

    report.academies[ac] = {
      courses: acCourses.length,
      reachableLessons: acLessons.length,
      lessonNodes: acNodes.length,
      script: { checked: scriptChecked, ok: scriptOk, fail: scriptFail, samples: scriptFailSamples },
      frenchLeak: ac === 'FR' ? { n: 0, checked: 0 } : { checked: leakChecked, found: leakFound, samples: leakSamples },
      duplicates: { exampleDups: exampleDups, objectiveDups: objectiveDups, distinctExamples: exampleSigs.size },
      bodyQuality: { emptyContent: emptyContent, noVocab: noVocab, noExercises: noExercises },
      levels: levels
    };
  }

  // ---- readiness technique par programme ----
  const programmeReadiness = [];
  for (const p of programmes) {
    const ac = p.academyCode, lv = p.level;
    const course = courses.filter((c) => c.academyCode === ac && c.level === lv);
    const acLessons = reachable.filter((l) => l.academyCode === ac && l.level === lv);
    const genLessons = acLessons.filter((l) => l.sourceType === 'GENERATED_DRAFT');
    const emptyGen = genLessons.filter((l) => {
      const c = l.content;
      const len = Array.isArray(c) ? c.length : (typeof c === 'string' ? c.trim().length : 0);
      return len < 40;
    }).length;
    const hasQuiz = (quizByAcLevel[ac + '|' + lv] || 0) > 0;
    const hasBlueprint = blueprints.some((b) => b.id === 'AB-' + ac + '-' + lv || (b.academyCode === ac && b.level === lv));
    const nodeCount = nodes.filter((n) => n.academyCode === ac && n.level === lv).length;
    const outcomeCount = outcomes.filter((o) => o.academyCode === ac && o.level === lv).length;

    const issues = [];
    if (!course.length) issues.push('no-course');
    if (!acLessons.length) issues.push('no-lessons');
    if (emptyGen > 0) issues.push('empty-lesson-bodies=' + emptyGen);
    if (!hasQuiz) issues.push('no-quiz');
    if (!hasBlueprint) issues.push('no-assessment-blueprint');
    if (!nodeCount) issues.push('no-curriculum-nodes');
    if (!outcomeCount) issues.push('no-learning-outcomes');

    const techReady = issues.length === 0;
    programmeReadiness.push({
      programmeId: p.id, academyCode: ac, level: lv, status: p.status,
      courses: course.length, lessons: acLessons.length, generated: genLessons.length,
      nodes: nodeCount, outcomes: outcomeCount, hasQuiz: hasQuiz, hasBlueprint: hasBlueprint,
      techPrerequisitesMet: techReady, issues: issues
    });
  }

  const techReadyCount = programmeReadiness.filter((r) => r.techPrerequisitesMet).length;
  report.summary = {
    academies: ACADEMIES.length,
    reachableLessons: reachable.length,
    lessons: lessons.length,
    courses: courses.length,
    quizzes: quizzes.length,
    programmes: programmes.length,
    nodes: nodes.length,
    outcomes: outcomes.length,
    competencies: competencies.length,
    blueprints: blueprints.length,
    legacyLessons: lessons.filter((l) => !l.courseId).length,
    programmesTechReady: techReadyCount,
    programmesTotal: programmeReadiness.length
  };
  report.programmeReadiness = programmeReadiness;

  const out1 = path.join(__dirname, 'data', 'academic-readiness-report.json');
  fs.writeFileSync(out1, JSON.stringify(report, null, 2));
  console.log('REPORT:', out1);

  // ---- Package de revue académique ----
  const pkg = buildReviewPackage(report, programmes, courses, outcomes, competencies, blueprints);
  const out2 = path.join(__dirname, 'data', 'academic-review-package.json');
  fs.writeFileSync(out2, JSON.stringify(pkg, null, 2));
  console.log('PACKAGE:', out2);

  console.log('SUMMARY:', JSON.stringify(report.summary));
  console.log('PROGRAMMES TECH READY:', techReadyCount + '/' + programmeReadiness.length);
  for (const ac of ACADEMIES) {
    const a = report.academies[ac];
    console.log('  ' + ac + ': script ' + a.script.ok + '/' + a.script.checked + ' | leak ' + a.frenchLeak.found + ' | dupEx ' + a.duplicates.exampleDups + ' | empty ' + a.bodyQuality.emptyContent);
  }
  process.exit(0);
}

function buildReviewPackage(report, programmes, courses, outcomes, competencies, blueprints) {
  const pkg = {
    generatedAt: new Date().toISOString(),
    purpose: 'Academic review package — enables a qualified human reviewer to assess content efficiently. Automated validation only; NO human approval claimed.',
    academies: {}
  };
  for (const p of programmes) {
    const ac = p.academyCode, lv = p.level;
    if (!pkg.academies[ac]) pkg.academies[ac] = { levels: [] };
    const r = report.programmeReadiness.find((x) => x.programmeId === p.id) || {};
    const acOutcomes = outcomes.filter((o) => o.academyCode === ac && o.level === lv);
    const acBlueprint = blueprints.filter((b) => b.academyCode === ac && b.level === lv);
    pkg.academies[ac].levels.push({
      level: lv,
      programmeId: p.id,
      status: p.status,
      contentState: (p.contentState || p.status),
      reviewStatus: (['C1', 'C2', 'HSK5', 'HSK6'].indexOf(lv) >= 0) ? 'REVIEW_REQUIRED' : 'READY_FOR_ACADEMIC_REVIEW',
      lessons: r.lessons || 0,
      learningOutcomes: acOutcomes.map((o) => o.id),
      competencies: (competencies || []).map((c) => c.id),
      assessmentBlueprint: acBlueprint.length ? acBlueprint.map((b) => b.id) : [],
      hasLevelQuiz: r.hasQuiz || false,
      techPrerequisitesMet: r.techPrerequisitesMet || false,
      issues: r.issues || [],
      humanReviewChecklist: humanChecklist(ac, lv)
    });
  }
  return pkg;
}

function humanChecklist(ac, lv) {
  const lang = { FR: 'French', DE: 'German', ZH: 'Mandarin', EN: 'English', AR: 'Arabic', RU: 'Russian' }[ac];
  const advanced = ['C1', 'C2', 'HSK5', 'HSK6'].indexOf(lv) >= 0;
  const c = [
    'Verify ' + lang + ' spelling, grammar and register at ' + lv + '.',
    'Confirm vocabulary is level-appropriate (no A1 recycling).',
    'Check example sentences for naturalness and correctness.',
    'Validate dialogue authenticity and cultural context.',
    'Confirm exercises align with the stated learning objectives.'
  ];
  if (advanced) c.push('Specialist review of advanced/idiomatic content (C1/C2 or HSK5/6).');
  return c;
}

main().catch((e) => { console.error('AUDIT FAILED:', e.message); process.exit(1); });
