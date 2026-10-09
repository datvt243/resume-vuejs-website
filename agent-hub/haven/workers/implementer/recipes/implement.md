> This is the recipe that touches code the most — where `EDIT_UNVERIFIED`
> gets caught or slips through.

# Contract
- Input: output of `pick_next`.
- Output: `{status: sealed_pending_verifier | reopened_by_test | failed, node,
  diff summary, command, evidence}`
- NEVER: `status: done` — only the verifier uses a sealed status.

## Steps
0. CHECK THE BRANCH FIRST — `git status`/`git branch --show-current`. If
   on `main`: `git checkout -b <branch>` BEFORE changing any file — name
   it by task TYPE (see `doctrine/MEMORY.md` → Git workflow): bugfix →
   `fix/issue-<n>-<slug>` (e.g. `fix/issue-34-converttotruncate-length`);
   new feature → `feature/<slug>`; other → `chore/<slug>`/`docs/<slug>`.
   This prefix decides whether `/ship` deletes the branch after merge
   (`fix/*` deleted, `feature/*` kept).
   If `main` already has uncommitted changes NOT from me → stop, report
   `MAIN_EDIT`, ask the operator (don't `stash`/`checkout` over someone
   else's unfinished work).
1. Re-read the node + acceptance criteria.
2. Read every related file before writing — match existing
   naming/style/idioms in `src/` (e.g. `<script setup>`, composable
   patterns, model-driven forms — see `doctrine/domains/PROJECT.md`).
3. Smallest diff — change only what the acceptance criteria require.
   Don't fix another known trap opportunistically. Any comment
   added/changed follows `doctrine/standards/code-comments.md` (incl. its
   enabled opt-ins).
4. SEAL GATE before any outward-facing action (commit, push, merge
   branch → `main`, a real API call) — stop, show the diff + branch name,
   wait for approval.
5. Run the EXACT commands from `doctrine/MEMORY.md` — copy verbatim, from
   repo root: `npm run test` (vitest, exists since 2026-08-25) + `npm run
   build` + the `Typecheck` row (`vite build` strips types without
   checking them; while that row is CANNOT RUN, see the transitional
   note in `CLAUDE.md`). [synced 2026-10-07]
6. READ THE OUTPUT BACK verbatim — a claim you can't cite = `EDIT_UNVERIFIED`.
7. If the diff touches UI/routes, also confirm with `npm run dev` +
   manual observation of the relevant screen; state clearly this is
   manual observation, not an automated test.
8. Only report `sealed_pending_verifier` when ALL criteria pass with
   evidence.
9. If you spot a new bug/trap outside scope, log it under "Noticed, not
   done" in the evidence note — don't fix it inline.
10. Write to `evidence/` following the format in `evidence/README.md` —
    MUST include the branch name used in step 0.
11. [added 2026-09-02] ONLY when the result is `blocked` or `failed`
    (never reaches the verifier) — append one line to
    `evidence/worker-runs.log` (create the file if missing):
    `role=implementer outcome=blocked|failed node=<slug>
    hub_bytes_before=<N from pick_next step 7> verifier_rerun=n/a`. When
    the result is `sealed_pending_verifier`, do NOT log here — the
    verifier logs both sides (before/after) in `verify_seal.md` once it
    has a real verdict.

## Hard rules honored
`SmallestDiff` | `TestsBeforeDone` | `EvidencePerAction` | `NoSilentFailure` |
`NodeBeforeCode` | `BranchBeforeCode`

## Failure branches
| Failure | Handling |
|---|---|
| A needed command is missing from `doctrine/MEMORY.md` | `blocked`, suggest filling the `<<FILL>>` |
| Failure from missing setup (env, deps) | Report the REAL error, don't route around it |
| Typecheck reports errors the diff didn't introduce | Don't fix them in this diff (`SmallestDiff`) — prove they pre-exist (same count on the base branch), list under `## Noticed, not done` |
| `npm run build` fails from a real TypeScript error in a changed `.ts` file | Read the error verbatim, fix that exact error, rebuild — don't loosen `tsconfig.json` to dodge it |
| Starting on `main` when implementation begins | Checkout a new branch FIRST — never write a diff on `main` (`MAIN_EDIT`) |

## Runtime
`/worker implementer "<task>"`.
