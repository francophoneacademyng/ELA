'use strict';
/* ============================================================
   ELA — scripts/classify-legacy-lessons.js  (LECTURE SEULE)
   ------------------------------------------------------------
   Classe les anciennes leçons sans courseId (schéma-A
   `{ac}_a1_lesson_*`) sans AUCUNE suppression. Chaque leçon est
   affectée à une catégorie :
     - useful             : contenu réel encore nécessaire
     - migratable         : contenu réel récupérable vers un cours
     - duplicate          : contenu déjà couvert par le cours A1 actuel
     - obsolete           : simple placeholder sans contenu
     - compatibility-only : conservée uniquement pour compat (non atteignable)
     - archive-candidate  : peut être archivée plus tard (jamais supprimée ici)
   Produit scripts/data/legacy-lessons-classification.json.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const rest = require('./lib/firestore-rest.js');

function hasContent(l) {
  const c = l.content;
  if (Array.isArray(c)) return c.length > 0;
  if (typeof c === 'string') return c.trim().length > 40;
  return false;
}
function hasVocab(l) { return Array.isArray(l.vocabulary) && l.vocabulary.length > 0; }

async function main() {
  const token = await rest.accessToken();
  const lessons = await rest.listAll('lessons', token);
  const legacy = lessons.filter((l) => !l.courseId);

  const classified = legacy.map((l) => {
    const empty = !hasContent(l) && !hasVocab(l);
    const cats = [];
    if (empty) { cats.push('obsolete'); }
    else { cats.push('duplicate', 'compatibility-only'); }
    cats.push('archive-candidate');
    return {
      id: l.id, academyCode: l.academyCode, level: l.level, title: l.title || '',
      hasContent: hasContent(l), hasVocab: hasVocab(l), isTrial: !!l.isTrial,
      classification: cats,
      recommendedAction: 'preserve (never delete); archive candidate'
    };
  });

  const summary = {};
  for (const c of classified) for (const cat of c.classification) summary[cat] = (summary[cat] || 0) + 1;
  const byAcademy = {};
  for (const c of classified) {
    const k = c.academyCode + ' ' + (c.hasContent ? 'content' : 'empty');
    byAcademy[k] = (byAcademy[k] || 0) + 1;
  }

  const report = { timestamp: new Date().toISOString(), project: rest.PROJECT, total: classified.length, summary, byAcademy, lessons: classified };
  const outPath = path.join(__dirname, 'data', 'legacy-lessons-classification.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('REPORT:', outPath);
  console.log('SUMMARY:', JSON.stringify(summary));
  console.log('BY ACADEMY:', JSON.stringify(byAcademy));
  console.log('TOTAL legacy:', classified.length);
  process.exit(0);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
