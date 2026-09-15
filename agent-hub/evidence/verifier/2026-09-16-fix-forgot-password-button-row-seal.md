# 2026-09-16 — fix-forgot-password-button-row — SEAL

- Worker: verifier
- Node: `fix-forgot-password-button-row`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row for this node — status
  column changed IN_PROGRESS → SEALED, findings appended to the END of
  the row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Launched as a fresh, isolated subagent (Agent tool spawn) whose task
explicitly states: "You are a fresh, isolated subagent for the
resume-vuejs-website agent-hub... You are NOT continuing any prior
conversation and have no memory of any implementer session. A separate
implementer session wrote a diff and evidence note; you are verifying it
independently. This satisfies NeverVerifyOwnWork by construction (you
never touched the diff)." This session's first actions were loading
`manifest.yaml`/`SOUL.md`/`recipes/verify_seal.md` fresh, then reading
the implementer's evidence note before touching any diff content. This
session wrote no part of the diff under review. `NeverVerifyOwnWork`
satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state:

1. **Branch**: `git branch --show-current` → `fix/forgot-password-button-row`
   — not `main`/`staging`. `git status` confirms it's tracking
   `origin/staging`. `NoMainEdit` satisfied.
2. **Unrelated branch left alone**: `git stash list` shows
   `stash@{0}: On fix/forgot-password-button-row: wip:
   register-login-autofill-autocomplete (belongs on
   fix/register-login-autofill-autocomplete)` — confirmed still stashed,
   untouched, matching the note's claim it was stashed before this branch
   was created and kept separate.
3. **Diff shape**: `git diff --stat -- src/pages/auth/PageForgotPassword.vue`
   → `1 file changed, 5 insertions(+), 2 deletions(-)` (` | 7 +++++--`) —
   exact match to the note's `## Acceptance` row.
4. **Build**: re-ran `npm run build` myself from repo root → `✓ built in
   3.19s`, only the pre-existing "chunks are larger than 500 kB"
   advisory, no errors. Matches the note (`✓ built in 3.26s`, same
   advisory only — timing differs trivially, content identical).
5. **Live DOM check, independently reproduced from scratch** (did not
   reuse the note's own script or numbers as anything but a target):
   found the CDP debug session alive (`curl localhost:9888/json/version`
   succeeded). The listed `/login` target had actually drifted to an
   authenticated `#/dashboard/information` view since the implementer's
   pass, so a plain click-search for "Quên mật khẩu?" first failed
   (link not present on the dashboard). Cleared `localStorage`
   (`token`/`user`) via `Runtime.evaluate` and navigated to
   `#/login` to force a real logged-out state, then wrote a fresh
   Node/WebSocket CDP script to click the actual "Quên mật khẩu?" nav
   link (not `Page.navigate` straight to `/forgot-password`, which this
   app's hash routing does not resolve directly). Confirmed
   `location.href` actually changed from `.../#/login` to
   `.../#/forgot-password` after the click — real SPA navigation, not a
   deep link. Read back:
   - `.footer` computed `display` = `"flex"`
   - button "Gửi yêu cầu" rect: `y=492.9375, height=38` → centerY
     `511.9375`
   - link "Quay lại đăng nhập" rect: `y=503.9375, height=16` → centerY
     `511.9375` (identical to the button's centerY)
   - link computed `fontSize` = `"12px"`
   - link `className` = `"ms-auto self-center text-xs"`

   This is an exact, independently-reproduced match to every number the
   note cites — button and link share the same row (`.footer` is flex)
   and the same vertical center, and the label is `text-xs`/12px, not
   `text-sm`/14px.
6. **Lint**: re-ran `npm run lint` myself → exit 0, no output beyond the
   npm header. Matches.
7. **Test**: re-ran `npm run test` 3 times. Runs 2 and 3: `Test Files 16
   passed (16)` / `Tests 111 passed (111)`, matching the note exactly.
   Run 1 showed one flaky failure in `VeeForm.spec.ts:92`
   (`button.btn-success` disabled-attribute timing check) — confirmed
   this file/class is unrelated to `PageForgotPassword.vue` (diff never
   touches `VeeForm.vue`), and the same test file is already documented
   as sometimes-flaky in the prior sealed node
   `tailwindcss-post-ship-review-fixes`'s verifier note ("the
   sometimes-flaky `VeeForm.spec.ts`"). Not a regression introduced by
   this diff — noted here for the trail, doesn't change the verdict.
8. **Forbidden states** (all 6 checked):
   - `ADHOC_WORK` — node existed on `dev-loop.prime-mermaid.md` at
     IN_PROGRESS before this pass, implementer worker was used. Clear.
   - `NO_EVIDENCE` — implementer note exists, read first. Clear.
   - `EDIT_UNVERIFIED` — every claim above independently re-run and read
     back (build, lint, test x3, and a from-scratch CDP reproduction),
     not inferred from the note. Clear.
   - `CODE_IN_HAVEN` — `git status` shows only `.md` files touched under
     `haven/`/`evidence/` (the diagram row and this note); the only code
     file touched is `src/pages/auth/PageForgotPassword.vue`, outside
     `haven/`. Clear.
   - `DIAGRAM_DRIFT` — diagram row existed at IN_PROGRESS matching this
     diff; updated to SEALED as part of this pass, in place, findings
     appended to the end, no reordering. Clear.
   - `MAIN_EDIT` — branch confirmed `fix/forgot-password-button-row`,
     cut from `origin/staging`. Clear.
9. **Seal gate**: no commit/push/merge in scope of this pass (the note
   states this explicitly and `git status` shows only unstaged/untracked
   changes, nothing pushed) — nothing to gate here; merging into
   `staging` remains a separate, later `/ship` action.
10. **Proportionality**: diff touches exactly one file
    (`PageForgotPassword.vue`), 5 insertions/2 deletions, matching
    precisely what the task asked for (move the link into the row, shrink
    its text) — no unrelated changes, no scope creep.

## Missing
None. Every acceptance criterion in the note (same row, smaller label
text, no unrelated change, green build) has citable,
independently-reproduced evidence — including the live DOM geometry and
font-size, re-derived from scratch via a fresh CDP script against the
still-running debug session rather than trusted from the note's own
numbers.

## Re-run
`full` — reason: outward-facing risk is low (no commit/push this pass),
but this node's acceptance criteria are UI-layout/visual claims (same
row, smaller text) that only a live DOM check can actually confirm —
per `doctrine/MEMORY.md`'s "Re-run scope" exception 2, and per the
task's own explicit instruction to re-run build and re-check the live DOM
rather than just audit the note. Re-ran: `npm run build`, `npm run lint`,
`npm run test` (x3), and a from-scratch CDP script driving real SPA
navigation and DOM/computed-style reads.

## Hub bytes
before=209190 (from the implementer note's `## Hub bytes before` line:
root=12569, doctrine=27207, active diagram=143297, implementer
bundle=14963, verifier bundle=11154) · after=212703 (measured via the
same 5 categories, AFTER updating this node's PM status to SEALED:
root=12393, doctrine=27207, active diagram=146986, implementer
bundle=14963, verifier bundle=11154 — this SEAL's findings appended in
place to the `fix-forgot-password-button-row` row; no recipe/manifest/
SOUL changes this pass).
