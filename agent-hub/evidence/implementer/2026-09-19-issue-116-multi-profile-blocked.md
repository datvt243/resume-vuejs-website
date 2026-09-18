# 2026-09-19 — issue-116-multi-profile-blocked (blocked)

- Worker: implementer
- Version: 0.1.0
- Node: `issue-116-multi-profile-blocked` (new node)
- Task (verbatim): "Pick up the next issue — #116" (operator)

## Hub bytes before
118613 (root/doctrine/active-diagram/implementer-bundle/verifier-bundle,
per `/hub-tokens`' "per-session total" formula).

## Branch
`chore/issue-116-multi-profile-blocked`, cut from `staging` BEFORE
writing this note (same branch-first discipline established on the
`issue-118`/`issue-120` blocked nodes this week).

## Investigation
1. Read GitHub issue #116 (`gh issue view 116`,
   `datvt243/resume-vuejs-website`): "[ENHANCEMENT] Nhiều phiên bản CV
   (multi-profile)". Wants named CV "profiles" (e.g. "CV Frontend", "CV
   Backend"), each a subset of the candidate's existing
   Education/Experience/Project/Certificate/Award/Reference records
   selected from one source of truth, with its own public share-link
   (issue #56) and PDF export (issue #55) view. The issue's OWN scope
   note explicitly anticipates this backend gap and pre-authorizes the
   exact next step: "Cần backend hỗ trợ lưu `profile` — nếu backend chưa
   có, cần một issue backend riêng trước khi làm phần này (tương tự cách
   #119 tách ra cho issue #8)" — i.e. file a separate backend issue first
   if the backend doesn't have it, same as backend issue #119 was filed
   to eventually unblock frontend issue #8. Unlike `issue-118`, this
   removed the ambiguity about WHETHER to file a backend issue — the
   operator (who authored #116 themselves) already specified that step.
2. Checked the sibling backend repo
   (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`) directly:
   - `ls src/models/` → no `profile` model.
   - `ls src/routers/api/v1/` → no `profile` route.
   - `grep -n "enum Collections" -A 15 src/types/base.type.ts` → no
     `PROFILE` entry (only `INFORMATION`/`EXPERIENCE`/`EDUCATION`/
     `REFERENCE`/`PROJECT`/`CERTIFICATE`/`AWARD`).
   - `grep -n "profile" src/models/candidate.model.ts` → only a comment
     about the vanity-slug "public profile" feature (issue #120) — a
     DIFFERENT, unrelated meaning of "profile" (public visibility slug,
     not a CV-version/subset concept). No `profiles: []` field or
     anything resembling multi-version selection exists on the candidate
     schema.
   - `gh issue list --repo datvt243/resume-nodejs-api --state all
     --search "profile OR multi-profile OR CV version OR variant"` →
     7 results, all either the unrelated vanity-slug/public-profile
     feature (#120, #75) or unrelated collection work (#121, #72, #73,
     #71, #79) — nothing tracking a multi-CV-version concept.
   - Located the public endpoint this feature would need to filter:
     `GET /api/me/:email` → `fnGetAboutMe` in
     `src/candidate_me/index.ts` (mounted `src/routers/index.ts:59`) —
     confirmed as the concrete integration point named in the backend
     issue's "Notes" section.
3. Conclusion: confirmed the exact gap the frontend issue itself
   predicted — same class of gap as `issue-120`/`issue-118`, and this
   time the frontend issue's own text already resolves the "should a
   backend issue be filed" question (unlike #118, where that required an
   operator decision via `AskUserQuestion`). Proceeded to file directly.

## Outward-facing action taken
Filed `datvt243/resume-nodejs-api#133` — "CV profile (multi-version)
collection + slug/PDF selection filter". Concrete proposal: new
`src/models/profile.model.ts` (candidateId + name + one ObjectId-array
field per selectable section — `educationIds`/`experienceIds`/
`projectIds`/`certificateIds`/`awardIds`/`referenceIds` — referencing
existing records, no data duplication, matching the issue's own "chọn
lọc một tập con... từ cùng một nguồn dữ liệu gốc"); standard CRUD route
mirroring `education.route.ts`; a default "Tổng hợp" (All) profile
synthesized/persisted per candidate so existing users lose nothing;
`GET /api/me/:value` gaining an optional `?profile=<id>` filter (default
behavior unchanged when omitted, so existing share-links keep working);
noted the dashboard PDF-preview side likely doesn't need a backend change
at all (client can filter using already-fetched full data + the
profile's id lists). This is filing an issue only — no backend code was
written (out of this hub's scope; the backend repo has its own
governance).

## Conclusion
**Blocked on backend.** The feature requires a new `profile` collection
+ a filtering capability on the public endpoint, neither of which exists.
A tracking issue now exists (`resume-nodejs-api#133`). Issue #116 stays
OPEN on the frontend repo, this node is `BLOCKED_ON_BACKEND`. Matches the
issue's own "High value nhưng effort lớn, nên làm sau khi các tính năng
nhỏ hơn ổn định" priority note — revisit once #133 lands, not urgent.

## Command
None run — no frontend code changed, nothing to build.

## Acceptance
| Criterion | Evidence |
|---|---|
| Confirmed the backend gap directly, not assumed | `ls src/models/`, `ls src/routers/api/v1/`, `grep -n "enum Collections" -A 15 src/types/base.type.ts` — no `profile`/`PROFILE` |
| Confirmed the existing "profile" references in the backend are a different, unrelated feature | `grep -n "profile" src/models/candidate.model.ts` → vanity-slug public-visibility comment only |
| Checked for a pre-existing backend issue before filing a new one | `gh issue list --repo datvt243/resume-nodejs-api --state all --search "profile OR multi-profile OR CV version OR variant"` — 7 results, none match |
| Filing the backend issue follows the frontend issue's own explicit instruction, not an unrequested judgment call | Issue #116 body: "Cần backend hỗ trợ lưu `profile`... cần một issue backend riêng trước khi làm phần này (tương tự cách #119 tách ra cho issue #8)" |
| Concrete backend proposal names the exact integration point (not vague) | `src/candidate_me/index.ts`'s `fnGetAboutMe`, mounted `src/routers/index.ts:59` |
| No fake/cosmetic frontend diff created | `git status --short` in the frontend repo untouched by this note (only hub bookkeeping) |

## Noticed, not done
- Backend issue #133 itself is unassigned/unimplemented — this session
  did not touch the backend repo's code (different repo, different
  hub/governance).
- The default-profile migration ("Tổng hợp" containing all existing
  data) is a real design/ops concern (backfill for existing candidates)
  — flagged in the backend issue's proposal, not solved here.

## Seal gate
Filing a GitHub issue on a sibling repo is an outward-facing action.
Proceeded without a separate operator confirmation this time because the
frontend issue's OWN text already specifies this exact step ("cần một
issue backend riêng trước khi làm phần này") — unlike `issue-118`, where
the issue text was silent on this and required an explicit
`AskUserQuestion` round with the operator. No diff in THIS repo, no
commit/push/merge here beyond this branch's hub bookkeeping (still
pending `/ship`). Per `/todo`'s rule for a `blocked` implementer result:
no verifier pass needed (nothing to verify — no diff, no build claim).
