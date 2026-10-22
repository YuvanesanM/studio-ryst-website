# Design skills for studio.ryst.in

Loaded automatically by Claude Code when working in this repo.

| Skill | Source | Licence |
|---|---|---|
| `impeccable` | github.com/pbakaus/impeccable (SKILL.md + reference/) | Apache 2.0 |
| `taste-skill` (design-taste-frontend) | github.com/Leonxlnx/taste-skill | MIT |
| `emil-design-eng` | github.com/emilkowalski/skills | MIT |

Impeccable's `scripts/` launcher (which downloads and runs a binary) is left
out on purpose; the skill falls back to reading the reference files directly.
Taste's `scripts/inspect.mjs` needs Node 22+ and Chromium — in a root
container, point `CHROME_PATH` at a wrapper that adds `--no-sandbox`.

The site-wide result of applying them lives in `/assets/site.css`.
