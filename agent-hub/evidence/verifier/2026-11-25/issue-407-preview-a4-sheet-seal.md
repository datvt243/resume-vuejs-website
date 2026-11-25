# 2026-11-25 - issue-407-preview-a4-sheet - SEAL (round 2)

- Worker: verifier · Node: `issue-407-preview-a4-sheet` · New PM status: SEALED
- Branch: `feature/issue-407-xem-truoc-xuat` (NoMainEdit ok).

## Isolation proof
Round-2 resume message from the coordinator ("Round 2 for node issue-407-preview-a4-sheet: re-read ... from disk"), sent via SendMessage to the same verifier subagent; note re-read from disk this round.

## Reasoning
Round-1 gaps closed with cited output (`## REOPEN round 1 fixes`):
1. Typecheck: `npm run typecheck | grep -c 'error TS'` -> 74 (<= baseline 75); `grep -E "PagePreview|pageBreaks|i18n/index"` -> no lines, so no error in touched files. lint exit 0, test 513 passed, build built.
2. Public page screenshot compare: staging worktree vs branch, diffPixels 0 at 1440x2675 and 375x4045; worktree and Vite cleaned up.
3. `## Dead ends` now present.
All other criteria unchanged from round 1 (cited live checks, greps, vi+en key, comments row, `## Review`, `## Supersedes`/`## Still open`, feature doc cited, seal gate = login POSTs only). No forbidden state hit. Diff proportional to Behavior 24-31 (the `header:not(.cv-header)` fix is in scope of Behavior 27).

## Doctrine proposal
Typecheck baseline 75 -> 74: **rejected**. Outputs show count 74 but nothing proves the old value fails (75 still passes), so it is not provable per step 6c. `doctrine/MEMORY.md` left unchanged; not a REOPEN reason. The implementer may re-propose with a ratchet rationale.

## Re-run
none - audit-only; no outward-facing action beyond QA-account logins, no doctrine mandate.
