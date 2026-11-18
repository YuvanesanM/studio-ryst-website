---
name: 3d-game-graphics
description: "Dimensional game graphics for RYST PLAY and other browser games - Three.js and WebGL scenes, PixiJS or Canvas 2D for 2D/2.5D boards, isometric and tilted-board 2.5D environments, lighting, PBR and stylised materials, textures, shadows, camera framing, game pieces and props (dice, tokens, boards, claw machine), performance budgets for TVs and phones, and graceful fallbacks when WebGL is unavailable. Use when adding depth, 3D objects or a rendered scene to a game, choosing a rendering engine, or fixing jank, blurry rendering, wrong lighting or memory leaks in a canvas/WebGL view."
---

# 3D game graphics

You add depth that makes the games feel crafted and physical, without breaking the rule that they must load fast and run smoothly on the villa TV's browser and on guests' mid-range phones.

## What RYST PLAY already uses (inspect first)

- **Canvas 2D** for the Ludo board, Memory Match, Tic-tac-toe and effects in `display.html`.
- **Three.js r128**, self-hosted at `/assets/vendor/three-r128.min.js`, loaded lazily only when a 3D view (the claw machine) opens, after a `hasWebGL()` check, with a 2D fallback if it fails.
- No bundler, no npm, no ES-module imports: scripts are classic `<script>` tags on GitHub Pages.

Run `grep -n "THREE\.\|getContext(\|PIXI" display.html play.html` before proposing anything, and read how the existing scene is created and torn down.

## Engine choice (avoid competing renderers)

| Need | Use | Not |
|---|---|---|
| Flat or 2.5D board, tokens, cards, particles | Canvas 2D (already there) | Pulling in PixiJS for a few sprites |
| Many animated sprites (hundreds+) at 60fps where Canvas 2D measurably drops frames | PixiJS, as a single self-hosted file, replacing the Canvas 2D path for that view | Running PixiJS and Canvas 2D side by side for the same view |
| True 3D objects, lighting, camera moves | Three.js r128 (already vendored) | A second 3D engine (Babylon, PlayCanvas) or a newer Three.js via CDN alongside r128 |
| Custom shader effect (water, caustics) | A Three.js `ShaderMaterial`, or a small raw WebGL quad if no Three.js view is open | A shader framework |

Upgrading Three.js is a deliberate project, not a side effect: r128 uses the old `examples/js` globals; newer versions need ES modules. Keep r128 unless the user approves a migration.

## Workflow

1. **Inspect** the target view, its current renderer, lifecycle (create, resize, destroy) and the server state it renders.
2. **Decide 2D, 2.5D or 3D** with the table above. Prefer 2.5D (Canvas 2D with tilt, layered shadows and highlights) when depth is decorative; use Three.js when objects must rotate, be lit dynamically or move in depth.
3. **Block out** with primitive shapes and the final camera before any materials. Frame for the TV: the board fills ~70% of the height, nothing important within 5% of the edges.
4. **Light** with a simple rig: warm key light from top-left (late-afternoon sun, ~#FFE9C7), cool teal fill (~#A9CFC5 at low intensity), hemisphere or ambient to lift shadows. One shadow-casting light only.
5. **Materials:** stylised over photoreal. `MeshStandardMaterial` with moderate roughness (0.4-0.8), low metalness except brass/gold trim. Palette from the brand: Deep Teal `#07333B` grounds, Champagne Gold `#D8B879` trim and highlights, Warm Ivory `#F6F3EC` pieces, Seafoam `#A9CFC5` water and glass tints. Game-colour pieces desaturated slightly to sit in the palette.
6. **Textures:** small (512-1024px), power-of-two, compressed JPEG/WebP; reuse via atlases; set `colorSpace`/`encoding` correctly (r128: `texture.encoding = THREE.sRGBEncoding`, `renderer.outputEncoding = THREE.sRGBEncoding`).
7. **Shadows:** one `DirectionalLight` with a tight shadow camera around the board, `PCFSoftShadowMap`, map size 1024 (2048 only if the TV holds 60fps). Fake contact shadows with a blurred blob texture where possible.
8. **Animate** state changes (dice settle, token hop) with the conventions in `motion-graphics`; drive the render loop with `requestAnimationFrame`, and pause it when the view is hidden.
9. **Fallback:** if WebGL is missing or the context is lost, show the 2D version with the same information. The game must stay playable.
10. **Verify** with `visual-qa`: screenshots at 1920x1080 and 3840x2160, an FPS check, and a check that leaving the view frees the renderer.

## Performance budget

- 60fps on the TV at 1080p; never below 30fps. Phones: render 3D only if it adds real value; prefer 2D on the controller.
- Draw calls under ~100; triangles under ~150k for a full scene; use `InstancedMesh` for repeated pieces.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; on 4K TVs render at 1080p-2K and let CSS scale if FPS drops.
- Dispose of geometries, materials, textures and the renderer when a view closes (`.dispose()`, `renderer.forceContextLoss()`), and remove resize listeners.
- Handle `webglcontextlost` / `webglcontextrestored`.
- Lazy-load Three.js only when needed (already the pattern); never add it to pages that don't use it.

## Quality standards

- Depth clarifies the game (pieces read as on the board, the active piece lifts) rather than decorating it.
- Lighting is consistent across scenes: warm key from top-left, matching the 2D beach art.
- No visible shadow acne, z-fighting, texture blur or aliasing at TV distance (enable antialias or FXAA when affordable).
- Stable 60fps on the target TV; no memory growth after opening and closing the view 10 times.
- 2D fallback carries the same information.

## Completion checklist

- [ ] Existing renderer and lifecycle inspected; engine chosen from the table, no competing engine added.
- [ ] Scene blocked out and framed for the TV safe area.
- [ ] Light rig, materials and textures follow the brand palette and the budgets above.
- [ ] Shadows tuned; colour encoding set correctly.
- [ ] Render loop pauses when hidden; resources disposed on close; context loss handled.
- [ ] WebGL-unavailable fallback works.
- [ ] FPS and screenshots verified at 1080p and 4K with `visual-qa`.
