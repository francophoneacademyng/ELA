# RAPPORT FINAL V2 — ELA ACADEMY (réplique du modèle Francophone Academy)

Projet : `ela-academy-7f868` · Site : https://ela-academy-7f868.web.app
Commit : `feat: replique complete du modele FA - 5 academies avec cours reels`

---

## 1. Plan de réplique (modèle FA → ELA multi-académies)

Le modèle Francophone Academy (FA) organise le contenu en **cours → modules → leçons → quizz**, avec des niveaux CEFR, des enrollments (progression), des quizAttempts (scores) et des certificats pdfkit générés à 80 % de réussite. Adaptation ELA :

- **Hiérarchie** : `courses` → `lessons` → `quizzes` (le concept de « modules » de FA est fusionné dans le cours via `courseId` + `order`).
- **Niveaux** : CEFR (A1, A1–A2) pour German/English/Russian/Arabic ; HSK 1 pour Mandarin (conforme aux descriptifs des académies du site).
- **Accès** : abonnement actif requis pour lire le contenu `approved` de SON académie (comme FA, cours premium).
- **Progression** : `progress/{uid}.completedLessons` (équivalent des `enrollments` FA).
- **Scores** : `quizScores/{uid}_{quizId}` (équivalent des `quizAttempts` FA, meilleur score conservé).
- **Certificats** : trigger Firestore `generateCertificate` (pdfkit) à ≥ 80 %, charte ELA (forest/gold).

## 2. Structure des collections

- `courses/{id}` : `academy`, `level`, `title`, `description`, `category`, `learningOutcomes[]`, `order`, `status="approved"`, `createdAt`.
- `lessons/{id}` : `courseId`, `academy`, `level`, `order`, `title`, `objectives[]`, `content`, `vocabulary[]`, `grammar[]`, `exercises[]`, `videoUrl=""` (prêt), `quizId`, `teacherUid=null`, `status="approved"`, `createdAt`.
- `quizzes/{id}` : `lessonId`, `courseId`, `academy`, `level`, `title`, `questions[]` (`{text, options[4], correctIndex}`), `status="approved"`.
- `progress/{uid}` : `completedLessons[]`.
- `quizScores/{uid}_{quizId}` : `uid`, `quizId`, `title`, `score`, `total`, `bestScore`.
- `certificates/{id}` : `userId`, `quizId`, `quizTitle`, `academy`, `level`, `percentage`, `studentName`, `verificationCode`, `pdfUrl`, `issuedAt`.

## 3. Cours générés (programme de démarrage)

| Académie | Niveau | Cours | Leçons |
|---|---|---|---|
| German | A1 | German A1 — Foundations | 8 (greetings, alphabet/prononciation, se présenter, nombres, vie quotidienne, der/die/das, verbes essentiels, Perfekt) |
| Mandarin | HSK 1 | Mandarin HSK 1 — Foundations | 6 (pinyin/tons, salutations, caractères de base, se présenter, nombres, structure de phrase) |
| English | A1–A2 | English — Essential Foundations | 6 (to be/have, conversation, anglais pro, present simple, questions, emails/réunions) |
| Arabic | A1 | Arabic A1 — Foundations | 6 (alphabet, lecture/lettres, salutations, présentation, vie quotidienne, nombres) |
| Russian | A1 | Russian A1 — Foundations | 6 (cyrillique, prononciation, salutations, présentation, cas de base, nombres) |

**Total : 5 cours, 32 leçons, 32 quizz (5 questions chacun), ~160 questions.** Contenu pédagogique réel (explications en anglais, exemples dans la langue cible + traduction, vocabulaire, grammaire, exercices). Chaque leçon a `videoUrl=""` prêt à recevoir la vidéo.

## 4. Fichiers créés / modifiés

- **Créés** : `functions/curriculum.js` (contenu), `functions/curriculum-quizzes.js` (quizz), `functions/tests/curriculum.test.js`.
- **Modifiés** : `firestore.rules` (collections `courses` + `certificates`) · `firestore.indexes.json` (index composite `courses`) · `functions/index.js` (`seedCurriculum`, `getCatalog`, `getCourse`, `generateCertificate`) · `functions/package.json` (+ `pdfkit`) · `js/app.js` (catalogue cours, page cours, leçon enrichie, bouton seed admin) · `assets/css/main.css` (`.lesson-video`) · `i18n/en|fr|ar.json`.

## 5. Résultats des tests émulateur

- **curriculum.test.js : 9/9 PASS** — seed 5/32/32 · catalogue · cours · lecture leçon · lecture quizz · score enregistré · progression · non-abonné refusé · isolation académie refusée.
- **Regression suite** : teacher 6/6 · admin 6/6 · student 7/7 (aucune régression des règles).
- **Suite antérieure (déjà validée)** : jalon2 6/6, jalon3 4/4, jalon4 6/6, jalon5 3/4 (T4 scheduler = code review), E2E production 8/8.

## 6. Déploiement — Deploy complete ✅

- **17 fonctions** déployées (dont `seedCurriculum`, `getCatalog`, `getCourse`, `generateCertificate`).
- **Règles Firestore** publiées + **index composite `courses`** déployé.
- **Hosting** publié (9 fichiers, `js/app.js` à jour).

## 7. Procédure pour le propriétaire — injecter les cours en production

1. Connecte-toi au site avec ton compte **admin** (le lien « Admin » apparaît dans la nav).
2. Ouvre **`#/admin`** et clique sur **« Seed curriculum »**.
3. Une alerte confirme « Curriculum seeded: 5/32/32 » (idempotent — re-cliquer est sans effet).
4. Vérifie : `#/courses` (avec un compte élève abonné) affiche le cours de son académie ; `#/course?id=…` liste les leçons ; `#/lesson?id=…` affiche le contenu.

## 8. Procédure d'injection des vidéos (quand les médias seront prêts)

Le champ **`videoUrl`** de chaque document `lessons/{id}` est vide (`""`). Pour injecter une vidéo :
1. Héberger la vidéo (YouTube non répertorié, lien MP4 public, ou Firebase Storage).
2. Firebase Console → **Firestore Database** → collection **`lessons`** → ouvrir le document de la leçon.
3. Renseigner le champ **`videoUrl`** avec l'URL (ou l'URL YouTube — le lecteur accepte MP4 ; pour YouTube, ajouter l'embed si souhaité ultérieurement).
4. La page `#/lesson` affiche alors automatiquement le lecteur vidéo (composant `.lesson-video`).

## 9. Limites connues

- **Seed production** : nécessite le clic « Seed curriculum » côté admin (aucun service account en ma possession pour le faire à ta place).
- **Certificats** : le PDF est généré et uploadé sur **Firebase Storage** ; si Storage n'est pas activé, les métadonnées de certificat sont quand même enregistrées (avec code de vérification), mais `pdfUrl` reste `null` (repli gracieux testé). Activer Storage pour obtenir le PDF.
- **Niveaux** : le programme de démarrage couvre le niveau débutant (A1 / HSK 1). Les niveaux A2/B1 suivront.
- **Modules FA** : non reproduits (leçons directement rattachées au cours), pour simplifier la hiérarchie multi-académies.
