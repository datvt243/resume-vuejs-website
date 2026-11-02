# 2026-11-01 — issue-374-skill-name-emphasis — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-skill-name-emphasis`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-skill-name-emphasis-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched by the implementer session with the instruction "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-skill-name-emphasis-plan.md"`. No memory of writing the diff.

## Verdict: SEAL

## Cited
- Branch `feature/issue-374-skill-badges`, not main/staging, so no MAIN_EDIT. This is a new node because `issue-374-skill-badges` and `issue-374-skill-group-actions` are already SEALED (RatchetOnly).
- Commands match `doctrine/MEMORY.md`: build `✓ built in 3.70s`, lint 0, typecheck 90 (= baseline 90), `grep PageSkills` empty (`grep-exit=1`), test `Tests  311 passed (311)`. Same output format accepted in the sibling seal. Not truncated.
- C1: live computed style on the owner account (read-only reload) shows the first badge at 28px / 13px / weight 500 / fg `rgb(250, 250, 250)`, up from h-5 (20px) / text-xs (12px) / text-fg-2. Screenshot cited.
- C2: the note says only classes changed. I confirmed this with a read-only grep of the current `PageSkills.vue` (lines 163-173): years `text-fg-3`, the × button is `text-fg-3`, and `:aria-label="$t('generalInfo.deleteSkill', …)"` + `@click="remove(skill.index)"` are still present. `badgeClass` has no remaining references in the file, so removing the import is clean.
- C3: same outputs as above.
- Comments: "no comments added".
- Supersedes: none. No other open #374 row exists on the active diagram.
- Seal gate: none (no commit/push/writes).
- Proportionality: one template block in one file. Shared `badge.lib` is untouched, so status badges elsewhere keep their size.

## Missing
none

## Forbidden hit
none

## Note for operator
The implementer reports that the owner account's professional skills changed during the session (43 → 41, and HTML5/CSS3/SCSS were merged), and says the session made no write. This is outside this node's scope. The operator should confirm they made the change.

## PM status
`issue-374-skill-name-emphasis` → SEALED. The full row is appended to `haven/diagrams/dev-loop-archive.md` and the active row is replaced with a pointer. The oldest pointer (`issue-312-load-login-errors`, whose full row is already in the archive) is pruned to keep 20.

## Re-run
partial: a read-only `grep` of `src/pages/dashboard/PageSkills.vue` to back C2 (handler/aria unchanged), because the note gave only a statement for it. No build, lint, test or typecheck re-run.
