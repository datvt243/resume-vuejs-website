# 2026-11-05 - issue-405-cv-filename
- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-405-cv-filename`
- Branch: `feature/issue-405-cv-filename` (off `staging` @ dfe7059, created via `gh issue develop 405`)
- Task (verbatim): "#405, bổ sung: trong settings thêm secsion để cập nhật filename" — issue #405 "feat(download): dùng tên file CV PDF từ API (cvFileName)". Backend dep datvt243/resume-nodejs-api#363 is CLOSED; `origin/main` of the API has `cvFileName` in `schemaCandidatePatch` (trim, max 100, `/^[^\\/"\r\n]*$/`, allow ''), `exposedHeaders: ['Content-Disposition']`, and `download-pdf` sends `attachment; filename="<sanitized>.pdf"`.

## Hub bytes before
84553

## Acceptance criteria clarified
"input cvFileName ở form thông tin candidate" → per operator addition, the input lives in a new Settings (`PageAccountSettings.vue`) section, not PageInformation (one place only). Criteria made testable: (1) Settings section saves `cvFileName` via `PATCH candidate/update` and re-seeds on revisit; (2) download uses `Content-Disposition` filename, fallback store `cvFileName` → `firstName_lastName`; (3) PageHome shows `cvFileName.pdf` when set; (4) vitest covers header/no-header.

## Diff
| file | why |
|---|---|
| `src/services/axios.ts` | export `instanceAxios` — `_axios` resolves only `res.data`, headers are needed; same interceptors (Bearer + 401 refresh) |
| `src/composables/useDownloadCv.ts` | GET via `instanceAxios.get`, filename = `Content-Disposition` match → `cvFileName` computed; computed now prefers store `cvFileName` (trimmed) + `.pdf` |
| `src/composables/useDownloadCv.spec.ts` | mock `instanceAxios.get` returning `{data, headers}`; +2 tests (header wins; no header → store cvFileName) |
| `src/pages/dashboard/PageAccountSettings.vue` | new FormSection + VeeForm (`cvFileName`, yup mirrors backend Joi), `updatePatchDoc` on `candidate`, seeded with `watchPostEffect` |
| `src/i18n/index.ts` | `account.cvFileName/cvFileNameDescription/cvFileNameHint`, `validation.cvFileNameChars` in vi + en |

## Command
`npm run test` · `npm run lint` · `npm run build` · `npm run typecheck` (repo root)

## Output
- test: `Test Files  56 passed (56)` / `Tests  357 passed (357)`; single file: `✓ src/composables/useDownloadCv.spec.ts (5 tests)`
- lint: no errors printed (eslint src --ext .js,.ts,.vue)
- build: `✓ built in 4.41s`
- typecheck: 90 `error TS` (baseline 90). Touched files on base vs branch: base had useDownloadCv.ts `(42,46) TS2345 unknown→Blob` (now gone) ; branch adds `(22,48) TS2339 'cvFileName' does not exist on type '{}'` — same pre-existing class as `firstName`/`lastName` on that line (untyped candidate store). PageAccountSettings.vue: 0 errors. Net count unchanged.

## Live check (npm run dev, :5173 → prod API, qa.full@example.com, own CDP window)
1. Settings shows "Tên file CV" section. `a/b` → "Tên file không được chứa dấu gạch chéo hoặc dấu ngoặc kép".
2. Save "QA Full CV 2026" → PATCH 200, `data.cvFileName: "QA Full CV 2026"`; Home shows `QA Full CV 2026.pdf`.
3. Tải CV → `download-pdf` 200, saved as `QA_Full_CV_2026.pdf` (server header name).
4. First run found a bug: revisiting Settings showed '' (VeeForm's document watcher is non-immediate; `watchEffect` seeded before mount). Fixed with `watchPostEffect`; after fix: reload → `QA Full CV 2026`, in-app nav → `QA Full CV 2026`.
5. Clear → PATCH body `{"_id":"…","cvFileName":""}`, 200, `cvFileName: ""`; Home shows `Nguyễn_Văn_Full.pdf`; download saved as `Nguyen_Van_Full_Cong_nghe_Thong_tin_CV.pdf` (server default via header). QA account left with cvFileName ''.
6. `download-pdf` returned 500 on 2 of 4 first clicks, 200 on retry — backend-side, unrelated to the diff (error toast path covered by existing test).

## Acceptance
| Criterion | Evidence |
|---|---|
| Nhập/sửa cvFileName | live check 2, 4 (PATCH 200, re-seed) |
| Download đúng tên đã đặt | live check 3 + spec "saves under the Content-Disposition name" |
| Chưa đặt → như hiện tại | live 5; spec "ignores clicks" still `CV.pdf`, first spec `Võ_Tấn_Đạt.pdf` |
| Test có/không header | spec 5 tests passed |
| i18n vi+en | 4 keys × 2 locales in `src/i18n/index.ts` |
| comments per code-comments.md | 3 one-line WHY comments, no `(#N)` refs |

## Supersedes
none

## Still open
none

## Noticed, not done
- Home shows the raw name (`QA Full CV 2026.pdf`, or `firstName_lastName.pdf` when empty) while the server saves a sanitized one (`QA_Full_CV_2026.pdf`, or `<fullName>_<headline>_CV.pdf`). Matching it would mean duplicating the backend sanitizer.
- `download-pdf` intermittent 500 on prod (Render).

## Seal gate
No commit/push. Only writes: PATCH cvFileName on QA account qa.full (allowed test account), restored to ''.

---
## Round 2 — after REOPEN (`evidence/verifier/2026-11-05/issue-405-cv-filename-reopen.md`)
### Diff (added)
| file | why |
|---|---|
| `src/composables/useDownloadCv.ts` | destructure typed `{ firstName?; lastName?; cvFileName? }` → clears TS2339 ×3 on line 22 |
| `src/composables/useHelper.ts` | `inject<(_opts: { message: string; bg?: string }) => void>('toast')` — root fix for `toast?.()` TS2349 (shape = App.vue `showToast({ message, bg })`, all callers use it) |
| `src/composables/useDownloadCv.spec.ts` | `clickSpy.mock.contexts as HTMLAnchorElement[]` → TS2345 cleared |
| `src/services/axios.ts` | typed `_refreshPromise`, `errorCodeOf(body?)` (now `?? ''` so `TOKEN_ERROR_CODES.includes()` type-checks; both callers treat '' like undefined: `!code` / not in list), `_axios(props: AxiosRequestConfig & { customURL? })` |
### Typecheck (`npm run typecheck`)
- total: **81** `error TS` (baseline 90; base branch 90).
- per-file diff base → branch (`uniq -c` on file paths): useDownloadCv.spec.ts 1→0, useDownloadCv.ts 4→0, axios.ts 4→0, base.ts 17→17; no file increased. Touched files with errors: none (useHelper.ts, PageAccountSettings.vue, i18n/index.ts: 0).
### Command output (re-run after round 2)
- test: `Tests  357 passed (357)` · lint: exit 0 · build: `✓ built in 4.35s`
### DESIGN.md §10 (Settings → "Tên file CV" section)
| Item | Result |
|---|---|
| Tokens only (`grep -nE "#[0-9a-fA-F]{3,6}|\[[0-9.]+(rem|px)\]|opacity-[0-9]+"` on added lines of PageAccountSettings.vue + useDownloadCv.ts) | no match (grep exit 1) |
| §3–§5 template/components | reuses `FormSection` + `VeeForm` + `LoadingGate variant="form"`, same as PageInformation's slug section; one primary action (Lưu thay đổi) in the section |
| States | loading: LoadingGate skeleton; empty: hint "Để trống để dùng tên mặc định"; error: yup message (live: `a/b`); long text: max 100 enforced |
| Keyboard pass | Tab order: input → Hủy → Lưu thay đổi → next section (Tiếng Việt). Focus visible: input border rgb(212,212,216)→rgb(4,120,87) + outline solid; buttons outline solid 2px. Input has an associated label. |
| Screenshots 1440 light / 1440 dark / 375 dark | captured in own CDP window (qa.full), reviewed: no overflow/overlap/clip; `scrollWidth > innerWidth` false at all 3 |
| lint/test/build | pass (above) |
| web-design-guidelines | not run |

---
## Round 3 — after REOPEN-2 (`evidence/verifier/2026-11-05/issue-405-cv-filename-reopen-2.md`)
### Diff (added)
| file | why |
|---|---|
| `src/pages/dashboard/PageAccountSettings.vue` | field config: `placeholder: 'account.cvFileNamePlaceholder'`, `spellcheck: 'false'` (WIG Forms findings below) |
| `src/i18n/index.ts` | `account.cvFileNamePlaceholder` vi `'VD: Nguyen Van A - Frontend CV…'` / en `'e.g. John Doe - Frontend CV…'` |

### Screenshots (gitignored `*-shots/`, retaken after the placeholder change; own CDP window, qa.full, section element only)
| file | shows |
|---|---|
| `evidence/implementer/2026-11-05/issue-405-shots/settings-cvname-1440-light.png` | section title + description left, card with label "Tên file CV", empty input with example placeholder, hint, Hủy + Lưu thay đổi bottom-right; no clip |
| `evidence/implementer/2026-11-05/issue-405-shots/settings-cvname-1440-dark.png` | same layout in dark tokens; text/border legible; `scrollWidth > innerWidth` = false |
| `evidence/implementer/2026-11-05/issue-405-shots/settings-cvname-375-dark.png` | stacked: title/description above card, input full width, buttons right-aligned on one row; no overflow (`scrollWidth > innerWidth` = false) |
| `evidence/implementer/2026-11-05/issue-405-shots/settings-cvname-1440-light-error.png` | value `a/b`: red input border, inline error "Tên file không được chứa dấu gạch chéo hoặc dấu ngoặc kép" under the field, Lưu thay đổi disabled (faded) |

### web-design-guidelines (fetched `vercel-labs/web-interface-guidelines/main/command.md`, 191 lines) on `src/pages/dashboard/PageAccountSettings.vue` — new section only
- `PageAccountSettings.vue:39` — placeholder was the generic auto text without `…`/example → **fixed** (example + `…`).
- `PageAccountSettings.vue:42` — filename field had spellcheck on → **fixed** (`spellcheck: 'false'`), live DOM: `spellcheck="false"`.
- `PageAccountSettings.vue:41` — `autocomplete="off"` on non-auth field: pass (live DOM `autocomplete="off"`).
- Label: pass — `<label for="cvFileName">` exists, input `id="cvFileName"`.
- Focus: pass — border → accent + outline solid on focus (round 2 keyboard pass).
- Errors inline next to field: pass (error screenshot).
- Not fixed, shared component (out of scope, `SmallestDiff`): rendered input has `name=""` (WIG "meaningful name") and the submit button is disabled while invalid (WIG "submit stays enabled") — both come from the shared VeeForm/Frm* parts, same on every form. Listed under Noticed.
- Remaining WIG sections (animation, images, touch, typography, i18n formatting) — no relevant markup added: no findings.

### Command output (re-run after round 3)
- test: `Tests  357 passed (357)` · lint: exit 0 · build: `✓ built in 6.94s` · typecheck: 81 `error TS` (baseline 90), 0 in PageAccountSettings.vue / i18n/index.ts.

### Noticed, not done (added)
- Shared VeeForm inputs render without a `name` attribute; submit disabled on invalid instead of focusing the first error — app-wide, separate task.

---
## Round 4 — 2026-11-06, after REOPEN-3 + new operator instruction
Operator (verbatim): "tạo issue cho backend, ở frontend check nếu filename ko có lang ở đuôi thì tự thêm vào".
- Backend issue created (operator-requested, outward-facing): datvt243/resume-nodejs-api#375 "feat(download): thêm hậu tố ngôn ngữ _VI/_EN vào tên file CV".

### Diff (added)
| file | why |
|---|---|
| `src/composables/useDownloadCv.ts` | `withLangSuffix(name, lang)`: inserts `_VI`/`_EN` before the extension unless the name already ends `_vi`/`_en` (case-insensitive); applied to the final `link.download` (header name or fallback) with the `lang` passed to `download()` (default `vi`) |
| `src/composables/useDownloadCv.spec.ts` | existing expectations now carry the suffix (`Võ_Tấn_Đạt_EN.pdf`, `Dat_Vo_CV_VI.pdf`, `Dat Vo CV_VI.pdf`, `CV_VI.pdf`); +6 `it.each` cases: add EN, keep existing `_VI`, keep lowercase `_en`, dotted name, no extension, `Vien` (no underscore → suffix added) |

### REOPEN-3 fix — screenshot
`evidence/implementer/2026-11-05/issue-405-shots/settings-cvname-1440-light.png` retaken with `data-bs-theme="light"` set explicitly (body bg `rgb(250, 250, 250)`): light card, example placeholder, hint, Hủy + Lưu thay đổi. shasum:
- 1440-light `d13296c1a47415d9bf91929c3cc85afe08a3f3be`
- 1440-dark `37abbcbc951786607ff7e522d640855775894482`
- 1440-light-error `d7f0cc0d076ac8693eda99ca07a524e73f5804ac`
- 375-dark `1306c1b354b0f7f9a757923f7a0a370cad4934fa`

### Command output
- `npx vitest run src/composables/useDownloadCv.spec.ts`: `Tests  11 passed (11)`
- test: `Tests  363 passed (363)` · lint: exit 0 · build: `✓ built in 4.85s` · typecheck: 81 `error TS` (baseline 90), 0 in useDownloadCv.ts/spec.

### Live check
Not done for the suffix: prod API returned `429` ×3 on `download-pdf` (shared 100-req/IP rate limit, other session's traffic counts) — stopped calling the API. Suffix logic is covered by the unit tests above (header name and fallback both pass through `withLangSuffix`).

### Acceptance (added)
| Criterion | Evidence |
|---|---|
| Name without lang suffix gets `_VI`/`_EN` | spec: `Dat_Vo_CV.pdf`+en → `Dat_Vo_CV_EN.pdf`; download test `Dat_Vo_CV_VI.pdf` |
| Name already suffixed is kept | spec: `Dat_Vo_CV_VI.pdf`+en unchanged, `_en` lowercase unchanged |
| Backend issue | resume-nodejs-api#375 |
