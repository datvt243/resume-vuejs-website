# 2026-10-19 - issue-224-remaining-pages - REOPEN

- Worker: verifier
- Version: 0.1.0
- Node: `issue-224-remaining-pages` (`haven/diagrams/dev-loop.prime-mermaid.md`, stays `IN_PROGRESS`)
- Note under review: `evidence/implementer/2026-10-19-issue-224-remaining-pages.md`

## Isolation proof
Spawned as a separate subagent by the implementer session for #224, with the task string "fresh verifier ... you were spawned as a separate subagent by the implementer session ... You did not write the diff." This context did not write the diff; it only read the note plus pre-existing (staging) code to check the note's stated blocker.

## Verdict: REOPEN

## Cited (have evidence)
- ATS / Import / Preview / Public / Auth / Spinner-overlay / sweep rows: live Playwright observations + spec runs + grep results in the note.
- Commands match `doctrine/MEMORY.md`: `npm run lint` (exit 0), `npm run test` (1 failure, the known pre-existing `VeeForm.spec.ts` VI|EN toggle, same as #220-#223), `npm run build` (green). Typecheck stated CANNOT RUN. Output not truncated.
- Branch `feature/issue-224-remaining-pages` (not main/staging). No outward-facing action, so no seal gate needed.
- Comments per code-comments.md row present.

## Missing
1. **"Spinner.vue: ... first load dùng skeleton"** (issue #224, Spinner checkbox) is marked **Partial** — public page only. The reason given is wrong: "Dashboard pages have no loading flag ... `useCandidate` would have to expose its `handleBase` loading state, which is a composable change." A loading signal already exists without any composable/store change:
   - `src/App.vue:63-64` provides `refSpinner` as `'spinner'`; `useHelper()` already returns it as `loading`; `useCandidate.getData` already routes its fetch through that same ref (`handleBase(..., { loading })`, `src/services/base.ts:47,59` calls `show()`/`hide()`).
   - `Spinner.vue` (in scope of this issue) keeps `isLoading` internally but only `defineExpose({ show, hide })`. Exposing `isLoading` there is a presentation-component change, and pages can then read `useHelper().loading.value?.isLoading` to render a skeleton — no API/store/composable/routing/validation touched.
   So the criterion is reachable inside the issue's constraints; it is a gap, not a constraint conflict.
2. **Regression this diff introduces** (from the note's own "Noticed" list): "Before data loads, list pages show their empty state ('Chưa có … nào')". The old full-page overlay hid that during first load; this diff removes the overlay, so users now see a false "no data" state for the whole Render cold start (~30 s). That is exactly what the skeleton criterion exists to prevent, so shipping the overlay removal without it is a net UX regression.

## Forbidden states
No other forbidden state hit (branch OK, no MAIN_EDIT, no outward action, commands match doctrine, output verbatim). forbidden_hit: null. Reason is an acceptance criterion without evidence (SOUL invariant 2).

## To SEAL next pass
- Dashboard first-load skeleton (at least list pages + Information/General) driven by the existing spinner state, so no empty state shows while the first fetch is running — Spinner/page markup only.
- Evidence: a spec or live observation that a list page shows the skeleton (not "Chưa có … nào") while loading, and the empty state only after a fetch returns []. Re-run lint/test/build.

## Re-run
none — audit only; the note's outputs are verbatim and match doctrine. Only read pre-existing code (`App.vue`, `useHelper.ts`, `useCandidate.ts`, `base.ts`, staging `Spinner.vue`) to test the note's stated blocker, no commands re-run.
