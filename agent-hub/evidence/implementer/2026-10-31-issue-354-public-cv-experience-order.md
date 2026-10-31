# 2026-10-31 — issue-354-public-cv-experience-order

- Worker: implementer · Version: 0.1.0
- Node: `issue-354-public-cv-experience-order` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "#354 [QC][P3] CV công khai: Kinh nghiệm không xếp theo thời gian (khác bản PDF)". Part of the operator's `/todo "fix các issue P3"` run (#353 shipped as PR #361).

## Hub bytes before: 2590620 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`)

## Branch
`fix/issue-354-public-cv-experience-order` (off `staging` @ `dac9d34`, via `gh issue develop 354`).

## Acceptance criteria
1. The public CV (`#/resume/:slug`) lists experience in the same order as the exported PDF, whatever order the API returns. Career breaks are interleaved by date.
2. A spec asserts the order with the issue's own example, and it fails without the fix.
3. Test/build/lint pass; typecheck stays at the baseline.

## Acceptance criteria clarified
The issue suggests "isCurrent desc then startDate desc … (education/projects too), matching the PDF". The PDF is the stated reference. In the API (`resume-nodejs-api/src/services/createPDF.ats.ts:150`, @ `e4451d4`) it sorts **only experience**, by `b.startDate - a.startDate`, with no `isCurrent` key, and leaves education/projects in API order. So "match the PDF" means: experience by `startDate` desc, and education/projects untouched. In the issue's data, the current job also has the latest start, so it lands first either way.

## Diff
| file | why |
|---|---|
| `src/components/cv/CvResumeLayout.vue` | new `experiences` computed: a copy of `props.data.experiences` sorted by `startDate` desc (same comparator as the PDF and `useCandidate.ts:107`, never mutates the prop). The section's `v-if`/`v-for` read it. 1-line why-comment. |
| `src/components/cv/CvResumeLayout.spec.ts` | new test: the issue's API order (JOBTEST 2022, FASTCODING 2014, Laidon 2024 current, a career break 05/2024) renders as Laidon → break → JOBTEST → FASTCODING |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

This layout is shared, so `PagePreview.vue` (the dashboard PDF-export preview) gets the same order. That's intended: it previews the PDF.

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/components/cv/CvResumeLayout.spec.ts`: `Tests  8 passed (8)`
- Same spec with the `.vue` change stashed: `AssertionError: expected [ 'JOBTEST', 'FASTCODING', …(2) ] to deeply equal [ 'Laidon', …(3) ]` / `Tests  1 failed | 7 passed (8)`
- `npm run test`: `Test Files  50 passed (50)` / `Tests  306 passed (306)`
- `npm run build`: `✓ built in 3.78s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS`, the same as the baseline. 0 in `CvResumeLayout.*`.

## Manual observation
Not done live. The spec mounts the real `CvResumeLayout` and checks the rendered titles.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Same order as the PDF | same comparator as `createPDF.ats.ts:150` |
| 2. Spec, red without the fix | stash run above |
| 3. test/build/lint/typecheck | as listed above |
| Comments per code-comments.md | One `//` why-comment above the new computed. No `(#N)` ref. Nothing else touched. |

## Supersedes: none
## Still open: none for #354

## Noticed, not done
- Education/projects stay in API order on both the public CV and the PDF. Sorting them would mean changing the PDF too (backend), so they'd stay consistent.
- The dashboard Experience list uses a manual browser-only order (#57), so it can still differ from the CV/PDF. That's by design.

## Seal gate
none (no commit/push; no data written)
