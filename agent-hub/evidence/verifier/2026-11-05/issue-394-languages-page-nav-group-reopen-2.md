# 2026-11-05 — issue-394-languages-page-nav-group — REOPEN (round 2)

- Worker: verifier · Version: 0.1.0
- Node: `issue-394-languages-page-nav-group`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-394-languages-page-nav-group-plan.md` (whole note, including `## REOPEN 1 response`)
- Previous verdict: `evidence/verifier/2026-11-05/issue-394-languages-page-nav-group-reopen.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with "You are a fresh, isolated verifier subagent ... This is round 2. Round 1 was REOPEN ... Don't overwrite the round-1 reopen note; if your verdict file name would collide with it, give yours a distinct name." The implementer pass did not have this round-2 task string. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
Round 1's three gaps are now mostly closed: token grep cited (no output, exit 1), keyboard pass cited (Tab to the group button, 2px solid focus-visible outline, Enter opens, Space closes, Tab goes into the sub-list), and 1440 light / 1440 dark / 375 dark sidebar screenshots described with `scrollWidth - innerWidth = 0`.

One gap is left. Every screenshot is of `/dashboard/award` or `/dashboard/certificate`. **The new page `/dashboard/languages` has no screenshot at all, in any of the three §10 views.** Round 1's fix list named `/dashboard/languages` explicitly. Round 1's only evidence of the page was a Playwright text dump. The page is new, and its table ("# / Ngôn ngữ / Cấp độ") is the part most likely to overflow at 375px. DESIGN.md §10 says "Nothing overflows, overlaps, or gets clipped", and that is not shown for this page.

Also, §10 says to "check each item and report the result", and two items still have no line in the note. Report them in the same pass:
- Empty, loading and error states of `PageLanguages` (for example qa.empty for the empty state, and the reload button's loading state).
- The `web-design-guidelines` pass. The skill is available in this repo.

Fix (no code change expected):
- Screenshot `/dashboard/languages` at 1440 light, 1440 dark and 375 dark. For 375, also cite `scrollWidth - innerWidth`. Give the file names and say what each one shows.
- Add one line on empty/loading/error states, with evidence (qa.empty screenshot or Playwright text).
- Add one line for the web-design-guidelines pass on the changed `.vue` files, or say why it was skipped.

## Cited (OK)
- Branch `feature/issue-394-language-page-more-menu` is not main or staging, so no MAIN_EDIT.
- lint exit 0; test `55 passed / 352 passed`; build `✓ built in 3.90s`; typecheck 90 = baseline 90, and the one touched-area hit is in an unchanged spec file. Commands match `doctrine/MEMORY.md`. Output not truncated.
- Criteria 1, 2, 3 and 5: same citations as round 1, still valid (no code change in round 2).
- §10 token grep: no output, exit 1 (added lines plus the full new PageLanguages.vue).
- §10 keyboard pass: focus-visible outline, aria-expanded flips on Enter/Space, logical Tab order into the children.
- §10 sidebar screenshots: 1440 light (`award-1440-light.png`), 1440 dark (`cert-expanded.png`), 375 dark drawer (`award-375-dark-drawer.png`), no overflow.
- Comments row present. Supersedes: none. Seal gate: none (no commit/push). Diff fits the node.

## Missing
- `/dashboard/languages` screenshots at 1440 light, 1440 dark and 375 dark (DESIGN.md §10).
- Empty/loading/error state result for PageLanguages (§10).
- web-design-guidelines pass result (§10).

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## Re-run
none — audit only; the note's command output is verbatim and matches doctrine.

## PM status
Not changed (REOPEN). Row stays `IN_PROGRESS`; round-2 REOPEN pointer added to the row text.
