/**
 * ELA — SÉCURITÉ ÉLÈVE (mission business logic + security) — tests statiques
 * locaux, sans émulateur, sans production. Vérifie :
 *  - la protection du corrigé (getPublicQuiz sans correctIndex, plus aucune
 *    lecture étudiante directe de quizzes),
 *  - le remappage des réponses vers l'ordre de la tentative serveur,
 *  - l'append-only de progress/{uid} (anti-fabrication de progression),
 *  - la non-régression du socle secure assessment.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..', '..');
var rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
var core = fs.readFileSync(path.join(root, 'functions', 'core.js'), 'utf8');
var index = fs.readFileSync(path.join(root, 'functions', 'index.js'), 'utf8');
var app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

/* Q1 — Le callable getPublicQuiz existe et est exporté. */
check('S1 getPublicQuiz défini dans core.js', core.indexOf('exports.getPublicQuiz = onCall') !== -1);
check('S2 getPublicQuiz exporté dans index.js', index.indexOf('exports.getPublicQuiz = core.getPublicQuiz') !== -1);

/* Q2 — Aucun correctIndex ne traverse getPublicQuiz. */
var gpqIdx = core.indexOf('exports.getPublicQuiz');
var gpqBody = core.slice(gpqIdx, core.indexOf('exports.getCourse', gpqIdx));
check('S3 getPublicQuiz ne retourne jamais correctIndex', gpqBody.indexOf('correctIndex') === -1);
check('S4 getPublicQuiz ne retourne que text+options', gpqBody.indexOf("text: String(qq.text") !== -1 && gpqBody.indexOf('options:') !== -1);
check('S5 getPublicQuiz exige un statut approved', gpqBody.indexOf("q.status !== 'approved'") !== -1);
check('S6 getPublicQuiz exige un abonnement actif (ou trial/admin)', gpqBody.indexOf("s.status === 'active'") !== -1);
check('S7 getPublicQuiz restreint par académie (plan general)', gpqBody.indexOf("Not authorized for this academy.") !== -1);

/* Q3 — Règles : plus aucune lecture étudiante directe de /quizzes. */
var quizMatch = rules.slice(rules.indexOf('match /quizzes/{id}'), rules.indexOf('match /liveClasses/{id}'))
  .replace(/\/\/[^\n]*/g, ''); // ignore les commentaires de documentation
check('S8 règles /quizzes : lecture étudiante supprimée', quizMatch.indexOf('canStudentReadContent') === -1 && quizMatch.indexOf('isTrial == true') === -1);
check('S9 règles /quizzes : lectures teacher/admin conservées', quizMatch.indexOf('isTeacher()') !== -1 && quizMatch.indexOf('isAdmin()') !== -1);

/* Q4 — Règles : progress append-only (anti-fabrication). */
var progMatch = rules.slice(rules.indexOf('match /progress/{uid}'), rules.indexOf('// Scores de quizz'));
check('S10 progress : suppression interdite', progMatch.indexOf('allow delete: if false') !== -1);
check('S11 progress : update limité aux clés completedLessons+updatedAt', progMatch.indexOf("hasOnly(['completedLessons', 'updatedAt'])") !== -1);
check('S12 progress : liste strictement croissante (append-only)', progMatch.indexOf('.size() > resource.data.completedLessons.size()') !== -1);
check('S13 progress : ancienne liste incluse dans la nouvelle', progMatch.indexOf('resource.data.completedLessons.hasOnly(request.resource.data.completedLessons)') !== -1);
check('S14 progress : taille plafonnée', progMatch.indexOf('<= 500') !== -1);

/* Q5 — Client : rendu via callable, plus de lecture directe du corrigé. */
var rqIdx = app.indexOf('function renderQuiz()');
var rqBody = app.slice(rqIdx, app.indexOf('function renderQuizCatalog()'));
check('S15 renderQuiz passe par getPublicQuiz', rqBody.indexOf("callable('getPublicQuiz')") !== -1);
check('S16 renderQuiz ne lit plus quizzes/{id} directement', rqBody.indexOf("collection('quizzes')") === -1);

/* Q6 — Client : réponses remappées vers l'ordre de la tentative. */
var sqsIdx = app.indexOf('function submitQuizSecure');
var sqsBody = app.slice(sqsIdx, app.indexOf('function renderQuizSecureError'));
check('S17 submitQuizSecure remappe les réponses (ordre serveur)', sqsBody.indexOf('serverQuestions') !== -1 && sqsBody.indexOf('answers[sqi] = quizState.answers[localIdx]') !== -1);

/* Q7 — Le legacy submitQuiz n'écrit plus rien (chute sur affichage local). */
var legacyIdx = app.indexOf('function submitQuiz()');
var legacyBody = app.slice(legacyIdx, app.indexOf('function renderQuizResult('));
check('S18 submitQuiz legacy : aucune écriture Firestore', legacyBody.indexOf("collection('quizScores')") === -1 && legacyBody.indexOf('.set(') === -1);

console.log('');
console.log('STUDENT-SECURITY: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
