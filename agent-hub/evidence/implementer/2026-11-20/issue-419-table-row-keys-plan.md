# 2026-11-20 - issue-419-table-row-keys
- Worker: implementer · Version: 0.1.0
- Node: `issue-419-table-row-keys` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#419 Languages / Personal skills tables: every row has the same key `doc_undefined` — src/components/table/TableDefault.vue:145 keys rows with `doc_${doc._id}`, but foreignLanguages/personalSkills items have no _id. Expected: a unique key per row (e.g. index, or a generated id) when _id is missing. Branch: fix/issue-419-languages-personal-skills"
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/419

## Branch
`fix/issue-419-languages-personal-skills` (cut from synced `staging` via `gh issue develop 419 --base staging`)

## Hub bytes before
100253

## Feature doc
`doctrine/features/cv-languages.md` — Behavior unchanged (display/edit of the list); the fix is internal row identity in the shared table. Not edited.

## Design choice
Index key (the issue's first suggestion) was tried and rejected: it would make keys distinct but NOT fix the issue's real symptom ("can patch the wrong row after a delete") — with index keys, deleting row 2 of 3 still reuses row 2's element for row 3. Also verified by probe that Vue emits NO "Duplicate keys" warning in this case (all keys equal → patchKeyedChildren syncs from the start, never reaches the keyed-map step), so a test asserting "no warning" passes even without a fix — useless. Chosen: key `_id`-less rows by object identity via a `WeakMap` over `toRaw(doc)`. Identity holds because both mutation paths keep element references: `rows` sort uses `[...props.modelValue].sort(...)` (TableDefault.vue:69) and the delete path uses `[...generalInformationField.value]` + `splice` (VeeFormGeneralInformationUpdate.vue:127-129).

## Diff
| File | Why |
|---|---|
| `src/components/table/TableDefault.vue` | `rowKey(doc)`: `doc_${_id}` when present, else `row_<n>` from a WeakMap keyed by raw object; `:key="rowKey(doc)"`; `toRaw` import |
| `src/components/table/TableDefault.spec.ts` | Regression test: 3 rows without `_id`, remove the middle one → the German row keeps its `<tr>` element |

## Command
From `doctrine/MEMORY.md`: `npm run test`, `npx vitest run <path>`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Output
Red without fix (`git stash push src/components/table/TableDefault.vue`, spec kept):
```
   × TableDefault > keys rows without _id by identity, so removing one keeps the next row's element 10ms
      Tests  1 failed | 6 passed (7)
```
Green with fix:
```
      Tests  7 passed (7)
```
`npm run build` → `✓ built in 3.98s` (pre-existing chunk-size warning only)
`npm run test` → `Test Files  58 passed (58)` / `Tests  383 passed (383)`
`npm run lint` → `lint exit 0`
`npm run typecheck 2>&1 | grep -cE "error TS"` → `78`; `| grep TableDefault` → no output

## Acceptance
| Criterion | Evidence |
|---|---|
| Rows without `_id` get distinct keys | `rowKey` assigns `row_<counter>` per raw object (diff above) |
| Removing a middle row doesn't patch the wrong row | Spec red (`1 failed`) without fix, green (`7 passed`) with |
| Build/test/lint green | `✓ built in 3.98s`, `383 passed`, `lint exit 0` |
| Typecheck ≤ baseline 78, none in touched files | `78`, grep TableDefault empty |
| Comments per code-comments.md | One `//` WHY line above `rowKey`; one `//` in spec explaining the check; no issue refs |
| UI/route loads on `npm run dev` | Not done — no browser session in this pass; covered by the mounted-component spec. Disclosed. |

## Supersedes
none (`grep -n "419" haven/diagrams/dev-loop.prime-mermaid.md` had no prior row)

## Still open
none

## Review
Inline review (diff is 2 files; callers read: `VeeFormGeneralInformationUpdate.vue`, `PageReference.vue`, `FormSection.vue` only mention TableDefault in a comment). Findings: (1) first draft used `rowIds.size` — WeakMap has no `size` → would key every row `row_0`; fixed with a counter before any test run. (2) Reactive proxies: `toRaw` used so proxy vs raw of the same row map to one key. (3) Rows WITH `_id` keep the exact old key `doc_${_id}` — no behavior change for other tables. No security impact.

## Noticed, not done
- `numberFormat = new Intl.NumberFormat('vi-VN')` in TableDefault.vue — related to #455 territory, not touched.

## Seal gate
none — no outward-facing action.
