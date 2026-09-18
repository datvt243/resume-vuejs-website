# 2026-09-18 — issue-120-import-cv-pdf-linkedin-recheck-20260918 (blocked)

- Worker: implementer
- Version: 0.1.0
- Node: `issue-120-import-cv-pdf-linkedin-recheck-20260918` (new node per
  LAI-13 — does not edit the prior `issue-120-import-cv-pdf-linkedin` row)
- Task (verbatim): "#120" (operator, via `/todo`)

## Hub bytes before
111191 (root=7714, doctrine=27207, active diagram=50153, implementer
bundle=14963, verifier bundle=11154 — categories per `/hub-tokens`'
"per-session total" formula). Diagram is well under the 15KB *raw*
threshold in absolute terms this note previously flagged (174870B on
2026-09-17) — an archive pass happened since; no new flag needed.

## Branch
`chore/issue-120-import-cv-pdf-linkedin-recheck-20260918` (off `staging`).
No `src/` code changed — only this evidence note + a diagram row (hub
bookkeeping). **Process note (not a code defect):** these hub-bookkeeping
edits were initially written directly on `staging`'s working tree before
branching — the same slip class disclosed in the `issue-59-profile-completion`
node ("no code change" was wrongly read as "no branch needed", but the
2026-09-17 `issue-120` blocked note's own precedent (PR #131,
`chore/issue-120-import-cv-pdf-linkedin-blocked`) shows even a diff-less
blocked recheck still gets its own branch before commit). Caught before
any commit — recovered via `git stash -u` + `git checkout -b
chore/issue-120-import-cv-pdf-linkedin-recheck-20260918 staging` + `git
stash pop`, no history damage, disclosed here per `NORTHSTAR.md`'s "no
session state exception."

## Why recheck instead of trusting the prior BLOCKED_ON_BACKEND row
The prior node `issue-120-import-cv-pdf-linkedin` (2026-09-17) already
concluded blocked-on-backend. Per the `issue-8-jwt-localstorage` recheck
precedent (rechecking cross-repo blockers rather than assuming they're
permanent), re-verified against CURRENT backend state rather than reusing
the old conclusion at face value, since the sibling backend repo has had
real activity in the 1-day gap.

## Investigation
1. Re-read GitHub issue #120 (`gh issue view 120`,
   `datvt243/resume-vuejs-website`) — unchanged since the last check: 0
   comments, same scope note ("Parse phía backend... Cần issue backend
   riêng cho phần parse (endpoint mới)").
2. Checked the sibling backend repo
   (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`) for new
   activity since 2026-09-17: `git log --oneline -20` shows real work in
   the gap — `e3d2297 feat(auth): httpOnly cookie support for JWT auth
   (#119)`, `445e57e feat(candidate): vanity slug for public profile
   (#120 backend)` [backend's own #120, unrelated to this repo's #120],
   `4383246 feat(candidate-profile): soft-delete + restore for CV
   sections (#121 backend)`, a v1.5.0 release, and several agent-hub
   chores. **None of it touches PDF parsing, text extraction, or
   LinkedIn import** — the httpOnly-cookie commit is relevant to the
   OTHER open blocker (`issue-8-jwt-localstorage`), not this one.
3. Re-ran `git log --oneline --all --grep="parse" -i` (backend) — same 6
   pre-existing hits as the prior check (i18n, pagination, image-upload,
   indexes, auth cookie, vanity slug), none about parsing an uploaded
   file into structured Education/Experience data.
4. Re-ran `gh issue list --repo datvt243/resume-nodejs-api --state all
   --search "parse OR pdf OR linkedin OR import"` — same 7 results as
   2026-09-17 (`#120` vanity slug, `#87`/`#76` export-format issues,
   `#79`/`#75`/`#72` unrelated), all closed, none tracking a new parse
   endpoint. No backend issue was filed for this in the gap.
5. Re-ran `git log --oneline -15 -- src/` (this repo) and `grep -rli
   "upload-cv\|uploadCV\|import.*cv\|linkedin" src/` — same result as
   2026-09-17: only `src/models/information.model.ts` +
   `src/pages/dashboard/PageInformation.vue`'s unrelated
   `socialMedia.linkedin` URL text field. No new upload/import plumbing
   landed in this repo either (most recent `src/` commits are the QR-code
   feature and earlier tailwind/auth fixes, unrelated).

## Conclusion
**Still blocked on backend.** Nothing changed in the 1-day gap that
unblocks this: the backend's only PDF-touching endpoints remain
store/download-only (confirmed unchanged by the commit list — no new
commit touches `uploadCV.middleware.ts` or `candidate.controller.ts`'s
upload/download handlers), no backend issue tracks a parse endpoint, and
no frontend plumbing exists to extend. Building a frontend upload UI now
would still have nothing real to call. Issue #120 stays OPEN, this
recheck node is `BLOCKED_ON_BACKEND` (new node, prior node's row
untouched per LAI-13).

## Command
None run — no code changed, nothing to build.

## Acceptance
| Criterion | Evidence |
|---|---|
| Rechecked against CURRENT backend state, not reused the 2026-09-17 conclusion at face value | `git log --oneline -20` (backend) — read every commit in the gap |
| Confirmed the new backend activity in the gap doesn't unblock this specific feature | `e3d2297`/`445e57e`/`4383246` read by subject line — auth cookies, vanity slug, soft-delete, none = PDF/LinkedIn parsing |
| Re-checked for a backend issue tracking the parse endpoint | `gh issue list --repo datvt243/resume-nodejs-api --state all --search "parse OR pdf OR linkedin OR import"` — identical 7 results, none match |
| Re-checked frontend for new plumbing since last check | `git log --oneline -15 -- src/` + `grep -rli "upload-cv\|uploadCV\|import.*cv\|linkedin" src/` — same single unrelated hit as before |
| No fake/cosmetic diff created | `git status` — clean, on `staging`, no changes |

## Noticed, not done
- Next real step if the operator wants this to move forward is still
  filing a NEW issue on `datvt243/resume-nodejs-api` for the parse
  endpoint (issue #120's own scope note) — not filed here, out of this
  task's scope (frontend repo only, same as 2026-09-17's note).

## Seal gate
No outward-facing action, no diff — nothing to ship. Per `/todo`'s rule
for a `blocked` implementer result: stop immediately, report to the
operator, do not loop, no verifier pass needed (nothing to verify — no
diff, no build claim).
