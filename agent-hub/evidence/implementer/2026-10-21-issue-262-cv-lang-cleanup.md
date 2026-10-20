# 2026-10-21 - issue-262-cv-lang-cleanup

- Worker: implementer
- Version: 0.1.0
- Node: `issue-262-cv-lang-cleanup` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at the end of the table, `IN_PROGRESS`)
- Task (verbatim operator prompt): "EN/VI đã move lên header rồi, dọn dẹp các chỗ dư thừa" — EN/VI already moved to the header, clean up the redundant places. Issue #262 "[CHORE] Dọn chỗ chọn ngôn ngữ CV còn sót sau khi chuyển VI/EN lên header". https://github.com/datvt243/resume-vuejs-website/issues/262

## Hub bytes before: 201533
From the previous `worker-runs.log` line's `hub_bytes_after`.

## Branch
`chore/issue-262-cv-lang-cleanup`, created from freshly pulled `staging` (`56f0be6`) via `gh issue develop 262 --checkout --base staging --name chore/issue-262-cv-lang-cleanup` (linked to #262). Not `main`, not `staging`. `chore/` prefix per `agent-hub/CLAUDE.md` branching rule (cleanup, not a bugfix/feature).

## Survey
`grep -rnE "CV_LANGS|DEFAULT_CV_LANG|Tiếng Việt|'English'|[Nn]gôn ngữ|cvLang|selectedLang|LANGS" src` (excluding specs and `src/i18n/index.ts`) found:
| Hit | Decision |
|---|---|
| `src/composables/useCvLang.ts` `CV_LANGS` | **Remove** — no consumer left after #251 removed the per-page selectors (only `useCvLang` itself returned it). |
| `src/pages/dashboard/PageAtsCheck.vue` `LANGS` + `#ats-lang` select + local `lang = ref('vi')` | **Remove** — a second CV-language picker; the ATS check (`data.lang`) and its "Tải CV mẫu này" link now follow the header switch. |
| `src/components/veevalidate/VeeForm.vue` `LANGS` / "Ngôn ngữ nội dung" toggle | **Keep** — picks which language copy of a localized field is being edited, not the CV/UI language. |
| `src/pages/dashboard/PageGeneralInformation.vue` "Ngôn ngữ" | **Keep** — the foreign-languages section of the profile. |
| `src/pages/dashboard/PageInformation.vue` Chia sẻ CV description | **Keep** — tells the user the link language follows the header switch. |
| Header / LangSwitch / PageHome / PagePreview / PageInformation `selectedLang` | **Keep** — real consumers of the shared value. |

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageAtsCheck.vue` | Removed `LANGS`, the `#ats-lang` select block and `const lang = ref('vi')`; now `const { selectedLang: lang } = useCvLang()` (one why-comment: comes from the header switch). Request body and `downloadUrl` unchanged otherwise. |
| `src/composables/useCvLang.ts` | Removed `CV_LANGS` and dropped it from `useCvLang()`'s return. `DEFAULT_CV_LANG`, `resolveCvLang`, `CvLang` unchanged. |
| `src/pages/dashboard/PageAtsCheck.spec.ts` | `beforeEach` resets the shared language to `vi` (state is module-scoped since #251). The "chosen … lang" test sets EN via `useCvLang().setLang('en')` instead of the removed select (renamed "… and the header CV language"). Download-link test also checks `?lang=en` after `setLang('en')`. |

`git diff --stat`: 3 files changed, 12 insertions(+), 19 deletions(-) (before the extra download assertion: final spec diff is slightly larger).

## Command
From repo root:
- `npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts src/composables/useCvLang.spec.ts`
- `npm run test`, `npm run build`, `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script
- Manual check in a real browser (Playwright MCP), running `npm run dev`, logged-in tab: `/dashboard/ats-check`.

## Output
`npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts src/composables/useCvLang.spec.ts`:
```
 ✓ src/composables/useCvLang.spec.ts (6 tests) 6ms
 ✓ src/pages/dashboard/PageAtsCheck.spec.ts (5 tests) 54ms
      Tests  11 passed (11)
```
After adding the download-link `lang=en` assertion: `✓ src/pages/dashboard/PageAtsCheck.spec.ts (5 tests) 58ms`, `Tests  5 passed (5)`.

`npm run test`:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 39 passed (40)
      Tests  1 failed | 254 passed (255)
```
The known pre-existing `staging` failure (see #249 / #251 / #260 notes).

`npm run build`: `✓ built in 3.97s`

`npm run lint`: `eslint src --ext .js,.ts,.vue` printed no errors.

Browser (manual observation): on `/dashboard/ats-check` with header EN: `selects: 0`, `#ats-lang` absent, "Tải CV mẫu này" href `…/download-pdf?template=ats&lang=en`. After clicking VI in the header: href `…/download-pdf?template=ats`, `<html lang="vi">`. Switch put back to EN afterwards.

## Acceptance
| Criterion | Evidence |
|---|---|
| No second CV-language picker on the ATS page | Browser `selects: 0`, `#ats-lang` absent. |
| ATS check + its download follow the header switch | Spec "sends … the header CV language" (`lang: 'en'` after `setLang('en')`); download-link spec + browser href toggling `lang=en`. |
| Unused `CV_LANGS` removed | grep: no remaining references in `src`. |
| Non-redundant language UI kept | Survey table (VeeForm toggle, foreign languages, Chia sẻ CV note). |
| Build green, no new test failures | `✓ built in 3.97s`; 254 passed, 1 pre-existing failure. |
| Comments per code-comments.md | One why-comment in PageAtsCheck. No `(#N)` refs added. |

## Noticed, not done
- Pre-existing: right after a page reload, the "Tải CV mẫu này" href on the ATS page has no `token=` (`…/download-pdf?template=ats&lang=en`). The access token is memory-only and is only restored by the 401 → refresh path; the ATS page makes no API call on load, so `auth.getToken` is empty and the link would hit the API unauthenticated. Same pattern likely for other plain-link downloads (Header "Tải CV", PageHome). Needs its own issue.
- `VeeForm.spec.ts` flaky (see #260 note).

## Seal gate
None — no commit, push or API write.
