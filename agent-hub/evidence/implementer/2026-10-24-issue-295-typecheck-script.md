# 2026-10-24 - issue-295-typecheck-script

- Worker: implementer
- Version: 0.1.0
- Node: `issue-295-typecheck-script` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, issue #295): "[MEDIUM] DevOps: Không có lệnh typecheck — thêm vue-tsc + script typecheck. Việc cần làm: 1) thêm vue-tsc vào devDependencies; 2) thêm script "typecheck": "vue-tsc --noEmit"; 3) chạy lần đầu, ghi số lỗi hiện có — lỗi có sẵn từ trước tách issue riêng, không sửa chung diff; 4) cập nhật dòng Typecheck trong agent-hub/doctrine/MEMORY.md thành npm run typecheck; 5) (tuỳ chọn) thêm bước typecheck vào CI. Acceptance: npm run typecheck chạy được, output đọc lại nguyên văn trong evidence note; MEMORY.md không còn CANNOT RUN ở dòng Typecheck."

## Hub bytes before: 85021
(Root files + `doctrine/` + active diagram + `haven/workers/`, measured right after appending the node row (85282) minus that row (261 bytes).)

## Branch
`fix/issue-295-typecheck-script`, created from up-to-date `staging` (v1.34.0, `de06066`) via `gh issue develop 295 --checkout --base staging` (linked to #295).

## Diff
| File | Why |
|---|---|
| `package.json` | devDependency `vue-tsc: ^3.3.13` (`npm install -D vue-tsc`); script `"typecheck": "vue-tsc --noEmit"`. |
| `package-lock.json` | npm's resolution for vue-tsc + its deps (`@volar/*` 2.4.28, `@vue/language-core` 3.3.13, `alien-signals`, `muggle-string`, `path-browserify`, `vscode-uri`). npm also re-resolved patch versions of existing transitive deps: `@babel/{parser,types,helper-string-parser}` 7.29.7/8 → 7.29.11, `source-map-js` 1.2.1 → 1.2.2, and dropped the nested `tailwindcss/node_modules/yaml` 2.9.1. |
| `agent-hub/doctrine/MEMORY.md` | `Typecheck` row → `npm run typecheck` with the 90-error baseline and the "no new errors" rule; `CI` row → why CI has no typecheck step yet (old `ERR_PACKAGE_PATH_NOT_EXPORTED` reason is obsolete). |
| `agent-hub/CLAUDE.md` | Removed the `[vuejs, 2026-10-07] Transitional` paragraph — it says itself to remove it "when `doctrine/MEMORY.md` gets a real Typecheck command". |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

`yarn.lock`: npm rewrote it on both `npm install` and `npm ci`; reverted each time (`git checkout yarn.lock`) — out of scope (implementer MEMORY: never touch yarn unless the task asks). Final `git status --short` shows no `yarn.lock`.

CI step (task item 5, optional): **not added** — the 90-error baseline would make `npm run typecheck` exit 2 and turn every CI run red.

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run typecheck` (new)

## Output
`npm run typecheck` (full output, verbatim — REOPEN round 1 fix; last line is the shell exit code appended by `echo "exit=$?"`):
```

> resume-vuejs-website@1.34.0 typecheck
> vue-tsc --noEmit

src/components/global/ItemTemplate.vue(47,31): error TS2551: Property 'image' does not exist on type 'Props'. Did you mean 'img'?
src/components/global/ItemTemplate.vue(47,85): error TS2551: Property 'image' does not exist on type 'Props'. Did you mean 'img'?
src/composables/useCandidate.ts(66,44): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/composables/useCandidate.ts(74,57): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/composables/useCandidate.ts(77,13): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<string, any> | Record<string, any>[]'.
src/composables/useDownloadCv.spec.ts(19,57): error TS2345: Argument of type '(a: HTMLAnchorElement) => string' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => string'.
  Types of parameters 'a' and 'value' are incompatible.
    Type 'unknown' is not assignable to type 'HTMLAnchorElement'.
src/composables/useDownloadCv.ts(22,17): error TS2339: Property 'firstName' does not exist on type '{}'.
src/composables/useDownloadCv.ts(22,33): error TS2339: Property 'lastName' does not exist on type '{}'.
src/composables/useDownloadCv.ts(42,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Blob | MediaSource'.
src/composables/useDownloadCv.ts(50,13): error TS2349: This expression is not callable.
  Type '{}' has no call signatures.
src/composables/useProfileCompletion.ts(74,73): error TS2339: Property 'value' does not exist on type 'ComputedRef<any> | Ref<Record<string, any> | Record<string, any>[]> | ((_id: string) => void) | ((data: { [key: string]: any; _id: string; }) => void) | ((props: { ...; }) => void)'.
  Property 'value' does not exist on type '(_id: string) => void'.
src/composables/useProfileCompletion.ts(75,76): error TS2339: Property 'value' does not exist on type 'ComputedRef<any> | Ref<Record<string, any> | Record<string, any>[]> | ((_id: string) => void) | ((data: { [key: string]: any; _id: string; }) => void) | ((props: { ...; }) => void)'.
  Property 'value' does not exist on type '(_id: string) => void'.
src/composables/useProfileCompletion.ts(76,67): error TS2339: Property 'value' does not exist on type 'ComputedRef<any> | Ref<Record<string, any> | Record<string, any>[]> | ((_id: string) => void) | ((data: { [key: string]: any; _id: string; }) => void) | ((props: { ...; }) => void)'.
  Property 'value' does not exist on type '(_id: string) => void'.
src/composables/useProfileCompletion.ts(77,61): error TS2339: Property 'value' does not exist on type 'ComputedRef<any> | Ref<Record<string, any> | Record<string, any>[]> | ((_id: string) => void) | ((data: { [key: string]: any; _id: string; }) => void) | ((props: { ...; }) => void)'.
  Property 'value' does not exist on type '(_id: string) => void'.
src/composables/useProfileCompletion.ts(78,79): error TS2339: Property 'value' does not exist on type 'ComputedRef<any> | Ref<Record<string, any> | Record<string, any>[]> | ((_id: string) => void) | ((data: { [key: string]: any; _id: string; }) => void) | ((props: { ...; }) => void)'.
  Property 'value' does not exist on type '(_id: string) => void'.
src/composables/useProfileCompletion.ts(79,73): error TS2339: Property 'value' does not exist on type 'ComputedRef<any> | Ref<Record<string, any> | Record<string, any>[]> | ((_id: string) => void) | ((data: { [key: string]: any; _id: string; }) => void) | ((props: { ...; }) => void)'.
  Property 'value' does not exist on type '(_id: string) => void'.
src/composables/useVisitStats.ts(70,32): error TS2352: Conversion of type 'Document | Document[]' to type 'VisitStats' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Document[]' is missing the following properties from type 'VisitStats': interval, total, series, countries, sources
src/main.ts(49,20): error TS18046: 'err' is of type 'unknown'.
src/pages/dashboard/PagePreview.spec.ts(51,23): error TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
src/plugins/initFontAwesomeIcon.spec.ts(74,42): error TS2339: Property 'definitions' does not exist on type 'Library'.
src/services/auth.ts(14,35): error TS7006: Parameter 'values' implicitly has an 'any' type.
src/services/auth.ts(14,43): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/auth.ts(38,22): error TS18046: 'loginRes' is of type 'unknown'.
src/services/auth.ts(42,47): error TS18046: 'loginRes' is of type 'unknown'.
src/services/auth.ts(49,44): error TS18046: 'candidateRes' is of type 'unknown'.
src/services/auth.ts(67,44): error TS7006: Parameter 'values' implicitly has an 'any' type.
src/services/auth.ts(67,52): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/auth.ts(86,22): error TS18046: 'res' is of type 'unknown'.
src/services/auth.ts(90,17): error TS2339: Property 'message' does not exist on type 'unknown'.
src/services/auth.ts(103,43): error TS7006: Parameter 'values' implicitly has an 'any' type.
src/services/auth.ts(103,51): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/auth.ts(124,22): error TS18046: 'res' is of type 'unknown'.
src/services/auth.ts(130,17): error TS2339: Property 'message' does not exist on type 'unknown'.
src/services/auth.ts(143,38): error TS7006: Parameter 'values' implicitly has an 'any' type.
src/services/auth.ts(143,46): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/auth.ts(166,22): error TS18046: 'res' is of type 'unknown'.
src/services/auth.ts(172,17): error TS2339: Property 'message' does not exist on type 'unknown'.
src/services/axios.spec.ts(14,16): error TS7006: Parameter 'config' implicitly has an 'any' type.
src/services/axios.spec.ts(14,24): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/services/axios.spec.ts(14,32): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/services/axios.ts(32,5): error TS7034: Variable '_refreshPromise' implicitly has type 'any' in some locations where its type cannot be determined.
src/services/axios.ts(46,28): error TS7006: Parameter 'body' implicitly has an 'any' type.
src/services/axios.ts(64,22): error TS7005: Variable '_refreshPromise' implicitly has an 'any' type.
src/services/axios.ts(81,29): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/base.ts(12,34): error TS7006: Parameter 'axiosOptions' implicitly has an 'any' type.
src/services/base.ts(12,48): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/base.ts(12,55): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/services/base.ts(16,66): error TS7006: Parameter 'axiosOptions' implicitly has an 'any' type.
src/services/base.ts(16,80): error TS7006: Parameter 'toast' implicitly has an 'any' type.
src/services/base.ts(16,87): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/services/base.ts(24,30): error TS2339: Property 'data' does not exist on type '{ method: any; url: any; }'.
src/services/base.ts(25,32): error TS2339: Property 'params' does not exist on type '{ method: any; url: any; }'.
src/services/base.ts(33,26): error TS2339: Property 'success' does not exist on type '{}'.
src/services/base.ts(43,33): error TS7006: Parameter 'axiosOptions' implicitly has an 'any' type.
src/services/base.ts(43,47): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/base.ts(43,54): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/services/base.ts(43,64): error TS7006: Parameter 'action' implicitly has an 'any' type.
src/services/base.ts(65,17): error TS7006: Parameter 'props' implicitly has an 'any' type.
src/services/base.ts(68,18): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/services/base.ts(75,16): error TS7006: Parameter 'err' implicitly has an 'any' type.
src/services/base.ts(96,46): error TS2339: Property 'message' does not exist on type '{}'.
src/stores/auth.ts(38,70): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/stores/auth.ts(80,14): error TS2339: Property 'router' does not exist on type '{}'.
src/stores/auth.ts(83,22): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/stores/candidate.ts(10,27): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/stores/candidate.ts(10,32): error TS7006: Parameter 'document' implicitly has an 'any' type.
src/stores/candidate.ts(22,27): error TS2339: Property 'password' does not exist on type '{}'.
src/stores/candidate.ts(23,20): error TS2339: Property 'gender' does not exist on type '{}'.
src/stores/candidate.ts(23,40): error TS2339: Property 'gender' does not exist on type '{}'.
src/stores/candidate.ts(24,20): error TS2339: Property 'marital' does not exist on type '{}'.
src/stores/candidate.ts(24,41): error TS2339: Property 'marital' does not exist on type '{}'.
src/stores/candidate.ts(29,26): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/stores/candidate.ts(31,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/stores/candidate.ts(38,45): error TS2339: Property '_id' does not exist on type '{}'.
src/stores/candidate.ts(44,47): error TS2339: Property 'generalInformation' does not exist on type '{}'.
src/stores/candidate.ts(51,35): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/stores/candidate.ts(52,37): error TS2339: Property 'generalInformation' does not exist on type '{}'.
src/stores/candidate.ts(53,45): error TS2339: Property 'generalInformation' does not exist on type '{}'.
src/stores/candidate.ts(55,45): error TS2339: Property 'generalInformation' does not exist on type '{}'.
src/stores/candidate.ts(62,52): error TS2339: Property 'educations' does not exist on type '{}'.
src/stores/candidate.ts(63,26): error TS7006: Parameter 'edus' implicitly has an 'any' type.
src/stores/candidate.ts(64,19): error TS2339: Property 'educations' does not exist on type '{}'.
src/stores/candidate.ts(70,48): error TS2339: Property 'awards' does not exist on type '{}'.
src/stores/candidate.ts(71,22): error TS7006: Parameter 'awards' implicitly has an 'any' type.
src/stores/candidate.ts(72,19): error TS2339: Property 'awards' does not exist on type '{}'.
src/stores/candidate.ts(78,33): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/stores/candidate.ts(79,16): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/stores/candidate.ts(81,33): error TS7006: Parameter 'fields' implicitly has an 'any' type.
src/stores/candidate.ts(83,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/stores/candidate.ts(89,20): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
exit=2
```
`grep -c "error TS"` → `90`.

By code: 37 TS7006 · 31 TS2339 · 7 TS18046 · 5 TS7053 · 3 TS2345 · 2 TS2551 · 1 each TS7034/TS7005/TS2683/TS2352/TS2349.
By file: 26 `src/stores/candidate.ts` · 17 `src/services/base.ts` · 17 `src/services/auth.ts` · 6 `src/composables/useProfileCompletion.ts` · 4 `src/services/axios.ts` · 4 `src/composables/useDownloadCv.ts` · 3 `src/stores/auth.ts` · 3 `src/services/axios.spec.ts` · 3 `src/composables/useCandidate.ts` · 2 `src/components/global/ItemTemplate.vue` · 1 each `src/plugins/initFontAwesomeIcon.spec.ts`, `src/pages/dashboard/PagePreview.spec.ts`, `src/main.ts`, `src/composables/useVisitStats.ts`, `src/composables/useDownloadCv.spec.ts`.

All 90 are pre-existing by construction: the diff touches no file under `src/`.

`npm run test`:
```
      Tests  1 failed | 273 passed (274)
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
AssertionError: expected 'VI' to contain '!'
```
Flaky (1–3 failures across runs, all in `VeeForm.spec.ts`). **Pre-existing:** a clean `git worktree` of `origin/staging` with its own `npm ci` gave `Tests  1 failed | 273 passed (274)` three runs in a row, same test failing. Not caused by this diff.

`npm run lint`:
```
> resume-vuejs-website@1.34.0 lint
> eslint src --ext .js,.ts,.vue
```
(no errors printed)

`npm run build`:
```
✓ built in 3.80s
```

## Acceptance
| Criterion | Evidence |
|---|---|
| `vue-tsc` in devDependencies | `package.json`: `+        "vue-tsc": "^3.3.13"` |
| script `typecheck` = `vue-tsc --noEmit` | `package.json`: `+        "typecheck": "vue-tsc --noEmit"`; output line `> vue-tsc --noEmit` |
| `npm run typecheck` runs, output read back verbatim | Output above — real type errors from `.ts` and `.vue` (`ItemTemplate.vue(47,31)`), not a tooling crash like the old `ERR_PACKAGE_PATH_NOT_EXPORTED` |
| First-run error count recorded | 90 (`grep -c "error TS"` → `90`), recorded in `doctrine/MEMORY.md` Typecheck row as baseline |
| Pre-existing errors not fixed in this diff | `git diff --stat` touches no `src/` file |
| `MEMORY.md` Typecheck row no longer CANNOT RUN | `doctrine/MEMORY.md:26`: `| Typecheck | \`npm run typecheck\` (= \`vue-tsc --noEmit\`, ...` |
| Build still green | `✓ built in 3.80s` |
| Comments per code-comments.md | No code comments added or changed (JSON + Markdown only) |

## Supersedes: none
(`grep` of active diagram for `#295`/`add-typecheck-script` → only this node.)

## Noticed, not done
- **Split the 90 type errors into a separate GitHub issue** (task item 3 asks for it). Creating an issue is outward-facing, so it's left for the operator. Proposed scope: fix the baseline to 0, then add `npm run typecheck` to `.github/workflows/ci.yml`.
- `src/components/global/ItemTemplate.vue(47)` reads `props.image`, but the prop is `img` (TS2551 "Did you mean 'img'?"). Probably a real runtime bug, not just a typing gap.
- `VeeForm.spec.ts` › "flags the hidden language that has a validation error" fails on `staging` (flaky, `Error: Not implemented: navigation` from jsdom in the same run). CI doesn't run `npm run test`, so it's invisible there.
- `npm install`/`npm ci` rewrite `yarn.lock` every time (known trap: both lockfiles exist).

## Seal gate
None — no commit/push in this pass. `/ship` handles that.
