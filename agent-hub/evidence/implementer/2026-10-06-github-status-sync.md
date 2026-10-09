# 2026-10-06 — github-status-sync

- **Worker:** implementer (bookkeeping only, no `src/` change)
- **Node:** `github-status-sync-20261006` (new row, appended at table end)
- **Task:** "update lại status theo github" — reconcile PM status table with GitHub issue state

## Branch
`chore/github-status-sync-20261006` (off `origin/staging`).

## Command
```
gh issue list --state open --limit 50
158 OPEN [ENHANCEMENT] Import CV từ file PDF ...   enhancement, status: waiting-backend
122 OPEN [ENHANCEMENT] Gợi ý nội dung CV bằng AI  enhancement, status: pending

gh issue view <n> --json state,stateReason,closedAt
8   CLOSED COMPLETED 2026-09-24T19:46:27Z
116 CLOSED COMPLETED 2026-09-24T19:46:30Z
118 CLOSED COMPLETED 2026-09-24T19:22:27Z
120 CLOSED COMPLETED 2026-09-28T17:27:27Z
```

## Diff
| File | Why |
|---|---|
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | 1 row appended (`AppendOnly`) marking stale BLOCKED/IN_PROGRESS rows for #8/#116/#118/#120 as superseded by their SEALED nodes; confirms #122/#158 already match GitHub |
| this note | `EvidencePerAction` |

## Noticed, not done
- Old rows not edited in place (AppendOnly + `merge=union`); the sync row is the record.
- `hub-init` row is still PENDING — not tied to a GitHub issue, out of scope.

## Seal gate
No GitHub writes. Commit only on task branch; `/ship` is separate.

## Status
`sealed_pending_verifier` (status records, not code)
