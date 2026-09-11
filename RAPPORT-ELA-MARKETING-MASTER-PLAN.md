# RAPPORT — ELA MARKETING MASTER PLAN

**Mission 4 — Stratégie marketing et croissance globale**
Date : 2026-09-11 · Site : https://elaacademy.ng/ · Projet : `ela-academy-7f868`
Statut : **STRATÉGIE COMPLÈTE + AMÉLIORATIONS TECHNIQUES DÉPLOYÉES**

> Règle de preuve : `[FAIT]` = vérifié dans le code/production ; `[EST]` = estimation à valider ;
> `[OWNER]` = information propriétaire requise. Aucune donnée fictive, aucun test, témoignage,
> partenariat ou taux de réussite inventé. Aucune campagne, aucun email, aucun prospect contacté.

---

## 1. Executive Summary

ELA dispose déjà d'un actif rare et défendable : **6 académies, 36 leçons gratuites sans carte,
paiement en Naira, certifications internationales vérifiables, interface 6 langues dont l'arabe RTL** `[FAIT]`.
Le problème n'est ni la demande ni l'offre : c'est que **le produit est difficilement trouvable
(routing par hash → seule la page d'accueil est indexable)** et que **l'entonnoir free-trial était
littéralement cassé** (liens de leçons instantanées invalides `#/lesson/<id>` au lieu de `#/lesson?id=`).

**Thèse 90 jours : réparer le plancher de conversion avant d'acheter un seul clic.**
1. Corriger l'entonnoir existant (fait — section 26).
2. Instrumenter chaque étape pour piloter par la donnée (fait).
3. Construire les actifs organiques (SEO, contenu, lead magnets, email en architecture).
4. Ouvrir le payant uniquement quand `/courses` et `/live` ne sont plus vides `[OWNER]`.
5. Escalader au propriétaire les 2 décisions qui débloquent l'échelle : migration d'URL et offre B2B.

---

## 2. Current Positioning (positionnement actuel)

- **Ce qu'ELA est réellement** `[FAIT]` : école de langues en ligne basée au Nigeria, 6 académies
  (FR phare, DE, ZH, EN, AR, RU), essai gratuit 36 leçons, prix NGN, certificats CECRL /
  Goethe-Zertifikat / HSK / IELTS / ALPT / TORFL, paiement Paystack.
- **Positionnement de fait** : « une vraie école en ligne, pas une app » (mission homepage), à prix
  Naira, avec préparation aux examens officiels.
- **Faille de crédibilité** : aucun témoignage rendu, pas de bios professeurs publiques, pas de
  taux de réussite `[FAIT]`. Les affirmations de confiance reposent sur des éléments vérifiables
  (certificats vérifiables via `verify.html`, politique de remboursement, Paystack).
- **ES est masqué** et ne doit pas être réactivé `[FAIT]`. RU est actif (académie + interface) `[FAIT]`.

---

## 3. Market Analysis

### 3.1 Priorisation marchés

| Priorité | Marché | Moteurs de demande | Confiance |
|---|---|---|---|
| **P1** | Nigeria | Migration études/travail (DE, CA, UK, Golfe, RU), examens, commerce Chine/Turquie, frontières francophones | Élevée (demande) / Moyenne (tailles) |
| **P2** | Afrique de l'Ouest | Commerce transfrontalier, mobilité CEDEAO, migration, examens | Moyenne |
| **P3** | Afrique francophone | France/Canada, fit produit naturel avec FR phare | Moyenne-élevée (fit) |
| **P4** | Diasporas / communautés internationales | Reconnexion linguistique, expatriés | Faible-moyenne |
| **P5** | Marché mondial | Très concurrentiel (Duolingo/Babbel), notoriété faible | Faible |

### 3.2 Demande par langue (Nigeria + Afrique de l'Ouest)

- **FR** `[FAIT phare]` : France/Québec, commerce francophone, CECRL.
- **DE** : universités publiques gratuites, voie *Ausbildung*, Goethe-Zertifikat.
- **ZH** : commerce/approvisionnement Chine, bourses, HSK.
- **EN** : IELTS pour UK/Canada, anglais professionnel.
- **AR** : migration Golfe, Omra/Hajj, culture, ALPT.
- **RU** : corridor médecine Russie/Ukraine (potentiellement perturbé par le conflit), TORFL.

### 3.3 Segments prioritaires

| Segment | Besoin | Langue | Motivation | Pouvoir d'achat `[EST]` | Canal | Message | Offre |
|---|---|---|---|---|---|---|---|
| Candidats examens | Réussir un examen daté | DE/EN/ZH/RU/AR | Migration/admission | Moyen-élevé | SEO, WhatsApp, communautés | « Votre score, un parcours structuré » | General 3 mois |
| Étudiants Allemagne/Ausbildung | B1/B2 allemand | DE | Travail/études | Moyen | SEO, YouTube, Facebook | « L'allemand qui mène à l'Allemagne » | Premium 6 mois |
| Migrants francophones Canada/UK | Preuve IELTS/CECRL | FR/EN | Immigration | Élevé | SEO, groupes diaspora | « Le français est un atout — ajoutez la preuve » | Premium 6 mois |
| Commerçants Chine/Golfe | ZH/AR fonctionnel | ZH/AR | Business | Moyen-élevé | WhatsApp, associations | « Parlez à votre marché » | Business 3 mois |
| Étudiants universitaires | Certification CV | FR/DE/ZH | Employabilité | Faible-moyen | IG/TikTok, campus | « Diplômez-vous avec un certificat » | General 1-3 mois |
| Écoles/universités (B2B) | Programme langues | Multi | Institutionnel | Élevé | LinkedIn, direct | « Un partenaire. Six langues. » | Sur devis `[OWNER]` |
| Apprenants arabes Golfe/Omra | AR pratique/religieux | AR | Culture/foi | Moyen-élevé | Communautés, IG | « L'arabe pour le travail et la foi » | General/Premium |

### 3.4 Concurrents et positionnement

| Concurrent | ELA avantage | ELA faiblesse |
|---|---|---|
| YouTube gratuit | Examens structurés, certificat, live | Le gratuit brouille la perception de prix |
| Duolingo/Babbel | Professeurs réels, alignement examens, paiement NGN | Notoriété, app mobile |
| Écoles locales Lagos/Abuja | En ligne, 6 langues, essai gratuit | Confiance physique/accreditation |
| Centres IELTS | Multi-langue, entrée prix plus basse | Track record IELTS moins visible |
| Marketplaces de tuteurs | Académies curatées, un compte | Concurrence prix informel |

**Fossé réaliste** : largeur (6 langues) + frameworks d'examen + prix Naira + essai sans carte +
certificats vérifiables. Pas le volume de contenu.

---

## 4. Priority Personas

| # | Persona | Besoin | Déclencheur | Canal | Offre | Message |
|---|---|---|---|---|---|---|
| **P1** | Candidat examen (Goethe/HSK/IELTS/TORFL/ALPT) | Réussir un examen daté | Date d'inscription | SEO, WhatsApp, communautés | Checklist examen + leçons gratuites | « Connais ton examen. Commence gratuitement. » |
| **P2** | Aspirant Allemagne (Ausbildung/études) | Voie visa/études | Cycle d'admission | SEO, YouTube, Facebook | Guide study-abroad | « L'allemand qui mène à l'Allemagne. » |
| **P3** | Migrant francophone Canada/UK | Preuve IELTS/CECRL | Décision de relocalisation | SEO, groupes diaspora | Checklist IELTS/CECRL | « Le français est un atout. » |
| **P4** | Commerçant Chine/Golfe | ZH/AR professionnel | Nouvelle route commerciale | WhatsApp, communautés | Leçons gratuites | « Parlez à votre marché. » |
| **P5** | Étudiant universitaire | Certification abordable | Vacances semestrielles | IG/TikTok, campus | Quiz de niveau | « Niveau supérieur pour ₦75 000 — essayez d'abord. » |
| **P6** | Institution B2B (école/univ/entreprise) | Programme langues | Cycle budgétaire | LinkedIn, email, direct | One-pager B2B | « Un partenaire. Six langues. » |

---

## 5. Six Academy Strategy

| Académie | Priorité | Cible | Message | Lead magnet | Canal | CTA |
|---|---|---|---|---|---|---|
| **FR** (phare) | P1 | Migrants francophones, CECRL/IELTS | « Le français + la preuve pour le Canada/UK » | Checklist IELTS/CECRL | SEO, FB, diaspora | Essai gratuit |
| **DE** | P1 | Ausbildung/études, Goethe | « L'allemand pour l'Allemagne » | Guide study-abroad | SEO, YouTube | Essai gratuit |
| **ZH** | P2 | Commerçants, HSK | « Le mandarin pour le business » | Checklist HSK | WhatsApp, communautés | Essai gratuit |
| **EN** | P2 | IELTS/professionnels | « L'anglais prêt pour l'IELTS » | Checklist IELTS | SEO, LinkedIn | Essai gratuit |
| **AR** | P2 | Golfe/Omra, ALPT, UI RTL | « L'arabe pour le travail et la foi » | Checklist ALPT | Communautés, IG | Essai gratuit |
| **RU** | P3 | Niche TORFL, interface RU | « Le russe, du début au certificat » | Checklist TORFL | SEO, YouTube | Essai gratuit |

**ES** : masqué, ressources conservées, jamais réactivé `[FAIT]`.

---

## 6. Value Proposition

- **UVP** : « Essayez 36 leçons gratuites — sans carte. Apprenez l'allemand, le mandarin, l'anglais,
  l'arabe, le français ou le russe et obtenez des certificats reconnus (Goethe, HSK, IELTS, TORFL,
  ALPT, CECRL) — à prix Naira. »
- **Reasons to believe** `[FAIT]` : 6 académies · 36 leçons gratuites (12 instant + 24 avec compte) ·
  sans carte · prix NGN · certifications nommées · interface 6 langues dont RTL · site live.
- **Différenciateurs** : largeur (6 langues) + alignement examens + accessibilité Naira + essai sans risque.
- **Key message** : « Une plateforme, six langues, de vrais certificats — commencez gratuitement, sans carte. »
- **CTA principal** : **Commencer gratuitement — 36 leçons, sans carte.**
- **CTA secondaire** : **Discuter sur WhatsApp** (B2C) / **Enregistrer votre institution** (B2B).

---

## 7. Acquisition Strategy

### 7.1 Canaux classés

- **P1 (maintenant)** : SEO fondations (correctifs techniques, GBP + NAP), WhatsApp (couche de
  closing), parrainage (₦15 000 / ₦10 000), email (architecture, pas d'envoi), communautés.
- **P2 (ensuite)** : Facebook, Instagram, LinkedIn (B2B), YouTube Shorts, clusters de contenu.
- **P3 (plus tard)** : TikTok, YouTube long, Google payant, événements.

### 7.2 À NE PAS FAIRE (maintenant)

- ❌ Publicité payante avant que `/courses` et `/live` ne soient plus vides.
- ❌ Publier un témoignage (aucun n'est vérifié/consenti).
- ❌ Exposer ES ou supprimer les ressources `es`.
- ❌ Répéter « RU n'est pas une interface » ou « Five Languages » (FAUX).
- ❌ Envoyer un email avant consentement/NDPR + SPF/DKIM/DMARC.
- ❌ Lancer hreflang avant migration d'URL.
- ❌ Blasts WhatsApp/DM non sollicités.
- ❌ Citer un prix B2B avant validation propriétaire.

---

## 8. Free Trial Funnel

**Promesse** `[FAIT]` : 36 leçons (12 instant sans compte + 24 avec compte), sans carte.
**Formulaire** : email + mot de passe (modal), min 8 caractères, `source:'trial'`.
**Après** : session signée, page rechargée, leçons débloquées. Pas de paiement.

**Funnel cible** :
```
VISITOR → FREE TRIAL (leçons instant) → LEAD (compte gratuit) → NURTURE (email)
        → OFFER (pricing) → CUSTOMER (Paystack) → ONBOARDING
```

**Correctifs appliqués** (section 26) : liens de leçons instant réparés, instrumentation
`trial_lesson_started`, `signup_modal_open`, alignement des CTA vers `/free-trial`.

**Frictions restantes `[OWNER]`** : pas de vérification email ; pas de séquence d'envoi armée.

---

## 9. Lead Generation

### 9.1 Lead magnets

| # | Magnet | Format | Persona | Étape | Statut |
|---|---|---|---|---|---|
| M1 | 36 leçons gratuites `[FAIT]` | Leçons on-site | Tous | TOFU → capture | **Existe** |
| M2 | Checklists examens (Goethe/HSK/IELTS/TORFL/ALPT/CECRL) | PDF 1-2 p. + tracker | P1 | TOFU/MOFU | À produire |
| M3 | Feuille de route study-abroad (DE/CN/UK-CA/RU/Golfe) | Guide 6-10 p. | P2/P3 | MOFU | À produire |
| M4 | Guide bourses (DAAD, CSC, Chevening…) | Guide + checklist | P1 | MOFU | À produire |
| M5 | Quiz de niveau + parcours personnalisé `[FAIT: quiz 20 q.]` | Interactif | P5 | TOFU → capture | **Existe** |
| M6 | One-pager ROI formation institutionnelle | PDF + brief pilote | P6 | B2B TOFU | À produire |

### 9.2 Canaux P1/P2/P3

P1 : WhatsApp, Email/lifecycle, Parrainage, Communautés.
P2 : SEO/contenu, Facebook, Instagram, YouTube, LinkedIn.
P3 : Google payant, TikTok, Événements.

### 9.3 Pipeline B2B

- **Cibles** : écoles secondaires/IGCSE, universités, entreprises (banque, pétrole, télécom, tech),
  ONG, ministères, organismes de formation.
- **Offre `[OWNER]`** : pilote institutionnel 20-50 sièges, 1 langue, 8-12 semaines, professeur live
  + suivi, facture/PO, certificats vérifiables, voie vers contrat annuel.
- **Qualification** : type d'org, apprenants ≥20 `[EST]`, budget identifié, décideur, délai, langue/objectif.
- **Étapes** : Cible → Contacté → Engagé → Découverte → Proposition → Pilote → Contrat → Expansion.
- **Templates** : esquisses seulement, aucun envoi.

### 9.4 Partenariats

Organismes d'examen, agences study-abroad, ONG de bourses, cabinets RH/formation, associations
diaspora, universités.

---

## 10. SEO Strategy

### 10.1 Contrainte critique `[FAIT]`

Le routing par hash (`#/pricing`, `#/academies`) **n'est pas indexable** : Google ne voit qu'une
seule URL `https://elaacademy.ng/`. Le hreflang est **techniquement impossible** sans migration
vers des URL réelles. C'est la dépendance n°1 à l'échelle.

### 10.2 Priorités techniques

| Prio | Action |
|---|---|
| P0 | Migrer hash → chemins réels + prerender/SSG (ou SSR) `[OWNER]` |
| P0 | Servir du HTML prerendu par page |
| P0 | `knowsLanguage` sans `es` — **corrigé** (section 26) |
| P1 | Sitemap complet (pages réelles + langues), robots.txt avec `Sitemap` |
| P1 | Hreflang après migration (en/fr/ar/de/ru/zh, `x-default` → /en/) |
| P1 | Données structurées `Course`/`Organization` par page |
| P2 | Core Web Vitals (LCP hero, polices, defer Firebase) |
| P2 | RTL servi en HTML (`dir="rtl"` + `lang="ar"`) pour l'arabe |

### 10.3 Clusters de contenu prioritaires

Study-abroad/Ausbildung, IELTS, examens par langue, local Nigeria (Lagos/Abuja), B2B formation.

### 10.4 Roadmap 0-30 / 30-60 / 60-90

- **0-30** : correctifs techniques, pages `/pricing`, `/free-trial`, `/institutions`, 6 hubs académies, GSC.
- **30-60** : migration multilingue, hreflang, 5 articles, CWV.
- **60-90** : GBP + NAP, pages locales, backlinks, reste des articles, avis.

---

## 11. Content Strategy

**9 piliers** : EDUCATION, CAREER, LANGUAGE TIPS, STUDY ABROAD, BUSINESS, CULTURE, EXAMS,
IMMIGRATION/MOBILITY (préparation uniquement), SUCCESS STORIES (**bloqué tant que non réel et consenti**).

**Calendrier 90 jours** : 18 pièces (pas 100), priorisées acquisition. Exemples immédiatement
productibles : « Not an app: what structured study looks like at ELA », « Goethe A1-B2: what each
level proves », « 10 German phrases for your first week », « HSK levels explained », « French for
Canada », « Studying in Germany: language steps first ».

**Système de conversion** : variantes hero, copie cartes académies, copie free-trial, copie pricing,
bibliothèque CTA, lignes de réassurance, traitement des objections. Aucune promesse de visa/emploi/
bourse ; toujours cadrer « préparation ».

**Réutilisation** : 1 article pilier → carrousel social + teaser email + résumé WhatsApp + bloc FAQ SEO.

**Multilingue** : voix pro/chaleureuse ; FR vouvoiement ; AR RTL arabe standard ; DE `Sie` ; RU `вы` ;
ZH concis. Ne pas traduire les noms d'examens ni le Naira.

---

## 12. Social Strategy

| Priorité | Plateforme | Audience | Objectif | Format | Fréquence | CTA |
|---|---|---|---|---|---|---|
| **P1** | Instagram | B2C 18-35 | Essais gratuits | Reels, carrousels, Stories | 3 Reels + 2 carrousels + 3 Stories/sem | Essai 36 leçons |
| **P1** | Facebook | B2C + communauté/parrainage | Essai + parrainage | Reels, carrousels, Groupes | 3 posts + 2 threads/sem | Essai + WhatsApp |
| **P1** | LinkedIn | **B2B** uniquement | Formulaire `/institutions` | Posts texte/document | 2-3/sem | Intérêt institutionnel |
| **P1** | WhatsApp | Closing/retention | Conversion/rétention | Statut, broadcast opt-in, communauté | Quotidien léger | Click-to-chat |
| **P2** | TikTok | Amplification | Reach | Repurposing Reels | 3-5/sem | Lien bio |
| **P2** | YouTube Shorts | Amplification | Reach | Vertical repurposé | 3-5/sem | Lien bio |
| **P3** | YouTube long | — | — | — | Déprioritisé (capacité) | — |

**Tracks séparés** : B2C (apprenants/candidats) et B2B (écoles/universités/entreprises). Le plan
individuel « Business » **ne doit pas** être présenté comme une offre entreprise.

---

## 13. Email Strategy

**Architecture** : couche d'écoute sur les captures Firestore existantes
(`newsletterSubscribers`, `users`, événements). **Aucun envoi** dans cette mission.

**Séquences** (trigger → nb emails → timing → objectif) :

| Séquence | Trigger | Emails | Timing | Objectif |
|---|---|---|---|---|
| WELCOME | nouveau subscriber | 4 | D0, D1, D3, D6 | Délivrer l'accès + choix académie |
| FREE TRIAL | `trial_started` | 5 | D0, D2, D4, D7, D11 | Leçons 1-12 → compte → paiement |
| ONBOARDING | inscription | 5 | D0, D1, D3, D5, D8 | Activation, dashboard, objectif |
| LEAD NURTURE | source waitlist | 5 | D0, D4, D8, D12, D16 | Magnets examens/study-abroad |
| ABANDONED CHECKOUT | `checkout_abandoned` | 4 | +1h, D1, D3, D6 | Récupération paiement |
| RE-ENGAGEMENT | inactif 45j | 4 | D0, D4, D9, D15 | Réactivation / nettoyage |
| B2B LEAD | `b2b-interest` | 4 | D0, D3, D7, D12 | Rendez-vous / proposition |
| ACADEMY-SPECIFIC | champ `academy` | 3 | D0, D3, D7 | Parcours FR/DE/ZH/EN/AR/RU |

**Segmentation** : académie, langue d'interface, persona, étape funnel, engagement.
**Délivrabilité** : SPF/DKIM/DMARC sur sous-domaine d'envoi, opt-in horodaté, désinscription 1-clic,
NDPR/GDPR. **AR** : templates RTL table-based.

---

## 14. B2B Strategy

- **Cibles** : Schools, Universities, Companies, NGOs, Government institutions, Training organizations.
- **Proposition de valeur** : un partenaire, six langues, professeurs réels, niveaux CECRL/HSK,
  reporting de progression, certificats vérifiables, pilote structuré.
- **Landing page** : `#/institutions` existe (capture d'intérêt) `[FAIT]`. À compléter par un
  one-pager et une offre pilote `[OWNER]`.
- **Lead generation** : LinkedIn + email institutionnel + partenariats.
- **Outreach** : 3 tracks (LinkedIn décideur, email séquence, partenariat co-brandé) — **esquisses seulement**.
- **Sales funnel** : Cible → Contacté → Engagé → Découverte → Proposition → Pilote → Contrat → Expansion.
- **Instrumentation ajoutée** : `institution_form_start`, `institution_form_submit` (section 26).
- **Aucun contact effectué, aucun prix cité.**

---

## 15. CRO Strategy

### 15.1 Audit par étape

| Étape | Fuite | Correctif |
|---|---|---|
| Accueil | CTA hero → `/register` (attente « leçon » ≠ formulaire) | **Corrigé** : hero/final/nav → `/free-trial` |
| Académies | CTA unique « SUBSCRIBE » avant preuve de valeur | **Corrigé** : CTA secondaire « Essai gratuit » |
| Free trial | **Liens instant cassés** `#/lesson/<id>` | **Corrigé** : `#/lesson?id=` |
| Inscription | 3 étapes, pas de mesure | **Corrigé** : `registration_step_complete` |
| Checkout | Abandon sans récupération | `checkout_abandoned` existe ; séquence email prête |
| B2B | Formulaire seul | **Corrigé** : événements start/submit |

### 15.2 Expériences P0/P1 (PROBLÈME → HYPOTHÈSE → MODIF → KPI → TEST)

1. **P0** Liens leçons cassés → corrigés. KPI : `free_trial_view`→`trial_started`. Avant/après 7-14j.
2. **P0** CTA hero mal aligné → aligné sur `/free-trial`. KPI : `cta_free_trial_click`, `trial_started`.
3. **P0** Manque de preuve → barre de confiance vérifiable (pas de faux témoignages). KPI : `checkout_started`.
4. **P1** CTA académie → « Essai gratuit » secondaire. KPI : `academy_view`→`cta_free_trial_click`.
5. **P1** Récupération checkout. KPI : `checkout_abandoned`→`payment_success` `[OWNER: messagerie]`.

---

## 16. Offer Strategy

Offres actuelles `[FAIT]` (prix NGN, par langue) :

| Plan | 1 mois | 3 mois | 6 mois | Contenu |
|---|---|---|---|---|
| General | ₦75 000 | ₦200 000 | ₦405 000 | A1-B2 auto-rythmé, quiz, certificat, communauté |
| Premium | ₦120 000 | ₦320 000 | ₦648 000 | General + coaching, live, prépa examens |
| Business | ₦150 000 | ₦420 000 | ₦840 000 | Langue de travail : Ausbildung, Chine, Golfe, IELTS |

- Parrainage `[FAIT]` : ₦15 000 de réduction 1er mois, ₦10 000 de crédit parrain.
- Essai `[FAIT]` : 36 leçons gratuites.
- **Incohérence potentielle** `[OWNER]` : vérifier que les classes live / le coaching Premium sont
  réellement délivrés avant de les promouvoir. Ne pas modifier les prix sans données.
- **ES masqué** : ne pas créer d'offre espagnole.

---

## 17. Funnel

```
ACQUISITION (SEO, WhatsApp, social, referral, B2B)
        ↓  fuite : indexation quasi nulle (hash routing) [OWNER]
LANDING (accueil, hubs académies, pages examens/study-abroad)
        ↓  fuite : CTA mal aligné [CORRIGÉ]
ACADEMY (choix de langue)
        ↓  fuite : CTA unique sans essai [CORRIGÉ]
FREE TRIAL (12 leçons instant)
        ↓  fuite : liens cassés [CORRIGÉ]
LEAD (compte gratuit)
        ↓  fuite : pas de vérification email, pas de séquence armée [OWNER]
EMAIL / WHATSAPP (nurture)
        ↓  fuite : consentement/NDPR à formaliser [OWNER]
PRICING
        ↓  fuite : preuve sociale absente [OWNER: vrais témoignages]
CHECKOUT (Paystack)
        ↓  fuite : abandon sans récupération [séquence prête]
CUSTOMER
        ↓
RETENTION (onboarding, réengagement)
        ↓
REFERRAL (₦15 000 / ₦10 000)
```

---

## 18. KPI

| KPI | Définition | Pourquoi |
|---|---|---|
| Trial start rate | `trial_started` ÷ `free_trial_view` | Fit offre→action |
| Trial → inscription | `registration` ÷ `trial_started` | Santé du funnel |
| Inscription → checkout | `checkout_started` ÷ `registration` | Intention de monétisation |
| Conversion checkout | `payment_success` ÷ `checkout_started` | Friction paiement |
| Abandon checkout | `checkout_abandoned` ÷ `checkout_started` | ROI récupération |
| Taux clic WhatsApp | `whatsapp_click` ÷ sessions | Demande couche closing |
| Complétion formulaire B2B | `institution_form_submit` ÷ `institution_form_start` | Qualité pipeline |
| Sessions organiques | GA4 organic (post-migration) | Déblocage SEO |
| CAC `[OWNER]` | Coût acquisition ÷ clients | Efficacité payante |
| LTV `[OWNER]` | Revenu moyen par client | Soutenabilité |
| Rétention | Clients actifs / cohorte | Produit |

---

## 19. Budget Scenarios

`[EST]` — aucun budget engagé, aucun paiement effectué.

| Scénario | NGN/mois `[EST]` | Focus |
|---|---|---|
| **MINIMUM** | ₦150 000 - 300 000 | Organique, communautés, outils, parrainage |
| **GROWTH** | ₦800 000 - 1 500 000 | + production contenu, outils email, petits tests payants |
| **AGGRESSIVE** | ₦3 000 000 - 6 000 000 | + payant à l'échelle, partenariats, production vidéo |

Aucune campagne payante lancée. Toute dépense nécessite `[OWNER]`.

---

## 20. Plan 30 jours

| ACTION | RESPONSABLE | PRIORITÉ | EFFORT | IMPACT | KPI | DÉPENDANCE |
|---|---|---|---|---|---|---|
| Corriger liens free-trial | Dev/CRO | P0 | Faible | Élevé | Trial→reg | **FAIT** |
| Aligner CTA hero/académies | CRO/Content | P0 | Faible | Élevé | Trial start | **FAIT** |
| Retirer `es` du JSON-LD | SEO/Dev | P0 | Faible | Moyen | — | **FAIT** |
| Instrumenter GA4 | CRO/Dev | P0 | Moyen | Élevé | Tous KPI | **FAIT** |
| Barre de confiance hero | Content/CRO | P0 | Faible | Moyen | Trial start | **FAIT** |
| Construire checklists examens (M2) | Content/Lead Gen | P1 | Moyen | Moyen | Leads | Aucune |
| Configurer GSC + GBP/NAP | SEO | P1 | Faible | Moyen | Organique | `[OWNER]` adresse |
| Rédiger pages `/pricing`, `/free-trial`, `/institutions` | SEO/Content | P1 | Moyen | Élevé | Organique | Aucune |
| Préparer templates email (sans envoi) | Email | P1 | Moyen | Moyen | — | Consentement/auth |

---

## 21. Plan 60 jours

| ACTION | RESPONSABLE | PRIORITÉ | EFFORT | IMPACT | KPI | DÉPENDANCE |
|---|---|---|---|---|---|---|
| Publier 6 hubs académies | Content/SEO | P1 | Moyen | Élevé | Organique | Plan URL |
| Migration URL crawlable + prerender | Owner/Dev | P1 | Élevé | Très élevé | Organique | **`[OWNER]`** |
| Hreflang 6 langues (sans ES) | SEO/Dev | P1 | Moyen | Élevé | Indexation | Migration |
| One-pager + offre pilote B2B | Lead Gen/Content | P1 | Moyen | Moyen | B2B leads | **`[OWNER]`** |
| Lancer social 30 jours (organique) | Social | P2 | Moyen | Moyen | Engagement | Correctifs CTA |
| Push parrainage | CRO/Lead Gen | P2 | Faible | Moyen | `referral_applied` | Correctifs CTA |
| 5 articles SEO prioritaires | Content/SEO | P1 | Moyen | Élevé | Organique | Pages live |

---

## 22. Plan 90 jours

| ACTION | RESPONSABLE | PRIORITÉ | EFFORT | IMPACT | KPI | DÉPENDANCE |
|---|---|---|---|---|---|---|
| Armement séquences email | Email/Dev | P1 | Élevé | Élevé | Trial→paid | Consentement + auth domaine |
| Sitemap + backlinks + avis locaux | SEO | P1 | Moyen | Moyen | Organique | GBP/NAP |
| Ouvrir tests payants | Lead Gen | P3 | Moyen | Élevé | CAC | Pages non vides + budget `[OWNER]` |
| Programme témoignages consentis | Content/Owner | P2 | Moyen | Élevé | Conversion | **`[OWNER]`** |
| Récupération checkout opérationnelle | CRO/Email | P1 | Moyen | Élevé | `payment_success` | Séquence + consentement |
| Reporting KPI mensuel | Growth | P1 | Faible | Moyen | Tous | GA4 + GSC |

---

## 23. Agent Contributions

| Agent | Apport principal |
|---|---|
| **marketing-strategist** | Thèse 90 jours, positionnement, personas, arbitrages, plan 30/60/90, budget |
| **market-researcher** | Priorisation marchés, segments, concurrents, risques, top conclusions |
| **seo-specialist** | Contrainte hash routing, roadmap SEO, clusters, local SEO, correctif `es` |
| **content-copywriter** | 9 piliers, calendrier 18 pièces, système de copie, 6 landing pages |
| **social-media-manager** | Priorisation plateformes, playbooks B2C/B2B, calendrier 30 j, WhatsApp |
| **lead-generation-specialist** | 6 lead magnets, canaux P1/P2/P3, pipeline B2B, partenariats |
| **email-marketing-specialist** | 8 séquences, segmentation, délivrabilité, NDPR, RTL |
| **growth-cro-analyst** | Audit funnel, P0/P1/P2, instrumentation, blueprint conversion |
| **DeepSeek (orchestrateur)** | Coordination, arbitrages, implémentation technique, tests, déploiement, vérification |

---

## 24. Conflicts Between Agents

| # | Conflit | Résolution DeepSeek |
|---|---|---|
| 1 | Social/Content affirment « RU n'est pas une interface » et « OG = Five Languages » | **Faux.** RU est une interface active ; OG/title = « Six Languages ». Corrigé/invalide. |
| 2 | SEO veut migration URL (propriétaire) vs CRO veut correctifs immédiats | **Scission** : correctifs maintenant, migration en décision propriétaire. |
| 3 | CRO veut des témoignages vs Content dit « bloqué » | **Content gagne** : preuve vérifiable uniquement, pas de témoignages inventés. |
| 4 | Email veut des séquences vs pas de consentement/NDPR | **Architecture seulement, aucun envoi** tant que consentement + auth domaine. |
| 5 | Lead Gen veut Google payant vs `/courses`/`/live` vides | **Reporter le payant** jusqu'à contenu non vide. |
| 6 | SEO retirer `es` du JSON-LD vs conserver ressources `es` | **Retirer du JSON-LD uniquement ; garder `es.json` masqué.** |
| 7 | Lead Gen pipeline B2B vs aucune offre/prix B2B | **Qualifier via formulaire ; ne pas citer de prix** `[OWNER]`. |

---

## 25. DeepSeek Final Decisions

1. **Réparer avant de payer** : priorité absolue aux correctifs de conversion (exécuté).
2. **RU = interface active**, ES = masqué, ressources ES conservées (conforme à la règle).
3. **Aucun témoignage publié** sans consentement écrit et vérification.
4. **Aucune campagne, aucun email, aucun contact prospect** pendant cette mission (respecté).
5. **Instrumenter d'abord** : les nouveaux événements GA4 permettront de mesurer lead→trial→client.
6. **Migration d'URL et offre B2B** = décisions propriétaires qui conditionnent l'échelle.
7. **Ne pas modifier les prix** sans données ; ne pas réactiver ES.

---

## 26. Technical Improvements Implemented

**Commit** : `c9b5822` — `feat(cro,marketing): corrige liens free-trial, aligne CTA vers l'essai,
CTA 'try free' academies, instrumentation funnel, knowsLanguage sans es`
**Déploiement** : Firebase Hosting `ela-academy-7f868` → **release complete**.

| Fichier | Modification |
|---|---|
| `src/ela/pages/free-trial.page.js` | Lien leçon instant `#/lesson/<id>` → `#/lesson?id=<id>` (bug bloquant) ; `data-academy` ; événement `trial_lesson_started` ; événement `signup_modal_open` |
| `js/app.js` | CTA hero, CTA final et CTA pricing → `#/free-trial` ; ligne de confiance hero (`trial.hero.micro`) ; événements `plan_selected`, `institution_form_start`, `institution_form_submit`, `registration_step_complete` (1/2/3), `referral_applied` |
| `src/ela/pages/academies-public.page.js` | CTA secondaire « Essai gratuit » par carte + CTA bas de page → `#/free-trial` |
| `assets/css/main.css` | Styles `.academy-card-actions`, `.academy-card-try`, `.hero-side .hero-trust` |
| `index.html` | `knowsLanguage` : retrait de `es`, ajout de `ru` ; CTA nav + footer → `#/free-trial` |

### Tests

- **Syntaxe** : `node --check` OK sur `app.js`, `marketing.js` ; `--input-type=module --check` OK sur
  `free-trial.page.js` et `academies-public.page.js`.
- **CSS** : accolades équilibrées (771/771) ; grille 3/2/1 présente ; `.academy-card-try` et
  `.hero-side .hero-trust` présents.
- **Rendu JS (harnais Node, sans navigateur)** : 6 cartes, 6 wrappers d'actions, 6 CTA « Essai
  gratuit », 6 CTA « SUBSCRIBE », 7 liens `/free-trial`, 6 `dir="auto"`, aucune académie ES,
  Russophone présent, flagship unique, ordre FR/DE/ZH/EN/AR/RU → **PASS**.
- **i18n** : clés `nav.freeTrial` et `trial.hero.micro` présentes dans les 6 dictionnaires actifs.
- **Production (vérification live, 13/13)** : `knowsLanguage` sans `es` avec `ru` ; nav CTA `/free-trial` ;
  hero CTA `/free-trial` ; hero-trust ; `plan_selected` ; `institution_form_*` ;
  `registration_step_complete` ; `#/lesson?id=` ; `trial_lesson_started` ; CTA « try free » académies ;
  aucune trace ES ; CSS try-btn/hero-trust ; grille 3/2/1.

---

## 27. Remaining Owner Inputs

> **OWNER INPUT REQUIRED** — aucune donnée propriétaire n'a été inventée.

1. **Migration d'URL** (hash → chemins réels + prerender) — débloque SEO + hreflang.
2. **Offre & prix B2B** — actuellement formulaire d'intérêt seul.
3. **Programme témoignages** (consentement écrit, photos) — aucun témoignage vérifié à ce jour.
4. **Consentement/NDPR + authentification email** (SPF/DKIM/DMARC) — prérequis avant tout envoi.
5. **Budget média payant** — à valider, et seulement après pages `/courses` et `/live` non vides.
6. **Accès Google Search Console / GA4 / Bing Webmaster**.
7. **Adresse/service physique** pour Google Business Profile (NAP).
8. **Capacité commerciale B2B** (qui répond aux leads, SLA).
9. **Bios professeurs, taux de réussite, statut des classes live** pour toute affirmation.
10. **Décision long terme sur ES** (rester masqué / réactiver un jour).
11. **Outil d'emailing** et domaine d'envoi.
12. **Confirmation des conditions de parrainage** (₦15 000 / ₦10 000) avant mention en email.

---

## 28. Risks

| Risque | Impact | Mitigation |
|---|---|---|
| Friction paiement (échecs carte, FX) | Élevé | Moyens locaux (transfert/USSD/mobile money), acomptes |
| Confiance / accreditation | Élevé | Certificats vérifiables, politiques publiées, preuves réelles |
| Sensibilité au prix | Moyen | Parrainage, bourses, modules courts, tarifs groupe |
| Notoriété faible | Moyen | SEO, YouTube short, ambassadeurs campus, pilotes B2B |
| Offre live/professeurs non délivrée | Élevé | Vérifier la capacité avant de promouvoir Premium |
| Contenu `/courses`/`/live` vide | Élevé | Ne pas lancer de payant avant remplissage |
| Routing hash (non indexable) | Très élevé | Migration d'URL `[OWNER]` |
| Aucun témoignage vérifié | Moyen | Preuve vérifiable uniquement ; programme de consentement |
| Dépendance capacité petite équipe | Moyen | Repurposing, cadence réaliste, priorisation |

---

## 29. Next Actions

1. **Valider les correctifs en production** (fait) et surveiller `trial_lesson_started` /
   `trial_started` / `registration` dans GA4 sur 7-14 jours.
2. **Produire les 6 checklists d'examen** (M2) comme lead magnets.
3. **Configurer GSC + GBP/NAP** dès réception des accès `[OWNER]`.
4. **Escalader au propriétaire** la migration d'URL (déblocage n°1) et l'offre B2B.
5. **Préparer (sans envoyer)** les séquences WELCOME + FREE TRIAL et l'authentification du domaine.
6. **Ne lancer aucune campagne payante** tant que `/courses` et `/live` ne sont pas remplis.

---

*Fin du rapport. Aucune campagne lancée, aucun email envoyé, aucun prospect contacté, aucune donnée fictive.*
