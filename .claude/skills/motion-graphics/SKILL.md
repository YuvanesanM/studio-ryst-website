---
name: motion-graphics
description: "Motion design and animation implementation for RYST PLAY and RYST websites - CSS transitions and keyframes, the Web Animations API, GSAP (self-hosted), Motion and Rive where justified, canvas particle effects, screen and state transitions, dice rolls, token and piece movement along paths, card flips, score count-ups, countdowns, win celebrations and confetti, easing and timing systems, and reduced-motion alternatives. Use when something should move, when an animation feels janky, cheap, too slow or too much, or when a game event (roll, move, capture, match, correct answer, win) needs a satisfying animated response."
---

# Motion graphics

Motion explains what changed and where to look; delight comes second. Every animation has a job: show cause and effect, guide the eye to the next action, or celebrate a moment. If it has no job, cut it.

## What exists (inspect first)

- RYST PLAY (`display.html`, `play.html`): `requestAnimationFrame` loops drawing on Canvas 2D, CSS transitions on DOM elements, Web Audio tones synthesised in code (`tone()`, `noise()`), lazily loaded Three.js r128 for 3D.
- GSAP is self-hosted in the villa repo at `/assets/gsap/gsap.min.js` (plus ScrollTrigger), already used by the website pages.
- No bundler, no npm.

Check what a page already loads before adding anything: `grep -n "<script" file.html`.

## Choosing the tool

| Need | Use |
|---|---|
| Hover, press, fade, simple state changes on DOM | CSS transitions |
| Repeating or keyframed DOM effects | CSS `@keyframes` or the Web Animations API |
| Sequenced, chained or path-based DOM/SVG animation (dice tumble, token hops along a track, score count-up timelines) | GSAP from `/assets/gsap/gsap.min.js` (classic script, `window.gsap`) |
| Anything drawn on a canvas (particles, board pieces in Canvas 2D or Three.js) | Your own tween in the existing `requestAnimationFrame` loop, or `gsap.to(plainObject, ...)` driving values the loop reads |
| A designer-made interactive character or icon with states | Rive (`@rive-app/canvas`, self-hosted single file) - only if a `.riv` asset exists or is being commissioned |
| React app | Motion (`motion`), only in a React codebase - not in these vanilla pages |

Never run two animation libraries for the same job on the same page. GSAP covers what Motion would do here.

## Workflow

1. **Inspect** the page: which scripts load (`grep -n "<script" file.html`), the existing `requestAnimationFrame` loops, CSS transitions and sound hooks.
2. **List the moments** that need motion and give each a one-line purpose (cause and effect, guide the eye, celebrate). Cut any without a purpose.
3. **Pick the tool** for each moment from the table above, reusing what the page already loads.
4. **Set timing and easing** from the system below; note how each animation is interrupted by a newer state.
5. **Build the end state first** (correct static result from server state), then animate into it.
6. **Add the reduced-motion path** and the matching sound cue.
7. **Verify** with `visual-qa`: capture start, middle and end frames, check 60fps at TV resolution and the reduced-motion version.

## Timing and easing system

| Kind | Duration | Easing |
|---|---|---|
| Press feedback | 80-120ms | ease-out |
| UI state change (panel, banner) | 180-260ms | `cubic-bezier(.2,.8,.2,1)` / `power2.out` |
| Screen transition on TV | 400-600ms | `power3.inOut` |
| Token step (per square) | 120-180ms with a small hop | `power1.out` up, `power2.in` down |
| Dice roll | 700-1100ms total, settle with a slight overshoot | `power3.out` then `back.out(1.4)` on landing |
| Score count-up | 500-900ms | `power2.out`, tabular numerals |
| Win celebration | 2-4s, then settle to a calm state | mixed; ends still |

Personality for RYST: unhurried and fluid like water for chrome; crisp and bouncy only for game pieces and celebrations.

## Game moment recipes

- **Dice roll:** disable input; tumble with rotation on 2 axes and a slight arc; land with overshoot and a short shadow squash; then flash the value large (TV) and show it on the roller's phone. Result must come from the server; the animation lands on the server's value.
- **Token movement:** move square by square along the path, not a straight slide; tiny hop per square; camera/attention follows the token on TV; capture = the captured token pops and slides home along its own path.
- **Card flip (Memory Match):** 3D `rotateY` with `perspective` and `backface-visibility: hidden`; matched pairs pulse Gold then settle; mismatch flips back after ~700ms.
- **Correct answer (Quiz Night):** answer tile fills Gold from the left, team score counts up, a short shimmer; wrong answers shake ~6px for 300ms, never longer.
- **Turn change:** active seat scales to 1.04 and gains a Gold edge glow over 250ms; the previous seat relaxes.
- **Celebration:** canvas particles in brand colours (Champagne Gold `#D8B879`, Warm Ivory `#F6F3EC`, Seafoam `#A9CFC5`, a touch of coral) - shells, sparkles or confetti; gravity and drag; 120-250 particles on TV, 40-80 on phones; pooled, not re-allocated.

## Implementation rules

- Animate `transform` and `opacity` only on DOM; avoid animating layout properties (width, top, margin).
- Use one `requestAnimationFrame` loop per canvas; compute with elapsed time (`dt`), never frame counts, so speed is identical at 30, 60 and 120Hz.
- Interrupting is safe: a new state cancels or completes the running animation (`gsap.killTweensOf`, `animation.finish()`), so fast server updates never stack.
- Animations never block game logic: the state updates immediately; motion catches up.
- Pause loops when the tab or view is hidden (`document.visibilityState`).
- `prefers-reduced-motion: reduce`: replace movement with short fades or instant state changes; keep celebrations as a static banner. Check it in code paths that use JS, not only CSS.
- Sound and motion land on the same frame for impacts (dice landing, capture).

## Quality standards

- Every animation has a stated purpose and finishes within its budget above.
- 60fps on the TV during the heaviest moment (celebration plus board).
- No layout shift, no flicker on the first frame (set initial states before showing).
- Motion matches the server state exactly when it ends.
- Reduced-motion users get the full information.

## Completion checklist

- [ ] Existing loops, libraries and sound hooks inspected; tool chosen from the table, no duplicate library.
- [ ] Each animation's purpose, duration and easing defined.
- [ ] Only transform/opacity animated on DOM; canvas uses time-based updates.
- [ ] Interrupt and rapid-update behaviour tested.
- [ ] Reduced-motion path implemented and checked.
- [ ] Performance checked at TV resolution; particles pooled.
- [ ] Key frames captured with `visual-qa` (start, middle, end of each moment).
