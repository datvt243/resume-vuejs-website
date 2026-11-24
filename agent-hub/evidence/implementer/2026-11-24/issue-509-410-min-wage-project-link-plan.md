# 2026-11-24 - issue-509-410-min-wage-project-link

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-509-410-min-wage-project-link` (IN_PROGRESS)
- Branch: `feature/issue-509-410-min-wage-project-link` (off `staging` @ `8e1abd6`, synced with `git pull origin staging` → "Already up to date.", linked to #509 via `gh issue develop`)
- Task: #509 "Salary calculator: update regional minimum wages for 01/01/2027 (Nghị định 399/2026)" · #410 "fix(project): bỏ required cho field Link ở form Project" (`/todo #509, #410`)
- Status: **sealed_pending_verifier**
- Analyst pass 0: `evidence/analyst/2026-11-24/issue-509-410-min-wage-project-link-spec.md` — spec_ready after operator answers Q4 (ship now, `effectiveFrom '01/01/2027'`) and Q5 (base salary + family deduction unchanged). #410 backend dependency datvt243/resume-nodejs-api#364 is CLOSED.

## Hub bytes before
100381

## Feature doc
- `agent-hub/doctrine/features/salary-calculator.md` (#509 — Behavior 10, acceptance "(#509)" rows)
- `agent-hub/doctrine/features/cv-timeline-sections.md` (#410 — Behavior #7, #410 acceptance)

## Feature doc changed
None by the implementer (analyst wrote both docs this run).

## Diff
| File | Why |
|---|---|
| `src/utilities/salaryVn.ts` | `SALARY_VN.effectiveFrom` `'01/07/2026'` → `'01/01/2027'` (Q4); `regionalMinWage` → `{ 1: 5_700_000, 2: 5_080_000, 3: 4_450_000, 4: 4_040_000 }`; sources comment now cites Nghị định 399/2026/NĐ-CP from 01/01/2027 (293/2025 removed). Base salary + deductions unchanged (Q5) (#509) |
| `src/utilities/salaryVn.spec.ts` | 150,000,000 / 2 dependents case → insurance 5,947,000, PIT 26,153,550, net 117,899,450; new test asserting `effectiveFrom` + `regionalMinWage`; BHTN cap: region I 200M → 1,140,000, region IV 90M → 808,000; header comment date (#509) |
| `src/types/model.type.ts` | `defaultLink` drops `.required(_mesRequired)`; `url()` + `max(100)` kept. Only live caller is `src/models/project.model.ts:66` (certificate's is commented out, `certificate.model.ts:31`) (#410) |
| `src/models/project.model.spec.ts` | new `project model — link (issue #410)`: '' valid, valid URL valid, 'abc' → `validation.urlInvalid`, >100 chars invalid |
| `src/models/lengthRules.model.spec.ts` | existing "project link is required" test asserted the old rule → now '' valid, max 100 still enforced (#410) |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended (IN_PROGRESS) |

Not mine: `.claude/skills/todo/SKILL.md` was already modified before this run (gitStatus at session start) — not touched. `agent-hub/doctrine/features/{INDEX,salary-calculator,cv-timeline-sections}.md` were edited by the analyst pass.

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; per file `npx vitest run <path>`.

## Output
First full `npm run test` failed (old rule in `lengthRules.model.spec.ts`):
```
 FAIL  src/models/lengthRules.model.spec.ts > project link > is required and max 100 characters
AssertionError: expected true to be false // Object.is equality
 ❯ src/models/lengthRules.model.spec.ts:80:40
 Test Files  1 failed | 68 passed (69)
      Tests  1 failed | 488 passed (489)
```
After updating that spec:
```
npx vitest run src/utilities/salaryVn.spec.ts src/models/project.model.spec.ts
 ✓ src/utilities/salaryVn.spec.ts (13 tests) 21ms
 ✓ src/models/project.model.spec.ts (4 tests) 5ms
      Tests  17 passed (17)
npm run test
      Tests  489 passed (489)
npm run lint      → eslint src --ext .js,.ts,.vue, no output (exit 0)
npm run build     → ✓ built in 3.92s
npm run typecheck | grep -c "error TS" → 78 (baseline 78 on staging @ 13383c8)
npm run typecheck | grep -E "salaryVn|model.type|project.model" → (no lines)
grep -n "293/2025\|399/2026" src/utilities/salaryVn.ts
  12: * - Regional minimum wages from 01/01/2027: Nghị định 399/2026/NĐ-CP (BHTN cap = 20×)
```

## Acceptance
| Criterion | Evidence |
|---|---|
| (#509) `effectiveFrom === '01/01/2027'`, `regionalMinWage` = 2027 values | new spec test "uses the 01/01/2027 regional minimum wages" passes |
| (#509) 15M / 30M / 60M cases unchanged | `cases` rows untouched in the spec, pass |
| (#509) 150M, 2 dependents → 5,947,000 / 26,153,550 / 117,899,450 | spec row updated, passes (Gross→Net and Net→Gross) |
| (#509) region IV 90M → BHTN 808,000 | "BHTN cap follows the region" passes |
| (#509) round trip + netToGross still hold | sweep test (every region) + `net → gross` cases pass |
| (#509) no `293/2025`, has `399/2026` in salaryVn.ts | grep above |
| (#509) base salary + deductions unchanged (Q5) | `baseSalary: 2_530_000`, `personalDeduction: 15_500_000`, `dependentDeduction: 6_200_000` untouched in diff |
| (#410) empty Link saves without error | spec `valid({ link: '' })` → true; required asterisk is derived from the schema (`VeeForm.vue:130`, `.describe().optional`) so it disappears with the rule |
| (#410) invalid URL / >100 chars still error | spec: 'abc' rejects with `validation.urlInvalid`; 101+ chars false; `lengthRules` max-100 check passes |
| (#410) test for the model | `project.model.spec.ts` new describe |
| `npm run test`, `build`, `lint` pass; no new i18n keys | outputs above; diff adds no i18n keys |
| comments per `doctrine/standards/code-comments.md` | only the existing sources comment was edited (law citation, a why), no new comments |

Not checked live: no `npm run dev` run against the QA account (pure constants + one validation rule, both covered by specs). The salary page spec is unchanged and still passes in the full run.

## REOPEN round 1 fixes
Verifier REOPEN `evidence/verifier/2026-11-24/issue-509-410-min-wage-project-link-reopen.md`: (1) spec lacked `'  '` and the `validation.maxChars` message check; (2) #410 manual live check missing.

(1) `src/models/project.model.spec.ts` link test now: `''` valid, `'  '` valid, `'https://x.dev'` valid, `'abc'` rejects with `validation.urlInvalid`, `` `https://x.dev/${'a'.repeat(100)}` `` rejects with `validation.maxChars` (`toThrow('validation.maxChars')` — `withParams` packs the key as `validation.maxChars::{"max":100}`). Model still uses `defaultLink` (`project.model.ts:66`, no copy).
```
npx vitest run src/models/project.model.spec.ts
 ✓ src/models/project.model.spec.ts (4 tests) 6ms
      Tests  4 passed (4)
npm run test
 Test Files  69 passed (69)
      Tests  489 passed (489)
npm run lint      → no output (exit 0)
npm run typecheck | grep -c "error TS" → 78 (baseline 78)
```

(2) Live (`npm run dev` on :5173 started by Claude, prod API, `qa.empty@example.com`, debug Chrome 9888 via Playwright, tab visible), `/dashboard/project` → "Thêm dự án", filled name/position/technology/start date:
- Link label shows no required asterisk (labels read: `"Link"`).
- Link `abc` + blur → text under Link `"Link không đúng định dạng"`, Save (`Lưu`) `disabled` → click impossible, request log for `/api/v1/` empty.
- Link `''` → Save enabled, click → request log:
  `POST /api/v1/project/create {"type":"personal","experienceId":null,"name":"QA #410 empty link","position":"Dev","technology":["Vue"],…,"link":"",…}`
  then the list shows `QA #410 empty link · Dev · 11/2026 - 12/2026 · Cá nhân · Công nghệ: Vue`.
- Cleanup: deleted it via the row's Xóa → `DELETE /api/v1/project/delete/6b05864fe723df7884c1d3ef`, list back to "Chưa có dự án nào".
- Vite stopped after (`lsof -iTCP:5173 -sTCP:LISTEN | wc -l` → 0).

The "Not checked live" line above is superseded by this section.

## Supersedes: none
`grep -n "509\|410" haven/diagrams/dev-loop.prime-mermaid.md` → only this node; `grep -c "issue-509-410" haven/diagrams/dev-loop-archive.md` → 0.

## Review
`/code-review medium` done inline (diff is 5 small files): read the touched files in full + callers of `defaultLink` (`grep -rn defaultLink src` → project.model.ts:66, certificate.model.ts:31 commented) and readers of the schema's required flag (`VeeForm.vue:130`, `useProfileCompletion.ts:36` — project link no longer counts as a required field for profile completion, which matches #410). Findings: none. `SALARY_VN.effectiveFrom` shows 01/01/2027 a month early, accepted by the operator (Q4).

## Noticed, not done
- `_mesRequired` in `model.type.ts` is still used by other helpers — no dead code left.

## Seal gate
none — no commit/push/merge; the live check created + deleted one project on the QA account qa.empty (allowed by project memory), never the owner account.
