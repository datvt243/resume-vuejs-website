# 2026-11-01 — issue-370-remove-header-lang-switch — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-370-remove-header-lang-switch`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-370-remove-header-lang-switch-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context, not the implementer session), launched with the task "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-370-remove-header-lang-switch-plan.md"`. This context has no memory of writing the diff.

## Verdict: SEAL

## Cited (OK)
- Branch `feature/issue-370-language-in-settings` (not main/staging): no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: `npm run test`, `build`, `lint`, `typecheck`. Output quoted, not cut.
- Criterion 1 (no header switch): `grep -rn "LangSwitch|header.language|languageInfo|header.cvLanguage" src` → no output (covers both header blocks); live: no `header` radiogroup; screenshot `.playwright-mcp/preview-cv-lang.png`.
- Criterion 2 (CV picker in settings + preview, synced, UI unaffected): live sequence. Settings click EN → `lang "vi"`, `cvLang "en"`; Preview radiogroup shows `English=true` (synced); Preview click Tiếng Việt → `cvLang "vi"`, `lang "vi"`, CV headings in Vietnamese.
- Criterion 3 (earlier node still holds): live settings sections `[..., "Xóa tài khoản", "Ngôn ngữ ứng dụng", "Ngôn ngữ CV"]`; i18n specs `follows only setUiLang` / `stored uiLang wins` among the 308 passing.
- Criterion 4 (i18n clean, checks green): grep empty; key-parity/used-keys spec passing; `Tests 308 passed (308)` (311 − 3 deleted LangSwitch tests); build ✓; lint exit 0; typecheck `90` = baseline. The only touched-area error (`PagePreview.spec.ts(51,23) TS2683`) is in an unchanged spec, and the stash check shows it on the base too.
- Comments per code-comments.md: one 1-line WHY on `LANG_OPTIONS`; i18n doc comment updated.
- Supersedes: `issue-370-app-language-split`. Its REOPEN gap (logged-out header passing `ui`) is gone with the switch. Its criterion 4 (logged-out users can change UI language) is dropped by a recorded operator decision ("Bỏ hết"), listed under "Noticed, not done". The rest is re-verified as criterion 3 here.
- Seal gate: none (no commit/push). Diff is proportional to the operator's ask (remove header switch + put the CV picker where the operator chose).

## Missing
none

## Forbidden hit
none

## PM status
Node row → SEALED, archived to `dev-loop-archive.md`, pointer row left. Superseded row `issue-370-app-language-split` moved to the archive under `## Superseded by \`issue-370-remove-header-lang-switch\` (2026-11-01)` and deleted from the active file.

## Re-run
none (audit-only; note output is verbatim and covers every criterion)
