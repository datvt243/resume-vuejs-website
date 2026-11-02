# 2026-11-02 — issue-374-nodata-box — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-nodata-box`
- Evidence reviewed: `evidence/implementer/2026-11-02/issue-374-nodata-box-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "Run the project skill `/worker verifier` on the evidence note ... You are a fresh, isolated verifier subagent and did not write this diff", plus the operator constraints (owner account and its tab read-only, writes only as qa.full in a separate context), and skill args `verifier "agent-hub/evidence/implementer/2026-11-02/issue-374-nodata-box-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
Criterion 1 names two places: the empty "Kỹ năng chính" and the empty professional-skills list. Only the first one is evidenced (computed style + screenshot). For the professional list the note says "Not checked live" and cites "same classes (diff)". That is a reading of the diff, not an observed result (`EvidenceOnly`; same bar as `issue-374-main-skills-reopen.md`, item 1). The risk is real, not cosmetic: if `v-else` ended up on the wrong element in `PageSkills.vue`, the wrapper would either render next to a non-empty list or not at all. Neither the empty nor the non-empty state of that list is shown by any cited test or run.

The same gap applies, more mildly, to criterion 2 ("nothing else changes") for both files: no evidence that a non-empty main-skills section / professional list renders without an extra empty bordered box. 317 tests pass, but the note does not say any of them covers the empty or non-empty branch here.

Fix (either route is enough, no account writes needed for the first):
- Spec: in `PageSkills.spec.ts`, mount with an empty professional list and assert `NoData` sits inside `div.rounded-md.border.border-line.bg-surface`; mount with skills and assert no such wrapper/NoData. Same pair in `MainSkills.spec.ts` (empty vs. with `modelValue`). Cite test names and the pass line.
- Or live: as `qa.full@example.com` in a separate browser context, empty the professional list, cite the wrapper's computed style, then restore the skills and cite the restore.

## Cited (OK)
- Branch `feature/issue-374-skill-badges`: not main or staging, so no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: test `317 passed (317)`, build `✓ built in 3.68s`, lint 0, typecheck 90 (= baseline 90), changed-files grep exit 1 (none). Output not truncated.
- Criterion 1, main skills: computed style `{"border":"1px solid","radius":"8px","bg":"rgb(255, 255, 255)"}`, screenshot `.playwright-mcp/nodata-box.png`, QA account read-only.
- Scope decision (leave `NoData` itself unchanged to avoid double borders) is sound and proportional; 2 files, markup only.
- Comments row present (none added). Supersedes: none; other #374 rows are SEALED pointers. Seal gate: none (no commit/push). Owner tab not navigated.

## Missing
- Criterion 1: observed evidence (spec or live) for the empty professional-skills list rendering inside the bordered box.
- Criterion 2: evidence that the non-empty main-skills section and professional list render no empty wrapper.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## PM status
Not changed (REOPEN). Under RatchetOnly the row stays `sealed_pending_verifier`. A REOPEN pointer was added to the row text.

## Re-run
none (audit only). No build, lint, test, grep of `src` or live run was repeated.
