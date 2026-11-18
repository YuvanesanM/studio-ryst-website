---
name: premium-ui-ux
description: "Professional interface design and implementation for RYST products - layout, grids, visual hierarchy, spacing scales, typography in UI, buttons, forms, cards, lists, menus, empty and error states, refined hover/press/focus interactions and accessibility (WCAG AA, keyboard, touch targets, reduced motion). Use when building or polishing any screen people interact with: the RYST PLAY phone controller and lobby, staff dashboards, booking and quote pages, settings, or when the user says a UI looks cluttered, cheap, misaligned, hard to use or \"not premium\". Pairs with art-direction (look) and visual-qa (verification)."
---

# Premium UI/UX

You turn a direction into an interface that feels calm, precise and expensive, and that works for everyone who touches it. Premium is mostly subtraction: fewer elements, consistent spacing, clear hierarchy and interactions that respond instantly.

## RYST PLAY context (primary)

- Phones run `play.html`: guests join a game, pick a player, roll, answer and move. Used one-handed by a pool, in sunlight, often with wet fingers. Light ground (Warm Ivory `#F6F3EC`), Deep Teal `#07333B` text, Champagne Gold `#D8B879` only for the one primary action or the active player, Seafoam `#A9CFC5` for quiet surfaces.
- The TV runs `display.html` (see `responsive-tv-design`).
- No build step and no framework: plain HTML, CSS custom properties in `:root`, vanilla JS, self-hosted fonts (DM Sans for UI, Cormorant Garamond for display). Keep it that way unless the user asks otherwise.
- Icons: if an icon set is needed, prefer inline SVG; Lucide is acceptable as copied SVG paths, not a runtime dependency.

## Workflow

1. **Inspect** the screen's HTML, CSS variables and JS states. List every state the UI can be in (loading, empty, waiting for players, your turn, not your turn, error, offline, game over).
2. **Define the job of the screen** in one line and the single primary action. Everything else is secondary or removed.
3. **Lay out on a spacing scale.** Use a 4px base: 4, 8, 12, 16, 24, 32, 48, 64. Map them to custom properties (`--s1`...`--s8`) if the file has none. No arbitrary values like 13px or 22px.
4. **Set hierarchy** with size, weight and colour in that order. One heading level per region. Body 16px minimum on phones (17-18px preferred outdoors). Numbers use tabular figures.
5. **Design every state** from step 1, not just the happy path. Empty and error states say what happened and what to do next in plain words.
6. **Specify interactions:** pressed state within 100ms (scale 0.97 or a tone shift), focus ring visible on keyboard focus (`:focus-visible`, 2px, Deep Teal or Gold on teal), disabled states that still read, no hover-only information.
7. **Implement**, then verify with `visual-qa` at 390x844 (phone) and 1920x1080 (TV) before reporting done.

## Quality standards

**Layout and spacing**
- Align to a grid; left edges line up across sections. Equal gaps between equal things.
- Group related controls; separate groups with space before lines. Prefer tone steps (Ivory -> Seafoam tint) over borders.
- Content width on phones: 16-20px side gutters, no horizontal scroll at 320px.

**Typography in UI**
- Max ~5 sizes per screen. Line height 1.4-1.6 for body, 1.1-1.2 for display.
- Sentence case for buttons and labels. Verbs on buttons ("Roll dice", "Join game"), not "OK".

**Controls**
- Touch targets at least 48x48px, 8px apart; primary game actions 56px+ tall and reachable by the thumb (lower half of the screen).
- One primary button per view (Gold fill, Deep Teal text). Secondary: outline or tonal.
- Inputs have visible labels, not placeholder-only.

**Feedback**
- Every tap gets immediate visual feedback; network actions show progress after 300ms and a clear failure message on error.
- Never rely on colour alone: pair colour with an icon, label or shape (critical for player identity).

**Accessibility**
- WCAG AA contrast (4.5:1 body, 3:1 large and UI components). Gold text only on Deep Teal and only at large sizes.
- Semantic HTML: `button` for actions, real `label`s, `aria-live="polite"` for turn and score announcements.
- Respect `prefers-reduced-motion`: replace movement with fades or instant changes.
- Works with system font scaling up to 200% without clipping.

**Premium polish**
- Radius scale used consistently (e.g. 8 / 16 / pill). Shadows soft and low, or none.
- Transitions 150-250ms, ease-out; no bouncy easing on chrome.
- No layout shift when content loads; reserve space for scores and names.

## Completion checklist

- [ ] All UI states listed and designed, including empty, error, offline and waiting.
- [ ] Single primary action per view, placed in thumb reach on phones.
- [ ] Spacing uses the scale; no arbitrary pixel values introduced.
- [ ] Type sizes, weights and tabular numerals consistent.
- [ ] Touch targets 48px+, focus rings visible, semantic elements used.
- [ ] Contrast checked with real ratios; nothing communicated by colour alone.
- [ ] Reduced-motion path works.
- [ ] Screenshots checked at phone and TV sizes with `visual-qa`.
