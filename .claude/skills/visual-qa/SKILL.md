---
name: visual-qa
description: "Visual quality assurance with real browser screenshots - Playwright capture at phone, laptop, TV 1080p and 4K sizes, automatic checks (horizontal overflow, text below minimum size, TV safe-area violations, small tap targets, broken images, page errors), before/after pixel comparison, spacing and alignment inspection, typography and contrast review, visual defect reporting and an iterative fix-and-recapture loop. Use after any visual change and before saying a UI, game screen, TV display or page is done; when the user reports something looks wrong on a device; or to compare a redesign against the current version. Includes runnable scripts in scripts/capture.mjs and scripts/compare.mjs."
---

# Visual QA

You do not call visual work finished until you have looked at real screenshots of it, at the sizes people actually use, and fixed what you saw. Reading the code is not looking.

## Tools in this skill

Both scripts use the Playwright Chromium already installed in Claude Code cloud sessions (they fall back to `/opt/pw-browsers/chromium` or `$CHROME_PATH`). Locally: `npm i -D playwright && npx playwright install chromium`. Don't add Playwright to a project's dependencies just to run them.

**Capture and check**
```bash
node .claude/skills/visual-qa/scripts/capture.mjs http://127.0.0.1:8765/display.html \
  --sizes tv720,tv,tv4k --distance --out qa-shots/display
node .claude/skills/visual-qa/scripts/capture.mjs http://127.0.0.1:8765/play.html \
  --sizes phone-sm,phone --out qa-shots/play
```
Presets: `phone-sm` 320x640, `phone` 390x844, `tablet` 820x1180, `laptop` 1440x900, `tv720` 1280x720, `tv` 1920x1080, `tv4k` 3840x2160, or any `WxH`. Writes PNGs plus `report.json`, prints PASS/FAIL per size, exits 1 on failure.

Other options: `--mock "**/game*=fixture.json"` to render a specific game state without the live server, `--block "**/googletagmanager.com/**"`, `--storage '{"ryst_proxy_token":"t"}'`, `--reduced-motion`, `--full` (full-page, non-TV), `--wait 1500`.

**Compare before/after**
```bash
node .claude/skills/visual-qa/scripts/compare.mjs before.png after.png --out diff.png
```
Prints the percentage of changed pixels and the changed region; the diff image shows changes in magenta.

## Serving pages locally

These repos are static sites: from the repo root run `python3 -m http.server 8765 --bind 127.0.0.1` in the background and capture `http://127.0.0.1:8765/<page>`. Pages that call the live server (`ryst-109a-proxy`, `ryst-quss.onrender.com`) should be captured with `--mock` fixtures for each state you need, so screenshots are deterministic and no real data is touched.

## Workflow

1. **Baseline.** Before changing anything visual, capture the current version at the target sizes (keep these as `before/`).
2. **Define the states** to check: for games, at least lobby, mid-game (your turn and not your turn), an event moment, game over, disconnected; for pages, default, empty, error, long content.
3. **Make the change**, then capture `after/` for every state and size, with `--distance` for TV views.
4. **Read the report**, then **look at every screenshot yourself** (open the PNG). The script catches mechanical defects; you judge design.
5. **Inspect** against the checklist below and write down each defect with the size, state, element and what is wrong.
6. **Fix and re-capture** until the report passes and the screenshots hold up. Run `compare.mjs` against the baseline to confirm nothing changed that shouldn't have.
7. **Report honestly:** what was checked, at which sizes and states, what passed, and anything not verified (for example a live multiplayer flow you could only mock).

## What to inspect in each screenshot

- **Hierarchy:** the first thing the eye lands on is the most important thing; one focal point.
- **Spacing:** gaps follow the scale; equal things have equal gaps; edges align; nothing cramped against an edge.
- **Typography:** sizes from the scale; no widows on headings; no clipped or overlapping text; numerals tabular in scores and timers; long names (try 20+ characters) truncate gracefully.
- **Colour and contrast:** brand tokens only (Deep Teal `#07333B`, Champagne Gold `#D8B879`, Warm Ivory `#F6F3EC`, Seafoam `#A9CFC5` plus documented game colours); gold used sparingly; text contrast meets AA (TV body 7:1).
- **TV specifics:** readable in the 25% distance shot; everything inside the 5% safe area; no scrollbars; identical composition at 720p, 1080p and 4K.
- **Phone specifics:** primary action in thumb reach; targets 44-48px+; no horizontal scroll at 320px; keyboard doesn't cover inputs.
- **Game state:** whose turn it is is obvious; player identity readable without colour; scores and timers visible.
- **Motion:** capture start, middle and end frames of key animations (use `--wait` or trigger states with fixtures); check the end frame matches the state; check `--reduced-motion`.
- **Defects:** broken images, missing fonts (fallback serif/sans showing), layout shift, z-index overlaps, blurry canvas (missing devicePixelRatio scaling), aliasing on 3D edges.

## Quality standards

- No visual change is reported done without screenshots at the relevant sizes.
- `capture.mjs` passes for every size and state checked, or each remaining failure is explained and accepted by the user.
- Every claim in the final report is backed by a screenshot or a script result; unverified parts are named.

## Completion checklist

- [ ] Baseline captured before the change.
- [ ] States and sizes listed (TV: tv720, tv, tv4k with --distance; phone: phone-sm, phone).
- [ ] After screenshots captured with deterministic data (mocks where the page needs a server).
- [ ] report.json reviewed and every screenshot opened and inspected.
- [ ] Defects written down, fixed and re-captured until passing.
- [ ] compare.mjs run against the baseline; unexpected differences explained.
- [ ] Final report states what was verified and what was not.
