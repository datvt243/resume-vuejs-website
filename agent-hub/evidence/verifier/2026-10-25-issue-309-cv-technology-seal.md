# 2026-10-25 - issue-309-cv-technology - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-309-cv-technology` (`haven/diagrams/dev-loop.prime-mermaid.md`, now SEALED and archived)
- Evidence reviewed: `evidence/implementer/2026-10-25-issue-309-cv-technology.md`, including `## REOPEN round 1`
- Previous verdict: `evidence/verifier/2026-10-25-issue-309-cv-technology-reopen.md` (the gaps were criteria 2 and 3)
- Branch named in note: `fix/issue-309-cv-technology` (non-main, off `staging`). MAIN_EDIT: no.

## Isolation proof
Spawned as a fresh verifier subagent with the task string `verifier "issue-309-cv-technology (REOPEN round 1 re-verify) — evidence note ... see its '## REOPEN round 1' section; previous verdict ...-reopen.md"` and an instruction to work only in the wt309 worktree. This context did not write the diff and did not open it. The verdict comes from the note alone.

## Verdict: SEAL

## Cited
- Criterion 1 (text, not raw array): spec `toContain('Owner · Vue3, Pinia')` + `not.toContain('[')`. It fails on the old template (`1 failed | 6 passed`) and passes with the fix (`7 passed`).
- Criterion 2 (empty list, no separator): REOPEN gap 1 is closed. The new assertion `expect(subs.join('|')).not.toContain('Dev ·')` is at `CvResumeLayout.spec.ts:95`. It passes with the fix (`7 passed (7)`) and fails on the stashed old template (`1 failed | 6 passed (7)`).
- Criterion 3 (trimmed on save): REOPEN gap 2 is closed. A `grep` confirms the expression is at `PageProject.vue:75`. The note runs that same expression with `node -e` on `'Vue3, Pinia, ,'` and gets `after: ["Vue3","Pinia"]` (before: `["Vue3"," Pinia"," ",""]`).
- Criterion 4 (server PDF): `createPDF.ats.ts:180` already uses `.join(', ')`. In `createPDF.ts:383` the field is a skills field. No backend change is needed.
- Commands match `doctrine/MEMORY.md`. `npm run test` after round 1 gives `1 failed | 274 passed (275)`, and the one failure is the `VeeForm` test that already fails on `staging`. `npm run build` gives `✓ built in 3.60s`. `npm run typecheck` gives 90 errors, which equals the baseline, and none are in the changed files. Round 1 changed only the spec, so the earlier build and typecheck results still hold.
- Comments per code-comments.md: one `//` comment explaining WHY, with no `(#N)`.
- Supersedes and Still open are both declared `none`. Seal gate: none needed (no commit, push or API write).
- Proportionality: two source files plus one spec, all inside the node.

## Missing
none

## Forbidden states
None hit. The branch is named and is not main. The output is quoted, not truncated. Every criterion now has cited evidence. No outward-facing action was taken. The manual browser check is declared BLOCKED with a reason, and the component spec that mounts the real `CvResumeLayout` covers it.

## Re-run
none. This was an audit only: the note quotes its output in full and covers every criterion.

## PM status
The row was set to SEALED and archived to `haven/diagrams/dev-loop-archive.md`. The active row is now a pointer to this note, and that edit was made in place.
