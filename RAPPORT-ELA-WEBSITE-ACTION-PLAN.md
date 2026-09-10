# ELA ACADEMY
# WEBSITE MARKETING ACTION PLAN

**Date :** 2026-09-10
**Source :** RAPPORT-ELA-WEBSITE-MARKETING-AUDIT.md (audit du site en production https://elaacademy.ng/#/)
**Agents consultés :** 8/8 — marketing-strategist, market-researcher, seo-specialist, content-copywriter, social-media-manager, lead-generation-specialist, email-marketing-specialist, growth-cro-analyst
**Nature du document :** STRATÉGIE → PRIORISATION → ROADMAP → PLAN D'EXÉCUTION. Aucune modification, aucun déploiement, aucune campagne, aucun email, aucun contact, aucune publication.

> Convention : **[FAIT]** = issu de l'audit vérifié · **[HYPOTHÈSE]** = à valider · **[DÉCISION]** = arbitrage propriétaire requis · **[ACTION]** = action proposée, non exécutée.
> Les recommandations de l'audit ne sont pas toutes des faits : celles qui dépendent de preuves (professeurs, certificats, cours disponibles, offres B2B) sont explicitement signalées.

---

## 1. EXECUTIVE DECISION

**Que devons-nous faire maintenant ?**

> **Geler toute acquisition payante et toute nouvelle promesse publique. Concentrer 100 % de l'effort immédiat sur une Phase 0 de cohérence, de crédibilité et de vérification produit. La première question à trancher n'est pas marketing, elle est produit : *les cours et les classes live sont-ils réellement disponibles et livrables ?* (Décision D1).**

Justification (faits de l'audit) :
- **[FAIT]** Le site affiche « now enrolling » et promet des « weekly live classes » alors que `/courses` indique « Courses coming soon » et `/live` « No live classes scheduled yet » (problème C1, relevé par 6/8 agents).
- **[FAIT]** Trust 3,0/10 et Marketing 3,5/10 : le problème n'est pas le trafic, c'est la crédibilité.
- **[FAIT]** SEO 3,5/10 structurellement cassé (routage hash, 1 seule URL indexable) : aucune acquisition organique possible en l'état ; la correction est un prérequis technique, pas un levier court terme.
- **[FAIT]** B2B totalement absent : ne pas ouvrir ce front sans offre et sans preuve B2C.
- **[DÉCISION]** D1 (cours disponibles ?) conditionne tout : soit on **active l'offre**, soit on **corrige la promesse**. Rien d'utile ne se construit en aval tant que D1 n'est pas tranché.

**Les 3 priorités immédiates :**
1. Trancher D1 (disponibilité réelle des cours/live) → réconcilier promesse ↔ réalité.
2. Unifier la marque (Five/Six, français phare, espagnol, emails).
3. Prouver ou retirer les affirmations (professeurs, certificats, popularité, résultats, témoignages).

---

## 2. PRIORITÉS ABSOLUES

Les 10 actions à faire en premier.

| # | Action | Pourquoi | Impact | Effort | Dépendance | Priority |
|---|---|---|---|---|---|---|
| 1 | **Trancher la disponibilité réelle des cours et classes live** | Détermine si on active l'offre ou corrige la promesse (C1). Bloquant n°1. | Très élevé | Faible (décision) | Propriétaire | **P0** |
| 2 | **Réconcilier promesse ↔ réalité** (`/courses`, `/live`, bandeau, mission) | 6/8 agents ; confiance et conversion. | Très élevé | Moyen | #1 | **P0** |
| 3 | **Unifier la marque** : Five→Six, français sur homepage/title/meta, espagnol retiré des langues enseignées, email unique | Cohérence, crédibilité, SEO (C2). | Très élevé | Faible | D4/D5/D6 | **P0** |
| 4 | **Prouver ou retirer** « certified teachers », « verifiable certificates », « Most popular », « Real results », témoignages anonymes | Trust 3,0 ; risque juridique (C3). | Très élevé | Moyen | Preuves | **P0** |
| 5 | **Afficher la garantie/remboursement + prix + ce qui est inclus sur pricing/checkout** | Le prix existe déjà ; le rendre lisible et rassurant. | Élevé | Faible | D7 / PRV-07 | **P0** |
| 6 | **Réordonner pricing : valeur → preuve → prix** | Le prix arrive avant la valeur (F2). | Élevé | Faible-Moyen | #4 | **P0** |
| 7 | **Capture email au pic de valeur** (après 1re leçon / quiz) | Stoppe la fuite de leads chauds (F5). | Élevé | Moyen | Consentement | **P0** |
| 8 | **Instrumenter le funnel complet** (GA4 + fallback Firestore, tagging CTA, events checkout/trial) | Rien n'est mesurable → aucun test fiable (F10). | Élevé | Moyen | Accès technique | **P0** |
| 9 | **Assainir le SEO immédiat** (sitemap sans `#/`, canonical racine, H1, noindex privé, title free-trial, JSON-LD Organization) | Arrête la fuite SEO sans migration. | Moyen-Élevé | Faible | Aucune | **P0** |
| 10 | **Lancer le spike de décision migration URL** (spec + effort + plan de test) | Conditionne tout le SEO multilingue (P1). | Élevé (moyen terme) | Moyenne | Arbitrage archi | **P0** |

---

## 3. P0 — AVANT TOUTE CAMPAGNE

Liste précise de ce qui doit être terminé **avant de dépenser un seul naira en acquisition**.

**A. Produit & promesse**
- [ ] D1 tranché : cours et live réellement disponibles (ou promesse corrigée).
- [ ] `/courses` et `/live` non vides (contenu réel, calendrier, ou liste d'attente + capture email).
- [ ] Bandeau « now enrolling » et mission « weekly live classes » alignés sur la réalité.

**B. Marque & confiance**
- [ ] Nombre de langues unifié (6) dans title, meta, bandeau, hero, footer, i18n.
- [ ] Français présent sur homepage/footer/title/meta (ou retiré du hero si non enseigné — D4).
- [ ] Espagnol retiré de la liste des langues **enseignées** (interface uniquement).
- [ ] Un seul email de contact (domaine professionnel, pas de Gmail légal).
- [ ] Promesses prouvées ou retirées (professeurs, certificats, popularité, résultats).
- [ ] Témoignages vérifiés avec consentement, ou retirés.
- [ ] Garantie/politique de remboursement visible sur pricing et checkout.

**C. Funnel & mesure**
- [ ] Mur d'authentification au checkout supprimé ou atténué (checkout invité / compte inline / micro-copy de réassurance).
- [ ] Capture email systématique au point de valeur + consentement horodaté (NDPR/RGPD).
- [ ] Instrumentation du funnel complète (visite → register → trial → pricing → checkout → paid) avec fallback Firestore.
- [ ] Liens réseaux sociaux présents (une fois les comptes officiels connus).
- [ ] OG image corrigée (plus de « Five Languages », français inclus).

**Règle :** tant que la section A/B/C n'est pas verte, **interdiction d'acquisition payante**.

---

## 4. PHASE 0 — QUICK WINS

Actions réalisables rapidement (0–30 jours), à fort ratio impact/effort.

| # | Action | Type | Effort | Dépendance | Agent |
|---|---|---|---|---|---|
| QW-1 | Corriger « Five » → « Six » partout (title, meta, bandeau, hero, footer) | Contenu/Technique | S | Décision marque | Content, SEO |
| QW-2 | Ajouter le français à la meta, la homepage, le footer | Contenu/Technique | S | D4 | Content |
| QW-3 | Retirer l'espagnol de la liste des langues enseignées | Contenu | S | D5 | Content |
| QW-4 | Unifier l'email de contact | Contenu | S | D6 | Content |
| QW-5 | Afficher la garantie/remboursement sur pricing + checkout | Contenu | S | PRV-07 | Content, Growth |
| QW-6 | Assainir `sitemap.xml` (retirer les `#/`) | Technique | S | Aucune | SEO |
| QW-7 | Canonical auto-référent + robots meta sur la racine | Technique | S | Aucune | SEO |
| QW-8 | Ajouter `#/free-trial` aux titres + H1 sur `/pricing` et `/academies` | Technique/Contenu | S | Aucune | SEO, Content |
| QW-9 | `noindex` sur routes privées (dashboard, admin, teacher, checkout, login) | Technique | S | Aucune | SEO |
| QW-10 | JSON-LD `Organization` + `WebSite` + `FAQPage` (FAQ existante) | Technique | S | NAP | SEO |
| QW-11 | Micro-copy de réassurance au mur d'auth (palliatif) | Contenu | S | Aucune | Growth, Content |
| QW-12 | Unifier les CTA (grille « Start now » / « Explore academies » / « See plans & pricing ») | Contenu | S | Arbitrage essai | Content |
| QW-13 | Ajouter les liens sociaux header/footer + boutons de partage | Technique | S | Comptes officiels | Social |
| QW-14 | Réduire/optimiser les polices web (7 → 2–3 familles, `font-display`) | Technique | S | Design | SEO/Tech |
| QW-15 | Créer le formulaire de contact structuré + RFQ B2B | Technique | S | Offre B2B | Lead Gen |

**Quick wins bloqués par une preuve/décision (ne pas publier avant) :** bandeau « now enrolling » (statut réel), microcopie `/live` « weekly » (véracité), CTA « essai gratuit » (existence réelle), témoignages (consentement).

---

## 5. PHASE 1 — TRUST & CONVERSION

**Preuve & contenu**
- Construire le **système de preuve** : bios professeurs + qualifications, statut d'accréditation, mécanisme de vérification des certificats (relier `verify.html`), avis vérifiés, ancienneté, partenariats.
- Remplacer les **photos stock** par des visuels réels (enseignants, classes).
- Créer la **page À propos / Confiance** et enrichir la **FAQ** (objections : prix, essai, certificats, live).
- **Barre de confiance** uniquement si factuelle.

**Contenu & copy**
- Hero orienté bénéfice (proposé : « Pass the exam. Open the door. » ou variante — **[DÉCISION]**).
- Pricing : « One clear price. No hidden fees. » + prix + inclus + garantie ; renommer General/Premium/Business → **Self-Paced / Premium Live / Business**.
- Harmoniser les cartes académies (Bénéfice → Preuve → Cas d'usage).
- Clarifier l'offre d'entrée (12 leçons sans compte / 24 avec compte — une définition unique).
- Décliner en 6 langues d'interface (EN/FR/AR/DE/ES/ZH), **RTL arabe**.

**Checkout & pricing**
- Supprimer le mur d'auth (checkout invité ou création de compte inline) — **levier n°1 CRO**.
- Valeur + preuve + garantie au-dessus du CTA.
- Envisager un **plan d'entrée / essai payant** (dépend D7) pour casser la barrière des ₦75 000.

**Pages académie**
- Créer les **pages détail par langue** (programme, niveaux A1–C2 / HSK1–6, professeurs, examens, débouchés) et y router les cartes (au lieu de `#/register`).

**Free trial**
- Capture email soft gate (après 1re leçon / quiz), puis pont explicite vers le payant.

**Social & email (préparation)**
- Comptes officiels + bio-link + UTM + pixels (après consentement).
- Séquences lifecycle prêtes à activer (voir §6/§12).

---

## 6. PHASE 2 — ACQUISITION

**SEO**
- **Migration URL** : History API + préfixes de langue (`/en/ /fr/ /ar/ /de/ /es/ /zh/`, `x-default` → EN, **jamais `ru`**).
- **Prerender/SSG** route × locale ; **hreflang** réciproques ; **canonical** par locale ; **sitemap** propre ; **vrais 404** ; redirection client des anciens `#/`.
- **JSON-LD** `Course`/`Offer`, `BreadcrumbList`.
- **SEO local** : Google Business Profile, NAP, pages Lagos/Abuja/Port Harcourt, citations, avis.
- **Pages d'intention** : `learn german in nigeria`, `goethe zertifikat nigeria`, `ausbildung`, `learn french in nigeria`, `hsk exam nigeria`, `ielts classes in lagos`, etc.
- **Cluster informationnel** (blog/ressources).

**Social**
- Organique d'abord (Instagram, TikTok, Facebook B2C ; LinkedIn B2B), cadence 3 Reels + carrousels/semaine.
- Banque de visuels propres + vidéos courtes + UGC (avec consentement).
- Mécanique de partage du parrainage (₦15 000/₦10 000) — conditions validées au préalable.

**Email**
- Activer les séquences P0 : S4 abandon checkout, S1 free-trial welcome, S6 renewal/expiration, S2 onboarding.
- Puis S3 nurturing, S5 ré-engagement, S7 parrainage, S8 newsletter, S9 B2B.
- Prérequis : ESP marketing, SPF/DKIM/DMARC, double opt-in, séparation transactionnel/marketing.

**Lead magnets**
- Quiz de niveau (20 questions) comme aimant à leads (email avant résultat).
- PDF « plan 30 jours » par langue/objectif ; guides visa/études (Goethe, HSK, IELTS).
- Tripwire bas de gamme (dépend D7).

**Contenu**
- 6 landings par langue, FAQ apprenant, articles SEO, microcopie inscription/onboarding.

**Referral**
- Landing dédiée, kit de partage, relance post-essai, suivi tracké.

---

## 7. PHASE 3 — B2B

> **Condition : ne rien prospecter avant que l'offre et le pilote existent.** Le plan « Business » actuel est un abonnement individuel mono-langue — ne pas le présenter comme offre entreprise.

1. **Définir l'offre** (décisions propriétaire) : Enterprise L&D (multi-sièges, dashboard RH, facturation), Schools Program, Universities/Institutional, Government, **offre pilote** (8 semaines, KPI, tarif fixe), **programme partenaire** (commissions).
2. **Créer les pages** `/enterprise`, `/schools`, `/universities`, `/government`, `/partners`.
3. **Formulaire de devis (RFQ)** : organisation, type, pays, taille, langues, sièges, échéance, budget, rôle, email pro, consentement.
4. **Lead scoring & routage** : MQL ≥ 40, SQL ≥ 70 ; SLA < 24 h (B2B).
5. **Offre pilote** avec 1–2 comptes pour valider le modèle.
6. **Partenariats** : agences d'études, écoles internationales, universités/centres de langues, cabinets L&D, employeurs Golfe (archétypes, pas de noms inventés).
7. **Séquences B2B** (S9) — uniquement après offre + pages + SLA.

**Dépendances bloquantes :** grille tarifaire B2B, périmètre/prix du pilote, preuves/cas clients, capacité de traitement, cadre juridique.

---

## 8. PHASE 4 — GROWTH

**Analytics**
- Événements GA4 complets : acquisition/navigation, intention/CTA, inscription, free trial, pricing→checkout, paiement, rétention/expansion.
- Fallback Firestore pour ne pas perdre le funnel quand le consentement manque.
- Tableau de bord KPI : visite→register, register→trial, trial→paid, pricing→checkout, checkout→paid, abandon au mur d'auth, ARPU, LTV, churn, rétention J30/J90, taux 2e langue, capture email.

**CRO / A/B testing**
- Instrumenter **avant** de tester.
- Backlog : EXP-02 réassurance mur → EXP-03/04/06 pricing & preuve → EXP-08/09 trial → EXP-01 suppression mur d'auth → EXP-05 offre d'entrée → EXP-07 pages académie → EXP-10/11 localisation & cross-sell.

**Rétention / cross-sell / expansion**
- Onboarding J0–J30, rappels de progression, live, PWA notifications.
- Cross-sell 2e langue, upgrade Premium, passage 1→3→6 mois.
- Multi-devises, paiement fractionné/mobile money, offres employeur.

---

## 9. MATRICE MARKETING VS TECHNIQUE

| Action | Marketing | Content | Design | Code | Backend | SEO | Owner |
|---|---|---|---|---|---|---|---|
| Trancher D1 (cours dispo) | ● | | | | | | **Équipe ELA / Propriétaire** |
| Réconcilier promesse ↔ réalité | ● | ● | | ○ | | ○ | Marketing Strategist + Content |
| Unifier marque (Five/Six, FR, emails) | ● | ● | | ○ | | ○ | Marketing Strategist + Content |
| Preuves / bios profs / certificats | ● | ● | ○ | | ○ | ○ | Équipe ELA (preuves) + Content |
| Garantie visible pricing/checkout | ● | ● | ○ | ○ | | | Content + Growth |
| Réordonner pricing (valeur→prix) | ● | ● | ○ | ○ | | | Growth + Content |
| Capture email + consentement | ● | ○ | ○ | ● | ● | | Growth + Dev + Email |
| Instrumentation funnel (GA4/Firestore) | ● | | | ● | ● | ○ | Growth + Dev |
| Quick wins SEO (sitemap, canonical, H1, noindex, JSON-LD) | | ○ | | ● | ○ | ● | SEO + Dev |
| Migration URL + prerender + hreflang | | ○ | | ● | ● | ● | SEO + Dev (Cline) |
| SEO local (GBP, NAP, pages villes) | ● | ● | ○ | ○ | | ● | SEO + Marketing |
| Pages détail par langue | ● | ● | ○ | ● | ○ | ● | Content + Dev |
| Supprimer mur d'auth checkout | ● | ○ | ○ | ● | ● | | Growth + Dev |
| Offre d'entrée / pricing | ● | ○ | ○ | ○ | ● | | Propriétaire + Growth |
| Séquences email lifecycle | ● | ● | ○ | ○ | ● | | Email + Dev |
| Réseaux sociaux / contenu | ● | ● | ● | | | | Social + Content |
| Lead magnets (quiz, PDF) | ● | ● | ○ | ● | ○ | | Lead Gen + Content |
| B2B : offre + pages + RFQ | ● | ● | ○ | ● | ○ | ○ | Lead Gen + Propriétaire |
| Parrainage (landing + kit) | ● | ● | ○ | ● | ○ | | Lead Gen + Social |
| A/B tests | ● | ○ | ○ | ● | | | Growth + Dev |
| Cross-sell 2e langue | ● | ○ | ○ | ● | ● | | Growth + Dev |

Légende : ● responsable principal · ○ contributeur.

**Affectation cible :**
- **DeepSeek (orchestrateur)** : synthèse, priorisation, rédaction des briefs, contrôle qualité.
- **Agents marketing** : contenu, copies, plans, audits, specs (aucune modification de production).
- **Cline / développeur** : modifications code (HTML/JS/CSS/i18n, routage, prerender, checkout, instrumentation).
- **Équipe ELA** : décisions produit, preuves, offres, contenus réels, comptes sociaux, juridique.

---

## 10. INFORMATIONS NÉCESSAIRES DE MA PART

**Décisions stratégiques (ne pas inventer)**
- **D1 — Les cours et classes live sont-ils réellement disponibles et livrables ?** Si oui, quelles langues, quelles dates ? *(bloquant n°1)*
- **D2 — Les professeurs sont-ils « certified » ?** Selon quel référentiel ?
- **D3 — Les certificats sont-ils réels et vérifiables ?** Par quel mécanisme ?
- **D4 — Quelle est l'académie phare ?** (l'audit indique le français, absent du site)
- **D5 — L'espagnol est-il une langue enseignée ou seulement une interface ?**
- **D6 — Quel est l'email de contact officiel ?**
- **D7 — Modèle de prix** : conserver l'entrée à ₦75 000/mois ou créer un palier d'entrée / paiement fractionné ?
- **D8 — Le B2B est-il un objectif cette année ?** Avec quelle capacité et quelles ressources ?
- **D9 — Budget d'acquisition** disponible et horizon.
- **D10 — Contraintes légales/réglementaires** sur les promesses d'accréditation/certification au Nigeria.

**Preuves à fournir (PRV)**
- PRV-01 Liste réelle des professeurs + qualifications.
- PRV-02 Statut/certification des certificats délivrés.
- PRV-03 Grille tarifaire exacte + facturation.
- PRV-04 Périmètre de l'offre d'entrée (12/24 leçons).
- PRV-05 Statut d'inscription réel des 6 académies.
- PRV-06 Consentement écrit + attribution des témoignages.
- PRV-07 Politique de garantie/remboursement.
- PRV-08 Capacités B2B (groupes, facturation, LMS, multi-sièges).
- PRV-09 Confirmation russe/français réellement enseignés.
- PRV-10 Email canonique unique.
- PRV-11 Planning/fréquence des classes live.
- PRV-12 Accréditations / partenariats.

**Informations opérationnelles (Lead Gen / Email / B2B)**
- I-1 Grille tarifaire B2B (siège, volume, annuel).
- I-2 Prix et périmètre de l'offre pilote.
- I-3 Prix du tripwire B2C.
- I-4 Devises acceptées + moyens de paiement (cartes internationales ?).
- I-5 Preuves/cas clients utilisables.
- I-6 Capacité de traitement des leads (qui répond, en combien de temps).
- I-7 CRM et stack marketing retenus.
- I-8 Cadre juridique : contrats, facturation, TVA, conformité NDPR/RGPD.
- I-9 Politique de remboursement et conditions.
- I-10 Accréditations / reconnaissance des certificats.
- I-11 Grille de commission partenaire.
- I-12 Rôles internes (qui pilote B2B, partenariats, réseaux sociaux).

**Comptes & accès**
- Réseaux sociaux officiels (Facebook, Instagram, LinkedIn, TikTok) — existent-ils ?
- Accès GSC/Bing Webmaster, Google Business Profile, GA4.
- Accès DNS (SPF/DKIM/DMARC) et choix de l'ESP marketing.
- Adresse physique réelle (pour NAP / GBP).

---

## 11. DÉPENDANCES

**Chaîne critique**
```
D1 (cours disponibles ?)
      ↓
Réconcilier promesse ↔ réalité  ──►  Preuves (profs/certificats)  ──►  Pricing lisible + garantie
      ↓
Trust & Conversion (checkout, valeur, capture, pages académie)
      ↓
Instrumentation du funnel
      ↓
Acquisition (SEO, social, email, lead magnets, referral)
      ↓
B2B (offre → pages → pilote → partenaires)
      ↓
Growth (A/B, rétention, cross-sell, expansion)
```

**Dépendances détaillées**
- **Preuve system → Landing pages → Conversion optimization → Lead generation → Paid acquisition.**
- **Migration SEO** dépend de : décision d'architecture + pages prêtes (ne pas indexer de pages vides).
- **Séquences email** dépendent de : ESP + consentement + pages B2B pour S9.
- **Campagnes sociales** dépendent de : P0 (états vides, preuves, OG, liens, referral validé).
- **B2B** dépend de : offre définie + pilote validé + pages + preuves.
- **Tests A/B** dépendent de : instrumentation + baseline (2–4 semaines).
- **Acquisition payante** dépend de : Phase 0 + Phase 1 terminées.

---

## 12. RISQUES

Actions dangereuses ou prématurées à éviter :

| Risque | Description | Mitigation |
|---|---|---|
| **Lancer des publicités avant correction du funnel** | Payer pour envoyer du trafic vers un mur d'auth, des pages vides et un pricing faible = CAC gaspillé. | Interdiction jusqu'à P0 + Phase 1. |
| **Promettre des certifications non vérifiées** | « certified teachers », « verifiable certificates » non prouvés = risque légal/réputationnel. | Prouver ou retirer (D2/D3). |
| **Publier des résultats/témoignages non prouvés** | Témoignages anonymes, « Most popular », « Real results » = perte de confiance, risque conformité. | Consentement + attribution, sinon retrait. |
| **Créer des offres B2B inexistantes** | Prospection B2B sans offre/pilote = démotivation et perte de crédibilité. | Construire l'offre avant de générer des leads. |
| **Lancer du SEO sur des pages non prêtes** | Indexer des pages vides → soft 404, qualité dégradée. | `noindex` d'abord ; migrer quand le contenu existe. |
| **Migrer vers History API sans gérer auth/SW/404/deep links** | Rupture fonctionnelle majeure. | Spike de décision + plan de test (P0-1). |
| **A/B tester sur un funnel non instrumenté** | Résultats non interprétables, décisions sur bruit. | Instrumenter + baseline avant tests. |
| **Lancer l'email marketing sans consentement/ESP** | Non-conformité NDPR/RGPD, délivrabilité compromise. | Double opt-in + SPF/DKIM/DMARC + séparation transactionnel/marketing. |
| **Diffuser le parrainage sans valider les conditions** | Montants mal communiqués = risque réputationnel. | Valider les règles avant toute communication. |
| **Doorway pages SEO (villes/mots-clés en masse)** | Pénalité. | Contenu local réel uniquement. |
| **Traductions machine non relues** | Qualité/confiance, RTL arabe cassé. | Relecture professionnelle + QA RTL. |

---

## 13. ROADMAP 30 / 60 / 90 JOURS

### Jours 0–30 — Cohérence, crédibilité, mesure
- **Décisions :** D1–D10 (surtout D1, D4, D7).
- **Quick wins :** QW-1 à QW-15 (§4).
- **Promesse :** corriger `/courses` et `/live` (contenu réel, calendrier ou liste d'attente + capture).
- **Marque :** Five/Six, français, espagnol, email unique.
- **Trust :** publier/retirer les affirmations ; afficher garantie/remboursement ; préparer la collecte de témoignages.
- **Funnel :** instrumentation complète ; micro-copy au mur d'auth ; capture email au pic de valeur.
- **SEO :** quick wins techniques ; spike de décision migration.
- **Social/Email :** préparer comptes, bio-link, UTM, séquences (sans envoyer).

### Jours 31–60 — Trust & conversion
- Preuve system : bios profs, accréditations, certificats vérifiables, avis.
- Refonte pricing (valeur→prix, inclus, garantie, renommage).
- Suppression du mur d'auth (checkout invité / compte inline).
- Pages détail par langue (au moins 2–3 prioritaires : allemand, français, anglais/IELTS).
- Lead magnets : quiz en aimant, PDF « plan 30 jours ».
- Activation email P0 : S1, S2, S4, S6.
- Démarrage SEO local (GBP, NAP).
- Lancement organique social (une fois P0 verts).

### Jours 61–90 — Acquisition & B2B
- Migration SEO (URL + prerender + hreflang + JSON-LD + sitemap + 404).
- Pages d'intention SEO + cluster informationnel.
- Email P1 : S3, S5, S7, S8.
- B2B : définir l'offre, créer pages + RFQ, lancer un pilote.
- CRO : premiers A/B (réassurance mur, ordre pricing, preuve).
- Envisager l'offre d'entrée / tripwire (selon D7).
- Évaluer le lancement d'acquisition payante **uniquement si** conversion stabilisée et mesurée.

---

## 14. TOP 10 ACTIONS

Les 10 actions au meilleur rapport impact / effort / risque.

| Rang | Action | Impact | Effort | Risque | Ratio |
|---|---|---|---|---|---|
| 1 | Trancher D1 (cours disponibles ?) | Très élevé | Très faible | Faible | ★★★★★ |
| 2 | Réconcilier promesse ↔ réalité (`/courses`, `/live`, bandeau) | Très élevé | Moyen | Faible | ★★★★★ |
| 3 | Unifier la marque (Five/Six, FR, espagnol, email) | Très élevé | Faible | Faible | ★★★★★ |
| 4 | Afficher prix + inclus + garantie sur pricing/checkout | Élevé | Faible | Faible | ★★★★★ |
| 5 | Capture email au pic de valeur + consentement | Élevé | Moyen | Faible | ★★★★☆ |
| 6 | Instrumenter le funnel complet | Élevé | Moyen | Faible | ★★★★☆ |
| 7 | Prouver ou retirer les affirmations + témoignages | Très élevé | Moyen | Moyen | ★★★★☆ |
| 8 | Quick wins SEO (sitemap, canonical, H1, noindex, JSON-LD) | Moyen-Élevé | Faible | Faible | ★★★★☆ |
| 9 | Supprimer le mur d'auth au checkout | Élevé | Élevé | Moyen | ★★★★☆ |
| 10 | Réordonner pricing (valeur → preuve → prix) | Élevé | Faible-Moyen | Faible | ★★★★☆ |

---

## 15. PREMIÈRE VAGUE D'EXÉCUTION

**Ce que nous devrions faire lors de la prochaine mission (après validation) :**

**Vague 1A — Décisions et cohérence (immédiat, aucun risque)**
1. Collecter les réponses D1–D10 et les preuves PRV/I auprès du propriétaire (checklist §10).
2. Rédiger la **charte de message unifiée** (6 langues, français phare, CTA standard, contacts).
3. Préparer les **copies corrigées** des quick wins QW-1 à QW-6, QW-11, QW-12 (avant/après, 6 langues, RTL arabe).
4. Préparer le **spécimen de preuve** (structure bios profs, page confiance, FAQ) — en attente des faits réels.

**Vague 1B — Technique SEO sans risque (immédiat)**
5. Préparer les correctifs SEO quick wins : `sitemap.xml` assaini, canonical, `noindex` privé, H1, title free-trial, JSON-LD Organization/FAQ.
6. Rédiger le **spike de décision migration URL** (spec, effort, plan de test, risques).

**Vague 1C — Mesure et funnel (immédiat)**
7. Définir le **plan d'instrumentation** (liste d'événements GA4 + fallback Firestore + tagging CTA) — spécification, pas d'implémentation.
8. Préparer le **plan de capture email + consentement** (points de capture, textes de consentement, double opt-in).

**Livrables attendus :** briefs d'exécution prêts à remettre à Cline/développeur + liste de décisions/preuves à fournir par ELA.

**Aucune modification ne sera faite avant validation explicite.**

---

## 16. AGENT RESPONSIBILITY MAP

| Action | Agents responsables |
|---|---|
| Trancher D1 / décisions produit | **Propriétaire ELA** (orchestrateur facilite) |
| Réconcilier promesse ↔ réalité | **Marketing Strategist** → Content Copywriter |
| Unifier la marque | **Marketing Strategist** → Content Copywriter |
| Système de preuve | **Content Copywriter** → Market Researcher (vérif. faits) |
| Pricing lisible + garantie | **Growth Analyst** → Content Copywriter |
| Réordonner pricing (valeur→prix) | **Growth Analyst** → Content Copywriter |
| Capture email + consentement | **Lead Generation** → Email Marketing → Dev |
| Instrumentation funnel | **Growth Analyst** → Dev |
| Quick wins SEO | **SEO Specialist** → Dev |
| Migration URL + prerender + hreflang | **SEO Specialist** → Dev (Cline) |
| SEO local | **SEO Specialist** → Marketing Strategist |
| Pages détail par langue | **Content Copywriter** → SEO Specialist → Dev |
| Suppression mur d'auth checkout | **Growth Analyst** → Dev |
| Séquences email lifecycle | **Email Marketing Specialist** → Dev |
| Réseaux sociaux & contenu | **Social Media Manager** → Content Copywriter |
| Lead magnets (quiz, PDF) | **Lead Generation** → Content Copywriter |
| B2B offre + pages + RFQ | **Lead Generation** → Marketing Strategist → Propriétaire |
| Parrainage | **Lead Generation** → Social Media Manager |
| A/B tests | **Growth Analyst** → Dev |
| Cross-sell 2e langue | **Growth Analyst** → Content Copywriter |
| Recherche marché / hypothèses | **Market Researcher** |

---

## 17. FINAL STRATEGIC RECOMMENDATION

### A. Que faut-il faire immédiatement ?
1. **Trancher D1** (cours/live réellement disponibles) — sans cela, tout le reste est aveugle.
2. **Corriger la cohérence de marque** (Five/Six, français, espagnol, email unique) et **réconcilier la promesse** avec la réalité.
3. **Afficher prix + inclus + garantie** et **réordonner la valeur avant le prix**.
4. **Instrumenter le funnel** et **capturer l'email au pic de valeur**.
5. **Appliquer les quick wins SEO sans risque** (sitemap, canonical, H1, noindex, JSON-LD).

### B. Que faut-il absolument éviter ?
- **Toute acquisition payante** avant correction de la promesse et du funnel.
- **Publier des promesses non prouvées** (professeurs certifiés, certificats vérifiables, popularité, résultats, témoignages anonymes).
- **Prospecter en B2B** avant que l'offre et le pilote existent.
- **Indexer des pages vides** ou lancer du SEO sur des pages non prêtes.
- **Migrer vers History API** sans plan de test (auth, SW, 404, deep links).
- **Envoyer des emails marketing** sans consentement, ESP et authentification d'envoi.
- **Lancer du parrainage** sans conditions validées.

### C. Quelle est la première modification du site que tu recommanderais après validation ?
**Réconcilier la promesse avec la réalité produit** : remplacer les états vides `/courses` et `/live` par un contenu réel (ou une liste d'attente honnête + capture email) et aligner le bandeau/mission. C'est la correction au meilleur ratio impact/effort/risque, et elle conditionne la crédibilité de tout le reste.

### D. Quelle est la première action marketing externe que tu recommanderais ?
**Publier un contenu organique de preuve** (une micro-leçon ou un témoignage vérifié) **une fois les P0 verts** — pas une campagne payante. Le premier actif externe doit être un contenu honnête et réutilisable (organique), pas une dépense média.

### E. À quel moment serait-il raisonnable de commencer une campagne payante ?
**Uniquement lorsque les trois conditions suivantes sont réunies :**
1. **Phase 0 verte** : promesse cohérente, marque unifiée, affirmations prouvées ou retirées.
2. **Phase 1 avancée** : mur d'auth traité, pricing valeur+prix+garantie, preuve sociale en ligne, capture email opérationnelle.
3. **Instrumentation fiable** : funnel GA4/Firestore complet, baseline mesurée sur 2–4 semaines, suivi CAC/LTV par canal.

Sans ces conditions, l'acquisition payante ne ferait que payer pour du trafic non converti.

---

*Fin du plan d'action. Aucune modification de fichier d'application, aucun déploiement, aucune campagne, aucun email, aucun contact, aucune publication, aucune modification Firebase/i18n/design. En attente de validation avant toute exécution.*
