# 2026-10-26 — issue-340-input-cannot-clear

- Worker: implementer · Version: 0.1.0
- Node: `issue-340-input-cannot-clear` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row)
- Task (verbatim): "[BUG] Không xóa được giá trị trong input để nhập giá trị khác (#/dashboard/information) — Người dùng báo: tôi vừa check lại http://localhost:5173/resume-vuejs-website/#/dashboard/information tôi ko thể xóa giá trị trong input để nhập giá trị khác đc"

## Hub bytes before: 84562

## Branch
`fix/issue-340-input-cannot-clear` (off `staging` @ `c3e9193`, via `gh issue develop 340`).

## Root cause
`PageInformation.vue` showed stored social links by writing `field.value` onto each social field config. `VeeForm` passes field configs to `FrmInput` as props/attrs; `FrmInput` binds `:value="value"` and then `v-bind="attrs"`, so the stray `value` attr wins and is re-applied on every render — the input snaps back to the stored link whenever the user deletes or types. Reproduced live (dev server → prod API, isolated Playwright context, `qa.minimal@example.com`): clearing `socialMedia.github` → value stayed `https://github.com/example`; same action on `firstName`/`address`/`slug` cleared normally — only the social inputs were affected.

## Diff
| file | why |
|---|---|
| `src/pages/dashboard/PageInformation.vue` | social fields renamed `socialMedia.x` → `x` (VeeForm seeds a document by top-level key; a dotted name could never be seeded — `setValues` merges it as a literal key); new `socialDocument` reactive (`_id` + 3 links, seeded in `onMounted`) passed as `:document`, same pattern as `slugDocument`; removed the `field.value` loop; `handleUpdateSocialNetwork` reads `values.github/linkedin/website`; stale comment near `slugDocument` updated |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended |

`FrmInput.vue` left as is — the attr order is only a problem when a caller passes `value`; no other caller does (`grep -rn "\['value'\]\|\.value = " src/pages` after the diff → only Vue ref / i18n locale assignments in `PageImportLinkedin.vue` and specs, no field-config `value`).

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npm run test`: `Test Files  1 failed | 48 passed (49)` / `Tests  1 failed | 295 passed (296)` — only `VeeForm.spec.ts > VI | EN toggle > flags the hidden language that has a validation error`, pre-existing on clean `staging` (proven in `2026-10-26-issue-336-social-media-update.md`; file untouched here).
- `npm run build`: `✓ built in 3.92s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS` = baseline, none in `PageInformation.vue`.

## Manual observation (real app, not an automated test)
Isolated Playwright context, `qa.minimal@example.com`, links reset to 3 values beforehand:
- Loaded: `["https://github.com/example","https://www.linkedin.com/in/example","https://example.com"]`.
- GitHub input after successive inputs `…exampl` / `""` / `h` / `https://github.com/qa-new` → `["https://github.com/exampl","","h","https://github.com/qa-new"]` (no snap-back); Website cleared → `""`.
- Save → payload `{"socialMedia":{"github":"https://github.com/qa-new","linkedin":"https://www.linkedin.com/in/example"}}`, 200.
- Full reload + menu → `["https://github.com/qa-new","https://www.linkedin.com/in/example",""]`.
- `firstName` still clears normally (`""`).
QA links restored afterwards (PATCH 200), context closed.

## Acceptance
| Criterion | Evidence |
|---|---|
| Social inputs can be cleared and retyped | typing trace above |
| Saved values persist; cleared link removed | save payload + post-reload values |
| #336 behaviour kept (untouched links kept) | LinkedIn untouched → still sent and persisted |
| Other inputs unaffected | `firstName` clears |
| Build/lint/typecheck vs baseline | `✓ built in 3.92s`, lint 0, typecheck 90 |
| Comments per code-comments.md | one 1-line why-comment on `socialDocument`; stale comment near `slugDocument` shortened |

## Supersedes: none

## Noticed, not done
- Hard reload straight onto `#/dashboard/information` still leaves every form empty (store not hydrated at `onMounted`) — pre-existing, applies to `socialDocument` like `slugDocument`.
- `modalSocial` in `src/models/information.model.ts` is unused (still dotted names).

## Seal gate
none (no commit/push; live writes only on the QA test account)
