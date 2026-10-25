# 2026-10-25 - issue-309-cv-technology

- Worker: implementer
- Version: 0.1.0
- Node: `issue-309-cv-technology` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator via `/todo`): "backend đã done, hãy kiểm tra và tiến hành P2". This pass covers issue #309 "[QC][P2] CV công khai & Xem trước: Công nghệ dự án hiện mảng thô [ "Vue3", " Pinia" ]".

## Hub bytes before: 82009
(Same measurement as the sibling #307/#308 notes, taken from a clean `staging` tree.)

## Branch
`fix/issue-309-cv-technology`, created from up-to-date `staging` (`148b268`, v1.34.1) via `gh issue develop 309 --base staging --name fix/issue-309-cv-technology` (linked to #309). It is checked out in a separate git worktree (`../resume-vuejs-website-wt309`, `node_modules` symlinked) because the main checkout holds the uncommitted, sealed #307 diff.

## Acceptance criteria (from #309)
1. The public CV and Preview (both render `CvResumeLayout`) show project technologies as text, e.g. `Vue3, Pinia`, not `[ "Vue3", " Pinia" ]`.
2. No stray separator or empty text when the list is empty.
3. New saves store trimmed items with no empty entries.
4. Check the server-side PDF template for the same bug.

## Diff
| File | Why |
|---|---|
| `src/components/cv/CvResumeLayout.vue` | `{{ pj.technology }}` let Vue stringify the array as JSON. New `techList()` trims each item, drops empty ones and joins with `, `. A non-array value is passed through unchanged. The template uses it for the text and for the `v-if`s, so an empty array renders neither the span nor the ` · `. Trimming at render also fixes entries already stored with leading spaces (`" Pinia"`). One `//` WHY comment. |
| `src/pages/dashboard/PageProject.vue` | Save: `split(',')` → `split(',').map(s => s.trim()).filter(Boolean)`, so new data is stored clean. The edit path (`join(', ')`, lines 106/128) is unchanged and still round-trips. |
| `src/components/cv/CvResumeLayout.spec.ts` | New test: `['Vue3', ' Pinia', '']` + position → `Owner · Vue3, Pinia`; `[]` + position → `Dev` (no separator); no `[` anywhere. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

## Command
From the worktree root, per `doctrine/MEMORY.md`: `npm run test` · `npm run build` · `npm run typecheck`. Also `npx vitest run src/components/cv/CvResumeLayout.spec.ts`, once with and once without the `.vue` change (`git stash push src/components/cv/CvResumeLayout.vue`).

## Output
New spec without the fix (old `CvResumeLayout.vue`, stashed):
```
   × CvResumeLayout > lists project technologies as text, trimmed, not as a raw array 8ms
      Tests  1 failed | 6 passed (7)
```
With the fix:
```
 Test Files  1 passed (1)
      Tests  7 passed (7)
```
`npm run test`:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 8ms
 Test Files  1 failed | 44 passed (45)
      Tests  1 failed | 274 passed (275)
```
The one failure **pre-exists on `staging`** (baseline run recorded in `2026-10-25-issue-307-modal-save-close.md`). `VeeForm` is not touched here.

`npm run build`: `✓ built in 3.60s`

`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline); `grep -E "CvResumeLayout|PageProject"` → no match.

Server PDF check (read-only, `resume-nodejs-api` `origin/main`): `git grep -n technology origin/main -- src/services` →
```
src/services/createPDF.ats.ts:180: … ${p.technology.map(escapeHtml).join(', ')} …
src/services/createPDF.ts:383:            technology: skills,
```
The ATS PDF already joins the array. In the classic `createPDF.ts`, `technology` only appears as a skills field. No backend issue needed.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Text, not raw array | spec `toContain('Owner · Vue3, Pinia')` and `not.toContain('[')`; red before the fix, green after |
| 2. Empty list → no separator | spec `toContain('Dev')` for `technology: []` |
| 3. Trimmed on save | `PageProject.vue:75` diff. Not unit-tested: pages have no spec harness, and the line is a plain `split/map/filter` |
| 4. Server PDF | `createPDF.ats.ts:180` already `.join(', ')` |
| Tests / build / typecheck | `274 passed` + 1 pre-existing failure · `✓ built in 3.60s` · 90 = baseline |
| Comments per code-comments.md | One `//` comment stating WHY (stored as array, legacy spaces), no `(#N)` |

**Manual browser check: BLOCKED.** This is the same reason as in the #308 note: the Playwright-controlled Chrome window is `visibilityState: "hidden"`, so interactions don't fire, and the API's CORS only allows `:5173`, which runs the #307 checkout. The rendered public CV was not observed. The evidence is the component spec, which mounts the real `CvResumeLayout` that both `PagePublicResume.vue` and `PagePreview.vue` render.

## Supersedes: none
## Still open: none

## Noticed, not done
- Pre-existing `VeeForm.spec.ts` failure (see sibling note).

## Seal gate
None (no commit/push, no API write).

## REOPEN round 1 (verifier: `evidence/verifier/2026-10-25-issue-309-cv-technology-reopen.md`)
Two gaps cited, both closed:

**Criterion 2: empty list → no separator.** `expect(subs).toContain('Dev')` already compares whole array elements (`.text()` of each `.cv-item-sub`, trimmed), so `'Dev ·'` could not match it. An explicit assertion is now added to `CvResumeLayout.spec.ts:95`:
```
        expect(subs).toContain('Dev')
        expect(subs.join('|')).not.toContain('Dev ·')
```
Re-run with the fix: `Tests  7 passed (7)`. Re-run with `CvResumeLayout.vue` stashed (old template): `Tests  1 failed | 6 passed (7)`.

**Criterion 3: trimmed on save.** The exact expression from `PageProject.vue:75` (`grep -n "split(',')"` → `75:        val.technology = val.technology?.split(',').map(s => s.trim()).filter(Boolean)`), run on a messy input:
```
$ node -e "const v='Vue3, Pinia, ,'; console.log(JSON.stringify({before: v.split(','), after: v.split(',').map(s => s.trim()).filter(Boolean)}))"
{"before":["Vue3"," Pinia"," ",""],"after":["Vue3","Pinia"]}
```
→ the old save stored `[" Pinia", " ", ""]`; the new one stores `["Vue3","Pinia"]`.

Full suite after the change: `Tests  1 failed | 274 passed (275)`. The failure is the same pre-existing `VeeForm` test.

| Criterion | Evidence (updated) |
|---|---|
| 2. Empty list → no separator | `CvResumeLayout.spec.ts:95` `not.toContain('Dev ·')`; green with the fix, red on the old template |
| 3. Trimmed on save | `node -e` output above: `after":["Vue3","Pinia"]` for `'Vue3, Pinia, ,'` |
