# 2026-10-20 - issue-251-header-language-switch

- Worker: implementer
- Version: 0.1.0
- Node: `issue-251-header-language-switch` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at the end of the table, `IN_PROGRESS`)
- Task (verbatim): #251 [ENHANCEMENT] Chọn ngôn ngữ VI/EN trên header (giao diện i18n + CV). Original operator prompt: "đưa EN/VI lên header để chọn, áp dụng cho đã ngôn ngữ i18n và của CV". Scope chosen by the operator (AskUserQuestion, 2026-10-20): "Switch + CV + i18n setup" — header VI | EN switch drives the CV language (`useCvLang`) and the UI language; add `vue-i18n`, translate header + sidebar first; other pages get their own follow-up issues. https://github.com/datvt243/resume-vuejs-website/issues/251

## Hub bytes before: 198915
Taken from the previous `worker-runs.log` line's `hub_bytes_after` (verifier's measurement method), since the hub was unchanged between that verdict and this pass.

## Branch
`feature/issue-251-header-language-switch`, created from freshly pulled `staging` (at `f4edb61`, after #250 merged) via `gh issue develop 251 --checkout --base staging --name feature/issue-251-header-language-switch`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `package.json`, `package-lock.json` | `vue-i18n@11.4.13` (`^11.4.13`). Latest is 11.4.16 but was published 2026-10-18 (2 days old); 11.4.13 (2026-10-02) is the newest release ≥ 2 weeks old. |
| `src/composables/useCvLang.ts` | `selectedLang` ref, its localStorage watch and `setLang` moved to module scope. Before, every `useCvLang()` call created its own ref, so a header switch would not reach pages already mounted. Public API (`useCvLang()` return shape, `resolveCvLang`, `CV_LANGS`, `DEFAULT_CV_LANG`) unchanged. |
| `src/i18n/index.ts` (new) | `createI18n({ legacy: false, locale: selectedLang, fallbackLocale: 'vi' })` with `vi`/`en` messages for `header.*` and `nav.*`. Watches `selectedLang` (immediate) → sets `i18n.global.locale` and `document.documentElement.lang`. |
| `src/main.ts` | `app.use(i18n)`. |
| `src/pages/_layouts/Header.vue` | VI \| EN `SegmentedControl` (global component) in both header variants (logged-out and logged-in). All header text/aria-labels via `$t`. The header "Tải CV" link now passes `selectedLang` to `getDownloadCvUrl` (it ignored the CV language before). At 375px: switch `shrink-0 flex-nowrap`, right-side gap `gap-1 sm:gap-2`, user name cap `max-w-16 sm:max-w-32` — without these the header overflowed (see Output). |
| `src/pages/_layouts/LayoutDefault.vue` | Sidebar `navGroups`/`settingsItem` use i18n keys (`label`/`key`), rendered via `$t`; nav `aria-label` via `$t`. |
| `src/pages/home/PageHome.vue`, `src/pages/dashboard/PagePreview.vue`, `src/pages/dashboard/PageInformation.vue` | Removed the per-page CV language selector (select / SegmentedControl); they still read `selectedLang`. PageInformation's "Chia sẻ CV" description now says the link language follows the VI \| EN switch in the top bar. |
| `src/composables/useCvLang.spec.ts` | Re-imports the module per test (`vi.resetModules()` + dynamic import) since state is read on import. Split "restore en / ignore unknown" into two tests; +1 test: two callers share one value. |
| `src/i18n/index.spec.ts` (new) | Starts in the stored language (`en` → `Experience`, `<html lang="en">`), follows `setLang('vi')` (→ `Kinh nghiệm`, `lang="vi"`). |

`yarn.lock`: `npm i` rewrote it (+1541 lines). Restored with `git checkout -- yarn.lock` — both CI workflows run `npm ci` (`.github/workflows/ci.yml:21`, `deploy.yml:22`), so `package-lock.json` is the one that matters. `yarn.lock` therefore does not list `vue-i18n` (see Noticed).

Final `git diff --stat` (tracked files): `10 files changed, 173 insertions(+), 91 deletions(-)`, plus new `src/i18n/index.ts` and `src/i18n/index.spec.ts`.

## Command
From repo root:
- `npx vitest run src/composables/useCvLang.spec.ts src/i18n`
- `npm run test`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script
- Manual check in a real browser (Playwright MCP) against the already-running `npm run dev` on :5173, logged-in session: switch VI → EN on `/dashboard/experience`, then `/dashboard/preview` EN → VI, header width at 375px and 1440px.

## Output
`npx vitest run src/composables/useCvLang.spec.ts src/i18n`:
```
 ✓ src/composables/useCvLang.spec.ts (6 tests) 7ms
 ✓ src/i18n/index.spec.ts (1 test) 23ms
      Tests  7 passed (7)
```

`npm run test` (final run, after the header tweaks):
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 38 passed (39)
      Tests  1 failed | 252 passed (253)
```
That failure is pre-existing: it also failed 3/3 runs on `staging` without any diff (see `evidence/implementer/2026-10-20-issue-249-experience-unsaved-warning.md`). No spec mounts Header, LayoutDefault, PageHome, PagePreview or PageInformation.

`npm run build`: `✓ built in 3.75s`

`npm run lint`: `eslint src --ext .js,.ts,.vue` printed no errors.

Browser (manual observation, not an automated test):
- `/dashboard/experience`, before click: `lang: "vi"`, radios `VI:true, EN:false`, sidebar `Tổng quan … Kinh nghiệm …`.
- After clicking EN: `lang: "en"`, `localStorage.cvLang: "en"`, radios `VI:false, EN:true`, header `Download CV`, sidebar `Overview / Dashboard / Visits / Profile / Basic information / … / Experience / … / Account settings`, header download href `…/api/v1/download-pdf?lang=en&token=…`.
- `/dashboard/preview` (EN): CV summary started "Frontend Developer with 4+ years building enterprise SPAs…"; the old "Ngôn ngữ" control is gone. After clicking VI in the header: summary changed to "I am a Frontend Developer with over 5 years of experience…" (the owner's vi summary), sidebar back to `Tổng quan`.
- 375px: first build had the switch wrap (VI over EN), then `scrollWidth 386` vs viewport 375. After `flex-nowrap` + `gap-1 sm:gap-2` + `max-w-16`: `docScroll: 375, headerScroll: 375, viewport: 375`.
- Console: 10× 401 on the first API calls after load (token refresh on reload — access token is memory-only per CLAUDE.md), then data loaded. No Vue/i18n errors.
- Screenshots in `.playwright-mcp/` (gitignored, show personal profile data — not committed): `251-header-375.png` (wrapped, before fix), `251-header-375-after.png`, `251-header-1440.png`.

## Acceptance
| Criterion | Evidence |
|---|---|
| VI \| EN switch in the header | Browser radios `VI:true, EN:false` → `VI:false, EN:true` in the app header; screenshots at 375/1440. |
| Switch controls CV language | Preview summary text changed on header click; header download href gained `lang=en`; `localStorage.cvLang: "en"`. |
| Switch controls UI language (vue-i18n) | Sidebar + header text switched to English; `index.spec.ts` `t('nav.experience')` = `Experience` / `Kinh nghiệm`; `<html lang>` follows. |
| One shared value across header and pages | `useCvLang.spec.ts` "every caller shares one value" passes; preview updated live without reload. |
| Header + sidebar translated; rest out of scope | Only `header.*`/`nav.*` keys exist; other screens keep their Vietnamese text (confirmed in preview: "Xem trước CV", "Giao diện"). |
| No horizontal scroll at 375px | `docScroll: 375, viewport: 375`. |
| Build green | `✓ built in 3.75s` |
| No new test failures | 252 passed; the 1 failure is pre-existing on `staging`. |
| Comments per code-comments.md | New comments: one-line why on `useCvLang`'s module-scope state, a short file description on `src/i18n/index.ts`, one why-line in the spec. No `(#N)` refs added. |

## Noticed, not done
- Follow-up issues still to file for translating the remaining screens (operator's chosen scope) — not filed in this pass.
- `yarn.lock` is now out of date (no `vue-i18n`). Only matters for anyone installing with yarn; CI uses npm.
- `CV_LANGS` (with "Tiếng Việt"/"English" labels) is no longer rendered anywhere — still exported and returned by `useCvLang()`. Left in place.
- Logged-out header (login/register pages) now shows the switch, but the auth pages' own form text is still Vietnamese only.
- Pre-existing a11y bug: `Dropdown.vue:90` renders the `text` prop as plain text inside the split toggle's `sr-only` span, so screen readers hear the raw `<span class="block …">` markup Header passes for the user name. `Dropdown.vue` is untouched by this diff.
- `VeeForm.spec.ts:287` still fails on `staging`.
- Untracked `API-STANDARD.md` appeared at the repo root during this session — not created by this pass, not touched.

## Seal gate
None — no commit, push or API write. Commit/PR is left to `/ship`.
