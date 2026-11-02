# 2026-11-02 — issue-374-nodata-box — SEAL (round 2)

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-nodata-box`
- Evidence reviewed: `evidence/implementer/2026-11-02/issue-374-nodata-box-plan.md`, including its "## REOPEN fix (round 2)" section
- Previous verdict: `evidence/verifier/2026-11-02/issue-374-nodata-box-reopen.md`

## Isolation proof
Separately spawned Agent subagent (fresh context) for "REOPEN round 2". It was launched with "You are a fresh, isolated verifier subagent; you did not write this diff. This is REOPEN round 2: the previous verdict is ...issue-374-nodata-box-reopen.md". It also got the operator constraints (owner account and tab read-only, writes only as qa.full in a separate context) and the skill args `verifier "agent-hub/evidence/implementer/2026-11-02/issue-374-nodata-box-plan.md"`. This context has no memory of writing the diff or the round-2 specs.

## Verdict: SEAL

## Reason
Both gaps from round 1 are now closed with observed evidence, specs that render the real templates, and no account writes:
- Criterion 1, professional list, empty: `PageSkills.spec.ts` mounts the professional tab with empty items and asserts that "Chưa có dữ liệu" has a parent with `border border-line`. This proves the `v-else` wrapper lands on the empty branch.
- Criterion 2, non-empty: the `PageSkills.spec.ts` case "shows the grouped skills and no empty box" uses `{Vue, FE}` and asserts no empty state and `h3` = "FE". In `MainSkills.spec.ts`, `[{Vue}]` renders the badge "Vue" with `.border-line .no-data` count 0. For empty `modelValue`, the NoData parent is a `DIV` with `border border-line`.
- Targeted run: `✓ MainSkills.spec.ts (5 tests)`, `✓ PageSkills.spec.ts (4 tests)`, `Tests  9 passed (9)`.
- Full gate: `Tests  320 passed (320)`. That is up from 317, which matches the +3 specs. `✓ built in 3.64s`, lint 0, typecheck 90 (= baseline 90), and the changed-files grep exits 1 with no output. The commands match `doctrine/MEMORY.md`, and the output is not truncated.

## Cited (OK)
- Branch `feature/issue-374-skill-badges` is not main or staging, so there is no MAIN_EDIT.
- Criterion 1, main skills, live (QA account, read-only): computed style `{"border":"1px solid","radius":"8px","bg":"rgb(255, 255, 255)"}`. Screenshot: `.playwright-mcp/nodata-box.png` (file present).
- Proportional: 2 markup-only files. Leaving `NoData` itself unchanged avoids double borders on the other list pages.
- Comments row present (none added). Supersedes: none. Seal gate: none (no commit/push). Owner tab not navigated.

## Missing
none. One note: the professional-list spec asserts `border border-line` and does not assert `rounded-md`/`bg-surface`. Those two classes are observed live on the main-skills wrapper, and the structural risk raised in round 1 (`v-else` placement) is now proven. This is not a blocker.

## Forbidden hit
none

## PM status
SEALED. Collapse on seal: the full row was appended to `haven/diagrams/dev-loop-archive.md`, and the active row was replaced by a pointer. The pointer count went to 21, so the oldest pointer (`issue-340-input-cannot-clear`, already in the archive) was dropped.

## Re-run
none (audit only). No build, lint, test or live run was repeated.
