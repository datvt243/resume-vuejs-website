# 2026-11-26 - issue-448-owner-export-profile - SEAL (round 2)

- Worker: verifier · Node: `issue-448-owner-export-profile` · New PM status: SEALED
- Note audited: `evidence/implementer/2026-11-26/issue-448-owner-export-profile-plan.md` (incl. `## Round 2 — REOPEN fixes`); prior verdict `issue-448-owner-export-profile-reopen.md`

## Isolation proof
Resumed REOPEN round: the coordinator's round-2 message ("round 2: re-read ... from disk (new section `## Round 2 — REOPEN fixes`) ... spawn=resumed"); my context holds only my own round-1 verdict.

## Reasoning
- Round-1 items passed unchanged (branch `feature/...` not main/staging, test 525, build, lint 0, typecheck 74 <= 75 with 0 in touched files, review, comments row, spec + live request-URL criteria).
- REOPEN 1 (Seal gate): `### Seal gate` now exists, names every outward-facing action (QA-account-only create/delete/PATCH + GETs), cites the operator's standing authorization (user memory `qa-test-accounts.md`, owner account never touched), no commit/push/merge, and state restored. Accepted as recorded approval.
- REOPEN 2 (acceptance): PDF text decoded: filtered `JOBTEST=1 FASTCODING=0 Laidon=0` vs full `JOBTEST=1 FASTCODING=1 Laidon=1` (classic, 69900 vs 101705 B), ats likewise `1/0/0` vs `2/1/2`; saved name `Nguyen_Van_Full_Information_Technology_CV_EN.pdf`; Cancel -> `net::ERR_ABORTED`, 0 saves, no toast, Cancel focused, row button disabled. `_VI` covered by existing `withLangSuffix` specs. Round-1 overlay selector claim explicitly superseded.
- No code change round 2 (note states `git diff src/` unchanged). Backend 500 on classic+vi unfiltered is outside this diff (no `profile` param) -> Noticed, not a reason.
- Forbidden states: none hit. Proportionality: diff matches Behavior 6-11.

## Re-run
none - audit-only; no exception case in "Re-run scope" applies.
