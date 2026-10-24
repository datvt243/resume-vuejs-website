# 2026-10-24 - issue-291-download-cv

- Worker: implementer
- Version: 0.1.0
- Node: `issue-291-download-cv` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, issue #291 body): "hãy kiểm tra lại tính năng download CV (press button download CV), tôi thấy chưa tải đc, hãy tham khảo tính năng tương tự ở /Users/_david/Workspace/Project/resume/datvt243.github.io"
- Operator decisions (AskUserQuestion, this session): scope **"Both"** (find and fix the backend cause, and switch the buttons here to fetch+blob+toast like datvt243.github.io), and Render workspace "David's Workspace" approved **read-only**.

## Hub bytes before: 205237
(Measured at the start of the #266 run earlier this session. The hub only changed by that run's notes since then.)

## Branch
`fix/291-download-cv`, created from up-to-date `staging` via `gh issue develop 291 --checkout --base staging` (linked to #291).

## Diagnosis
1. Live site, logged in: the only download link in the header was `https://nodejs-resume-api-ts.onrender.com/api/v1/download-pdf?token=…` (`target=_blank`, no working `download` since it's cross-origin). `fetch` of it → `500 application/json` `{"success":false,"error":{"code":"INTERNAL_SERVER_ERROR","message":"Lỗi hệ thống"}}` in ~1.7 s.
2. Same 500 for classic/ATS × vi/en and for the public `api/me/votan.it@gmail.com/download-pdf?template=ats`.
3. Render app logs: every one of those requests fails with `Could not find Chrome (ver. 127.0.6533.88) … cache path … /opt/render/.cache/puppeteer`, since at least 2026-10-20. Still 500 after backend v2.0.2 went live (03:42 UTC today). → **Backend bug**, fixed separately: datvt243/resume-nodejs-api#298, evidence in that repo at `agent-hub/evidence/implementer/2026-10-24/render-puppeteer-cache-dir.md` (worktree `/Users/_david/Workspace/Project/resume/resume-nodejs-api-298`, branch `298-download-pdf-chrome`).
4. Frontend problems with the plain links, even once the backend works:
   - The `?token=` value is the in-memory access token (`authStore.getToken`). It's empty after a page reload and expires in ~1h, and a link can't run the axios 401 refresh.
   - Any failure opens a new tab of raw JSON instead of a message.
   - `download=` on a cross-origin link is ignored.
5. Reference `datvt243.github.io/composables/useDownloadResume.ts`: `fetch` → check status → `blob()` → `<a download>` click, with loading state and success/error toasts. (Its PDF is rendered by its own Nuxt server with `@sparticuz/chromium`. Not applicable here; our backend renders.)

## Diff
| File | Why |
|---|---|
| `src/composables/useDownloadCv.ts` (new) | `download({ template, lang })`: `GET api/v1/download-pdf` through `_axios` with `responseType: 'blob'` (Bearer header + 401 refresh from `services/axios.ts`, no token in the URL), then object URL → `<a download>` click (revoke deferred one tick), `isDownloading` guard against double clicks, `error.downloadCv` toast on failure. `cvFileName` (moved from PageHome) names the file. Only non-default params sent (`template=ats`, `lang=en`), same URL shape as the removed `getDownloadCvUrl`. |
| `src/services/axios.ts` | `_axios` passes `responseType` through (1 destructure + 1 option). |
| `src/pages/_layouts/Header.vue` | Download `<a href>` → `<button>` calling `download({ lang: selectedLang })`, `disabled`/`aria-busy` + spinner icon while downloading. Removed `getFile()`. `selectedLang` now pug-only → same eslint-disable comment the file uses for its other pug-only vars. |
| `src/pages/home/PageHome.vue` | Same button change (template from the card's selector). Dropped the now-unused `authStore`/`API`/`_host`/URL computed. `cvFileName` comes from the composable. |
| `src/pages/dashboard/PageAtsCheck.vue` | Same button change (selected template + header language). Dropped the unused `API`/`authStore`/`_host`. |
| `src/utilities/index.ts` + `index.spec.ts` | Removed `getDownloadCvUrl` and its 5 tests: no callers left. |
| `src/i18n/index.ts` | `error.downloadCv` in vi + en. |
| `src/composables/useDownloadCv.spec.ts` (new) | Blob request + params + filename, error → toast and no download, double-click ignored. |
| `src/pages/dashboard/PageAtsCheck.spec.ts` | The old test asserted the `<a href>`. Now asserts the button calls `download` with the selected template and language (ats/vi, then classic/en). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Node row appended. |

## Command
From repo root: `npm run test`, `npm run build`, `npm run lint`. Typecheck: CANNOT RUN — pending add-typecheck-script

## Output
- `npx vitest run src/composables/useDownloadCv.spec.ts`: `Tests  3 passed (3)`
- `npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts`: `Tests  5 passed (5)`
- `npm run test`: `Test Files  1 failed | 44 passed (45)`, `Tests  1 failed | 273 passed (274)`. The failure is the known `VeeForm > VI | EN toggle > flags the hidden language that has a validation error` (same on `staging`, see the #266 note). 273 = 275 − 5 removed `getDownloadCvUrl` tests + 3 new.
- `npm run build`: `✓ built in 3.73s`
- `npm run lint`: clean (no output after `> eslint src --ext .js,.ts,.vue`)

## Manual check (Playwright, real app, this branch)
The prod API's CORS only allows `http://localhost:5173` and `https://datvt243.github.io` (OPTIONS probe: `localhost:5174`, `127.0.0.1:5173`, `localhost:4173` get no `access-control-allow-origin`). Port 5173 is the operator's own `npm run dev` from this repo (serves this working tree), which I didn't restart. Its API calls reached the prod API; a `page.route` proxy for `localhost:3001` was also in place and removed afterwards.
1. **Real backend (error path)**, Home page logged in: `button[aria-busy]` ×2 ("Tải CV": header + Home card), `0` `<a>` with `download-pdf` left. Header click → `aria-busy="true"` while pending; request `…/api/v1/download-pdf` with `Authorization` header, no `token=` in the URL; backend 500 → toast **"Không tải được CV, vui lòng thử lại sau"**; tab count unchanged (2 → 2, no JSON tab).
2. **Stubbed 200 PDF (success path)**, `page.route` fulfilling `download-pdf` with a small `%PDF` body + CORS headers:
   - Home with "ATS" selected → request `v1/download-pdf?template=ats`; header after switching to EN → `v1/download-pdf?lang=en`.
   - Both produced an `application/pdf` blob on an anchor with `download="Võ_Tấn_Đạt.pdf"`.
   - The browser really saved it: `~/Downloads/Võ_Tấn_Đạt.pdf`, 10:41, 44 bytes = the stub (`%PDF-1.4 … %%EOF`). Deleted after checking (my test file).
- Not observed: a real PDF from the real backend. That needs backend #298 deployed.
- **Addendum, after backend v2.0.3 (#298 via PRs #299/#300, Render deploy `dep-dbe2sk8m7kps73c5b8og` succeeded 04:06 UTC, build upload OK on the free plan):**
  - Public `api/me/…/download-pdf` → `200 application/pdf`, `%PDF-` (91,560 B ATS vi, 69,121 B ATS en).
  - On this branch (operator's 5173 dev server, real backend, no stubs), after a full page reload (empty in-memory token): `auth/refresh` 200, then all six buttons → `200 application/pdf`:
    - Home Classic/ATS × VI/EN: `download-pdf`, `?template=ats`, `?lang=en`, `?template=ats&lang=en`
    - header (`?lang=en`)
    - ATS page (`?template=ats&lang=en`)
  - A MutationObserver on the toast recorded **zero** toasts.
  - Real files landed in `~/Downloads` (e.g. 97,395 B classic vi, 112,926 B classic en, 69,121 B ATS en, all `%PDF-`). All 9 test files were deleted afterwards.
  - Radio → param mapping checked: Classic checked → no `template`, "Tối ưu ATS" checked → `?template=ats`.
  - An earlier hidden toast "Could not download the CV…" seen in the DOM was left over from the stub tests (the live region keeps its last text); it did not recur after a fresh reload.

## Acceptance
| Criterion | Evidence |
|---|---|
| Find why Download CV doesn't download | Diagnosis 1–3: backend 500 "Could not find Chrome", from Render logs |
| Backend cause fixed (operator chose "Both") | resume-nodejs-api#298 branch: control FAIL vs fixed `%PDF-` under empty HOME (see that repo's note). Deploy pending release. |
| Buttons follow the datvt243.github.io flow (fetch → blob → download, loading, error toast) | Diff + manual check 1–2 + composable spec |
| Auth works without `?token=` in the URL | Manual check 1: `Authorization` header present, URL has no token |
| All 3 download buttons covered | Header, Home, ATS check, with no `download-pdf` `<a>` left on Home (manual check 1) |
| No regressions | Single known failure, same as staging; build green; lint clean |
| i18n | `error.downloadCv` vi + en; parity spec passes in the full run |
| Comments per code-comments.md | Composable header + 2 short whys (axios vs link; deferred revoke). No issue refs. |

## Noticed, not done
- `PageApplication.vue:58` "Download PDF" per application is still a plain link to the public `api/me/:id/download-pdf?template=ats&profile=`. It fails the same way until #298 ships. It's public (no token), so the auth problem doesn't apply. Left as a link.
- No "preparing…" toast like the reference. A cold Render start (~30 s) + Chrome launch can be slow, and only the spinner icon shows progress.
- `window.location.host === 'localhost'` checks (Header `_settings.host`, formerly also Home/ATS) never match with a port (`localhost:5173`). The ones left are dead branches.
- The header user-menu accessible name with raw HTML is still open (from #266).

## Seal gate
None crossed. No commit or push. Browser: GETs, the failing download attempts, and stubbed responses. Render: read-only. Backend: no commit or push either (see its note).
