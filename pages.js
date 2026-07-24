const fs = require('fs');
const path = require('path');
const B = require('./build.js');
const { SITE, md, frontMatter, page, amconBanner, AD_INLINE, LOGO, OUT, CONTENT } = B;

function write(rel, html) {
  const dir = path.join(OUT, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

/* ---------- drawn product shot ---------- */
const SHOT = `<div class="shot">
  <div class="shot-bar"><i></i><i></i><i></i><span>underthemark.com</span></div>
  <div class="shot-b">
    <div class="shot-row h"><span>July — subscriptions</span><span class="v">Planned</span><span class="v">Actual</span><span class="d">Diff</span></div>
    <div class="shot-row"><span class="n">Netflix</span><span class="v">17.99</span><span class="v">17.99</span><span class="d ok">0.00</span></div>
    <div class="shot-row"><span class="n">Spotify</span><span class="v">11.99</span><span class="v">14.99</span><span class="d no">+3.00</span></div>
    <div class="shot-row"><span class="n">Adobe</span><span class="v">59.99</span><span class="v">59.99</span><span class="d ok">0.00</span></div>
    <div class="shot-row"><span class="n">Gym</span><span class="v">24.99</span><span class="v">0.00</span><span class="d ok">&minus;24.99</span></div>
    <div class="shot-tot"><span>Left over</span><span class="v">1,240</span><span class="v">1,262</span><span class="d">+22</span></div>
  </div>
</div>`;

function icon(d) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5646E4"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
const ICONS = {
  columns: icon('<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>'),
  tag: icon('<path d="M20 12l-8 8-9-9V4h7z"/><circle cx="7.5" cy="7.5" r="1.2"/>'),
  lock: icon('<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>'),
  upload: icon('<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/>'),
  chrome: icon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/><path d="M12 8.8H21"/><path d="M9.1 13.6L4.6 20"/>'),
  cash: icon('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>')
};

/* ---------- homepage ---------- */
function home() {
  const body = `
<section class="hero"><div class="wrap hero-in">
  <div>
    <span class="kicker">Free, no account, nothing uploaded</span>
    <h1>Know what you planned. See what you <em>actually</em> spent.</h1>
    <p class="lede">Most budget apps tell you where your money went after it has gone. Under the Mark puts
      your plan and your reality in the same table, line by line, so you can see the gap while there is
      still time to do something about it.</p>
    <div class="hero-cta">
      <a class="btn" href="${SITE.app}">Open the app &mdash; free</a>
      <a class="btn btn-g" href="/chrome-extension/">Get the Chrome extension</a>
    </div>
    <p class="hero-note">No sign-up. No card. Your figures stay in your browser.</p>
  </div>
  ${SHOT}
</div></section>

<section><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Why it is different</p>
    <h2>Three things most budget apps do not do</h2>
    <p>Tracking is the easy part. Knowing whether you are on course, and what to change, is the part that
      actually saves money.</p>
  </div>
  <div class="grid3">
    <div class="feat"><div class="ic">${ICONS.columns}</div>
      <h3>Two numbers on every line</h3>
      <p>Each line carries its own planned figure and its own actual figure, with the difference beside
        them. Categories and month totals add up from those lines, so the two views can never drift apart.</p></div>
    <div class="feat"><div class="ic">${ICONS.tag}</div>
      <h3>It suggests cheaper options</h3>
      <p>Sixty-two common services with real alternatives — lower tiers, annual billing, and free
        replacements — each with the trade-off written out plainly rather than hidden.</p></div>
    <div class="feat"><div class="ic">${ICONS.lock}</div>
      <h3>Nothing leaves your device</h3>
      <p>There is no server, no account and no analytics on your figures. Everything is stored in your own
        browser. Close the tab and it is still yours alone.</p></div>
  </div>
</div></section>

<section class="band"><div class="wrap">
  <div class="sec-head"><h2>How it works</h2>
    <p>Four steps, and the first three take a couple of minutes.</p></div>
  <div class="steps">
    <div class="step"><h3>Set your plan</h3><p>Add a line for each thing you expect to spend on and type
      what you expect it to cost.</p></div>
    <div class="step"><h3>Record what happened</h3><p>Type the actual figures, or import a CSV from your
      bank and let it fill them in.</p></div>
    <div class="step"><h3>See the gap</h3><p>Every line shows the difference. Overspending turns red before
      the month is over, not after.</p></div>
    <div class="step"><h3>Cut what you can</h3><p>Check the cheaper options for the services you already pay
      for, and apply the savings to next month.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="grid2">
    <div class="feat"><div class="ic">${ICONS.upload}</div>
      <h3>Import your bank statement</h3>
      <p>Drop in a CSV and it reads the columns, tidies up the messy merchant codes and sorts most
        transactions into the right category. You review everything before it is saved. It handles comma,
        semicolon and tab files, and both day-first and month-first dates.</p></div>
    <div class="feat"><div class="ic">${ICONS.chrome}</div>
      <h3>Catch purchases as you make them</h3>
      <p>The Chrome extension spots order confirmation pages on the shops you choose, finds the total and
        asks whether to save it. Nothing is recorded without your say-so, and it only runs on sites you
        have added yourself. <a href="/chrome-extension/">More about the extension</a>.</p></div>
  </div>
  ${AD_INLINE}
</div></section>

<section><div class="wrap">
  <div class="sec-head"><p class="eyebrow">Guides</p><h2>Spend less without giving anything up</h2>
    <p>Practical, specific writing on cancelling what you do not use and paying less for what you do.</p></div>
  ${articleCards(3)}
  <p style="margin-top:26px"><a class="btn btn-g" href="/articles/">Read all guides</a></p>
</div></section>

<div class="wrap">${amconBanner('wide')}</div>

<div class="wrap"><div class="cta-band">
  <h2>It is free, and it always will be</h2>
  <p>No account, no trial, no upgrade prompt. Open it and start typing.</p>
  <a class="btn" href="${SITE.app}">Open Under the Mark</a>
</div></div>`;

  return page({
    path: '/', title: 'Under the Mark — free budget planner with planned and actual side by side',
    description: 'A free budget planner that shows what you planned and what you actually spent on every line, imports your bank CSV, and suggests cheaper alternatives to the services you pay for. Nothing leaves your browser.',
    schema: {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication',
      name: 'Under the Mark', applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web browser', url: SITE.domain,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free budget planner showing planned and actual spending side by side.',
      author: { '@type': 'Organization', name: 'Amcon Ceylon', url: SITE.amcon }
    },
    body
  });
}

/* ---------- how it works ---------- */
function howItWorks() {
  const body = `<section><div class="wrap" style="max-width:820px">
  <h1 style="font-size:clamp(32px,4.4vw,46px);font-weight:800;margin-bottom:16px">How Under the Mark works</h1>
  <p class="art-lede">A walk through the whole thing, from an empty month to knowing exactly where you
    stand and what to cut.</p>

  <div class="prose">
    <h2>The idea in one sentence</h2>
    <p>A budget is only useful if you can compare it to what actually happened, which is why every line in
      Under the Mark carries two figures rather than one.</p>

    <h2>Setting the plan</h2>
    <p>Open Expenses and you will find categories grouped into Home, Food, Subscriptions and so on, plus a
      General group for anything that does not fit. Under each category is a button to add a line. A line
      is one specific thing: <em>Netflix</em>, not <em>entertainment</em>. Type what you expect it to cost
      in the Planned column.</p>
    <p>You do not have to fill in everything at once. Most people start with the four or five that matter
      and add the rest as the month goes on.</p>

    <h2>Recording what happened</h2>
    <p>There are three ways in, and they work together.</p>
    <ul>
      <li><strong>Type it.</strong> Put the real figure in the Actual column next to the plan.</li>
      <li><strong>Import a statement.</strong> Export a CSV from your bank and drop it in. Merchant codes
        are tidied up, transactions are grouped into one line per shop per month, and most are sorted into
        the right category automatically. You confirm before anything is saved.</li>
      <li><strong>Let the extension catch it.</strong> On shops you have added, order confirmation pages are
        spotted and you are asked whether to save the total.</li>
    </ul>

    ${AD_INLINE}

    <h2>Reading the difference</h2>
    <p>The difference column does the work. On expenses, spending less than planned is good and shows green;
      more is red. On income and savings it is the other way round, because falling short of what you
      planned to save is the problem, not the reverse.</p>
    <p>The dashboard puts it together: a dashed bar showing your plan, a solid bar underneath showing
      reality, and a table ending in the only number that really matters — what is left over.</p>

    <h2>Finding cheaper options</h2>
    <p>The Cheaper Options page lists 62 common services with alternatives for each: a lower tier, annual
      billing instead of monthly, or a free replacement. Every one has its trade-off written out, because
      an alternative that quietly drops a feature you rely on is not a saving.</p>
    <p>Prices there are shown in US dollars and are not converted, because exchange rates move and a
      converted figure that is three months stale is worse than no figure at all. If you budget in another
      currency you can enter your own rate and the comparison against your own lines will use it.</p>

    <h2>Where your data lives</h2>
    <p>In your browser, and nowhere else. There is no account to create and no server holding your figures.
      That does mean your data is tied to one browser on one device, so there is a backup export on the
      Data page. Use it before you clear your browser or change machine.</p>
  </div>

  ${amconBanner('inline')}

  <div class="cta-band"><h2>Ready to try it?</h2>
    <p>It takes about two minutes to set up your first month.</p>
    <a class="btn" href="${SITE.app}">Open the app</a></div>
</div></section>`;
  return page({
    path: '/how-it-works/', title: 'How it works — Under the Mark',
    description: 'A full walkthrough of Under the Mark: setting a plan, recording actual spending, importing a bank CSV, reading the difference, and finding cheaper alternatives.',
    body
  });
}

/* ---------- extension page ---------- */
function extensionPage() {
  const body = `<section><div class="wrap" style="max-width:860px">
  <span class="kicker">Chrome extension</span>
  <h1 style="font-size:clamp(32px,4.4vw,46px);font-weight:800;margin-bottom:16px">Catch spending the moment it happens</h1>
  <p class="art-lede">A bank statement tells you three weeks late. The extension tells you the same
    afternoon, while you can still do something about it.</p>
  <p><a class="btn" href="${SITE.extension}">Add to Chrome &mdash; free</a></p>

  <div class="prose">
    <h2>Two ways to use it</h2>
    <p><strong>It asks you.</strong> Add the shops you buy from in the extension settings. When you land on
      an order confirmation page, it finds the total and asks whether to save it. You can correct the
      amount and the shop name before you agree.</p>
    <p><strong>You tell it.</strong> Click the toolbar icon any time and type an amount. The shop name is
      filled in from the tab you are on.</p>
    <p>Either way, the purchase waits on your device until you next open Under the Mark, then appears in
      the Purchase inbox for you to approve. Nothing reaches your figures without a click.</p>

    <h2>What it can and cannot see</h2>
    <ul>
      <li>It runs <strong>only</strong> on sites you have added yourself. There is no blanket access to
        every website, and none at all until you choose a site.</li>
      <li>It reads the address of your current tab while the popup is open, to fill in the shop name.</li>
      <li>On the shops you listed, it reads the page text to find the order total.</li>
      <li>It sends nothing anywhere. There is no server and no account.</li>
      <li>It never reads or changes your budget figures. It writes to one storage key and nothing else.</li>
    </ul>

    ${AD_INLINE}

    <h2>Honest limits</h2>
    <p>Detection is generic rather than written shop by shop. That means it works on sites nobody has
      specifically coded for, but it catches roughly two thirds of checkouts rather than all of them. When
      it guesses wrong, you correct the number before saving, so a wrong guess costs you nothing.</p>
    <p>It only sees online purchases. Card taps in shops, cash and direct debits still come through the CSV
      import. The two are meant to work together.</p>

    <h2>Installing</h2>
    <ul>
      <li>Add it from the Chrome Web Store.</li>
      <li>Open the extension, click Settings, and paste your Under the Mark address.</li>
      <li>Add the shops you want watched, or click "watch this site" from the popup while you are on one.</li>
    </ul>
  </div>

  ${amconBanner('inline')}
</div></section>`;
  return page({
    path: '/chrome-extension/', title: 'Chrome extension — Under the Mark',
    description: 'The Under the Mark Chrome extension spots order confirmation pages on shops you choose, finds the total and asks before saving. Nothing is uploaded and it only runs on sites you add.',
    body
  });
}

/* ---------- privacy ---------- */
function privacy() {
  const body = `<section><div class="wrap" style="max-width:760px">
  <h1 style="font-size:clamp(30px,4vw,42px);font-weight:800;margin-bottom:16px">Privacy</h1>
  <p class="art-lede">The short version: your budget figures never leave your device, and we could not
    read them if we wanted to.</p>
  <div class="prose">
    <h2>Your financial data</h2>
    <p>Everything you type into Under the Mark — income, expenses, savings, imported statements — is stored
      in your own browser using local storage. It is never transmitted to us or anyone else. There is no
      account, no login and no database holding your figures. If you clear your browser data, it is gone,
      which is why there is a backup export on the Data page.</p>
    <p>Bank CSV files are read inside the page itself. The file is never uploaded.</p>

    <h2>The Chrome extension</h2>
    <p>The extension stores queued purchases on your device using Chrome's extension storage. It runs only
      on sites you have explicitly added and granted permission for. It reads page text on those sites to
      find an order total, and the address of your current tab while the popup is open. It transmits
      nothing to any server.</p>

    <h2>This website</h2>
    <p>Separately from the app, this website uses two third-party services:</p>
    <ul>
      <li><strong>Google Analytics</strong> to count visits and see which guides people read. This measures
        website traffic only. It has no access to anything you enter into the app.</li>
      <li><strong>Google AdSense</strong> to show adverts, which is what keeps the app free. Google may use
        cookies to serve relevant adverts. You can manage this at
        <a href="https://adssettings.google.com" target="_blank" rel="noopener">adssettings.google.com</a>.</li>
    </ul>
    <p>Both operate on the marketing pages you are reading now. Neither can see your budget.</p>

    <h2>Affiliate links</h2>
    <p>Some links to alternative services in our guides may earn a commission. Where that is the case it is
      stated on the page. Commission never decides what is recommended or in what order — several of the
      alternatives we suggest most often are free and earn nothing.</p>

    <h2>Contact</h2>
    <p>Under the Mark is built and maintained by
      <a href="${SITE.amcon}" target="_blank" rel="noopener">Amcon Ceylon</a>, a digital product studio in
      Colombo, Sri Lanka. Questions can go through the contact form on their site.</p>
  </div>
</div></section>`;
  return page({
    path: '/privacy/', title: 'Privacy — Under the Mark',
    description: 'Under the Mark stores your budget in your own browser. Nothing is uploaded. This page explains exactly what the app, the extension and this website do with data.',
    body
  });
}

/* ---------- articles ---------- */
function loadArticles() {
  if (!fs.existsSync(CONTENT)) return [];
  return fs.readdirSync(CONTENT).filter(f => f.endsWith('.md')).map(f => {
    const { meta, body } = frontMatter(fs.readFileSync(path.join(CONTENT, f), 'utf8'));
    const words = body.split(/\s+/).filter(Boolean).length;
    return { slug: meta.slug || f.replace(/\.md$/, ''), meta, body, words,
      minutes: Math.max(3, Math.round(words / 225)) };
  }).sort((a, b) => (a.meta.order || '99').localeCompare(b.meta.order || '99'));
}

function articleCards(limit) {
  const list = loadArticles().slice(0, limit || 99);
  return '<div class="artgrid">' + list.map(a => `<article class="art">
    <div class="tag">${a.meta.category || 'Guide'}</div>
    <h3><a href="/articles/${a.slug}/">${a.meta.title}</a></h3>
    <p>${a.meta.summary}</p>
    <div class="meta">${a.minutes} min read</div>
  </article>`).join('') + '</div>';
}

function articleIndex() {
  const body = `<section><div class="wrap">
    <div class="sec-head"><p class="eyebrow">Guides</p>
      <h1 style="font-size:clamp(32px,4.4vw,44px);font-weight:800">Spend less without giving anything up</h1>
      <p>Specific, practical writing on cancelling what you do not use, paying less for what you do, and
        making a budget that survives contact with real life.</p></div>
    ${articleCards()}
    ${amconBanner('wide')}
  </div></section>`;
  return page({
    path: '/articles/', title: 'Guides — Under the Mark',
    description: 'Practical guides on cancelling subscriptions, finding cheaper alternatives, reading your bank statement, and running a budget that compares planned against actual spending.',
    body
  });
}

function articlePage(a, all) {
  const html = md(a.body);
  const heads = [...a.body.matchAll(/^##\s+(.+)$/gm)].map(m => m[1]);
  const toc = heads.map(h => {
    const id = h.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    return `<a href="#${id}">${h}</a>`;
  }).join('');
  const others = all.filter(x => x.slug !== a.slug).slice(0, 3);

  const body = `<section class="article"><div class="wrap art-in">
  <article class="prose">
    <h1>${a.meta.title}</h1>
    <div class="art-meta"><span>${a.meta.category || 'Guide'}</span><span>${a.minutes} min read</span>
      <span>Updated ${a.meta.updated || 'July 2026'}</span></div>
    <p class="art-lede">${a.meta.summary}</p>
    ${html}
    ${amconBanner('inline')}
  </article>
  <aside class="side">
    <div class="side-card"><h4>Try the app</h4>
      <p>Free, no account, and your figures never leave your browser.</p>
      <a class="btn btn-sm" href="${SITE.app}">Open Under the Mark</a></div>
    ${toc ? `<div class="side-card"><h4>On this page</h4><nav class="toc">${toc}</nav></div>` : ''}
    <div class="ad" aria-label="Advertisement">
      <div class="ad-label">Advertisement</div>
      <ins class="adsbygoogle" style="display:block" data-ad-client="${SITE.adsense}"
           data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </div>
    ${others.length ? `<div class="side-card"><h4>Read next</h4>${others.map(o =>
      `<p style="margin-bottom:10px"><a href="/articles/${o.slug}/">${o.meta.title}</a></p>`).join('')}</div>` : ''}
  </aside>
</div></section>`;

  return page({
    path: '/articles/' + a.slug + '/', title: (a.meta.titletag || a.meta.title) + ' — Under the Mark',
    description: a.meta.summary, type: 'article',
    schema: {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: a.meta.title, description: a.meta.summary,
      datePublished: a.meta.published || '2026-07-01',
      dateModified: a.meta.modified || '2026-07-20',
      author: { '@type': 'Organization', name: 'Amcon Ceylon', url: SITE.amcon },
      publisher: { '@type': 'Organization', name: 'Under the Mark', url: SITE.domain },
      mainEntityOfPage: SITE.domain + '/articles/' + a.slug + '/'
    },
    body
  });
}

/* ---------- build ---------- */
function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'assets', 'site.css'), path.join(OUT, 'assets', 'site.css'));

  // The app is a self-contained page. It gets analytics and search metadata,
  // but deliberately no AdSense: adverts do not belong on a screen where
  // someone is entering their own financial figures.
  const appSrc = path.join(__dirname, 'app-source', 'index.html');
  if (fs.existsSync(appSrc)) {
    let app = fs.readFileSync(appSrc, 'utf8');
    const inject = `<link rel="canonical" href="${SITE.domain}/app/">
<meta property="og:type" content="website">
<meta property="og:title" content="Under the Mark — free budget planner">
<meta property="og:description" content="Plan and actual side by side on every line. Free, no account, nothing uploaded.">
<meta property="og:url" content="${SITE.domain}/app/">
<meta name="twitter:card" content="summary_large_image">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${SITE.ga}');
</script>
</head>`;
    app = app.replace('</head>', inject);
    fs.mkdirSync(path.join(OUT, 'app'), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'app', 'index.html'), app);
  }

  const articles = loadArticles();
  fs.writeFileSync(path.join(OUT, 'index.html'), home());
  write('how-it-works', howItWorks());
  write('chrome-extension', extensionPage());
  write('privacy', privacy());
  write('articles', articleIndex());
  articles.forEach(a => write(path.join('articles', a.slug), articlePage(a, articles)));

  const urls = ['/', '/app/', '/how-it-works/', '/chrome-extension/', '/articles/', '/privacy/']
    .concat(articles.map(a => '/articles/' + a.slug + '/'));
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => `  <url><loc>${SITE.domain}${u}</loc><changefreq>monthly</changefreq>` +
      `<priority>${u === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
  fs.writeFileSync(path.join(OUT, 'ads.txt'),
    `google.com, pub-${SITE.adsense.replace('ca-pub-', '')}, DIRECT, f08c47fec0942fa0\n`);

  console.log('built ' + (urls.length) + ' pages');
  articles.forEach(a => console.log('  ' + a.slug.padEnd(38) + a.words + ' words'));
  return { urls, articles };
}

module.exports = { build, articleCards, loadArticles };
B.articleCards = articleCards;
global.articleCards = articleCards;
