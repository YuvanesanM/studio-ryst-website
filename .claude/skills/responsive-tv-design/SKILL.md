---
name: responsive-tv-design
description: "Large-screen TV and projector interface design and its paired mobile controllers - 1080p and 4K layouts, 16:9 landscape, title- and action-safe areas, viewing-distance readability (10-foot UI), type and icon sizing in vw/vh, contrast for bright outdoor and glare conditions, overscan, kiosk/signage behaviour (no input, auto-refresh, idle states, burn-in avoidance), and phone controllers that pair with the TV. Use when building or changing display.html, any signage or pool-screen view, the Studio RYST lobby TV, or a phone screen that controls a shared display, or when text is too small, cut off or unreadable on the TV."
---

# Responsive TV design

The TV is read from 3 to 5 metres away, often outdoors near a pool, by people who never touch it. Design for distance, glare and glances.

## Context (inspect first)

- **RYST PLAY / RYST 109A:** `display.html` is the pool-area TV; its header comments already state the rule "type sizes are set in vw/vh so they scale to whatever resolution". `play.html` is the phone controller.
- **Studio RYST:** the lobby TV schedule display lives in the `signage` repo (`index.html`), shown on signage.ryst.in.
- Brand: Deep Teal `#07333B` ground for TV, Warm Ivory `#F6F3EC` text, Champagne Gold `#D8B879` for highlights, Seafoam `#A9CFC5` secondary.

## Sizing rules (16:9, scale with the viewport)

Base everything on viewport units so 1280x720, 1920x1080 and 3840x2160 look identical, with `clamp()` floors for small preview windows.

| Element | Size at 1080p | Viewport unit |
|---|---|---|
| Minimum readable text (labels) | 28px | ~2.6vh / 1.5vw |
| Body / instructions | 36-40px | ~3.5vh |
| Player names, scores | 48-64px | 4.5-6vh |
| Headlines, whose turn | 72-96px | 7-9vh |
| Hero numerals (timer, die) | 140px+ | 13vh+ |
| Icons | 48px minimum | 4.5vh |

Rule of thumb: text height should be at least 1/200 of viewing distance; at 4 m, nothing under ~25px at 1080p.

## Layout

- **Safe areas:** keep all text and controls inside the action-safe area (5% inset on every edge: 96px x 54px at 1080p); critical info inside title-safe (10%). Some TVs overscan.
- **Landscape only**, 16:9. Lock the layout to the viewport (`height: 100vh; overflow: hidden`) - a TV page must never scroll.
- **Zones:** brand and status along the top band; the board or main content centred and as large as possible; players and scores along the sides or bottom. Same zones on every game so guests learn them once.
- **Hierarchy by size, not by detail:** at distance, fine borders, thin weights and small icons disappear. Use 500-700 weights for UI text; Cormorant Garamond only at headline sizes.
- **Low density:** at most ~7 distinct items competing at once. If more info exists, rotate it or move it to the phone.

## Contrast and glare

- Light text on Deep Teal reads best outdoors; aim for 7:1 for body text (WCAG AAA) because glare halves effective contrast.
- Avoid pure white full-screen grounds (glare and burn-in); avoid thin gold lines.
- Never rely on colour alone to distinguish players: add symbols, names and positions.

## Kiosk and signage behaviour

- No input: everything advances on its own or from phone actions. No hover states, no cursors (`cursor: none`), no "click here".
- **Idle state:** when no game is active, show an attractive, slow ambient screen (villa imagery, how to join, QR) that moves gently to avoid burn-in.
- **Resilience:** recover from network loss automatically with a visible but calm "reconnecting" state; reload on new versions (the villa display already polls for updates); never show a browser error page.
- **Burn-in:** shift static logos a few pixels periodically or fade them; avoid static high-contrast bars left on for hours.
- **Performance:** TV browsers are weak; keep animation and canvas work light (see `3d-game-graphics` budgets).

## Phone controller pairing

- The phone is portrait, one-handed: identity at top, the single action in the lower half, 56px+ targets (see `premium-ui-ux`).
- Joining: a short code or QR on the TV, deep link to the phone page; the TV confirms each joiner by name within a second.
- Private information (hand, answers) stays on the phone; shared outcomes go to the TV.
- Keep identity (colour, symbol, name) identical on both screens.

## Workflow

1. Inspect the display page's existing units, breakpoints and zones; list what must be visible at all times.
2. Sketch the zones for 16:9; place content by priority.
3. Set the type scale in vh/vw with `clamp()` using the table above.
4. Implement; test at 1280x720, 1920x1080 and 3840x2160, plus the paired phone at 390x844.
5. Check from distance: view screenshots scaled down to ~25% (roughly what 4 m looks like); anything unreadable is too small.
6. Verify with `visual-qa`, including idle, active, disconnected and game-over states.

## Quality standards

- Identical composition at 720p, 1080p and 4K (only sharper).
- All text at or above the minimum sizes; nothing outside the 5% safe area.
- No scrolling, no cursor, no hover-only behaviour on the TV.
- Body text contrast 7:1 on the TV.
- Idle, reconnecting and error states look intentional.

## Completion checklist

- [ ] Display code and current units inspected; must-see info listed.
- [ ] Zones and safe areas applied; layout locked to the viewport.
- [ ] Type and icon scale in vh/vw with clamp floors, meeting the minimums.
- [ ] Contrast checked for glare (7:1 body); identity not colour-only.
- [ ] Idle, reconnect and burn-in behaviour handled.
- [ ] Phone controller pairing consistent with TV identity.
- [ ] Screenshots at 720p, 1080p, 4K and phone reviewed with `visual-qa`, including a 25% "distance" view.
