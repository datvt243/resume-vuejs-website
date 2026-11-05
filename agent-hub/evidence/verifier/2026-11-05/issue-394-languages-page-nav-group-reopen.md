# 2026-11-05 — issue-394-languages-page-nav-group — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-394-languages-page-nav-group`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-394-languages-page-nav-group-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "You are a fresh, isolated verifier subagent for the agent-hub ... You did NOT write this diff — you were spawned specifically to verify it" and skill args `verifier "agent-hub/evidence/implementer/2026-11-05/issue-394-languages-page-nav-group-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
1. **DESIGN.md §10 definition of done not met.** This is a UI change (sidebar shell + new page). CLAUDE.md says to follow DESIGN.md, and §10 requires screenshots at 1440px light, 1440px dark and 375px dark. The note says: "Light / 375px screenshots not taken." The new disclosure group in the sidebar is the part most likely to break at 375px (mobile sidebar/drawer), so this needs evidence, not an assumption. Same gap got REOPEN on `issue-211-epic-review` round 1.
2. **Other §10 items not reported:** keyboard pass (Tab to the disclosure button, Enter/Space toggles it, focus stays visible) and the token grep on changed files. §10 says to "check each item and report the result". The note has no line for either.

Fix:
- Take 1440 light and 375 dark screenshots of `/dashboard/languages` with the group open (also with a child route active). At 375, open the mobile sidebar/drawer if there is one. Cite the file names and say what each one shows.
- Do a keyboard pass on the disclosure and cite the result (aria-expanded flips on Enter/Space, focus ring visible).
- Run the §10 token grep on the changed `.vue` files and cite the output.

## Cited (OK)
- Branch `feature/issue-394-language-page-more-menu` (off `staging`): not main/staging, no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: lint exit 0, test `55 passed / 352 passed`, build `✓ built in 3.90s`, typecheck 90 = baseline 90. The only hit in the touched area is in an unchanged spec file, and it existed before. Not truncated.
- Criterion 1 (own route + sidebar link): live url `/dashboard/languages`, h1 "Ngoại ngữ", existing row listed; general-information `hasLanguagesSection:false`.
- Criterion 2 (disclosure, aria-expanded, auto-open on child): live `false → true` on click, `true` + aria-current on certificate, `false` back on general-info.
- Criterion 3 (vi + en): `nav.languages`, `nav.achievements` added to both blocks.
- Criterion 5 (dev-server check): live Playwright JSON on qa.full, read-only.
- Icons: `initFontAwesomeIcon.spec.ts` passes.
- Comments row present (2 why-comments, no issue refs).
- Supersedes: none; no other open #394 row. Seal gate: no commit/push. Diff fits the node.

## Missing
- 1440 light + 375 dark screenshots (DESIGN.md §10).
- Keyboard pass result for the disclosure.
- §10 token grep output on changed files.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## Re-run
none — audit only; the note's command output is verbatim and matches doctrine.

## PM status
Not changed (REOPEN). Row stays `IN_PROGRESS`; REOPEN pointer added to the row text.
