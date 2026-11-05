# 2026-11-05 — issue-394-languages-page-nav-group — SEAL (round 3)

- Worker: verifier · Version: 0.1.0
- Node: `issue-394-languages-page-nav-group`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-394-languages-page-nav-group-plan.md` (whole note, including `## REOPEN 1 response` and `## REOPEN 2 response`)
- Previous verdicts: `evidence/verifier/2026-11-05/issue-394-languages-page-nav-group-reopen.md`, `evidence/verifier/2026-11-05/issue-394-languages-page-nav-group-reopen-2.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with "You are a fresh, isolated verifier subagent ... This is round 3 of 3. The earlier verdicts were REOPEN ... name yours distinctly (e.g. `-seal.md` or `-reopen-3.md`)." The implementer pass did not have this round-3 task string. This context has no memory of writing the diff.

## Verdict: SEAL

## Reason
Every acceptance criterion and every gap from both REOPENs now has cited evidence. Round 2 asked for three things, and the note answers each: `/dashboard/languages` screenshots at 1440 dark, 1440 light and 375 dark, with body backgrounds and `overflow375: 0` cited; a states line; and a web-design-guidelines pass with no findings.

## Cited (OK)
- Branch `feature/issue-394-language-page-more-menu` (off `staging`). Not main or staging, so no MAIN_EDIT.
- (4) lint exit 0; test `55 passed / 352 passed`; build `✓ built in 3.90s`; typecheck 90, equal to the baseline of 90 (`doctrine/MEMORY.md`), and the one touched-area hit is in an unchanged spec file. Output is not truncated.
- (1) live url `/dashboard/languages`, h1 "Ngoại ngữ", existing row listed; general-information `hasLanguagesSection:false`.
- (2) aria-expanded goes `false` to `true` on click; it is `true` with aria-current on the certificate route and `false` again on general-info.
- (3) `nav.languages` and `nav.achievements` added to both the vi and en blocks.
- (5) dev-server Playwright checks on qa.full, read-only (not the owner account).
- §10 token grep: no output (exit 1). Keyboard pass: focus-visible 2px outline, Enter and Space toggle, Tab moves into the sub-list. Sidebar screenshots: 1440 light, 1440 dark and the 375 drawer, with no overflow.
- §10 page screenshots (REOPEN 2): `lang-1440-a.png` dark, `lang-1440-b.png` light, `lang-375-dark.png`. scrollWidth - innerWidth = 0, and the table is 341 px in a 341 px container.
- §10 states: the empty state is the `v-else` branch that renders `<NoData />`. I opened `TableDefault.vue` around lines 170-173 and confirmed it. Loading and error go through `useCandidate` / `handleBase`, which this diff does not change. The empty state was not tested live. I accept it because the page reuses the same components that general-information used.
- web-design-guidelines pass: line-cited results on LayoutDefault.vue and PageLanguages.vue, no findings.
- Comments row: 2 comments that explain why, no issue references. Supersedes: none. Seal gate: none (no commit or push). The diff fits the node; the DESIGN.md §3 listing change is required to keep the docs in sync.

## Missing
none

## Forbidden hit
none

## Re-run
none. Audit only: the command output is verbatim and matches doctrine. The only file I opened was TableDefault.vue, to check the empty-state citation. That file is not part of the diff, and I ran no commands.

## PM status
SEALED. The full row is archived to `haven/diagrams/dev-loop-archive.md`, and the active row is replaced with a pointer.
