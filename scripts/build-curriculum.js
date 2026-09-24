'use strict';
/* ============================================================
   ELA — scripts/build-curriculum.js
   Construit l'arbre pédagogique (curriculum_nodes) pour les 36
   programmes :
     - SOURCE_DERIVED : modules/leçons issus du contenu réel
       (V7 pour le français, seed ELA pour les 5 autres, A1).
     - GENERATED_DRAFT : niveaux sans contenu source, générés par
       functions/curriculum-content.js (buildLevelContent).
   Produit scripts/data/ela-curriculum.json (aucune écriture Firestore).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(__dirname, 'data');
const content = require(path.join(ROOT, 'functions', 'curriculum-content.js'));
const fw = require(path.join(ROOT, 'functions', 'academic-framework.js'));

const KEY = { FR: 'french', DE: 'german', ZH: 'mandarin', EN: 'english', AR: 'arabic', RU: 'russian' };
const BAND = { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', HSK1: 'A1', HSK2: 'A2', HSK3: 'B1', HSK4: 'B2', HSK5: 'C1', HSK6: 'C2' };
const band = (l) => BAND[String(l || '').toUpperCase()] || l;
const pad = (n) => String(n).padStart(2, '0');

function main() {
  const dataset = JSON.parse(fs.readFileSync(path.join(DATA, 'ela-dataset.json'), 'utf8'));
  const v7 = JSON.parse(fs.readFileSync(path.join(DATA, 'v7-french.json'), 'utf8'));
  const framework = fw.buildFullFramework();
  const programmes = framework.programmes;

  const nodes = [];
  const outcomes = [];
  const stats = { perProgramme: [], generatedNodes: 0, sourceNodes: 0 };

  const COMP = framework.competencies.map((c) => c.id);

  for (const p of programmes) {
    const ac = p.academyCode, level = p.level, key = KEY[ac];
    const courses = dataset.courses.filter((c) => c.academyCode === ac && band(c.level) === band(level));
    const lessons = dataset.lessons.filter((l) => l.academyCode === ac && band(l.level) === band(level));
    let modCount = 0, lesCount = 0, src = 'GENERATED_DRAFT';

    if (ac === 'FR' && band(level) === 'A1' && (v7.weeklyPlan || []).length) {
      // A1 français : 12 modules = plan hebdomadaire V7 (SOURCE_DERIVED) + leçons V7
      src = 'SOURCE_DERIVED';
      const weeks = v7.weeklyPlan;
      weeks.forEach((w, mi) => {
        const mId = `${p.id}-M${pad(mi + 1)}`;
        const outs = (w.objectives || []).map((o, oi) => {
          const oid = `${mId}-LO-${oi + 1}`;
          outcomes.push({ id: oid, academyCode: ac, level, statement: o, skill: 'C-SPE', sourceType: 'SOURCE_DERIVED', sourceAcademy: 'Francophone Academy', sourceVersion: 'V7' });
          return oid;
        });
        nodes.push({ id: mId, programmeId: p.id, academyCode: ac, level, type: 'module', parentId: null, order: mi + 1, title: w.title, description: w.subtitle || '', duration: w.duration || '', vocabularyCount: w.vocabCount || 0, competencyIds: COMP, outcomeIds: outs, state: 'DRAFT', sourceType: 'SOURCE_DERIVED', sourceAcademy: 'Francophone Academy', sourceVersion: 'V7' });
        modCount++;
        // 5 leçons V7 A1 rattachées aux modules 1..5
        if (mi < 5) {
          const l = lessons.filter((x) => x.courseId === 'french-foundations-a1').sort((a, b) => a.order - b.order)[mi];
          if (l) {
            nodes.push({ id: `${mId}-L01`, programmeId: p.id, academyCode: ac, level, type: 'lesson', parentId: mId, order: 1, title: l.title, objective: '', vocabularyFocus: l.vocabulary || [], grammarFocus: [], pronunciationFocus: [], culturalContext: '', activities: [], competencyIds: COMP, outcomeIds: [], state: 'DRAFT', sourceType: 'SOURCE_DERIVED', sourceAcademy: 'Francophone Academy', sourceVersion: 'V7', lessonRef: l.id });
            lesCount++;
          }
        }
      });
    } else if (courses.length) {
      // Niveaux avec contenu réel : module = cours, leçon = leçon
      src = 'SOURCE_DERIVED';
      courses.forEach((c, mi) => {
        const mId = `${p.id}-M${pad(mi + 1)}`;
        const outs = (c.learningOutcomes || []).map((o, oi) => {
          const oid = `${mId}-LO-${oi + 1}`;
          outcomes.push({ id: oid, academyCode: ac, level, statement: o, skill: 'C-SPE', sourceType: c.sourceType, sourceAcademy: c.sourceAcademy, sourceVersion: c.sourceVersion });
          return oid;
        });
        nodes.push({ id: mId, programmeId: p.id, academyCode: ac, level, type: 'module', parentId: null, order: mi + 1, title: c.title, description: c.description || '', durationMinutes: c.durationMinutes || 0, competencyIds: COMP, outcomeIds: outs, state: 'DRAFT', sourceType: c.sourceType, sourceAcademy: c.sourceAcademy, sourceVersion: c.sourceVersion, courseRef: c.id });
        modCount++;
        lessons.filter((l) => l.courseId === c.id).sort((a, b) => a.order - b.order).forEach((l, li) => {
          nodes.push({ id: `${mId}-L${pad(li + 1)}`, programmeId: p.id, academyCode: ac, level, type: 'lesson', parentId: mId, order: li + 1, title: l.title, objective: l.description || '', vocabularyFocus: l.vocabulary || [], grammarFocus: [], pronunciationFocus: [], culturalContext: '', activities: [], competencyIds: COMP, outcomeIds: [], state: 'DRAFT', sourceType: l.sourceType, sourceAcademy: l.sourceAcademy, sourceVersion: l.sourceVersion, lessonRef: l.id });
          lesCount++;
        });
      });
    } else {
      // Niveau sans contenu source : généré (GENERATED_DRAFT)
      src = 'GENERATED_DRAFT';
      const cur = content.buildLevelContent(ac, level);
      (cur.modules || []).forEach((m, mi) => {
        const mId = `${p.id}-M${pad(mi + 1)}`;
        nodes.push({ id: mId, programmeId: p.id, academyCode: ac, level, type: 'module', parentId: null, order: mi + 1, title: m.title, description: m.description || '', competencyIds: m.competencyIds || COMP, outcomeIds: m.outcomes || [], state: 'DRAFT', sourceType: 'GENERATED_DRAFT', sourceAcademy: 'ELA', sourceVersion: 'ELA-generated' });
        modCount++;
        (m.units || []).forEach((u, ui) => {
          const uId = `${mId}-U${pad(ui + 1)}`;
          nodes.push({ id: uId, programmeId: p.id, academyCode: ac, level, type: 'unit', parentId: mId, order: ui + 1, title: u.title, theme: u.theme || '', vocabularyFocus: u.vocabularyFocus || [], grammarFocus: u.grammarFocus || [], pronunciationFocus: u.pronunciationFocus || [], culturalContext: u.culturalContext || '', competencyIds: u.competencyIds || COMP, outcomeIds: u.outcomeIds || [], state: 'DRAFT', sourceType: 'GENERATED_DRAFT', sourceAcademy: 'ELA', sourceVersion: 'ELA-generated' });
          (u.lessons || []).forEach((l, li) => {
            nodes.push({
              id: `${uId}-L${pad(li + 1)}`, programmeId: p.id, academyCode: ac, level, type: 'lesson', parentId: uId, order: li + 1,
              lessonType: l.lessonType || '', lessonTypeName: l.lessonTypeName || '',
              title: l.title, objective: l.objective || '',
              prerequisites: l.prerequisites || [], estimatedDuration: l.estimatedDuration || 45,
              explanation: l.explanation || '',
              languageContent: l.languageContent || [],
              examples: l.examples || [],
              dialogue: l.dialogue || [],
              guidedPractice: l.guidedPractice || '',
              independentPractice: l.independentPractice || '',
              interaction: l.interaction || '',
              assessment: l.assessment || '',
              masteryCriteria: l.masteryCriteria || '',
              vocabularyFocus: l.vocabularyFocus || l.vocabulary || [],
              grammarFocus: l.grammarFocus || l.grammar || [],
              pronunciationFocus: l.pronunciationFocus || l.pronunciation || [],
              culturalContext: l.culturalContext || '',
              activities: l.activities || [],
              exercises: l.activities || [],
              competencyIds: l.competencyIds || COMP, outcomeIds: l.outcomeIds || [],
              state: 'DRAFT', sourceType: 'GENERATED_DRAFT', sourceAcademy: 'ELA', sourceVersion: 'ELA-generated',
            });
            lesCount++;
          });
        });
      });
    }
    stats.perProgramme.push({ academy: ac, programme: p.id, level, modules: modCount, lessons: lesCount, source: src });
  }

  const nodeCount = nodes.length;
  stats.sourceNodes = nodes.filter((n) => n.sourceType === 'SOURCE_DERIVED').length;
  stats.generatedNodes = nodes.filter((n) => n.sourceType === 'GENERATED_DRAFT').length;

  const out = {
    meta: { builtAt: new Date().toISOString(), programmeCount: programmes.length, nodeCount, sourceNodes: stats.sourceNodes, generatedNodes: stats.generatedNodes, outcomeCount: outcomes.length + framework.outcomes.length, sourceOutcomeCount: outcomes.length, frameworkOutcomeCount: framework.outcomes.length, competencyCount: COMP.length, assessmentBlueprintCount: framework.assessmentBlueprints.length },
    nodes, outcomes,
    frameworkOutcomes: framework.outcomes.map((o) => ({ id: o.id, academyCode: o.academyCode, level: o.level, skill: o.skill, statement: o.statement, measurable: o.measurable === true, status: 'APPROVED', sourceType: 'SOURCE_DERIVED', sourceAcademy: 'ELA' })),
    competencies: framework.competencies.map((c) => Object.assign({}, c, { sourceType: 'SOURCE_DERIVED', sourceAcademy: 'ELA' })),
    assessmentBlueprints: framework.assessmentBlueprints.map((b) => Object.assign({}, b, { sourceType: 'SOURCE_DERIVED', sourceAcademy: 'ELA' })),
    perProgramme: stats.perProgramme,
  };
  fs.writeFileSync(path.join(DATA, 'ela-curriculum.json'), JSON.stringify(out, null, 2));
  console.log('WROTE scripts/data/ela-curriculum.json');
  console.log('nodes=' + nodeCount, '(source=' + stats.sourceNodes + ', generated=' + stats.generatedNodes + ')', 'outcomes=' + outcomes.length, 'competencies=' + COMP.length, 'blueprints=' + framework.assessmentBlueprints.length);
}
main();
