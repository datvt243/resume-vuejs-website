# 2026-11-02 - nodata-dashed-border

- Worker: implementer · Version: 0.1.0
- Node: `nodata-dashed-border`
- Branch: `feature/nodata-dashed-border`, off `origin/staging` @ `47046da`
- Issue: none. These are operator follow-ups in-session, with no GitHub issue.
- Task (verbatim, 2 operator messages):
  1. "hãy commit all changed". This committed the operator's own uncommitted `NoData.vue` + `DESIGN.md` §5.8 edit (dashed border) as `b8d4e5e`. `QC_TESTER.md` is untracked and was left out.
  2. "ok, bỏ các box bọc ngoài rồi ship". This followed my note that every caller still wrapped NoData in its own bordered box, giving a double border.

## Hub bytes before
84577

## Acceptance criteria
1. `NoData` draws a rounded, dashed `border-line` box on `surface-2` (b8d4e5e). DESIGN.md §5.8 matches.
2. No caller wraps `NoData` in another `rounded-md border border-line bg-surface` box. Where the wrapper carried `role="alert"` (LoadingGate error, PageVisits error), the div stays with its role and only the box classes go. Where it carried `v-else` (PickedSkills, PageSkills), the directive moves onto `<NoData>`.
3. Table empty rows (`TableDefault`, PageVisits table) are unchanged. They are cells, not wrapper boxes.
4. Tests, build and lint pass. Typecheck stays at or below 90, with none in changed files.

## Diff (on top of b8d4e5e)
| file | change |
|---|---|
| `src/pages/dashboard/Page{Education,Experience,Project,Award,Certificate,Reference,Application,Profile}.vue` | Removed the `<div class="rounded-md border border-line bg-surface">` around `<NoData>…</NoData>` and de-indented its content. |
| `src/components/global/LoadingGate.vue`, `src/pages/dashboard/PageVisits.vue` | Error wrapper: `class="rounded-md border border-line bg-surface"` removed, `role="alert"` kept. |
| `src/components/PickedSkills.vue`, `src/pages/dashboard/PageSkills.vue` | `<div v-else class="…"><NoData /></div>` → `<NoData v-else />`. This reverts the wrapper added in `issue-374-nodata-box`, which NoData itself now supersedes. |
| `src/components/global/NoData.spec.ts` (new) | The root has `rounded-md border border-dashed border-line` and the default text "Chưa có dữ liệu". |
| `src/components/PickedSkills.spec.ts`, `src/pages/dashboard/PageSkills.spec.ts` | The two "bordered wrapper" assertions from `issue-374-nodata-box` now assert the empty state renders with no `.border-line` ancestor. The filled case still shows no empty state. |

Grep after: `grep -rn -B1 "<NoData" src | grep "rounded-md border border-line bg-surface"` → no output.

## Command
`npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`. Live: Playwright as `qa.empty@example.com` (empty lists) in a separate context, read-only (I watched for PATCH/PUT/DELETE: none).

## Output
- First test run after removing the wrappers: `2 failed | 320 passed`. The failures were the two specs asserting the old wrapper, as expected. I updated them and added the NoData spec.
- Final: `Tests  323 passed (323)` | `✓ built in 3.79s` | `lint=0` | typecheck `90`. A grep over NoData, LoadingGate, PickedSkills and the 11 pages gives no output (`grep-exit=1`).
- Live, I listed each bordered element containing "Chưa có":
  - education: `["dashed:flex flex-col items-center rounded-md bo"]`
  - skills: only `dashed:…` (NoData) entries, plus `solid:modal-content`. Those are the closed picker modals, which contain NoData text but are not wrappers.
  - writes: `[]`
  - So no solid wrapper box surrounds any empty state. Screenshots: `.playwright-mcp/nodata-skills.png` and `.playwright-mcp/nodata-education.png`, one dashed box per empty section.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | NoData spec; diff of b8d4e5e (DESIGN.md §5.8 + NoData root classes) |
| 2 | grep after = empty; diff table; live border list |
| 3 | TableDefault and PageVisits table untouched (not in diff) |
| 4 | outputs above |
| comments per code-comments.md | NoData spec name states the contract (callers must not wrap) |

## Supersedes
The wrapper part of `issue-374-nodata-box`. NoData now draws the box itself.

## Noticed, not done
- NoData inside table empty rows now shows a dashed box within the table. I left it as is, since it isn't a wrapper.

## Seal gate
`/ship` requested by the operator after the verifier.
