# 2026-11-25 - issue-407-preview-a4-sheet - REOPEN

- Worker: verifier · Node: `issue-407-preview-a4-sheet` · New PM status: stays IN_PROGRESS (REOPEN)
- Branch named in note: `feature/issue-407-xem-truoc-xuat` (not main/staging) - NoMainEdit ok.

## Isolation proof
Spawned via the Agent tool with description "agent-hub verifier worker" / task "verify node issue-407-preview-a4-sheet", fresh blank context; the implementer's own task string was `/todo "fix #407"`.

## Reasoning
Audited from the note only. Cited and sufficient: test 513 passed, lint exit 0, build built, typecheck total 75 = baseline 75, `@page` grep, `dashboard-sidebar|dashboard-layout` grep empty, live 1440/375/print/6-combo PDF checks, vi+en `preview.pageN`, `## Feature doc`, `## Review`, `## Supersedes`/`## Still open`, comments row, branch, seal gate (login POSTs only). Forbidden states: none hit besides the two gaps below.

## Missing
1. Typecheck rule (recipe step 4, `doctrine/MEMORY.md` Typecheck row: "none in changed files"): the note's own output lists `src/pages/dashboard/PagePreview.spec.ts(59,23): error TS2683` - an error in a touched file. It is pre-existing (staging line 51), but the rule is "an error in a touched file -> REOPEN" with no exception. Fix: annotate `this` in that `mockImplementation(function ...)` (or restore the file's typecheck-clean state) and re-cite `npm run typecheck | grep -E "PagePreview|pageBreaks"` empty and total <= 75.
2. Feature-doc criterion "(#407) Live: `#/resume/<slug>` ... looks the same before and after (screenshot compare at 1440px and 375px)" has no screenshot compare; the note admits "no before/after pixel diff", offering DOM assertions only. Provide the before (staging) vs after comparison at 1440 and 375, or have the operator accept the DOM-only check and record that answer (`## Feature doc changed`).
Minor (not a reason alone): note has no `## Dead ends` section (README format); the Diff table says 6 spec tests but lists 7 cases.

## Re-run
none - audit-only; the reopen reasons come from the note's own output and the criteria text.
