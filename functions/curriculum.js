/* ============================================================
   ELA — functions/curriculum.js
   ------------------------------------------------------------
   Cloud Functions du curriculum institutionnel (Phase 23).
   Source de vérité académique : academic-framework.js (versionné
   dans le code). Le seed écrit les définitions dans Firestore.
   Collections :
     competencies, learning_outcomes, assessment_blueprints,
     examination_blueprints, rubrics, programmes, programme_versions,
     curriculum_nodes
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const fw = require('./academic-framework.js');
const qa = require('./curriculum-core.js');
const authz = require('./authz.js');
const publicationPolicy = require('./publication-policy.js');

const REGION = 'africa-south1';
const COMPETENCIES = 'competencies';
const OUTCOMES = 'learning_outcomes';
const ASSESSMENT_BP = 'assessment_blueprints';
const EXAM_BP = 'examination_blueprints';
const RUBRICS = 'rubrics';
const PROGRAMMES = 'programmes';
const VERSIONS = 'programme_versions';
const NODES = 'curriculum_nodes';

function uidOf(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  return uid;
}
function fail(code, msg) { throw new HttpsError(code, msg); }
async function requireAdmin(uid) {
  const role = await authz.getUserRole(uid);
  if (role !== 'admin' && role !== 'system') fail('permission-denied', 'Admin/system only.');
  return role;
}
async function requireStaff(uid) {
  const role = await authz.getUserRole(uid);
  if (['teacher', 'examiner', 'admin', 'system'].indexOf(role) < 0) fail('permission-denied', 'Staff only.');
  return role;
}

/** Aplatit le curriculum en nœuds avec parentId pour Firestore. */
function flattenCurriculum(cur) {
  const nodes = [];
  for (const m of cur.modules || []) {
    nodes.push({ id: m.id, programmeId: cur.programmeId, academyCode: cur.academyCode, level: cur.level, version: 1, type: 'module', parentId: null, title: m.title, description: m.description || '', order: nodes.length, outcomeIds: m.outcomes || [], competencyIds: m.competencyIds || [], state: m.contentState || 'MISSING' });
    for (const u of m.units || []) {
      nodes.push({ id: u.id, programmeId: cur.programmeId, academyCode: cur.academyCode, level: cur.level, version: 1, type: 'unit', parentId: m.id, title: u.title, theme: u.theme || '', vocabularyFocus: u.vocabularyFocus || [], grammarFocus: u.grammarFocus || [], pronunciationFocus: u.pronunciationFocus || [], culturalContext: u.culturalContext || '', outcomeIds: u.outcomeIds || [], competencyIds: u.competencyIds || [], state: u.contentState || 'MISSING', order: nodes.length });
      for (const l of u.lessons || []) {
        nodes.push({ id: l.id, programmeId: cur.programmeId, academyCode: cur.academyCode, level: cur.level, version: 1, type: 'lesson', parentId: u.id, title: l.title, objective: l.objective || '', vocabularyFocus: l.vocabularyFocus || [], grammarFocus: l.grammarFocus || [], pronunciationFocus: l.pronunciationFocus || [], activities: l.activities || [], outcomeIds: l.outcomeIds || [], competencyIds: l.competencyIds || [], estimatedMinutes: l.estimatedMinutes || 45, state: l.contentState || 'MISSING', order: nodes.length });
      }
    }
  }
  return nodes;
}

exports.seedAcademicFramework = callable({ region: REGION, timeoutSeconds: 300 }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const db = admin.firestore();
  const framework = fw.buildFullFramework();
  let written = { competencies: 0, outcomes: 0, programmes: 0, versions: 0, nodes: 0, assessmentBlueprints: 0, examinationBlueprints: 0, rubrics: 0 };

  for (const c of framework.competencies) { await db.collection(COMPETENCIES).doc(c.id).set(Object.assign({ status: 'APPROVED' }, c), { merge: true }); written.competencies++; }
  for (const o of framework.outcomes) { await db.collection(OUTCOMES).doc(o.id).set(o, { merge: true }); written.outcomes++; }
  for (const a of framework.assessmentBlueprints) { await db.collection(ASSESSMENT_BP).doc(a.id).set(a, { merge: true }); written.assessmentBlueprints++; }
  for (const e of framework.examinationBlueprints) {
    await db.collection(EXAM_BP).doc(e.id).set(e, { merge: true }); written.examinationBlueprints++;
    for (const s of (e.sections || [])) {
      if (s.rubric && s.rubric.length) {
        const rid = e.id + '-' + s.id;
        await db.collection(RUBRICS).doc(rid).set({ id: rid, examinationBlueprintId: e.id, skill: s.skill, criteria: s.rubric, scale: { min: 0, max: 5 }, status: 'APPROVED' }, { merge: true });
        written.rubrics++;
      }
    }
  }

  for (const p of framework.programmes) {
    await db.collection(PROGRAMMES).doc(p.id).set(Object.assign({}, p, { currentVersion: 1 }), { merge: true });
    written.programmes++;
    const cur = framework.curricula.find((x) => x.programmeId === p.id);
    const nodes = flattenCurriculum(cur || { programmeId: p.id, academyCode: p.academyCode, level: p.level, modules: [] });
    const version = {
      programmeId: p.id, version: 1, status: 'draft',
      title: p.title, outcomes: p.learningOutcomes, requirements: {
        requiredLessonPercent: 100, requiredAssessmentIds: [], attendanceRequired: false,
        requiresFinalExamination: true, requiredSkills: ['listening', 'reading', 'writing', 'speaking'], passMark: 60
      },
      // Snapshot de structure : permet à computeProgression de lire les nœuds de la version
      // sans dépendre de la collection curriculum_nodes (traçabilité du parcours étudiant).
      nodes: nodes.map((n) => ({ id: n.id, programmeId: n.programmeId, version: 1, type: n.type, parentId: n.parentId, title: n.title, order: n.order, state: n.state, outcomeIds: n.outcomeIds || [], competencyIds: n.competencyIds || [] })),
      contentState: cur ? cur.contentState : 'MISSING',
      structure: cur ? cur.structure : '',
      createdBy: uid, createdAt: new Date().toISOString(), publishedAt: null
    };
    await db.collection(VERSIONS).doc(p.id + '_v1').set(version, { merge: true });
    written.versions++;
    for (const n of nodes) { await db.collection(NODES).doc(n.id).set(n, { merge: true }); written.nodes++; }
  }
  return { ok: true, written: written, checksum: framework.checksum };
});

exports.getProgrammeDefinition = callable({ region: REGION }, async (request) => {
  uidOf(request);
  const d = request.data || {};
  const programmeId = String(d.programmeId || '').trim();
  if (!programmeId) fail('invalid-argument', 'programmeId required.');
  const db = admin.firestore();
  const pSnap = await db.collection(PROGRAMMES).doc(programmeId).get();
  if (!pSnap.exists) fail('not-found', 'Programme not found.');
  const p = pSnap.data();
  const outcomes = await db.collection(OUTCOMES).where('academyCode', '==', p.academyCode).where('level', '==', p.level).get();
  const ab = (await db.collection(ASSESSMENT_BP).doc('AB-' + p.academyCode + '-' + p.level).get());
  const eb = (await db.collection(EXAM_BP).doc('EX-' + p.academyCode + '-' + p.level).get());
  return {
    programme: p,
    outcomes: outcomes.docs.map((x) => x.data()),
    assessmentBlueprint: ab.exists ? ab.data() : null,
    examinationBlueprint: eb.exists ? eb.data() : null
  };
});

exports.getCurriculum = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const programmeId = String(d.programmeId || '');
  const db = admin.firestore();
  const snap = await db.collection(NODES).where('programmeId', '==', programmeId).limit(2000).get();
  const all = snap.docs.map((x) => x.data());
  // Le client ne voit que le contenu READY/DRAFT ; jamais les métadonnées internes de révision.
  const visible = all.filter((n) => n.state === 'READY' || n.state === 'DRAFT');
  const byParent = {};
  for (const n of visible) { const k = n.parentId || 'root'; (byParent[k] = byParent[k] || []).push(n); }
  function build(parentId) {
    return (byParent[parentId] || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((n) => Object.assign({}, n, { children: build(n.id) }));
  }
  return { programmeId: programmeId, modules: build('root'), counts: { total: all.length, visible: visible.length } };
});

exports.validateCurriculumCallable = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const framework = fw.buildFullFramework();
  const report = qa.validateCurriculum(framework);
  return { ok: report.ok, errors: report.errors, warnings: report.warnings, stats: report.stats };
});

exports.getContentStatusReport = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const framework = fw.buildFullFramework();
  return qa.contentStatusReport(framework);
});

exports.auditLessonContentQuality = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const framework = fw.buildFullFramework();
  return qa.auditLessonQuality(framework);
});

exports.getTraceabilityMatrix = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireStaff(uid);
  const framework = fw.buildFullFramework();
  return { matrix: qa.buildTraceabilityMatrix(framework) };
});

/** Publication : refusée si le contenu n'est pas READY (garde d'honnêteté). */
exports.publishProgrammeContent = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const programmeId = String(d.programmeId || '');
  const db = admin.firestore();
  const pRef = db.collection(PROGRAMMES).doc(programmeId);
  const pSnap = await pRef.get();
  if (!pSnap.exists) fail('not-found', 'Programme not found.');
  const p = pSnap.data();
  const framework = fw.buildFullFramework();
  const cur = framework.curricula.find((x) => x.programmeId === programmeId);
  const decision = publicationPolicy.canPublishContent(cur ? cur.contentState : 'MISSING');
  if (!decision.ok) fail('failed-precondition', 'Curriculum content is ' + decision.state + '; only READY content may be published.');
  await pRef.update({ status: 'published', qualityReviewStatus: 'APPROVED', updatedAt: new Date().toISOString() });
  await db.collection(VERSIONS).doc(programmeId + '_v' + p.currentVersion).update({ status: 'published', publishedAt: new Date().toISOString() });
  return { ok: true, programmeId: programmeId, status: 'published' };
});

exports._collections = { COMPETENCIES, OUTCOMES, ASSESSMENT_BP, EXAM_BP, RUBRICS, PROGRAMMES, VERSIONS, NODES };
