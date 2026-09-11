# ELA Academy — Séquences email lead magnets (PRÉPARÉES, NON ENVOYÉES)

> **Statut : architecture + contenu rédigé. AUCUN email n'est envoyé par le code livré.**
> Le fournisseur transactionnel existe déjà côté serveur (`sendEmail` dans `functions/core.js`, SendGrid v3, mode log si `SENDGRID_API_KEY` absent). Aucune automatisation marketing n'est branchée.
> Toute infrastructure manquante est marquée **NOT YET IMPLEMENTED** ou **OWNER INPUT REQUIRED**.

## 0. Contexte

- 6 académies : FR (CECRL), DE (Goethe-Zertifikat), ZH (HSK), EN (IELTS), AR (ALPT), RU (TORFL). **ES reste masqué.**
- Source de lead : collection Firestore `leadMagnetLeads` (créée par `src/ela/pages/lead-magnets.page.js`, règles `firestore.rules`).
- Offre : lead magnet gratuit → Free Trial (12 leçons sans compte, 24 avec compte) → abonnement payant.
- Consentement explicite stocké (`consent: true`) + locale + académie + objectif.

## 1. Les 7 emails (master, tokens par académie)

Variables : `{{lead_magnet_title}}`, `{{academy_label}}`, `{{academy_code}}`, `{{academy_route}}`, `{{sample_phrase}}`, `{{next_lesson}}`, `{{first_name}}`.

### Email 1 — Livraison du lead magnet
- **Timing :** Jour 0 + 0 min (à la création du lead)
- **Objectif :** confirmer l'opt-in, livrer l'actif, poser l'expéditeur.
- **Sujet :** `Your {{lead_magnet_title}} ({{academy_label}}) is ready` — alt : `Here's the {{academy_label}} download you requested`
- **Preheader :** `Open it now — plus how to use it in your next 10 minutes.`
- **Contenu :** remerciement ; 1 ligne « ce qu'il y a dedans » ; 1 ligne « comment l'utiliser aujourd'hui » ; demander d'ajouter l'expéditeur aux contacts.
- **CTA :** `Download {{lead_magnet_title}}` → `#/lead-magnets/{{academy_code}}`
- **Déclencheur :** lead créé, `consent = true`, non désabonné.

### Email 2 — Quick win (micro-engagement)
- **Timing :** Jour 0 + 6 h
- **Objectif :** petite victoire immédiate, intro douce au trial.
- **Sujet :** `Try this 5-minute {{academy_label}} warm-up` — alt : `A tiny {{academy_label}} exercise to start today`
- **Preheader :** `One exercise. No account needed.`
- **Contenu :** un exercice court (`{{sample_phrase}}` + `{{sample_task}}`) ; « la version guidée est gratuite ».
- **CTA :** `Start the free trial` → `#/free-trial`

### Email 3 — Comment fonctionne ELA
- **Timing :** Jour 2
- **Objectif :** clarifier la méthode (auto-rythmé + live + certificat).
- **Sujet :** `How {{academy_label}} works at ELA` — alt : `Self-paced + live: the ELA {{academy_label}} path`
- **Preheader :** `Lessons, live sessions, and CEFR-aligned levels.`
- **Contenu :** 3 blocs (leçons, sessions live, certificat) ; rappel du trial.
- **CTA :** `See the {{academy_label}} academy` → `#/academies` (secondaire : `#/free-trial`)

### Email 4 — Profondeur du parcours (crédibilité sans témoignage)
- **Timing :** Jour 4
- **Objectif :** rassurer par la structure réelle (niveaux, certificat).
- **Sujet :** `What you'll cover in {{academy_label}} — level by level` — alt : `Your {{academy_label}} roadmap, from first words to certificate`
- **Preheader :** `The path, the levels, and where the free trial fits.`
- **Contenu :** niveaux alignés CECR ; progression au rythme de l'apprenant ; sessions live pour l'oral ; certificat ELA. **Aucun témoignage / note / garantie.**
- **CTA :** `Explore {{academy_label}} levels` → `#/academies`

### Email 5 — Invitation principale au Free Trial
- **Timing :** Jour 6
- **Objectif :** conversion principale.
- **Sujet :** `Your {{academy_label}} free trial is one click away` — alt : `Ready to start {{academy_label}}? Your free trial is open`
- **Preheader :** `Begin with lesson 1 and see how it fits.`
- **Contenu :** récap magnet → méthode → trial ; « ce qui se passe au clic ».
- **CTA :** `Start my free trial` → `#/free-trial`
- **Exclusion :** si `trialStarted = true`, basculer vers l'onboarding.

### Email 6 — Branche starters / non-starters
- **Timing :** Jour 9
- **Objectif :** relancer les leads froids, accélérer les actifs.
- **Sujets :** non-starter `Still thinking about {{academy_label}}?` ; starter `Nice start — here's your next step in {{academy_label}}`
- **Preheaders :** non-starter `Three common reasons people pause — and how to move past them.` ; starter `One short session keeps your streak going.`
- **Contenu :** non-starter = temps/niveau/appareil, 1 ligne chacun ; starter = prochaine leçon + session live.
- **CTA :** `#/free-trial`
- **Déclencheur :** branche sur `trialStarted`.

### Email 7 — Récap + CTA final (aucune fausse urgence)
- **Timing :** Jour 13
- **Objectif :** dernière touche structurée, clôture respectueuse.
- **Sujet :** `Last note from ELA about your {{academy_label}} trial` — alt : `Ready when you are — your {{academy_label}} path`
- **Preheader :** `A quick recap and one link to start.`
- **Contenu :** récap 3 lignes ; un seul CTA ; pas de compte à rebours ni de remise inventée ; option rester/désabonner.
- **CTA :** `Start free trial` → `#/free-trial` (secondaire : `#/academies`)
- **Après envoi :** `status = nurture_complete` (sauf conversion).

## 2. Adaptation par académie (7 templates, pas 42 emails)

| Token | french | german | mandarin | english | arabic | russian |
|---|---|---|---|---|---|---|
| `academy_key` | french | german | mandarin | english | arabic | russian |
| `academy_code` | FR | DE | ZH | EN | AR | RU |
| `academy_label` | French | German | Mandarin | English | Arabic | Russian |
| `academy_route` | `#/academies` | `#/academies` | `#/academies` | `#/academies` | `#/academies` | `#/academies` |
| `lead_magnet_title` | voir `lead-magnets.data.js` | idem | idem | idem | idem | idem |
| `sample_phrase` | OWNER INPUT REQUIRED | idem | idem | idem | idem | idem |

Stockage recommandé : un objet `ACADEMY_EMAIL_VARS` ; les templates référencent les tokens. Les différences de contenu se limitent à ≤ 5 tokens par académie.

## 3. Multilingue (EN/FR/AR/DE/RU/ZH)

- Résolution au moment de l'envoi : `lang = lead.locale || 'en'`.
- Rendu : `EMAIL_I18N[lang][templateId]` → sujet, preheader, corps, libellé CTA.
- **Écart serveur connu (NOT YET IMPLEMENTED) :** `VALID_INTERFACE_LANGS` et la table `EMAIL` dans `functions/` couvrent seulement `en/fr/ar`. Étendre à `de/ru/zh` = **OWNER INPUT REQUIRED**.
- AR : `lang="ar" dir="rtl"`, alignement CTA miroir, routes et marque en LTR.
- Repli : bloc anglais si traduction manquante ; jamais de champ vide.
- ES : jamais présent.

## 4. Architecture technique recommandée (avec l'existant)

**Existe :** `sendEmail({to, subject, text})` (SendGrid, log sans clé) ; `leadMagnetLeads` (capture) ; `window.ELAMarketing.track`.

**À construire (NOT YET IMPLEMENTED) :**
1. `onLeadCreated` (Firestore `onCreate`) : valide le consentement, initialise `sequence {step:0, nextSendAt:now, status:'active'}`, envoie Email 1.
2. `processEmailSequence` (fonction planifiée, ex. toutes les 15 min) : traite les leads dus, avance `step`/`nextSendAt`, journalise.
3. Branche Email 6 sur `trialStarted`.
4. Route de désabonnement signée → `status = 'unsubscribed'`.

**Décisions OWNER INPUT REQUIRED :** clé `SENDGRID_API_KEY` (scope Mail Send) + `SENDGRID_FROM` vérifié ; support HTML/`List-Unsubscribe` (aujourd'hui texte brut mono-destinataire) ; choix fonction planifiée vs SendGrid Marketing/Automation ; templates dans SendGrid ou en code.

## 5. Délivrabilité & conformité

- Consentement explicite non pré-coché, preuve stockée (texte, timestamp, IP, user-agent).
- Lien de désabonnement visible + en-têtes `List-Unsubscribe` / `List-Unsubscribe-Post`.
- SPF + DKIM + DMARC sur le domaine d'envoi ; warm-up ; suppression auto des hard bounces.
- GDPR (UE/UK) et Nigeria NDPA 2023 / NDPR : base légale = consentement ; droits de retrait/accès/rectification/suppression ; minimisation ; transferts transfrontaliers (Twilio SendGrid).
- Aucune liste achetée ; aucune relance hors consentement.

## 6. KPI (fourchettes à valider, aucune baseline inventée)

| KPI | Cible de validation |
|---|---|
| Taux de hard bounce | < 2 % |
| Taux de plainte spam | < 0,1 % |
| Livraison Email 1 | > 97 % |
| Désabonnements | < 0,5 % par envoi |
| Taux d'ouverture | à établir sur les 2 premiers envois |
| CTR Email 5 | à établir puis améliorer |
| Lead → trial (14 j) | à établir |
| Delta branche Email 6 | comparer starter vs non-starter |

Baselines actuelles : **OWNER INPUT REQUIRED**.
