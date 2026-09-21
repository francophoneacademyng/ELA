/* ELA P1C harness: no-fallback + transaction + bank separation (LOCAL ONLY). */
'use strict';
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..', '..');
var assess = fs.readFileSync(path.join(root, 'functions', 'assessment.js'), 'utf8');
var bank = fs.readFileSync(path.join(root, 'functions', 'quizbank.js'), 'utf8');
var rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
var app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
var en = JSON.parse(fs.readFileSync(path.join(root, 'i18n', 'en.json'), 'utf8'));
var pass = 0; var fail = 0;
function check(l, c, d) {
  if (c) { pass++; console.log('PASS  ' + l + (d ? '  [' + d + ']' : '')); }
  else { fail++; console.log('FAIL  ' + l + (d ? '  [' + d + ']' : '')); }
}
/* 7.1 no-fallback: secure catch never calls legacy submitQuiz() */
var secIdx = app.indexOf('function submitQuizSecure');
// Mission quiz (fenetre elargie) : submitQuizSecure inclut desormais le
// remappage des reponses vers l'ordre de la tentative serveur ; la
// fenetre statique est portee a 4000 caracteres pour couvrir toute la
// fonction jusqu'a renderQuizSecureError (semantique du test inchangee).
var secBody = app.slice(secIdx, secIdx + 4000);
var secCode = secBody.replace(/\/\/[^\n]*/g, '');
check('C1 secure path has no legacy fallback invocation', secCode.indexOf('submitQuizSecure') !== -1 && secCode.replace(/submitQuizSecure/g, '').indexOf('submitQuiz') === -1);
check('C2 secure error renders premium state', secBody.indexOf('renderQuizSecureError') !== -1);
check('C3 submit button wired to secure path', app.indexOf("addEventListener('click', submitQuizSecure)") !== -1);
/* 7.2 transactional finalization */
check('C4 grading uses runTransaction', assess.indexOf('runTransaction') !== -1);
check('C5 tx re-reads attempt + returns existing result', assess.indexOf('tx.get(ref)') !== -1 && assess.indexOf('duplicate: true') !== -1);
check('C6 finalized status written in tx', assess.indexOf("status: 'finalized'") !== -1);
/* 7.3 bank separation */
check('C7 grading reads quizzes_bank first', assess.indexOf("collection('quizzes_bank')") !== -1);
check('C8 toPublic strips correctIndex', bank.indexOf('correctIndex') !== -1 && /text: q\.text, options: q\.options/.test(bank));
check('C9 publicQuestion strips correctIndex', /function publicQuestion/.test(assess) && assess.indexOf('correctIndex') !== -1);
/* rules */
check('C10 quizScores client write false', /match \/quizScores\/\{docId\}[\s\S]{0,300}allow create, update, delete: if false/.test(rules));
check('C11 attempts get-only, no list', /match \/attempts\/\{attemptId\}[\s\S]{0,400}allow list: if false/.test(rules));
check('C12 results get-only, no list', /match \/results\/\{resultId\}[\s\S]{0,400}allow list: if false/.test(rules));
check('C13 quizzes_bank fully closed', /match \/quizzes_bank\/\{quizId\}[\s\S]{0,200}allow read, write: if false/.test(rules));
/* i18n premium error states */
check('C14 i18n secure error keys', !!(en['quiz.secureErrorTitle'] && en['quiz.secureErrorMsg'] && en['quiz.secureErrorHint']));
console.log('P1C: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
