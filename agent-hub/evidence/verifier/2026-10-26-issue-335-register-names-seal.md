# 2026-10-26 — issue-335-register-names — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-335-register-names` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Audited note: `evidence/implementer/2026-10-26-issue-335-register-names.md`

## Isolation proof
Spawned as a fresh subagent by the `/todo` orchestrator with the task "You are a fresh verifier ... You did NOT write this diff" and the instruction to run `/worker verifier "agent-hub/evidence/implementer/2026-10-26-issue-335-register-names.md"`. This context has no implementer turns. The diff was not opened; only the note, the diagram row, doctrine and prior evidence were read.

## Verdict: SEAL

## Cited
| Check | Result |
|---|---|
| Branch (`NoMainEdit`) | `fix/issue-335-register-names` off `staging` @ `d08aa39`. Matches the current git branch. |
| Commands vs `doctrine/MEMORY.md` | test, build, lint and typecheck were all run from the repo root |
| Output not truncated | verbatim summary lines, no `...` |
| Test | `auth.spec.ts` 4/4. Full suite `1 failed / 296 passed`. The one failure is `VeeForm > VI \| EN toggle > flags the hidden language...`, a file this diff doesn't touch. Earlier notes record it as a known failure on `staging` too (baseline in `2026-10-25-issue-307-modal-save-close.md`, also seen in the 340/344 notes). |
| Build | `✓ built in 3.63s` |
| Typecheck | 90 errors, same as the baseline. `auth.ts` has 17 before and 17 after, so the diff adds none. |
| Register succeeds / payload has only accepted fields | the live payload is `{email,password,repassword}` and returns 201. The new spec asserts the exact payload even when `firstName` is in `values`. |
| Name fields removed (operator choice) | form inputs listed as email/password/repassword. The operator's decision was recorded via AskUserQuestion. |
| Success redirects to `/login` | `urlAfter: #/login`, and the spec asserts `router.push('/login')` |
| Comments per code-comments.md | one 1-line why-comment |
| Supersedes check (6b) | there is no other open row for #335. The note has `## Supersedes: none`. |
| Forbidden states (6) | none hit. The node exists, the evidence is cited, nothing was committed or pushed, and the branch isn't main. |
| Seal gate | the code diff isn't outward-facing (no commit, push or merge) |
| Proportionality | passing `router` is a 1-argument fix found in the same register flow. The node row names it, so it's in scope. |

## Missing
none

## Observations (non-blocking)
- The implementer created 2 throwaway accounts (`@example.com`) on the prod API during live testing. The note doesn't record operator approval for these calls. `agent-hub/CLAUDE.md`'s seal gate lists "a real API call", so future live register tests should ask first.
- The `VeeForm` VI|EN toggle failure keeps recurring across notes and should get its own issue.
- Close #335 with the "not reproducible" explanation once this ships.

## Re-run
none — audit only. The note's output is verbatim, the commands match doctrine, every criterion is cited, and the node isn't outward-facing.

## PM status
Row set to SEALED in place. The full row was archived to `haven/diagrams/dev-loop-archive.md`, and the active file now holds a pointer row (10 pointer rows, under the 20 limit).
