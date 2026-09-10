# ELA ACADEMY
## WEBSITE MARKETING & CONVERSION AUDIT

**Date :** 2026-09-10
**Site :** https://elaacademy.ng/#/
**Version analysée :** version en production au 2026-09-10 (SPA Firebase Hosting, routage hash, contenu rendu en JavaScript)
**Méthode :** analyse du site réel en production (HTML statique, métadonnées, robots.txt, sitemap.xml) + faits vérifiés du dépôt + analyses indépendantes des 8 agents marketing. Aucune modification effectuée.
**Périmètre :** audit uniquement — aucune campagne, aucun contact, aucun email, aucune publication, aucune modification du site.

> Convention : **OBSERVATION** = fait constaté · **PROBLÈME** = écart négatif · **RECOMMANDATION** = action proposée · **HYPOTHÈSE** = à valider.

---

## 1. EXECUTIVE SUMMARY

**Impression générale.** ELA Academy est une école de langues en ligne nigériane à **6 langues enseignées** (allemand, mandarin, anglais pro, arabe, russe, français) avec une **interface en 6 langues** (EN, FR, AR, DE, ES, ZH). L'intention stratégique — « One Academy », une vraie école en ligne, préparation aux examens officiels (Goethe, HSK, IELTS, TORFL, CECRL, ALPT), certificats vérifiables — est **pertinente et différenciante sur le papier**. Le site a une base technique saine (HTTPS, Paystack, PWA, i18n, pages légales).

Mais, en l'état, le site est un **squelette de pré-lancement** : `/courses` affiche « Courses coming soon », `/live` affiche « No live classes scheduled yet », les témoignages sont anonymes et les visuels sont des photos stock. Un visiteur invité à payer **₦75 000 à ₦840 000** arrive sur un site qui dit, en substance, « revenez plus tard ». Le discours de marque se contredit (Five vs Six langues), le français (académie « phare ») est absent de la homepage, et les promesses fortes (professeurs certifiés, certificats vérifiables) ne sont **pas prouvées**.

**Les 5 problèmes structurels (consensus des agents) :**
1. **Promesse non tenue** : cours et live vides contredisent « now enrolling » et « weekly live classes ».
2. **Incohérences de marque** : Five/Six langues, français phare invisible, espagnol d'interface présenté comme langue enseignée, deux adresses de contact.
3. **Absence de preuve** : professeurs, certificats, avis, accréditations, résultats.
4. **Funnel de conversion cassé** : prix avant valeur, mur d'authentification au checkout, aucune garantie visible, capture email non systématique.
5. **SEO structurellement nul** : routage hash, contenu client-side, un seul title/meta, pas de hreflang, sitemap à fragments.

**Scores /10**

| Dimension | Note | Constat |
|---|---:|---|
| Professionalism | **5,0** | Base technique soignée mais exécution non finalisée (états vides, Gmail légal). |
| Brand | **3,5** | Message non unifié, chiffres contradictoires, actif phare invisible. |
| UX | **5,5** | Free trial sans compte et PWA = bons points ; parcours confus et promesses vides. |
| Marketing | **3,5** | Message générique, pas de personas, pas de lead magnet, SEO cassé. |
| Content | **5,5** | Bon socle (« Not an app. A real school. ») mais cohérence et preuve manquantes. |
| Conversion | **3,8** | Freins majeurs au point de décision ; rien de fiablement mesuré. |
| SEO | **3,5** | 1 seule page réellement indexable ; 0 JSON-LD, 0 canonical, 0 hreflang. |
| Trust / Credibility | **3,0** | Promesses non prouvées, témoignages anonymes, contact Gmail. |
| B2C Acquisition | **4,7** | Besoin de marché réel mais prix hors budget et preuves absentes. |
| B2B Acquisition | **3,5** | Aucune surface institutionnelle (avis très partagé : voir §17). |
| **Overall** | **4,0** | Produit prometteur, exécution marketing immature, non prêt à convertir. |

---

## 2. FIRST IMPRESSION

**« Quelle impression donne ELA Academy à un nouveau visiteur ? »**

> En 30 secondes, un nouveau visiteur comprend qu'il existe **une école de langues en ligne nigériane**. Mais il ne comprend ni **pourquoi elle** (différenciation), ni **si elle est ouverte** (cours/live vides), ni **s'il peut lui faire confiance** (aucune preuve, identité floue).

**Ce qu'il comprend immédiatement (OBSERVATION) :**
- École de langues en ligne basée au Nigeria (kicker « E-LEARN LANGUAGE ACADEMY — NIGERIA »).
- Plusieurs langues disponibles, cours en direct avec de vrais professeurs.
- Première leçon gratuite / 12 leçons sans compte.
- Prix affichés en nairas (₦), paiement Paystack.

**Ce qu'il ne comprend pas (PROBLÈME) :**
- Combien de langues exactement ? « Five » (title, bandeau) vs « Six » (hero, i18n).
- Le français est-il enseigné ? Absent de la homepage, pourtant « académie phare ».
- Pourquoi l'espagnol est-il dans la liste alors qu'il n'est pas enseigné ?
- Où sont les cours et les classes live annoncés ?

**Ce qui donne confiance :** le positionnement « Not an app. A real school, online », la mention des examens officiels, Paystack, les pages légales, le WhatsApp.

**Ce qui crée le doute :** cours/live vides, témoignages sans photo ni vérification, photos stock, promesses non prouvées, **adresse Gmail dans les mentions légales**, deux emails différents.

---

## 3. WHAT IS WORKING WELL

Consensus des agents — éléments réussis à **conserver** :

1. **Positionnement « Not an app. A real school, online. »** (Marketing Strategist, Copywriter) — le meilleur actif de marque, contraste net avec Duolingo/Babbel.
2. **Free trial sans friction** : « Start Instantly — No Account Needed », 12 leçons sans compte + 24 avec compte gratuit (Growth, Lead Gen, Copywriter).
3. **Ancrage local et international clair** : Nigeria + débouchés Allemagne/Chine/UK/Canada/Russie/Golfe ; prix en nairas ; WhatsApp.
4. **Interface multilingue en 6 langues** (EN/FR/AR/DE/ES/ZH) — rare pour une plateforme africaine (Marketing Strategist, SEO).
5. **Parcours d'inscription en 3 étapes** + champ code parrainage + première leçon gratuite (Lead Gen, Copywriter).
6. **Programme de parrainage chiffré** (₦15 000 / ₦10 000) — bon moteur viral, sous-exploité.
7. **Section Live bien rédigée** : « Learn live, with real humans… » — concrète et différenciante.
8. **Base technique** : HTTPS, redirect www→non-www 301, robots.txt valide, OG/Twitter cards, PWA (manifest + service worker), responsive, GA4 après consentement.
9. **Transparence tarifaire** : grille publique 3 formules × 3 durées, page remboursement existante.
10. **Quiz de niveau** (20 questions, certificat à 80 %) — excellent aimant à leads potentiel (Email, Lead Gen).

---

## 4. MAIN PROBLEMS

### 🔴 CRITICAL

**C1 — Promesse contredite par des pages vides**
- **Problème :** `/courses` = « Courses coming soon » ; `/live` = « No live classes scheduled yet », alors que le bandeau annonce « All five academies — now enrolling » et la mission promet des « weekly live classes ».
- **Pourquoi c'est important :** le visiteur qui explore au moment de décider trouve un produit vide ; sur un ticket de 75 000–840 000 ₦, c'est le premier tueur de conversion.
- **Agents :** Marketing Strategist, Market Researcher, Content, Lead Gen, Growth, Social (consensus 6/8).
- **Impact :** perte de confiance immédiate, abandon avant checkout.

**C2 — Incohérences de marque (Five/Six, français, espagnol, contacts)**
- **Problème :** `<title>` et bandeau « Five Languages » ; hero et i18n « Six » ; français « phare » absent de la homepage, du footer et de la meta ; espagnol d'interface listé comme langue enseignée ; `contact@elaacademy.ng` vs `languageacademyelearn@gmail.com`.
- **Pourquoi c'est important :** ce sont des signaux d'amateurisme qui attaquent directement la crédibilité et le SEO.
- **Agents :** Marketing Strategist, Content, SEO, Social, Growth (consensus 5/8).
- **Impact :** doute sur la maîtrise du produit, perte du marché francophone, title indexé trompeur.

**C3 — Promesses fortes non prouvées**
- **Problème :** « certified teachers », « verifiable certificates », « official exam preparation », « Most popular », « Real results » — aucune preuve visible (pas de bios, pas d'accréditation, pas de mécanisme de vérification, pas d'avis).
- **Pourquoi c'est important :** allégations invérifiables, risque juridique, déficit de confiance sur un achat à fort panier.
- **Agents :** Marketing Strategist, Market Researcher, Content (consensus 3/8).
- **Impact :** frein direct à la conversion ; risque réputationnel.

**C4 — SEO structurellement cassé**
- **Problème :** routage hash → 1 seule URL indexable ; contenu rendu en JS (coquille vide pour de nombreux crawlers) ; un seul title/meta pour toutes les pages et langues ; 0 JSON-LD ; 0 canonical ; 0 hreflang ; sitemap listant des URLs à fragment.
- **Pourquoi c'est important :** le meilleur canal d'acquisition d'une école en ligne (le search) est neutralisé.
- **Agents :** SEO (spécialiste), Marketing Strategist, Market Researcher.
- **Impact :** invisibilité sur « apprendre l'allemand au Nigeria », « HSK Nigeria », etc.

### 🟠 HIGH PRIORITY

**H1 — Mur d'authentification au checkout** (Growth) — `#/checkout` exige une connexion sans état intermédiaire ; la motivation retombe. Impact : `checkout_started → payment_success`.
**H2 — Prix affichés avant la valeur** (Growth, Market Researcher) — pas de contenu détaillé par formule, pas de garantie visible ; choc tarifaire.
**H3 — Capture email non systématique** (Lead Gen, Email) — 12 leçons anonymes sans capture ; lead chaud non récupérable.
**H4 — B2B totalement absent** (Lead Gen, Email, Growth) — aucune page Enterprise/Schools/Universities, aucun formulaire de devis, aucune offre pilote. Le plan « Business » est un abonnement individuel mono-langue, trompeur pour un acheteur B2B.
**H5 — Aucun lien réseaux sociaux** (Social) — ni header ni footer ; site « socialement déconnecté », parrainage non partageable.

### 🟡 MEDIUM

**M1 — Prix d'entrée très élevé** (Market Researcher) — ₦75 000/mois ≈ 107 % du salaire minimum fédéral (₦70 000) ; aucun palier d'entrée, pas de paiement fractionné visible.
**M2 — Témoignages anonymes + photos stock** (Content, Social, Marketing).
**M3 — CTA dispersés** (Content, Growth) — « Start your journey », « Start free », « Start Instantly », « Subscribe now »…
**M4 — Offre d'entrée floue** (Content) — « first lesson free » vs « 12 free lessons » vs « Unlock 24 More ».
**M5 — Cartes académies → `#/register`** au lieu d'une page détail (Growth, SEO).
**M6 — Pas de SEO local** (SEO) — aucun NAP, pas de Google Business Profile, pas de LocalBusiness.
**M7 — Pas d'offre multi-langue / cross-sell** (Growth, Lead Gen).
**M8 — Pas de lead magnet** (Lead Gen, Email).
**M9 — Tracking partiel / consentement** (Growth, Marketing) — GA4 seulement après consentement, tagging CTA incomplet.

### 🟢 LOW

**L1 — Microcopy CTA incohérent.** **L2 — PWA sans stratégie de réengagement.** **L3 — `verify.html` orpheline.** **L4 — `og:locale:alternate` absent.** **L5 — `manifest.json` name/lang incohérents.** **L6 — Polices web lourdes (7 familles render-blocking).**

---

## 5. DESIGN & UX

- **Header :** navigation claire (Home, Free Trial, Academies, Pricing, Courses, Quiz, Live classes, Sign in) ; sélecteur de langue visible ; CTA « Start free » présent. **Recommandation :** différencier visuellement le sélecteur de langue d'interface du bandeau des langues enseignées ; ajouter un lien « For institutions ».
- **Navigation :** fonctionnelle mais le parcours manque de hiérarchie ; 6 libellés CTA concurrents. **Recommandation :** un CTA primaire unique par intention.
- **Homepage :** sections cohérentes mais longues et génériques ; le hero ne dit pas le bénéfice (examen/visa). **Recommandation :** hero bénéfice + preuve + CTA unique ; ajouter le français.
- **Mobile :** PWA + viewport présents, menu hamburger ; bon point. **Recommandation :** tester le RTL arabe sur pricing/checkout.
- **CTA :** trop nombreux et hétérogènes. **Recommandation :** libellé standard (« Start my free lessons »).
- **Sections :** bon enchaînement narratif (promesse → académies → méthode → preuve → étapes → offre → CTA) mais preuve sociale faible. **Recommandation :** remplacer stock par visuels propres, ajouter avis vérifiés.
- **Spacing / hiérarchie visuelle :** apparemment soignés (design premium revendiqué) ; **à valider visuellement** (HYPOTHÈSE).
- **User journey :** casse au point de décision (checkout mur, pages vides). **Recommandation :** checkout invité + pages détail langue.
- **Accessibilité :** `aria-label` présents sur le menu ; pas d'audit WCAG complet possible sans rendu. **Recommandation :** audit a11y dédié.
- **Responsiveness :** responsive revendiqué ; **à valider** sur appareils réels.

---

## 6. CONTENT & COPYWRITING

**Hero.**
- AVANT : « Your language. Your future. » / « One platform. Six languages. »
- APRÈS proposé : « **Pass the exam. Open the door.** » — « Goethe, HSK, IELTS, TORFL — learn live with real teachers, from Nigeria to the world. » CTA : « Start my free lesson ».

**Slogans.** « Not an app. A real school, online. » à **conserver** ; « Learn together, pay less » → « Learn together, save ₦25,000 as a pair. »

**Descriptions d'académies.** Harmoniser sur : *Bénéfice (où/quoi) → Preuve (examen/niveau) → Cas d'usage*, avec CTA uniforme (« Explore Germanophone → »). Encadrer les promesses à risque (« visa interview coaching », « government scholarships ») en *préparation*, pas en garantie.

**CTA.** Unifier : « Start my free lessons » (primaire), liens texte pour le secondaire. Clarifier l'offre d'entrée : « 12 free lessons, no account needed. »

**Pricing.** « One clear price. Real results. » → « **One clear price. No hidden fees.** » Renommer General Path/Premium Path/Business Language → **Self-Paced / Premium Live / Business**. Ne garder « Most popular » que si c'est vrai. Afficher ce qui est inclus, la garantie et le remboursement.

**Académies.** Ajouter la carte francophone (ou retirer le français du hero) ; corriger « The five academies » ↔ « six languages ».

**Cours.** « Courses coming soon… » → « Your first course is in final production. Join the founding cohort to get it on day one. » (si vrai).

**Trust.** Ajouter une barre de réassurance factuelle (paiement sécurisé, politique de remboursement, enregistrée au Nigeria, certificats vérifiables) — **uniquement si vérifiable**.

**Messaging institutionnel.** Aucun message B2B n'existe : créer une page « For schools, universities & companies » (voir §10).

**Multilingue.** Les textes doivent être déclinés dans les 6 langues d'interface (EN/FR/AR/DE/ES/ZH), avec **RTL** pour l'arabe. Le russe reste une langue enseignée, jamais une interface.

---

## 7. SEO

**Constats clés (OBSERVATION/PROBLÈME) :**
- SPA hash = **une seule URL indexable** pour toutes les vues.
- Contenu 100 % client-side sans prerender/SSR → coquille vide pour de nombreux crawlers.
- **0 donnée structurée** (Organization, Course, FAQPage, BreadcrumbList), **0 canonical**, **0 hreflang**.
- `sitemap.xml` liste des URLs à fragment (`#/...`) → non valides comme pages distinctes.
- Un seul title/meta pour toutes les pages/langues ; `#/free-trial` absente de `PAGE_TITLES`.
- Pas de H1 sur `/pricing` et `/academies`.
- `lang="en"` figé dans le HTML statique, changement de langue purement JS.
- Pas de SEO local (NAP, Google Business Profile, LocalBusiness).
- **Bons acquis :** HTTPS, redirect 301 www→non-www, robots.txt valide, OG/Twitter, PWA, responsive, i18n complet.

**Améliorations prioritaires :**
1. **Migration hash → History API** avec URLs propres + préfixes de langue (`/en/`, `/fr/`, `/ar/`, `/de/`, `/es/`, `/zh/`).
2. **Prerender/SSG** au minimum homepage + pages piliers (académies, pricing, free-trial).
3. **hreflang réciproques** + `x-default` → EN ; **canonical** auto-référents.
4. **JSON-LD** : `Organization`/`EducationalOrganization`, `Course` par académie, `FAQPage` (FAQ existante), `BreadcrumbList`.
5. **Sitemap propre** (sans fragments) + `<lastmod>` ; ajouter `verify.html`.
6. **Titles/meta par page et par langue** ; H1 uniques.
7. **SEO local** : Google Business Profile, NAP, pages Lagos/Abuja/Port Harcourt, `LocalBusiness`.
8. **Contenu par intention** : pages « apprendre l'allemand au Nigeria », « Goethe A1 », « HSK », « IELTS Lagos », guides visa/études.
9. **Performance** : alléger les 7 familles de polices, `preload`, charger Firebase à la demande.

**Rappel de conformité :** le russe n'est **pas** une langue d'interface ; ne pas l'ajouter au sélecteur ni aux hreflang. L'espagnol est une interface mais pas une langue enseignée.

---

## 8. CONVERSION & SALES FUNNEL

**Funnel actuel observé :**

```
Acquisition (organique / social / WhatsApp)
        ↓
Home  →  "Start your journey" → #/register
      →  "Explore academies"  → #/academies
      →  5 cartes académies   → #/register   (pas de page détail)
        ↓
/academies  →  "Subscribe" → #/pricing
        ↓
/pricing  →  3 formules × 1/3/6 mois  (prix avant valeur, pas de garantie)
        ↓
/checkout  →  🔒 CONNEXION REQUISE  →  Paystack
        ↓
Dashboard
```
En parallèle : `/free-trial` (12 leçons sans compte → 24 avec compte, capture newsletter) → inscription → checkout.

**Funnel idéal proposé :**

```
Visitor
   ↓
Landing par langue + bénéfice examen/visa + preuve sociale
   ↓
Valeur immédiate (leçon offerte sans compte)
   ↓
Confiance (professeurs nommés, certificats vérifiables, avis, garantie)
   ↓
Academy / Course detail (programme, niveaux, examens, durée)
   ↓
Free Trial / Registration (capture email systématique + consentement)
   ↓
Lead capture (email + langue visée + objectif + niveau)
   ↓
Onboarding J0–J30
   ↓
Paid conversion (checkout invité ou compte inline + garantie + Paystack)
   ↓
Retention (progression, live, rappels, PWA, WhatsApp)
   ↓
Upsell / Cross-sell (2e langue, upgrade Premium, durée supérieure)
```

**Points de fuite majeurs :** mur d'auth checkout, prix avant valeur, absence de preuve/garantie, pages vides, capture non systématique, pas de plan d'entrée.

---

## 9. B2C

Pour convertir davantage (étudiants, apprenants, parents) :
1. **Créer des pages détail par langue** avec bénéfice concret (examen, visa, carrière) et CTA contextuel.
2. **Capturer l'email au pic de valeur** (après la 1re leçon instantanée) + consentement.
3. **Transformer le quiz de niveau en lead magnet** (email + langue + objectif + niveau).
4. **Lead magnets visa/études** : « Goethe B1 → visa Allemagne », « HSK & bourses Chine », « Réussir l'IELTS ».
5. **Afficher la preuve** : avis vérifiés, professeurs nommés, certificats vérifiables, logos.
6. **Créer un parcours parent** dédié (sécurité, suivi, offre famille).
7. **Ajouter un point d'entrée accessible** : essai payant 7 jours, formule starter, paiement fractionné / mobile money.
8. **Afficher la garantie/remboursement** sur pricing et checkout.
9. **Multi-devises** pour les apprenants internationaux (USD/GBP/EUR) + cartes internationales.
10. **Corriger les incohérences** (français, Five/Six) qui font fuir la cible francophone.

---

## 10. B2B / INSTITUTIONAL

**Constat : le B2B est absent.** Aucune page, aucun formulaire, aucune offre pilote, aucun vocabulaire institutionnel (sièges, facturation, reporting, formateurs dédiés, conformité). Le plan « Business » est un abonnement individuel mono-langue — trompeur pour un acheteur B2B.

Pour convaincre écoles, universités, entreprises, institutions et partenaires :
1. **Page « Enterprise / Corporate Training »** (ROI, conformité, reporting, formats, langues, cas d'usage sectoriels) + CTA « Demander un devis ».
2. **Page « Schools & Universities »** (licences élèves/étudiants, dashboards enseignants, contenus, certification) + CTA « Réserver une démo ».
3. **Formulaire de devis institutionnel** (organisation, rôle, secteur, nb d'apprenants, langues, objectifs, échéance, budget, pays) avec SLA 48 h.
4. **Offre pilote** 2–4 semaines pour 10–30 apprenants, KPI définis, tarif fixe.
5. **Programme partenaire / affiliation** pour agences d'études et instituts.
6. **Brochure PDF** (email-gated) + webinaire acheteurs.
7. **Lead scoring & routage** (MQL B2B ≥ 40 → commercial ; SQL = formulaire complet + ≥ 20 apprenants).
8. **Renommer/clarifier le plan « Business »** ou créer une vraie offre « Corporate » multi-sièges.

**Atouts B2B existants à packager :** 6 langues, certificats vérifiables, préparation examens internationaux, classes live, infrastructure Firebase/Paystack.

---

## 11. SOCIAL MEDIA

**Constat : le site est socialement déconnecté.** Aucun lien Facebook/Instagram/LinkedIn/TikTok dans le header ou le footer ; aucun bouton de partage ; aucun pixel visible ; OG image générique et incohérente (« Five Languages »).

Améliorations :
1. **Ajouter les liens sociaux** (footer + header mobile) et des **boutons de partage** (WhatsApp, Facebook, X, copier le lien).
2. **Corriger l'aperçu de partage** : title/OG « Six languages » incluant le français + visuel social-first (6 langues + « real school » + élément humain).
3. **Relier le parrainage au partage** (lien/code copiable, partage WhatsApp).
4. **Bio-link** : page hub (Free trial / Académie / Quiz / WhatsApp) car le SPA en `#/` rend les liens profonds peu lisibles.
5. **Créer un blog/ressources** : réservoir de contenu social (carrousels, citations, Reels) et support SEO.
6. **Banque de visuels propres** (profs, apprenants, écrans de classe) pour remplacer le stock.
7. **Lead magnets** par plateforme (quiz, guides) + **pixels/UTM** (Meta, TikTok, LinkedIn, GA4).
8. **Séparer B2C et B2B** : Facebook/IG/TikTok pour les apprenants ; LinkedIn pour les institutions.
9. **Témoignages vidéo courts** (15–30 s) avec consentement + UGC + hashtag de marque.

---

## 12. EMAIL / LEAD NURTURING

**Constat : le site est « collecteur mais pas nurtureur ».** Trois points de capture réels (newsletter `/free-trial`, modale free trial, register/checkout) et une infrastructure transactionnelle SendGrid, mais **aucune séquence** de bienvenue, onboarding, nurturing ou ré-engagement observable. Aucun lead magnet, aucun exit-intent, aucune récupération de checkout abandonné.

Possibilités à ajouter :
1. **Séquence de bienvenue Free Trial** (J0, J1, J3, J5, J7) — activer jusqu'aux 24 leçons.
2. **Onboarding étudiant J0–J30** (accès, parcours, première victoire, live, progression, parrainage).
3. **Nurturing pré-achat** (5 emails : méthode, objections temps/niveau, formules réelles).
4. **Récupération de checkout abandonné** (+1 h, J1, J3) — sans fausse urgence ni remise inventée.
5. **Ré-engagement à l'expiration** (J+1, J+7, J+21).
6. **Newsletter multilingue** (bimensuelle, segmentée par langue).
7. **Séquence partenariat / institutionnel** (J0, J3, J7, J14).
8. **Champs de segmentation obligatoires** : langue d'interface, langue cible, objectif, niveau, **consentement horodaté** (NDPR/RGPD).
9. **Points de capture supplémentaires** : homepage, académies, cours, live (calendrier + rappels), pricing, quiz de niveau, page B2B.
10. **Instrumentation** : événements ESP + produit (trial_started, lesson_completed, checkout_initiated, payment_success, subscription_expired).

---

## 13. TOP 20 IMPROVEMENTS

| # | Improvement | Impact | Effort | Priority |
|---|---|---|---|---|
| 1 | Remplir `/courses` et `/live` (contenu réel ou liste d'attente) | Très élevé | Moyen | P0 |
| 2 | Unifier le message 5/6 langues + mettre le français sur la homepage/title/meta | Très élevé | Faible | P0 |
| 3 | Construire la preuve (bios profs, accréditations, certificats vérifiables, avis) | Très élevé | Moyen | P0 |
| 4 | Supprimer le mur d'auth au checkout (checkout invité / compte inline) | Très élevé | Élevé | P0 |
| 5 | Afficher valeur + garantie/remboursement sur pricing et checkout | Très élevé | Faible | P0 |
| 6 | Capture email au pic de valeur (après 1re leçon instantanée) | Élevé | Moyen | P0 |
| 7 | Unifier les emails de contact (supprimer le Gmail légal) | Élevé | Faible | P0 |
| 8 | Créer les pages détail par langue (bénéfice/examen/visa) | Élevé | Élevé | P1 |
| 9 | Migration SEO : URLs propres + prerender + hreflang + JSON-LD + sitemap | Élevé | Élevé | P1 |
| 10 | Transformer le quiz en lead magnet (email + niveau + objectif) | Élevé | Moyen | P1 |
| 11 | Créer les pages B2B + formulaire de devis + offre pilote | Élevé | Moyen | P1 |
| 12 | Ajouter les liens sociaux + boutons de partage + OG corrigée | Élevé | Faible | P1 |
| 13 | Lead magnets visa/études (guide Goethe/HSK/IELTS) | Moyen-élevé | Moyen | P1 |
| 14 | Point d'entrée accessible (essai payant 7 j / starter / paiement fractionné) | Élevé | Élevé | P1 |
| 15 | Séquences email lifecycle (bienvenue, onboarding, abandon, ré-engagement) | Élevé | Moyen | P1 |
| 16 | Preuve sociale : témoignages vérifiés (photo/nom/objectif) | Moyen-élevé | Moyen | P1 |
| 17 | CTA uniques par intention + microcopy clair | Moyen | Faible | P2 |
| 18 | SEO local (Google Business Profile, NAP, pages villes) | Moyen | Moyen | P2 |
| 19 | Cross-sell 2e langue + bundles | Moyen | Moyen | P2 |
| 20 | Instrumentation complète (funnel GA4, tagging CTA, multi-devises) | Moyen | Moyen | P2 |

---

## 14. QUICK WINS

Rapides, peu coûteuses, à fort impact (0–30 jours) :
1. **Corriger Five/Six** + ajouter le français au title, meta, homepage, footer.
2. **Retirer l'espagnol** du bandeau des langues enseignées.
3. **Unifier le contact** (supprimer le Gmail légal).
4. **Afficher la garantie/remboursement** sur pricing et checkout (contenu déjà dans `/refund`).
5. **Remplacer les états vides** par une liste d'attente / prochaines sessions (capture email).
6. **Ajouter les liens sociaux** header/footer + boutons de partage.
7. **Corriger le sitemap** (retirer les `#`), ajouter `/free-trial` aux titres.
8. **Ajouter un H1** sur `/pricing` et `/academies`.
9. **Unifier les CTA** par intention.
10. **Ajouter `Organization` + `FAQPage` JSON-LD**.

---

## 15. STRATEGIC IMPROVEMENTS

Changements plus lourds nécessitant davantage de travail (1–12 mois) :
1. **Migration technique SEO** : History API + URLs par langue + prerender/SSR + hreflang + canonical + JSON-LD.
2. **Construction du système de preuve** : professeurs, accréditations, certificats vérifiables, résultats, avis.
3. **Refonte du funnel de conversion** : checkout invité, pages détail langue, garantie, plan d'entrée.
4. **Offre B2B complète** : pages, formulaire, pilote, programme partenaire, lead scoring.
5. **Système email lifecycle** multilingue avec consentement (NDPR/RGPD) et instrumentation.
6. **Moteur de contenu** (blog/ressources, pages par intention, SEO local).
7. **Modèle de prix** : palier d'entrée, paiement fractionné/mobile money, multi-devises, cross-sell.
8. **Moteur social** : contenu vidéo natif, UGC, ambassadeurs, pixels/UTM.

---

## 16. FUTURE WEBSITE VISION

> **Vision : ELA Academy comme la première « école de langues en ligne à résultat » du Nigeria — une école qui prépare réellement aux examens officiels et à la mobilité internationale, avec une preuve visible à chaque étape.**

1. **Homepage à bénéfice** : hero « Pass the exam. Open the door. », les **6 académies** (français inclus, flagship), preuve sociale vérifiée, CTA unique « Start my free lesson ».
2. **Pages détail par langue** (allemand, français, mandarin, anglais pro, arabe, russe) : programme par niveau (A1→C2 / HSK1→6), professeurs nommés, préparation examen, débouchés (Allemagne, Chine, Golfe, Canada, Russie), témoignages vérifiés, CTA essai/abonnement.
3. **Trust system** : professeurs visibles, accréditations/partenariats d'examen affichés, page publique de vérification des certificats (`verify.html` reliée), avis notés, garantie claire.
4. **Funnel de valeur** : leçon offerte sans compte → capture email → quiz de niveau → parcours personnalisé → onboarding → abonnement, avec **checkout sans mur**.
5. **Espace institutionnel** : pages Enterprise / Schools & Universities, formulaire de devis, offre pilote, programme partenaire.
6. **SEO solide** : URLs propres multilingues, prerender, hreflang, JSON-LD Course/Organization, SEO local Lagos/Abuja, blog de contenu par intention.
7. **Écosystème multilingue** : 6 interfaces (EN/FR/AR/DE/ES/ZH) avec RTL arabe soigné ; le russe enseigné, jamais interface.
8. **Écosystème social et email** : liens sociaux, partage, parrainage viral, séquences lifecycle multilingues, PWA de réengagement.
9. **Modèle commercial inclusif** : palier d'entrée, paiement fractionné/mobile money, multi-devises, bundles multi-langues, offres employeur.
10. **Mesure** : funnel GA4 complet, tagging exhaustif des CTA, tableau de bord conversion/rétention, expérimentation A/B continue.

---

## 17. AGENT CONSENSUS

**Recommandations citées par plusieurs agents (poids renforcé) :**
- **Corriger les incohérences de marque** (Five/Six, français phare, espagnol, contacts) — Marketing Strategist, Content, SEO, Social, Growth. **(5 agents)**
- **Résoudre les pages vides** (`/courses`, `/live`) qui contredisent la promesse — Marketing Strategist, Market Researcher, Content, Lead Gen, Growth, Social. **(6 agents)**
- **Construire la preuve** (professeurs, certificats, avis) — Marketing Strategist, Market Researcher, Content, Growth. **(4 agents)**
- **SEO structurel cassé** (hash, client-side, pas de hreflang) — SEO, Marketing Strategist, Market Researcher. **(3 agents)**
- **Capture email non systématique + besoin de lead magnets** — Lead Gen, Email, Growth. **(3 agents)**
- **Absence de B2B** — Lead Gen, Email, Growth. **(3 agents)**
- **Prix élevé / pas de point d'entrée** — Market Researcher, Growth, Lead Gen. **(3 agents)**
- **Aucun lien social** — Social (spécialiste), Marketing Strategist. **(2 agents)**

**Recommandations uniques mais importantes :**
- **SEO** : `verify.html` orpheline ; `free-trial` absente des titles ; pas de H1 sur pricing/academies ; performance polices.
- **Email** : besoin de consentement horodaté (NDPR/RGPD) et de séparer transactionnel/marketing.
- **Lead Gen** : lead scoring & routage ; programme partenaire pour agences d'études.
- **Market Researcher** : opportunités institutionnelles (mandarin au curriculum, pénurie d'enseignants) ; comparaison de prix concurrentielle (Confucius ₦60 000).
- **Social** : bio-link et pixels/UTM.
- **Growth** : checkout invité, expériences A/B priorisées, tableau de bord KPI.

**Désaccords notables :**
- **B2B** : le Lead Generation Specialist note **1/10** (aucune surface) tandis que le Market Researcher note **6/10** (potentiel de marché). **Lecture de synthèse :** la note 1/10 reflète l'**état actuel** du site, la note 6/10 reflète le **potentiel**. Les deux sont compatibles : le potentiel B2B est élevé mais totalement inexécuté. Score retenu : **3,5/10**.
- **Sévérité générale** : le Marketing Strategist est le plus critique (Overall 3,5/10) ; le Growth Analyst reconnaît un « produit et funnel crédibles mais sous-monétisés » (UX 5,5). **Lecture :** le socle est bon, l'exécution est le problème.

---

## 18. FINAL RECOMMENDATION

**« Si nous ne pouvions améliorer que 5 choses maintenant, lesquelles ? »**

1. **Remplir ou neutraliser les pages vides** (`/courses`, `/live`) pour que la promesse « now enrolling / live classes » soit tenue.
2. **Unifier la marque** : un seul chiffre de langues, le français sur la homepage/title/meta, contacts unifiés, espagnol retiré des langues enseignées.
3. **Installer la preuve** : professeurs nommés, accréditations, certificats vérifiables, avis — et afficher la **garantie/remboursement** sur pricing et checkout.
4. **Réparer le funnel de décision** : supprimer le mur d'auth au checkout, montrer la valeur avant le prix, unifier les CTA.
5. **Capturer les leads** : email au pic de valeur (après la 1re leçon), quiz de niveau et lead magnet visa/études comme aimants.

**« Si nous pouvions faire une refonte complète progressivement, dans quel ordre ? »**

- **Phase 0 — Cohérence & crédibilité (0–1 mois) :** corriger marque (Five/Six, français, contacts), neutraliser les états vides, afficher garantie/remboursement, ajouter liens sociaux, corriger sitemap/titles.
- **Phase 1 — Preuve & conversion (1–3 mois) :** bios profs, accréditations, certificats vérifiables, avis ; checkout invité ; valeur avant prix ; CTA uniques ; pages détail par langue.
- **Phase 2 — Acquisition (2–5 mois) :** migration SEO (URLs, prerender, hreflang, JSON-LD, SEO local) ; quiz/lead magnets ; séquences email lifecycle ; moteur de contenu.
- **Phase 3 — Expansion (4–9 mois) :** offre B2B complète (pages, devis, pilote, partenaires) ; modèle de prix inclusif (starter, fractionné, multi-devises, bundles).
- **Phase 4 — Optimisation continue (6–12 mois) :** instrumentation complète, A/B testing, rétention/PWA, social/UGC.

**Règle de gouvernance :** **ne lancer aucune campagne payante avant d'avoir résolu les points P0** — le coût d'acquisition serait gaspillé sur un site non convertissant.

---

## ANNEXE — Agents consultés

| # | Agent | Note attribuée | Statut |
|---|---|---|---|
| 1 | marketing-strategist | Overall 3,5/10 | Répondu |
| 2 | market-researcher | B2C 4,5 · B2B 6/10 | Répondu |
| 3 | seo-specialist | SEO 3,5/10 | Répondu |
| 4 | content-copywriter | Content 5,5 · Conversion 3,5/10 | Répondu |
| 5 | social-media-manager | Social 3,5/10 | Répondu |
| 6 | lead-generation-specialist | B2C 5 · B2B 1/10 | Répondu |
| 7 | email-marketing-specialist | Email 3/10 | Répondu |
| 8 | growth-cro-analyst | UX 5,5 · Conversion 4 · Growth 4,5/10 | Répondu |

**Nombre d'agents consultés :** 8/8 — **agents ayant répondu :** 8/8.

---

*Fin du rapport. Audit en lecture seule : aucune campagne lancée, aucun contact, aucun email envoyé, aucune publication, aucune modification du site, de l'i18n, de Firebase ou du design. En attente de validation.*
