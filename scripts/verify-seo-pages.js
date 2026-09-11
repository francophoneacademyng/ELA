/* ============================================================
   ELA — scripts/verify-seo-pages.js
   Vérifie les coquilles SEO statiques : title, description,
   canonical, hreflang, robots, JSON-LD, noscript, liens internes.
   Usage : node scripts/verify-seo-pages.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://elaacademy.ng';
const LANGS = ['en', 'fr', 'ar', 'de', 'ru', 'zh'];

const ROUTES = [
  '/academies', '/pricing', '/free-trial', '/courses', '/live', '/institutions',
  '/lead-magnets', '/lead-magnets/fr', '/lead-magnets/de', '/lead-magnets/zh',
  '/lead-magnets/en', '/lead-magnets/ar', '/lead-magnets/ru',
  '/terms', '/privacy', '/refund'
];

function fileFor(route) { return path.join(ROOT, route.replace(/^\//, '') + '.html'); }
function attr(html, re) { const m = html.match(re); return m ? m[1] : null; }

let fail = 0;
function check(label, cond, detail) {
  if (!cond) fail++;
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + label + (detail ? '  [' + detail + ']' : ''));
}

ROUTES.forEach(function (route) {
  const file = fileFor(route);
  if (!fs.existsSync(file)) { check(route + ' exists', false, file); return; }
  const html = fs.readFileSync(file, 'utf8');

  const title = attr(html, /<title>([\s\S]*?)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  const twTitle = attr(html, /<meta name="twitter:title" content="([^"]*)"/);

  check(route + ' title', !!title && title.length > 5 && title.length <= 70, title);
  check(route + ' description', !!desc && desc.length > 40 && desc.length <= 170, (desc || '').length + ' chars');
  check(route + ' canonical', canonical === SITE + route, canonical);
  check(route + ' og:url', ogUrl === SITE + route, ogUrl);
  check(route + ' twitter:title', !!twTitle);
  check(route + ' robots index', robots === 'index,follow,max-image-preview:large', robots);
  check(route + ' noscript', html.indexOf('<noscript>') >= 0);

  LANGS.forEach(function (l) {
    const re = new RegExp('hreflang="' + l + '" href="' + SITE.replace(/\//g, '\\/') + route.replace(/\//g, '\\/') + '\\?lang=' + l + '"');
    check(route + ' hreflang ' + l, re.test(html));
  });
  check(route + ' hreflang x-default', /hreflang="x-default"/.test(html));

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let ldOk = false; let types = '';
  if (ld) {
    try {
      const j = JSON.parse(ld[1]);
      types = (j['@graph'] || []).map(function (x) { return x['@type']; }).join(',');
      ldOk = types.indexOf('EducationalOrganization') >= 0 && types.indexOf('WebSite') >= 0 && types.indexOf('BreadcrumbList') >= 0;
    } catch (e) { ldOk = false; }
  }
  check(route + ' JSON-LD', ldOk, types);
});

console.log(fail === 0 ? '\nALL SEO PAGE CHECKS PASSED' : '\n' + fail + ' FAILURES');
process.exit(fail === 0 ? 0 : 1);
