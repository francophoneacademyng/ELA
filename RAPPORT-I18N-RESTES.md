# RAPPORT I18N — RESTES FRANÇAIS EN DUR (admin/teacher)

Passe « zones publiques + JSON » effectuée. Les pages **admin** et **teacher** refactorées restent volontairement NON raccordées à `ELA_I18N.t()` (hors périmètre de cette passe).
Tableau généré par scan : lignes de templates (HTML + marqueurs FR), commentaires exclus.

## Récapitulatif par fichier

| Fichier | Lignes FR visibles |
| --- | --- |
| `js/admin/components/reject-modal.js` | 2 |
| `js/admin/pages/admin-certificates.page.js` | 5 |
| `js/admin/pages/admin-content.page.js` | 7 |
| `js/admin/pages/admin-invoices.page.js` | 10 |
| `js/admin/pages/admin-live.page.js` | 1 |
| `js/admin/pages/admin-payments.page.js` | 1 |
| `js/admin/pages/admin-referrals.page.js` | 1 |
| `js/admin/pages/admin-revenue.page.js` | 3 |
| `js/admin/pages/admin-shell.js` | 5 |
| `js/admin/pages/admin-teachers.page.js` | 2 |
| `js/admin/pages/admin-tools.page.js` | 1 |
| `js/admin/pages/admin-users.page.js` | 13 |
| `js/admin/pages/admin-whatsapp.page.js` | 1 |
| `js/admin/pages/admin.page.js` | 9 |
| `js/admin/pages/sections/certifications.js` | 1 |
| `js/admin/pages/sections/overview.js` | 2 |
| `js/admin/pages/sections/users.js` | 1 |
| `js/admin/pages/sections/validation.js` | 1 |
| `js/teacher/pages/teacher-courses.page.js` | 4 |
| `js/teacher/pages/teacher-lesson.page.js` | 7 |
| `js/teacher/pages/teacher-live-list.page.js` | 5 |
| `js/teacher/pages/teacher-live.page.js` | 4 |
| `js/teacher/pages/teacher-profile.page.js` | 5 |
| `js/teacher/pages/teacher-quiz.page.js` | 8 |
| `js/teacher/pages/teacher-quizzes.page.js` | 4 |
| `js/teacher/pages/teacher-shell.js` | 3 |
| `js/teacher/pages/teacher-stats.page.js` | 3 |
| `js/teacher/pages/teacher-students.page.js` | 3 |
| `js/teacher/pages/teacher.page.js` | 15 |

**Total fichiers concernés : 29**

## Détail ligne à ligne

### `js/admin/components/reject-modal.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L11 | '<h2>Rejeter ce contenu</h2>' + | `admin.reject` |
| L17 | '<button class="btn-manage-cancel" id="reject-cancel">Annuler</button>' + | `admin.cancel` |

### `js/admin/pages/admin-certificates.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L31 | '<section class="section-title">Vérifier un certificat</section>' + | `admin.admin-certificates.*` (à créer) |
| L36 | '<button class="btn btn-solid btn-sm" id="ela-verify-btn">Vérifier</button>' + | `admin.admin-certificates.*` (à créer) |
| L40 | '<section class="section-title">Certificats émis</section>' + | `admin.admin-certificates.*` (à créer) |
| L57 | '<p>Aucun certificat trouvé pour « ' + escapeHtml(id) + ' ».</p></div>'; | `admin.admin-certificates.*` (à créer) |
| L65 | '<thead><tr><th>ID</th><th>Étudiant</th><th>Académie</th><th>Niveau</th><th>Statut</th></tr></thead>' + | `admin.status` |

### `js/admin/pages/admin-content.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L59 | '<a class="btn btn-outline btn-sm" href="#/teacher/lesson/new">📹 Ouvrir le studio vidéo</a>' + | `admin.admin-content.*` (à créer) |
| L90 | ? '<span class="badge badge-wait">En attente</span>' | `teacher.status.pending` |
| L92 | ? '<span class="badge badge-ok">Approuvé</span>' | `teacher.status.approved` |
| L93 | : '<span class="badge badge-ko">Rejeté</span>'); | `admin.admin-content.*` (à créer) |
| L95 | ? '<button class="btn btn-solid btn-sm" data-approve="' + it.key() + '" style="margin-right:6px">Approuver</button>' + | `admin.admin-content.*` (à créer) |
| L96 | '<button class="btn btn-ghost btn-sm" data-reject="' + it.key() + '">Rejeter</button>' | `admin.reject` |
| L106 | '<thead><tr><th>Contenu</th><th>Type</th><th>Auteur</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>' + | `admin.status` |

### `js/admin/pages/admin-invoices.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L42 | '<tbody id="invoices-tbody"><tr><td colspan="9" style="text-align:center;padding:48px;color:#6b7280;">Chargement…</td></tr></tbody>' + | `admin.admin-invoices.*` (à créer) |
| L46 | '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune facture personnalisée</h3>' + | `admin.admin-invoices.*` (à créer) |
| L56 | '<div class="form-row"><label>Nom du client</label><input type="text" id="inv-name" class="manage-input" placeholder="Ex. Hamadama R."></div | `admin.name` |
| L57 | '<div class="form-row"><label>Email du client</label><input type="email" id="inv-email" class="manage-input" placeholder="client@gmail.com"> | `admin.email` |
| L62 | '<div class="form-row"><label>Durée</label><select id="inv-duration" class="manage-select">' + | `admin.admin-invoices.*` (à créer) |
| L69 | '<button class="btn-manage-cancel" id="inv-cancel">Annuler</button>' + | `admin.cancel` |
| L70 | '<button class="btn-manage-save" id="inv-create">Créer la facture</button>' + | `admin.admin-invoices.*` (à créer) |
| L129 | '<span class="user-email">' + escapeHtml(inv.clientEmail) + '</span></div></td>' + | `admin.email` |
| L150 | '<button class="btn-action-sm" data-inv-mail="' + escapeHtml(inv.clientEmail) + '" data-inv-num="' + num + '">✉️ Email</button>' + | `admin.email` |
| L151 | '<button class="btn-action-sm" data-inv-wa="' + escapeHtml(invoiceLink(inv)) + '" data-inv-num="' + num + '">📱 WhatsApp</button>'; | `admin.admin-invoices.*` (à créer) |

### `js/admin/pages/admin-live.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L29 | '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune classe live programmée</h3>' + | `admin.admin-live.*` (à créer) |

### `js/admin/pages/admin-payments.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L57 | '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune transaction</h3>' + | `admin.admin-payments.*` (à créer) |

### `js/admin/pages/admin-referrals.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L46 | '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucun parrainage enregistré</h3>' + | `admin.admin-referrals.*` (à créer) |

### `js/admin/pages/admin-revenue.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L78 | '<section class="section-title">Paiements récents</section>' + | `admin.admin-revenue.*` (à créer) |
| L82 | '<thead><tr><th>Date</th><th>Utilisateur</th><th>Formule</th><th>Montant</th><th>Statut</th></tr></thead>' + | `admin.status` |
| L85 | '<p>Aucun paiement enregistré pour le moment.</p></div>') + | `admin.admin-revenue.*` (à créer) |

### `js/admin/pages/admin-shell.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L23 | '<div class="nav-section">Gestion</div>' + | `admin.admin-shell.*` (à créer) |
| L28 | '<div class="nav-section">Contenu & Comm.</div>' + | `admin.admin-shell.*` (à créer) |
| L35 | '<div class="nav-section">Certifications</div>' + | `admin.admin-shell.*` (à créer) |
| L93 | '<p>Aucune donnée à afficher pour le moment. Les statistiques apparaîtront dès les premiers comptes et paiements.</p>' + | `admin.admin-shell.*` (à créer) |
| L94 | '<button class="btn btn-outline btn-sm" id="admin-retry-load">🔄 Rafraîchir</button></div>'; | `admin.refresh` |

### `js/admin/pages/admin-teachers.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L43 | '<thead><tr><th>Nom</th><th>Email</th><th>Académie</th><th>Rôle</th><th>Membre depuis</th></tr></thead>' + | `admin.role` |
| L48 | '<p>Aucun enseignant enregistré pour le moment.</p></div>') + | `admin.admin-teachers.*` (à créer) |

### `js/admin/pages/admin-tools.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L38 | '<button class="btn btn-solid btn-sm" id="' + t.id + '" data-tool="' + t.fn + '">Exécuter</button>' + | `admin.admin-tools.*` (à créer) |

### `js/admin/pages/admin-users.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L88 | '<input type="text" id="user-search" placeholder="Rechercher un nom ou un email…" class="search-input" value="' + escapeHtml(q) + '">' + | `admin.admin-users.*` (à créer) |
| L89 | '<button class="btn-refresh" id="btn-refresh">🔄 Rafraîchir</button>' + | `admin.refresh` |
| L97 | '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucun utilisateur inscrit</h3>' + | `admin.admin-users.*` (à créer) |
| L119 | '<td><button class="btn-manage" data-manage="' + escapeHtml(u.id) + '">Gérer</button></td>' + | `admin.admin-users.*` (à créer) |
| L133 | '<h2>Gérer l\'utilisateur</h2>' + | `admin.admin-users.*` (à créer) |
| L134 | '<div class="form-row"><label>Rôle</label><select id="m-role" class="manage-select">' + | `admin.role` |
| L138 | '<div class="form-row"><label>Formule</label><select id="m-plan" class="manage-select">' + | `admin.admin-users.*` (à créer) |
| L143 | '<div class="form-row"><label>Durée d\'engagement</label><select id="m-duration" class="manage-select">' + | `admin.admin-users.*` (à créer) |
| L147 | '<div class="form-row"><label>Académie</label><select id="m-academy" class="manage-select">' + academyOpts + '</select></div>' + | `admin.academy` |
| L148 | '<div class="status-row"><span>Statut actuel : </span><strong id="m-status">Chargement…</strong></div>' + | `admin.status` |
| L150 | '<button class="btn-manage-cancel" id="m-cancel">Annuler</button>' + | `admin.cancel` |
| L151 | '<button class="btn-manage-revoke" id="m-revoke">Révoquer l\'abonnement</button>' + | `admin.admin-users.*` (à créer) |
| L152 | '<button class="btn-manage-save" id="m-save">Enregistrer</button>' + | `admin.admin-users.*` (à créer) |

### `js/admin/pages/admin-whatsapp.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L42 | '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune activité WhatsApp</h3>' + | `admin.admin-whatsapp.*` (à créer) |

### `js/admin/pages/admin.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L55 | '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement des données…</p></div>' + | `admin.admin.*` (à créer) |
| L114 | '<td><span class="badge badge-wait">En attente</span></td>' + | `teacher.status.pending` |
| L115 | '<td><button class="btn btn-solid btn-sm" data-approve="' + key + '" style="margin-right:6px">Approuver</button>' + | `admin.admin.*` (à créer) |
| L116 | '<button class="btn btn-ghost btn-sm" data-reject="' + key + '">Rejeter</button></td></tr>'; | `admin.reject` |
| L131 | '<section class="section-title">Académies</section>' + | `admin.academy` |
| L134 | '<section class="section-title">Certifications</section>' + | `admin.admin.*` (à créer) |
| L176 | '<p>Tout est à jour — Aucun contenu en attente de validation.</p></div>'; | `admin.admin.*` (à créer) |
| L178 | '<thead><tr><th>Contenu</th><th>Type</th><th>Auteur</th><th>Date</th><th>Statut</th><th></th></tr></thead>' + | `admin.status` |
| L189 | '<button class="btn-tool" id="seed-live">Seed Live Classes</button>' + | `admin.admin.*` (à créer) |

### `js/admin/pages/sections/certifications.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L77 | '<h3>Certificats momentanément indisponibles</h3>' + | `admin.certifications.*` (à créer) |

### `js/admin/pages/sections/overview.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L33 | '<p>' + t('admin.upcoming') + ' : <strong>' + a.live + '</strong></p></div>'; | `admin.overview.*` (à créer) |
| L41 | '<button class="btn btn-ghost btn-sm" id="admin-seed-live">Seed Live Classes</button>' + | `admin.overview.*` (à créer) |

### `js/admin/pages/sections/users.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L36 | '<th>' + t('admin.name') + '</th><th>Email</th><th>' + t('admin.role') + '</th>' + | `admin.email` |

### `js/admin/pages/sections/validation.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L18 | if (p.kind === 'live') return '<p>' + formatDateTime(p.scheduledAt) + '</p>'; | `admin.date` |

### `js/teacher/pages/teacher-courses.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L69 | '<p>Aucun cours dans cette catégorie pour le moment.</p>' + | `teacher.teacher-courses.*` (à créer) |
| L70 | '<p style="margin-top:12px"><a class="btn btn-solid" href="#/teacher/lesson/new">+ Créer mon premier cours</a></p></div>'; | `teacher.teacher-courses.*` (à créer) |
| L80 | '<thead><tr><th>Titre</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>' + | `admin.status` |
| L85 | '<div style="margin-top:1rem"><a class="btn btn-solid" href="#/teacher/lesson/new">+ Nouveau cours</a></div>'; | `teacher.teacher-courses.*` (à créer) |

### `js/teacher/pages/teacher-lesson.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L31 | '<header class="dashboard-header"><h1>Créer une leçon ✏️</h1>' + | `teacher.teacher-lesson.*` (à créer) |
| L32 | '<p><a class="btn-secondary" href="#/teacher">← Retour au tableau de bord</a></p></header>' + | `teacher.teacher-lesson.*` (à créer) |
| L34 | '<div class="form-field"><label>Titre</label>' + | `teacher.teacher-lesson.*` (à créer) |
| L36 | '<div class="form-field"><label>Description</label>' + | `teacher.teacher-lesson.*` (à créer) |
| L38 | '<div class="form-field"><label>Contenu</label>' + | `teacher.teacher-lesson.*` (à créer) |
| L39 | '<textarea id="tl-content" class="input" style="min-height:180px" placeholder="Contenu de la leçon…"></textarea></div>' + | `teacher.teacher-lesson.*` (à créer) |
| L42 | '<button class="btn-primary" id="tl-submit">Soumettre pour validation</button>' + | `teacher.submit` |

### `js/teacher/pages/teacher-live-list.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L36 | return '<div class="card" data-live-list>' + listInner() + '</div>'; | `teacher.teacher-live-list.*` (à créer) |
| L43 | '<p>Aucune classe Live pour le moment.</p>' + | `teacher.teacher-live-list.*` (à créer) |
| L44 | '<p style="margin-top:12px"><a class="btn btn-solid" href="#/teacher/live/new">+ Programmer ma première classe</a></p></div>'; | `teacher.teacher-live-list.*` (à créer) |
| L54 | '<thead><tr><th>Titre</th><th>Date</th><th>Lien</th><th>Statut</th></tr></thead>' + | `admin.status` |
| L56 | '<div style="margin-top:1rem"><a class="btn btn-solid" href="#/teacher/live/new">+ Nouvelle classe</a></div>'; | `teacher.teacher-live-list.*` (à créer) |

### `js/teacher/pages/teacher-live.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L27 | '<header class="dashboard-header"><h1>Créer une classe Live 🔴</h1>' + | `teacher.teacher-live.*` (à créer) |
| L28 | '<p><a class="btn-secondary" href="#/teacher">← Retour au tableau de bord</a></p></header>' + | `teacher.teacher-live.*` (à créer) |
| L30 | '<div class="form-field"><label>Titre de la session</label>' + | `teacher.teacher-live.*` (à créer) |
| L36 | '<button class="btn-primary" id="tv-submit" type="button">Soumettre pour validation</button>' + | `teacher.submit` |

### `js/teacher/pages/teacher-profile.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L34 | '<div><strong class="user-name">' + esc(p.displayName // 'Enseignant') + '</strong>' + | `teacher.teacher-profile.*` (à créer) |
| L38 | '<label for="tp-name" style="display:block;font-weight:600;margin-bottom:0.3rem">Nom affiché</label>' + | `admin.name` |
| L42 | '<label style="display:block;font-weight:600;margin-bottom:0.3rem">Email</label>' + | `admin.email` |
| L46 | '<label style="display:block;font-weight:600;margin-bottom:0.3rem">Académie</label>' + | `admin.academy` |
| L50 | '<button class="btn btn-solid" id="tp-save">Enregistrer</button>' + | `teacher.teacher-profile.*` (à créer) |

### `js/teacher/pages/teacher-quiz.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L29 | '<header class="dashboard-header"><h1>Créer un quiz 📝</h1>' + | `teacher.teacher-quiz.*` (à créer) |
| L30 | '<p><a class="btn-secondary" href="#/teacher">← Retour au tableau de bord</a></p></header>' + | `teacher.teacher-quiz.*` (à créer) |
| L32 | '<div class="form-field"><label>Titre du quiz</label>' + | `teacher.teacher-quiz.*` (à créer) |
| L35 | '<button class="btn-secondary" id="tq-add" type="button">+ Ajouter une question</button> ' + | `teacher.teacher-quiz.*` (à créer) |
| L36 | '<button class="btn-primary" id="tq-submit" type="button">Soumettre pour validation</button>' + | `teacher.submit` |
| L46 | '<input type="text" class="input" data-quiz-option="' + i + '" data-oi="' + o + '" placeholder="Réponse"></div>'; | `teacher.teacher-quiz.*` (à créer) |
| L49 | '<label>Question ' + (i + 1) + '</label>' + | `teacher.teacher-quiz.*` (à créer) |
| L52 | '<div class="form-field"><label>Réponse correcte</label>' + | `teacher.teacher-quiz.*` (à créer) |

### `js/teacher/pages/teacher-quizzes.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L42 | '<p>Aucun quiz pour le moment.</p>' + | `teacher.teacher-quizzes.*` (à créer) |
| L43 | '<p style="margin-top:12px"><a class="btn btn-solid" href="#/teacher/quiz/new">+ Créer mon premier quiz</a></p></div>'; | `teacher.teacher-quizzes.*` (à créer) |
| L53 | '<thead><tr><th>Titre</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>' + | `admin.status` |
| L55 | '<div style="margin-top:1rem"><a class="btn btn-solid" href="#/teacher/quiz/new">+ Nouveau quiz</a></div>'; | `teacher.teacher-quizzes.*` (à créer) |

### `js/teacher/pages/teacher-shell.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L17 | '<div class="sidebar-brand">ELA Enseignant</div>' + | `teacher.teacher-shell.*` (à créer) |
| L20 | '<div class="nav-section">Contenu</div>' + | `teacher.teacher-shell.*` (à créer) |
| L24 | '<div class="nav-section">Gestion</div>' + | `teacher.teacher-shell.*` (à créer) |

### `js/teacher/pages/teacher-stats.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L22 | '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement…</p></div></div>'; | `teacher.teacher-stats.*` (à créer) |
| L52 | '<p>Aucune activité enregistrée pour le moment.</p>' + | `teacher.teacher-stats.*` (à créer) |
| L62 | '<thead><tr><th>Contenu</th><th>Type</th><th>Date</th><th>Statut</th></tr></thead>' + | `admin.status` |

### `js/teacher/pages/teacher-students.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L19 | '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement…</p></div>' + | `teacher.teacher-students.*` (à créer) |
| L38 | '<p>Aucun étudiant inscrit à vos contenus pour le moment.</p>' + | `teacher.teacher-students.*` (à créer) |
| L49 | '<thead><tr><th>Nom</th><th>Email</th><th>Progression</th><th>Dernière activité</th></tr></thead>' + | `admin.name` |

### `js/teacher/pages/teacher.page.js`

| Ligne | Texte FR en dur | Clé i18n suggérée |
| --- | --- | --- |
| L82 | '<thead><tr><th>Contenu</th><th>Type</th><th>Date</th><th>Statut</th></tr></thead>' + | `admin.status` |
| L86 | '<p>Aucune soumission pour le moment.</p>' + | `teacher.teacher.*` (à créer) |
| L87 | '<p class="empty-sub">Commencez par créer votre première leçon !</p></div>'; | `teacher.teacher.*` (à créer) |
| L92 | '<div class="sidebar-brand">ELA Enseignant</div>' + | `teacher.teacher.*` (à créer) |
| L94 | '<a href="#/teacher" class="nav-item active">🏠 Tableau de bord</a>' + | `teacher.teacher.*` (à créer) |
| L95 | '<div class="nav-section">Contenu</div>' + | `teacher.teacher.*` (à créer) |
| L96 | '<a href="#/teacher/courses" class="nav-item">📚 Mes cours</a>' + | `teacher.teacher.*` (à créer) |
| L97 | '<a href="#/teacher/quizzes" class="nav-item">📝 Mes quiz</a>' + | `teacher.teacher.*` (à créer) |
| L98 | '<a href="#/teacher/live" class="nav-item">🔴 Mes classes Live</a>' + | `teacher.teacher.*` (à créer) |
| L99 | '<div class="nav-section">Gestion</div>' + | `teacher.teacher.*` (à créer) |
| L100 | '<a href="#/teacher/students" class="nav-item">👥 Mes étudiants</a>' + | `teacher.teacher.*` (à créer) |
| L103 | '<a href="#/teacher/profile" class="nav-item">⚙️ Mon profil</a>' + | `teacher.teacher.*` (à créer) |
| L130 | '<a class="btn-primary" href="#/teacher/lesson/new">+ Créer une leçon</a>' + | `teacher.teacher.*` (à créer) |
| L131 | '<a class="btn-primary" href="#/teacher/quiz/new">+ Créer un quiz</a>' + | `teacher.teacher.*` (à créer) |
| L132 | '<a class="btn-primary" href="#/teacher/live/new">+ Créer une classe Live</a>' + | `teacher.teacher.*` (à créer) |

## Autres restes de cha�nes en dur (pages immersives / hub �tudiant, HORS admin & teacher)

| Fichier | Constat | Cl� i18n sugg�r�e |
| --- | --- | --- |
| src/shared/components/academy/academy-shell.js | nav EN : � Dashboard �, � My Courses �, � Quiz & Assessments �, � Live Classes �, � Certificates �, � Back to ELA hub �, � ELA Hub � | academies.shell.* (3 langues) |
| src/academies/base/pages/courses.factory.js | � All courses �, � No course matches this filter yet. �, � Catalogue indisponible pour le moment. �, � Unable to load this academy page. Please try again. � | academies.courses.* |
| src/academies/base/pages/*.factory.js (dashboard/quiz/live/certificates) | libell�s EN/FR en dur dans les vues immersives | academies.* |
| src/ela/pages/free-trial.page.js | modal EN : � Create Your Free Account �, � Email �, � Password �, etc. | trial.auth.* |
| src/ela/pages/student-hub.page.js | KPI FR en dur : � ?? Le�ons compl�t�es � (visible FR alors que le reste suit ELA_I18N) | dashboard.kpi.lessons |

> Remarque : ces vues sont cibl�es par la future passe � acad�mies immersives + hub �tudiant � (m�mes r�gles : aucune cha�ne en dur, raccordement ELA_I18N.t(), compl�tion EN/FR/AR).
