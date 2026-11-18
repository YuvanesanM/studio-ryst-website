#!/usr/bin/env node
// Visual QA capture: real screenshots plus automatic layout checks.
//
//   node .claude/skills/visual-qa/scripts/capture.mjs <url> [options]
//
// Options
//   --out <dir>         where to write PNGs and report.json (default: ./qa-shots)
//   --sizes <list>      comma list of presets or WxH: phone,phone-sm,tablet,laptop,tv,tv720,tv4k
//                       (default: phone,laptop,tv)
//   --wait <ms>         extra settle time after load (default: 800)
//   --full              full-page screenshots (TV views are always viewport-only)
//   --mock <glob>=<json-file>   answer matching requests with a JSON file (repeatable),
//                       e.g. --mock "**/game*=fixtures/ludo.json"
//   --block <glob>      abort matching requests (repeatable), e.g. analytics
//   --storage <json>    JSON object written to localStorage before load
//   --reduced-motion    emulate prefers-reduced-motion: reduce
//   --distance          also save a 25%-scale copy of TV shots (approximates 4 m viewing)
//
// Checks reported per size: page errors, console errors, failed requests, horizontal
// overflow, text smaller than the size's minimum (TV: 2.5vh), elements outside the
// 5% TV safe area, images that failed to load, and tap targets under 44px on phones.
// Exit code 1 if any check fails, so it can gate a commit.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { try { ({ chromium } = require('@playwright/test')); } catch { console.error('Playwright is not installed. In a Claude Code cloud session it is preinstalled; locally run: npm i -D playwright && npx playwright install chromium'); process.exit(2); } }

const PRESETS = {
  'phone-sm': { w: 320, h: 640, kind: 'phone' }, phone: { w: 390, h: 844, kind: 'phone' },
  tablet: { w: 820, h: 1180, kind: 'tablet' }, laptop: { w: 1440, h: 900, kind: 'desktop' },
  tv720: { w: 1280, h: 720, kind: 'tv' }, tv: { w: 1920, h: 1080, kind: 'tv' }, tv4k: { w: 3840, h: 2160, kind: 'tv' },
};

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--') && !isOptValue(a));
function isOptValue(a) { const i = args.indexOf(a); return i > 0 && args[i - 1].startsWith('--') && !['--full', '--reduced-motion', '--distance'].includes(args[i - 1]); }
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; };
const all = name => args.flatMap((a, i) => a === '--' + name ? [args[i + 1]] : []);
const flag = name => args.includes('--' + name);
if (!url) { console.error('Usage: node capture.mjs <url> [--out dir] [--sizes phone,laptop,tv] [--wait ms] [--full] [--mock glob=file] [--block glob] [--storage json] [--reduced-motion] [--distance]'); process.exit(2); }

const out = path.resolve(opt('out', 'qa-shots'));
fs.mkdirSync(out, { recursive: true });
const sizes = opt('sizes', 'phone,laptop,tv').split(',').map(s => {
  if (PRESETS[s]) return { name: s, ...PRESETS[s] };
  const m = s.match(/^(\d+)x(\d+)$/); if (!m) throw new Error('Unknown size ' + s);
  const w = +m[1], h = +m[2];
  return { name: s, w, h, kind: w >= 1280 && w / h > 1.6 ? 'tv' : w < 600 ? 'phone' : 'desktop' };
});

async function launch() {
  try { return await chromium.launch(); }
  catch (e) {
    const p = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';
    return chromium.launch({ executablePath: fs.existsSync(p) && fs.statSync(p).isDirectory() ? undefined : p, args: ['--no-sandbox'] })
      .catch(() => { throw e; });
  }
}

const browser = await launch();
const report = { url, when: new Date().toISOString(), sizes: [] };
let failed = false;

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1, reducedMotion: flag('reduced-motion') ? 'reduce' : 'no-preference', hasTouch: s.kind === 'phone', isMobile: s.kind === 'phone' });
  const storage = opt('storage', null);
  if (storage) await ctx.addInitScript(o => { try { for (const [k, v] of Object.entries(o)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch {} }, JSON.parse(storage));
  for (const b of all('block')) await ctx.route(b, r => r.abort());
  for (const m of all('mock')) { const [glob, file] = m.split('='); const body = fs.readFileSync(file, 'utf8'); await ctx.route(glob, r => r.fulfill({ status: 200, contentType: 'application/json', body })); }

  const page = await ctx.newPage();
  const r = { size: s.name, viewport: `${s.w}x${s.h}`, kind: s.kind, pageErrors: [], consoleErrors: [], failedRequests: [] };
  page.on('pageerror', e => r.pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') r.consoleErrors.push(m.text().slice(0, 300)); });
  page.on('requestfailed', q => r.failedRequests.push(q.url().slice(0, 200) + ' ' + (q.failure()?.errorText || '')));

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => r.pageErrors.push('navigation: ' + e.message));
  await page.waitForTimeout(+opt('wait', 800));
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});

  r.checks = await page.evaluate(({ kind }) => {
    const vw = innerWidth, vh = innerHeight, res = {};
    res.horizontalOverflowPx = Math.max(0, document.documentElement.scrollWidth - vw);
    res.verticalScroll = kind === 'tv' && document.documentElement.scrollHeight > vh + 1;
    const minPx = kind === 'tv' ? vh * 0.025 : kind === 'phone' ? 12 : 11;
    const visible = el => { const cs = getComputedStyle(el), b = el.getBoundingClientRect(); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < vh * (kind === 'tv' ? 1 : 50); };
    const textEls = [...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1) && visible(el));
    res.smallText = textEls.filter(el => parseFloat(getComputedStyle(el).fontSize) < minPx - 0.5)
      .slice(0, 15).map(el => ({ text: el.textContent.trim().slice(0, 40), px: parseFloat(getComputedStyle(el).fontSize), min: Math.round(minPx) }));
    if (kind === 'tv') {
      const ix = vw * 0.05, iy = vh * 0.05;
      res.outsideSafeArea = textEls.filter(el => { const b = el.getBoundingClientRect(); return b.left < ix - 1 || b.top < iy - 1 || b.right > vw - ix + 1 || b.bottom > vh - iy + 1; })
        .slice(0, 15).map(el => { const b = el.getBoundingClientRect(); return { text: el.textContent.trim().slice(0, 40), box: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }; });
    }
    if (kind === 'phone') {
      res.smallTapTargets = [...document.querySelectorAll('a,button,input,select,textarea,[role=button],[onclick]')].filter(visible)
        .filter(el => { const b = el.getBoundingClientRect(); return b.width < 44 || b.height < 44; })
        .slice(0, 15).map(el => { const b = el.getBoundingClientRect(); return { el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''), text: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 30), size: `${Math.round(b.width)}x${Math.round(b.height)}` }; });
    }
    res.brokenImages = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && visible(i)).map(i => i.currentSrc || i.src).slice(0, 10);
    return res;
  }, { kind: s.kind });

  const file = path.join(out, `${s.name}-${s.w}x${s.h}.png`);
  await page.screenshot({ path: file, fullPage: flag('full') && s.kind !== 'tv' });
  r.screenshot = file;
  if (flag('distance') && s.kind === 'tv') {
    const small = path.join(out, `${s.name}-distance-25pct.png`);
    const dp = await ctx.newPage();
    await dp.setViewportSize({ width: Math.round(s.w / 4), height: Math.round(s.h / 4) });
    await dp.setContent(`<body style="margin:0;background:#000"><img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}" style="width:100%;display:block"></body>`);
    await dp.screenshot({ path: small }); r.distanceShot = small;
  }

  const c = r.checks;
  r.pass = !r.pageErrors.length && !c.horizontalOverflowPx && !c.verticalScroll && !c.smallText.length && !(c.outsideSafeArea || []).length && !(c.smallTapTargets || []).length && !c.brokenImages.length;
  if (!r.pass) failed = true;
  report.sizes.push(r);
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${s.name.padEnd(8)} ${r.viewport.padEnd(10)} ${file}`);
  if (!r.pass) {
    if (r.pageErrors.length) console.log('   page errors:', r.pageErrors.slice(0, 3));
    if (c.horizontalOverflowPx) console.log('   horizontal overflow:', c.horizontalOverflowPx + 'px');
    if (c.verticalScroll) console.log('   TV view scrolls vertically');
    if (c.smallText.length) console.log('   text below minimum:', c.smallText.slice(0, 4));
    if ((c.outsideSafeArea || []).length) console.log('   outside TV safe area:', c.outsideSafeArea.slice(0, 4));
    if ((c.smallTapTargets || []).length) console.log('   tap targets < 44px:', c.smallTapTargets.slice(0, 4));
    if (c.brokenImages.length) console.log('   broken images:', c.brokenImages);
  }
  if (r.consoleErrors.length) console.log('   console errors (not failing):', r.consoleErrors.slice(0, 3));
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log('report:', path.join(out, 'report.json'));
process.exit(failed ? 1 : 0);
