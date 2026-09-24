'use strict';
/* ============================================================
   ELA — scripts/seed-generated-lessons.js
   ------------------------------------------------------------
   Intègre les 972 leçons GÉNÉRÉES (curriculum_nodes) dans la
   collection `lessons` (consommée par l'élève) et crée les cours
   de niveau correspondants. Corrige aussi le statut des leçons
   SOURCE_DERIVED existantes (published → approved) pour que
   l'entitlement (règles `canStudentReadContent`) fonctionne.

   - IDs stables et déterministes, upsert idempotent (merge),
     allowlist de champs, AUCUNE suppression.
   - Sauvegarde de `courses` + `lessons` avant toute écriture.
   Usage: node scripts/seed-generated-lessons.js --confirm
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const admin = require(path.join(ROOT, 'functions', 'node_modules', 'firebase-admin'));
const rest = require('./lib/firestore-rest.js');
const { LEVEL_VOCAB } = require(path.join(ROOT, 'functions', 'curriculum-vocabulary.js'));
const content = require(path.join(ROOT, 'functions', 'curriculum-content.js'));
const fw = require(path.join(ROOT, 'functions', 'academic-framework.js'));

const args = process.argv.slice(2);
if (!args.includes('--confirm')) { console.log('ABORT: --confirm required.'); process.exit(2); }
const SA_PATH = process.env.ELA_SA || path.join(ROOT, 'service-account.json.json');
if (!fs.existsSync(SA_PATH)) { console.log('ABORT: service account not found.'); process.exit(2); }

const ACADEMY_KEY = { FR: 'french', DE: 'german', ZH: 'mandarin', EN: 'english', AR: 'arabic', RU: 'russian' };
const ACADEMY_NAME = { FR: 'Francophone Academy', DE: 'Germanophone Academy', ZH: 'Sinophone Academy', EN: 'Anglophone Pro Academy', AR: 'Arabophone Academy', RU: 'Russophone Academy' };

const COURSE_ALLOWED = ['academy', 'academyCode', 'language', 'title', 'description', 'level', 'category', 'order', 'learningOutcomes', 'status', 'sourceAcademy', 'sourceVersion', 'sourceType', 'programmeId'];
const LESSON_ALLOWED = ['academy', 'academyCode', 'academyName', 'courseId', 'level', 'order', 'title', 'description', 'content', 'vocabulary', 'grammar', 'exercises', 'objectives', 'isTrial', 'trialAccess', 'status', 'sourceAcademy', 'sourceVersion', 'sourceType', 'programmeId', 'lessonType', 'lessonTypeName', 'quizId'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function pick(c, d) { const o = {}; for (const k of (c === 'courses' ? COURSE_ALLOWED : LESSON_ALLOWED)) if (d[k] !== undefined) o[k] = d[k]; return o; }
function levelSlug(l) { return String(l || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

/* Lookup terme cible → glose anglaise (banque A1/A2 + LEVEL_VOCAB). */
function buildGloss() {
  const g = {};
  for (const L of Object.values(content.LANGUAGES)) {
    for (const m of (L.modules || [])) for (const [w, gloss] of (m.vocab || [])) g[w] = gloss;
  }
  for (const band of Object.values(LEVEL_VOCAB)) {
    for (const themes of Object.values(band)) for (const lang of Object.values(themes)) for (const [w, gloss] of lang) g[w] = gloss;
  }
  return g;
}

/* Corps de leçon HTML (pédagogique) à partir des champs du nœud généré. */
function buildContentHtml(l) {
  const p = [];
  if (l.explanation) p.push('<p class="lc-intro">' + esc(l.explanation) + '</p>');
  if (l.examples && l.examples.length) {
    p.push('<h3 class="lc-h3">Examples</h3><table class="lc-table">' +
      l.examples.map((e) => '<tr><td>' + esc(e) + '</td></tr>').join('') + '</table>');
  }
  if (l.dialogue && l.dialogue.length) {
    p.push('<div class="lc-dialogue"><div class="lc-dialogue-title">Dialogue</div><p>' + l.dialogue.map(esc).join('<br>') + '</p></div>');
  }
  if (l.pronunciationFocus && l.pronunciationFocus.length) p.push('<h3 class="lc-h3">Pronunciation</h3><p>' + l.pronunciationFocus.map(esc).join(' · ') + '</p>');
  if (l.culturalContext) p.push('<h3 class="lc-h3">Cultural context</h3><p>' + esc(l.culturalContext) + '</p>');
  if (l.masteryCriteria) p.push('<div class="lc-recap"><strong>Mastery criteria:</strong> ' + esc(l.masteryCriteria) + '</div>');
  return p.join('\n');
}

function buildExercises(l) {
  return [l.guidedPractice, l.independentPractice, l.assessment].filter((x) => x && String(x).trim());
}

function buildVocabulary(l, gloss) {
  return (l.languageContent || l.vocabularyFocus || []).map((w) => ({ word: w, translation: gloss[w] || '' }));
}

async function main() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();

  const curriculum = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ela-curriculum.json'), 'utf8'));
  const framework = fw.buildFullFramework();
  const gloss = buildGloss();
  const outcomesById = {};
  for (const o of framework.outcomes) outcomesById[o.id] = o.statement;
  const progByKey = {};
  for (const p of framework.programmes) progByKey[p.academyCode + '|' + p.level] = p;

  /* 1. Sauvegarde (lecture seule) de courses + lessons. */
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'data', 'backup', stamp + '-generated-lessons');
  fs.mkdirSync(backupDir, { recursive: true });
  const token = await rest.accessToken();
  const beforeCourses = await rest.listAll('courses', token);
  const beforeLessons = await rest.listAll('lessons', token);
  fs.writeFileSync(path.join(backupDir, 'courses.json'), JSON.stringify(beforeCourses, null, 2));
  fs.writeFileSync(path.join(backupDir, 'lessons.json'), JSON.stringify(beforeLessons, null, 2));
  console.log('BACKUP:', backupDir, '(courses=' + beforeCourses.length + ', lessons=' + beforeLessons.length + ')');

  const audit = { timestamp: new Date().toISOString(), project: rest.PROJECT, actor: 'seed-generated-lessons', courses: [], lessons: [], statusFixed: [] };
  const now = admin.firestore.FieldValue.serverTimestamp();
  const CHUNK = 450;

  /* 2. Correction du statut des leçons existantes (published → approved). */
  const toFix = beforeLessons.filter((l) => l.status === 'published');
  for (let i = 0; i < toFix.length; i += CHUNK) {
    const batch = db.batch();
    for (const l of toFix.slice(i, i + CHUNK)) {
      batch.update(db.collection('lessons').doc(l.id), { status: 'approved', seedUpdatedAt: now });
      audit.statusFixed.push(l.id);
    }
    await batch.commit();
  }
  console.log('STATUS FIXED (published→approved):', audit.statusFixed.length);

  /* 3. Générer les leçons (GENERATED_DRAFT) groupées par (académie, niveau). */
  const genLessons = curriculum.nodes.filter((n) => n.type === 'lesson' && n.sourceType === 'GENERATED_DRAFT');
  const groups = {};
  for (const n of genLessons) {
    const k = n.academyCode + '|' + n.level;
    (groups[k] = groups[k] || []).push(n);
  }
  for (const k of Object.keys(groups)) groups[k].sort((a, b) => String(a.id).localeCompare(String(b.id)));

  /* Construit tous les documents de leçons + cours (en mémoire) puis écrit par lots. */
  const courseDocs = [];
  const lessonRows = [];

  for (const [k, lessons] of Object.entries(groups)) {
    const [ac, level] = k.split('|');
    const key = ACADEMY_KEY[ac] || 'other';
    const courseId = key + '-' + levelSlug(level) + '-programme';
    const prog = progByKey[k] || {};
    const courseOutcomes = (prog.learningOutcomes || [])
      .map((oid) => outcomesById[oid] || oid)
      .filter((x) => typeof x === 'string' && x.length);

    courseDocs.push({
      id: courseId,
      doc: {
        academy: key, academyCode: ac, language: prog.language || ACADEMY_NAME[ac],
        title: prog.title || (ACADEMY_NAME[ac] + ' ' + level + ' Programme'),
        description: prog.description || ('Institutional ' + ACADEMY_NAME[ac] + ' programme at ' + level + '.'),
        level: level, category: 'programme', order: 0,
        learningOutcomes: courseOutcomes, status: 'approved',
        sourceAcademy: 'ELA', sourceVersion: 'ELA-generated', sourceType: 'GENERATED_DRAFT', programmeId: prog.id || ('prog_' + ac + '_' + level)
      }
    });
    audit.courses.push({ id: courseId, academyCode: ac, level, lessons: lessons.length });

    lessons.forEach((l, li) => {
      const order = li + 1;
      const lessonId = courseId + '-l' + order;
      const quizId = (ac === 'FR' && (level === 'C1' || level === 'C2')) ? 'french-level-' + levelSlug(level) + '-quiz' : null;
      const doc = {
        academy: key, academyCode: ac, academyName: ACADEMY_NAME[ac], courseId: courseId,
        level: level, order: order, title: l.title || '',
        description: l.objective || '',
        content: buildContentHtml(l),
        vocabulary: buildVocabulary(l, gloss),
        grammar: l.grammarFocus || [],
        exercises: buildExercises(l),
        objectives: l.objective ? [l.objective] : [],
        isTrial: false,
        status: 'approved',
        sourceAcademy: 'ELA', sourceVersion: 'ELA-generated', sourceType: 'GENERATED_DRAFT',
        programmeId: prog.id || ('prog_' + ac + '_' + level),
        lessonType: l.lessonType || '', lessonTypeName: l.lessonTypeName || ''
      };
      if (quizId) doc.quizId = quizId;
      lessonRows.push({ id: lessonId, doc: doc });
      audit.lessons.push({ id: lessonId, academyCode: ac, level, order });
    });
  }

  /* 4. Écriture par lots (cours). */
  for (let i = 0; i < courseDocs.length; i += CHUNK) {
    const batch = db.batch();
    for (const c of courseDocs.slice(i, i + CHUNK)) {
      batch.set(db.collection('courses').doc(c.id), Object.assign(pick('courses', c.doc), { seedUpdatedAt: now }), { merge: true });
    }
    await batch.commit();
  }

  /* 5. Écriture par lots (leçons), avec détection create/update via getAll. */
  for (let i = 0; i < lessonRows.length; i += CHUNK) {
    const chunk = lessonRows.slice(i, i + CHUNK);
    const refs = chunk.map((r) => db.collection('lessons').doc(r.id));
    const snaps = await db.getAll(...refs);
    const batch = db.batch();
    chunk.forEach((r, j) => {
      const data = Object.assign(pick('lessons', r.doc), { seedUpdatedAt: now });
      if (!snaps[j].exists) data.seedCreatedAt = now;
      batch.set(refs[j], data, { merge: true });
    });
    await batch.commit();
  }

  const auditPath = path.join(__dirname, 'data', 'generated-lessons-seed-audit-' + stamp + '.json');
  fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));
  console.log('\nCOURSES WRITTEN:', courseDocs.length);
  console.log('LESSONS WRITTEN:', lessonRows.length);
  console.log('STATUS FIXED:', audit.statusFixed.length);
  console.log('AUDIT:', auditPath);
}

main().then(() => { console.log('DONE.'); process.exit(0); }).catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
