'use strict';
/* ============================================================
   ELA — scripts/audit-content.js
   Audit LECTURE SEULE de la profondeur de contenu pédagogique en
   production (curriculum_nodes + lessons + quizzes).
   Aucune écriture. Sortie JSON : scripts/data/content-audit.json
   ============================================================ */

const fs = require('fs');
const path = require('path');
const rest = require('./lib/firestore-rest.js');

const ACADEMIES = ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'];
const FIELDS = ['objective', 'activities', 'vocabularyFocus', 'grammarFocus', 'pronunciationFocus', 'culturalContext', 'explanation', 'examples', 'dialogue', 'guidedPractice', 'independentPractice', 'assessment', 'masteryCriteria'];

async function main() {
  const t = await rest.accessToken();
  const [nodes, lessons, quizzes, programmes] = await Promise.all([
    rest.listAll('curriculum_nodes', t), rest.listAll('lessons', t),
    rest.listAll('quizzes', t), rest.listAll('programmes', t),
  ]);
  const lessonById = {}; lessons.forEach((l) => { lessonById[l.id] = l; });

  const byAcademy = {};
  ACADEMIES.forEach((a) => { byAcademy[a] = { nodes: 0, modules: 0, units: 0, lessons: 0, source: 0, generated: 0, lessonsWithRef: 0, lessonsWithoutRef: 0, fieldPop: {}, lessonsWithRealBody: 0, lessonsMetadataOnly: 0 }; });

  nodes.forEach((n) => {
    const a = byAcademy[n.academyCode]; if (!a) return;
    a.nodes++;
    if (n.type === 'module') a.modules++;
    if (n.type === 'unit') a.units++;
    if (n.sourceType === 'SOURCE_DERIVED') a.source++; else a.generated++;
    if (n.type === 'lesson') {
      a.lessons++;
      if (n.lessonRef) a.lessonsWithRef++; else a.lessonsWithoutRef++;
      FIELDS.forEach((f) => { const v = n[f]; const has = Array.isArray(v) ? v.length > 0 : (v != null && v !== ''); if (has) a.fieldPop[f] = (a.fieldPop[f] || 0) + 1; });
      const ref = n.lessonRef ? lessonById[n.lessonRef] : null;
      const realBody = ref ? ((ref.content || '').length > 50 || (ref.vocabulary || []).length > 0) : false;
      if (realBody) a.lessonsWithRealBody++; else a.lessonsMetadataOnly++;
    }
  });

  // FR source lessons (V7) depth
  const frLessons = lessons.filter((l) => l.academyCode === 'FR');
  const frLessonDepth = {
    count: frLessons.length,
    withContent: frLessons.filter((l) => (l.content || '').length > 50).length,
    emptyContent: frLessons.filter((l) => !(l.content || '').length).length,
    avgContentLen: Math.round(frLessons.reduce((s, l) => s + (l.content || '').length, 0) / (frLessons.length || 1)),
    withVocabulary: frLessons.filter((l) => (l.vocabulary || []).length > 0).length,
  };

  const quizzesByAcademy = {};
  quizzes.forEach((q) => { const k = q.academy || '?'; quizzesByAcademy[k] = (quizzesByAcademy[k] || 0) + 1; });

  const out = {
    generatedAt: new Date().toISOString(),
    totals: { nodes: nodes.length, lessons: lessons.length, quizzes: quizzes.length, programmes: programmes.length },
    byAcademy, frLessonDepth, quizzesByAcademy,
  };
  fs.writeFileSync(path.join(__dirname, 'data', 'content-audit.json'), JSON.stringify(out, null, 2));

  console.log('=== CONTENT DEPTH AUDIT ===');
  for (const a of ACADEMIES) {
    const x = byAcademy[a];
    console.log(`\n${a}: nodes=${x.nodes} (modules=${x.modules} units=${x.units} lessons=${x.lessons}) source=${x.source} generated=${x.generated}`);
    console.log(`   lessonRef: ${x.lessonsWithRef} | generated(no ref): ${x.lessonsWithoutRef} | realBody(via lessons)=${x.lessonsWithRealBody} | metadataOnly=${x.lessonsMetadataOnly}`);
    console.log('   lesson fieldPop: ' + JSON.stringify(x.fieldPop));
  }
  console.log('\nFR lessons (V7 source):', JSON.stringify(frLessonDepth));
  console.log('quizzes by academy:', JSON.stringify(quizzesByAcademy));
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
