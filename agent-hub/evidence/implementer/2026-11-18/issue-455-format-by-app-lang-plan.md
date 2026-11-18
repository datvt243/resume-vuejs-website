# 2026-11-18 - issue-455-format-by-app-lang

- Worker: implementer · Version: 0.1.0
- Node: `issue-455-format-by-app-lang` on `haven/diagrams/dev-loop.prime-mermaid.md` (IN_PROGRESS)
- Branch: `fix/issue-455-format-dates-and` (off `staging` @ 5ddfcb3, linked to #455 via `gh issue develop`)
- Task: "#455 Format dates and numbers with the app language, not always `vi-VN`. Problem: Visits (table dates, KPIs) and Home (KPI numbers, chart) always format with `vi-VN`, even when the app language is English. Expected: Use the current app language (`uiLang`): `vi-VN` for Vietnamese, `en-US` for English. Decided by the operator while confirming agent-hub/doctrine/features/cv-visits.md (2026-11-07)."

## Hub bytes before: 98994

## Feature doc: doctrine/features/cv-visits.md
Behavior #8 said the table time uses `vi-VN` format. Open question 3 (operator 2026-11-07): "Bug: format by app language — #455" — explicit operator answer, so the doc is edited in this diff.

## Feature doc changed
Behavior #8 now says date + `hh:mm` in the app language's format (`vi-VN`/`en-US`); `## Changelog` row 2026-11-18 added. Behavior #4 (chart axis labels `DD/MM`, `MM/YYYY`) unchanged — hand-built strings, not `Intl`, and not what Q3 asked about.

## Acceptance criteria
1. Visits: KPI numbers, row-range label, breakdown counts, delete-all count and table date/time use `vi-VN` when `uiLang` = `vi`, `en-US` when `en`, and update live on a language switch.
2. Home: KPI numbers (views, applications) and the views total above the chart use the same locale rule.
3. No `'vi-VN'` literal left in `PageVisits.vue` / `PageHome.vue`.
4. A spec covers the switch (numbers + table time, vi → en) and fails with the fix reverted.
5. `npm run test`, `npm run build`, `npm run lint` green; `npm run typecheck` ≤ 78 errors, none in touched files.
6. UI change → changed files compile/serve on `npm run dev`.
7. Comments per code-comments.md.

## Diff
| File | Why |
|---|---|
| `src/i18n/index.ts` | new `uiLocale = computed(() => (uiLang.value === 'en' ? 'en-US' : 'vi-VN'))` next to `uiLang`, one-line JSDoc; `computed` added to the vue import |
| `src/pages/dashboard/PageVisits.vue` | `numberFormat`, `dateFormat`, `timeFormat` → `computed(() => new Intl.…(uiLocale.value, …))`; script uses `.value.format(` (template keeps `numberFormat.format`, auto-unwrapped) |
| `src/pages/home/PageHome.vue` | `numberFormat` → same computed; script uses `.value.format(` |
| `src/pages/dashboard/PageVisits.spec.ts` | new test "formats numbers and visit times in the app language": total 1234 → `1.234` (vi) then `1,234` (en); table time equals `Intl` vi-VN then en-US output; resets `uiLang` in `finally` |

## Command
- `npx vitest run src/pages/dashboard/PageVisits.spec.ts`
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npx vite --port 5173 --strictPort` + `curl` of the 3 changed source files (server started by me, killed after)

## Output
`npx vitest run src/pages/dashboard/PageVisits.spec.ts`, with fix:
```
 ✓ src/pages/dashboard/PageVisits.spec.ts (11 tests) 124ms

 Test Files  1 passed (1)
      Tests  11 passed (11)
```
Mutation check — `uiLocale.value` replaced by `"vi-VN"` in `PageVisits.vue` (sed), then restored from a scratchpad copy:
```
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected 'Profile visitsEach time someone opens…' to contain '1,234'
      Tests  1 failed | 10 passed (11)
```
After restore: `Tests  11 passed (11)`.

`npm run test`:
```
 Test Files  58 passed (58)
      Tests  379 passed (379)
```
`npm run build | tail -4`:
```
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.94s
```
`npm run lint` → `lint exit 0`.
`npm run typecheck | grep -c "error TS"` → `78`; `grep -E "PageVisits|PageHome|i18n/index"` on its errors → no lines (grep exit 1).

Dev server (base `/resume-vuejs-website/`), HTTP status per changed file:
```
src/pages/dashboard/PageVisits.vue 200
src/pages/home/PageHome.vue 200
src/i18n/index.ts 200
```
No browser click-through (compile/serve check only; the live switch is covered by the spec).

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 Visits locale + live switch | spec passes: `1.234` → `1,234` and table time vi-VN → en-US after `uiLang.value = 'en'`; every `numberFormat`/`dateFormat`/`timeFormat` in `PageVisits.vue` reads the computed (diff) |
| 2 Home locale | `PageHome.vue:24` computed on `uiLocale`, used at :48, :60, :135 (diff). No PageHome spec exists; same pattern as Visits |
| 3 No literal | `grep "vi-VN"` in both pages → none (only `i18n/index.ts` maps it) |
| 4 Spec fails reverted | mutation output above |
| 5 Commands | 379 passed (58 files); ✓ built in 3.94s; lint exit 0; typecheck 78 = baseline, none in touched files |
| 6 Dev compile | 200 ×3 above |
| 7 Comments per code-comments.md | one JSDoc line on `uiLocale` (says what it's for); no other comments |

## Supersedes: none
`grep "455"` on the active diagram: only this node.

## Review
Inline review (small diff): read `PageVisits.vue`, `PageHome.vue` script in full, and `uiLang`/`resolveCvLang` (`uiLang` only ever `vi`|`en`, so the ternary covers every value). Template uses of `numberFormat.format` work because top-level refs auto-unwrap in `<script setup>` templates (breakdown counts, Home total). No correctness findings.

## Noticed, not done
- `src/components/table/TableDefault.vue:82` (`NumberFormat('vi-VN')`), `:56` (`Collator('vi')`) and `src/components/convert/part/toDate.js:9` (`DateTimeFormat('vi-VN')`) — generic tables outside #455's Visits/Home scope; could reuse `uiLocale` in a follow-up.
- Chart axis labels (`formatBucket`, `DD/MM` / `MM/YYYY`) and y-axis tick numbers are hand-built, not locale-formatted — documented as-is in Behavior #4.

## Seal gate: none (no commit/push/API call)
