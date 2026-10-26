# 2026-10-26 — issue-344-reload-empty-form

- Worker: implementer · Version: 0.1.0
- Node: `issue-344-reload-empty-form` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row)
- Task (verbatim, issue title): "#344 [BUG] Reload trực tiếp #/dashboard/information làm mọi ô trong form bị trống" — body: hard reload on the page leaves personal info, social links and slug empty; SPA navigation works; risk: saving in that state sends empty data; also check `PageGeneralInformation.vue` / `PagePreview.vue`.

## Hub bytes before: 84736

## Branch
`fix/issue-344-reload-empty-form` (off `staging` @ `5fbc106`, via `gh issue develop 344`).

## Root cause
`src/App.vue` fetches the candidate in an async `onMounted` and renders `<RouterView />` without waiting. `PageInformation.vue` seeded `document` / `socialDocument` / `slugDocument` once in its own `onMounted` from `candidate.getCandidate` — on a hard reload the store is still empty then, and nothing re-seeds when the fetch lands. Reproduced earlier today on `qa.minimal@example.com` (all inputs `""`, birthday default `01/01/1990`).

Other pages from the issue: `PagePreview.vue` reads the store via `computed(() => candidate.getCandidate)` (reactive, no snapshot); `PageGeneralInformation.vue` loads through `useCandidate` + its own `onMounted` only sets `isLoading` — neither has the one-time snapshot pattern, so not changed.

## Diff
| file | why |
|---|---|
| `src/pages/dashboard/PageInformation.vue` | `onMounted` body moved into `seedFromStore()`; still called from `onMounted` (VeeForm only picks up `document` through a non-immediate watcher, so seeding must happen after it mounts); plus `watch(() => candidate.getCandidate?._id, id => id && seedFromStore())` for the fetch that lands after mount. Fires only when the candidate id changes, so later saves don't overwrite in-progress edits. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npm run test`: `Test Files  49 passed (49)` / `Tests  296 passed (296)` (the `VeeForm.spec.ts` VI|EN toggle test that failed in today's #336/#340 runs passed this time — it's flaky, not fixed by this diff)
- `npm run build`: `✓ built in 4.19s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS` = baseline, none in `PageInformation.vue`

## Manual observation (real app, not an automated test)
Dev server → prod API, isolated Playwright context, `qa.minimal@example.com` (no save performed, no data written):
- Hard reload straight on `#/dashboard/information` → `{"firstName":"Lê","lastName":"Minimal","address":"Hà Nội","phone":"0900000003","github":"https://github.com/example","linkedin":"https://www.linkedin.com/in/example","website":"https://example.com","slug":"qa-minimal-rn17"}`, birthday `24/03/1993`.
- Edited address to `Đà Nẵng` after load → still `Đà Nẵng` 1.5 s later (not overwritten).
- SPA path (Dashboard → Thông tin cơ bản) → same values as above.
Follow-up after the verifier pass: CKEditor introduction after hard reload → VI `Frontend Developer với hơn 4 năm kinh nghiệm…`, EN `Frontend Developer with 4+ years…` (both filled; read-only check, no save).

## Acceptance
| Criterion | Evidence |
|---|---|
| Hard reload fills every form on the page | `hardReload` values above |
| No regression on SPA navigation | `spaNav` values above |
| In-progress edits not clobbered | `editKept: "Đà Nẵng"` |
| Other pages checked | Root-cause section (`PagePreview` computed, `PageGeneralInformation` via `useCandidate`) |
| Build/lint/typecheck vs baseline | `✓ built in 4.19s`, lint 0, typecheck 90 |
| Comments per code-comments.md | one 1-line why-comment on the watch |

## Supersedes: none

## Noticed, not done
- `VeeForm.spec.ts > VI | EN toggle > flags the hidden language that has a validation error` is flaky (failed 3×, passed 1× today).

## Seal gate
none (no commit/push; no data written)
