'use strict';
/* ============================================================
   ELA — scripts/lib/plan.js
   Diff (dry-run) entre le dataset normalisé et l'état Firestore
   courant (lecture seule). Produit create/update/skip/conflict,
   doublons (naturels), orphelins, références manquantes, revue.
   Aucune écriture.
   ============================================================ */

const crypto = require('crypto');

const VOLATILE = new Set(['createdAt', 'updatedAt', 'hash']);
function stableHash(obj) {
  const clone = {};
  Object.keys(obj).sort().forEach((k) => { if (!VOLATILE.has(k)) clone[k] = obj[k]; });
  return crypto.createHash('sha256').update(JSON.stringify(clone)).digest('hex').slice(0, 16);
}

/* bande de niveau commune CEFR <-> HSK (pour rapprocher les clés naturelles) */
const BAND = {
  A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2',
  HSK1: 'A1', HSK2: 'A2', HSK3: 'B1', HSK4: 'B2', HSK5: 'C1', HSK6: 'C2',
};
function band(level) {
  const s = String(level || '').toUpperCase().replace(/\s/g, '');
  if (BAND[s]) return BAND[s];
  const m = s.match(/^(A1|A2|B1|B2|C1|C2)/);
  return m ? m[1] : s;
}

/* schéma d'ID de leçon : A = {ac}_a1_lesson_N (legacy), B = {courseId}-lN (canonique) */
function scheme(id) {
  if (/^[a-z]{2}_[a-z0-9]+_lesson_\d+$/i.test(id)) return 'A';
  if (/-l\d+$/.test(id)) return 'B';
  return 'other';
}

function naturalKey(name, d) {
  if (name === 'courses') return `${d.academyCode}|${band(d.level)}`;
  if (name === 'lessons') return `${d.academyCode}|${band(d.level)}|${d.order || d.lessonNumber || ''}`;
  if (name === 'quizzes') return `${d.academyCode}|${band(d.level)}`;
  return d.id;
}

function planCollection(name, desired, current) {
  const cur = {};
  current.forEach((d) => { cur[d.id] = d; });
  const curByNat = {};
  current.forEach((d) => { const k = naturalKey(name, d); (curByNat[k] = curByNat[k] || []).push(d.id); });

  const create = [], update = [], skip = [], conflict = [], alias = [];
  desired.forEach((d) => {
    const c = cur[d.id];
    if (c) {
      if (c.academyCode && d.academyCode && c.academyCode !== d.academyCode) { conflict.push({ id: d.id, reason: `academy mismatch ${c.academyCode} vs ${d.academyCode}` }); return; }
      if (c.hash && c.hash === stableHash(d)) { skip.push(d.id); return; }
      update.push(d.id); return;
    }
    // id absent : collision par clé naturelle avec un doc existant (id différent)
    const nat = naturalKey(name, d);
    const clash = curByNat[nat];
    if (clash && clash.length) {
      const ds = scheme(d.id);
      const allLegacy = clash.every((id) => scheme(id) === 'A');
      if (ds === 'B' && allLegacy) {
        // le doc existant est un ancien schéma A : alias legacy (le doc canonique est créé)
        alias.push({ id: d.id, legacyId: clash[0], reason: `legacy scheme-A alias (${nat})` });
        create.push(d.id);
      } else {
        conflict.push({ id: d.id, reason: `natural-key duplicate of existing ${clash.join(',')} (${nat})` });
      }
      return;
    }
    create.push(d.id);
  });

  const desiredIds = new Set(desired.map((d) => d.id));
  const orphanExisting = current.filter((d) => !desiredIds.has(d.id)).map((d) => d.id);

  // doublons naturels à l'intérieur du dataset
  const natMap = {};
  desired.forEach((d) => { const k = naturalKey(name, d); (natMap[k] = natMap[k] || []).push(d.id); });
  const dupNat = Object.entries(natMap).filter(([, v]) => v.length > 1).map(([k, v]) => ({ key: k, ids: v }));

  return {
    collection: name,
    create, update, skip,
    conflict, alias,
    duplicateNaturalKeys: dupNat,
    orphanExisting,
    counts: { desired: desired.length, create: create.length, update: update.length, skip: skip.length, conflict: conflict.length, alias: alias.length, orphanExisting: orphanExisting.length },
  };
}

function buildPlan(dataset, current) {
  return {
    courses: planCollection('courses', dataset.courses, current.courses || []),
    lessons: planCollection('lessons', dataset.lessons, current.lessons || []),
    quizzes: planCollection('quizzes', dataset.quizzes, current.quizzes || []),
  };
}

function manualReview(dataset) {
  const items = [];
  dataset.quizzes.filter((q) => !q.courseId).forEach((q) => items.push({ id: q.id, reason: 'quiz without courseId (level assessment C1/C2) — map to a course or keep level-only' }));
  (dataset.liveClasses || []).forEach((l, i) => items.push({ id: 'liveClass#' + (i + 1) + ' ' + (l.title || ''), reason: 'placeholder instructor from V7 seed — DATA_REQUIRED (not seeded)' }));
  return items;
}

module.exports = { buildPlan, stableHash, manualReview, band };
