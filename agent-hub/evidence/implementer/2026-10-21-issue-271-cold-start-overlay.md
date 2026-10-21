# 2026-10-21 - issue-271-cold-start-overlay

- Worker: implementer (v0.1.0)
- Node: `issue-271-cold-start-overlay` (`haven/diagrams/dev-loop.prime-mermaid.md`, appended IN_PROGRESS)
- Task (verbatim, via `/todo`): "khi \"The server is starting up, please wait ~30 seconds\" thì show loading full sreen và ko cho thao tác bậy" → issue [#271](https://github.com/datvt243/resume-vuejs-website/issues/271)
- Status: `sealed_pending_verifier`

## Hub bytes before: 198836
Measured right after appending this node's row. The measured set is `NORTHSTAR.md`, `CLAUDE.md`, all of `doctrine/`, the active diagram and all of `haven/workers/`.

## Branch
`feature/issue-271-cold-start-overlay`, created with `gh issue develop` from `staging` `44c5509` (after fetch and pull).

## Diff
| File | Why |
|---|---|
| `src/components/Spinner.vue` | In cold-start state (request pending ≥3s) the container gets the `.cold-start` class: `inset: 0`, `pointer-events: auto`, `bg-black/50`, notice centered, z-index 1080 (above Modal 1055). It also sets `aria-busy="true"`. Exposes `isColdStart` (guarded by `isLoading`). The first 3s keep the old non-blocking bar and corner notice. The header comment and CSS comment were updated to match. |
| `src/App.vue` | `<div class="clearfix" :inert="refSpinner?.isColdStart">` blocks keyboard focus and typing in the app while the overlay is up; the overlay alone only blocks pointer input. |
| `src/components/Spinner.spec.ts` | New test: no `cold-start` class and `isColdStart=false` at 2s; class, `aria-busy="true"` and `isColdStart=true` at 3s; `isColdStart=false` after `hide()`. |
| `DESIGN.md` §5.9 | Adds the exception to "No full-page spinner over content": cold start ≥3s uses a blocking overlay plus `inert`. Without it, DESIGN.md would contradict the operator's request. |

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npx vitest run src/components/Spinner.spec.ts`, `npm run test`, `npm run build`, `npm run lint`. Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
```
 ✓ src/components/Spinner.spec.ts (6 tests) 25ms
      Tests  6 passed (6)
```
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 11ms
 Test Files  1 failed | 39 passed (40)
      Tests  1 failed | 256 passed (257)
```
The single failure is the known pre-existing one (cited in the issue-266/262/251 seal notes). The issue-266 seal baseline was `1 failed | 255 passed (256)`, so +1 is this new test.
`npm run build`: `✓ built in 3.65s`
`npm run lint`: no problems. Output ends at `> eslint src --ext .js,.ts,.vue`.

## Manual check (Playwright on `npm run dev`, real browser, `#/login`)
I called the root `refSpinner.show()`, waited, then called `hide()`:
- At 0.5s: `cls: "spinner-container"`, `inert: false`, so it is non-blocking.
- At 3.5s: `cls: "spinner-container cold-start"`, `inert: true`, overlay rect `1495×935` equal to the viewport `1495×935`, `bg: rgba(0, 0, 0, 0.5)`. `elementFromPoint` over `#email` hits the overlay (`hitIsOverlay: true`), and `email.focus()` is refused (`focusBlocked: true`). The text reads "26 / The server is starting up, please wait ~30 seconds / The free tier sleeps whe…".
- After `hide()`: overlay gone, `inert: false`, `#email` focusable again (`canFocus: true`).

## Acceptance
| Criterion | Evidence |
|---|---|
| Full-screen loading during the cold-start notice | Overlay rect equals the viewport, dimmed background, centered countdown notice |
| No interaction while it shows (mouse and keyboard) | `hitIsOverlay: true`, `focusBlocked: true`, `inert: true` |
| Released when the request ends | After `hide()`: no overlay, `inert: false`, `canFocus: true`. Spec asserts `isColdStart=false`. |
| Short requests unchanged | At 0.5s, no `cold-start` and no `inert`; spec at 2s |
| No regressions | `1 failed \| 256 passed (257)`, only the known failure; `✓ built in 3.65s`; lint clean |
| Comments per code-comments.md | 2 `//` WHY comments (expose of `isColdStart`, the `.cold-start` CSS block); header and CSS comment corrected to match behaviour. No issue refs. |

## Noticed, not done
- `Modal.vue` teleports to `<body>`, outside the inert `.clearfix`. The overlay (z 1080 > 1055) still blocks clicks on an open modal, but Tab could still reach controls inside it. Cold start almost always happens on first load or login, with no modal open.
- `Toasts.vue` stays outside `inert` on purpose, so the toast for a failed request after the wait stays usable.

## Seal gate
None. No commit, push or API write.
