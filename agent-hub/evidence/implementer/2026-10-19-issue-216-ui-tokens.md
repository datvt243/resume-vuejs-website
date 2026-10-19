# 2026-10-19 - issue-216-ui-tokens

- Worker: implementer
- Version: 0.1.0
- Node: `issue-216-ui-tokens` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #216 [UI] Phase 1 — Tokens màu, typography, font Geist. Per DESIGN.md §2.1, §2.2, §6.1, §11 step 1. (1) `src/styles/tailwind.css`: replace `:root`/`[data-bs-theme]` Bootstrap palette block with `--color-*` light/dark + legacy `--bs-*` bridge exactly as §2.1. (2) Add chart tokens `--chart-1..4`, `--chart-grid`, `--chart-axis` (§6.1). (3) `tailwind.config.cjs`: `darkMode ['selector','[data-bs-theme="dark"]']`, extend colors/fontFamily/fontSize/borderRadius/`boxShadow.float`. (4) `index.html`: load Geist + Geist Mono from Google Fonts (400/500/600); body font JetBrains Mono → `font-sans`. (5) `.form-select` styled by tokens + safelist. Expect: whole app reskins via `--bs-*` bridge, no per-component edits, no new hex outside token block. Presentation only. lint+test+build green; DESIGN.md §10; screenshots at 1440 light, 1440 dark, 375 dark. URL: https://github.com/datvt243/resume-vuejs-website/issues/216

## Hub bytes before: 181149

## Branch
`feature/issue-216-ui-tokens` — created from freshly pulled `staging` via `gh issue develop 216 --checkout --base staging` (linked to #216). Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/styles/tailwind.css` | Lines 1-114 rewritten: §2.1 `--color-*` light/dark blocks + §6.1 chart tokens in the same blocks + §2.1 legacy bridge verbatim. Bridge extended with `--bs-*` names still read in `src/` but missing from DESIGN.md's bridge (repo-wide `var(--bs-*)` grep): `--bs-border-width: 1px`, `--bs-secondary → --color-fg-2`, `--bs-warning-{text-emphasis,bg-subtle,border-subtle} → warning tokens`, `--bs-emphasis-color-rgb` (rgb triplet per theme, used in `rgba()` by `.navbar-toggler`/`.table-hover`). `--bs-light: #f8f9fa` / `--bs-dark: #212529` kept theme-invariant (see "Regression caught"). `body` → `@apply m-0 bg-bg font-sans text-base text-fg antialiased` (§2.2). Bare `a` → `--color-accent` / `--color-accent-hover` (drops the now-unused `--bs-link-*-rgb`). `.btn-primary` and `.btn-outline-primary:hover` text `#fff` → `var(--color-accent-fg)`: `--bs-primary` is now `#00d095` in dark, white on it fails contrast; §2.1 defines `accent-fg` exactly for this. Old 26-line node-history comment replaced by a 1-line WHY. |
| `tailwind.config.cjs` | `darkMode` selector + `theme.extend` exactly as §2.1 (colors, fontFamily, fontSize, borderRadius, `boxShadow.float`). |
| `index.html` | Preconnect + Google Fonts stylesheet: Geist + Geist Mono, `wght@400;500;600`, `display=swap`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

Item (5) `.form-select`: already exists in `@layer components` + safelist (shipped by #212, `tailwind.css` `.form-select` reads `var(--bs-*)` → now tokens via the bridge). No change needed. No `.vue` file changed.

## Command
From repo root:
- `npm run lint`
- `npm run test`
- `git stash && npx vitest run src/components/veevalidate/VeeForm.spec.ts && git stash pop` (prove the failure pre-exists)
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script (diff touches no `.ts`/`.vue`).

## Output
`npm run lint` → no findings, `lint_exit=0`.

`npm run test` (this branch, final run):
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 34 passed (35)
      Tests  1 failed | 227 passed (228)
```
Same spec with the diff stashed (= `staging`):
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 7ms
      Tests  1 failed | 14 passed (15)
```
→ pre-existing, same test as noted in #212/#213 evidence.

`npm run build`:
```
✓ built in 3.42s
```
Compiled CSS: `font-family:Geist,system-ui,-apple-system,Segoe UI,Roboto,sans-serif` and `font-family:Geist Mono,ui-monospace,…` present; `grep -c Geist dist/index.html` → `1`.

DESIGN.md §10 hex/arbitrary/opacity grep on added lines of the 3 changed files: every match is a `--color-*`, `--chart-*` or `--bs-dark` declaration inside the token blocks. No arbitrary values, no `opacity-*`.

Manual observation (Playwright attached to the port-9888 debug Chrome on the existing `npm run dev` server, logged-in session, `/dashboard/information`; not an automated test). Computed styles:
```
light: body font "Geist, system-ui, …", 14px, bg rgb(250,250,250), color rgb(24,24,27); document.fonts.check('14px Geist') = true; select bg rgb(250,250,250) color rgb(24,24,27)
dark:  body bg rgb(10,10,11); select bg rgb(10,10,11) color rgb(250,250,250); .btn-success bg rgb(74,222,128)
header user dropdown in light (real toggle): btn-outline-dark, color/border rgb(33,37,41)
```
Screenshots (local, gitignored via `.git/info/exclude`): `.playwright-mcp/216-before-1440-light.png`, `216-before-1440-dark.png`, `216-before-375-dark.png`, `216-after-1440-light.png`, `216-after-1440-dark.png`, `216-after-375-dark.png`. After: Geist everywhere, zinc neutrals (`#0a0a0b`/`#fafafa` bg), header/sidebar/forms reskinned with no component edits. 375 dark: `scrollWidth 417` vs `clientWidth 375` on this page — same 417px overflow already listed in epic #211's audit (pre-existing, Phase 2/7 scope).

## Regression caught during my own check (fixed before this note)
First pass mapped `--bs-light → --color-surface-2`, `--bs-dark → --color-fg` (theme-relative). `Header.vue:105` picks `outline-light` in dark / `outline-dark` in light, relying on Bootstrap's theme-INVARIANT light/dark. Theme-relative mapping inverted them → user dropdown text near-invisible in dark (seen in screenshot). Restored invariant `#f8f9fa`/`#212529` inside the `:root` token block with a 1-line WHY comment; re-screenshotted: dropdown readable in both themes.

## Acceptance
| Criterion | Evidence |
|---|---|
| `--color-*` light/dark + bridge per §2.1 | `tailwind.css` lines 5-100; bridge lines verbatim + extended names listed above |
| Chart tokens §6.1 | `--chart-1..4`, `--chart-grid`, `--chart-axis` in both theme blocks, values verbatim |
| `tailwind.config.cjs` darkMode + extend | config diff, exactly §2.1 |
| Geist + Geist Mono 400/500/600, body `font-sans` | `index.html` link; computed body font Geist; `fonts.check` true |
| `.form-select` by tokens + safelist | pre-existing from #212, now resolves through bridge (computed select colors above) |
| App reskins via bridge, no per-component edits | 0 `.vue` files in diff; screenshots |
| No new hex outside token block | §10 grep above |
| Presentation only; `data-*` kept | only CSS/config/HTML head changed |
| lint + build green; test no new failure | outputs above; the 1 failure pre-exists on `staging` |
| Comments per code-comments.md | 3 comments added, all 1-line WHY in `/* */` (CSS has no `//`): token-block pointer to DESIGN.md, bridge-extension reason, invariant `--bs-light/--bs-dark` reason. `tailwind.config.cjs`: 1 `//` pointer to where tokens live. No issue refs. Old narrated-history comment removed. |

## Noticed, not done
- Dark `.btn-success`: white text on `--color-success` `#4ade80` ≈ 1.9:1 (before: white on `#00d095`, ≈ 2:1 — not a regression). Phase 3 Button variants (#218) should move these to `accent`/`accent-fg`.
- Section headings ("ẢNH ĐẠI DIỆN") and active sidebar item use hardcoded mint/green in components, low contrast on light bg and `uppercase` — Phase 2/3 (#217/#218).
- `.form-control`/`.form-select` focus ring still hardcoded Bootstrap blue `#0d6efd40` in `@layer components` (pre-existing hex outside token block) — Phase 7 (#222).
- `fontSize`/`borderRadius` extend overrides Tailwind defaults app-wide (e.g. `text-xl` 20→28px, `rounded` 4→6px). Intended by §2.1; not visible on the checked page, other pages may shift.
- Before-light screenshot was taken while the header user dropdown hadn't rendered yet, so the light before/after comparison of that button isn't like-for-like.
- `/boot` skill step 7 (`-mindepth 2`) returns nothing: evidence notes are flat files.

## Seal gate
None in this pass (no commit/push). Ship via `/ship` after verifier SEAL.
