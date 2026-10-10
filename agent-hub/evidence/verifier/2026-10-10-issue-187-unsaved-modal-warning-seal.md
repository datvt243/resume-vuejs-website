# 2026-10-10 - issue-187-unsaved-modal-warning — SEAL (round 2)

- Worker: verifier
- Version: 0.1.0
- Node: `issue-187-unsaved-modal-warning` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- New PM status: `IN_PROGRESS` → `SEALED` (row updated in place)
- Evidence reviewed: `evidence/implementer/2026-10-10-issue-187-unsaved-modal-warning.md` (round 1 + `## Seal gate` + `## Round 2`)
- Prior verdict: `evidence/verifier/2026-10-10-issue-187-unsaved-modal-warning-reopen.md` (kept, not overwritten)

## Isolation proof
Separate Agent-tool subagent spawned by the implementer session for the round-2 pass. Spawn prompt: "You are a fresh verifier subagent ... You did NOT write the diff under review", task string `verifier "agent-hub/evidence/implementer/2026-10-10-issue-187-unsaved-modal-warning.md (round 2, after REOPEN) — #187 [ENHANCEMENT] ... Branch: feature/issue-187-unsaved-modal-warning"`. This context holds no memory of writing the diff and did not open it (EvidenceOnly). It is also a different context from the round-1 verifier.

## Prior REOPEN reasons
| # | Reason | Addressed? | Cited |
|---|---|---|---|
| 1 | Click-outside path unverified (`EDIT_UNVERIFIED`) | Yes | Headless Chrome on shipped `dist` CSS: `RESULT elementFromPoint(5,5)=.modal.draggable.show \| z(.modal)=1055 z(.modal-backdrop)=1050` — observed, not inferred: outside clicks hit the `.modal` root, so outside-click was a no-op on `staging`. Fixed in `onRootClick` (+ mousedown-origin check). Specs "a click outside the dialog (on the .modal layer) asks on a dirty form" and "a click outside closes a clean form without asking" fail on `HEAD` (`5 failed \| 7 passed (12)`), pass on branch (`12 passed (12)` ×5). |
| 2 | Missing `## Seal gate` section | Yes | `## Seal gate` → "none — no commit/push/merge/real API call taken." |

## Reasoning
| Criterion | Verdict | Cited |
|---|---|---|
| Branch (NoMainEdit) | OK | `feature/issue-187-unsaved-modal-warning`, off `origin/staging` `3294f1c` |
| Commands match doctrine | OK | `npm run test`, `npm run build`, `npm run lint`, `Typecheck: CANNOT RUN — pending add-typecheck-script` |
| Output not truncated | OK | verbatim result lines quoted, both rounds |
| Esc on dirty form → confirm, cancel keeps open | OK | spec fails on HEAD, passes on branch |
| Dismiss button (X / "Đóng") on dirty → confirm, confirm closes | OK | spec fails on HEAD, passes on branch |
| Click outside (backdrop) → confirm on dirty / closes clean | OK | see reason #1 above |
| No accidental close (drag-select, inside click) | OK | specs "a drag that starts inside the dialog…", "a click inside the dialog body…" |
| Clean form / save-then-hide / reload clears dirty / no stacked confirms | OK | named specs, `12 passed (12)` |
| Test suite | OK (disclosed) | `1 failed \| 179 passed (180)` / `2 failed \| 178 passed (180)`: both failures are `VeeForm.spec.ts` tests shown failing on base (VI \| EN toggle, 6/6 base runs) or already documented flaky ("typing then clearing", per `2026-10-10-issue-181-delete-confirm-message.md`) |
| Build green | OK | `✓ built in 3.94s` |
| Lint clean | OK | exit 0 |
| comments per code-comments.md | OK | WHY-only `/** */` + `//` listed per file, no issue refs |

Forbidden states: ADHOC_WORK no · NO_EVIDENCE no · EDIT_UNVERIFIED no (click-outside now observed + spec'd) · CODE_IN_HAVEN no · DIAGRAM_DRIFT no · MAIN_EDIT no.
Seal gate: no outward action taken; `/ship` remains a separate gated step.
Proportionality: wiring outside-click on the `.modal` root is new behavior on `staging`, but it is the issue's own named path ("click ra ngoài") and the round-1 REOPEN explicitly offered "fix or rescope". Diff stays inside Modal/VeeForm/swal + one spec. The note flags it as a behavior change for the operator. OK.

## Operator notes (from the note, not blocking)
- Clicking outside a modal now closes it (with confirm when dirty); before, it did nothing.
- Live SweetAlert2 popup and CKEditor/datepicker normalization paths were not observed in a browser (spec mocks swal).
- Pre-existing flaky `VeeForm.spec.ts` "VI | EN toggle" test is worth its own issue.

## Re-run
none — audit-only; outputs are verbatim, commands match doctrine, every criterion is cited, and the node is not outward-facing.
