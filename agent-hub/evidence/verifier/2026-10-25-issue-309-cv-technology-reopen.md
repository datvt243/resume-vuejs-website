# 2026-10-25 - issue-309-cv-technology - REOPEN

- Worker: verifier
- Version: 0.1.0
- Node: `issue-309-cv-technology` (`haven/diagrams/dev-loop.prime-mermaid.md`, row stays `IN_PROGRESS`)
- Evidence reviewed: `evidence/implementer/2026-10-25-issue-309-cv-technology.md`
- Branch named in note: `fix/issue-309-cv-technology` (non-main, off `staging`). MAIN_EDIT: no.

## Isolation proof
Spawned as a fresh verifier subagent with the task string `verifier "issue-309-cv-technology — evidence note agent-hub/evidence/implementer/2026-10-25-issue-309-cv-technology.md"` and an explicit instruction to work in the wt309 worktree. This context did not write the diff and did not open it; the verdict comes from the note alone.

## Verdict: REOPEN

## Cited (OK)
- Criterion 1 (text, not raw array): spec `toContain('Owner · Vue3, Pinia')` + `not.toContain('[')`, red before the fix (`1 failed | 6 passed`), green after (`7 passed`).
- Criterion 4 (server PDF): `createPDF.ats.ts:180` already `.join(', ')`; `createPDF.ts:383` is a skills field. Read-only, no backend change.
- Commands match `doctrine/MEMORY.md`: `npm run test` (274 passed, 1 failure pre-existing on `staging` per the #307 baseline, `VeeForm` untouched), `npm run build` (`✓ built in 3.60s`), `npm run typecheck` (90 = baseline, none in changed files).
- Comments per code-comments.md: one WHY `//` comment, no `(#N)`.
- Supersedes / Still open: both declared `none`. Seal gate: none needed (no commit/push/API write).
- Proportionality: two source files + one spec, all within the node.

## Missing
1. **Criterion 2 ("No stray separator or empty text when the list is empty") is not proven.** The cited assertion is `toContain('Dev')` for `technology: []`. That passes whether the output is `Dev` or `Dev · `, so it does not show the separator is gone. The diff table says "(no separator)", but no assertion is cited for it. Fix: cite an assertion that rules out the separator, such as `not.toContain('Dev ·')`, an exact text match on that element, or `not.toContain('·')` scoped to that project row, and show it red-before/green-after or at least green.
2. **Criterion 3 ("New saves store trimmed items with no empty entries") has no executed evidence.** The note cites only the diff line (`PageProject.vue:75`) and calls it untested. A citable check is cheap even without a page harness. For example, paste the output of a one-line run of the exact expression on `'Vue3, Pinia, ,'` (`node -e` or a tiny spec), or extract it to a tested helper if that's preferred. Reasoning about a plain `split/map/filter` is inference, not evidence (`EvidenceOnly`).

## Forbidden states
`EDIT_UNVERIFIED` hit for criteria 2 and 3 (a criterion without citable evidence). No other forbidden states hit: the branch is named and non-main, the output is quoted and not truncated, no outward action was taken, and the browser check is declared BLOCKED with a reason.

## Re-run
none — audit-only. The gaps are missing assertions, not missing output, so re-running the same commands would not close them.

## PM status
Not updated (REOPEN). The row stays `IN_PROGRESS`.
