'use strict';
/* ============================================================
   ELA — scripts/curriculum-dry-run.js
   Dry-run du curriculum : diff entre scripts/data/ela-curriculum.json
   et Firestore (lecture seule) + validation des relations.
   Aucune écriture.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { stableHash } = require('./lib/plan.js');
const rest = require('./lib/firestore-rest.js');

const DATA = path.join(__dirname, 'data');

function diff(name, desired, current) {
  const cur = {}; current.forEach((d) => { cur[d.id] = d; });
  const create = [], update = [], skip = [], conflict = [];
  desired.forEach((d) => {
    const c = cur[d.id];
    if (!c) { create.push(d.id); return; }
    if (c.hash && c.hash === stableHash(d)) { skip.push(d.id); return; }
    update.push(d.id);
  });
  const desiredIds = new Set(desired.map((d) => d.id));
  const orphanExisting = current.filter((d) => !desiredIds.has(d.id)).map((d) => d.id);
  return { collection: name, counts: { desired: desired.length, create: create.length, update: update.length, skip: skip.length, conflict: conflict.length, orphanExisting: orphanExisting.length }, create, update, skip, conflict, orphanExisting };
}

async function main() {
  const cur = JSON.parse(fs.readFileSync(path.join(DATA, 'ela-curriculum.json'), 'utf8'));
  const token = await rest.accessToken();
  const [nodes, outcomes, competencies, blueprints, programmes] = await Promise.all([
    rest.listAll('curriculum_nodes', token), rest.listAll('learning_outcomes', token),
    rest.listAll('competencies', token), rest.listAll('assessment_blueprints', token),
    rest.listAll('programmes', token),
  ]);

  const plan = {
    curriculum_nodes: diff('curriculum_nodes', cur.nodes, nodes),
    learning_outcomes: diff('learning_outcomes', cur.outcomes.concat(cur.frameworkOutcomes), outcomes),
    competencies: diff('competencies', cur.competencies, competencies),
    assessment_blueprints: diff('assessment_blueprints', cur.assessmentBlueprints, blueprints),
  };

  // validation relations
  const progIds = new Set(programmes.map((p) => p.id));
  const nodeIds = new Set(cur.nodes.map((n) => n.id));
  const outcomeIds = new Set(cur.frameworkOutcomes.map((o) => o.id).concat(cur.outcomes.map((o) => o.id)));
  const issues = [];
  let lessonNodes = 0, moduleNodes = 0, unitNodes = 0;
  cur.nodes.forEach((n) => {
    if (!progIds.has(n.programmeId)) issues.push({ level: 'FAIL', code: 'node.programme', detail: `${n.id} programmeId ${n.programmeId} missing` });
    if (n.type === 'module' && n.parentId !== n.programmeId) issues.push({ level: 'WARN', code: 'node.parent', detail: `${n.id} module parent != programme` });
    if (n.type === 'lesson') { lessonNodes++; if (n.parentId && !nodeIds.has(n.parentId)) issues.push({ level: 'FAIL', code: 'node.orphan', detail: `${n.id} parent ${n.parentId} missing` }); }
    if (n.type === 'module') moduleNodes++;
    if (n.type === 'unit') unitNodes++;
    (n.outcomeIds || []).forEach((o) => { if (!outcomeIds.has(o)) issues.push({ level: 'WARN', code: 'node.outcome', detail: `${n.id} outcome ${o} missing` }); });
  });
  const byAcademy = {};
  cur.nodes.forEach((n) => { const k = n.academyCode; byAcademy[k] = byAcademy[k] || { nodes: 0, source: 0, generated: 0 }; byAcademy[k].nodes++; byAcademy[k][n.sourceType === 'SOURCE_DERIVED' ? 'source' : 'generated']++; });

  const report = {
    generatedAt: new Date().toISOString(),
    nodeCounts: { total: cur.nodes.length, modules: moduleNodes, units: unitNodes, lessons: lessonNodes, source: cur.meta.sourceNodes, generated: cur.meta.generatedNodes },
    outcomes: { source: cur.meta.sourceOutcomeCount, framework: cur.meta.frameworkOutcomeCount, total: cur.meta.outcomeCount },
    competencies: cur.competencies.length, assessmentBlueprints: cur.assessmentBlueprints.length,
    byAcademy, plan, issues,
    perProgramme: cur.perProgramme,
    counts: Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, v.counts])),
  };
  fs.writeFileSync(path.join(DATA, 'curriculum-dry-run.json'), JSON.stringify(report, null, 2));

  console.log('=== CURRICULUM DRY-RUN ===');
  console.log('nodes: total=' + cur.nodes.length + ' modules=' + moduleNodes + ' units=' + unitNodes + ' lessons=' + lessonNodes + ' (source=' + cur.meta.sourceNodes + ', generated=' + cur.meta.generatedNodes + ')');
  console.log('outcomes: source=' + cur.meta.sourceOutcomeCount + ' framework=' + cur.meta.frameworkOutcomeCount + ' total=' + cur.meta.outcomeCount);
  console.log('competencies=' + cur.competencies.length + ' assessmentBlueprints=' + cur.assessmentBlueprints.length);
  console.log('\nper academy:'); Object.keys(byAcademy).sort().forEach((k) => console.log('  ' + k + ': nodes=' + byAcademy[k].nodes + ' source=' + byAcademy[k].source + ' generated=' + byAcademy[k].generated));
  console.log('\nplan:');
  for (const [k, v] of Object.entries(plan)) console.log('  ' + k + ': create=' + v.counts.create + ' update=' + v.counts.update + ' skip=' + v.counts.skip + ' conflict=' + v.counts.conflict + ' orphanExisting=' + v.counts.orphanExisting);
  const fails = issues.filter((i) => i.level === 'FAIL');
  console.log('\nvalidation: FAIL=' + fails.length + ' WARN=' + (issues.length - fails.length));
  fails.slice(0, 10).forEach((i) => console.log('  FAIL ' + i.code + ': ' + i.detail));
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
