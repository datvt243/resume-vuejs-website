# 2026-11-24 - issue-453-454-owner-visit-pagination

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-453-454-owner-visit-pagination` (IN_PROGRESS)
- Branch: `feature/issue-453-454-owner-visit-pagination` (off `staging` @ `0a9bdf1`, synced with `git pull origin staging` → "Already up to date.", linked to #453 via `gh issue develop`)
- Task: #453 "Public resume: don't record a visit when the owner views their own link" · #454 "Visits table: use the API pagination" (`/todo #453 #454`)
- Status: **sealed_pending_verifier**
- Analyst pass 0 skipped: both feature docs are `verified` and already carry the operator's answer for these issues (public-resume.md Open question 2 → #453; cv-visits.md Open question 2 → #454). #454's blocker datvt243/resume-nodejs-api#396 is CLOSED (2026-11-15), commit `d0561f0` on backend `origin/main` and `origin/staging` (`git branch -r --contains d0561f0`).

## Hub bytes before
100369

## Feature doc
- `agent-hub/doctrine/features/public-resume.md` (#453)
- `agent-hub/doctrine/features/cv-visits.md` (#454)

## Feature doc changed
- public-resume.md Behavior #6: + "No visit is recorded when the browser's cached user … has the CV's `email` (case-insensitive) … (#453)"; + acceptance row (#453); changelog row 2026-11-24. Operator answer: Open question 2 "Change: no visit when the viewer is the owner — #453".
- cv-visits.md Behavior #5 (hint = `meta.total` of the table request), #8 (table paged by `GET api/v1/candidate/visits?page=<n>&limit=25`, `meta` drives Prev/Next + label, stale reply ignored, Delete all → page 1), #9 (stats or table failing), #10 (count = `meta.total`; reload cached count + stats + table); acceptance "26 cached visits" row replaced by the API-paging row; changelog row 2026-11-24. Operator answer: Open question 2 "Change: use the API pagination once datvt243/resume-nodejs-api#396 lands — #454".

## Diff
| File | Why |
|---|---|
| `src/pages/public/PagePublicResume.vue` | after a successful load, skip the visit POST when `authStore().getUser.email` (lowercased) equals `res.data.email` (lowercased); empty viewer email → still posts. Uses the cached user, not `isAuthenticated`, so the new tab from "View my CV" (no refresh token in sessionStorage) is covered (#453) |
| `src/pages/public/PagePublicResume.spec.ts` | top-level `setActivePinia` + storage reset (page now uses `authStore`); 3 new cases: owner (case-insensitive) → no POST; owner in new tab (no tokens) → no POST; other signed-in user → POST |
| `src/pages/dashboard/PageVisits.vue` | table no longer slices the layout's cached list: `loadPage()` → `handleBase GET candidate/visits { page, limit: 25 }`, `total`/`pageCount` from `meta.total`/`meta.totalPages`; `watch(page, loadPage, { immediate })`; stale reply guard (`requested !== page.value`); `shownPage` so the range label follows the rows shown; table failure → `tableError` in `loadError`, Retry reloads it; KPI hint, Delete-all count and disabled state use `total`; Delete all also reloads the table (page 1). Header comment updated (#454) |
| `src/pages/dashboard/PageVisits.spec.ts` | `serveVisits()` mock answers the table GET like the API (slice + meta); tests moved off `candidateStore().visits`; error/retry test now fails the table GET and asserts the retry GET; paging test asserts `page=1&limit=25` then `page=2`; new "range label stays while next page loads" case; delete-all asserts DELETE then GET page 1 and button disabled after |
| `src/composables/useVisits.ts` | header comment only: PageVisits no longer reads the cached list |
| `agent-hub/doctrine/features/{public-resume,cv-visits}.md` | see `## Feature doc changed` |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended (IN_PROGRESS) |

Not mine: `.claude/skills/todo/SKILL.md` was already modified in the working tree before this run (gitStatus at session start) — not touched, not part of this node.

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; per file `npx vitest run <path>`.

## Output
Final run (after the review fixes):
```
npx vitest run src/pages/public/PagePublicResume.spec.ts src/pages/dashboard/PageVisits.spec.ts
 ✓ src/pages/public/PagePublicResume.spec.ts (9 tests) 50ms
 ✓ src/pages/dashboard/PageVisits.spec.ts (12 tests) 137ms
      Tests  21 passed (21)
npm run test
 Test Files  69 passed (69)
      Tests  487 passed (487)
npm run lint      → lint=0 (exit 0)
npm run build     → ✓ built in 3.84s
npm run typecheck → 78 "error TS" lines (baseline 78 on staging @ 13383c8)
  npm run typecheck | grep -cE "PageVisits|PagePublicResume|useVisits" → 0
```

## Live check (`npm run dev`, prod API, qa.full@example.com, debug Chrome 9888 via Playwright)
Vite started by Claude on :5173 (none was running), stopped after (`lsof -iTCP:5173 -sTCP:LISTEN | wc -l` → 0). Run before the review fixes; the review fixes do not change the requests below.
```
{"rows":4,"range":["1–4 trong 4"],"pager":0,"hint":"Tổng 4 lượt từ trước tới nay","cvShown":1,
 "log":["GET /api/v1/candidate/visits/stats?interval=day&from=2026-10-26&tz=Asia%2FSaigon",
        "GET /api/v1/candidate/visits?page=1&limit=25",
        "--- own public link as owner",
        "GET /api/me/qa.full@example.com"]}
```
→ `/dashboard/visits` requests `page=1&limit=25` and renders the 4 rows with "1–4 trong 4"; the owner's own public link renders the CV and sends **no** `POST …/visit`. qa.full has only 4 visits, so multi-page paging was not exercised live (covered by the spec).

## Acceptance
| Criterion | Evidence |
|---|---|
| #453 owner (signed in, email case differs) opens own link → GET, no visit POST | `PagePublicResume.spec.ts` "does not record a visit when the owner opens their own link…" — Tests 9 passed (9); live log above (no POST) |
| #453 owner in a new tab (cached user, no refresh token) → no POST | `PagePublicResume.spec.ts` "…opens it in a new tab…" |
| #453 anonymous / other signed-in viewer still records the visit with referrer | existing referrer cases + "records the visit when someone else signed in opens the link" |
| #453 not-found → no POST (unchanged) | existing "does not record a visit when the profile is not found" |
| #454 table requests `page`/`limit` and uses `meta` for Prev/Next and "from–to of total" | `PageVisits.spec.ts` "requests the detail table from the API 25 rows at a time…" (asserts `{page:1,limit:25}`, 25 rows, "1–25 trong 30", Next → `{page:2,limit:25}`, 5 rows, "26–30 trong 30", Next disabled); live `GET /api/v1/candidate/visits?page=1&limit=25`, "1–4 trong 4" |
| #454 table load failure → error block, Retry reloads only the table | `PageVisits.spec.ts` "shows an error with a retry…" (2nd handleBase call = table GET, `reloadStats` not called) |
| #454 Delete all → DELETE, then cached count + stats + table page 1 reload | `PageVisits.spec.ts` "confirms, then hard-deletes and reloads…" |
| cv-visits acceptance `npx vitest run src/pages/dashboard/PageVisits.spec.ts` / public-resume `…PagePublicResume.spec.ts` pass | Tests 21 passed (21) |
| `npm run test`, `lint`, `build` pass; typecheck ≤ 78 with none in changed files | Output above |
| comments per code-comments.md | no issue refs in added comments: `git diff -U0 -- src \| grep -cE "^\+.*(//\|\*).*#[0-9]+"` → 0 (3 `(#45x)` refs removed after the review; comment-only edit, re-run: 3 specs `Tests  25 passed (25)`, lint exit 0, build ok); new comments are one-line "why" (owner check + why cached user, stale reply guard, list shrank, shownPage, LayoutDefault count); stale header comments in `PageVisits.vue` / `useVisits.ts` corrected |

Coverage claim: no code reads the cached `visits` list after this diff — `grep -rln "getCandidate?.visits\|\.visits\b" src | grep -v spec` → `src/composables/useVisits.ts`, `src/pages/_layouts/LayoutDefault.vue`, `src/pages/dashboard/PageVisits.vue`; the follow-up grep on the latter two for `visits` outside URLs/i18n/class names returned only the header comment, `VisitChart` import and the chart `aria-labelledby`.

## Supersedes: none
`grep -n "453\|454" haven/diagrams/dev-loop.prime-mermaid.md` → only this node; `grep -c "issue-453-454" haven/diagrams/dev-loop-archive.md` → 0.

## Review
`/code-review medium` (forked skill) on the uncommitted diff — 9 findings:
1. Owner check gated on `isAuthenticated` misses the new tab opened from "View my CV" (no refresh token) → **fixed** (cached user email; new spec case).
2. Payload without `email` would count owner views → **false positive**: backend `PUBLIC_PROFILE_FIELDS` (resume-nodejs-api `src/candidate_me/index.ts` on `origin/main`) always includes `email`, and email is the account's login field, never empty.
3. `useVisits` downloads the whole list on every dashboard load → **false positive as stated**: since #396 the API defaults to `limit=20`, so it gets page 1 + `meta.total`. The cached `visits` array is now unused → `## Noticed, not done`.
4. Stale `useVisits.ts` header comment → **fixed**.
5. Global spinner on every page change → kept: same `loading` every `handleBase` call in the app uses; noted below.
6. Range label jumps ahead while the next page loads → **fixed** (`shownPage`; new spec case).
7. Table failure while paging replaces the whole page → **false positive**: matches cv-visits.md Behavior #9 (one error block for any failed load); a reply for a page already left is deliberately ignored.
8. Fallback to unpaginated if the API ignores `page`/`limit` → **false positive**: prod API pages since `d0561f0` (on backend `origin/main`).
9. Removed `visitsLoadError` spec → **false positive**: PageVisits no longer reads that flag (Home still does, covered by its own spec); `reloadVisits` after Delete all is still asserted.

## Noticed, not done
- `useVisits` still caches `visits` (now only the API's first page) though nothing reads it; it could request `limit: 1` and drop the array. Separate cleanup (touches `useVisits.spec.ts`).
- Paging shows the app-wide spinner per page (finding 5); a table-local loading state would feel lighter.

## Seal gate
none — no commit/push/merge; live check only read data (GETs) on the QA account.
