# 2026-11-18 - issue-455-format-by-app-lang - SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-455-format-by-app-lang` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note verified: `evidence/implementer/2026-11-18/issue-455-format-by-app-lang-plan.md`
- Verdict: **SEAL**

## Isolation proof
Fresh Agent-tool subagent spawned by the `/todo` implementer session with the prompt "You are a fresh, isolated verifier for the agent-hub ... You did NOT write this diff. Run the project skill `/worker verifier` yourself ..." — this context holds none of the implement pass's reasoning; it saw only the evidence note, diagram row and feature doc.

## Re-run: none
Audit-only. Output is verbatim, commands match `doctrine/MEMORY.md`, no exception case applies (not outward-facing, not a release gate).

## Cited
| Criterion | Evidence in note | Verdict |
|---|---|---|
| 1 Visits locale + live switch | spec "formats numbers and visit times in the app language": `1.234` → `1,234`, table time vi-VN → en-US after `uiLang.value = 'en'`; 11/11 pass | ok |
| 2 Home locale | `PageHome.vue:24/48/60/135` on `uiLocale`; no PageHome spec (stated), backed by typecheck showing no errors in `PageHome` (vue-tsc checks script + template `.value` use) + module served 200 | ok |
| 3 No `'vi-VN'` literal in pages | grep claim, mapping only in `i18n/index.ts` | ok |
| 4 Spec fails with fix reverted | mutation output: `Tests 1 failed | 10 passed (11)`, restored → 11 passed | ok |
| 5 test/build/lint/typecheck | 379 passed (58 files); `✓ built in 3.94s`; lint exit 0; typecheck `78` = baseline 78, none in touched files | ok |
| 6 Dev compile | 200 ×3 for changed files, Claude-started server killed | ok |
| 7 Comments per code-comments.md | one JSDoc line on `uiLocale`, no other comments | ok |
| Feature doc `cv-visits.md` Behavior #8 | doc updated to app-language format; operator answer to Open question 3 (2026-11-07, "Bug: format by app language — #455") recorded; Changelog row added; doc acceptance `npx vitest run src/pages/dashboard/PageVisits.spec.ts` passes | ok |

## Checks
- Commands vs `doctrine/MEMORY.md`: match (test, build, lint, typecheck with baseline count cited).
- Output cut/hidden: none (`build | tail -4` is a deliberate filter showing the success line, no `...`/truncated).
- `## Review`: present, inline pass of touched files; not a `docs` task, no security scope, no findings. Note: recipe prefers `/code-review medium` when available; inline is not a listed REOPEN condition.
- `## Supersedes: none` with grep cited.
- Forbidden states: ADHOC_WORK no (node exists) · NO_EVIDENCE no · EDIT_UNVERIFIED no · CODE_IN_HAVEN no (only `.md` changed under haven) · DIAGRAM_DRIFT no (row updated on this SEAL) · MAIN_EDIT no (branch `fix/issue-455-format-dates-and`, confirmed checked out).
- Seal gate: no outward-facing action in the diff.
- Proportionality: 3 source files + 1 spec + feature doc, all required by the node.
- Doctrine proposal: none.

## Missing: none
## forbidden_hit: null

## PM update
Active row → SEALED pointer; full row appended to `dev-loop-archive.md`; oldest pointer (`issue-374-skill-group-actions`, already archived) pruned to keep 20. Feature doc status left as is (fix SEAL proves one Behavior item).

## Noticed (not blocking)
Note's `## Noticed, not done`: `TableDefault.vue` / `toDate.js` still hardcode `vi-VN` — follow-up candidate, outside #455 scope.
