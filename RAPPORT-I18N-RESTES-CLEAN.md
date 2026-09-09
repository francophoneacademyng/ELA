# RAPPORT I18N — RESTES (CLEAN) — Audit vérifié, passe 1.5

## 1. Résumé

| Métrique | Nombre |
| --- | --- |
| Fichiers admin concernés | 19 |
| Fichiers teacher concernés | 11 |
| Fichiers immersifs / hub étudiant | 4 |
| Chaînes FR réellement hardcodées (admin) | 116 |
| Chaînes FR réellement hardcodées (teacher) | 96 |
| Chaînes FR réellement hardcodées (immersif/hub) | 2 |
| Chaînes EN réellement hardcodées (admin) | 10 |
| Chaînes EN réellement hardcodées (teacher) | 0 |
| Chaînes EN réellement hardcodées (immersif/hub) | 16 |
| Chaînes déjà partiellement i18n (C) | 3 |
| Faux positifs du scan automatique | 8 (voir §7) |
| Note scanner | Le scan initial sous-comptait les titres/sous-titres passés en objet `renderShell({title…})` ; ils sont réintégrés ici. |

## 2. Admin

| Fichier | Ligne | Texte réel | Type | Clé i18n recommandée |
| --- | --- | --- | --- | --- |
| `js/admin/pages/admin-shell.js` | 20 | ELA Admin (sidebar-brand) | EN hardcodé | réutiliser tel quel (marque) ou admin.sidebar.brand |
| `js/admin/pages/admin-shell.js` | 22 | 🏠 Vue d'ensemble | FR hardcodé | admin.overview (existe) |
| `js/admin/pages/admin-shell.js` | 23 | Gestion (groupe) | FR hardcodé | admin.navGroup.gestion (nouvelle) |
| `js/admin/pages/admin-shell.js` | 24 | 🔴 Classes Live | FR hardcodé | admin.live (existe, FR « Classes live ») |
| `js/admin/pages/admin-shell.js` | 25 | 👥 Utilisateurs | FR hardcodé | admin.users (existe) |
| `js/admin/pages/admin-shell.js` | 26 | 👨‍🏫 Enseignants | FR hardcodé | admin.teachers (nouvelle) |
| `js/admin/pages/admin-shell.js` | 27 | 🎓 Académies | FR hardcodé | admin.academies (nouvelle) |
| `js/admin/pages/admin-shell.js` | 28 | Contenu & Comm. (groupe) | FR hardcodé | admin.navGroup.content (nouvelle) |
| `js/admin/pages/admin-shell.js` | 29 | 📚 Contenu | FR hardcodé | admin.content (nouvelle) |
| `js/admin/pages/admin-shell.js` | 30 | 💬 WhatsApp | FR hardcodé | admin.whatsapp (nouvelle) |
| `js/admin/pages/admin-shell.js` | 31 | Finance (groupe) | FR hardcodé | admin.navGroup.finance (nouvelle) |
| `js/admin/pages/admin-shell.js` | 32 | 💳 Paiements | FR hardcodé | admin.payments (existe) |
| `js/admin/pages/admin-shell.js` | 33 | 🎁 Parrainages | FR hardcodé | admin.referrals (existe) |
| `js/admin/pages/admin-shell.js` | 34 | 📄 Factures perso. | FR hardcodé | admin.invoices (nouvelle) |
| `js/admin/pages/admin-shell.js` | 35 | Certifications (groupe) | FR hardcodé | admin.navGroup.certifications (nouvelle) |
| `js/admin/pages/admin-shell.js` | 36 | 🏆 Certificats | FR hardcodé | admin.certs.title (existe) |
| `js/admin/pages/admin-shell.js` | 37 | Système (groupe) | FR hardcodé | admin.navGroup.system (nouvelle) |
| `js/admin/pages/admin-shell.js` | 38 | 🛠 Outils système | FR hardcodé | admin.tools (nouvelle) |
| `js/admin/pages/admin-shell.js` | 91 | La plateforme démarre | FR hardcodé | admin.empty.startup.title (nouvelle) |
| `js/admin/pages/admin-shell.js` | 93 | Aucune donnée à afficher pour le moment. Les statistiques apparaîtront dès les premiers comptes et paiements. | FR hardcodé | admin.empty.startup.body (nouvelle) |
| `js/admin/pages/admin-shell.js` | 94 | 🔄 Rafraîchir | FR hardcodé | admin.refresh (existe) |
| `js/admin/pages/admin-shell.js` | 98 | Accès administrateur requis | FR hardcodé | admin.forbidden (existe) |
| `js/admin/pages/admin-shell.js` | 104 | Session expirée | FR hardcodé | admin.session.expired (nouvelle) |
| `js/admin/pages/admin-shell.js` | 105 | Reconnectez-vous pour accéder au panel d'administration. | FR hardcodé | admin.session.expired.body (nouvelle) |
| `js/admin/pages/admin-shell.js` | 111 | Données momentanément indisponibles | FR hardcodé | admin.unavailable.title (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 48 | Utilisateurs 👥 (titre) | FR hardcodé | admin.users.title (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 49 | Comptes, formules et académies des étudiants ELA. (sous-titre) | FR hardcodé | admin.users.subtitle (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 88 | Rechercher un nom ou un email… | FR hardcodé | admin.searchPlaceholder (existe, « Rechercher par nom ou e-mail ») |
| `js/admin/pages/admin-users.page.js` | 89 | 🔄 Rafraîchir | FR hardcodé | admin.refresh (existe) |
| `js/admin/pages/admin-users.page.js` | 92 | ÉTUDIANT / ID / FORMULE / EXPIRE / INSCRIT / ACTION (headers) | FR hardcodé | admin.users.col.* (nouvelles) |
| `js/admin/pages/admin-users.page.js` | 97 | Aucun utilisateur inscrit | FR hardcodé | admin.users.empty.title (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 98 | Les comptes apparaîtront ici dès les premières inscriptions. | FR hardcodé | admin.users.empty.body (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 119 | Gérer (bouton) | FR hardcodé | admin.manage (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 134 | Gérer l'utilisateur (modale) | FR hardcodé | admin.manageUser.title (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 134 | Rôle | FR hardcodé | admin.role (existe) |
| `js/admin/pages/admin-users.page.js` | 135 | Student / Instructor / Administrator (options) | EN hardcodé | admin.role.student / admin.role.teacher / admin.role.admin (nouvelles) |
| `js/admin/pages/admin-users.page.js` | 138 | Formule | FR hardcodé | admin.plan (existe) |
| `js/admin/pages/admin-users.page.js` | 139 | Free / General Path / Premium Path / Business French (options) | EN hardcodé | pricing.general/premium/business + admin.plan.free (voir §6) |
| `js/admin/pages/admin-users.page.js` | 143 | Durée d'engagement | FR hardcodé | admin.duration (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 144 | 1 mois / 3 mois / 6 mois (options) | EN hardcodé | checkout.month.1/3/6 (existent) |
| `js/admin/pages/admin-users.page.js` | 147 | Académie | FR hardcodé | admin.academy (existe) |
| `js/admin/pages/admin-users.page.js` | 147 | 🇫🇷 Francophone Academy … (options académie) | EN hardcodé | academies.config labels (voir §6) |
| `js/admin/pages/admin-users.page.js` | 148 | Statut actuel : | FR hardcodé | admin.currentStatus (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 148 | Chargement… | FR hardcodé | common.loading (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 150 | Annuler | FR hardcodé | admin.cancel (existe) |
| `js/admin/pages/admin-users.page.js` | 151 | Révoquer l'abonnement | FR hardcodé | admin.revokeSubscription (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 152 | Enregistrer | FR hardcodé | admin.save (nouvelle) |
| `js/admin/pages/admin-users.page.js` | 194 | Abonnement actif — / Compte sans abonnement — | FR hardcodé | admin.status.activeSub / admin.status.noSub (nouvelles) |
| `js/admin/pages/admin-teachers.page.js` | 30 | Gestion des enseignants 👨‍🏫 (titre) | FR hardcodé | admin.teachers.title (nouvelle) |
| `js/admin/pages/admin-teachers.page.js` | 31 | Tous les comptes enseignant de la plateforme. (sous-titre) | FR hardcodé | admin.teachers.subtitle (nouvelle) |
| `js/admin/pages/admin-teachers.page.js` | 43 | Nom / Email / Académie / Rôle / Membre depuis (headers) | FR hardcodé | admin.name, admin.email, admin.academy, admin.role, admin.teachers.col.memberSince (nouvelle pour ce dernier) |
| `js/admin/pages/admin-teachers.page.js` | 48 | Aucun enseignant enregistré pour le moment. | FR hardcodé | admin.teachers.empty (nouvelle) |
| `js/admin/pages/admin-content.page.js` | 26 | Contenu 📚 (titre) | FR hardcodé | admin.content.title (nouvelle) |
| `js/admin/pages/admin-content.page.js` | 27 | Bibliothèque de cours et leçons. (sous-titre) | FR hardcodé | admin.content.subtitle (nouvelle) |
| `js/admin/pages/admin-content.page.js` | 59 | 📹 Ouvrir le studio vidéo | FR hardcodé | admin.content.openStudio (nouvelle) |
| `js/admin/pages/admin-content.page.js` | 60 | 🎬 Bibliothèque vidéo | FR hardcodé | admin.content.videoLibrary (nouvelle) |
| `js/admin/pages/admin-content.page.js` | 90 | En attente | FR hardcodé | teacher.status.pending (existe) |
| `js/admin/pages/admin-content.page.js` | 92 | Approuvé | FR hardcodé | teacher.status.approved (existe) |
| `js/admin/pages/admin-content.page.js` | 93 | Rejeté | FR hardcodé | teacher.status.rejected (existe) |
| `js/admin/pages/admin-content.page.js` | 95 | Approuver | FR hardcodé | admin.approve (existe) |
| `js/admin/pages/admin-content.page.js` | 96 | Rejeter | FR hardcodé | admin.reject (existe) |
| `js/admin/pages/admin-content.page.js` | 98 | Tout est à jour — Aucun contenu en attente de validation. / Aucun élément dans cette catégorie pour le moment. | FR hardcodé | admin.content.empty (nouvelle) |
| `js/admin/pages/admin-content.page.js` | 106 | Contenu / Type / Auteur / Date / Statut / Action (headers) | FR hardcodé | admin.content.col.* (nouvelles, « Auteur » → admin.author) |
| `js/admin/pages/admin-certificates.page.js` | 18 | Certifications 🏆 (titre) | FR hardcodé | admin.certs.title (existe) |
| `js/admin/pages/admin-certificates.page.js` | 19 | Certificats ELA délivrés et vérification publique. (sous-titre) | FR hardcodé | admin.certs.subtitle (nouvelle) |
| `js/admin/pages/admin-certificates.page.js` | 31 | Vérifier un certificat | FR hardcodé | admin.certs.verifySection (nouvelle) |
| `js/admin/pages/admin-certificates.page.js` | 34 | Identifiant du certificat (ex : ELA-…) | FR hardcodé | admin.certs.verifyPlaceholder (nouvelle) |
| `js/admin/pages/admin-certificates.page.js` | 36 | Vérifier | FR hardcodé | admin.certs.verify (nouvelle) |
| `js/admin/pages/admin-certificates.page.js` | 40 | Certificats émis | FR hardcodé | admin.certs.issuedSection (nouvelle) |
| `js/admin/pages/admin-certificates.page.js` | 52 | Saisissez un identifiant de certificat. | FR hardcodé | admin.certs.verifyEmpty (nouvelle) |
| `js/admin/pages/admin-certificates.page.js` | 57 | Aucun certificat trouvé pour « {id} ». | FR hardcodé | admin.certs.empty (existe — placeholder {id} à intégrer) |
| `js/admin/pages/admin-certificates.page.js` | 61 | Actif / Révoqué | FR hardcodé | dashboard.status.active / admin.certs.status.revoked (nouvelles) |
| `js/admin/pages/admin-certificates.page.js` | 65 | ID / Étudiant / Académie / Niveau / Statut (headers) | FR hardcodé | admin.certs.* + academies label (existent) |
| `js/admin/pages/admin-invoices.page.js` | 15 | Factures personnalisées 📄 (titre) | FR hardcodé | admin.invoices.title (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 16 | Facturation manuelle. (sous-titre) | FR hardcodé | admin.invoices.subtitle (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 37 | + Nouvelle facture personnalisée | FR hardcodé | admin.invoices.create (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 42 | Chargement… | FR hardcodé | common.loading (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 46 | Aucune facture personnalisée | FR hardcodé | admin.invoices.empty.title (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 47 | Créez votre première facture avec le bouton ci-dessus. | FR hardcodé | admin.invoices.empty.body (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 55 | Nouvelle facture personnalisée | FR hardcodé | admin.invoices.create.title (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 56 | Nom du client | FR hardcodé | admin.invoices.clientName (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 57 | Email du client | FR hardcodé | admin.invoices.clientEmail (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 58 | Programme | FR hardcodé | admin.plan (existe) |
| `js/admin/pages/admin-invoices.page.js` | 59 | General Path / Premium Path / Business French (options) | EN hardcodé | pricing.general/premium/business |
| `js/admin/pages/admin-invoices.page.js` | 62 | Durée | FR hardcodé | admin.duration (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 63 | 1 mois / 3 mois / 6 mois (options) | EN hardcodé | checkout.month.1/3/6 (existent) |
| `js/admin/pages/admin-invoices.page.js` | 66 | Fréquence des cours | FR hardcodé | admin.invoices.frequency (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 67 | Montant (NGN) | FR hardcodé | admin.amount (existe) |
| `js/admin/pages/admin-invoices.page.js` | 69 | Annuler | FR hardcodé | admin.cancel (existe) |
| `js/admin/pages/admin-invoices.page.js` | 70 | Créer la facture | FR hardcodé | admin.invoices.create.submit (nouvelle) |
| `js/admin/pages/admin-invoices.page.js` | 149 | 🔗 Lien / ✉️ Email / 📱 WhatsApp (actions) | FR hardcodé | admin.link (existe), admin.invoices.email, admin.invoices.whatsapp |
| `js/admin/pages/admin-live.page.js` | 19 | Classes Live 🔴 (titre) | FR hardcodé | admin.live.title (nouvelle) |
| `js/admin/pages/admin-live.page.js` | 29 | Aucune classe live programmée | FR hardcodé | admin.live.empty.title (nouvelle) |
| `js/admin/pages/admin-live.page.js` | 30 | Les sessions apparaîtront ici dès leur programmation par les enseignants. | FR hardcodé | admin.live.empty.body (nouvelle) |
| `js/admin/pages/admin-payments.page.js` | 17 | Paiements (titre) | FR hardcodé | admin.payments.title (nouvelle) |
| `js/admin/pages/admin-payments.page.js` | 57 | Aucune transaction | FR hardcodé | admin.payments.empty.title (nouvelle) |
| `js/admin/pages/admin-payments.page.js` | 58 | Les paiements Paystack apparaîtront ici. | FR hardcodé | admin.payments.empty.body (nouvelle) |
| `js/admin/pages/admin-payments.page.js` | 64 | Paid / Pending / Cancelled (labels statut) | EN hardcodé | dashboard.tx.success/pending/failed + new cancelled |
| `js/admin/pages/admin-referrals.page.js` | 16 | Parrainages 🎁 (titre) | FR hardcodé | admin.referrals.title (nouvelle) |
| `js/admin/pages/admin-referrals.page.js` | 46 | Aucun parrainage enregistré | FR hardcodé | admin.referrals.empty.title (nouvelle) |
| `js/admin/pages/admin-referrals.page.js` | 47 | Les parrainages apparaîtront ici dès les premières inscriptions. | FR hardcodé | admin.referrals.empty.body (nouvelle) |
| `js/admin/pages/admin-referrals.page.js` | 56 | Validé / En attente | FR hardcodé | teacher.status.approved/pending ou dashboard.tx.* |
| `js/admin/pages/admin-revenue.page.js` | 78 | Paiements récents | FR hardcodé | admin.revenue.recent (nouvelle) |
| `js/admin/pages/admin-revenue.page.js` | 82 | Date / Utilisateur / Formule / Montant / Statut (headers) | FR hardcodé | admin.date, admin.users, admin.plan, admin.amount, admin.status (existent) |
| `js/admin/pages/admin-revenue.page.js` | 85 | Aucun paiement enregistré pour le moment. | FR hardcodé | admin.revenue.empty (nouvelle) |
| `js/admin/pages/admin-tools.page.js` | 24 | Outils système 🛠 (titre) | FR hardcodé | admin.tools.title (nouvelle) |
| `js/admin/pages/admin-tools.page.js` | 38 | Exécuter | FR hardcodé | admin.execute (nouvelle) |
| `js/admin/pages/admin-tools.page.js` | 53 | Exécuter « {fn} » maintenant ? (confirm) | FR hardcodé | admin.tools.confirm (nouvelle, placeholder {fn}) |
| `js/admin/pages/admin-whatsapp.page.js` | 15 | WhatsApp 💬 (titre) | FR hardcodé | admin.whatsapp.title (nouvelle) |
| `js/admin/pages/admin-whatsapp.page.js` | 42 | Aucune activité WhatsApp | FR hardcodé | admin.whatsapp.empty.title (nouvelle) |
| `js/admin/pages/admin.page.js` | 55 | Chargement des données… | FR hardcodé | common.loading (nouvelle) |
| `js/admin/pages/admin.page.js` | 110 | Approuver / Rejeter | FR hardcodé | admin.approve / admin.reject (existent) |
| `js/admin/pages/admin.page.js` | 114 | En attente | FR hardcodé | teacher.status.pending (existe) |
| `js/admin/pages/admin.page.js` | 123 | Bonjour, Administrateur 👋 | FR hardcodé | admin.hello (nouvelle) |
| `js/admin/pages/admin.page.js` | 131 | Académies (section) | FR hardcodé | admin.academies (nouvelle) |
| `js/admin/pages/admin.page.js` | 134 | Certifications (section) | FR hardcodé | admin.certs.title (existe) |
| `js/admin/pages/admin.page.js` | 176 | Tout est à jour — Aucun contenu en attente de validation. | FR hardcodé | admin.empty (existe) |
| `js/admin/pages/admin.page.js` | 178 | Contenu / Type / Auteur / Date / Statut / Action (headers) | FR hardcodé | admin.content.col.* |
| `js/admin/pages/admin.page.js` | 189 | Seed Live Classes | EN hardcodé | dev only — à conserver en EN ou admin.tools.seedLive |
| `js/admin/components/reject-modal.js` | 11 | Rejeter ce contenu | FR hardcodé | admin.confirmReject (existe, « Confirmer le rejet ») |
| `js/admin/components/reject-modal.js` | 12 | Motif du rejet (obligatoire) | FR hardcodé | admin.rejectReason (existe) |
| `js/admin/components/reject-modal.js` | 14 | Expliquez pourquoi ce contenu est rejeté… | FR hardcodé | admin.rejectReason.placeholder (nouvelle) |
| `js/admin/components/reject-modal.js` | 17 | Annuler | FR hardcodé | admin.cancel (existe) |
| `js/admin/components/reject-modal.js` | 18 | Confirmer le rejet | FR hardcodé | admin.confirmReject (existe) |
| `js/admin/pages/sections/users.js` | 16 | Nom / Email / Rôle / Académie / Date (headers, via t) — « Email » et valeurs académie en dur | déjà partiellement i18n | admin.email (existe) + academy labels |
| `js/admin/pages/sections/certifications.js` | 77 | Certificats momentanément indisponibles | FR hardcodé | admin.certs.loadError (existe) |
| `js/admin/pages/sections/overview.js` | 41 | Seed Live Classes | EN hardcodé | dev only — admin.tools.seedLive |
| `js/admin/pages/sections/revenue.js` | 33 | Plan / etc. headers via t — « plan » et labels mixés | déjà partiellement i18n | admin.plan (existe) |
| `js/admin/pages/sections/validation.js` | 41 | Auteur · Académie · date (ligne muted via t partiel) | déjà partiellement i18n | admin.teacher + academy labels |

## 3. Teacher

| Fichier | Ligne | Texte réel | Type | Clé i18n recommandée |
| --- | --- | --- | --- | --- |
| `js/teacher/pages/teacher-shell.js` | 17 | ELA Enseignant (sidebar-brand) | FR hardcodé | teacher.sidebar.brand (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 19 | 🏠 Tableau de bord | FR hardcodé | teacher.sidebar.dashboard (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 20 | Contenu (groupe) | FR hardcodé | teacher.navGroup.content (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 21 | 📚 Mes cours | FR hardcodé | teacher.sidebar.courses (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 22 | 📝 Mes quiz | FR hardcodé | teacher.sidebar.quizzes (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 23 | 🔴 Mes classes Live | FR hardcodé | teacher.sidebar.live (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 24 | Gestion (groupe) | FR hardcodé | teacher.navGroup.management (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 25 | 👥 Mes étudiants | FR hardcodé | teacher.sidebar.students (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 26 | 📊 Statistiques | FR hardcodé | teacher.sidebar.stats (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 27 | Compte (groupe) | FR hardcodé | teacher.navGroup.account (nouvelle) |
| `js/teacher/pages/teacher-shell.js` | 28 | ⚙️ Mon profil | FR hardcodé | teacher.sidebar.profile (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 94 | 🏠 Tableau de bord | FR hardcodé | teacher.sidebar.dashboard |
| `js/teacher/pages/teacher.page.js` | 95 | Contenu (groupe) | FR hardcodé | teacher.navGroup.content |
| `js/teacher/pages/teacher.page.js` | 96 | 📚 Mes cours | FR hardcodé | teacher.sidebar.courses |
| `js/teacher/pages/teacher.page.js` | 97 | 📝 Mes quiz | FR hardcodé | teacher.sidebar.quizzes |
| `js/teacher/pages/teacher.page.js` | 98 | 🔴 Mes classes Live | FR hardcodé | teacher.sidebar.live |
| `js/teacher/pages/teacher.page.js` | 99 | Gestion (groupe) | FR hardcodé | teacher.navGroup.management |
| `js/teacher/pages/teacher.page.js` | 100 | 👥 Mes étudiants | FR hardcodé | teacher.sidebar.students |
| `js/teacher/pages/teacher.page.js` | 101 | 📊 Statistiques | FR hardcodé | teacher.sidebar.stats |
| `js/teacher/pages/teacher.page.js` | 102 | Compte (groupe) | FR hardcodé | teacher.navGroup.account |
| `js/teacher/pages/teacher.page.js` | 103 | ⚙️ Mon profil | FR hardcodé | teacher.sidebar.profile |
| `js/teacher/pages/teacher.page.js` | 107 | Bonjour, {name} 👋 | FR hardcodé | teacher.dashboard.hello (nouvelle, placeholder {name}) |
| `js/teacher/pages/teacher.page.js` | 109 | Bienvenue dans votre espace enseignant. | FR hardcodé | teacher.dashboard.subtitle (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 121 | Mes statistiques | FR hardcodé | teacher.dashboard.stats (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 128 | Actions rapides | FR hardcodé | teacher.dashboard.quickActions (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 130 | + Créer une leçon | FR hardcodé | teacher.dashboard.newLesson (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 131 | + Créer un quiz | FR hardcodé | teacher.dashboard.newQuiz (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 132 | + Créer une classe Live | FR hardcodé | teacher.dashboard.newLive (nouvelle) |
| `js/teacher/pages/teacher.page.js` | 135 | Mes soumissions | FR hardcodé | teacher.myContent (existe) |
| `js/teacher/pages/teacher.page.js` | 82 | Contenu / Type / Date / Statut (headers) | FR hardcodé | admin.content.col.* + admin.status |
| `js/teacher/pages/teacher.page.js` | 86 | Aucune soumission pour le moment. | FR hardcodé | teacher.noContent (existe) |
| `js/teacher/pages/teacher.page.js` | 87 | Commencez par créer votre première leçon ! | FR hardcodé | teacher.dashboard.emptyCTA (nouvelle) |
| `js/teacher/pages/teacher-courses.page.js` | 18 | Mes cours 📚 (titre) | FR hardcodé | teacher.sidebar.courses |
| `js/teacher/pages/teacher-courses.page.js` | 19 | Vos leçons et leur statut de validation. (sous-titre) | FR hardcodé | teacher.courses.subtitle (nouvelle) |
| `js/teacher/pages/teacher-courses.page.js` | 60 | Tous / Approuvés / En attente / Rejetés (filtres) | FR hardcodé | teacher.status.* (existent) |
| `js/teacher/pages/teacher-courses.page.js` | 69 | Aucun cours dans cette catégorie pour le moment. | FR hardcodé | teacher.courses.empty (nouvelle) |
| `js/teacher/pages/teacher-courses.page.js` | 70 | + Créer mon premier cours | FR hardcodé | teacher.courses.emptyCTA (nouvelle) |
| `js/teacher/pages/teacher-courses.page.js` | 80 | Titre / Date / Statut / Action (headers) | FR hardcodé | teacher.lesson.field.title + admin.date + admin.status |
| `js/teacher/pages/teacher-courses.page.js` | 76 | Publiée ✓ / Validation en cours | FR hardcodé | teacher.status.approved.published + teacher.status.pending.progress (nouvelles) |
| `js/teacher/pages/teacher-courses.page.js` | 85 | + Nouveau cours | FR hardcodé | teacher.courses.new (nouvelle) |
| `js/teacher/pages/teacher-quizzes.page.js` | 16 | Mes quiz 📝 (titre) | FR hardcodé | teacher.sidebar.quizzes |
| `js/teacher/pages/teacher-quizzes.page.js` | 42 | Aucun quiz pour le moment. | FR hardcodé | teacher.quizzes.empty (nouvelle) |
| `js/teacher/pages/teacher-quizzes.page.js` | 43 | + Créer mon premier quiz | FR hardcodé | teacher.quizzes.emptyCTA (nouvelle) |
| `js/teacher/pages/teacher-quizzes.page.js` | 53 | Titre / Date / Statut / Action (headers) | FR hardcodé | teacher.quiz.field.title + admin.date + admin.status |
| `js/teacher/pages/teacher-quizzes.page.js` | 49 | Publié ✓ / Validation en cours | FR hardcodé | teacher.status.* |
| `js/teacher/pages/teacher-quizzes.page.js` | 55 | + Nouveau quiz | FR hardcodé | teacher.quizzes.new (nouvelle) |
| `js/teacher/pages/teacher-live-list.page.js` | 17 | Mes classes Live 🔴 (titre) | FR hardcodé | teacher.sidebar.live |
| `js/teacher/pages/teacher-live-list.page.js` | 43 | Aucune classe Live pour le moment. | FR hardcodé | teacher.live.empty (nouvelle) |
| `js/teacher/pages/teacher-live-list.page.js` | 44 | + Programmer ma première classe | FR hardcodé | teacher.live.emptyCTA (nouvelle) |
| `js/teacher/pages/teacher-live-list.page.js` | 54 | Titre / Date / Lien / Statut (headers) | FR hardcodé | teacher.live.field.title + admin.link + admin.status |
| `js/teacher/pages/teacher-live-list.page.js` | 49 | Communiqué aux étudiants / Après validation | FR hardcodé | teacher.live.published / teacher.live.pending (nouvelles) |
| `js/teacher/pages/teacher-live-list.page.js` | 56 | + Nouvelle classe | FR hardcodé | teacher.live.new (nouvelle) |
| `js/teacher/pages/teacher-stats.page.js` | 17 | Mes statistiques 📊 (titre) | FR hardcodé | teacher.sidebar.stats |
| `js/teacher/pages/teacher-stats.page.js` | 52 | Aucune activité enregistrée pour le moment. | FR hardcodé | teacher.stats.empty (nouvelle) |
| `js/teacher/pages/teacher-stats.page.js` | 53 | Créez votre premier contenu pour voir vos statistiques évoluer. | FR hardcodé | teacher.stats.empty.body (nouvelle) |
| `js/teacher/pages/teacher-stats.page.js` | 61 | Contenu / Type / Date / Statut (headers) | FR hardcodé | admin.content.col.* |
| `js/teacher/pages/teacher-students.page.js` | 15 | Mes étudiants 👥 (titre) | FR hardcodé | teacher.sidebar.students |
| `js/teacher/pages/teacher-students.page.js` | 16 | Progression et activité de vos apprenants. (sous-titre) | FR hardcodé | teacher.students.subtitle (nouvelle) |
| `js/teacher/pages/teacher-students.page.js` | 19 | Chargement… | FR hardcodé | common.loading (nouvelle) |
| `js/teacher/pages/teacher-students.page.js` | 38 | Aucun étudiant inscrit à vos contenus pour le moment. | FR hardcodé | teacher.students.empty (nouvelle) |
| `js/teacher/pages/teacher-students.page.js` | 49 | Nom / Email / Progression / Dernière activité (headers) | FR hardcodé | admin.name + admin.email + dashboard.progress + teacher.students.col.lastActive (nouvelle) |
| `js/teacher/pages/teacher-profile.page.js` | 18 | Mon profil ⚙️ (titre) | FR hardcodé | teacher.sidebar.profile |
| `js/teacher/pages/teacher-profile.page.js` | 34 | Enseignant (fallback nom) | FR hardcodé | admin.teacher (existe) |
| `js/teacher/pages/teacher-profile.page.js` | 38 | Nom affiché | FR hardcodé | teacher.profile.displayName (nouvelle) |
| `js/teacher/pages/teacher-profile.page.js` | 42 | Email | FR hardcodé | admin.email (existe) |
| `js/teacher/pages/teacher-profile.page.js` | 46 | Académie | FR hardcodé | admin.academy (existe) |
| `js/teacher/pages/teacher-profile.page.js` | 48 | L'académie est attribuée par l'administration. | FR hardcodé | teacher.profile.academyHint (nouvelle) |
| `js/teacher/pages/teacher-profile.page.js` | 50 | Enregistrer | FR hardcodé | admin.save (nouvelle) |
| `js/teacher/pages/teacher-lesson.page.js` | 31 | Créer une leçon ✏️ (titre) | FR hardcodé | teacher.lesson.new.title (nouvelle) |
| `js/teacher/pages/teacher-lesson.page.js` | 32 | ← Retour au tableau de bord | FR hardcodé | teacher.backToDashboard (nouvelle) |
| `js/teacher/pages/teacher-lesson.page.js` | 34 | Titre | FR hardcodé | teacher.lesson.field.title (existe) |
| `js/teacher/pages/teacher-lesson.page.js` | 36 | Description | FR hardcodé | teacher.lesson.field.description (existe) |
| `js/teacher/pages/teacher-lesson.page.js` | 38 | Contenu | FR hardcodé | teacher.lesson.field.content (existe) |
| `js/teacher/pages/teacher-lesson.page.js` | 39 | Contenu de la leçon… | FR hardcodé | teacher.lessonContent (existe) |
| `js/teacher/pages/teacher-lesson.page.js` | 42 | Soumettre pour validation | FR hardcodé | teacher.submit (existe) |
| `js/teacher/pages/teacher-live.page.js` | 27 | Créer une classe Live 🔴 (titre) | FR hardcodé | teacher.live.new.title (nouvelle) |
| `js/teacher/pages/teacher-live.page.js` | 28 | ← Retour au tableau de bord | FR hardcodé | teacher.backToDashboard |
| `js/teacher/pages/teacher-live.page.js` | 30 | Titre de la session | FR hardcodé | teacher.live.field.title (existe) |
| `js/teacher/pages/teacher-live.page.js` | 32 | Date et heure | FR hardcodé | teacher.live.field.datetime (existe) |
| `js/teacher/pages/teacher-live.page.js` | 34 | Lien de réunion (Zoom / Meet) | FR hardcodé | teacher.live.field.link (existe) |
| `js/teacher/pages/teacher-live.page.js` | 36 | Soumettre pour validation | FR hardcodé | teacher.submit (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 29 | Créer un quiz 📝 (titre) | FR hardcodé | teacher.quiz.new.title (nouvelle) |
| `js/teacher/pages/teacher-quiz.page.js` | 30 | ← Retour au tableau de bord | FR hardcodé | teacher.backToDashboard |
| `js/teacher/pages/teacher-quiz.page.js` | 32 | Titre du quiz | FR hardcodé | teacher.quizTitle (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 33 | Ex : Quiz A1 — Vocabulaire de base | FR hardcodé | teacher.quiz.new.titlePlaceholder (nouvelle) |
| `js/teacher/pages/teacher-quiz.page.js` | 35 | + Ajouter une question | FR hardcodé | teacher.quiz.addQuestion (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 36 | Soumettre pour validation | FR hardcodé | teacher.submit (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 44 | Option {n} (correcte par défaut) | FR hardcodé | teacher.option + teacher.quiz.defaultCorrect (nouvelles, {n}) |
| `js/teacher/pages/teacher-quiz.page.js` | 46 | Réponse (placeholder) | FR hardcodé | teacher.quiz.answer (nouvelle) |
| `js/teacher/pages/teacher-quiz.page.js` | 49 | Question {n} | FR hardcodé | teacher.quiz.question (existe) + {n} |
| `js/teacher/pages/teacher-quiz.page.js` | 50 | Énoncé de la question… | FR hardcodé | teacher.questionText (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 52 | Réponse correcte | FR hardcodé | teacher.quiz.correct (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 54 | Option 1 … Option 4 | FR hardcodé | teacher.option + compteur |
| `js/teacher/pages/teacher-quiz.page.js` | 86 | Quiz incomplet : titre + au moins une question avec 4 options. | FR hardcodé | teacher.error.quizIncomplete (nouvelle) |
| `js/teacher/pages/teacher-quiz.page.js` | 89 | Quiz soumis pour validation ✅ | FR hardcodé | teacher.submitted (existe) |
| `js/teacher/pages/teacher-quiz.page.js` | 91 | Erreur lors de la soumission. | FR hardcodé | teacher.error (existe) |

## 4. Académies / Hub étudiant / Free trial

| Fichier | Ligne | Texte réel | Type | Clé i18n recommandée |
| --- | --- | --- | --- | --- |
| `src/shared/components/academy/academy-shell.js` | 16 | Dashboard | EN hardcodé | academies.shell.dashboard |
| `src/shared/components/academy/academy-shell.js` | 17 | My Courses | EN hardcodé | academies.shell.courses |
| `src/shared/components/academy/academy-shell.js` | 18 | Quiz & Assessments | EN hardcodé | academies.shell.quiz |
| `src/shared/components/academy/academy-shell.js` | 19 | Live Classes | EN hardcodé | academies.shell.live |
| `src/shared/components/academy/academy-shell.js` | 20 | Certificates | EN hardcodé | academies.shell.certificates |
| `src/shared/components/academy/academy-shell.js` | 34 | Back to ELA hub | EN hardcodé | academies.shell.backToHub |
| `src/shared/components/academy/academy-shell.js` | 35 | ← ELA Hub | EN hardcodé | academies.shell.hub |
| `src/academies/base/pages/courses.factory.js` | 28 | All courses | EN hardcodé | academies.courses.title |
| `src/academies/base/pages/courses.factory.js` | 29 | No course matches this filter yet. | EN hardcodé | academies.courses.empty |
| `src/academies/base/pages/courses.factory.js` | 40 | Catalogue indisponible pour le moment. | FR hardcodé | academies.courses.unavailable |
| `src/academies/base/pages/courses.factory.js` | 45 | Unable to load this academy page. Please try again. | EN hardcodé | academies.courses.loadError |
| `src/ela/pages/student-hub.page.js` | 40 | 📚 Leçons complétées | FR hardcodé | dashboard.kpi.lessons (nouvelle) |
| `src/ela/pages/free-trial.page.js` | 25 | Create Your Free Account | EN hardcodé | trial.modal.title |
| `src/ela/pages/free-trial.page.js` | 26 | Unlock 24 more lessons and track your progress. No payment required. | EN hardcodé | trial.modal.subtitle |
| `src/ela/pages/free-trial.page.js` | 28 | Email | EN hardcodé | register.field.email (existe) |
| `src/ela/pages/free-trial.page.js` | 30 | Password | EN hardcodé | register.field.password (existe, mais wording) |
| `src/ela/pages/free-trial.page.js` | 33 | Create Free Account | EN hardcodé | trial.modal.cta |
| `src/ela/pages/free-trial.page.js` | 34 | Cancel | EN hardcodé | admin.cancel (existe) |

## 5. Clés i18n existantes réutilisables

Clés génériques **déjà présentes** dans les 3 fichiers JSON (à réutiliser, ne pas dupliquer) :
| Clé | EN | FR | AR |
| --- | --- | --- | --- |
| `admin.cancel` | Cancel | Annuler | إلغاء |
| `admin.confirm` | Confirm | Confirmer | تأكيد |
| `admin.refresh` | Refresh | Rafraîchir | تحديث |
| `admin.approve` | Approve | Approuver | اعتماد |
| `admin.reject` | Reject | Rejeter | رفض |
| `admin.name` | Name | Nom | الاسم |
| `admin.email` | Email | E-mail | البريد الإلكتروني |
| `admin.role` | Role | Rôle | الدور |
| `admin.academy` | Academy | Académie | الأكاديمية |
| `admin.status` | Status | Statut | الحالة |
| `admin.date` | Date | Date | التاريخ |
| `admin.amount` | Amount | Montant | المبلغ |
| `admin.plan` | Plan | Formule | الخطة |
| `admin.users` | Users | Utilisateurs | المستخدمون |
| `admin.overview` | Overview | Vue d’ensemble | نظرة عامة |
| `admin.live` | Live classes | Classes live | الحصص المباشرة |
| `admin.payments` | Payments | Paiements | المدفوعات |
| `admin.referrals` | Referrals | Parrainages | الإحالات |
| `admin.certs.title` | Certifications | Certifications | الشهادات |
| `admin.certs.student` | Student | Élève | الطالب |
| `admin.certs.type` | Type | Type | النوع |
| `admin.certs.empty` | No certificate found. | Aucun certificat trouvé. | لا يوجد شهادة |
| `admin.certs.revoke` | Revoke | Révoquer | إلغاء |
| `admin.certs.reasonRequired` | A reason of at least 3 characters is required. | Un motif d’au moins 3 caractères est obligatoire. |  |
| `admin.teacher` | Teacher | Enseignant | معلم |
| `admin.noUsers` | No users yet. | Aucun utilisateur. |  |
| `admin.empty` | No content pending review. | Aucun contenu en attente de validation. |  |
| `admin.searchPlaceholder` | Search by name or email | Rechercher par nom ou e-mail |  |
| `teacher.submit` | Submit for review | Soumettre pour validation |  |
| `teacher.submitted` | Submitted for review. | Soumis pour validation. |  |
| `teacher.myContent` | My submissions | Mes soumissions |  |
| `teacher.noContent` | No submission yet. | Aucune soumission pour le moment. |  |
| `teacher.content.empty` | No content yet. | Aucun contenu pour le moment. |  |
| `teacher.status.approved` | Approved | Approuvé |  |
| `teacher.status.pending` | Pending review | En attente de validation |  |
| `teacher.status.rejected` | Rejected | Rejeté |  |
| `teacher.lesson.field.title` | Title | Titre |  |
| `teacher.lesson.field.description` | Description | Description |  |
| `teacher.lesson.field.content` | Content | Contenu |  |
| `teacher.lesson.field.level` | Level | Niveau |  |
| `teacher.lessonContent` | Lesson content | Contenu de la leçon |  |
| `teacher.lessonTitle` | Lesson title | Titre de la leçon |  |
| `teacher.lessonDesc` | Short description | Description courte |  |
| `teacher.quiz.field.title` | Title | Titre |  |
| `teacher.quizTitle` | Quiz title | Titre du quiz |  |
| `teacher.quiz.question` | Question | Question |  |
| `teacher.quiz.correct` | Correct answer | Bonne réponse |  |
| `teacher.quiz.addQuestion` | Add question | Ajouter une question |  |
| `teacher.option` | Option | Option |  |
| `teacher.questionText` | Question text | Énoncé de la question |  |
| `teacher.live.field.title` | Title | Titre |  |
| `teacher.live.field.datetime` | Date and time | Date et heure |  |
| `teacher.live.field.link` | Meeting link (Zoom / Google Meet) | Lien de réunion (Zoom / Google Meet) |  |
| `teacher.newLesson` | New lesson | Nouvelle leçon |  |
| `teacher.newQuiz` | New quiz | Nouveau quiz |  |
| `teacher.newLive` | New live class | Nouvelle classe live |  |
| `teacher.error` | Could not publish. Please try again. | Impossible de publier. Réessaie. |  |
| `teacher.error.quizEmpty` | Add at least one complete question. | Ajoutez au moins une question complète. |  |
| `teacher.notTeacher` | This area is for teachers only. | Cette zone est réservée aux enseignants. |  |
| `dashboard.progress` | Progress | Progression |  |
| `dashboard.status.active` | Active | Actif |  |
| `dashboard.tx.success` | Paid | Payé |  |
| `dashboard.tx.pending` | Pending | En attente |  |
| `dashboard.elaCertsVerify` | Verify | Vérifier |  |
| `checkout.month.1` | 1 month | 1 mois |  |
| `checkout.month.3` | 3 months | 3 mois |  |
| `checkout.month.6` | 6 months | 6 mois |  |
| `register.field.email` | Email address | Adresse email |  |
| `register.field.password` | Password (8+ characters) | Mot de passe (8 caractères minimum) |  |
| `admin.certs.loadError` | Unable to load certificates. | Impossible de charger les certificats. |  |
| `admin.certs.more` | Load more | Charger plus |  |
| `admin.link` | Link | Lien |  |

> Note : les valeurs AR ci-dessus sont renseignées quand pertinentes ; à compléter lors de l’ajout (la plupart existent déjà dans `ar.json`).

## 6. Nouvelles clés réellement nécessaires

Clés **absentes** aujourd’hui, à créer dans les 3 JSON (naming proposé) :

**admin.***

- Sidebar & groupes : admin.sidebar.brand, admin.teachers (pluriel), admin.academies, admin.content, admin.whatsapp, admin.invoices, admin.tools, admin.navGroup.{gestion,content,finance,certifications,system} ; colonnes : admin.users.col.{student,id,plan,expires,joined,action}, admin.teachers.col.memberSince, admin.content.col.{title,type,author,date,status,action}, admin.author, admin.action ; états vides : admin.{users,teachers,content,payments,referrals,live,invoices,whatsapp,revenue}.empty(.title/.body) ; titres : admin.{page}.title/.subtitle ; actions : admin.manage, admin.manageUser.title, admin.save, admin.revokeSubscription, admin.duration, admin.currentStatus, admin.execute, admin.invoices.create(.title/.submit), admin.invoices.clientName/.clientEmail/.frequency/.email/.whatsapp, admin.certs.verify(.Section/.Placeholder/.Empty/.issuedSection/.status.revoked), admin.revenue.recent ; statuts : admin.status.activeSub/.noSub, admin.role.{student,teacher,admin}, admin.plan.free ; divers : admin.session.expired(.body), admin.unavailable, admin.empty.startup.{title,body}, admin.hello, admin.rejectReason.placeholder, admin.tools.confirm (placeholder {fn}), admin.live.empty.body

**teacher.***

- Sidebar & groupes : teacher.sidebar.{brand,dashboard,courses,quizzes,live,students,stats,profile}, teacher.navGroup.{content,management,account} ; dashboard : teacher.dashboard.{hello (placeholder {name}),subtitle,stats,quickActions,newLesson,newQuiz,newLive,emptyCTA} ; titres/sous-titres : teacher.{courses,quizzes,live,stats,students,profile,lesson.new,live.new,quiz.new}.{title,subtitle} ; états vides : teacher.{courses,quizzes,live,stats,students}.empty(.body/.CTA), teacher.courses.new, teacher.quizzes.new, teacher.live.new, teacher.students.col.lastActive, teacher.profile.displayName/.academyHint, teacher.backToDashboard, teacher.status.published/.pending.progress, teacher.live.published/.pending, teacher.quiz.answer, teacher.quiz.defaultCorrect (placeholder {n}), teacher.quiz.new.titlePlaceholder, teacher.error.quizIncomplete

**academies.***

- Shell immersif : academies.shell.{dashboard,courses,quiz,live,certificates,backToHub,hub} ; catalogue : academies.courses.{title,empty,unavailable,loadError}

**dashboard.***

- dashboard.kpi.lessons (hub étudiant)

**trial.***

- Modal auth free-trial : trial.modal.{title,subtitle,cta}

> Règle d’usage : réutiliser d’abord les clés de la §5 ; ne créer une clé que si aucune ne convient. Exemples de doublons évités : « Annuler » → admin.cancel, « En attente » → teacher.status.pending, « Rafraîchir » → admin.refresh, « Vérifier » → dashboard.elaCertsVerify, « 1/3/6 mois » → checkout.month.*.

## 7. Faux positifs du scan automatique (à ignorer)

| Fichier | Ligne | Pourquoi ce n’est pas à traduire |
| --- | --- | --- |
| `js/teacher/pages/teacher-live-list.page.js` | 36 | Wrapper HTML sans texte visible (« data-live-list ») — aucun libellé. |
| `js/admin/pages/sections/validation.js` | 18 | Prévisualisation de données (date déjà formatée) — pas de libellé utilisateur. |
| `js/admin/pages/admin-whatsapp.page.js` | 63 | Colonne « Numéro » = données téléphone (monospace) — donnée, pas libellé. |
| `js/admin/pages/admin-revenue.page.js` | 56 | Texte « Plan » est une valeur métier (code plan) affichée telle quelle — dépend de §6 admin.plan.free + pricing.*, pas d’un libellé local. |
| `js/admin/pages/admin.page.js` | 189 | « Seed Live Classes » = outil de dev admin (seed) — conservez l’anglais technique (ou clé dev). |
| `js/admin/pages/sections/overview.js` | 41 | Idem : bouton de seed dev — pas un libellé produit. |
| `js/admin/pages/admin-users.page.js` | 115 | Identifiants ELA (monospace) — données d’identité (gérées par .id-ela), pas des libellés. |
| `js/teacher/pages/teacher-students.page.js` | 43 | Nom d’élève = donnée utilisateur (déjà gérée), pas un libellé d’interface. |

> Le scanner marquait aussi toutes les lignes de commentaires/têtes de fichiers (« Page « Mes cours »… ») : ignorées (exclues du périmètre).

## Placeholders à surveiller

- `teacher.dashboard.hello` : `{name}` — insérer le nom de l’enseignant (même schéma que `register`/`checkout`).
- `teacher.quiz.question` / `teacher.option` / `teacher.quiz.defaultCorrect` : `{n}` incrémental (Question 1…, Option 1…).
- `admin.certs.empty` (existe) : phrase « Aucun certificat trouvé pour « {id} » » — le placeholder `{id}` n’existe pas encore dans la clé, à ajouter lors du refactor.
- `admin.tools.confirm` : `{fn}` nom de la fonction seed.
> Aucun désalignement de placeholders n’existe actuellement entre EN/FR/AR (vérifié : 0 divergence).