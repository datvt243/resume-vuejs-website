# 2026-11-06 — issue-409-profile-modal-layout — SEAL (round 2)

- Worker: verifier · Version: 0.1.0
- Node: `issue-409-profile-modal-layout`
- Evidence reviewed: `evidence/implementer/2026-11-06/issue-409-profile-modal-layout-plan.md` (round 1 + `## Round 2`)
- Prior verdict: `evidence/verifier/2026-11-06/issue-409-profile-modal-layout-reopen.md` (kept, not overwritten)

## Isolation proof
Separately spawned Agent subagent (fresh context) for REOPEN round 2, launched with the task "You are a fresh, isolated verifier session ... This is REOPEN round 2: the previous verdict is agent-hub/evidence/verifier/2026-11-06/issue-409-profile-modal-layout-reopen.md; the implementer appended a \"## Round 2\" section ... You did NOT write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-06/issue-409-profile-modal-layout-plan.md"`. This context did not write the diff and did not open it (no `src/` reads).

## Verdict: SEAL

## Prior REOPEN items — resolved
1. **DESIGN.md §10 Vercel Web Interface Guidelines pass** — Round 2 §1: `web-design-guidelines` skill run, rules fetched fresh (191 lines), applied to PageProfile.vue + VeeForm.vue with a file:line | rule | result table. 1 real violation found (sticky bar covering focused controls, measured 870 > 798 at 1440, 755 > 730 at 375), fixed with `[&_*]:scroll-mb-20` on VeeForm's `<form>`, re-measured over a 26-Tab pass: covered `[]` at 1440 and 375. Out-of-scope items (Modal.vue overscroll-behavior) stated with reason.
2. **Create/clone on final code** — Round 2 §2: 6 runs (light 1440, dark 1440, dark 375 × create, clone), titles cited, cb.left > box.left, `inside: true` 6/6. Screenshots `after3-*` exist in `issue-409-shots/` (listed). I opened `after3-light-1440-create.png`: "Thêm profile", checkboxes inside bordered lists, Hủy/Lưu at dialog bottom, no clipping. Body opens scrolled (disclosed in note: Modal.vue keeps scroll position — pre-existing, listed under Noticed).

## Cited (OK)
- Branch `fix/issue-409-profile-modal-layout` (off `staging` @ d9f88bf); `git branch --show-current` confirms. No MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`, final round outputs: build `✓ built in 4.27s` (+ `scroll-mb-20` in built CSS), lint exit 0, test `56 passed (56)` / `364 passed (364)`, typecheck 81 ≤ baseline 90, 0 in VeeForm/PageProfile. Not truncated.
- Round 2 self-correction: round-1 typecheck predated the new spec; TS2488 in VeeForm.spec.ts found and fixed (`Array.from`), recount 81. Honest and resolved.
- Issue #409 acceptance (gh issue view 409):
  1. What's hidden + desktop/mobile screenshots — before table 1366×768 / 390×844 + before-desktop/mobile.png.
  2. Name at top; Save/Cancel always visible — name top 128/108; bar bottom < dialog bottom at scroll top and end, all 12 runs (sticky bar instead of Modal `#footer`, justified).
  3. No nested scroll; long lists usable — `nested: 0` all runs; select-all/clear kept.
  4. Tokens, no `--bs-*` — token grep on added lines → exit 1 (re-run in round 2).
  5. Edit, create, clone; light + dark — round 1 table + round 2 create/clone re-measure on final code.
- DESIGN §10: tokens, one primary action, empty state, keyboard pass (focus order + now unobscured focus), screenshots 1440 light/dark + 375 dark, lint/test/build, guidelines pass — all cited.
- Comments per code-comments.md: VeeForm slot why-comment, PageProfile comment rewritten, +1 why-line for `scroll-mb-20`.
- Supersedes: none; Still open: none — only one #409 row on the active diagram.
- Seal gate: none (no commit/push/API write).
- Proportionality: VeeForm default slot (minimal for ordering) + `scroll-mb-20` (fixes a guideline violation caused by VeeForm's own sticky bar, so it belongs there); spec +1 test. Within scope.

## Missing
none

## Forbidden hit
none

## Re-run
none — audit only; note output matches doctrine, not truncated.

## PM status
`IN_PROGRESS` → `SEALED`; full row archived to `haven/diagrams/dev-loop-archive.md`, active row collapsed to pointer; oldest pointer (`issue-354-public-cv-experience-order`) dropped to keep ≤ 20.

## Hand-off for /ship
Issue criterion 1 wants screenshots in the PR; shots are gitignored — attach `before-*`, `after2-*-edit`, `after3-*` by hand.
