#!/usr/bin/env node
// Pixel comparison of two screenshots, no extra dependencies (uses the Playwright Chromium).
//
//   node .claude/skills/visual-qa/scripts/compare.mjs <before.png> <after.png> [--out diff.png] [--threshold 0.1]
//
// Writes a diff image (changed pixels in magenta over a faded copy of "after") and prints the
// percentage of pixels that changed. --threshold is the per-channel tolerance (0-1) for
// anti-aliasing noise. Exit code 1 if the images differ in size.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('@playwright/test')); }

const [a, b] = process.argv.slice(2).filter(x => !x.startsWith('--'));
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
if (!a || !b) { console.error('Usage: node compare.mjs <before.png> <after.png> [--out diff.png] [--threshold 0.1]'); process.exit(2); }
const out = path.resolve(opt('out', 'diff.png'));
const tol = Math.round(parseFloat(opt('threshold', '0.1')) * 255);
const uri = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

let browser;
try { browser = await chromium.launch(); }
catch { browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); }
const page = await browser.newPage();
const result = await page.evaluate(async ({ A, B, tol }) => {
  const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const [ia, ib] = await Promise.all([load(A), load(B)]);
  if (ia.width !== ib.width || ia.height !== ib.height) return { sizeMismatch: [`${ia.width}x${ia.height}`, `${ib.width}x${ib.height}`] };
  const w = ia.width, h = ia.height, cv = n => Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d');
  const ca = cv(), cb = cv(), cd = cv();
  ca.drawImage(ia, 0, 0); cb.drawImage(ib, 0, 0);
  const da = ca.getImageData(0, 0, w, h).data, db = cb.getImageData(0, 0, w, h).data;
  const outImg = cd.createImageData(w, h), o = outImg.data;
  let changed = 0, minX = w, minY = h, maxX = -1, maxY = -1;
  for (let i = 0; i < da.length; i += 4) {
    const diff = Math.abs(da[i] - db[i]) > tol || Math.abs(da[i + 1] - db[i + 1]) > tol || Math.abs(da[i + 2] - db[i + 2]) > tol;
    if (diff) { changed++; o[i] = 255; o[i + 1] = 0; o[i + 2] = 255; o[i + 3] = 255; const p = i / 4, x = p % w, y = (p / w) | 0; if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
    else { const g = (db[i] + db[i + 1] + db[i + 2]) / 3; o[i] = o[i + 1] = o[i + 2] = 200 + g * 0.2; o[i + 3] = 255; }
  }
  cd.putImageData(outImg, 0, 0);
  return { pct: changed / (w * h) * 100, changed, box: maxX < 0 ? null : [minX, minY, maxX, maxY], png: cd.canvas.toDataURL('image/png') };
}, { A: uri(a), B: uri(b), tol });
await browser.close();
if (result.sizeMismatch) { console.error('Images differ in size:', result.sizeMismatch.join(' vs ')); process.exit(1); }
fs.writeFileSync(out, Buffer.from(result.png.split(',')[1], 'base64'));
console.log(`${result.pct.toFixed(3)}% of pixels changed (${result.changed})${result.box ? ', changed region ' + result.box.join(',') : ''}`);
console.log('diff:', out);
