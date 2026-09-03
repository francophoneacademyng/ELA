# ELA — Rapport Free Trial : analyse Francophone Academy & proposition d'adaptation

> **Statut : PROPOSITION — en attente de validation "GO". Aucun code écrit pour le Volet B.**

---

## 1. Analyse du Free Trial Francophone (modèle de référence)

### 1.1 Structure de la page

| Bloc | Contenu | Rôle conversion |
|---|---|---|
| Hero | Badge "100% Free — No credit card required", titre "Try Francophone Academy Free", sous-titre 3 paliers | Lève l'objection paiement |
| 3 avantages | 8 Sample Lessons (3 instant + 5 avec compte) · Free Level Quiz (CEFR A1–C2) · Progress Tracking (XP, streaks) | Preuve de valeur quantifiée |
| Vidéo intro | "Your first French lesson is on us — 60 seconds with Lea" | Humanisation, engagement |
| Leçons A1 instant | 3 leçons "Free Instant" — **sans aucun compte** | "Aha moment" en < 5 min |
| Leçons A2/B1 | 5 leçons "Free Sign Up" | Barrière douce : email contre contenu |
| CTA final | "Ready for the full experience?" → Pricing | Transition vers monétisation |
| Newsletter | "Free French tips every week" | Rétention des leads non convertis |
| Footer dédié | Liens cours/quiz/live/pricing, contacts, © 2026 | Trust |

### 1.2 Logique de gating (déduite)

3 paliers progressifs :
1. **Anonyme** → leçons `Free Instant` (3 leçons A1).
2. **Compte gratuit** (email + mdp, sans paiement) → 8 leçons au total + dashboard/XP/streaks.
3. **Abonné** → tout le contenu, cours complets, classes live, certificats.

---

## 2. Comparaison avec l'existant ELA — constat clé

**Le backend du Free Trial existe déjà dans ELA** (hérité du modèle Francophone) :

| Couche | État | Preuve |
|---|---|---|
| Flag contenu trial | ✅ Existe | `lessons.isTrial` seedé : `isTrial: l.order === 1` — `scripts/inject-legacy-a1.js:96`, `scripts/inject-a1-content.js:76`, `functions/index.js:1447` |
| Règles Firestore publiques | ✅ Existe | `allow read: if resource.data.isTrial == true;` sur `lessons`, `quizzes`, `courses` (`firestore.rules:83,95,107,118`) — lecture **sans auth** |
| Contrôle serveur | ✅ Existe | `canAccess()` (`functions/index.js:1292`) : `if (content && content.isTrial) return true; return !!access.active;` |
| Badge UI + tracking | ✅ Existe | Badge `t('lesson.trial')` (`js/app.js:1393`) + événement `trial_started` (`js/app.js:1340`) |
| Inscription gratuite | ✅ Existe | `createUserWithEmailAndPassword` + doc `users/{uid}` (`js/app.js:1780`) |
| Page Free Trial dédiée | ❌ **Manque** | Aucune route `/#/free-trial` |
| Barrière douce (3→8 leçons) | ❌ **Manque** | Seule la 1ʳᵉ leçon/académie est trial |
| Vidéo intro / Newsletter | ❌ Manque | — |

### 2.2 Pages candidates

1. **`/#/free-trial` (recommandé)** — page dédiée pour SEO/campagnes ; route dans `js/routes-v2.js`, rendu `src/ela/pages/free-trial.page.js` (pattern `academies-public.page.js`).
2. `/#/academies` — réparée (Volet A) ; y ajouter un bandeau "Essai gratuit" vers la page trial.
3. `/#/courses` — exige auth+abonnement dans le flux actuel ; non adapté à l'anonyme.

### 2.3 Données Firestore réutilisables

- **Leçons legacy A1** (`lessons`/`courses`/`quizzes` plates, `isTrial:true` sur lesson #1) : lisibles publiquement. ✅ Prêtes.
- **Curriculum arborescent** (`academies/{code}/curriculum/...`) : `read: if false` (Cloud Functions uniquement, `getAcademyTree` exige auth). **Ne pas ouvrir** pour le trial.
- Contenu A1 réel seedé pour les 6 académies → trial sur contenu propriétaire, pas de filler.

---

## 3. Proposition d'adaptation ELA

### 3.a) Page `/#/free-trial`

- Hero "Essayez ELA gratuitement — aucune carte de crédit" + 3 avantages (leçons d'échantillon, quiz de placement CECRL/Goethe/HSK, progression XP/streaks).
- Sélecteur d'académie (6 drapeaux) puis sections de leçons avec badges **"Free — Instant"** / **"Free — Sign Up"**.
- CTA "Prêt pour l'expérience complète ?" → `/#/pricing` ; newsletter "Conseils de langue chaque semaine".
- Vidéo intro différée (V1 : image/animation CSS design system emerald/forest/gold).
- i18n : clés `trial.*` dans `i18n/en|fr|ar.json`.

### 3.b) Données Firestore — options évaluées

| Option | Description | Verdict |
|---|---|---|
| **1. Champ `isTrial: true`** | Déjà en place (lesson #1) ; étendre aux leçons 1–3 A1 | ✅ **Recommandé** — zéro nouveau schéma, cohérent avec les règles déployées |
| 2. Collection `trialLessons` | Duplication du contenu | ❌ Double source de vérité |
| 3. Convention "3 premières leçons" côté client | Pas de flag | ⚠️ Fragile ; ne protège pas le serveur |

**Accès sans authentification :**

| Option | Verdict |
|---|---|
| **1. Règles publiques sur `isTrial` (déjà déployées)** | ✅ Garder. Risque résiduel : lecture publique des échantillons — volontaire |
| 2. Callable publique `getTrialLessons(academyCode)` | ✅ En **complément** (V2) : un list propre au lieu de N `get` par ID |
| 3. Contenu hardcodé dans le front | ❌ Maintenance impossible |

**Recommandation hybride** : V1 = règles actuelles + `get` par ID depuis la page ; V2 = callable `getTrialLessons` (onCall public, retourne uniquement `isTrial:true`, sans champs sensibles).

### 3.c) Barrière d'inscription douce

- **Leçons 1–3/académie** : `isTrial:true` + `trialAccess:'instant'` → anonyme OK (règles déjà en place).
- **Leçons 4–8** : `isTrial:true` + `trialAccess:'signup'` → l'anonyme voit la carte ; le clic ouvre le modal d'inscription gratuite (réutilise `createUserWithEmailAndPassword`, `app.js:1780`). Compte gratuit = dashboard/XP/streaks, **pas** de cours complets ni certificats (`canAccess()` le garantit déjà serveur).
- **Compteur anonyme** : `localStorage` (`ela_trial_used`) pour déclencher la barrière après 3 leçons — purement UX ; la sécurité reste Firestore.
- **Au-delà de 8** : CTA "Passer à l'expérience complète" → `/#/pricing`.

### 3.d) Différences clés Francophone vs ELA

| Aspect | Francophone | ELA (proposé) |
|---|---|---|
| Langues | 1 | 6 académies |
| Portée | 8 leçons d'une langue | **1 académie au choix** pour le parcours trial (3 instant + 5 signup) ; 1 leçon "teaser" instantanée pour chacune des 5 autres |
| Quiz de placement | 1 quiz CEFR | Quiz par académie (existant `/#/quiz`) |
| Switch d'académie | n/a | Après compte gratuit : re-essai d'une autre académie ; contenu complet = abonnement |

L'option "1 leçon de chaque académie" seule est rejetée (dilue la conversion). Hybride retenu : **profondeur sur 1 académie + teasers** — le teaser attire, la profondeur convertit.

---

## 4. Tableau de faisabilité

| Élément | Complexité | Fichiers | Dépendances | Risque | Recommandation |
|---|---|---|---|---|---|
| Page `/#/free-trial` | Moyenne | `free-trial.page.js` (nouveau), `routes-v2.js`, `i18n/*.json`, `main.css` | Design system | Faible (pattern existant) | GO V1 |
| Marquage leçons trial | Faible | Scripts seed (leçons 1–3 + `trialAccess`) | Firestore prod, seed idempotent | Faible (n'écrase rien) | GO |
| Accès anonyme leçons | Déjà fait | Aucun | — | Moyen (volontaire) | Conserver |
| Callable `getTrialLessons` | Moyenne | `functions/index.js` + tests | Deploy functions africa-south1 | Faible | V2 |
| Barrière 3 leçons | Moyenne | `free-trial.page.js`, modal signup | Firebase Auth | Faible (localStorage = UX seulement) | GO |
| Compte gratuit | Faible | Réutiliser flux existant | `users/{uid}` | Faible | GO |
| Vidéo intro | Faible→Moyenne | Hero V1 image/CSS | Hébergement vidéo | Bande passante | Différer V2 |
| Newsletter | Faible | Input + doc `leads` ou `marketingEvents` | SendGrid, consentement NDPA | Conformité | GO (en dernier) |
| Règles curriculum arborescent | Moyenne | `firestore.rules` | Audit sécurité | **Élevé** si arbre ouvert | V1 : collections plates uniquement |

---

## 5. Plan de mise en œuvre en 5 phases (si "GO")

1. **Phase 1 — Données** : étendre `isTrial:true` aux 3 premières leçons A1/académie + champ `trialAccess`. Seed idempotent, aucune suppression.
2. **Phase 2 — Page** : `src/ela/pages/free-trial.page.js` + route + CSS + i18n (hero, avantages, sélecteur, cartes badgées, CTA pricing).
3. **Phase 3 — Barrière douce** : compteur localStorage, modal inscription gratuite après 3 leçons, CTA tarifs après 8.
4. **Phase 4 — Auth** : branchement au flux existant ; le compte gratuit voit le dashboard, `canAccess()` bloque le non-trial.
5. **Phase 5 — Tests E2E** : anonyme → 3 leçons instant → signup → 5 leçons signup → blocage → pricing → paiement Paystack. Vérifier `trial_started` dans `marketingEvents`.

---

## 6. Recommandation personnelle

**GO sur une V1 resserrée** :

1. **Ne pas recréer le mécanisme trial** — il existe déjà (champ `isTrial`, règles publiques, `canAccess()`, tracking). Le travail est **frontal** : une page `/#/free-trial` qui orchestre l'existant.
2. **Rester sur les collections plates** (`lessons`/`courses`/`quizzes`) ; ne pas toucher aux règles du curriculum arborescent (risque n°1).
3. **Différer** vidéo (image hero suffit) et callable `getTrialLessons` (V2).
4. **Newsletter en dernier** (décision de conformité NDPA nécessaire).

Effort estimé V1 : ~1 journée de dev + tests émulateur, **sans** déploiement de nouvelles règles Firestore.

**En attente de votre "GO" pour démarrer la Phase 1.**

