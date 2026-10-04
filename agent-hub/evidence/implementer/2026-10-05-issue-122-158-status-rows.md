# 2026-10-05 — issue-122-158-status-rows

- **Worker:** implementer (bookkeeping only, no `src/` change)
- **Node:** `issue-122-ai-cv-suggestions-pending`, `issue-158-import-cv-pdf-waiting-backend` (new rows, appended at table end)
- **Task:** "#122 chuyển status thành PENDING, #158 thành waiting backend" — operator chose "Cả hai" (GitHub labels + diagram rows)

## Branch
`chore/issue-122-158-status-rows` (off `origin/staging`; working tree was clean on `staging`).

## Diff
| File | Why |
|---|---|
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | 2 rows appended after `issue-159-ats-export-self-check` (`AppendOnly`): #122 → `PENDING`, #158 → `BLOCKED_ON_BACKEND` (hub's existing term for "waiting backend") |
| this note | `EvidencePerAction` |

## Outward-facing actions (operator-approved in chat)
```
gh label create "status: pending" ...          (new repo label)
gh label create "status: waiting-backend" ...  (new repo label)
gh issue edit 122 --add-label "status: pending"
gh issue edit 158 --add-label "status: waiting-backend"
gh issue list --state open →
158 OPEN ... enhancement, status: waiting-backend
122 OPEN ... enhancement, status: pending
```
Earlier the same session (also operator-approved): created backend issue https://github.com/datvt243/resume-nodejs-api/issues/234 and commented the link on #158.

## Command
No `src/` change → no build/test needed for this diff (hub markdown only).

## Noticed, not done
- `gh project list` needs `read:project` scope (not granted) — didn't check user-level Projects boards; neither issue has `projectItems`.

## Seal gate
Labels/issue edits: approved by operator in chat. Commit/PR: not done — `/ship` is separate.

## Status
`sealed_pending_verifier` (rows are status records, not code — verifier optional)
