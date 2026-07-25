const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const OUT=path.join(__dirname,'dist');
const SITE='https://underthemark.com';
const GA='G-3JFGX4Y3RC';

let pass=0,fail=0,n=0;
const ok=(name,c,x)=>{n++;if(c)pass++;else{fail++;console.log('FAIL:',name,x===undefined?'':String(x).slice(0,200));}};

function pages(dir,acc){
  acc=acc||[];
  fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{
    const p=path.join(dir,e.name);
    if(e.isDirectory())pages(p,acc);
    else if(e.name==='index.html')acc.push(p);
  });
  return acc;
}
const everything=pages(OUT);
// The demo checkout is a deliberately noindexed test fixture, not a page of the
// site. It is checked separately below.
const DEMO=path.join(OUT,'demo-order-confirmation','index.html');
const all=everything.filter(f=>f!==DEMO);
const APP='/app/';
const list=all.filter(f=>!f.includes(path.sep+'app'+path.sep));

/* --- the fixture used for capturing store screenshots --- */
{
  ok('demo checkout exists',fs.existsSync(DEMO));
  const h=fs.readFileSync(DEMO,'utf8');
  ok('demo checkout is noindexed',/content="noindex/.test(h),'it must never rank');
  ok('demo checkout looks like a confirmation',
     /Thank you for your order/.test(h)&&/Order Total/.test(h));
  ok('demo checkout has a findable total',/\$54\.20/.test(h));
  ok('demo checkout says it is a demo',/demonstration page/i.test(h),
     'it must not pretend to be a real purchase');
  ok('demo checkout explains how to test it',/Watch for purchases automatically/.test(h));
  ok('demo checkout kept out of the sitemap',
     !fs.readFileSync(path.join(OUT,'sitemap.xml'),'utf8').includes('demo-order-confirmation'));
}
ok('all marketing pages built',list.length===14,list.length);
ok('app page built',all.length===15,all.length);

/* The app is a tool, not an article. It is checked on its own terms:
   analytics and search metadata yes, adverts deliberately no. */
{
  const appHtml=fs.readFileSync(path.join(OUT,'app','index.html'),'utf8');
  const ad=new JSDOM(appHtml).window.document;
  ok('app has a title',!!ad.querySelector('title'));
  ok('app has canonical',!!ad.querySelector('link[rel=canonical]'));
  ok('app has og tags',!!ad.querySelector('meta[property="og:title"]'));
  ok('app has GA4',appHtml.includes('gtag/js?id='+GA));
  ok('app carries NO adsense',!appHtml.includes('googlesyndication'),'ads must not run inside the tool');
  ok('app still self-contained',!appHtml.includes('<link rel="stylesheet" href="/assets'));
  ok('app links back to the site',appHtml.includes('underthemark.com'));
}

const linkTargets=new Set();
const internalLinks=[];

list.forEach(f=>{
  const rel='/'+path.relative(OUT,f).replace(/index\.html$/,'');
  const html=fs.readFileSync(f,'utf8');
  const d=new JSDOM(html).window.document;
  const name=rel==='/'?'homepage':rel;
  linkTargets.add(rel.replace(/\/$/,'')||'/');

  // --- SEO essentials on every page ---
  const title=d.querySelector('title');
  ok(name+' has a title',!!title&&title.textContent.length>15&&title.textContent.length<75,
     title&&title.textContent.length+' chars: '+title.textContent);
  const desc=d.querySelector('meta[name=description]');
  ok(name+' has a description',!!desc&&desc.content.length>70&&desc.content.length<310,
     desc&&desc.content.length+' chars');
  const canon=d.querySelector('link[rel=canonical]');
  ok(name+' has canonical',!!canon&&canon.href.startsWith(SITE),canon&&canon.href);
  ok(name+' has exactly one h1',d.querySelectorAll('h1').length===1,d.querySelectorAll('h1').length);
  ok(name+' has og tags',!!d.querySelector('meta[property="og:title"]')&&
     !!d.querySelector('meta[property="og:description"]'));
  ok(name+' has favicon',!!d.querySelector('link[rel=icon]'));
  ok(name+' has viewport',!!d.querySelector('meta[name=viewport]'));
  ok(name+' has lang',d.documentElement.lang==='en');

  // --- analytics + ads ---
  ok(name+' has GA4 '+GA,html.includes('googletagmanager.com/gtag/js?id='+GA)&&
     html.includes("gtag('config', '"+GA+"')"));
  ok(name+' has adsense script',html.includes('pagead2.googlesyndication.com'));
  ok(name+' has adsense ownership meta',
     !!d.querySelector('meta[name="google-adsense-account"][content="ca-pub-3792288400696045"]'));
  ok(name+' has robots meta',!!d.querySelector('meta[name=robots]'));
  ok(name+' has NO empty ad blocks',
     (html.match(/<ins class="adsbygoogle"/g)||[]).length===0 ||
     !html.includes('data-ad-slot=""'),'an unfilled unit leaves a visible gap');
  ok(name+' has cookie banner',html.includes('id="cookiebar"'));
  ok(name+' amcon banner shows the logo',
     !d.querySelector('.amcon') || !!d.querySelector('.amcon-logo'));
  // AdSense wants every page reachable from every page
  const nav=[...d.querySelectorAll('.foot-cols a[href^="/"]')].map(a=>a.getAttribute('href'));
  ['/privacy/','/cookies/','/terms/','/disclaimer/','/about/','/contact/'].forEach(p=>
    ok(name+' footer links '+p,nav.includes(p),nav.join(' ')));

  // --- amcon backlinks ---
  const amcon=[...d.querySelectorAll('a[href*="amconceylon.co"]')];
  ok(name+' links to Amcon Ceylon',amcon.length>=2,amcon.length);
  ok(name+' amcon links followable',amcon.every(a=>!/nofollow/.test(a.rel||'')),
     amcon.map(a=>a.rel).join('|'));
  ok(name+' amcon links safe',amcon.every(a=>a.target!=='_blank'||/noopener/.test(a.rel||'')));

  // --- collect internal links to verify later ---
  [...d.querySelectorAll('a[href^="/"]')].forEach(a=>{
    const href=a.getAttribute('href').split('#')[0];
    if(href&&!href.startsWith('/assets')&&href!=='/app/')
      internalLinks.push({from:name,href:href.replace(/\/$/,'')||'/'});
  });

  // --- accessibility basics ---
  ok(name+' skip link present',!!d.querySelector('.skip'));
  const imgs=[...d.querySelectorAll('img')];
  ok(name+' images have alt',imgs.every(i=>i.hasAttribute('alt')),imgs.length+' images');
});

// --- internal links all resolve ---
const broken=internalLinks.filter(l=>!linkTargets.has(l.href));
ok('no broken internal links',broken.length===0,
   broken.map(b=>b.from+' -> '+b.href).join(', '));

// --- articles specifically ---
const arts=list.filter(f=>f.includes('articles'+path.sep)&&!f.endsWith('articles'+path.sep+'index.html'));
ok('four articles built',arts.length===4,arts.length);
arts.forEach(f=>{
  const slug=path.basename(path.dirname(f));
  const html=fs.readFileSync(f,'utf8');
  const d=new JSDOM(html).window.document;
  const prose=d.querySelector('.prose');
  const words=prose.textContent.trim().split(/\s+/).length;
  ok(slug+' is 800-1600 words',words>=800&&words<=1600,words);
  ok(slug+' has h2 structure',d.querySelectorAll('.prose h2').length>=4,
     d.querySelectorAll('.prose h2').length);
  ok(slug+' headings have ids for anchors',
     [...d.querySelectorAll('.prose h2')].every(h=>h.id),'');
  ok(slug+' has article schema',html.includes('"@type":"Article"'));
  ok(slug+' has a table of contents',!!d.querySelector('.toc a'));
  ok(slug+' links to other guides',
     [...d.querySelectorAll('.prose a[href^="/articles/"]')].length>=1,
     [...d.querySelectorAll('.prose a[href^="/articles/"]')].length);
  ok(slug+' links to the app',!!d.querySelector('.prose a[href="/"]'));
  ok(slug+' has an in-body ad',(html.match(/adsbygoogle/g)||[]).length>=2,
     (html.match(/adsbygoogle/g)||[]).length);
  ok(slug+' has an amcon banner',!!d.querySelector('.amcon'));
  // no unrendered markdown left behind
  ok(slug+' markdown fully rendered',
     !/\[\[AD\]\]|\[\[AMCON\]\]|\*\*|^#{2,}\s/m.test(prose.textContent),
     (prose.textContent.match(/\[\[\w+\]\]|\*\*/g)||[]).join(' '));
});

// --- the four bugs that shipped last time, now guarded ---
{
  // 1. every referenced asset must actually exist in the build
  const missing=[];
  all.forEach(f=>{
    const html=fs.readFileSync(f,'utf8');
    [...html.matchAll(/(?:src|href)="(\/(?:assets|icon|apple|og)[^"]*)"/g)].forEach(m=>{
      const target=path.join(OUT,m[1]);
      if(!fs.existsSync(target)) missing.push(m[1]+' (in '+path.relative(OUT,f)+')');
    });
  });
  ok('every referenced asset exists',missing.length===0,[...new Set(missing)].join(', '));
  ok('amcon logo shipped',fs.existsSync(path.join(OUT,'assets','amcon-logo.png')));
  ok('amcon logo file kept for reuse',fs.existsSync(path.join(OUT,'assets','amcon-logo-128.png')));
  // The supplied artwork had a near-black background that looked wrong on the
  // light banner. Guard against that file coming back.
  {
    const buf=fs.readFileSync(path.join(OUT,'assets','amcon-logo.png'));
    ok('amcon logo is a PNG with alpha',buf.slice(1,4).toString()==='PNG'&&buf[25]===6,
       'colour type '+buf[25]+' (6 = RGBA)');
    ok('amcon logo is not the raw upload',buf.length<60000,buf.length+' bytes');
  }
  // The mark is embedded, so it cannot 404, go stale in a cache, or survive a
  // partial deploy as broken alt text inside the studio's own banner.
  all.forEach(f=>{
    const d2=new JSDOM(fs.readFileSync(f,'utf8')).window.document;
    const b=d2.querySelector('.amcon-logo');
    if(!b)return;
    const rel='/'+path.relative(OUT,f).replace(/index\.html$/,'');
    ok('amcon mark embedded on '+rel,/^data:image\/png;base64,/.test(b.getAttribute('src')),
       (b.getAttribute('src')||'').slice(0,40));
    ok('amcon mark has alt text on '+rel,b.alt.length>4,b.alt);
    ok('amcon mark sized on '+rel,b.getAttribute('width')&&b.getAttribute('height'));
  });
  {
    const h=fs.readFileSync(path.join(OUT,'index.html'),'utf8');
    ok('no network request for the mark',!/src="\/assets\/amcon-logo/.test(h),'');
    const b64=(h.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)||[])[1]||'';
    ok('embedded mark is a real png',Buffer.from(b64,'base64').slice(1,4).toString()==='PNG');
    ok('embedded mark stays small',b64.length<12000,b64.length+' base64 chars');
  }

  // 2. exactly one Amcon banner per page, never two
  list.forEach(f=>{
    const d=new JSDOM(fs.readFileSync(f,'utf8')).window.document;
    const n=d.querySelectorAll('.amcon').length;
    ok('one amcon banner on '+('/'+path.relative(OUT,f).replace(/index\.html$/,'')),n<=1,n+' banners');
  });

  // 3. footer link columns sit on one row
  const css=fs.readFileSync(path.join(OUT,'assets','site.css'),'utf8');
  const fd=new JSDOM(fs.readFileSync(path.join(OUT,'index.html'),'utf8')).window.document;
  // Brand + four link columns must sit on one row: five grid items, one track each.
  ok('footer grid is five across',
     /\.foot-in\{display:grid;grid-template-columns:minmax\(200px,1\.5fr\) repeat\(4,minmax\(0,1fr\)\)/.test(css),
     (css.match(/\.foot-in\{[^}]*/)||[''])[0]);
  ok('foot-cols dissolves into the row',/\.foot-cols\{display:contents\}/.test(css),
     'without display:contents the columns form a nested grid and wrap');
  const items=[...fd.querySelector('.foot-in').querySelectorAll(':scope > .foot-brand, :scope > .foot-cols > div')];
  ok('five footer sections on one row',items.length===5,items.length+' items');
  const cols=[...fd.querySelectorAll('.foot-cols > div h4')].map(h=>h.textContent.trim());
  ok('footer has product, guides, company, legal',cols.length===4,cols.join(' | '));
  ok('legal sits next to company',cols[2]==='Company'&&cols[3]==='Legal',cols.join(' | '));
  ok('footer brand block is tagged',!!fd.querySelector('.foot-brand'));
  ok('footer stacks sensibly on phones',css.includes('@media(max-width:480px)'));

  // 4. mobile navigation actually works rather than hiding links
  ok('burger button present',!!fd.querySelector('#burger'));
  ok('nav is toggleable',!!fd.querySelector('#nav'));
  ok('links are not simply hidden on mobile',!/\.links a:not\(\.btn\)\{display:none\}/.test(css));
  ok('has a tablet breakpoint',css.includes('@media(max-width:820px)'));
  ok('has a phone breakpoint',css.includes('@media(max-width:620px)'));
  ok('has a small-phone breakpoint',css.includes('@media(max-width:380px)'));
  ok('handles installed display mode',css.includes('display-mode:standalone'));
}

// --- installable app ---
{
  const mf=path.join(OUT,'manifest.webmanifest');
  ok('web manifest exists',fs.existsSync(mf));
  const m=JSON.parse(fs.readFileSync(mf,'utf8'));
  ok('manifest opens the app',m.start_url==='/app/',m.start_url);
  ok('manifest is standalone',m.display==='standalone');
  ok('manifest has 192 and 512 icons',
     m.icons.some(i=>i.sizes==='192x192')&&m.icons.some(i=>i.sizes==='512x512'));
  ok('manifest has a maskable icon',m.icons.some(i=>i.purpose==='maskable'));
  m.icons.forEach(i=>ok('manifest icon exists '+i.src,fs.existsSync(path.join(OUT,i.src))));
  ok('manifest has theme colour',m.theme_color==='#5646E4');
  ok('service worker exists',fs.existsSync(path.join(OUT,'sw.js')));
  const sw=fs.readFileSync(path.join(OUT,'sw.js'),'utf8');
  ok('sw caches the app shell',sw.includes("'/app/'"));
  ok('sw skips cross-origin requests',sw.includes('url.origin !== location.origin'));
  ok('sw cleans old caches',sw.includes('caches.delete'));
  ok('sw cache version bumped',/CACHE = 'utm-v[2-9]/.test(sw),
     'a stale cache would keep serving the previous build');
  ok('sw falls back offline',sw.includes('caches.match'));
  const appHtml=fs.readFileSync(path.join(OUT,'app','index.html'),'utf8');
  ok('app links the manifest',appHtml.includes('manifest.webmanifest'));
  ok('app registers the sw',appHtml.includes('serviceWorker'));
  ok('install button present',
     fs.readFileSync(path.join(OUT,'index.html'),'utf8').includes('data-install'));
}

// --- mobile friendliness on every page ---
list.concat([path.join(OUT,'app','index.html')]).forEach(f=>{
  const html=fs.readFileSync(f,'utf8');
  const d=new JSDOM(html).window.document;
  const name='/'+path.relative(OUT,f).replace(/index\.html$/,'');
  const vp=d.querySelector('meta[name=viewport]');
  ok(name+' viewport is responsive',
     vp&&/width=device-width/.test(vp.content)&&!/user-scalable=no|maximum-scale=1/.test(vp.content),
     vp&&vp.content);
  ok(name+' has theme colour',!!d.querySelector('meta[name=theme-color]'));
  ok(name+' has apple touch icon',!!d.querySelector('link[rel=apple-touch-icon]'));
  ok(name+' no fixed pixel widths in markup',!/style="[^"]*width:\s*\d{4,}px/.test(html));
});

// --- AdSense policy requirements ---
const required=['/about/','/contact/','/privacy/','/cookies/','/terms/','/disclaimer/'];
required.forEach(p=>{
  const f=path.join(OUT,p.replace(/^\/|\/$/g,''),'index.html');
  ok('policy page exists '+p,fs.existsSync(f));
  if(!fs.existsSync(f))return;
  const html=fs.readFileSync(f,'utf8');
  const d=new JSDOM(html).window.document;
  const words=d.querySelector('.prose').textContent.trim().split(/\s+/).length;
  ok('policy '+p+' has real content',words>=250,words+' words');
  ok('policy '+p+' dated',/Last updated/.test(html));
});
{
  const dis=fs.readFileSync(path.join(OUT,'disclaimer','index.html'),'utf8');
  ok('disclaimer states not financial advice',/not financial/i.test(dis)&&/not .{0,30}advisers/i.test(dis));
  ok('disclaimer covers affiliate links',/affiliate/i.test(dis));
  ok('disclaimer warns prices change',/prices change/i.test(dis));
  const cok=fs.readFileSync(path.join(OUT,'cookies','index.html'),'utf8');
  ok('cookie policy names AdSense',/AdSense/.test(cok));
  ok('cookie policy names Analytics',/Google Analytics/.test(cok));
  ok('cookie policy offers opt-out',/adssettings\.google\.com/.test(cok));
  const pr=fs.readFileSync(path.join(OUT,'privacy','index.html'),'utf8');
  ok('privacy names third parties',/AdSense/.test(pr)&&/Analytics/.test(pr));
  const ab=fs.readFileSync(path.join(OUT,'about','index.html'),'utf8');
  ok('about identifies the publisher',/Amcon Ceylon/.test(ab)&&/Colombo/.test(ab));
}

// --- sitemap, robots, ads.txt ---
const sm=fs.readFileSync(path.join(OUT,'sitemap.xml'),'utf8');
ok('sitemap lists every indexable page',all.length===(sm.match(/<loc>/g)||[]).length,
   (sm.match(/<loc>/g)||[]).length+' in sitemap vs '+all.length+' indexable pages');
ok('sitemap includes the app',sm.includes(SITE+'/app/'));
ok('sitemap urls absolute',!/<loc>(?!https:\/\/underthemark\.com)/.test(sm));
ok('sitemap is valid xml',/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(sm)&&
   sm.trim().endsWith('</urlset>'));
ok('every entry has lastmod',
   (sm.match(/<loc>/g)||[]).length===(sm.match(/<lastmod>/g)||[]).length,
   (sm.match(/<lastmod>/g)||[]).length+' lastmod for '+(sm.match(/<loc>/g)||[]).length+' urls');
ok('lastmod dates are valid',
   (sm.match(/<lastmod>([^<]+)<\/lastmod>/g)||[]).every(m=>/\d{4}-\d{2}-\d{2}/.test(m)));
ok('homepage has top priority',/<loc>https:\/\/underthemark\.com\/<\/loc>\s*<lastmod>[^<]*<\/lastmod>\s*<changefreq>[^<]*<\/changefreq>\s*<priority>1\.0<\/priority>/.test(sm));
ok('articles rank above policy pages',
   /articles\/cancel-subscriptions\/<\/loc>[\s\S]{0,120}<priority>0\.8/.test(sm)&&
   /\/terms\/<\/loc>[\s\S]{0,120}<priority>0\.4/.test(sm));
ok('no trailing-slash inconsistency',
   !(sm.match(/<loc>[^<]*[^/]<\/loc>/g)||[]).length,
   (sm.match(/<loc>[^<]*[^/]<\/loc>/g)||[]).join(' '));
const rb=fs.readFileSync(path.join(OUT,'robots.txt'),'utf8');
ok('robots allows crawling',/Allow: \//.test(rb)&&!/Disallow: \/$/m.test(rb));
ok('robots points at sitemap',rb.includes(SITE+'/sitemap.xml'));
const ads=fs.readFileSync(path.join(OUT,'ads.txt'),'utf8');
ok('ads.txt has publisher id',ads.includes('pub-3792288400696045')&&ads.includes('DIRECT'),ads.trim());

// --- css shipped ---
ok('stylesheet copied',fs.existsSync(path.join(OUT,'assets','site.css')));
const css=fs.readFileSync(path.join(OUT,'assets','site.css'),'utf8');
ok('css has responsive rules',css.includes('@media(max-width:620px)'));
ok('css respects reduced motion',css.includes('prefers-reduced-motion'));

console.log('\npassed '+pass+' of '+n);
process.exit(fail?1:0);
