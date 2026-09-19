# 2026-09-09 — remove-report-tokens

- Worker: implementer
- Version: 0.1.0
- Node: `remove-report-tokens` (new node, operator-directed chore)
- Task (verbatim): "xoá file report-tokens.md luôn đi" (operator, after
  asking "file report-tokens.md còn xài không?")

## Hub bytes before
102016 (root=7714, doctrine=27207, active diagram=40978, implementer
bundle=14963, verifier bundle=11154)

## Branch
`chore/remove-report-tokens` (checked out from `staging`).

## Context
Operator asked whether `REPORT-TOKENS.md` (repo root) was still in use.
Confirmed it's a one-off snapshot report from 2026-08-30
(`agent-hub-token-cleanup-20260830`'s own evidence note describes writing
it as a one-time deliverable for that session, not a file `/hub-tokens`
regenerates), explicitly treated as historical/do-not-touch by the later
`rename-repo-refs-cleanup` node (skipped rewriting the old repo name
inside it, calling it "báo cáo đã giao trong quá khứ"). Nothing in
`.claude/skills/`, CI, or other tooling reads it back — confirmed via
`grep -rln "REPORT-TOKENS"` (only hits were the file itself and 3
historical `agent-hub/evidence/**`/diagram references describing its
creation, none of them a live dependency). Operator decided to delete it.

## Diff
| File | Why |
|---|---|
| `REPORT-TOKENS.md` (deleted) | Stale one-off report, no longer referenced by any live tooling, operator confirmed delete |

Deliberately did NOT touch the 3 historical `agent-hub/evidence/**` /
`dev-loop-archive.md` mentions of it — those are append-only history
describing what was true at the time, not live references.

## Command
```
npm run build
```

## Output
```
✓ built in 4.61s
```
Same pre-existing chunk-size warning only. Doc-only deletion, no `src/`
touched — lint not re-run (nothing `.js`/`.ts`/`.vue` changed).

## Acceptance
| Criterion | Evidence |
|---|---|
| File confirmed unused before deletion | `grep -rln "REPORT-TOKENS"` — only self-reference + 3 historical evidence/diagram mentions, no live tooling dependency |
| File removed | `git rm REPORT-TOKENS.md`, confirmed via `git status --short` |
| Build unaffected | `npm run build` → `✓ built in 4.61s`, same warning as before |
| Historical references left untouched | No edits to `agent-hub/evidence/**`/`dev-loop-archive.md` |

## Noticed, not done
Nothing new outside scope.

## Seal gate
No outward-facing action yet — file deleted on a local branch only.
Committing/pushing/merging into `staging` still requires `/ship`.
