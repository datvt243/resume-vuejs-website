# 2026-11-01 — issue-370-language-in-settings — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-370-language-in-settings`
- Note under review: `evidence/implementer/2026-11-01/issue-370-language-in-settings-plan.md`
- Verdict: **SEAL**

## Isolation proof
Separately spawned Agent subagent (fresh context, not the implementer session), launched with the task "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-370-language-in-settings-plan.md"`.

## Re-run
none — audit-only. Commands match `doctrine/MEMORY.md` (build, lint, typecheck), outputs are cited, every criterion is covered.

## Cited
| Criterion | Evidence |
|---|---|
| 1. Settings has a VI/EN section | Live: radiogroup `Ngôn ngữ: Tiếng Việt=true,English=false` inside `main`; screenshot `.playwright-mcp/settings-lang.png` |
| 2. Switches live, syncs with header | Live after-click: h1 "Account settings", `lang "en"`, header `VI=false,EN=true`; restored to `vi` |
| 3. i18n / build / lint / typecheck | Reused `header.language`/`header.languageInfo`, no new keys; build `✓ built in 4.22s`; lint exit 0; typecheck 90 = baseline, 0 in `PageAccountSettings.vue` |
| Comments per code-comments.md | One 1-line `//` WHY comment on `LANG_OPTIONS` (why endonyms aren't translated) |

## Missing
none

## Forbidden states
ADHOC_WORK no (node row on diagram) · NO_EVIDENCE no · EDIT_UNVERIFIED no · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row updated here) · MAIN_EDIT no (branch `feature/issue-370-language-in-settings`, off `staging`).

## Seal gate
No commit/push this pass.

## Proportionality
- One file changed (`PageAccountSettings.vue`), reuses `useCvLang` + `SegmentedControl` — minimal.
- Endonym labels `Tiếng Việt`/`English` are literal: accepted, same precedent as the header `LangSwitch` `VI`/`EN` literals, and language names in their own language don't change with the UI locale.
- Not part of this node: the working tree also has an untracked `QC_TESTER.md`. `/ship` should stage only the node's files.
