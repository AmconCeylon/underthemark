/* Static site generator for underthemark.com
   Writes plain HTML into dist/ — no runtime dependency, drag-drop to Vercel.
   Add an article by dropping a .md file in content/ and running: node build.js */

const fs = require('fs');
const path = require('path');

const SITE = {
  name: 'Under the Mark',
  domain: 'https://underthemark.com',
  tagline: 'See what you planned and what you actually spent, side by side.',
  ga: 'G-3JFGX4Y3RC',
  adsense: 'ca-pub-3792288400696045',
  // Leave these blank until you create ad units in AdSense and paste the
  // numeric slot IDs here. While blank, no manual unit is rendered at all,
  // so there are no empty gaps. Auto ads still run from the page-level script.
  adslots: { inline: '', sidebar: '' },
  extension: 'https://chromewebstore.google.com/',
  app: '/app/',
  amcon: 'https://amconceylon.co'
};

const OUT = path.join(__dirname, 'dist');
const CONTENT = path.join(__dirname, 'content');

/* ---------- tiny markdown converter ---------- */
function md(src) {
  const lines = src.split('\n');
  let out = '', inList = false, inQuote = false, inTable = false;
  const inline = t => t
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, href) =>
      /^https?:\/\//.test(href) && href.indexOf(SITE.domain) < 0
        ? `<a href="${href}" target="_blank" rel="noopener">${txt}</a>`
        : `<a href="${href}">${txt}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  const closeList = () => { if (inList) { out += '</ul>\n'; inList = false; } };
  const closeQuote = () => { if (inQuote) { out += '</blockquote>\n'; inQuote = false; } };
  const closeTable = () => { if (inTable) { out += '</tbody></table></div>\n'; inTable = false; } };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) { closeList(); closeQuote(); closeTable(); continue; }

    if (line === '---') { closeList(); closeQuote(); closeTable(); out += '<hr>\n'; continue; }

    if (/^\|/.test(line)) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      if (!inTable) {
        out += '<div class="tw"><table><thead><tr>' +
          cells.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>\n';
        inTable = true;
      } else {
        out += '<tr>' + cells.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>\n';
      }
      continue;
    } else closeTable();

    let m;
    if ((m = line.match(/^(#{2,4})\s+(.*)$/))) {
      closeList(); closeQuote();
      const lvl = m[1].length;
      const id = m[2].toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      out += `<h${lvl} id="${id}">${inline(m[2])}</h${lvl}>\n`;
      continue;
    }
    if ((m = line.match(/^[-*]\s+(.*)$/))) {
      closeQuote();
      if (!inList) { out += '<ul>\n'; inList = true; }
      out += '<li>' + inline(m[1]) + '</li>\n';
      continue;
    }
    if ((m = line.match(/^>\s?(.*)$/))) {
      closeList();
      if (!inQuote) { out += '<blockquote>\n'; inQuote = true; }
      out += inline(m[1]) + ' ';
      continue;
    }
    if (line === '[[AD]]') { closeList(); closeQuote(); out += AD_INLINE; continue; }
    if (line === '[[AMCON]]') { closeList(); closeQuote(); out += amconBanner('inline'); continue; }

    closeList(); closeQuote();
    out += '<p>' + inline(line) + '</p>\n';
  }
  closeList(); closeQuote(); closeTable();
  return out;
}

function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  m[1].split('\n').forEach(l => {
    const i = l.indexOf(':');
    if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  });
  return { meta, body: m[2] };
}

/* ---------- shared chrome ---------- */
const LOGO = `<svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#6B5BF0"/><stop offset="1" stop-color="#4A38D6"/></linearGradient></defs>
<rect width="64" height="64" rx="15" fill="url(#lg)"/>
<rect x="12" y="23" width="40" height="3.4" rx="1.7" fill="#fff"/>
<rect x="24.5" y="34" width="15" height="18" rx="3" fill="#fff" opacity=".95"/></svg>`;

/* The Amcon mark is embedded directly in the page rather than fetched. A
   missing file here shows broken-image alt text inside the studio's own
   banner, which is the worst possible place for it to fail. Embedded, it
   cannot 404, cannot be served stale by a cache, and costs one request less. */
const AMCON_MARK = (function () {
  try {
    return fs.readFileSync(path.join(__dirname, 'assets', 'amcon-logo.datauri.txt'), 'utf8').trim();
  } catch (e) {
    return '/assets/amcon-logo.png';
  }
})();

const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="15" fill="#5646E4"/>' +
  '<rect x="12" y="23" width="40" height="3.4" rx="1.7" fill="#fff"/>' +
  '<rect x="24.5" y="34" width="15" height="18" rx="3" fill="#fff"/></svg>');

/* Renders nothing unless a real numeric slot ID is configured. An <ins> with a
   made-up slot never fills, and an unfilled unit leaves a large blank gap on the
   page — which is both ugly and a poor look during AdSense review. */
function adUnit(slot, kind) {
  if (!slot) return '';
  const fmt = kind === 'sidebar' ? 'auto' : 'fluid';
  return `<div class="ad ad-${kind || 'inline'}">
  <div class="ad-label">Advertisement</div>
  <ins class="adsbygoogle" style="display:block" data-ad-client="${SITE.adsense}"
       data-ad-slot="${slot}" data-ad-format="${fmt}" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
</div>\n`;
}
const AD_INLINE = adUnit(SITE.adslots.inline, 'inline');

function amconBanner(kind) {
  const wide = kind === 'wide';
  return `<aside class="amcon ${wide ? 'amcon-wide' : 'amcon-inline'}">
  <img class="amcon-logo" src="${AMCON_MARK}" width="76" height="76"
       alt="Amcon Ceylon logo" decoding="async">
  <div class="amcon-body">
    <div class="amcon-kicker">Built by</div>
    <div class="amcon-name">Amcon Ceylon</div>
    <p class="amcon-copy">${wide
      ? 'A digital product studio in Colombo, Sri Lanka. We design and build web apps, Chrome extensions and product sites for teams around the world.'
      : 'Need something like this built for your business? We design and build web apps and browser extensions from Colombo.'}</p>
    <a class="amcon-cta" href="${SITE.amcon}" target="_blank" rel="noopener">Visit amconceylon.co &rarr;</a>
  </div>
</aside>\n`;
}

function head(o) {
  const url = SITE.domain + o.path;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${o.title}</title>
<meta name="description" content="${o.description}">
<meta name="google-adsense-account" content="${SITE.adsense}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<link rel="icon" href="${FAVICON}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#5646E4">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Under the Mark">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="${o.type || 'website'}">
<meta property="og:title" content="${o.title}">
<meta property="og:description" content="${o.description}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
${o.schema ? '<script type="application/ld+json">' + JSON.stringify(o.schema) + '</script>' : ''}
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${SITE.ga}');
</script>
<script>
  /* Respect the cookie choice before AdSense loads. Declining serves
     non-personalised adverts rather than no adverts. */
  (function(){
    var c = null;
    try { c = localStorage.getItem('utm.consent'); } catch (e) {}
    window.adsbygoogle = window.adsbygoogle || [];
    if (c !== 'all') window.adsbygoogle.requestNonPersonalizedAds = 1;
  })();
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsense}" crossorigin="anonymous"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="/">${LOGO}<span>Under the Mark</span></a>
    <nav class="links" id="nav" aria-label="Main">
      <a href="/how-it-works/">How it works</a>
      <a href="/articles/">Guides</a>
      <a href="/about/">About</a>
      <a href="/chrome-extension/" class="nav-only-mobile">Chrome extension</a>
      <a href="/privacy/" class="nav-only-mobile">Privacy</a>
      <a class="btn btn-sm" href="${SITE.app}">Open the app</a>
    </nav>
    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<main id="main">`;
}

function foot() {
  return `</main>
<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand">
      <a class="brand brand-foot" href="/">${LOGO}<span>Under the Mark</span></a>
      <p class="foot-copy">A free budget planner that shows planned and actual side by side, and points out
        where you are paying more than you need to. Your figures never leave your device.</p>
    </div>
    <div class="foot-cols">
      <div><h4>Product</h4>
        <a href="${SITE.app}">Open the app</a>
        <a href="/how-it-works/">How it works</a>
        <a href="/chrome-extension/">Chrome extension</a>
      </div>
      <div><h4>Guides</h4>
        <a href="/articles/">All guides</a>
        <a href="/articles/budget-vs-actual/">Budget vs actual</a>
        <a href="/articles/cancel-subscriptions/">Cancelling subscriptions</a>
      </div>
      <div><h4>Company</h4>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
        <a href="${SITE.amcon}" target="_blank" rel="noopener">Amcon Ceylon</a>
      </div>
      <div><h4>Legal</h4>
        <a href="/privacy/">Privacy policy</a>
        <a href="/cookies/">Cookie policy</a>
        <a href="/terms/">Terms of use</a>
        <a href="/disclaimer/">Disclaimer</a>
      </div>
    </div>
  </div>
  <div class="wrap foot-legal">
    <span>&copy; ${new Date().getFullYear()} Under the Mark. Free to use.</span>
    <span>Built by <a href="${SITE.amcon}" target="_blank" rel="noopener">Amcon Ceylon</a>,
      a digital product studio in Colombo.</span>
  </div>
</footer>
<div id="cookiebar" class="cookiebar" role="dialog" aria-label="Cookie choices" hidden>
  <div class="cookiebar-in">
    <p>We use cookies for analytics and to show adverts, which is what keeps
      Under the Mark free. Your budget figures are never part of this &mdash; they stay in your
      browser and are never sent anywhere. <a href="/cookies/">Read the cookie policy</a>.</p>
    <div class="cookiebar-btns">
      <button id="ck-no" class="btn btn-g btn-sm" type="button">Essential only</button>
      <button id="ck-yes" class="btn btn-sm" type="button">Accept all</button>
    </div>
  </div>
</div>
<script>
/* mobile menu */
(function(){
  var b = document.getElementById('burger'), n = document.getElementById('nav');
  if (!b || !n) return;
  b.addEventListener('click', function(){
    var open = n.classList.toggle('open');
    b.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  n.addEventListener('click', function(e){
    if (e.target.tagName === 'A') { n.classList.remove('open'); b.classList.remove('open');
      b.setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { n.classList.remove('open'); b.classList.remove('open');
      b.setAttribute('aria-expanded','false'); }
  });
})();

/* install as an app — Chrome, Edge and Android fire beforeinstallprompt.
   iOS Safari does not, so those users get instructions instead. */
(function(){
  var deferred = null;
  var btns = document.querySelectorAll('[data-install]');
  if (!btns.length) return;
  function show(){ btns.forEach(function(b){ b.hidden = false; }); }
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault(); deferred = e; show();
  });
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (isIOS && !standalone) show();
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      if (deferred) { deferred.prompt(); deferred = null; return; }
      if (isIOS) alert('To install: tap the Share button in Safari, then "Add to Home Screen".');
      else alert('Open your browser menu and choose "Install app" or "Add to Home screen".');
    });
  });
  if (standalone) btns.forEach(function(b){ b.hidden = true; });
})();

/* service worker: makes the app usable offline */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').catch(function(){});
  });
}

(function(){
  var bar = document.getElementById('cookiebar');
  var saved = null;
  try { saved = localStorage.getItem('utm.consent'); } catch (e) { return; }
  if (!saved) bar.hidden = false;
  function choose(v){
    try { localStorage.setItem('utm.consent', v); } catch (e) {}
    bar.hidden = true;
    if (v === 'all' && window.gtag) gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted' });
  }
  document.getElementById('ck-yes').addEventListener('click', function(){ choose('all'); });
  document.getElementById('ck-no').addEventListener('click', function(){ choose('essential'); });
})();
</script>
</body>
</html>`;
}

function page(o) { return head(o) + o.body + foot(); }

module.exports = { SITE, md, frontMatter, page, amconBanner, adUnit, AD_INLINE, LOGO, OUT, CONTENT };

if (require.main === module) require('./pages.js').build();
