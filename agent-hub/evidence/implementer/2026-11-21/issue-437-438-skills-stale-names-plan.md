# 2026-11-21 - issue-437-438-skills-stale-names
- Worker: implementer · Version: 0.1.0
- Node: `issue-437-438-skills-stale-names` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#437 Skills: renaming/deleting a skill or group leaves stale names in main/familiar skills — mainSkills/familiarSkills store skills by name; rename → new name in them, delete (skill or group) → removed, saved in the same PATCH. + #438 Skills / Languages: show a message when General information was never saved — for a new account with no general-information doc (no _id), add/delete returns silently on /dashboard/skills and /dashboard/languages; show a clear message (vi+en): save General information first, with a link to /dashboard/general-information."
- Issues: https://github.com/datvt243/resume-vuejs-website/issues/437 · https://github.com/datvt243/resume-vuejs-website/issues/438

## Branch
`fix/issue-437-438-skills-stale-names` (cut from synced `staging` @ 81fd5e3 via `gh issue develop 437 --checkout --base staging`, linked to #437). Naming per PROJECT.md `fix/issue-<n>-<slug>`, two issues like `fix/issue-427-450-…`.

## Hub bytes before
100315

## Feature doc
`doctrine/features/cv-skills.md` (verified). Open question 1 → operator: "Bug: keep them in sync — #437"; Open question 2 → "Bug: show a message — #438". Behavior #6 ("patches only the changed field(s)") kept: picked fields are sent only when they actually change. No Behavior contradicted; doc not edited. Languages has no feature doc row of its own; it shares `VeeFormGeneralInformationUpdate`, which is where the #438 guard lives.

## Acceptance criteria (node)
1. #437 rename a professional skill → `mainSkills`/`familiarSkills` hold the new name, sent in the same PATCH as `professionalSkills`.
2. #437 delete a professional skill → its name is removed from both, same PATCH.
3. #437 delete a group → its skills' names are removed from both, same PATCH.
4. #437 unchanged picked fields are not sent (Behavior #6).
5. #438 no general-information `_id` → add/delete/save on `/dashboard/skills` and `/dashboard/languages` shows a vi+en message with a way to `/dashboard/general-information`, sends no PATCH.
6. `npm run test` passes; build, lint green; typecheck ≤ baseline 78 with none in touched files.
7. Comments per code-comments.md.

## Diff
| File | Why |
|---|---|
| `src/lib/swal.lib.js` | new `requireGeneralInformation()`: info Swal (`generalInfo.saveFirstTitle` / `saveFirstText`), buttons "Đóng" / "Đến Thông tin chung"; confirm → `location.hash = '#/dashboard/general-information'` (hash router, no router import into lib) |
| `src/i18n/index.ts` | `generalInfo.saveFirstTitle`, `saveFirstText`, `goToGeneralInfo` in both `vi` and `en` |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | (a) `if (!_id) return` → `return requireGeneralInformation()`; same guard in `showModalCreateDoc` so the Add modal doesn't open first. (b) new optional prop `syncPayload(list, renamed)`; on edit, `renamed = { oldName: newName }` when the name changed; its result is spread into the same PATCH and each returned field is written to the store from the response |
| `src/pages/dashboard/PageSkills.vue` | `syncPicked(list, renamed)`: maps renamed names, drops names not in `list`, dedupes (rename onto an already-picked name), returns only changed fields. Passed as `:sync-payload` to the professional-skills form (personal skills untouched). `deleteGroup` spreads `syncPicked(remaining)` into its PATCH + store update. Local `updatePatchDoc` wrapper: no `_id` → `requireGeneralInformation()` instead of PATCH (covers picker save, group tags, rename/delete group). Group rename needs no sync (picked store only `name`, rename changes `group`) |
| `src/pages/dashboard/PageSkills.spec.ts` | store seeded with `_id` (`freshStore`), swal mock gains `requireGeneralInformation`; new tests: rename, rename-onto-picked dedupe, delete (+ unchanged → `{}`), delete group sends picked in same PATCH, no `_id` → message, no PATCH |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts` | new tests: `syncPayload` fields merged into the PATCH; no `_id` → Swal "Chưa lưu Thông tin chung", no PATCH |
| `haven/diagrams/dev-loop.prime-mermaid.md` | new node row, IN_PROGRESS |

Callers of `VeeFormGeneralInformationUpdate`: `grep -rln "VeeFormGeneralInformationUpdate" src | grep -v spec` →
```
src/pages/dashboard/PageSkills.vue
src/pages/dashboard/PageLanguages.vue
```
Languages gets the #438 guard through the shared component; `syncPayload` defaults to `null` so it is unaffected otherwise.

Not mine: `.claude/skills/todo/SKILL.md` was already modified on `staging` before the branch was cut (session-start git status) — leave it out of this commit.

## Command
From `doctrine/MEMORY.md`, repo root: `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck` (standalone Typecheck row, baseline 78).

## Output
`npm run test`:
```
 Test Files  61 passed (61)
      Tests  403 passed (403)
```
(396 on the previous node → +7 new tests)

`npm run build` (tail):
```
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.81s
```
`npm run lint >/dev/null 2>&1; echo "lint exit $?"` → `lint exit 0`

`npm run typecheck 2>&1 | grep -c "error TS"` → `78` (= baseline); `npm run typecheck 2>&1 | grep -E "PageSkills|VeeFormGeneralInformationUpdate|swal.lib|i18n/index"` → no output.

Focused run: `npx vitest run src/pages/dashboard/PageSkills.spec.ts src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts` → `Tests  15 passed (15)`.

## Live check (dev server, prod API)
`npm run dev` on :5173 (started by me, stopped after). Isolated Playwright browser context (the shared debug tab was signed in as another QA account, left alone), logged in as `qa.empty@example.com`. PATCH requests recorded during the run:
```
{"swalAdd":"i\nChưa lưu Thông tin chung\nHãy lưu Thông tin chung trước, sau đó mới thêm hoặc xóa mục ở đây.\nĐóng\nĐến Thông tin chung",
 "swalPicker":"i\nChưa lưu Thông tin chung\n…\nĐóng\nĐến Thông tin chung",
 "afterGo":"http://localhost:5173/resume-vuejs-website/#/dashboard/general-information",
 "swalLang":"i\nChưa lưu Thông tin chung\n…\nĐóng\nĐến Thông tin chung",
 "patches":[]}
```
= Skills professional "Thêm", Skills main-skills picker "Lưu", Languages "Thêm" all show the message; "Đến Thông tin chung" lands on `/dashboard/general-information`; zero PATCH sent. #437 was not exercised live (would write to a QA account's skills); covered by the specs.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 rename → new name, same PATCH | `PageSkills.spec` "rename: the new name replaces the old one" (`{ mainSkills: [Vue.js, Go] }`); `VeeFormGeneralInformationUpdate.spec` "#437: merges syncPayload fields into the same PATCH" (`{ _id, personalSkills: [], mainSkills: [] }`) — in "403 passed" |
| 2 delete skill → removed | "delete: the name is removed from both…" (`{ mainSkills: [Vue], familiarSkills: [] }`) |
| 3 delete group → removed, same PATCH | "delete group: its skills leave main/familiar skills in the same PATCH" (`toMatchObject({ professionalSkills: [Vue], mainSkills: [Vue], familiarSkills: [] })`, 1 call) |
| 4 unchanged not sent | same test, second assert → `{}` |
| 5 #438 message, no PATCH | specs "#438: no document _id…" (Swal title "Chưa lưu Thông tin chung", `updatePatchDoc` not called) and "shows the message instead of patching when the document has no _id"; Live check above, `patches: []` |
| 5 vi + en | 3 keys added to `vi` and `en` in `i18n/index.ts`; typecheck shows nothing in that file (`en: typeof vi`) |
| 6 test/build/lint/typecheck | Output above |
| 7 comments per code-comments.md | added: `syncPayload` prop `//` (one sentence, signature why); `requireGeneralInformation` `//` (why: doc exists only after save); `updatePatchDoc` wrapper `//` (why); `syncPicked` `/** */` (2 sentences → block, not stacked `//`); dedupe `//` (why). No issue refs in source comments |

## Supersedes
none — `grep -n "437\|438" haven/diagrams/dev-loop.prime-mermaid.md` showed no other row before this one was added.

## Review
`/code-review` not run as a separate skill; inline pass over the touched files + both callers:
- Rename onto an already-picked name would list it twice → fixed (dedupe filter + spec "rename onto an already-picked name keeps it once").
- `editIndex` null on a new add → `generalInformationField.value[null]` is `undefined` → `renamed = {}`; correct.
- Group rename: picked items store only `name`, so nothing to sync — not a bug.
- Personal skills form gets no `syncPayload` — correct, picked lists come from professional skills.

## Noticed, not done
- While general-information is still loading (Render cold start), `_id` is empty too, so Add during loading shows "save General information first" instead of waiting. No loading flag is wired into this page; a separate fix if it matters.
- `GroupTags` updates its `v-model` locally before the save; with no `_id` (or a failed save) the new tag stays on screen until reload. Pre-existing behavior on failed saves.
