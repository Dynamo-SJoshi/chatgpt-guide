import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.resolve('..');            // repo root (script lives in pdf-tools/)
const OUT = path.join(ROOT, 'pdfs');
fs.mkdirSync(OUT, { recursive: true });

const CREDIT = 'Made with ❤️ by Garv Sachdeva';

const LANGS = [
  { code: 'english', file: 'guides/english.md' },
  { code: 'hindi',   file: 'guides/hindi.md' },
  { code: 'bengali', file: 'guides/bengali.md' },
  { code: 'tamil',   file: 'guides/tamil.md' },
  { code: 'telugu',  file: 'guides/telugu.md' },
  { code: 'kannada', file: 'guides/kannada.md' },
  { code: 'marathi', file: 'guides/marathi.md' },
  { code: 'punjabi', file: 'guides/punjabi.md' },
  { code: 'odia',    file: 'guides/odia.md' },
];
const only = process.argv.slice(2);
const targets = only.length ? LANGS.filter((l) => only.includes(l.code)) : LANGS;

const CSS = `
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
body { font-family: 'Helvetica Neue', Arial,
  'Noto Sans','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Kannada','Noto Sans Oriya','Noto Sans Gurmukhi',
  'Kohinoor Devanagari','Kohinoor Bangla','Tamil Sangam MN','Kohinoor Telugu','Kannada Sangam MN','Gurmukhi MN','Oriya Sangam MN', sans-serif;
  line-height: 1.6; margin: 0; color: #222; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #ddd; padding: 7px 9px; }
th { background: #f4f4f4; }
blockquote { border-left: 4px solid #10a37f; padding: .4em 1em; margin: 1em 0; background: #f6fbf9; border-radius: 0 6px 6px 0; }
h1 { font-size: 1.9em; color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: .35rem; margin: 1.1rem 0; }
h2 { font-size: 1.4em; color: #34495e; margin: 1.1rem 0; }
h3 { font-size: 1.15em; color: #455a64; }
img { display: block; max-width: 320px; width: 100%; height: auto; margin: 14px auto;
  border: 1px solid #e6e8ec; border-radius: 10px; }
.page-break { page-break-after: always; break-after: page; height: 0; }
h1 { page-break-before: always; break-before: page; }
h1:first-of-type { page-break-before: avoid; break-before: avoid; }
table, blockquote, pre, img { page-break-inside: avoid; break-inside: avoid; }
h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
.pdf-credit { page-break-before: always; text-align: center; color: #444; margin-top: 45%; font-size: 1.1em; }
.pdf-credit .heart { color: #e25555; }
`;

// strip the "— page N" tail from numbered TOC lines (page numbers are unreliable across scripts;
// the PDF has page-number footers anyway). Language-agnostic.
function preprocess(md) {
  return md.replace(/^(\s*\d+\.\s+\*\*.+?\*\*)\s*[—–-]\s*[^—–\-\n]*\d+\s*$/gm, '$1');
}

function mdToHtml(md) {
  const body = marked.parse(preprocess(md), { mangle: false, headerIds: true });
  const credit = `<div class="pdf-credit">${CREDIT.replace('❤️', '<span class="heart">❤️</span>')}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8">
<base href="file://${ROOT}/">
<style>${CSS}</style></head><body>${body}${credit}</body></html>`;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
for (const lang of targets) {
  const md = fs.readFileSync(path.join(ROOT, lang.file), 'utf8');
  const page = await browser.newPage();
  await page.setContent(mdToHtml(md), { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(OUT, `${lang.code}.pdf`),
    format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:9px;color:#999;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
  });
  await page.close();
  const kb = Math.round(fs.statSync(path.join(OUT, `${lang.code}.pdf`)).size / 1024);
  console.log(`${lang.code}.pdf  (${kb} KB)`);
}
await browser.close();
console.log(`\nwrote ${targets.length} PDF(s) to pdfs/`);
