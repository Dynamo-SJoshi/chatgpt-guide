import path from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve('..', 'assets', 'og.png');

const html = `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0}
  .card{width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;
    box-sizing:border-box;padding:80px;
    background:linear-gradient(135deg,#0f1115 0%,#10a37f 160%);color:#fff;
    font-family:'Helvetica Neue',Arial,sans-serif;}
  .badge{display:inline-block;align-self:flex-start;background:rgba(255,255,255,.14);
    border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:8px 20px;font-size:26px;font-weight:600;margin-bottom:28px;}
  h1{font-size:82px;line-height:1.05;margin:0 0 24px;font-weight:800;letter-spacing:-1px;}
  p{font-size:34px;line-height:1.4;margin:0;color:rgba(255,255,255,.92);max-width:980px;}
  .langs{font-size:27px;margin-top:34px;color:rgba(255,255,255,.8);}
  .credit{position:absolute;bottom:46px;left:80px;font-size:24px;color:rgba(255,255,255,.7);}
</style>
<div class="card">
  <span class="badge">100% Free · No experience needed</span>
  <h1>A Basic ChatGPT Guide</h1>
  <p>A simple, beginner-friendly guide to using ChatGPT on your phone — for first-time users.</p>
  <div class="langs">English · हिंदी · বাংলা · தமிழ் · తెలుగు · ಕನ್ನಡ · मराठी · ਪੰਜਾਬੀ · ଓଡ଼ିଆ</div>
  <div class="credit">Made with ❤️ by Garv Sachdeva</div>
</div>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: OUT, type: 'png' });
await browser.close();
console.log(`wrote ${OUT}`);
