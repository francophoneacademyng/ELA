/* ============================================================
   ELA — scripts/generate-seo-pages.js
   Génère des coquilles HTML statiques pour les routes publiques
   (prerender-lite) à partir de index.html.
   ------------------------------------------------------------
   - Chaque page reçoit un <head> correct : title, description,
     canonical, Open Graph, Twitter, hreflang, JSON-LD.
   - Le <body> reste identique (SPA) : le routeur lit le chemin.
   - Firebase Hosting `cleanUrls` sert /academies depuis academies.html.
   - Relancer après toute modification de index.html :
       node scripts/generate-seo-pages.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://elaacademy.ng';
const LANGS = ['en', 'fr', 'ar', 'de', 'ru', 'zh'];

const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', 'en.json'), 'utf8'));

const DESCRIPTIONS = {
  '/academies': 'Explore six language academies — French, German, Mandarin, English, Arabic and Russian — with CEFR-aligned levels, live classes and verifiable certificates.',
  '/pricing': 'ELA Academy pricing: 1, 3 or 6-month plans across general, premium and business tiers, per language. See exactly what each plan includes.',
  '/free-trial': 'Start free: try lessons in French, German, Mandarin, English, Arabic or Russian before you subscribe. No account needed for the first lessons.',
  '/courses': 'Browse ELA Academy courses by language and level. Structured lessons, quizzes and progress tracking across six academies.',
  '/live': 'Live online language classes at ELA Academy. See upcoming sessions and join with real teachers.',
  '/institutions': 'Language training for schools, universities and companies — six languages, cohort and group formats. Talk to ELA Academy.',
  '/lead-magnets': 'Free checklists, study planners and exam guides for IELTS, Goethe, HSK, CECRL, ALPT and TORFL — built for Nigerian and African learners.',
  '/lead-magnets/fr': 'Free CECRL French study guide: level-by-level checklist, study plan and exam tips for African learners preparing to study or work abroad.',
  '/lead-magnets/de': 'Free Goethe-Zertifikat prep guide: A1–B1 checklist, study planner and exam tips for Nigerian and African learners heading to Germany.',
  '/lead-magnets/zh': 'Free HSK Chinese study guide with level checklist, study plan and practical supplier phrases for learners preparing for China study or trade.',
  '/lead-magnets/en': 'Free IELTS study guide: band-by-band checklist, study plan and exam tips for learners targeting study, work or migration abroad.',
  '/lead-magnets/ar': 'Free Gulf business Arabic phrasebook and etiquette guide: essential phrases, transliteration and level guidance for beginners.',
  '/lead-magnets/ru': 'Free TORFL Russian study guide: A1 checklist, Cyrillic quick-start and scholarship document checklist for study in Russia.',
  '/terms': 'E-Learn Language Academy terms and conditions for course subscriptions and platform use.',
  '/privacy': 'How E-Learn Language Academy collects, uses and protects your personal data.',
  '/refund': 'E-Learn Language Academy refund and cancellation policy for course subscriptions.'
};

const TITLES = {
  '/lead-magnets': 'Free Language Exam Prep Guides',
  '/lead-magnets/fr': 'Free CECRL French Study Guide',
  '/lead-magnets/de': 'Free Goethe-Zertifikat Study Guide',
  '/lead-magnets/zh': 'Free HSK Chinese Study Guide',
  '/lead-magnets/en': 'Free IELTS Study Guide and Checklist',
  '/lead-magnets/ar': 'Free Gulf Business Arabic Guide',
  '/lead-magnets/ru': 'Free TORFL Russian Study Guide'
};

const ROUTES = [
  { p: '/academies', key: 'nav.academies', h1: 'Academies — Six Languages' },
  { p: '/pricing', key: 'nav.pricing', h1: 'Pricing' },
  { p: '/free-trial', key: 'nav.freeTrial', h1: 'Free Trial' },
  { p: '/courses', key: 'nav.courses', h1: 'Courses' },
  { p: '/live', key: 'nav.live', h1: 'Live classes' },
  { p: '/institutions', key: 'nav.institutions', h1: 'For schools and companies' },
  { p: '/lead-magnets', key: 'nav.guides', h1: 'Free language exam prep downloads' },
  { p: '/lead-magnets/fr', key: 'nav.guides', h1: 'French A1–A2 Starter Checklist' },
  { p: '/lead-magnets/de', key: 'nav.guides', h1: 'Germany Study & Ausbildung Prep Checklist (A1–B1)' },
  { p: '/lead-magnets/zh', key: 'nav.guides', h1: 'China Business Mandarin Starter Kit (HSK 1–2)' },
  { p: '/lead-magnets/en', key: 'nav.guides', h1: 'IELTS 7+ Professional English Checklist' },
  { p: '/lead-magnets/ar', key: 'nav.guides', h1: 'Gulf Business Arabic Phrasebook + Etiquette Guide' },
  { p: '/lead-magnets/ru', key: 'nav.guides', h1: 'Russian Scholarship & TORFL A1 Prep Checklist' },
  { p: '/terms', key: 'footer.terms', h1: 'Terms and Conditions' },
  { p: '/privacy', key: 'footer.privacy', h1: 'Privacy Policy' },
  { p: '/refund', key: 'footer.refundPolicy', h1: 'Refund Policy' }
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function breadcrumbs(route, name) {
  const items = [{ position: 1, name: 'Home', item: SITE + '/' }];
  if (route.indexOf('/lead-magnets/') === 0) {
    items.push({ position: 2, name: 'Free guides', item: SITE + '/lead-magnets' });
    items.push({ position: 3, name: name, item: SITE + route });
  } else {
    items.push({ position: 2, name: name, item: SITE + route });
  }
  return { '@type': 'BreadcrumbList', itemListElement: items.map(function (i) { return { '@type': 'ListItem', position: i.position, name: i.name, item: i.item }; }) };
}

function buildJsonLd(route, name) {
  const graph = [
    {
      '@type': 'EducationalOrganization', '@id': SITE + '/#organization',
      name: 'E-Learn Language Academy', alternateName: 'ELA Academy', url: SITE + '/',
      logo: SITE + '/assets/img/ela-logo.svg', email: 'contact@elaacademy.ng',
      areaServed: 'NG', knowsLanguage: ['en', 'fr', 'ar', 'de', 'ru', 'zh']
    },
    {
      '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/',
      name: 'E-Learn Language Academy', publisher: { '@id': SITE + '/#organization' }, inLanguage: 'en'
    }
  ];
  if (route !== '/') graph.push(breadcrumbs(route, name));
  return { '@context': 'https://schema.org', '@graph': graph };
}

function alternates(route) {
  const base = SITE + route;
  return LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l + '" href="' + base + '?lang=' + l + '" data-ela-hreflang="1">';
  }).join('\n  ') + '\n  <link rel="alternate" hreflang="x-default" href="' + base + '" data-ela-hreflang="1">';
}

function noscript(h1, desc) {
  return '<noscript>\n' +
    '    <section class="section">\n' +
    '      <h1 class="section-title">' + esc(h1) + '</h1>\n' +
    '      <p>' + esc(desc) + '</p>\n' +
    '      <p><a href="/academies">Academies</a> · <a href="/free-trial">Free Trial</a> · <a href="/pricing">Pricing</a> · <a href="/lead-magnets">Free guides</a></p>\n' +
    '    </section>\n' +
    '  </noscript>';
}

const master = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function buildShell(route, key, h1) {
  const title = (TITLES[route] || en[key]) + ' — E-Learn Language Academy';
  const desc = DESCRIPTIONS[route];
  const canonical = SITE + route;
  let html = master;

  /* Retirer le hreflang et le noscript du master (propres à l'accueil)
     avant d'injecter ceux de la route courante. */
  html = html.replace(/[ \t]*<link rel="alternate" hreflang="[^"]*"[^>]*data-ela-hreflang="1">\n?/g, '');
  html = html.replace(/\n?[ \t]*<!-- Contenu statique de repli[\s\S]*?<\/noscript>/g, '');

  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(title) + '</title>');
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  html = html.replace(/(<link rel="canonical" href=")[^"]*(">)/, '$1' + canonical + '$2\n  ' + alternates(route));
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + esc(title) + '$2');
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + canonical + '$2');
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + esc(title) + '$2');
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  html = html.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, '$1\n  ' + JSON.stringify(buildJsonLd(route, h1), null, 2).replace(/\n/g, '\n  ') + '\n  $2');
  html = html.replace(/(<main id="app" tabindex="-1"><\/main>)/, '$1\n\n  <!-- Contenu statique de repli (crawlers sans JS) -->\n  ' + noscript(h1, desc));

  const out = path.join(ROOT, route.replace(/^\//, '') + '.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, 'utf8');
  return out.replace(ROOT + path.sep, '');
}

const written = ROUTES.map(function (r) { return buildShell(r.p, r.key, r.h1); });
console.log('Generated ' + written.length + ' SEO pages:');
written.forEach(function (w) { console.log('  ' + w); });
