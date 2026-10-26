# 2026-10-26 — issue-340-input-cannot-clear — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-340-input-cannot-clear`
- Evidence reviewed: `evidence/implementer/2026-10-26-issue-340-input-cannot-clear.md`

## Isolation proof
This pass ran as a separate verifier subagent, spawned with the instruction "You are a fresh verifier ... You did NOT write this diff" and the args `verifier "agent-hub/evidence/implementer/2026-10-26-issue-340-input-cannot-clear.md"`. It has no memory of the implementer session.

## Verdict: SEAL

## Cited
| Check | Evidence in note |
|---|---|
| Commands match doctrine | `npm run test` / `build` / `lint` / `typecheck` from repo root |
| Output not truncated | test `1 failed / 295 passed (296)`. The one failure is `VeeForm.spec.ts` VI/EN toggle, which also fails on clean `staging` (proven in the #336 note) and is in a file this diff does not touch. Build `✓ built in 3.92s`, lint exit 0, typecheck 90 = baseline with none in `PageInformation.vue` |
| Social inputs can be cleared and retyped | Typing trace `["…exampl","","h","https://github.com/qa-new"]`, no snap-back. Website cleared to `""` |
| Saved values persist, cleared link removed | Save payload returned 200. After a reload the values are `[qa-new, linkedin/example, ""]` |
| #336 behaviour kept | LinkedIn was left untouched and was still sent and persisted |
| Other inputs unaffected | `firstName` clears to `""` |
| Comments per code-comments.md | One 1-line why-comment added, and one stale comment shortened |
| Root cause named | `field.value` attr overrides `:value` through `FrmInput`'s `v-bind="attrs"`. The repro shows only the social inputs were affected |

## Missing
none

## Forbidden states
none hit. Branch `fix/issue-340-input-cannot-clear` is not `main` or `staging`. A node row exists. The diff has no code in `haven/`.

## Seal gate
Not outward-facing: no commit, push or merge. The only live writes were on the QA test account, and the note says the links were restored afterwards.

## Proportionality
The diff is limited to `PageInformation.vue`. `FrmInput.vue` was deliberately left alone, with a grep showing no other caller passes `value`. The unused `modalSocial` and the hard-reload hydration problem are listed as "noticed, not done" rather than fixed. `## Supersedes: none` is consistent: no other open row exists for #340.

## Re-run
none. This was an audit only: the note is verbatim, matches the doctrine commands, and covers every criterion.
