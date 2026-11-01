# 2026-11-01 - issue-370-language-in-settings

- Worker: implementer · Version: 0.1.0
- Node: `issue-370-language-in-settings` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Branch: `feature/issue-370-language-in-settings` (off `staging`, via `gh issue develop 370`)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/370
- Task (verbatim): "đưa tính năng chọn EN/VI vào settings, tôi đang chạy http://localhost:5173/resume-vuejs-website/#/dashboard, hãy check ở đây"

## Hub bytes before
84843

## Acceptance criteria
1. Account settings page (`#/dashboard/account-settings`) has a VI/EN language section.
2. Choosing a language there switches the UI language (`i18n.global.locale`, `<html lang>`) live, same as the header switch, and the two stay in sync.
3. No hardcoded translatable UI string (i18n rule in `.claude/CLAUDE.md`); build + lint green; typecheck ≤ 90 baseline with none in changed files.

## Diff
| file | why |
|---|---|
| `src/pages/dashboard/PageAccountSettings.vue` | New first `FormSection` "Ngôn ngữ / Language" with `SegmentedControl` bound to `useCvLang().selectedLang` / `setLang` — the same state the header `LangSwitch` uses, so both stay in sync. Title/description/aria-label reuse existing `header.language` / `header.languageInfo` keys (no new i18n keys). Option labels `Tiếng Việt` / `English` are language endonyms, intentionally not translated (same as the header's literal `VI`/`EN` in `LangSwitch.vue`). |

Header `LangSwitch` left in place (still needed on logged-out pages, where Settings isn't reachable).

## Command
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- Live: Playwright against the operator's running Vite at `http://localhost:5173/resume-vuejs-website/#/dashboard/account-settings`

## Output
- build: `✓ built in 4.22s` (only the pre-existing chunk-size warning)
- lint: `> eslint src --ext .js,.ts,.vue` → exit 0, no errors
- typecheck: `grep -c 'error TS'` → `90`; `grep PageAccountSettings` → no output
- Live (before → after clicking the unselected option inside `main`):
  ```
  before: h1 "Cài đặt tài khoản", "Ngôn ngữ: Tiếng Việt=true,English=false", lang "vi"
  after:  h1 "Account settings",  "Language: Tiếng Việt=false,English=true", lang "en", header "VI=false,EN=true"
  ```
  Then clicked `Tiếng Việt` again → `lang "vi"` (restored the operator's state). Screenshot: `.playwright-mcp/settings-lang.png` (section rendered first on the page, dark theme, matches the other FormSections).

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Section exists | Live: radiogroup `Ngôn ngữ: Tiếng Việt=true,English=false` inside `main`; screenshot |
| 2. Switches UI live + syncs header | Live after-click: h1 → "Account settings", `lang "en"`, header `VI=false,EN=true` |
| 3. i18n / build / lint / typecheck | Only reused keys; build `✓ built in 4.22s`; lint exit 0; typecheck 90 (= baseline), none in changed file |
| comments per code-comments.md | One 1-line "why" comment on `LANG_OPTIONS` (why labels aren't translated) |

Test case: no `.spec.ts` covers `PageAccountSettings.vue`; evidence is build + live browser check (MEMORY.md fallback case), no unit test added — the change is template wiring over already-tested `useCvLang`.

## Supersedes
none

## Noticed, not done
- The language choice lives in client storage (`useCvLang`), not in the user's account on the API — it doesn't follow the user across devices. Out of scope; would need a backend field.

## Seal gate
none (no commit/push this pass)
