# 2026-11-25 — issue-516-export-json-skills-languages

- Worker: implementer · Version: 0.1.0 · Node: `issue-516-export-json-skills-languages` on `haven/diagrams/dev-loop.prime-mermaid.md` (IN_PROGRESS)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/516 (enhancement → feat)
- Branch: `feature/issue-516-export-json-resume` (cut from `staging` @ 624adcb, linked via `gh issue develop`)
- Status: sealed_pending_verifier

## Hub bytes before: 102998

## Feature doc: doctrine/features/cv-preview-export.md (Behavior 32–37, #516 acceptance criteria at lines 93–95, edge cases 120–122). Analyst spec: `evidence/analyst/2026-11-25/issue-516-export-json-skills-languages-spec.md` — no open questions.

## Diff
| File | Why |
|---|---|
| `src/utilities/cvSkills.ts` (new, untracked — must be `git add`-ed by /ship) | Shared `skillRows(gi, lang)` + `languageLevel(level, lang)`, moved verbatim from `CvResumeLayout.vue` (same row order, picked-name exclusion, `groupSkills` call, level translation via `t(..., {}, { locale })`), plus the 4 skill row labels vi/en moved out of the layout's `LABELS`. One source so the JSON can't drift from the CV (Behavior 33). |
| `src/components/cv/CvResumeLayout.vue` | `skillRows` computed → `cvSkillRows(generalInformation.value, props.lang)`; `languageLine` uses `languageLevel`; dropped `groupSkills` import + the 4 moved `LABELS` keys. Rendering unchanged. |
| `src/utilities/jsonResume.ts` | `toJsonResume` adds `skills` (`{ name: row.label, keywords: row.names }`) and `languages` (items with a `language` only, `compact({ language, fluency: languageLevel(level, lang) })` → empty level drops `fluency`). |
| `src/utilities/jsonResume.spec.ts` | Empty-CV test asserts `skills`/`languages` `[]`; new test with the doc's fixture asserts exact vi `skills`/`languages` and en labels/fluency (doc line 93). Fixture also has a professional skill without `name` and a language item without `language` (edge cases line 121, Behavior 35). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Node row added (IN_PROGRESS). |

## Command
From repo root (`doctrine/MEMORY.md` Commands table): `npx vitest run src/utilities/jsonResume.spec.ts src/components/cv/CvResumeLayout.spec.ts`, `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck`. Final run after the review fix (`i18n.global.t` → `t`).

## Output
```
 ✓ src/utilities/jsonResume.spec.ts (12 tests) 12ms
 ✓ src/components/cv/CvResumeLayout.spec.ts (12 tests) 77ms
 Test Files  2 passed (2)
      Tests  24 passed (24)
```
(first run, before the review fix; after it `npx vitest run src/utilities src/components/cv` → `Test Files  6 passed (6)` / `Tests  86 passed (86)` was run before the fix, and the full suite after it:)
```
npm run test
 Test Files  70 passed (70)
      Tests  514 passed (514)
npm run build
✓ built in 3.92s
npm run lint  → lint=0 (exit 0)
npm run typecheck → typecheck errors: 74   (grep -c 'error TS')
grep -cE 'cvSkills|jsonResume|CvResumeLayout' on typecheck output → 0
```
Typecheck: 74 ≤ baseline 75 (`doctrine/MEMORY.md` Typecheck row), none in changed files. First typecheck run had `src/utilities/cvSkills.ts(39,101): error TS2769 … Type 'string' is not assignable to type '"vi" | "en" | LocaleDetector<any[]> | undefined'` (Lang typed `'vi' | 'en' | string`) → fixed by `type Lang = 'vi' | 'en'`.

## Live check (npm run dev, Vite started by me on :5173, stopped after; Playwright, prod API)
`#/dashboard/preview`, "Xuất JSON Resume" clicked per CV language (radiogroup "Ngôn ngữ CV"), exported Blob read via a `URL.createObjectURL` hook, compared to `.cv-section` `li` text of the Skills / Languages sections, mapping JSON back to `<name>: <keywords joined ', '>` and `<language> (<fluency>)`:
- `qa.full@example.com` (confirmed `who` from localStorage user): vi `match: true` — 11 skill entries (`Languages`, `Vue ecosystem`, `SAP`, `Testing & Code Quality`, `Performance`, `Architecture & Practices`, `Backend`, `Tools & Workflow`, `AI-assisted Development`, `Familiar with`, `Kỹ năng cá nhân`), `languages: [{"language":"english","fluency":"Cơ bản"}]`; en `match: true` — last row `Personal skills`, `languages: [{"language":"english","fluency":"Basic"}]`.
- `qa.empty@example.com`: `"skills":[]`, `"languages":[]`, no CV sections on screen.
QA accounts only; owner account not used. Read-only (no writes).

## Acceptance
| Criterion (cv-preview-export.md) | Evidence |
|---|---|
| Line 93: jsonResume.spec covers exact vi `skills`/`languages`, en labels/fluency, `toJsonResume({})` `[]` | `jsonResume.spec.ts` "exports skills and languages as the CV layout shows them" + empty-CV asserts; 12/12 pass, Output above |
| Line 94: `CvResumeLayout.spec.ts` passes unchanged | file not in diff; 12/12 pass |
| Line 95: live qa.full JSON = screen rows in vi and en; qa.empty `[]` | Live check above, `match: true` ×2, `[]`/`[]` |
| Behavior 34: picked main/familiar names left out of groups; no `level`/years | spec fixture: `Vue` (main) not in `Frontend`, no `Backend` entry (`Go` familiar); output objects only `name`/`keywords` |
| Behavior 35: unknown level as stored, empty level no `fluency`, no-language item skipped | spec: `French`→`fluent`, `German` has no `fluency`, `{language:'', level:'basic'}` absent |
| Behavior 37: import unchanged | `fromJsonResume` not in diff; its tests pass in the 12 |
| Comments per `doctrine/standards/code-comments.md` | new file: JSDoc on 2 exports + 1-line file overview, one `//` why-comment (picked exclusion); no issue refs |
| Build / lint / typecheck | Output above |

## Supersedes: none
`grep '#516\|issue-516' haven/diagrams/dev-loop.prime-mermaid.md` → only this node.

## Review
`/code-review medium` on the working-tree diff. 7 findings:
1. Export skips a language item with empty `language` while the layout prints ` (Cơ bản)` → **as specified** (Behavior 35, analyst's surfaced judgment call); layout behavior #20 left unchanged (out of scope) → Noticed, not done.
2. `languageLine` prints `undefined (Khá)` when `language` key missing → pre-existing layout behavior, unchanged → Noticed, not done.
3. `SKILL_LABELS` duplicates i18n `generalInfo.mainSkills` etc. → false positive by design: CLAUDE.md "Not i18n: CvResumeLayout's own lang-prop labels", Behavior 19 says labels are layout-local. Moved, not duplicated (removed from the layout).
4. `i18n.global.t` vs the convention `import { t } from '@/i18n'` → **fixed** (cvSkills.ts line 7/39); tests/build/lint/typecheck re-run after (Output).
5. Duplicate names not de-duplicated within a row → pre-existing layout behavior, export mirrors it (Behavior 33 "same content") → Noticed.
6. `lang` other than `vi`/`en` falls back to vi labels → same as the old layout (`isEn` check); Noticed.
7. `cvSkills.ts` untracked → reminder for /ship to `git add` it.

## Noticed, not done
- CV layout prints a language item with empty/missing `language` as ` (level)` / `undefined (level)`; the export skips it. Could filter in the layout too (separate small issue if wanted).
- Duplicate skill names in one row print/export twice.

## Dead ends: none

## Seal gate: no outward-facing action (no commit/push/real write API call). Live check was read-only on QA accounts.
