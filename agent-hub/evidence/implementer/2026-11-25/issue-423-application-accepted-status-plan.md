# 2026-11-25 — issue-423-application-accepted-status

- Worker: implementer · Version: 0.1.0 · Node: `issue-423-application-accepted-status` on `haven/diagrams/dev-loop.prime-mermaid.md` (IN_PROGRESS)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/423 (enhancement → feat; label `status: waiting-backend` still on it, but backend datvt243/resume-nodejs-api#410 is CLOSED 2026-11-17 and its rules are live on prod — see Live check)
- Branch: `feature/issue-423-application-accepted-status` (cut from `staging` @ c37845b, linked via `gh issue develop`)
- Status: sealed_pending_verifier
- Task (verbatim): "#423 feat(application): status `accepted` + only allow valid status transitions … create: any status; same status: allowed; forward (skips allowed): applied → interview → offer → accepted (accepted only from offer); applied/interview/offer → rejected; accepted and rejected are final (select disabled). A 400 from the backend for an invalid transition shows its message."

## Hub bytes before: 103016

## Feature doc: doctrine/features/job-applications.md (Behavior 7–9, #423 acceptance criteria + edge cases). Analyst spec: `evidence/analyst/2026-11-25/issue-423-application-accepted-status-spec.md` — no open questions.

## Diff
| File | Why |
|---|---|
| `src/models/application.model.ts` | `accepted` option added between offer and rejected (Behavior 8 option order). New exported `allowedStatuses(saved)`: no saved → all 5; final (`accepted`/`rejected`) → `[saved]`; else forward by option index (unknown → index 0 = applied), `accepted` only when saved is `offer`, `rejected` always. Rank derived from option order (review finding 5). |
| `src/pages/dashboard/PageApplication.vue` | `savedStatus` ref (null on Add/Duplicate, the record's status on Edit). `formFields` rewrites the `status` field: options filtered by `allowedStatuses(savedStatus)`, `disabled: allowed.length === 1` (= final record). Edit with an unknown saved status sets the copied doc's status to `applied` so the select matches an option (edge case "unknown → applied"; review finding 1). `statusMeta.accepted` badge = `bg-info-subtle text-info` / dot `bg-info` (DESIGN.md §5.6, a color none of the other 4 use). |
| `src/i18n/index.ts` | `option.applicationStatus.accepted`: vi `Đã nhận việc`, en `Accepted`. |
| `src/pages/dashboard/PageApplication.spec.ts` | Fixtures for interview/offer/accepted/rejected/legacy `pending`; Modal stub gets `show`/`hide`; new describe: accepted badge text + 5 distinct badge classes, Add + Duplicate-of-offer → all 5 and not disabled, Edit of each saved status (+ legacy) → exact option list + disabled flag. Rows are found by the ItemActions `label` attr, not fixture index (review finding 4). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Node row added (IN_PROGRESS). |

Not mine, left untouched: `.claude/skills/todo/SKILL.md` (modified before this session, already in `git status` at session start). Analyst-owned: `agent-hub/doctrine/features/{INDEX,job-applications}.md`, `evidence/analyst/2026-11-25/…-spec.md`.

## Command
From repo root (`doctrine/MEMORY.md` Commands table): `npx vitest run src/pages/dashboard/PageApplication.spec.ts` (with `--reporter=verbose` to list cases), `npm run test`, `npm run lint`, `npm run build`, `npm run typecheck` (count `error TS` + grep for `application`). Final run after the review fixes.

## Output
```
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — CV profile per application > fills the profile select options from the candidate profiles
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — CV profile per application > shows public link + PDF only for an application whose profile still exists
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — CV profile per application > passes the shared CV language to the PDF link
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — CV profile per application > falls back to the email when no slug is set
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — CV profile per application > omits a since-deleted profile on save so the backend keeps the stored link
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > renders accepted with its own badge color
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > offers every status on Add and on Duplicate
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > edit of Acme offers only the allowed moves
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > edit of Int offers only the allowed moves
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > edit of Off offers only the allowed moves
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > edit of Acc offers only the allowed moves
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > edit of Rej offers only the allowed moves
 ✓ src/pages/dashboard/PageApplication.spec.ts > PageApplication — status transitions (#423) > edit of Legacy offers only the allowed moves
 Test Files  1 passed (1)
      Tests  13 passed (13)
---
 Test Files  70 passed (70)
      Tests  522 passed (522)
---

> resume-vuejs-website@1.45.0 lint
> eslint src --ext .js,.ts,.vue

lint exit 0
---
✓ built in 3.88s
---
74          ← npm run typecheck | grep -c "error TS"
       0    ← npm run typecheck | grep -E "application" | wc -l
---
277:            accepted: 'Đã nhận việc',
866:            accepted: 'Accepted',
```
Typecheck: 74 errors ≤ baseline 75 (`doctrine/MEMORY.md`), 0 in touched files.

## Live check (npm run dev, Vite started by me on :5173, stopped after; Playwright, prod API, QA account `qa.empty@example.com`)
Run BEFORE the review fixes; the fixes didn't change the checked paths except the unknown-status normalization (covered by the `Legacy` spec case).
1. Backend rules (curl, 2 throwaway records created then deleted, `DELETE … HTTP 200` ×2):
   - saved `interview` → PUT `applied`: `HTTP 400 {"code":"BAD_REQUEST","message":"Không thể đổi sang trạng thái này: trạng thái chỉ được tiến lên, và accepted hoặc rejected là trạng th…`
   - `interview` → `accepted`: HTTP 400 (same message) · `interview` → `offer`: HTTP 200 · `offer` → `accepted`: HTTP 200 · `accepted` → `interview`: HTTP 400 · `accepted` → `accepted` (company edited): HTTP 200.
2. UI on `/dashboard/application`:
   - `QA423 edited | badge="Đã nhận việc" bg-info-subtle text-info` · `QA423 int | badge="Phỏng vấn" bg-warning-subtle text-warning`
   - `edit QA423 edited: value=accepted disabled=true options=(empty),accepted`
   - `edit QA423 int: value=interview disabled=false options=(empty),interview,offer,rejected`
   - Edit the accepted record, change note, save: `status=accepted disabled=true submitDisabled=false; … note on card=true` → a final record still saves (Behavior 8, edge case "final record still editable").
3. 400 toast in the UI: NOT observed live. The UI no longer offers an invalid move, and forcing one by injecting a DOM `<option>` was reset by Vue's re-render (see Dead ends). Behavior 9 is existing code, unchanged by this diff: `src/services/base.ts:76-110` `_helper.error` toasts `err.error.message` + `details` with `bg: 'danger'`, and `updateDoc`'s callback (closes modal, updates list) runs only on success. The backend body shape seen in step 1 (`error.message`) is exactly what that reads.

## Acceptance
| Criterion | Evidence |
|---|---|
| `npx vitest run src/pages/dashboard/PageApplication.spec.ts` passes | `Tests  13 passed (13)` |
| accepted renders its label in a badge class different from the other four | `✓ … renders accepted with its own badge color` (asserts `t('option.applicationStatus.accepted')` text + `Set` of 5 badge classes has size 5); live: `bg-info-subtle text-info` |
| Options for Add, Duplicate of `offer`, Edit of each saved status = Behavior 8 lists | `✓ … offers every status on Add and on Duplicate`; `✓ edit of Acme/Int/Off/Acc/Rej/Legacy offers only the allowed moves` (it.each with exact `toEqual` lists) |
| status field `disabled` on Edit of accepted/rejected, not otherwise | same it.each asserts `disabled` true for Acc/Rej, false for the rest + Duplicate; live `disabled=true` / `disabled=false` |
| vi + en `option.applicationStatus.accepted` exist | grep: `277: accepted: 'Đã nhận việc'`, `866: accepted: 'Accepted'` |
| `npm run build` and `npm run lint` exit 0 | `✓ built in 3.88s`; `lint exit 0` |
| Manual (QA): edit an `interview` application → only Interview/Offer/Rejected | live: `options=(empty),interview,offer,rejected` (the empty one is FrmSelect's own "Please select" placeholder) |
| Manual (QA): a 400 from `PUT application/update` shows its message, modal stays open | Partial: backend 400 + message confirmed by curl; toast path is unchanged existing code (`base.ts:76-110`), not observed in the UI — see Live check 3 |
| Edge: unknown saved status → treated as applied | `✓ edit of Legacy …` (saved `pending` → applied list); doc copy normalized to `applied` in `showModalEditDoc` |
| Full suite still green | `Tests  522 passed (522)` |
| Typecheck ≤ baseline, none in touched files | 74 ≤ 75, 0 `application` hits |
| comments per code-comments.md | 3 comments added: JSDoc on exported `allowedStatuses` (Keep: exported API + WHY of the rule), `//` on `savedStatus` (why it drives options), `//` on the unknown-status normalization (why). No issue refs in source (the first draft had `(resume-nodejs-api#410)` in a stacked `//` pair — rewritten into the JSDoc without the ref). |

## Supersedes: none
`grep -n "423" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.

## Review
`/code-review medium` (forked, on the uncommitted diff) — no high-severity bugs; 6 findings:
1. Unknown saved status kept raw → empty-looking select, re-sends invalid status → **fixed** (`showModalEditDoc` normalizes to `applied`; spec `Legacy` case).
2. Duplicate copies a final status, so a duplicate of a rejected record starts final → **Noticed, not done** (spec Behavior 8 says Duplicate offers all statuses, which it does; changing the copied default is a product call).
3. Accepted = info blue next to offer green reads "less positive" → **Noticed, not done** (spec allows `info`/`accent`; `accent` is the UI's interactive color, so info avoids accepted looking like a link/button; operator can swap one class).
4. Spec helper picks rows by fixture index (stable-sort dependent) → **fixed** (find by ItemActions `label`).
5. `STATUS_RANK` duplicated option order → **fixed** (rank = option index).
6. `disabled` duplicated the final rule via `FINAL_STATUSES` → **fixed** (`allowed.length === 1`; `FINAL_STATUSES` no longer exported).

## Noticed, not done
- Review findings 2 and 3 above.
- Issue #423 still carries the `status: waiting-backend` label though backend #410 is closed and live — operator may drop it.

## Dead ends
- Forcing an invalid transition in the live UI by appending a DOM `<option value="applied">` and dispatching `input`: Vue's re-render dropped the injected option (`select now value=`), and the submit button went disabled (`btn disabled=true; reqs=`) → abandoned; 400 path argued from code + curl instead.
- Spec helper `c.props('label')` on the ItemActions stub → `7 failed` (the stub for an unimported global component declares no props, so `label` lands in attrs) → switched to `c.attributes('label')`.

## Seal gate: no outward-facing action from the code (no commit/push). Live check wrote only to the QA account `qa.empty@example.com` (2 throwaway applications created, then deleted, HTTP 200 ×2); owner account untouched.
