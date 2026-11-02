# 2026-11-01 — issue-370-app-language-split — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-370-app-language-split`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-370-app-language-split-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context, not the implementer session), launched with the task "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-370-app-language-split-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
Criterion 4 ("Users who are logged out can still change the UI language") has no evidence for the part that delivers it: `Header.vue` passing `ui` to `LangSwitch` in the logged-out block. The cited evidence is the component spec (`LangSwitch` "with ui (logged out) sets the UI language"), which proves `LangSwitch` works when given `ui`, not that the header gives it. The note itself says "Logged-out header NOT checked live". If that wiring is wrong, logged-out users (login/register pages) can only change the CV language and can't switch the UI at all, so this is the core of the criterion, not a nice-to-have. → `EDIT_UNVERIFIED` for criterion 4.

## Cited (OK)
- Branch `feature/issue-370-language-in-settings` (not main/staging): no MAIN_EDIT. Same branch as the sealed, unshipped predecessor, with the reason stated.
- Commands match `doctrine/MEMORY.md`: test, build, lint, typecheck. Typecheck `90` = baseline, none in changed files.
- Criterion 1: live `sections` list ends with "Ngôn ngữ ứng dụng"; screenshot cited.
- Criterion 2: live, the settings click gives lang en with cvLang still vi; the header click gives cvLang en with lang unchanged. Specs cited for both directions.
- Criterion 3: live `Xóa tài khoản [danger]` (h2 `text-danger`); screenshot shows the red border.
- Criterion 4, migration part: spec starts from `cvLang` en; spec "a stored uiLang wins over cvLang".
- Criterion 5: `Tests 311 passed (311)` including the i18n key-parity spec; build ✓; lint exit 0.
- Comments row present (1-line WHY comments, doc block updated).
- Supersedes: none (predecessor already SEALED). Seal gate: none (no commit/push). Diff is proportional to the operator's 3 asks. Moving language below the danger section is what the operator asked for and is noted.

## Missing
- Evidence that the logged-out header switch changes the UI language (`<html lang>` / `i18n` locale and `uiLang`), not `cvLang`.

## Forbidden hit
EDIT_UNVERIFIED (criterion 4, logged-out path)

## To fix
Check it without logging the operator out: use a separate Playwright browser context (`browser.newContext()`, its own empty storage, so logged out) on `http://localhost:5173/resume-vuejs-website/#/login`. Click EN in the header, then cite `document.documentElement.lang`, `localStorage.uiLang`/`cvLang` in that context, and the translated login heading. A `Header` spec asserting the logged-out `LangSwitch` gets `ui` would also do. Then re-run the verifier. No code change is needed unless the check fails.

## PM status
Not updated (REOPEN; row stays `sealed_pending_verifier` per RatchetOnly).

## Re-run
none (audit-only; the gap is missing evidence, which the Re-run scope rules say to REOPEN on rather than re-run)
