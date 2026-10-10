# 2026-10-10 - issue-187-unsaved-modal-warning — REOPEN

- Worker: verifier
- Version: 0.1.0
- Node: `issue-187-unsaved-modal-warning` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- New PM status: unchanged, stays `IN_PROGRESS` (REOPEN, no PM write)
- Evidence reviewed: `evidence/implementer/2026-10-10-issue-187-unsaved-modal-warning.md`

## Isolation proof
Separate Agent-tool subagent spawned by the implementer session. The spawn prompt stated "You are a fresh verifier subagent ... You did NOT write the diff under review" and passed the task string `verifier "agent-hub/evidence/implementer/2026-10-10-issue-187-unsaved-modal-warning.md — #187 [ENHANCEMENT] ... Branch: feature/issue-187-unsaved-modal-warning"`. This context holds no memory of writing the diff; the diff was not opened (EvidenceOnly).

## Reasoning
| Criterion | Verdict | Cited |
|---|---|---|
| Branch (NoMainEdit) | OK | `feature/issue-187-unsaved-modal-warning`, off `origin/staging` `3294f1c` |
| Commands match doctrine | OK | `npm run test`, `npm run build`, `npm run lint`, `Typecheck: CANNOT RUN — pending add-typecheck-script` |
| Output not truncated | OK | verbatim lines quoted |
| Esc on dirty form → confirm, cancel keeps open | OK | spec fails on base (`× ... stays open when the user cancels`), passes on branch (`Tests  8 passed (8)`) |
| Dismiss button (X / "Đóng") on dirty form → confirm | OK | spec fails on base, passes on branch |
| Clean form / save-then-hide / reload clears dirty / no stacked confirms | OK | named specs, `8 passed` |
| **Click outside (backdrop) → confirm** | **MISSING** | Node scope names "backdrop" explicitly; the issue lists "click ra ngoài". Note's own row: "Not separately tested". Noticed #1 says the backdrop handler is "Probably dead ... Inferred from CSS, not observed live." No citable evidence either that it confirms or that outside-click is a no-op. |
| Build green | OK | `✓ built in 3.62s` |
| Lint clean | OK | exit 0 (after fixing 2 spec errors) |
| Test suite | OK (disclosed) | `1 failed | 175 passed (176)`, the failing VI \| EN toggle spec reproduced on base via `git stash`; flaky, pre-existing (#182). One unexplained `2 failed` run disclosed. |
| comments per code-comments.md | OK | WHY-only comments listed per file, no issue refs |
| `## Seal gate` section | MISSING (format) | `evidence/README.md` requires the section ("or none"); absent. No outward action was taken, so not a gate breach. |

Forbidden states: ADHOC_WORK no (node exists) · NO_EVIDENCE no · EDIT_UNVERIFIED **yes, backdrop-click path claimed as routed through `requestClose()` but unverified** · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row IN_PROGRESS) · MAIN_EDIT no.
Proportionality: diff limited to Modal/VeeForm/swal + one spec; no untasked fixes. OK.

## Missing
1. Citable evidence for the click-outside case (node scope "backdrop"). Either: a spec that clicks the actual outside-dialog target (the `.modal` root, not just `.modal-backdrop`) and asserts the confirm / close behavior; or a live `npm run dev` observation. If outside-click truly never closes the modal, say so with observed evidence and fix or rescope the acceptance row. Right now the note only infers it from CSS.
2. Add the `## Seal gate` section (`none` is fine).

## Re-run
none — audit-only; the REOPEN comes from a gap in the note, not from a broken output, so re-running would not change the verdict.
