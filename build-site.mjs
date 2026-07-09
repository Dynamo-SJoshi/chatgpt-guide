import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

// ---- Languages (source .md -> output page) ----
// `dir: 'rtl'` would be set for Urdu when added later. `bcp` drives read-aloud voice + og:locale.
const LANGS = [
  { code: 'english', native: 'English',   en: 'English',  bcp: 'en-IN', locale: 'en_US', file: 'guides/english.md' },
  { code: 'hindi',   native: 'हिंदी',      en: 'Hindi',    bcp: 'hi-IN', locale: 'hi_IN', file: 'guides/hindi.md' },
  { code: 'bengali', native: 'বাংলা',      en: 'Bengali',  bcp: 'bn-IN', locale: 'bn_IN', file: 'guides/bengali.md' },
  { code: 'tamil',   native: 'தமிழ்',      en: 'Tamil',    bcp: 'ta-IN', locale: 'ta_IN', file: 'guides/tamil.md' },
  { code: 'telugu',  native: 'తెలుగు',     en: 'Telugu',   bcp: 'te-IN', locale: 'te_IN', file: 'guides/telugu.md' },
  { code: 'kannada', native: 'ಕನ್ನಡ',      en: 'Kannada',  bcp: 'kn-IN', locale: 'kn_IN', file: 'guides/kannada.md' },
  { code: 'marathi', native: 'मराठी',      en: 'Marathi',  bcp: 'mr-IN', locale: 'mr_IN', file: 'guides/marathi.md' },
  { code: 'punjabi', native: 'ਪੰਜਾਬੀ',     en: 'Punjabi',  bcp: 'pa-IN', locale: 'pa_IN', file: 'guides/punjabi.md' },
  { code: 'odia',    native: 'ଓଡ଼ିଆ',       en: 'Odia',     bcp: 'or-IN', locale: 'or_IN', file: 'guides/odia.md' },
];

const CREDIT = 'Made with ❤️ by Garv Sachdeva';
const BASE = 'https://pygarv.github.io/chatgpt-guide/';
const OG_IMG = BASE + 'assets/og.png';
const DESC = 'A simple, beginner-friendly guide to using ChatGPT on your phone. Written for first-time users and people not comfortable with English or technology. Free to read in 9 Indian languages.';
// Cloudflare Web Analytics (cookieless, privacy-friendly visitor counts)
const ANALYTICS = `<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "cd4d7943c34641419a7b764d9fac038b"}'></script>`;

const ROOT = path.resolve('.');
const OUT = path.join(ROOT, 'docs');
fs.mkdirSync(OUT, { recursive: true });

// Open Graph + Twitter card so shared links (WhatsApp, social) show a title, blurb and preview.
function meta({ title, url, locale = 'en_US' }) {
  const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return `<meta name="description" content="${esc(DESC)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="A Basic ChatGPT Guide">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="${OG_IMG}">`;
}

// ---- shared stylesheet ----
const CSS = `
:root {
  --accent:#0e8f6f; --accent2:#f59e0b; --accent-soft:#e7f7f1; --accent-border:#bfe6d8;
  --ink:#20242c; --muted:#6b7280; --line:#e9e6df;
  --bg:#fbf9f5; --surface:#ffffff; --surface2:#f4f1ea; --quote:#f0faf6;
  --fs:1;
}
:root[data-theme="dark"] {
  --accent:#34d3a6; --accent2:#fbbf24; --accent-soft:#122a22; --accent-border:#1f6b55;
  --ink:#eceef2; --muted:#9aa3b2; --line:#2a2f3a;
  --bg:#0f1216; --surface:#171b22; --surface2:#1c212a; --quote:#12211b;
}
* { box-sizing:border-box; }
button { appearance:none; -webkit-appearance:none; font:inherit; }
html { -webkit-text-size-adjust:100%; }
body { margin:0; color:var(--ink); background:var(--bg);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Kannada','Noto Sans Oriya','Noto Sans Gurmukhi', sans-serif;
  line-height:1.75; font-size:calc(18px * var(--fs));
  transition: background .2s ease, color .2s ease; }
h1,h2,h3 { line-height:1.3; }

/* ---- buttons / controls ---- */
.btn { cursor:pointer; border:1px solid var(--line); background:var(--surface); color:var(--ink);
  border-radius:10px; padding:8px 12px; font-size:1rem; line-height:1; display:inline-flex; align-items:center; gap:6px; }
.btn:hover { border-color:var(--accent); }
.btn.on { background:var(--accent); color:#fff; border-color:var(--accent); }
.iconbtn { cursor:pointer; border:1px solid var(--line); background:var(--surface); color:var(--ink);
  border-radius:10px; width:40px; height:40px; font-size:1.1rem; line-height:1; display:inline-flex; align-items:center; justify-content:center; }
.iconbtn:hover { border-color:var(--accent); }
.floating { position:fixed; top:14px; right:14px; z-index:30; box-shadow:0 2px 10px rgba(0,0,0,.1); }

/* ---- top bar ---- */
.topbar { position:sticky; top:0; z-index:20; background:color-mix(in srgb, var(--bg) 90%, transparent);
  backdrop-filter:blur(8px); border-bottom:1px solid var(--line); display:flex; align-items:center; gap:8px; padding:8px 12px;
  flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; }
.topbar::-webkit-scrollbar { display:none; }
.topbar > * { flex:none; }
.topbar .home { text-decoration:none; color:var(--accent); font-weight:800; font-size:1.15rem; white-space:nowrap; }
.topbar .spacer { flex:1 1 auto; min-width:0; }
.topbar select { font-size:.95rem; padding:8px; border:1px solid var(--line); border-radius:10px; background:var(--surface); color:var(--ink); max-width:36vw; }
.topbar .pdf-dl { text-decoration:none; font-size:.85rem; font-weight:700; color:var(--accent);
  border:1px solid var(--accent-border); border-radius:10px; padding:8px 10px; white-space:nowrap; }
.fsgroup { display:inline-flex; gap:4px; }

/* ---- reading progress bar (chapter view) ---- */
.readbar[hidden] { display:none; }
.readbar { position:sticky; top:57px; z-index:15; display:flex; align-items:center; gap:12px;
  padding:8px 14px; background:var(--surface); border-bottom:1px solid var(--line); }
.readbar .count { font-size:.85rem; color:var(--muted); font-weight:700; white-space:nowrap; }
.progress { flex:1; height:8px; background:var(--surface2); border-radius:999px; overflow:hidden; }
.progress > i { display:block; height:100%; width:0; background:linear-gradient(90deg,var(--accent),var(--accent2)); transition:width .25s ease; }
.readbar .speak { font-weight:700; }

/* ---- content ---- */
.wrap { max-width:760px; margin:0 auto; padding:22px 20px 60px; }
.wrap img { display:block; width:100%; max-width:300px; height:auto; margin:20px auto;
  border-radius:14px; border:1px solid var(--line); box-shadow:0 4px 16px rgba(16,24,40,.10); }
h1 { font-size:1.85em; margin:.2em 0 .5em; }
h2 { font-size:1.35em; margin:1.4em 0 .4em; }
h3 { font-size:1.12em; margin:1.1em 0 .3em; }
p, li { font-size:1rem; }
a { color:var(--accent); }
blockquote { border-left:4px solid var(--accent2); background:var(--quote); margin:1.1em 0; padding:.7em 1.1em; border-radius:0 12px 12px 0; }
table { border-collapse:collapse; width:100%; margin:1em 0; display:block; overflow-x:auto; }
th,td { border:1px solid var(--line); padding:9px 11px; text-align:left; }
th { background:var(--surface2); }
hr { border:0; border-top:1px solid var(--line); margin:1.4em 0; }
code { background:var(--surface2); padding:2px 6px; border-radius:6px; font-size:.92em; }
.shot { border:2px dashed var(--line); background:var(--surface2); color:var(--muted); padding:14px 16px; margin:16px 0; border-radius:12px; font-style:italic; }
.shot::before { content:"📷 "; font-style:normal; }
.page-break { display:none; }

/* ---- chapter view ---- */
.chapter[hidden] { display:none; }
.chapter { scroll-margin-top:112px; }
.ch-title { display:flex; align-items:center; gap:12px; margin:.1em 0 .3em; }
.ch-title .num { flex:none; width:44px; height:44px; border-radius:12px; background:var(--accent); color:#fff;
  font-weight:800; font-size:1.15rem; display:flex; align-items:center; justify-content:center; }
.ch-title h1 { font-size:1.5em; margin:0; }

/* prev / next */
.chnav { display:flex; gap:12px; margin-top:38px; }
.chnav a { flex:1; text-decoration:none; border:1px solid var(--line); background:var(--surface); color:var(--ink);
  border-radius:14px; padding:14px 16px; display:flex; flex-direction:column; gap:3px; transition:border-color .12s, transform .08s; }
.chnav a:hover { border-color:var(--accent); transform:translateY(-1px); }
.chnav a.next { text-align:right; align-items:flex-end; }
.chnav a .dir { font-size:.78rem; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.03em; }
.chnav a .lbl { font-weight:700; color:var(--accent); }

/* ---- home (per-language cover + chapter list) ---- */
.cover { text-align:center; padding:14px 0 6px; }
.cover h1 { font-size:1.9em; margin:.1em 0 .3em; }
.cover .tagline { color:var(--muted); font-size:1.02em; max-width:600px; margin:.2em auto 0; font-style:normal; }
.note { background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:6px 20px; margin:22px 0; }
.note h2 { font-size:1.15em; }
.chapter-list { display:flex; flex-direction:column; gap:12px; margin-top:8px; }
.chapcard { display:flex; align-items:center; gap:14px; cursor:pointer; text-align:left; width:100%;
  border:1px solid var(--line); background:var(--surface); color:var(--ink); border-radius:16px; padding:16px 16px;
  font:inherit; transition:border-color .12s, transform .08s, box-shadow .12s; }
.chapcard:hover { border-color:var(--accent); transform:translateY(-1px); box-shadow:0 6px 18px rgba(16,24,40,.08); }
.chapcard .num { flex:none; width:40px; height:40px; border-radius:11px; background:var(--accent-soft); color:var(--accent);
  font-weight:800; display:flex; align-items:center; justify-content:center; font-size:1.05rem; }
.chapcard .name { font-weight:700; font-size:1.05rem; line-height:1.3; }
.chapcard .go { margin-left:auto; color:var(--muted); font-size:1.3rem; }

/* ---- landing page ---- */
.hero { max-width:820px; margin:0 auto; padding:52px 20px 6px; text-align:center; }
.hero h1 { font-size:2.2em; margin:.15em 0; }
.hero p { color:var(--muted); font-size:1.08em; max-width:600px; margin:.5em auto; }
.badge { display:inline-block; background:var(--accent-soft); color:var(--accent); border:1px solid var(--accent-border);
  padding:6px 14px; border-radius:999px; font-size:.9em; font-weight:700; margin-top:12px; }
.pick { text-align:center; color:var(--muted); font-weight:700; margin:30px 0 4px; font-size:.95em; }
.grid { max-width:820px; margin:10px auto 50px; padding:0 20px; display:grid;
  grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:14px; }
.card { position:relative; display:block; text-decoration:none; border:1px solid var(--line); border-radius:18px; background:var(--surface);
  padding:26px 16px; text-align:center; transition:transform .08s ease, box-shadow .12s ease, border-color .12s; }
.card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(16,24,40,.12); border-color:var(--accent); }
.card .lang { font-size:1.7em; font-weight:800; color:var(--ink); }
.card .en { color:var(--muted); font-size:.92em; margin-top:6px; }
.card.suggested { border-color:var(--accent); }
.card .tag { position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:var(--accent); color:#fff;
  font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:999px; white-space:nowrap; }

/* footers */
.foot { text-align:center; color:var(--muted); font-size:.88em; padding:24px 20px; border-top:1px solid var(--line); }
.foot .credit, .page-foot .credit { color:var(--ink); font-weight:700; }
.page-foot { max-width:760px; margin:0 auto; text-align:center; color:var(--muted); font-size:.85em; padding:24px 20px; border-top:1px solid var(--line); }

@media (max-width:480px) {
  body { font-size:calc(17px * var(--fs)); }
  .hero { padding:30px 18px 4px; }
  .hero h1 { font-size:1.7em; }
  .grid { grid-template-columns:1fr 1fr; gap:12px; }
  .card { padding:20px 10px; }
  .card .lang { font-size:1.4em; }
  .wrap { padding:18px 16px 44px; }
  .topbar select { max-width:30vw; }
}
`;

// theme + font-size init before paint (avoid flash)
const HEAD_JS = `<script>
(function(){try{
  var t=localStorage.getItem('theme');
  if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  document.documentElement.dataset.theme=t;
  var f=parseFloat(localStorage.getItem('fs'))||1; document.documentElement.style.setProperty('--fs',f);
}catch(e){}})();
function toggleTheme(){var d=document.documentElement;var t=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=t;try{localStorage.setItem('theme',t);}catch(e){}var b=document.getElementById('themeBtn');if(b)b.textContent=t==='dark'?'☀️':'🌙';}
function bumpFont(step){var d=document.documentElement;var f=parseFloat(getComputedStyle(d).getPropertyValue('--fs'))||1;f=Math.min(1.4,Math.max(.85,Math.round((f+step)*100)/100));d.style.setProperty('--fs',f);try{localStorage.setItem('fs',f);}catch(e){}}
</script>`;
const THEME_INIT = `<script>var _b=document.getElementById('themeBtn');if(_b)_b.textContent=document.documentElement.dataset.theme==='dark'?'☀️':'🌙';</script>`;

// controls block reused on every page (theme + font size)
const controls = () =>
  `<div class="fsgroup"><button class="iconbtn" onclick="bumpFont(-0.1)" aria-label="Smaller text" title="Smaller text">A−</button>` +
  `<button class="iconbtn" onclick="bumpFont(0.1)" aria-label="Bigger text" title="Bigger text">A+</button></div>` +
  `<button id="themeBtn" class="iconbtn" onclick="toggleTheme()" aria-label="Toggle dark mode" title="Toggle dark mode">🌙</button>`;

// ---- markdown transforms ----
function preprocess(md) {
  md = md.replace(/\[SCREENSHOT:\s*([^\]]+)\]/g, (_, d) => {
    const safe = d.trim().replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    return `<div class="shot">${safe}</div>`;
  });
  md = md.replace(/^(\s*\d+\.\s+\*\*.+?\*\*)\s*[—–-]\s*[^—–\-\n]*\d+\s*$/gm, '$1'); // strip "— page N"
  return md;
}

function bodyToHtml(md) {
  md = md.replace(/<div class="page-break">\s*<\/div>/g, '').replace(/^\s*---\s*$/gm, '');
  let h = marked.parse(md, { mangle: false, headerIds: true });
  return h.replaceAll('<img ', '<img loading="lazy" '); // hidden chapters don't fetch until opened
}

// drop the manual Table-of-Contents block (a run of numbered **bold** lines) — replaced by chapter cards.
// language-agnostic: detects the numbered-bold list, not the localized heading text.
function stripTOC(md) {
  return md
    .split(/<div class="page-break">\s*<\/div>/)
    .filter((seg) => (seg.match(/^\s*\d+\.\s+\*\*/gm) || []).length < 5)
    .join('\n');
}
// split a guide into [cover, ...chapters]; each = {title, name, html}
function splitChapters(md) {
  md = preprocess(md);
  const parts = md.split(/^# (.+)$/m); // [pre, t0, b0, t1, b1, ...]
  const chaps = [];
  for (let i = 1; i < parts.length; i += 2) chaps.push({ title: parts[i].trim(), body: parts[i + 1] || '' });
  return chaps;
}
// strip "<word> <num> — " prefix (Section 1 —, खंड 1 —, …) to get a clean chapter name
function chapterName(title) {
  const stripped = title.replace(/^[^\d\n]*\d+\s*[—–-]\s*/, '').trim();
  return stripped || title;
}

function langSwitcher(currentCode) {
  const opts = LANGS.map(
    (l) => `<option value="${l.code}.html"${l.code === currentCode ? ' selected' : ''}>${l.native} — ${l.en}</option>`
  ).join('');
  return `<select onchange="if(this.value)location.href=this.value+location.hash" aria-label="Choose language">${opts}</select>`;
}

// per-language page: cover + chapter list (home) and one hidden section per chapter, driven by inline JS.
function pageHtml(lang, chaps) {
  const cover = chaps[0];
  const sections = chaps.slice(1);
  const coverHtml = bodyToHtml(stripTOC(cover.body));

  const chapterList = sections
    .map(
      (c, i) =>
        `<button class="chapcard" onclick="openCh(${i})"><span class="num">${i + 1}</span>` +
        `<span class="name">${escapeHtml(chapterName(c.title))}</span><span class="go">→</span></button>`
    )
    .join('\n');

  const chapterSections = sections
    .map((c, i) => {
      const name = escapeHtml(chapterName(c.title));
      return `<section class="chapter" id="c${i}" data-name="${name}" hidden>
  <div class="ch-title"><span class="num">${i + 1}</span><h1>${name}</h1></div>
  <div class="chapter-body">${bodyToHtml(c.body)}</div>
  <nav class="chnav" id="nav${i}"></nav>
</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="${lang.code === 'english' ? 'en' : lang.code}" dir="${lang.dir || 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A Basic ChatGPT Guide — ${lang.native}</title>
${meta({ title: `A Basic ChatGPT Guide — ${lang.native} (${lang.en})`, url: `${BASE}${lang.code}.html`, locale: lang.locale })}
${HEAD_JS}
<link rel="stylesheet" href="style.css">
${ANALYTICS}
</head>
<body data-bcp="${lang.bcp}">
<div class="topbar">
  <a class="home" href="#" onclick="goHome();return false;" title="Contents">🏠</a>
  <span class="spacer"></span>
  ${langSwitcher(lang.code)}
  <a class="pdf-dl" href="pdfs/${lang.code}.pdf" download>⬇ PDF</a>
  ${controls()}
</div>

<div class="readbar" id="readbar" hidden>
  <button class="btn speak" id="speakBtn" onclick="toggleSpeak()" hidden>🔊</button>
  <button class="iconbtn arrow" onclick="prevCh()" aria-label="Previous chapter">◀</button>
  <div class="progress"><i id="progFill"></i></div>
  <span class="count" id="chCount"></span>
  <button class="iconbtn arrow" onclick="nextCh()" aria-label="Next chapter">▶</button>
</div>

<main class="wrap">
  <section id="home">
    <div class="cover">
      <h1>${escapeHtml(cover.title)}</h1>
      ${coverHtml}
    </div>
    <div class="chapter-list">
${chapterList}
    </div>
  </section>
${chapterSections}
</main>

<footer class="page-foot"><span class="credit">${CREDIT}</span></footer>
${THEME_INIT}
${GUIDE_JS}
</body>
</html>`;
}

function indexHtml() {
  const cards = LANGS.map(
    (l) =>
      `  <a class="card" data-code="${l.code}" data-bcp="${l.bcp}" href="${l.code}.html"><div class="lang">${l.native}</div><div class="en">${l.en}</div></a>`
  ).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A Basic ChatGPT Guide — in Your Language</title>
${meta({ title: 'A Basic ChatGPT Guide — Free, in 9 Indian languages', url: BASE })}
${HEAD_JS}
<link rel="stylesheet" href="style.css">
${ANALYTICS}
</head>
<body>
<div class="floating fsgroup">${controls()}</div>
<section class="hero">
  <h1>A Basic ChatGPT Guide</h1>
  <p>A simple, friendly guide to using ChatGPT on your phone. For first-time users. It can even read aloud to you.</p>
  <span class="badge">100% Free · No experience needed</span>
</section>
<div class="pick">Choose your language</div>
<nav class="grid" id="langGrid">
${cards}
</nav>
<div class="foot">
  <p><span class="credit">${CREDIT}</span></p>
  <p>ChatGPT is a product of OpenAI. · Free to read &amp; share.</p>
</div>
${THEME_INIT}
<script>
// suggest the visitor's likely language: pin its card to the front with a tag
(function(){try{
  var pref=(navigator.languages||[navigator.language||'']).map(function(x){return (x||'').toLowerCase().split('-')[0];});
  var grid=document.getElementById('langGrid');
  var cards=[].slice.call(grid.children);
  var map={en:'english',hi:'hindi',bn:'bengali',ta:'tamil',te:'telugu',kn:'kannada',mr:'marathi',pa:'punjabi',or:'odia'};
  var want=null; for(var i=0;i<pref.length && !want;i++){ if(map[pref[i]]) want=map[pref[i]]; }
  if(!want) return;
  var card=cards.filter(function(c){return c.dataset.code===want;})[0];
  if(!card) return;
  card.classList.add('suggested');
  var tag=document.createElement('span'); tag.className='tag'; tag.textContent='Suggested for you'; card.appendChild(tag);
  grid.insertBefore(card, grid.firstChild);
}catch(e){}})();
</script>
</body>
</html>`;
}

function escapeHtml(s) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// ---- client controller for guide pages (chapters + read-aloud). No ${} template vars inside. ----
const GUIDE_JS = `<script>
(function(){
  var sections=[].slice.call(document.querySelectorAll('.chapter'));
  var N=sections.length;
  var home=document.getElementById('home');
  var readbar=document.getElementById('readbar');
  var speakBtn=document.getElementById('speakBtn');
  var progFill=document.getElementById('progFill');
  var chCount=document.getElementById('chCount');
  var bcp=document.body.getAttribute('data-bcp')||'en-IN';
  var cur=-1;
  var ttsSupported=('speechSynthesis' in window);

  function name(i){ return sections[i]?sections[i].getAttribute('data-name'):''; }
  function buildNav(i){
    var nav=document.getElementById('nav'+i); if(!nav) return;
    var prev = i>0 ? '<a href="#ch'+(i-1)+'" class="prev"><span class="dir">← Back</span><span class="lbl">'+name(i-1)+'</span></a>'
                   : '<a href="#" onclick="goHome();return false;" class="prev"><span class="dir">←</span><span class="lbl">🏠 Home</span></a>';
    var next = i<N-1 ? '<a href="#ch'+(i+1)+'" class="next"><span class="dir">Next →</span><span class="lbl">'+name(i+1)+'</span></a>'
                     : '<a href="#" onclick="goHome();return false;" class="next"><span class="dir">Done ✓</span><span class="lbl">🏠 Home</span></a>';
    nav.innerHTML=prev+next;
  }
  function stopSpeak(){ if(ttsSupported) window.speechSynthesis.cancel(); speaking=false; if(speakBtn){speakBtn.classList.remove('on'); speakBtn.textContent='🔊';} }

  function show(i){
    stopSpeak();
    cur=i;
    home.hidden = (i>=0);
    for(var k=0;k<N;k++) sections[k].hidden = (k!==i);
    if(i>=0){
      buildNav(i);
      readbar.hidden=false;
      progFill.style.width=((i+1)/N*100)+'%';
      chCount.textContent=(i+1)+' / '+N;
      updateSpeak();
    } else {
      readbar.hidden=true;
    }
    window.scrollTo(0,0);
  }
  window.openCh=function(i){ location.hash='ch'+i; };
  window.goHome=function(){ if(location.hash){ location.hash=''; } else { show(-1); } };
  window.nextCh=function(){ if(cur<N-1) openCh(cur+1); else goHome(); };
  window.prevCh=function(){ if(cur>0) openCh(cur-1); else goHome(); };

  function fromHash(){
    var m=(location.hash||'').match(/^#ch(\\d+)$/);
    if(m){ var i=Math.min(N-1,Math.max(0,parseInt(m[1],10))); show(i); }
    else { show(-1); }
  }
  window.addEventListener('hashchange', fromHash);

  // ---- read aloud ----
  var speaking=false, queue=[], qi=0;
  function pickVoice(){
    var vs=window.speechSynthesis.getVoices()||[]; var p=bcp.split('-')[0];
    return vs.filter(function(v){return v.lang && v.lang.replace('_','-')===bcp;})[0]
        || vs.filter(function(v){return v.lang && v.lang.replace('_','-').toLowerCase().indexOf(p)===0;})[0]
        || null;
  }
  // only offer read-aloud when the device actually has a voice for THIS language —
  // otherwise it stays silent or reads with a wrong-language voice (gibberish).
  function updateSpeak(){ if(speakBtn) speakBtn.hidden = !(ttsSupported && cur>=0 && pickVoice()); }
  function speakNext(){
    if(!speaking || qi>=queue.length){ stopSpeak(); return; }
    var u=new SpeechSynthesisUtterance(queue[qi++]);
    u.lang=bcp; var v=pickVoice(); if(v) u.voice=v; u.rate=0.95;
    u.onend=speakNext; u.onerror=function(){ stopSpeak(); };
    window.speechSynthesis.speak(u);
  }
  window.toggleSpeak=function(){
    if(!ttsSupported) return;
    if(speaking){ stopSpeak(); return; }
    if(cur<0) return;
    var body=sections[cur].querySelector('.chapter-body');
    var text=(name(cur)+'. '+(body?body.innerText:'')).replace(/\\s+/g,' ').trim();
    // split into sentence-ish chunks WITHOUT lookbehind (old Safari throws on lookbehind regex literals)
    queue=(text.match(/[^.!?।]+[.!?।]*/g)||[text]).map(function(s){return s.trim();}).filter(Boolean);
    if(!queue.length) return;
    qi=0; speaking=true; speakBtn.classList.add('on'); speakBtn.textContent='⏹ Stop';
    speakNext();
  };
  window.addEventListener('beforeunload', stopSpeak);
  // voices often load async; re-check whether to show the button once they arrive
  if(ttsSupported){ try{ window.speechSynthesis.onvoiceschanged=function(){ updateSpeak(); }; }catch(e){} }

  fromHash();
})();
</script>`;

// ---- build ----
let built = 0;
for (const lang of LANGS) {
  const src = path.join(ROOT, lang.file);
  if (!fs.existsSync(src)) { console.log(`skip ${lang.code} (missing ${lang.file})`); continue; }
  const chaps = splitChapters(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(path.join(OUT, `${lang.code}.html`), pageHtml(lang, chaps));
  built++;
  console.log(`built docs/${lang.code}.html  (${chaps.length - 1} chapters)`);
}
fs.writeFileSync(path.join(OUT, 'index.html'), indexHtml());
fs.writeFileSync(path.join(OUT, 'style.css'), CSS.trim() + '\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

// copy assets into docs/ (GitHub Pages serves only docs/)
const assetsSrc = path.join(ROOT, 'assets');
const assetsDst = path.join(OUT, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.rmSync(assetsDst, { recursive: true, force: true });
  fs.cpSync(assetsSrc, assetsDst, { recursive: true });
  for (const p of fs.readdirSync(path.join(assetsDst, 'screenshots'), { withFileTypes: true })) {
    if (p.name === '.DS_Store' || p.name === 'README.txt') fs.rmSync(path.join(assetsDst, 'screenshots', p.name));
  }
  const n = fs.readdirSync(path.join(assetsDst, 'screenshots')).length;
  console.log(`copied assets → docs/assets (${n} files in screenshots/)`);
}

// copy generated PDFs into docs/
const pdfSrc = path.join(ROOT, 'pdfs');
const pdfDst = path.join(OUT, 'pdfs');
if (fs.existsSync(pdfSrc)) {
  fs.rmSync(pdfDst, { recursive: true, force: true });
  fs.cpSync(pdfSrc, pdfDst, { recursive: true });
  const n = fs.readdirSync(pdfDst).filter((f) => f.endsWith('.pdf')).length;
  console.log(`copied pdfs → docs/pdfs (${n} files)`);
} else {
  console.log('no pdfs/ folder — run pdf-tools/build-pdfs.mjs first');
}
console.log(`built docs/index.html + style.css  (${built} language pages)`);
