# 2026-11-15 - issue-459-logout-refresh-token — SEAL
- Worker: verifier · Version: 0.1.0
- Node: `issue-459-logout-refresh-token` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note audited: `evidence/implementer/2026-11-15/issue-459-logout-refresh-token-plan.md`
- Branch: `fix/issue-459-logout-refresh-token` (cut from `staging` @ `13383c8`) — not main/staging, `MAIN_EDIT` clear.

## Verdict
SEAL

## Isolation proof
Fresh Agent-tool subagent spawned by the orchestrator with the prompt "You are a fresh subagent launched specifically to act as the agent-hub VERIFIER … Spawn type: fresh. Record the isolation proof as this fresh Agent-tool spawn", then `/worker verifier "agent-hub/evidence/implementer/2026-11-15/issue-459-logout-refresh-token-plan.md"`. This context holds no implementer reasoning; it did not write the diff.

## Cited
| Criterion | Evidence in note | OK |
|---|---|---|
| #459: logout body sends `{ refreshToken }` | auth.spec "logOut sends the refresh token…" red (`× … (issue #459)`) with fix stashed, green with it; live request 137 body `{"refreshToken":"eyJ…"}` | yes |
| #459: refresh after logout → 401 TOKEN_REVOKED | Not met by FE; backend bug (`extractTokenWithSource` reads header first), moved to resume-nodejs-api#475 with recorded operator decision "Open backend bug, seal FE (Recommended)" | descoped, recorded |
| "still call logout with only a refresh token" | Dropped with cited reason: backend returns 400 `noTokenToLogout` without access token; clause not in #459 | descoped, reasoned |
| #426: failed refresh → signed out + `/login` right away | axios.spec "401 whose refresh fails…" red/green; live: refresh 401s then `{"hash":"#/login","user":null,"rt":null}` | yes |
| Existing logout behavior unchanged | `Test Files 56 passed (56)`, `Tests 372 passed (372)` | yes |
| Feature doc `auth-login.md` Behavior #11, #13 | both covered by the two red/green specs + live check | yes |
| Feature doc criteria (auth/axios specs pass) | full suite green | yes |
| Build / lint | `✓ built in 4.06s`; lint exit 0 | yes |
| Typecheck | 78 branch = 78 stashed, error lists identical with line/col stripped; touched-file hits (`auth.ts` 38/80/83, `axios.spec.ts` 15) pre-existing on clean tree — accepted per precedent `issue-375-delete-all-visits-seal.md`, `issue-420-auth-form-fixes-seal.md` | yes |
| comments per code-comments.md | one changed `//` in `auth.ts`, one sentence, says why | yes |

## Missing
none

## Checks
- Commands match `doctrine/MEMORY.md` (test, build, lint, typecheck). Output tails verbatim, not cut.
- Feature doc changed: #11 cites operator answer to open question 4 (2026-11-07); #13 cites operator-filed issue #459 Expected section.
- Review section present: inline medium review, import-cycle finding resolved as false positive with reason; no security label.
- Supersedes: none (grep cited). Forbidden states: `ADHOC_WORK`, `NO_EVIDENCE`, `EDIT_UNVERIFIED`, `CODE_IN_HAVEN`, `DIAGRAM_DRIFT`, `MAIN_EDIT` — none hit.
- Seal gate: no commit/push; backend issue #475 created with recorded operator approval.
- Proportionality: 2 source files, ~4 lines + 2 specs. Matches node.
- Note for operator: live check accidentally logged in once with the owner account `votan.it@gmail.com` (reads only: login + GETs, no writes) — recorded honestly in the note; not a forbidden state, but breaks the "QA accounts only" rule.

## Doctrine proposal
`Typecheck baseline: 90 errors on staging @ v1.35.5` → `78 errors on staging @ 13383c8` — **confirmed** (78 on branch and on stashed tree, identical lists). Applied to `doctrine/MEMORY.md` Typecheck row; Corrections row added to `haven/workers/implementer/MEMORY.md`. (CI row's "90-error baseline" prose left as is.)

## PM status
`issue-459-logout-refresh-token` → SEALED; full row archived to `dev-loop-archive.md`, active row replaced with pointer; oldest pointer (`issue-364-form-length-rules`) dropped to keep 20. Feature doc status unchanged (fix SEAL).

## Re-run
none — audit-only; note output verbatim, commands match doctrine, not outward-facing.
