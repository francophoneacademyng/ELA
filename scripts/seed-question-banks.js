'use strict';
/* ============================================================
   ELA — scripts/seed-question-banks.js
   ------------------------------------------------------------
   Crée les banques de questions de NIVEAU manquantes
   (DE/ZH/EN/AR/RU A2–C2, ZH HSK2–HSK6) et relie les leçons
   générées à leur quiz de niveau.

   - Vocabulaire : MCQ générées depuis LEVEL_VOCAB / banque de
     base (terme → glose) — 100 % fiable, sans invention.
   - Grammaire : MCQ rédigées (functions/quiz-bank-grammar.js).
   - correctIndex stocké CÔTÉ SERVEUR uniquement (jamais exposé).
   - IDs stables, merge idempotent, AUCUNE suppression.
   Usage: node scripts/seed-question-banks.js --confirm
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const admin = require(path.join(ROOT, 'functions', 'node_modules', 'firebase-admin'));
const rest = require('./lib/firestore-rest.js');
const { LEVEL_VOCAB } = require(path.join(ROOT, 'functions', 'curriculum-vocabulary.js'));
const content = require(path.join(ROOT, 'functions', 'curriculum-content.js'));
const { QUIZ_BANK_GRAMMAR } = require(path.join(ROOT, 'functions', 'quiz-bank-grammar.js'));

const args = process.argv.slice(2);
if (!args.includes('--confirm')) { console.log('ABORT: --confirm required.'); process.exit(2); }
const SA_PATH = process.env.ELA_SA || path.join(ROOT, 'service-account.json.json');
if (!fs.existsSync(SA_PATH)) { console.log('ABORT: service account not found.'); process.exit(2); }

const KEY = { FR: 'french', DE: 'german', ZH: 'mandarin', EN: 'english', AR: 'arabic', RU: 'russian' };
const NAME = { FR: 'Francophone Academy', DE: 'Germanophone Academy', ZH: 'Sinophone Academy', EN: 'Anglophone Pro Academy', AR: 'Arabophone Academy', RU: 'Russophone Academy' };
const BAND = { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', HSK1: 'A1', HSK2: 'A2', HSK3: 'B1', HSK4: 'B2', HSK5: 'C1', HSK6: 'C2' };
const DIFF = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 5 };

function levelSlug(l) { return String(l || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function bandOf(l) { return BAND[String(l || '').toUpperCase()] || l; }

/* Vocabulaire (terme → glose) disponible par académie/niveau. */
function vocabPool(academy, level) {
  const band = bandOf(level);
  const L = content.LANGUAGES[academy];
  const pool = [];
  if (band === 'A2' || band === 'A1') {
    for (const m of (L.modules || [])) for (const [w, g] of (m.vocab || [])) pool.push([w, g]);
  }
  const themeKey = Object.keys(LEVEL_VOCAB[band] || {});
  for (const t of themeKey) {
    const lang = (LEVEL_VOCAB[band][t] && LEVEL_VOCAB[band][t][academy]) || [];
    for (const [w, g] of lang) pool.push([w, g]);
  }
  return pool;
}

/* MCQ vocabulaire : "What does X mean?" avec 3 leurres du même pool. */
function vocabQuestions(academy, level) {
  const pool = vocabPool(academy, level);
  if (!pool.length) return [];
  const out = [];
  const diff = DIFF[bandOf(level)] || 3;
  const seen = new Set();
  for (const [w, g] of pool) {
    if (seen.has(w) || !w || !g) continue;
    seen.add(w);
    const distractors = pool.filter((p) => p[0] !== w && p[1] !== g).map((p) => p[1]);
    const uniq = [];
    for (const d of distractors) { if (uniq.indexOf(d) < 0) uniq.push(d); if (uniq.length >= 3) break; }
    if (uniq.length < 3) continue;
    const options = [g, uniq[0], uniq[1], uniq[2]];
    const correctIndex = 0;
    out.push({ text: 'What does "' + w + '" mean?', options: options, correctIndex: correctIndex, explanation: '"' + w + '" means "' + g + '".', points: 5, skill: 'vocabulary', difficulty: diff });
  }
  return out;
}

async function main() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'data', 'backup', stamp + '-question-banks');
  fs.mkdirSync(backupDir, { recursive: true });
  const token = await rest.accessToken();
  const beforeQuizzes = await rest.listAll('quizzes', token);
  const beforeLessons = await rest.listAll('lessons', token);
  fs.writeFileSync(path.join(backupDir, 'quizzes.json'), JSON.stringify(beforeQuizzes, null, 2));
  fs.writeFileSync(path.join(backupDir, 'lessons.json'), JSON.stringify(beforeLessons, null, 2));
  console.log('BACKUP:', backupDir, '(quizzes=' + beforeQuizzes.length + ', lessons=' + beforeLessons.length + ')');

  const now = admin.firestore.FieldValue.serverTimestamp();
  const audit = { quizzes: [], lessonsLinked: [] };

  const targets = {};
  for (const ac of ['DE', 'ZH', 'EN', 'AR', 'RU']) {
    const levels = ac === 'ZH' ? ['HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] : ['A2', 'B1', 'B2', 'C1', 'C2'];
    for (const lv of levels) {
      const band = bandOf(lv);
      const grammar = (QUIZ_BANK_GRAMMAR[ac] && QUIZ_BANK_GRAMMAR[ac][lv]) || [];
      const vocab = vocabQuestions(ac, lv);
      const questions = grammar.concat(vocab.slice(0, 10 - grammar.length >= 0 ? 10 - grammar.length : 5));
      targets[ac + '|' + lv] = { band: band, questions: questions };
    }
  }

  const quizRows = [];
  const quizIdByKey = {};
  for (const [k, t] of Object.entries(targets)) {
    const [ac, lv] = k.split('|');
    const key = KEY[ac];
    const quizId = key + '-level-' + levelSlug(lv) + '-quiz';
    quizIdByKey[k] = quizId;
    const quiz = {
      academy: key, academyCode: ac, level: lv,
      title: NAME[ac] + ' ' + lv + ' Level Assessment',
      category: 'level', passingScore: 80, timeLimit: 20, isTrial: false,
      courseId: null, lessonId: null, status: 'approved',
      questions: t.questions,
      sourceType: 'GENERATED_DRAFT', sourceAcademy: 'ELA', sourceVersion: 'ELA-generated'
    };
    quizRows.push({ id: quizId, doc: quiz });
    audit.quizzes.push({ id: quizId, academyCode: ac, level: lv, questions: t.questions.length });
  }

  /* Écriture des quizzes par lots. */
  const CHUNK = 450;
  for (let i = 0; i < quizRows.length; i += CHUNK) {
    const batch = db.batch();
    for (const r of quizRows.slice(i, i + CHUNK)) {
      const data = Object.assign({}, r.doc, { seedUpdatedAt: now });
      const ref = db.collection('quizzes').doc(r.id);
      batch.set(ref, data, { merge: true });
    }
    await batch.commit();
  }
  console.log('QUIZZES WRITTEN:', quizRows.length);

  /* Relie les leçons générées à leur quiz de niveau. */
  const linkUpdates = [];
  for (const l of beforeLessons) {
    const key = l.academyCode + '|' + l.level;
    const quizId = quizIdByKey[key];
    if (quizId && l.courseId && l.sourceType === 'GENERATED_DRAFT' && l.quizId !== quizId) {
      linkUpdates.push({ id: l.id, quizId: quizId });
    }
  }
  for (let i = 0; i < linkUpdates.length; i += CHUNK) {
    const batch = db.batch();
    for (const u of linkUpdates.slice(i, i + CHUNK)) {
      batch.update(db.collection('lessons').doc(u.id), { quizId: u.quizId, seedUpdatedAt: now });
    }
    await batch.commit();
  }
  audit.lessonsLinked = linkUpdates.length;
  console.log('LESSONS LINKED TO QUIZ:', linkUpdates.length);

  const auditPath = path.join(__dirname, 'data', 'question-banks-audit-' + stamp + '.json');
  fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));
  console.log('AUDIT:', auditPath);
}

main().then(() => { console.log('DONE.'); process.exit(0); }).catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
