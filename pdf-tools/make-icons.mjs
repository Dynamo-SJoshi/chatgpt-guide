import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ASSETS = path.resolve('..', 'assets');
const big = path.join(ASSETS, 'icon-512.png');

const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0}</style>
<div style="width:512px;height:512px;background:linear-gradient(135deg,#12a37f,#0a6f55);display:flex;align-items:center;justify-content:center;">
  <svg width="300" height="300" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round">
    <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z"/>
    <circle cx="8.5" cy="12" r="1.15" fill="#0a6f55" stroke="none"/>
    <circle cx="12" cy="12" r="1.15" fill="#0a6f55" stroke="none"/>
    <circle cx="15.5" cy="12" r="1.15" fill="#0a6f55" stroke="none"/>
  </svg>
</div>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: big, type: 'png' });
await browser.close();

for (const size of [192, 180]) {
  execFileSync('sips', ['--resampleWidth', String(size), big, '--out', path.join(ASSETS, `icon-${size}.png`)], { stdio: 'ignore' });
}
console.log('wrote icon-512 / icon-192 / icon-180 to assets/');
