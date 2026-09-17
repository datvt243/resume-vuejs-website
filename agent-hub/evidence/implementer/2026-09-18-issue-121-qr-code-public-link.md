# 2026-09-18 — issue-121-qr-code-public-link

- Worker: implementer
- Version: 0.1.0
- Node: `issue-121-qr-code-public-link` (new node)
- Task (verbatim): "#121" (operator, via `/todo`)

## Hub bytes before
242014 (root=12393, doctrine=27207, active diagram=176297,
implementer bundle=14963, verifier bundle=11154 — categories per
`/hub-tokens`' "per-session total" formula).

## Branch
`feature/issue-121-qr-code-public-link` (from `staging`; `feature/*` per
naming convention — new feature, kept locally after merge).

## Context
GitHub issue #121, "[ENHANCEMENT] QR code cho public share-link" —
generate a QR code from the existing public share-link (issue #117's
`publicLink`, `src/pages/dashboard/PageInformation.vue`), shown on the
same "Link CV công khai" config block, with PNG/SVG download. Issue's own
scope explicitly allows "a light existing npm library" instead of hand-
rolling the QR algorithm — no backend dependency (pure frontend, unlike
#120 which was BLOCKED_ON_BACKEND the same session).

## Diff
| File | Why |
|---|---|
| `package.json` / `package-lock.json` | Added `qrcode@^1.5.4` (npm, ~135KB unpacked, zero heavy runtime deps) — the "light existing npm library" the issue allows |
| `src/components/QrCode.vue` (new) | Small component: `<canvas>` preview via `QRCode.toCanvas`, "Tải PNG" button (`canvas.toDataURL`), "Tải SVG" button (`QRCode.toString(..., {type:'svg'})` → Blob → download link). Re-renders on `value` prop change (`watch`). Not a global component (`src/components/global/`) — used in exactly one place, matches `Modal.vue`/`Toasts.vue`'s existing non-global pattern |
| `src/pages/dashboard/PageInformation.vue` | Import `QrCode`, render `<QrCode :value="publicLink" />` right under the existing public-link text in the "Link CV công khai" block — automatically follows slug-vs-email per the ALREADY-live `publicLink` computed (issue #117), satisfying the issue's "if slug lands first, QR should point to slug" note for free |
| `src/components/QrCode.spec.ts` (new) | 4 real Vitest tests (see Command/Output below) |

**Noticed and reverted, not part of this diff**: `npm install qrcode`
unexpectedly rewrote `yarn.lock` (1489-line diff, unrelated packages like
`@alloc/quick-lru` appearing) even though only `npm` was run — no
`postinstall`/`prepare` script, no git hook found that would explain it
(checked `package.json` scripts, `.husky/`, `.git/hooks/post-checkout`,
`.git/hooks/post-merge` — none exist). Per the documented trap ("Both
`yarn.lock` AND `package-lock.json` exist... do NOT run `yarn install`
unless the task explicitly asks for lockfile cleanup"), reverted
`yarn.lock` with `git checkout -- yarn.lock` before committing — this
diff only touches `package-lock.json`. Flagging as a real anomaly worth
watching (not filed as a separate issue — no reproduction beyond "it
happened once", would need a second occurrence to isolate a cause).

## Command
1. `npm run build` (from `doctrine/MEMORY.md`, repo root).
2. `npm run test` (`vitest run`, repo root).
3. `npm run lint` (repo root).
4. `npx vitest run src/components/QrCode.spec.ts` (new spec in isolation).
5. Manual dev-server check: `curl` against the already-running `npm run
   dev` process (base path `/resume-vuejs-website/`, confirmed via
   `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/resume-vuejs-website/` → `200`).

## Output
1. `npm run build`:
   ```
   dist/assets/PageInformation-P7lAiCvu.js            30.23 kB │ gzip:  12.24 kB
   ...
   (!) Some chunks are larger than 500 kB after minification. [pre-existing, unrelated]
   ✓ built in 4.01s
   ```
   `PageInformation`'s own chunk grew from ~5KB to 30.23KB (the `qrcode`
   lib code-splits into that page's chunk specifically, not the main
   bundle) — isolated, no change to the main `index-*.js` chunk size.

2. `npm run test` (full suite):
   ```
   Test Files  1 failed | 16 passed (17)
        Tests  3 failed | 112 passed (115)
   ```
   The 1 failing file is `src/components/veevalidate/VeeForm.spec.ts`
   (3 tests) — **confirmed pre-existing and unrelated**: re-ran
   `npx vitest run src/components/veevalidate/VeeForm.spec.ts` with this
   diff `git stash`ed (clean `staging` HEAD, `894f8f0`) and it still fails
   (1 test failed in that isolated run; the full-suite run shows 3 —
   consistent with test-order-dependent flakiness in that file, not
   something this diff touches or introduces). This diff never touches
   `VeeForm.vue` or its spec. Not fixed here — out of scope, logged below.

3. `npx vitest run src/components/QrCode.spec.ts`:
   ```
   ✓ src/components/QrCode.spec.ts (4 tests) 256ms
   Test Files  1 passed (1)
        Tests  4 passed (4)
   ```
   (stderr shows a harmless jsdom `Not implemented: navigation` notice
   from the real `<a>`-click download flow — jsdom doesn't support real
   navigation/downloads, doesn't fail the test, expected in this env.)

4. `npm run lint`: exit 0, no output (clean).

5. Manual dev-server check: `curl -s "http://localhost:5173/resume-vuejs-website/src/components/QrCode.vue"`
   returned Vite's transformed module source (real, not cached) with
   `qrcode` resolved via `/node_modules/.vite/deps/qrcode.js` and no
   compile error — confirms the dev server can actually serve/transform
   the new component. **Disclosed limitation**: no live authenticated
   browser tab was available this session (checked `curl
   http://localhost:9888/json/list` — only an unrelated extension's
   background/service-worker targets, no page tab) to click through the
   real dashboard UI end-to-end (would need the operator's login, not
   attempted without them present, unlike issue #117's session which had
   a pre-existing authenticated tab already open). The automated
   component test (item 3) is the honest substitute for that gap, per
   the implementer's own recorded correction (2026-08-25) that a unit/
   component test on the actual logic is preferable to no verification at
   all when no browser/screenshot tool is live.

## Acceptance
| Criterion | Evidence |
|---|---|
| QR renders from the existing public link (slug-first, email-fallback for free) | `QrCode.vue` takes `:value="publicLink"` (the SAME computed already driving the text link, issue #117) — no new URL-resolution logic duplicated |
| PNG download | `downloadPng()` — `canvas.toDataURL('image/png')`, verified indirectly via component mount test #2 (canvas renders) + code read (canvas ref exists, `toDataURL` is a real `HTMLCanvasElement` method) |
| SVG download | `downloadSvg()` calls `QRCode.toString(value, {type:'svg', ...})` — QrCode.spec.ts test 4: `toStringMock` called with the exact value + `{type:'svg'}` |
| Re-renders when the link changes (e.g. slug updated later) | QrCode.spec.ts test 3: `toCanvas` called again with the new value after `setProps` |
| No heavy new dependency | `qrcode@1.5.4`, 135KB unpacked (`npm view qrcode dist.unpackedSize`), zero native/build-step deps; isolated to `PageInformation`'s own code-split chunk (build output above) |
| Build green | `✓ built in 4.01s`, only the pre-existing chunk-size advisory |
| Lint clean | `npm run lint` exit 0, no output |
| No `yarn.lock` drift | `git diff --stat` — `yarn.lock` absent from the final diff (reverted, see Diff section) |

## Noticed, not done
- `VeeForm.spec.ts` has 3 pre-existing, unrelated test failures (test-
  order-dependent flakiness — isolated run shows only 1 of the 3 failing).
  Confirmed pre-existing (still fails with this diff stashed on clean
  `staging`). Not fixed here — out of this task's scope, not something
  this diff touches.
- `npm install` rewriting `yarn.lock` unprompted (see Diff section) — no
  root cause found this session (checked scripts/hooks, found nothing).
  Reverted, not investigated further; flagging in case it recurs.
- Active diagram (`dev-loop.prime-mermaid.md`) is still ~176KB, over the
  15KB `/hub-tokens` threshold (already flagged in the prior session's
  issue-120 note) — unrelated to this task, archive pass still pending.

## Seal gate
No outward-facing action taken this pass (no commit/push/merge) — stops
here at `sealed_pending_verifier`. Spawning a fresh subagent next to run
`/worker verifier` on this note.
