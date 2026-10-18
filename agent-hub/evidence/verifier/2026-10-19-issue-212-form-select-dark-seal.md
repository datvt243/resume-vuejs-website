# 2026-10-19 - issue-212-form-select-dark - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-212-form-select-dark` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Input: `evidence/implementer/2026-10-19-issue-212-form-select-dark.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a separate Agent-tool subagent by the implementer session for task #212, with the prompt "You are a fresh verifier subagent ... You did NOT write this diff. Invoke the Skill tool with skill \"worker\" and args: verifier \"agent-hub/evidence/implementer/2026-10-19-issue-212-form-select-dark.md\"". This context holds no record of writing the diff. It read only the evidence note, not `src/`.

## Re-run
`none`: audit only. The output in the note is verbatim and not truncated, the commands match `doctrine/MEMORY.md`, and the node is not outward-facing.

## Commands check (step 4-5)
- `npm run test`, `npm run build` from repo root match MEMORY.md.
- Typecheck is stated as CANNOT RUN, with a reason. OK.
- Output is not truncated: test summary lines, failing test names, `✓ built in 5.67s`.

## Acceptance (cited from the note)
| Criterion | Cited | OK |
|---|---|---|
| Select readable in dark mode | computed `dark: bg rgb(33, 37, 41), color rgb(222, 226, 230)` on an injected `form-select form-select-sm w-auto`, with screenshot | yes |
| Light mode unchanged | computed `light: bg rgb(255, 255, 255), color rgb(33, 37, 41)` | yes |
| Class survives purge | safelist entries + `grep -c "form-select" dist/assets/index-BV1yHvIc.css` → `1` | yes |
| Build green | `✓ built in 5.67s` | yes |
| No new test failure | Only `VeeForm.spec.ts` fails. The same spec fails on a clean `origin/staging` worktree (`2 failed / 13 passed`), and run alone on this branch it also gives `2 failed / 13 passed`. The failing set changes between runs, so the spec is flaky and the failure was there before this diff. | yes |
| Comments per code-comments.md | One WHY comment above `.form-select`, no issue refs. The wrong "Skipped (confirmed unused)" comment was corrected. | yes |

Limit the note states itself: the real pages (PageHome, PagePreview, PageAtsCheck, PageInformation) were not checked while logged in. The class was checked in isolation. All 5 usages are the same class string (grep cited), so the isolated check covers them.

## Forbidden states
- `ADHOC_WORK`: no. The node row exists, and the work went through the implementer worker.
- `NO_EVIDENCE`: no. The note exists.
- `EDIT_UNVERIFIED`: no. Build, test, and computed styles were read back.
- `CODE_IN_HAVEN`: no. Only a `.md` row was added under `haven/`.
- `DIAGRAM_DRIFT`: no. The row is updated to SEALED by this pass.
- `MAIN_EDIT`: no. The branch is `fix/issue-212-form-select-dark`, cut from `staging`.

## Seal gate
Nothing outward-facing in this pass (no commit/push). Ship with `/ship`.

## Proportionality
The diff touches 2 source files: `tailwind.css` and the safelist. The `color-scheme` addition is in scope because the open option list is part of the select's dark-mode readability, and DESIGN.md §2.1 already asks for it. The note discloses that it also affects other native controls. It folds in no unrelated fix.

## Follow-ups (from the note, not blocking)
- `VeeForm.spec.ts` is flaky and failing on `staging`. It needs its own issue.
