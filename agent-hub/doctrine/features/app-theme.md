# App dark / light theme

- Status: draft
- Source: backfill from code
- Issues: #62
- Anchors: `src/composables/useTheme.ts`, `src/pages/_layouts/Header.vue`, `src/main.ts`, `index.html`

## Goal
The user picks a dark or light interface, and the choice sticks.

## Behavior
1. On app start (before render) the theme is: the saved `localStorage.theme` if it is `light` or `dark`; else `light` if the OS explicitly prefers light; else `dark`.
2. The theme is applied as `data-bs-theme` on `<html>`. Nothing else (e.g. `<body>`) may carry its own `data-bs-theme`.
3. The header shows a toggle button on both signed-out and signed-in pages: a sun icon in dark mode (label "switch to light"), a moon icon in light mode (label "switch to dark").
4. Clicking it flips the theme, saves it to `localStorage.theme` and applies it immediately.
5. This is the app's interface theme only; the CV layout theme (Classic/Modern/Compact) is separate (see `cv-preview-export.md`).

## Acceptance criteria
- `npx vitest run src/composables/useTheme.spec.ts` passes.
- With no saved theme and the OS set to dark (or no preference), `document.documentElement.dataset.bsTheme === 'dark'` after load.
- Clicking the toggle in dark mode sets `localStorage.theme = 'light'`, and the computed background colour of `body` changes (`#app` itself is transparent — live 2026-11-06: body `rgb(250, 250, 250)` light ↔ `rgb(10, 10, 11)` dark) (check a real computed style, not just the attribute — see Traps in `domains/PROJECT.md`).
- `index.html` has no `data-bs-theme` attribute on `<body>`.

## Edge cases
- `localStorage.theme = 'blue'` → ignored, falls back to the OS/default rule.

## Out of scope
- Following live OS theme changes after start.
- A "system" option.

## Open questions
1. Once the user toggles, the OS preference is never followed again (no way back to "system"). Intended?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
