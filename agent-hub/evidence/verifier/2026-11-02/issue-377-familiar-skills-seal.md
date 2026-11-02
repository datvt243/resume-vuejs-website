# 2026-11-02 — issue-377-familiar-skills — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-377-familiar-skills`
- Evidence reviewed: `evidence/implementer/2026-11-02/issue-377-familiar-skills-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context). It was launched with "You are a fresh, isolated verifier subagent and did not write this diff. Follow the verifier recipe exactly", the operator constraints (owner account and tabs read-only, writes only as qa.full in a separate context, restore to no main skills / no familiar skills / 43 professional skills / no tags), and the skill args `verifier "agent-hub/evidence/implementer/2026-11-02/issue-377-familiar-skills-plan.md"`. This context has no memory of writing the diff.

## Verdict: SEAL

## Reason
Every criterion has cited, observed evidence: unit specs, the full gate, and a live save/reload/remove/cleanup on the QA account against the deployed backend contract.

## Cited (OK)
- Branch `feature/issue-377-familiar-skills` (off `staging` @ `d26c203`), not main or staging, so there is no MAIN_EDIT.
- Backend contract read, not assumed: Joi `familiarSkills: [{ name }]`, no max. Prod went 400 → 200 after the Render deploy.
- Criterion 1: live h2 order `["Kỹ năng chính","Kỹ năng quen thuộc","Kỹ năng chuyên môn"]`; badges after save; × SAPUI5 → 200, saved 6, ui 6; empty box after cleanup. `.playwright-mcp/familiar-section.png` (opened) shows the section between main skills and the Tabs, with the bordered empty box.
- Criterion 2: popup title "Chọn kỹ năng quen thuộc"; SAP + "ui5" filter; reopen pre-checks 7; "Đã chọn 7" with 0 disabled. `.playwright-mcp/familiar-picker.png` (opened) shows "Đã chọn 7" with unticked rows still enabled. The spec with `max 0` asserts nothing is disabled after 3 ticks and the counter key is `selectedCount`.
- Criterion 3: live request keys `["_id","familiarSkills"]` → 200, persists across reload, main stays []. The 400 path (pre-deploy) keeps the popup open (modalOpen 1, ui []). The page spec asserts no `mainSkills` key and `setGeneralInformation({ familiarSkills })`. The existing main-skills specs are unchanged and passing.
- Criterion 4: `Tests  11 passed (11)` targeted; full `Tests  322 passed (322)` (up from 320 = +2 new specs); `✓ built in 3.79s`; lint 0; typecheck 90 (= baseline 90), and the changed-files grep exits 1 with no output. The commands match `doctrine/MEMORY.md`, and the output is not truncated. The i18n keys are listed for vi + en.
- Comments row present (doc block on PickedSkills, 1-line WHY on `max` 0 and `savePicked`).
- Proportional: the working-tree file list matches the note's diff table. Generalizing `MainSkills` into `PickedSkills` reuses the component instead of copying it. The unrelated `DESIGN.md` / `NoData.vue` changes are declared as outside this node (they belong to `issue-374-nodata-box`).
- Supersedes: none. Seal gate: none (no commit or push). The only writes went to the QA account, which was restored (familiar [], main [], professional 43).

## Missing
none

## Forbidden hit
none

## PM status
SEALED. Collapse on seal: the full row was appended to `haven/diagrams/dev-loop-archive.md`, and the active row was replaced by a pointer. The pointer count went to 21, so the oldest pointer (`issue-344-reload-empty-form`, already in the archive) was dropped.

## Re-run
none (audit only). No build, lint, test or live run was repeated. I only opened the two cited screenshots and listed `git status`.
