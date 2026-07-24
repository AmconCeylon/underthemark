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
const all=pages(OUT);
const APP='/app/';
const list=all.filter(f=>!f.includes(path.sep+'app'+path.sep));
ok('all marketing pages built',list.length===9,list.length);
ok('app page built',all.length===10,all.length);

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

// --- sitemap, robots, ads.txt ---
const sm=fs.readFileSync(path.join(OUT,'sitemap.xml'),'utf8');
ok('sitemap lists every page',all.length===(sm.match(/<loc>/g)||[]).length,
   (sm.match(/<loc>/g)||[]).length+' vs '+all.length);
ok('sitemap includes the app',sm.includes(SITE+'/app/'));
ok('sitemap urls absolute',!/<loc>(?!https:\/\/underthemark\.com)/.test(sm));
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
