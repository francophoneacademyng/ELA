/* ============================================================
   ELA — functions/curriculum-core.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Contrôle qualité automatisé du curriculum :
   références orphelines, IDs dupliqués, outcomes/compétences
   manquants, blueprints manquants, progressions invalides,
   conflits de version, contenu non publié lié à un programme actif.
   Plus : matrice de traçabilité et rapport de statut de contenu.
   ============================================================ */

const FRAMEWORK_LEVEL_ORDER = {
  FR: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  DE: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  ZH: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
  EN: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  AR: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  RU: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
};

function validateCurriculum(framework) {
  const errors = [];
  const warnings = [];
  const ids = new Map(); // id -> where
  function register(id, where) {
    if (!id) { errors.push('missing-id:' + where); return; }
    if (ids.has(id)) errors.push('duplicate-id:' + id + ' (' + ids.get(id) + ' & ' + where + ')');
    else ids.set(id, where);
  }

  const programmes = framework.programmes || [];
  const outcomes = framework.outcomes || [];
  const competencies = framework.competencies || [];
  const ab = framework.assessmentBlueprints || [];
  const eb = framework.examinationBlueprints || [];
  const curricula = framework.curricula || [];

  const programmeById = new Map();
  const competencyIds = new Set(competencies.map((c) => c.id));
  const outcomeById = new Map();

  for (const p of programmes) {
    register(p.id, 'programme');
    programmeById.set(p.id, p);
    if (!FRAMEWORK_LEVEL_ORDER[p.academyCode]) errors.push('invalid-academy:' + p.id);
    else if (FRAMEWORK_LEVEL_ORDER[p.academyCode].indexOf(p.level) < 0) errors.push('invalid-level:' + p.id + ':' + p.level);
  }
  for (const o of outcomes) {
    register(o.id, 'outcome');
    outcomeById.set(o.id, o);
    if (!competencyIds.has(o.skill)) errors.push('invalid-outcome-competency:' + o.id + ':' + o.skill);
  }
  for (const c of competencies) register(c.id, 'competency');
  for (const a of ab) {
    register(a.id, 'assessment-blueprint');
    if (!programmeById.has('prog_' + a.academyCode + '_' + a.level)) errors.push('assessment-blueprint-no-programme:' + a.id);
  }
  for (const e of eb) {
    register(e.id, 'examination-blueprint');
    if (!programmeById.has('prog_' + e.academyCode + '_' + e.level)) errors.push('examination-blueprint-no-programme:' + e.id);
    const total = (e.sections || []).reduce((s, x) => s + (x.weight || 0), 0);
    if (total !== 100) errors.push('examination-weight-not-100:' + e.id + ':' + total);
    const skills = (e.sections || []).map((s) => s.skill).sort().join(',');
    if (skills !== 'listening,reading,speaking,writing') errors.push('examination-missing-skill:' + e.id + ':' + skills);
  }

  for (const cur of curricula) {
    const progId = cur.programmeId;
    const prog = programmeById.get(progId);
    if (!prog) { errors.push('curriculum-no-programme:' + progId); continue; }
    if (prog.status === 'published' && cur.contentState !== 'READY') {
      warnings.push('published-programme-with-non-ready-content:' + progId + ':' + cur.contentState);
    }
    const moduleIds = new Set();
    for (const m of cur.modules || []) {
      register(m.id, 'module');
      if (moduleIds.has(m.id)) errors.push('duplicate-module:' + m.id);
      moduleIds.add(m.id);
      if (!(m.outcomes || []).length) errors.push('module-missing-outcomes:' + m.id);
      if (!(m.competencyIds || []).length) errors.push('module-missing-competencies:' + m.id);
      for (const oid of (m.outcomes || [])) if (!outcomeById.has(oid)) errors.push('module-unknown-outcome:' + m.id + ':' + oid);
      for (const cid of (m.competencyIds || [])) if (!competencyIds.has(cid)) errors.push('module-unknown-competency:' + m.id + ':' + cid);
      const unitIds = new Set();
      for (const u of m.units || []) {
        register(u.id, 'unit');
        if (unitIds.has(u.id)) errors.push('duplicate-unit:' + u.id);
        unitIds.add(u.id);
        if (!(u.outcomeIds || []).length && u.type === 'unit' && (u.lessons || []).length) errors.push('unit-missing-outcomes:' + u.id);
        for (const oid of (u.outcomeIds || [])) if (!outcomeById.has(oid)) errors.push('unit-unknown-outcome:' + u.id + ':' + oid);
        const lessonIds = new Set();
        for (const l of u.lessons || []) {
          register(l.id, 'lesson');
          if (lessonIds.has(l.id)) errors.push('duplicate-lesson:' + l.id);
          lessonIds.add(l.id);
          if (!l.objective) errors.push('lesson-missing-objective:' + l.id);
          if (!(l.outcomeIds || []).length) errors.push('lesson-missing-outcomes:' + l.id);
          if (!(l.competencyIds || []).length) errors.push('lesson-missing-competencies:' + l.id);
          for (const oid of (l.outcomeIds || [])) if (!outcomeById.has(oid)) errors.push('lesson-unknown-outcome:' + l.id + ':' + oid);
          for (const cid of (l.competencyIds || [])) if (!competencyIds.has(cid)) errors.push('lesson-unknown-competency:' + l.id + ':' + cid);
        }
      }
    }
  }

  // Cohérence des blueprints d'évaluation : un par programme.
  for (const p of programmes) {
    if (!ab.some((a) => a.academyCode === p.academyCode && a.level === p.level)) errors.push('programme-missing-assessment-blueprint:' + p.id);
    if (!eb.some((e) => e.academyCode === p.academyCode && e.level === p.level)) errors.push('programme-missing-examination-blueprint:' + p.id);
  }

  // Progression : un programme par niveau, dans l'ordre.
  for (const academy of Object.keys(FRAMEWORK_LEVEL_ORDER)) {
    const levels = FRAMEWORK_LEVEL_ORDER[academy];
    for (const lv of levels) {
      if (!programmes.some((p) => p.academyCode === academy && p.level === lv)) errors.push('missing-programme:' + academy + ':' + lv);
    }
  }

  return { ok: errors.length === 0, errors: errors, warnings: warnings, stats: { programmes: programmes.length, outcomes: outcomes.length, competencies: competencies.length, assessmentBlueprints: ab.length, examinationBlueprints: eb.length, curricula: curricula.length } };
}

/** Matrice de traçabilité : outcome → compétence → assessment → examen. */
function buildTraceabilityMatrix(framework) {
  const ebByProgramme = {};
  for (const e of framework.examinationBlueprints || []) ebByProgramme[e.academyCode + '_' + e.level] = e;
  const rows = [];
  for (const o of framework.outcomes || []) {
    const ex = ebByProgramme[o.academyCode + '_' + o.level];
    const section = ex ? (ex.sections || []).find((s) => (s.competencies || []).indexOf(o.skill) >= 0) : null;
    rows.push({
      outcomeId: o.id,
      academyCode: o.academyCode,
      level: o.level,
      competency: o.skill,
      examinationSection: section ? section.skill : null,
      examined: !!section
    });
  }
  return rows;
}

/** Rapport de statut de contenu par académie/niveau. */
function contentStatusReport(framework) {
  const report = { byProgramme: [], totals: { READY: 0, DRAFT: 0, REVIEW_REQUIRED: 0, MISSING: 0 }, modules: 0, units: 0, lessons: 0, outcomes: 0 };
  for (const cur of framework.curricula || []) {
    let modules = 0, units = 0, lessons = 0;
    for (const m of cur.modules || []) {
      modules++;
      for (const u of m.units || []) { units++; lessons += (u.lessons || []).length; }
    }
    report.modules += modules; report.units += units; report.lessons += lessons;
    const state = cur.contentState || 'MISSING';
    report.totals[state] = (report.totals[state] || 0) + 1;
    report.byProgramme.push({ programmeId: cur.programmeId, academyCode: cur.academyCode, level: cur.level, contentState: state, modules: modules, units: units, lessons: lessons });
  }
  report.outcomes = (framework.outcomes || []).length;
  return report;
}

/** Audit de qualité du contenu des leçons. Classe honnêtement :
 *   - empty          : objectif ou explication manquants
 *   - missingFields  : champs pédagogiques obligatoires absents
 *   - duplicates     : signatures de leçon identiques
 *   - authoredDraft  : leçon substantielle unique (contenu rédigé, non approuvé)
 *  Retourne aussi la diversité (explications/objectifs/exemples distincts). */
function auditLessonQuality(framework) {
  const required = ['objective', 'explanation', 'guidedPractice', 'independentPractice', 'assessment', 'masteryCriteria'];
  const lessons = [];
  for (const cur of framework.curricula || []) {
    for (const m of cur.modules || []) {
      for (const u of m.units || []) {
        for (const l of u.lessons || []) lessons.push(Object.assign({ academy: cur.academyCode, level: cur.level }, l));
      }
    }
  }
  let empty = 0, missingFields = 0, duplicates = 0, authoredDraft = 0;
  const sigs = new Set();
  const byAcademy = {};
  for (const l of lessons) {
    const a = l.academy;
    if (!byAcademy[a]) byAcademy[a] = { lessons: 0, empty: 0, duplicates: 0, authoredDraft: 0 };
    byAcademy[a].lessons++;
    const missing = required.filter((k) => !l[k] || String(l[k]).trim().length < 5).length +
      ((l.examples && l.examples.length >= 1) ? 0 : 1) +
      ((l.outcomeIds && l.outcomeIds.length) ? 0 : 1) +
      ((l.competencyIds && l.competencyIds.length) ? 0 : 1);
    if (!l.objective || !l.explanation) { empty++; byAcademy[a].empty++; continue; }
    if (missing > 0) missingFields++;
    const sig = [l.objective, l.explanation, (l.examples || []).join('|'), l.guidedPractice].join('#');
    if (sigs.has(sig)) { duplicates++; byAcademy[a].duplicates++; }
    else { sigs.add(sig); authoredDraft++; byAcademy[a].authoredDraft++; }
  }
  const distinct = (fn) => new Set(lessons.map(fn)).size;
  return {
    total: lessons.length,
    empty: empty,
    missingFields: missingFields,
    duplicates: duplicates,
    authoredDraft: authoredDraft,
    distinctExplanations: distinct((l) => l.explanation),
    distinctObjectives: distinct((l) => l.objective),
    distinctExampleSets: distinct((l) => (l.examples || []).join('||')),
    lessonTypes: distinct((l) => l.lessonType),
    byAcademy: byAcademy
  };
}

module.exports = { validateCurriculum, buildTraceabilityMatrix, contentStatusReport, auditLessonQuality, FRAMEWORK_LEVEL_ORDER };
