# Spec-backfill review: doctrine/features (18 docs)

- Date: 2026-11-06 (finished 2026-11-07)
- Branch: `chore/agent-hub-analyst` (stayed on it, no commits, no `src/` changes)
- Isolation proof: this review ran as a separate spawned agent with task description "Verify vuejs specs vs code+live". It did not write the docs.
- Every doc keeps `Status: draft`. None is marked verified.

## Checks run
- Format: all 18 docs have `Status: draft`, `Source: backfill from code` and all 7 sections. Each has an INDEX row pointing to it.
- Anchors: every backticked `src/...` / `index.html` path in every doc exists (scripted `[ -e ]`, brace paths expanded).
- Acceptance tests: every spec file named by an `npx vitest run ...` criterion exists. Running all 34 at once passed: `Test Files 34 passed (34) · Tests 227 passed (227)`.
- Live (prod SPA https://datvt243.github.io/resume-vuejs-website/, signed out, own isolated browser context, no form submitted):
  - `#/dashboard/skills` redirected to `#/login`.
  - `/login`: Email, Password (with show-password button), "Ghi nhớ đăng nhập" checkbox, "Quên mật khẩu?" link → `#/forgot-password`. No Register link in the form; the header has Login and Register links plus the theme toggle.
  - `/register`: email (`autocomplete=email`), 2 × password (`new-password`), the 12-character hint, "Tạo tài khoản". No name fields.
  - `/forgot-password`: shows the description "Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu." (no note that no email is really sent), and "Quay lại đăng nhập" → `#/login`.
  - `/reset-password` with no token: the red invalid-link text shows and the form is still there.
  - UI language: Vietnamese by default (`<html lang="vi">`, `localStorage.uiLang = vi`).
  - Theme: with OS dark, `data-bs-theme=dark` on `<html>` and no attribute on `<body>`. Clicking the toggle flipped the theme, set `localStorage.theme`, swapped the aria-label, and changed the `body` background from `rgb(250,250,250)` to `rgb(10,10,11)`. `#app` stays `rgba(0,0,0,0)`.
  - `#/resume/vo-tan-dat?theme=bogus` (slug from `GET api/me/search?q=da`; `q=a` is rejected because the query must be 2–100 characters) rendered with `cv-theme-classic` and the auth shell. Requests: `GET api/me/vo-tan-dat` then `POST api/me/vo-tan-dat/visit`.
  - `#/resume/no-such-slug-zz9` showed "Không tìm thấy hồ sơ". Requests: the GET only, no visit POST.
  - Side effect: opening the public page as the spec requires recorded one visit on `vo-tan-dat`. Nothing else was written.

## Per-doc verdict
| Doc | Verdict | Live-confirmed | Notes |
|---|---|---|---|
| auth-login.md | PASS | B1, B2, B6 (signed-out half), B7 fields, B10 guard, Q5 | B3–B5, B8, B9, B11–B13 checked against code only (`services/auth.ts`, `services/axios.ts`, `stores/auth.ts`) |
| auth-password-reset.md | PASS | B1, B4, B5 hint, B7, Q2, Q3 (description has no disclosure) | B2, B3, B6 code-only |
| app-theme.md | FIXED | B1 (OS dark → dark), B2, B3, B4 | Acceptance criterion pointed at `#app` background, but `#app` is transparent. Changed it to `body` and added the live values. |
| public-resume.md | PASS | B1, B2, B3 (theme fallback), B4, B6 (POST after success only) | `startDate` is a number in the live payload, so the Experience sort (`b.startDate - a.startDate`) works |
| personal-information.md | FIXED | – | Q1 rewritten: `FrmSelect` → vee-validate `getBoundValue` returns the number 0/1, so `!!value` is correct for a picked value. What is still open: stored booleans may not match the 0/1 options when the form is seeded. Q2 made precise: with no `_id`, `updateDoc` sends `POST candidate/create` (`useDocument.ts:70-73`). |
| general-information.md | FIXED | – | B2 "Career" was wrong: `generalInformation.model.ts:30` wraps it in `withEnglish`, so there is a separate optional English input (`careerEn`). Q3 ("no English input, wipes en") withdrawn, with a note. |
| cv-skills.md | PASS | – | code-only (`PageSkills.vue`: max 5, `?tab=`, `exp` positive, group delete uses plain confirm) |
| cv-languages.md | PASS | – | code-only. See bug 1 below. |
| cv-timeline-sections.md | FIXED | – | B5/B6 said the "vi/en" fields were required. `withEnglish` makes every `*En` field `notRequired()` (`types/model.type.ts:106`). Experience description and Education school/major: Vietnamese required, English optional. |
| cv-simple-sections.md | FIXED | – | B5 Award description: same `withEnglish` fix. B6 reworded: "No expiration" shows when the box is checked (the old wording read as "when unchecked"). |
| cv-profiles.md | PASS | – | code-only. Q2 confirmed: `summarize()` counts raw id arrays (`PageProfile.vue:94-100`). |
| cv-preview-export.md | FIXED | – | B6 and Q5 said "ATS template: Home only", but `PageAtsCheck.vue` also downloads with `template` (`download({ template, lang })`). Both corrected. |
| job-applications.md | PASS | – | code-only (`PageApplication.vue:44-59`, `:94-95`, status map `:71-80`) |
| import-cv.md | PASS | – | code-only (endpoints `:38-39`, accept attributes `:178-180`, `SyntaxError` → invalidJson `:90`) |
| ats-check.md | PASS | – | code-only. Small nuance: the keyword block renders when `result.keywordMatch` exists (the API sends it only when a JD was given). |
| cv-visits.md | PASS | – | code-only (`PAGE_SIZE = 25`, `vi-VN` formats, delete disabled on `loadError \|\| !dataList.length`) |
| home-overview.md | PASS | – | code-only (initials `'U'`, `cvTemplate = ref('classic')`, 8-section completion) |
| account-settings.md | PASS | B5 default (vi) only | code-only otherwise (`PageAccountSettings.vue`, `i18n/index.ts:1046-1088`) |

## Live vs code
No mismatch: every signed-out behavior seen live matches this branch's code.

## Real bugs not in any doc's Open questions
1. `src/components/table/TableDefault.vue:145`: rows are keyed `` `doc_${doc._id}` ``, but `foreignLanguages` / `personalSkills` items have no `_id` (live payload: `{'language': 'english', 'level': 'basic'}`). In the Languages and Personal-skills edit tables every row gets the same key `doc_undefined`. Vue warns about duplicate keys and can patch rows wrongly after a delete.
2. `src/pages/auth/PageRegister.vue`: `:submit-fn="values => { handleRegister(...) }"` returns `undefined`, so VeeForm's `await result` (`VeeForm.vue:157`) resolves at once. The submit button never shows submitting, which allows a double submit. Login and forgot/reset return the promise.
3. `src/pages/dashboard/PagePreview.vue` `handleExportJsonResume`: `URL.revokeObjectURL(url)` runs in the same tick as `a.click()`. The repo's own `useDownloadCv.ts` comment says this can cancel the download in some browsers, and it defers the revoke with `setTimeout`.

## Not checked
- Anything that needs a signed-in session (all dashboard behaviors) was checked against code only.
- Backend-side claims (vanity-slug-first lookup, generic forgot-password answer, `?profile=` fallback) were taken from code comments and not exercised.
