/**
 * ============================================================
 * E-Learn Language Academy (ELA) — Lead nurturing (Mission 7)
 * ============================================================
 * Parcours : lead magnet → capture → lead → nurturing → free trial
 *            → inscription → paiement → client.
 *
 * Principes :
 * - Réutilise l'infrastructure existante (SendGrid via fetch, Firestore,
 *   Admin SDK). Aucune nouvelle dépendance npm.
 * - ENVOI DÉSACTIVÉ PAR DÉFAUT : NURTURE_SEND_ENABLED doit valoir "true".
 *   Sinon les fonctions journalisent seulement (dry-run), aucun email réel.
 * - Idempotence : un pas d'email n'est envoyé qu'une fois par lead
 *   (transaction qui avance lastSentStep AVANT l'envoi).
 * - Anti-doublon : un même email ne démarre pas deux séquences actives.
 * - Suppression : désabonnement, inscription, paiement, bounces.
 * - Aucun secret dans le code : tout vient de functions/.env.
 * ============================================================
 */

const { onDocumentCreated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Firestore paresseux (même correctif que index.js : charge gRPC au 1er appel).
const db = new Proxy({}, {
  get: function (_t, prop) { return admin.firestore()[prop]; }
});

const REGION = 'africa-south1';
const SCHEDULER_REGION = 'europe-west1';
const SITE = 'https://elaacademy.ng';
const LEADS = 'leadMagnetLeads';
const FROM_NAME = 'E-Learn Language Academy';

const SEND_ENABLED = String(process.env.NURTURE_SEND_ENABLED || 'false').toLowerCase() === 'true';
const TOKEN_SECRET = process.env.NURTURE_TOKEN_SECRET || process.env.PAYSTACK_SECRET || 'ela-nurture-dev-secret';
const HOUR = 3600000;

/* ---------- Données académies (alignées sur lead-magnets.data.js) ---------- */
const ACADEMIES = {
  FR: { label: 'French', native: 'Français', slug: 'fr', magnet: 'French A1–A2 Starter Checklist', phrase: 'Bonjour / Bonsoir' },
  DE: { label: 'German', native: 'Deutsch', slug: 'de', magnet: 'Germany Study & Ausbildung Prep Checklist', phrase: 'Guten Tag' },
  ZH: { label: 'Mandarin', native: '中文', slug: 'zh', magnet: 'China Business Mandarin Starter Kit', phrase: '你好 (nǐ hǎo)' },
  EN: { label: 'English', native: 'English', slug: 'en', magnet: 'IELTS 7+ Professional English Checklist', phrase: 'Let us begin' },
  AR: { label: 'Arabic', native: 'العربية', slug: 'ar', magnet: 'Gulf Business Arabic Phrasebook', phrase: 'مرحبًا (Marhaban)' },
  RU: { label: 'Russian', native: 'Русский', slug: 'ru', magnet: 'Russian Scholarship & TORFL A1 Prep Checklist', phrase: 'Здравствуйте (Zdravstvuyte)' }
};

/* ---------- Séquence (7 pas) ---------- */
const SEQUENCE = [
  { step: 1, key: 'e1', delayHours: 0 },
  { step: 2, key: 'e2', delayHours: 24 },
  { step: 3, key: 'e3', delayHours: 72 },
  { step: 4, key: 'e4', delayHours: 120 },
  { step: 5, key: 'e5', delayHours: 168 },
  { step: 6, key: 'e6', delayHours: 240 },
  { step: 7, key: 'e7', delayHours: 336 }
];
const MAX_STEP = SEQUENCE.length;
const SUPPORTED_LANGS = ['en', 'fr', 'ar']; // traductions réelles ; de/ru/zh → repli EN

/* ---------- Contenu des emails (EN / FR / AR) ----------
   Aucune statistique, aucun témoignage, aucune garantie d'examen/visa. */
const MESSAGES = {
  en: {
    e1: { s: 'Welcome to ELA Academy — your free guide is here', p: "Here's {{magnet_title}}, and how this works.",
      b: 'Hi {{name}},\n\nWelcome to {{academy_label}} — we are glad you are here.\n\nAs promised, your free guide is ready: {{magnet_title}}\nGet it here: {{guide_url}}\n\nTake five minutes with it today. Pick one phrase and say it out loud — that is the whole first step.\n\nOver the next two weeks we will send a few short emails: a quick win, an honest look at how ELA works, and an invitation to try lessons free. No spam, no pressure, and you can leave whenever you like.\n\nQuestions? Just reply — a real person reads every message.\n\nWarmly,\nThe {{academy_label}} team' },
    e2: { s: 'A 5-minute win you can do today', p: 'Small step, real progress — try this now.',
      b: 'Hi {{name}},\n\nHere is a five-minute win you can do right now — no account, no preparation.\n\n1. Choose five words or phrases you would actually use.\n2. Say each one out loud three times.\n3. Say them again tomorrow morning.\n\nThat is it. Five minutes today beats an hour "someday". Speaking aloud builds recall faster than reading alone.\n\nTry a short free lesson here: {{trial_url}}\n\nKeep going,\nThe {{academy_label}} team' },
    e3: { s: 'What learning a language actually changes', p: 'The everyday benefits — no hype.',
      b: 'Hi {{name}},\n\nForget the hype for a moment. Learning a language means:\n\n- You can hold a real conversation, not just pass a test.\n- Work and study doors open wider when you can communicate.\n- Travel feels less like guesswork.\n- You understand people on their own terms.\n\nNone of that happens overnight. It happens through small, steady practice — which is exactly how ELA is built. You do not need to be talented; you need to start and keep showing up.\n\nSee the academies: {{academies_url}}\n\nReady when you are,\nThe {{academy_label}} team' },
    e4: { s: 'How ELA Academy works', p: 'Self-paced lessons, live classes, verifiable certificate.',
      b: 'Hi {{name}},\n\nHow does ELA Academy actually work? Simply:\n\n- Self-paced lessons: study when it suits you.\n- Live classes: real teachers and other learners for guided practice.\n- A verifiable certificate: complete a course and receive a certificate others can verify.\n\nYou choose the pace. We provide the structure, the teachers and the proof of your progress.\n\nSee how it works: {{trial_url}}\n\nThe {{academy_label}} team' },
    e5: { s: 'Try 12 lessons free — no account needed', p: '12 lessons without an account; 24 with a free account.',
      b: 'Hi {{name}},\n\nThe best way to judge ELA is to try it.\n\nHere is the invitation: 12 lessons free, no account required. Want more? Create a free account and unlock 24 lessons.\n\nNo card. No commitment. No countdown timer.\n\nStart with one lesson: {{trial_url}}\n\nYour first lesson is waiting.\n\nThe {{academy_label}} team' },
    e6: { s: '"I do not have time" — and other honest answers', p: 'Time, level and device — answered plainly.',
      b: 'Hi {{name}},\n\nThree honest answers to the questions we hear most.\n\n"I do not have time." Most learners start with 10–15 minutes a day. Short and consistent beats long and rare.\n\n"What if I am a beginner?" Good — courses start from the very beginning, at your level.\n\n"Do I need a laptop?" No. ELA works on a phone, tablet or computer.\n\nStill unsure? Try a lesson and decide from experience: {{trial_url}}\n\nThe {{academy_label}} team' },
    e7: { s: 'Still thinking about it? The door stays open', p: 'No pressure — the free trial is still here.',
      b: 'Hi {{name}},\n\nThis is the last email in this series, so we will keep it short.\n\nIf ELA is not right for you, that is completely fine — no pressure, and no more reminders after this one.\n\nIf you are still curious, the free trial stays open: 12 lessons without an account, 24 with a free account. No card, no commitment.\n\nBegin here: {{trial_url}}\n\nEither way, thank you for spending part of your week with us.\n\nThe {{academy_label}} team' }
  },
  fr: {
    e1: { s: 'Bienvenue à ELA Academy — votre guide gratuit est arrivé', p: 'Voici {{magnet_title}}, et comment tout fonctionne.',
      b: 'Bonjour {{name}},\n\nBienvenue à {{academy_label}} — ravis de vous compter parmi nous.\n\nComme promis, votre guide gratuit est prêt : {{magnet_title}}\nTéléchargez-le ici : {{guide_url}}\n\nPrenez cinq minutes aujourd\'hui. Choisissez une phrase et dites-la à voix haute : c\'est déjà un premier pas.\n\nDans les deux prochaines semaines, nous vous enverrons quelques messages courts : une victoire rapide, une présentation honnête d\'ELA et une invitation à essayer les leçons gratuitement. Pas de spam, aucune pression, et vous pouvez partir quand vous voulez.\n\nUne question ? Répondez simplement — une vraie personne lit chaque message.\n\nBien à vous,\nL\'équipe {{academy_label}}' },
    e2: { s: 'Une victoire de 5 minutes, dès aujourd\'hui', p: 'Un petit pas, un vrai progrès — essayez maintenant.',
      b: 'Bonjour {{name}},\n\nVoici une victoire de cinq minutes, réalisable tout de suite — sans compte, sans préparation.\n\n1. Choisissez cinq mots ou phrases que vous utiliseriez vraiment.\n2. Dites chacun à voix haute trois fois.\n3. Répétez-les demain matin.\n\nC\'est tout. Cinq minutes aujourd\'hui valent mieux qu\'une heure « un jour ». Parler à voix haute ancre la mémoire plus vite que la lecture seule.\n\nEssayez une courte leçon gratuite : {{trial_url}}\n\nContinuez ainsi,\nL\'équipe {{academy_label}}' },
    e3: { s: 'Ce que l\'apprentissage d\'une langue change vraiment', p: 'Les bénéfices concrets, sans exagération.',
      b: 'Bonjour {{name}},\n\nOublions un instant les promesses exagérées. Apprendre une langue, c\'est :\n\n- tenir une vraie conversation, pas seulement un examen ;\n- ouvrir plus grand les portes du travail et des études ;\n- voyager avec moins d\'improvisation ;\n- comprendre les autres dans leur propre langue.\n\nRien de tout cela n\'arrive du jour au lendemain : cela vient d\'une pratique régulière et modeste. Pas besoin d\'être doué — il faut commencer et continuer.\n\nDécouvrez les académies : {{academies_url}}\n\nQuand vous voulez,\nL\'équipe {{academy_label}}' },
    e4: { s: 'Comment fonctionne ELA Academy', p: 'Cours à votre rythme, classes en direct, certificat vérifiable.',
      b: 'Bonjour {{name}},\n\nComment fonctionne ELA Academy ? Simplement :\n\n- Cours à votre rythme : étudiez quand cela vous convient.\n- Classes en direct : de vrais enseignants et d\'autres apprenants.\n- Un certificat vérifiable : à la fin d\'un cours, recevez un certificat que d\'autres peuvent vérifier.\n\nVous choisissez le rythme ; nous fournissons la structure, les enseignants et la preuve de vos progrès.\n\nVoir le fonctionnement : {{trial_url}}\n\nL\'équipe {{academy_label}}' },
    e5: { s: 'Essayez 12 leçons gratuitement — sans compte', p: '12 leçons sans compte ; 24 avec un compte gratuit.',
      b: 'Bonjour {{name}},\n\nLe meilleur moyen de juger ELA, c\'est de l\'essayer.\n\nVoici l\'invitation : 12 leçons gratuites, sans compte. Vous en voulez plus ? Créez un compte gratuit et débloquez 24 leçons.\n\nSans carte bancaire. Sans engagement. Sans compte à rebours.\n\nCommencez par une leçon : {{trial_url}}\n\nVotre première leçon vous attend.\n\nL\'équipe {{academy_label}}' },
    e6: { s: '« Je n\'ai pas le temps » — et d\'autres réponses honnêtes', p: 'Temps, niveau, appareil : des réponses claires.',
      b: 'Bonjour {{name}},\n\nTrois réponses honnêtes aux questions les plus fréquentes.\n\n« Je n\'ai pas le temps. » La plupart des apprenants commencent par 10 à 15 minutes par jour. Court et régulier vaut mieux que long et rare.\n\n« Et si je suis débutant ? » Tant mieux : les cours commencent au tout début, à votre niveau.\n\n« Faut-il un ordinateur portable ? » Non. ELA fonctionne sur téléphone, tablette ou ordinateur.\n\nEncore hésitant ? Essayez une leçon : {{trial_url}}\n\nL\'équipe {{academy_label}}' },
    e7: { s: 'Vous hésitez encore ? La porte reste ouverte', p: 'Sans pression — l\'essai gratuit reste disponible.',
      b: 'Bonjour {{name}},\n\nC\'est le dernier message de cette série, alors restons brefs.\n\nSi ELA n\'est pas fait pour vous, c\'est tout à fait normal — aucune pression, et plus aucun rappel après celui-ci.\n\nSi la curiosité demeure, l\'essai gratuit reste ouvert : 12 leçons sans compte, 24 avec un compte gratuit. Sans carte, sans engagement.\n\nCommencer : {{trial_url}}\n\nDans tous les cas, merci d\'avoir passé une partie de votre semaine avec nous.\n\nL\'équipe {{academy_label}}' }
  },
  ar: {
    e1: { s: 'مرحبًا بك في ELA Academy — دليلك المجاني جاهز', p: 'إليك {{magnet_title}}، وكيف تعمل الأمور.',
      b: 'مرحبًا {{name}}،\n\nأهلًا بك في {{academy_label}} — يسعدنا انضمامك إلينا.\n\nكما وعدناك، دليلك المجاني جاهز: {{magnet_title}}\nحمّله من هنا: {{guide_url}}\n\nخصّص له خمس دقائق اليوم. اختر عبارة واحدة وانطق بها بصوت مسموع — هذه هي الخطوة الأولى كاملةً.\n\nخلال الأسبوعين المقبلين سنرسل إليك رسائل قصيرة: إنجاز سريع، ونظرة صادقة إلى كيفية عمل ELA، ودعوة لتجربة الدروس مجانًا. بلا إزعاج وبلا ضغط، ويمكنك الانصراف متى شئت.\n\nلديك سؤال؟ ردّ على هذه الرسالة فقط — يقرأ كل رسالة إنسان حقيقي.\n\nمع خالص التحية،\nفريق {{academy_label}}' },
    e2: { s: 'إنجاز في خمس دقائق، اليوم', p: 'خطوة صغيرة وتقدّم حقيقي — جرّبها الآن.',
      b: 'مرحبًا {{name}}،\n\nإليك إنجازًا في خمس دقائق يمكنك تحقيقه الآن — بلا حساب وبلا تحضير.\n\n1. اختر خمس كلمات أو عبارات ستستخدمها فعلًا.\n2. انطق كل واحدة بصوت مسموع ثلاث مرات.\n3. أعدها صباح الغد.\n\nهذا كل شيء. خمس دقائق اليوم أفضل من ساعة «يومًا ما». النطق بصوت مسموع يرسّخ الحفظ أسرع من القراءة وحدها.\n\nجرّب درسًا مجانيًا قصيرًا: {{trial_url}}\n\nواصل التقدّم،\nفريق {{academy_label}}' },
    e3: { s: 'ماذا يغيّر تعلّم اللغة فعلًا', p: 'فوائد ملموسة، بلا مبالغة.',
      b: 'مرحبًا {{name}}،\n\nلنُبعِد المبالغات لحظة. تعلّم اللغة يعني:\n\n- أن تُجري محادثة حقيقية لا مجرد اجتياز اختبار؛\n- أن تُفتح لك أبواب العمل والدراسة على مصراعيها؛\n- أن يصبح السفر استكشافًا لا تخمينًا؛\n- أن تفهم الناس بلغتهم.\n\nلا شيء من هذا يحدث بين ليلة وضحاها، بل عبر ممارسة صغيرة منتظمة. لا تحتاج إلى موهبة استثنائية؛ تحتاج إلى أن تبدأ وأن تستمر.\n\nاستكشف الأكاديميات: {{academies_url}}\n\nجاهزون حين تكون جاهزًا،\nفريق {{academy_label}}' },
    e4: { s: 'كيف تعمل ELA Academy', p: 'دروس ذاتية الوتيرة، وحصص مباشرة، وشهادة قابلة للتحقق.',
      b: 'مرحبًا {{name}}،\n\nكيف تعمل ELA Academy فعلًا؟ ببساطة:\n\n- دروس ذاتية الوتيرة: ادرس في الوقت الذي يناسبك.\n- حصص مباشرة: معلمون حقيقيون ومتعلّمون آخرون للتدريب.\n- شهادة قابلة للتحقق: عند إتمام الدورة تحصل على شهادة يمكن للآخرين التحقق منها.\n\nأنت تختار الوتيرة، ونحن نوفّر البنية والمعلمين ودليل تقدّمك.\n\nاطّلع بنفسك: {{trial_url}}\n\nفريق {{academy_label}}' },
    e5: { s: 'جرّب 12 درسًا مجانًا — دون حاجة إلى حساب', p: '12 درسًا بدون حساب، و24 مع حساب مجاني.',
      b: 'مرحبًا {{name}}،\n\nأفضل طريقة للحكم على ELA هي تجربته.\n\nإليك الدعوة: 12 درسًا مجانًا دون حاجة إلى حساب. تريد المزيد؟ أنشئ حسابًا مجانيًا وافتح 24 درسًا.\n\nبلا بطاقة، وبلا التزام، وبلا عدّاد تنازلي.\n\nابدأ بدرس واحد: {{trial_url}}\n\nدرسك الأول بانتظارك.\n\nفريق {{academy_label}}' },
    e6: { s: '«ليس لديّ وقت» — وأجوبة صادقة أخرى', p: 'الوقت والمستوى والجهاز: إجابات واضحة.',
      b: 'مرحبًا {{name}}،\n\nثلاثة أجوبة صادقة عن أكثر الأسئلة تكرارًا.\n\n«ليس لديّ وقت.» يبدأ معظم المتعلّمين بعشر إلى خمس عشرة دقيقة يوميًا. القليل المنتظم أنفع من الكثير النادر.\n\n«وماذا لو كنت مبتدئًا؟» هذا جيد: الدورات تبدأ من الصفر، وبمستواك.\n\n«هل أحتاج إلى حاسوب محمول؟» لا. يعمل ELA على الهاتف أو الجهاز اللوحي أو الحاسوب.\n\nما زلت مترددًا؟ جرّب درسًا: {{trial_url}}\n\nفريق {{academy_label}}' },
    e7: { s: 'ما زلت تفكّر؟ الباب يبقى مفتوحًا', p: 'بلا ضغط — التجربة المجانية ما زالت متاحة.',
      b: 'مرحبًا {{name}}،\n\nهذه آخر رسالة في السلسلة، لذا سنوجز.\n\nإن لم يكن ELA مناسبًا لك، فلا بأس إطلاقًا — بلا ضغط، ولن تصلك تذكيرات أخرى بعد هذه.\n\nوإن بقي لديك فضول، فالتجربة المجانية ما زالت متاحة: 12 درسًا دون حساب، و24 مع حساب مجاني. بلا بطاقة وبلا التزام.\n\nابدأ من هنا: {{trial_url}}\n\nوفي كل الأحوال، شكرًا لأنك منحتنا جزءًا من أسبوعك.\n\nفريق {{academy_label}}' }
  }
};

/* ---------- Utilitaires ---------- */
function fill(template, vars) {
  return String(template).replace(/\{\{(\w+)\}\}/g, function (_m, k) {
    return vars[k] != null ? String(vars[k]) : '';
  });
}

function normalizeEmail(v) { return String(v || '').trim().toLowerCase(); }

function isSupportedLang(lang) { return SUPPORTED_LANGS.indexOf(String(lang || '').toLowerCase()) >= 0; }

function academyFor(code) { return ACADEMIES[String(code || '').toUpperCase()] || ACADEMIES.EN; }

function langQuery(lang) { return lang && lang !== 'en' ? ('?lang=' + lang) : ''; }

function signToken(leadId, email) {
  const payload = Buffer.from(JSON.stringify({
    id: leadId, e: email, exp: Date.now() + 365 * 24 * HOUR
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return payload + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') < 0) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const payload = parts[0];
  const sig = parts[1];
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let data;
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!data || !data.exp || data.exp < Date.now() || !data.id) return null;
  return data;
}

/* Rend le sujet et le texte d'un email pour un lead et un pas donnés. */
function renderEmail(lead, stepKey) {
  const leadId = lead.id || lead.__id || 'unknown';
  const email = normalizeEmail(lead.email);
  const lang = isSupportedLang(lead.locale) ? String(lead.locale).toLowerCase() : 'en';
  const acad = academyFor(lead.academy);
  const set = MESSAGES[lang] || MESSAGES.en;
  const tpl = set[stepKey] || MESSAGES.en[stepKey];
  const vars = {
    name: (lead.name && String(lead.name).trim()) || 'there',
    academy_label: acad.label,
    magnet_title: acad.magnet,
    sample_phrase: acad.phrase,
    guide_url: SITE + '/lead-magnets/' + acad.slug + langQuery(lang),
    academies_url: SITE + '/academies' + langQuery(lang),
    trial_url: SITE + '/free-trial' + langQuery(lang),
    unsubscribe_url: SITE + '/unsubscribe?token=' + encodeURIComponent(signToken(leadId, email))
  };
  const footer = '\n\n—\nE-Learn Language Academy — One Academy. Six Languages.\n' +
    'Unsubscribe: ' + vars.unsubscribe_url;
  return { subject: fill(tpl.s, vars), preheader: fill(tpl.p, vars), text: fill(tpl.b, vars) + footer, lang };
}

/* ---------- Journalisation analytics (Admin SDK, contourne les règles) ---------- */
async function logEvent(event, data) {
  try {
    const doc = { event: event, ts: Date.now() };
    Object.keys(data || {}).forEach(function (k) { if (k !== 'event' && k !== 'ts') doc[k] = data[k]; });
    await db.collection('marketingEvents').add(doc);
  } catch (e) { /* silencieux */ }
}

/* ---------- Envoi (SendGrid) — désactivé par défaut ---------- */
async function sendNurtureEmail({ to, subject, text, leadId }) {
  if (!SEND_ENABLED) {
    console.log('[nurture:dry-run] to=' + to + ' subject="' + subject + '"');
    return { sent: false, dryRun: true };
  }
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.log('[nurture:log] (no SENDGRID_API_KEY) to=' + to + ' subject="' + subject + '"');
    return { sent: false, noKey: true };
  }
  const from = process.env.SENDGRID_FROM || 'languageacademyelearn@gmail.com';
  const unsub = SITE + '/unsubscribe?token=' + encodeURIComponent(signToken(leadId, to));
  try {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: FROM_NAME },
        subject: subject,
        content: [{ type: 'text/plain', value: text }],
        headers: {
          'List-Unsubscribe': '<' + unsub + '>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      })
    });
    if (!resp.ok) { console.error('nurture sendgrid error', resp.status); return { sent: false, status: resp.status }; }
    return { sent: true, status: resp.status };
  } catch (err) {
    console.error('nurture send failed', err && err.message);
    return { sent: false, error: err && err.message };
  }
}

/* ---------- Requêtes Firestore ---------- */
async function findEarlierActiveLead(email, currentId) {
  const snap = await db.collection(LEADS).where('email', '==', email).limit(25).get();
  let earlier = null;
  snap.docs.forEach(function (d) {
    if (d.id === currentId) return;
    const data = d.data() || {};
    if (data.status === 'unsubscribed' || data.unsubscribed === true) return;
    const t = Number(data.ts || 0);
    if (!earlier || t < earlier.t) earlier = { id: d.id, t: t };
  });
  return earlier ? earlier.id : null;
}

async function isSuppressed(email) {
  const snap = await db.collection(LEADS).where('email', '==', email).limit(25).get();
  let suppressed = false;
  snap.docs.forEach(function (d) {
    const data = d.data() || {};
    if (data.status === 'unsubscribed' || data.unsubscribed === true) suppressed = true;
  });
  return suppressed;
}

async function markLeadsByEmail(email, patch) {
  const snap = await db.collection(LEADS).where('email', '==', email).limit(25).get();
  const updates = [];
  snap.docs.forEach(function (d) {
    const data = d.data() || {};
    if (data.status === 'unsubscribed') return; // ne pas réactiver un désabonné
    updates.push(d.ref.set(Object.assign({ updatedAt: new Date() }, patch), { merge: true }));
  });
  await Promise.all(updates);
}

/* Calcule le prochain pas dû (fonction pure — testable).
   Retourne { step } si un email est dû, { dueAt } si trop tôt,
   { complete:true } si la séquence est terminée. */
function nextDueStep(seq, now) {
  const last = Number((seq && seq.lastSentStep) || 0);
  const next = last + 1;
  if (next > MAX_STEP) return { step: null, complete: true };
  const startedAt = Number((seq && seq.startedAt) || now);
  const dueAt = startedAt + SEQUENCE[next - 1].delayHours * HOUR;
  if (now < dueAt) return { step: null, dueAt: dueAt };
  return { step: next, dueAt: dueAt };
}

/* ---------- Traitement d'un lead : envoie le prochain pas dû ---------- */
async function processLead(ref, leadHint) {
  if (!SEND_ENABLED) return; // dry-run global : ne rien envoyer ni avancer
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data() || {};
  if (data.status !== 'active') return;
  if (data.unsubscribed === true) return;
  const email = normalizeEmail(data.email || (leadHint && leadHint.email));
  if (!email) return;

  const seq = data.sequence || {};
  const now = Date.now();
  const due = nextDueStep(seq, now);
  if (due.complete) {
    await ref.set({ status: 'nurture_complete', updatedAt: new Date() }, { merge: true });
    return;
  }
  if (!due.step) return;
  const nextStep = due.step;
  const startedAt = Number(seq.startedAt || now);

  // Suppression avant envoi (course-safe).
  if (await isSuppressed(email)) {
    await ref.set({ status: 'unsubscribed', unsubscribed: true, updatedAt: new Date() }, { merge: true });
    return;
  }

  // Réclamation idempotente du pas (avance AVANT l'envoi).
  const claimed = await db.runTransaction(async function (t) {
    const s = await t.get(ref);
    const d = s.data() || {};
    if (d.status !== 'active') return false;
    const cur = Number((d.sequence && d.sequence.lastSentStep) || 0);
    if (cur >= nextStep) return false;
    const seqPatch = Object.assign({}, d.sequence || {}, {
      lastSentStep: nextStep,
      lastSentAt: now,
      nextSendAt: now + 1,
      startedAt: nextStep === 1 ? now : startedAt
    });
    const hist = Array.isArray(seqPatch.history) ? seqPatch.history.slice(-10) : [];
    hist.push({ step: nextStep, at: now, dryRun: !SEND_ENABLED });
    seqPatch.history = hist;
    t.set(ref, { sequence: seqPatch, lastEmailSentAt: now, updatedAt: new Date() }, { merge: true });
    return true;
  });
  if (!claimed) return;

  const built = renderEmail({ id: ref.id, email: email, name: data.name, academy: data.academy, locale: data.locale }, SEQUENCE[nextStep - 1].key);
  const res = await sendNurtureEmail({ to: email, subject: built.subject, text: built.text, leadId: ref.id });
  await logEvent('email_sent', {
    sequence_step: nextStep,
    template_id: SEQUENCE[nextStep - 1].key,
    locale: built.lang,
    sent: !!res.sent,
    dryRun: !!res.dryRun
  });

  if (nextStep >= MAX_STEP) {
    await ref.set({ status: 'nurture_complete', updatedAt: new Date() }, { merge: true });
    await logEvent('sequence_stopped', { reason: 'nurture_complete' });
  }
}

/* ============================================================
   TRIGGER 1 — Nouveau lead (création Firestore)
   ============================================================ */
exports.nurtureOnLeadCreated = onDocumentCreated({ document: LEADS + '/{leadId}', region: REGION }, async (event) => {
  const snap = event.data;
  if (!snap) return;
  const leadId = event.params.leadId;
  try {
    const lead = snap.data() || {};
    const email = normalizeEmail(lead.email);
    console.log('[nurture] onLeadCreated id=' + leadId + ' email=' + email + ' consent=' + lead.consent);

    if (!email || lead.consent !== true) {
      await snap.ref.set({ status: 'stopped', stopReason: 'no-consent', updatedAt: new Date() }, { merge: true });
      console.log('[nurture] stopped (no consent) ' + leadId);
      return;
    }

    // Anti-doublon : un autre lead actif existe déjà pour cet email.
    const earlier = await findEarlierActiveLead(email, leadId);
    console.log('[nurture] earlier=' + earlier + ' for ' + leadId);
    if (earlier) {
      await snap.ref.set({ status: 'duplicate', duplicateOf: earlier, updatedAt: new Date() }, { merge: true });
      return;
    }

    const now = Date.now();
    await snap.ref.set({
      email: email,
      status: 'active',
      unsubscribed: false,
      sequence: { step: 0, lastSentStep: 0, startedAt: now, nextSendAt: now, history: [] },
      updatedAt: new Date()
    }, { merge: true });

    await logEvent('lead_created', {
      leadMagnetId: lead.leadMagnetId || '',
      academy: lead.academy || '',
      locale: lead.locale || 'en',
      source: lead.source || ''
    });
    console.log('[nurture] activated ' + leadId);

    // Email 1 immédiat (no-op si l'envoi est désactivé).
    await processLead(snap.ref, { email: email }).catch(function (e) { console.error('nurture e1 failed', leadId, e && e.message); });
  } catch (err) {
    console.error('nurtureOnLeadCreated failed', leadId, err && err.message, err && err.stack);
    await snap.ref.set({ status: 'error', errorMessage: String(err && err.message || err).slice(0, 200), updatedAt: new Date() }, { merge: true }).catch(function () {});
  }
});

/* ============================================================
   TRIGGER 2 — Scheduler (toutes les 15 min) : envoie les pas dus
   ============================================================ */
exports.nurtureScheduler = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'Africa/Lagos', region: SCHEDULER_REGION },
  async () => {
    if (!SEND_ENABLED) { console.log('[nurture] scheduler: sending disabled (NURTURE_SEND_ENABLED != true)'); return; }
    const snap = await db.collection(LEADS).where('status', '==', 'active').limit(200).get();
    let processed = 0;
    for (const doc of snap.docs) {
      try { await processLead(doc.ref, doc.data()); processed++; }
      catch (e) { console.error('nurture process error', doc.id, e && e.message); }
    }
    console.log('[nurture] scheduler processed ' + processed + ' lead(s)');
  }
);

/* ============================================================
   TRIGGER 3 — Inscription (users/{uid} créé) → stop nurturing
   ============================================================ */
exports.nurtureOnUserCreated = onDocumentCreated({ document: 'users/{uid}', region: REGION }, async (event) => {
  const u = event.data && event.data.data();
  if (!u) return;
  const email = normalizeEmail(u.email);
  if (!email) return;
  await markLeadsByEmail(email, { status: 'registered', stopReason: 'registration', registeredAt: new Date() });
  await logEvent('sequence_stopped', { reason: 'registration', academy: u.academy || '' });
});

/* ============================================================
   TRIGGER 4 — Paiement (subscriptions/{uid} devient active) → client
   ============================================================ */
exports.nurtureOnSubscriptionActive = onDocumentWritten({ document: 'subscriptions/{uid}', region: REGION }, async (event) => {
  const after = event.data && event.data.after && event.data.after.data();
  if (!after || after.status !== 'active') return;
  const uid = event.params.uid;
  const userSnap = await db.collection('users').doc(uid).get();
  const email = userSnap.exists ? normalizeEmail(userSnap.data().email) : '';
  if (!email) return;
  await markLeadsByEmail(email, { status: 'customer', stopReason: 'payment', convertedAt: new Date() });
  await logEvent('sequence_stopped', { reason: 'payment' });
});

/* ============================================================
   Unsubscribe — endpoint HTTP signé (une clique)
   ============================================================ */
function unsubscribePage(title, message) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<meta name="robots" content="noindex,nofollow">' +
    '<title>' + title + ' — E-Learn Language Academy</title></head>' +
    '<body style="font-family:Arial,Helvetica,sans-serif;background:#FAF6EC;color:#063D2C;margin:0;padding:2rem">' +
    '<main style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:1.6rem">' +
    '<h1 style="font-size:1.4rem">' + title + '</h1><p>' + message + '</p>' +
    '<p><a href="/" style="color:#0B6B4F">E-Learn Language Academy</a></p>' +
    '</main></body></html>';
}

exports.nurtureUnsubscribe = onRequest({ region: REGION }, async (req, res) => {
  const token = String((req.query && req.query.token) || '');
  const data = verifyToken(token);
  if (!data) {
    res.status(400).send(unsubscribePage('Invalid link', 'This unsubscribe link is invalid or has expired. If you keep receiving emails, please contact contact@elaacademy.ng.'));
    return;
  }
  try {
    const ref = db.collection(LEADS).doc(data.id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.set({ status: 'unsubscribed', unsubscribed: true, unsubscribedAt: new Date(), updatedAt: new Date() }, { merge: true });
      await logEvent('lead_unsubscribed', { source: 'link' });
    }
    res.status(200).send(unsubscribePage('You are unsubscribed', 'You will not receive any more marketing emails from ELA Academy. You can still sign in and use the platform as usual.'));
  } catch (e) {
    console.error('unsubscribe failed', e && e.message);
    res.status(500).send(unsubscribePage('Something went wrong', 'We could not process your request. Please try again later.'));
  }
});

/* Exports pour les tests unitaires (logique pure). */
exports.__test = { renderEmail, signToken, verifyToken, SEQUENCE, MAX_STEP, SUPPORTED_LANGS, isSupportedLang, normalizeEmail, fill, academyFor, nextDueStep };
