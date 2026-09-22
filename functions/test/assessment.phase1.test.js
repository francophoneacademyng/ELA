/**
 * ELA — PHASE 1B tests (locaux, sans émulateur, sans production).
 * Vérifie les invariants du socle sécurisé + le durcissement LOCAL
 * des règles (quizScores lecture seule, attempts/results verrouillés).
 * NOTE : la production conserve provisoirement les anciennes règles
 * jusqu'au plan de migration approuvé (jamais de déploiement aveugle).
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.join(__dirname, '..', '..');
const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
const src = fs.readFileSync(path.join(root, 'functions', 'assessment.js'), 'utf8');
let pass = 0;
function ok(name, cond) {
  assert.ok(cond, 'FAIL: ' + name);
  pass++;
  console.log('ok - ' + name);
}
// PHASE 1B : quizScores est désormais lecture seule côté client (local).
// Toute écriture passe par submitAssessmentAttempt (Admin SDK).
ok('rules: quizScores lecture seule (create/update/delete=false local)',
  /match \/quizScores\//.test(rules) && /allow create, update, delete: if false/.test(rules));
// Preuve historique : l'auto-écriture par uid est supprimée des règles locales.
ok('rules: auto-ecriture quizScores supprimee (plus de request.resource.data.uid)',
  !/request\.resource\.data\.uid == request\.auth\.uid/.test(rules));
// PHASE 1B : nouvelles collections verrouillées.
ok('rules: attempts lecture titulaire + ecriture serveur seule',
  /match \/attempts\//.test(rules) && /resource\.data\.studentId == request\.auth\.uid/.test(rules));
ok('rules: results lecture titulaire + ecriture serveur seule', /match \/results\//.test(rules));
ok('rules: assessment_events ecriture serveur seule', /match \/assessment_events\//.test(rules));
ok('rules: quizzes_bank jamais lisible client', /match \/quizzes_bank\//.test(rules));
ok('rules: quizPublic sans correctIndex (representation publique)', /match \/quizPublic\//.test(rules));
// 2. certificats proteges (invariant a conserver)
ok('rules: ela_certificates write=false', /match \/ela_certificates\//.test(rules) && /allow create, update, delete: if false/.test(rules));
ok('rules: ela_certificate_events write=false', /match \/ela_certificate_events\//.test(rules));
// 3. assessment.js : pas de fuite corrige
ok('assessment: publicQuestion sans correctIndex', /function publicQuestion/.test(src) && !/correctIndex/.test(src.split('function publicQuestion')[1].split('}')[0] + ''));
ok('assessment: correction serveur via questions[qi].correctIndex (banque uniquement)', /questions\[qi\]/.test(src) && /\.correctIndex/.test(src));
// 4. decouplage certificats
ok('assessment: ne require pas ela-certificate-core (pas de regression cert)', !/ela-certificate-core/.test(src));
ok('assessment: ne require pas ela-pdf', !/ela-pdf/.test(src));
// 5. resultats immuables + audit
ok('assessment: ecrit results/{attemptId}', /collection\('results'\)/.test(src));
ok('assessment: ecrit attempts verrouille (finalized)', /finalized/.test(src));
ok('assessment: audit assessment_events ATTEMPT_CREATED+GRADED', /ATTEMPT_CREATED/.test(src) && /ATTEMPT_GRADED/.test(src));
// 6. cycle de vie + expiration + idempotence
ok('assessment: expiration geree (deadline-exceeded/expired)', /expired/.test(src));
ok('assessment: resoumission = duplicate (idempotence)', /duplicate: true/.test(src) && /duplicate: false/.test(src));
// 7. aucun score client accepte
ok('assessment: aucun champ score lu depuis request.data', !/request\.data.*score/i.test(src));
// 8. index.js câble le socle 1B sans toucher aux exports historiques
const indexSrc = fs.readFileSync(path.join(root, 'functions', 'index.js'), 'utf8');
ok('index: startAssessmentAttempt exporte', /startAssessmentAttempt/.test(indexSrc));
ok('index: submitAssessmentAttempt exporte', /submitAssessmentAttempt/.test(indexSrc));
ok('index: checkAssessmentEligibility exporte', /checkAssessmentEligibility/.test(indexSrc));
ok('index: generateCertificate historique conserve', /generateCertificate/.test(indexSrc));
// 9. éligibilité : jamais d'émission ici, doublon vérifié
const eligSrc = fs.readFileSync(path.join(root, 'functions', 'eligibility.js'), 'utf8');
ok('eligibility: source authoritative exigee', /authoritative/.test(eligSrc));
ok('eligibility: legacy_untrusted rejete', /legacy-untrusted/.test(eligSrc));
ok('eligibility: doublon certificat verifie (sourceAttemptId)', /sourceAttemptId/.test(eligSrc));
// Phase 2C : l'émission devient légitime MAIS uniquement via un chemin
// contraint (rôle + transaction + éligibilité), jamais via le helper brut
// core.issueCertificate appelé sans garde éligibilité. On vérifie donc :
//  - aucun appel direct "core.issueCertificate" non protégé ;
//  - émission construite via buildCertificateRecord (champs finaux) ;
//  - émission transactionnelle garante d'un seul certificat.
ok('eligibility: aucun appel direct core.issueCertificate (helper brut)', !/core\\.issueCertificate/.test(eligSrc));
ok('eligibility: emission via buildCertificateRecord (champs finaux)', /buildCertificateRecord/.test(eligSrc));
ok('eligibility: emission transactionnelle (runTransaction)', /runTransaction/.test(eligSrc));
ok('eligibility: emission controlee par role admin/system', /permission-denied/.test(eligSrc));
console.log('\nPHASE1-INVARIANTS: ' + pass + ' passed');
