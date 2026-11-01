# 2026-11-01 - issue-370-remove-header-lang-switch

- Worker: implementer · Version: 0.1.0
- Node: `issue-370-remove-header-lang-switch` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Branch: `feature/issue-370-language-in-settings` (same unshipped #370 branch)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/370 (follow-up)
- Task (verbatim): "bỏ selectLanguage ở header đi"
- Operator decisions (AskUserQuestion, this session): CV language picker goes in **both** Account settings and the Preview page ("Cả hai"); header switch removed **everywhere**, including logged-out pages ("Bỏ hết") — logged-out pages use the stored `uiLang` (default vi), no switch.

## Hub bytes before
85529

## Acceptance criteria
1. No language switch in the header, logged in or out (`LangSwitch` gone from `Header.vue`, both blocks).
2. CV language can be set from Account settings ("Ngôn ngữ CV" section, after "Ngôn ngữ ứng dụng") and from Preview (next to "Giao diện"); both share `useCvLang`, so they stay in sync, and neither changes the UI language.
3. Everything from `issue-370-app-language-split` still holds: app language section in settings sets UI language only; delete-account is a danger section.
4. No dangling i18n keys or text pointing at the removed top-bar switch (`header.language*`, `header.cvLanguage`, `information.shareDescription`). Keys in vi+en; tests/build/lint green; typecheck ≤ 90 with no error in changed files.

## Diff
| file | why |
|---|---|
| `src/pages/_layouts/Header.vue` | Removed `LangSwitch` import (+ its pug eslint-disable line) and both `LangSwitch` usages. |
| `src/pages/_layouts/LangSwitch.vue`, `LangSwitch.spec.ts` | Deleted — no remaining user. |
| `src/composables/useCvLang.ts` | Exported `LANG_OPTIONS` (Tiếng Việt / English endonyms) shared by both pickers. |
| `src/pages/dashboard/PageAccountSettings.vue` | Uses shared `LANG_OPTIONS`; new last section "Ngôn ngữ CV" bound to `useCvLang` `selectedLang`/`setLang`. |
| `src/pages/dashboard/PagePreview.vue` | "Ngôn ngữ CV" `SegmentedControl` beside the theme picker, bound to `selectedLang`/`setLang`. |
| `src/i18n/index.ts` | Removed now-unused `header.language`, `languageInfoLabel`, `languageInfo`, `cvLanguage` (vi+en); added `preview.cvLanguage`, `account.cvLanguageDescription`; `information.shareDescription` now points to Settings/Preview instead of the top bar; module doc comment no longer mentions a header switch. |
| (carried from `issue-370-app-language-split`, unchanged) | `uiLang`/`setUiLang` in `i18n`, `FormSection danger`, specs in `i18n/index.spec.ts`. The `LangSwitch ui` prop is gone together with the file. |

## Command
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- Pre-existence check: `git stash` → `npm run typecheck | grep -c 'PagePreview.spec.ts(51'` → `git stash pop`
- Live: Playwright on operator's Vite (logged in), `#/dashboard/account-settings` then `#/dashboard/preview`

## Output
- `grep -rn "LangSwitch\|header\.language\|languageInfo\|header\.cvLanguage" src` → no output
- test: `Test Files  50 passed (50)` / `Tests  308 passed (308)` (311 − 3 deleted LangSwitch tests; includes i18n key-parity/used-keys spec)
- build: `✓ built in 3.72s`
- lint: exit 0
- typecheck: `90` errors. The only one in a touched area is `src/pages/dashboard/PagePreview.spec.ts(51,23): error TS2683`. That spec is not changed, and on the stashed base the same grep gave `1`, so the error was already there.
- Live:
  ```
  settings sections: ["Email đăng nhập","Mật khẩu","Xóa tài khoản","Ngôn ngữ ứng dụng","Ngôn ngữ CV"]
  radiogroups: only "main ..." — no "header ..." group exists
  click CV English (settings): lang "vi" (UI unchanged), cvLang "en"
  preview radiogroups: "Giao diện CV: Classic=true..." , "Ngôn ngữ CV: Tiếng Việt=false,English=true"  (synced from settings)
  click Tiếng Việt (preview): cvLang "vi", lang "vi"; CV headings "Thông tin chung","Học vấn"
  ```
  Screenshot `.playwright-mcp/preview-cv-lang.png`: header has no VI/EN, preview shows "Ngôn ngữ CV" picker and Vietnamese CV. Both languages left on vi.
- Console: only `[hmr] Failed to reload /src/pages/_layouts/LangSwitch.vue` 404 — HMR noise from deleting the file while the page was open, not a runtime error of the new code.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. No header switch | grep no output; live: no `header` radiogroup; screenshot |
| 2. CV picker in settings + preview, synced, UI unaffected | Live sequence above |
| 3. Earlier node still holds | Live sections order + app-language section present; i18n specs (`follows only setUiLang`, `stored uiLang wins`) in the 308 passing |
| 4. i18n clean / checks | grep no output; key-parity spec passing; build ✓; lint 0; typecheck 90, the only touched-area error pre-exists |
| comments per code-comments.md | One 1-line WHY on `LANG_OPTIONS` (endonyms not translated); i18n doc comment updated to match behavior |

Logged-out pages: not checked live (would need logging the operator out). They have no switch to check now (criterion 1 grep covers both header blocks), and they render in `uiLang`, which is covered by the i18n spec.

## Supersedes
- `issue-370-app-language-split` (sealed_pending_verifier, REOPENed for missing proof that the logged-out header passed `ui`) — that switch no longer exists; its remaining criteria are re-verified here (criterion 3).

## Noticed, not done
- Language sections sit below the danger section, as the operator asked earlier.
- Logged-out users have no way to change the UI language (operator's explicit choice).

## Seal gate
none (no commit/push)
