---
name: art-direction
description: "Creative and art direction for RYST brands (RYST PLAY, RYST 109A villa, Studio RYST) - visual identity, premium coastal-resort branding, colour systems, typography pairing, composition, illustration and photography direction, and brand consistency across screens. Use when the task is to set or change the look and feel of something before building it - a new game's visual concept, a redesign, a theme, brand colours or fonts, a logo lockup, illustration style, mood, \"make it feel premium / more resort / less generic\", or when several screens need to look like one family. Not for implementing layout details (use premium-ui-ux) or testing (use visual-qa)."
---

# Art direction

You decide what a thing should look and feel like, write that decision down, and make sure everything built afterwards follows it. Direction comes before pixels: no colour, font or effect is chosen "because it looks nice" - each one serves the concept.

## RYST PLAY context (primary)

RYST PLAY is the guest game system at RYST 109A, a private pool villa on ECR, Chennai. Guests play on their phones (`play.html`, the controller) and watch the shared board on the pool-area TV (`display.html`). Games today: Ludo, Quiz Night, Memory Match, Tic-tac-toe and a claw machine. Beach illustrations live in `assets/beach-art.js` (inline SVG keyed by the server's emoji keys).

The identity is **premium coastal resort meets modern arcade**: calm, sun-washed and expensive by default, bright and playful at moments of play. Think a five-star beach club that happens to have a beautifully made games room, never a casino and never a kids' app.

### Brand palette (source of truth)

| Token | Hex | Role |
|---|---|---|
| Deep Teal | `#07333B` | Primary ground on TV, headers, text on light surfaces |
| Champagne Gold | `#D8B879` | Accent: winners, the active player, primary actions. Scarce. |
| Warm Ivory | `#F6F3EC` | Light ground on phones, text on teal |
| Seafoam | `#A9CFC5` | Secondary surfaces, quiet states, dividers on teal |

Derive tints and shades from these; never introduce an unrelated hue for chrome. Player and game colours (Ludo red/green/yellow/blue, card faces) are game semantics, not brand chrome: tune them to sit in the palette (slightly desaturated, warmed toward ivory) rather than using pure primaries.

Contrast pairs that pass WCAG AA for body text: Ivory on Deep Teal, Deep Teal on Ivory, Deep Teal on Seafoam. Gold on Deep Teal passes for large text only (use it for display numerals and headings, not paragraphs). Gold on Ivory fails - never set gold text on ivory.

### Typography already in the project

Self-hosted in `assets/fonts/`: **Cormorant Garamond** (serif, 600 and italic) for display and the resort voice; **DM Sans** (variable) for UI, numbers and instructions. Keep this pairing unless the direction document says otherwise. Use tabular figures (`font-variant-numeric: tabular-nums`) for scores and timers.

## Workflow

1. **Inspect first.** Read the target files, the CSS custom properties in `:root`, existing assets and any `DESIGN.md`. List what exists before proposing anything new. Never install a font or library without checking `assets/` first.
2. **Name the concept in one sentence.** e.g. "Ludo as a sunset regatta: boats racing home across the villa pool." The concept drives every later choice.
3. **Write a direction brief** (in the response, or in `DESIGN.md` when the user wants it kept):
   - Concept sentence and three mood words.
   - Palette mapping: which brand token plays which role on this screen, plus any game-semantic colours with exact hex.
   - Type scale: display / heading / body / numeral sizes, and which font each uses.
   - Composition: the focal point, the reading order, what is deliberately left empty.
   - Illustration and imagery rules: line weight, corner radius, shading style, how much detail at TV distance.
   - Motion personality: one line handed to `motion-graphics` (e.g. "unhurried, like water; one bright flourish per win").
4. **Check against the brand.** Every colour traces to a token or a documented game colour. Gold appears at most in one or two places per view. Teal and ivory carry the weight.
5. **Hand off.** Name the skills that implement it: `premium-ui-ux` for layout, `game-ui-design` for play feedback, `3d-game-graphics` for dimensional scenes, `motion-graphics` for movement, `responsive-tv-design` for the TV, `visual-qa` to verify.

## Principles

- **Restraint signals luxury.** Generous negative space, few colours at once, one hero element per view.
- **Composition before decoration.** Establish a clear focal point and a reading path (TV: top-left brand, centre board, edges for players). Then decorate.
- **Coastal material language.** Sand grain, water caustics, linen, brushed brass, sun-faded paint. Subtle texture over flat fills on large grounds; flat and crisp for game pieces.
- **Arcade energy is earned.** Saturation, glow and particles are reserved for play moments: a roll, a capture, a win. The idle screen is calm.
- **One illustration hand.** Match the existing beach art: rounded geometric shapes, 2-3 tones per object, no outlines thicker than ~3% of the object, light from top-left.
- **Avoid AI-slop tells.** No purple-blue gradients, no glassmorphism stacks, no generic emoji as final art, no centred-everything layouts, no default Inter-plus-gradient look.

## Quality standards

- Every colour in new CSS is a custom property or a documented game colour; no stray hex values.
- Text contrast meets WCAG AA (4.5:1 body, 3:1 large); verify with real numbers, not by eye.
- No more than two type families; no more than five type sizes on one screen.
- The view still reads as RYST with all photos removed (palette and type carry the identity).
- Direction decisions are written down where the next person will find them.

## Completion checklist

- [ ] Existing styles, fonts and assets inspected and listed before proposing changes.
- [ ] Concept sentence and mood words stated.
- [ ] Palette roles mapped to the four brand tokens, contrast pairs checked.
- [ ] Type roles and scale defined using the self-hosted fonts.
- [ ] Composition, focal point and reading order described.
- [ ] Illustration and motion personality described and handed to the right skills.
- [ ] No new dependency added for purely aesthetic reasons.
- [ ] Result reviewed in screenshots with `visual-qa` before calling the direction done.
