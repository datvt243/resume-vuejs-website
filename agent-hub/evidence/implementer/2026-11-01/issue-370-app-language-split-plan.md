# 2026-11-01 - issue-370-app-language-split

- Worker: implementer · Version: 0.1.0
- Node: `issue-370-app-language-split` (`haven/diagrams/dev-loop.prime-mermaid.md`) — new node, since `issue-370-language-in-settings` is already SEALED (LAI-13: no demote)
- Branch: `feature/issue-370-language-in-settings` (same branch as the sealed node; that work is not shipped yet, so this follow-up stays on it instead of a fresh branch off `staging` that wouldn't contain it)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/370 (follow-up, no new issue)
- Task (verbatim): "đem xuống dưới cùng, phần ngôn ngữ này giờ thì áp dụng cho ngôn ngữ của app, không áp dụng cho ngôn ngữ CV nữa. section Xóa tài khoản hãy chuyển thành danger section"

## Hub bytes before
85021

## Acceptance criteria
1. The language section on Account settings is the last section on the page.
2. It sets the app UI language (`i18n.global.locale`, `<html lang>`) only; the CV language (`useCvLang().selectedLang`, `localStorage.cvLang`) is not changed by it, and the header CV switch no longer changes the UI language.
3. The "Xóa tài khoản" section is styled as a danger section (danger title + danger-bordered card).
4. Users who are logged out can still change the UI language (no settings page there). Existing users keep their current UI language after the split (migration from `cvLang`).
5. i18n rule: new strings in both `vi` and `en`. Tests, build and lint pass. Typecheck stays at or below the 90-error baseline, with no errors in changed files.

## Diff
| file | why |
|---|---|
| `src/i18n/index.ts` | New module-level `uiLang` ref + `setUiLang` (stored in `localStorage.uiLang`, initial = `uiLang` ?? `cvLang` ?? vi via `resolveCvLang`); i18n locale / `<html lang>` now watch `uiLang` instead of `useCvLang().selectedLang`. New keys `header.cvLanguage`, `account.appLanguage`, `account.appLanguageDescription` (vi+en); `header.languageInfo` reworded to say it's CV-only and the app language is in Account settings. |
| `src/composables/useCvLang.ts` | Comment no longer claims it drives the UI locale. |
| `src/pages/_layouts/LangSwitch.vue` | New `ui` prop: when true binds to `uiLang`/`setUiLang`, aria-label `header.language`, no CV info tooltip; default (logged in) binds CV lang, aria-label `header.cvLanguage`. |
| `src/pages/_layouts/Header.vue` | Logged-out block uses `LangSwitch(ui)`; logged-in block unchanged (CV language). |
| `src/components/global/FormSection.vue` | New `danger` prop: title `text-danger`, card `border-danger` instead of `border-line`. |
| `src/pages/dashboard/PageAccountSettings.vue` | Language section moved to the bottom, title/description `account.appLanguage*`, bound to `uiLang`/`setUiLang`; delete section gets `danger`. |
| `src/i18n/index.spec.ts` | Locale follows `setUiLang`, NOT `useCvLang().setLang`; `uiLang` persisted; stored `uiLang` wins over `cvLang`; tr tests switch via `setUiLang`. |
| `src/pages/_layouts/LangSwitch.spec.ts` | Default switch changes CV lang only (UI locale stays vi); `ui` switch changes UI locale only, no tooltip. |

## Command
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- Live: Playwright on the operator's running Vite, `http://localhost:5173/resume-vuejs-website/#/dashboard/account-settings` (after reload)

## Output
- test: `Test Files  51 passed (51)` / `Tests  311 passed (311)`
- build: `✓ built in 3.75s`
- lint: exit 0
- typecheck: `grep -c 'error TS'` → `90`; grep for `PageAccountSettings|LangSwitch|FormSection|i18n/index` → no output
- Live:
  ```
  before:   sections ["Email đăng nhập","Mật khẩu","Xóa tài khoản [danger]","Ngôn ngữ ứng dụng"]
            groups ["header Ngôn ngữ CV: VI=true,EN=false","main Ngôn ngữ ứng dụng: Tiếng Việt=true,English=false"]
            lang "vi", uiLang "vi", cvLang "vi"
  click English (settings):  h1 "Account settings", header "CV language: VI=true,EN=false", main "App language: ...English=true", lang "en", cvLang "vi"
  click EN (header):         header "CV language: VI=false,EN=true", lang "en" (unchanged by CV switch), cvLang "en"
  ```
  Then restored both to VI → `["vi","vi","vi"]`. Screenshot `.playwright-mcp/settings-lang-2.png`: language section last, delete section red title + red border.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Language section last | Live `sections` list, last = "Ngôn ngữ ứng dụng"; screenshot |
| 2. App-only, decoupled | Live: settings click → lang en, cvLang still vi; header click → cvLang en, lang unchanged. Specs: `i18n` "then follows only setUiLang", `LangSwitch` "sets the CV language only, the UI stays put" |
| 3. Danger section | Live `Xóa tài khoản [danger]` (h2 has `text-danger`); screenshot shows red border |
| 4. Logged-out + migration | Spec `LangSwitch` "with ui (logged out) sets the UI language"; spec `i18n` starts from `cvLang` en, and "a stored uiLang wins over cvLang". Logged-out header NOT checked live (would require logging the operator's account out) |
| 5. i18n / tests / build / lint / typecheck | `Tests 311 passed`; i18n key-parity spec in that run; build ✓; lint 0; typecheck 90, none in changed files |
| comments per code-comments.md | New comments are 1-line WHY: migration fallback in `i18n/index.ts`, `danger` prop purpose in `FormSection.vue`; LangSwitch doc block updated to the new behavior |

## Supersedes
none (`issue-370-language-in-settings` already SEALED; this node changes its behavior per operator follow-up)

## Noticed, not done
- The operator said to move language "xuống dưới cùng", so it now sits below the danger section. The usual convention is to keep a danger zone last. Left as asked.
- `resolveCvLang` is reused for the UI language validator (same vi/en rule); not renamed.

## Seal gate
none (no commit/push)
