# 2026-11-01 — issue-374-skill-badges — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-skill-badges`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-skill-badges-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched by the implementer session with the task "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-skill-badges-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
Criterion 5 (i18n) breaks the project's i18n rule in `.claude/CLAUDE.md`: "Interpolate with `{name}` (`t('form.addTitle', { name })`), never string-concatenate translated fragments."
The note says the × aria-label reads `Xóa <name>` but does not show where that string comes from. A targeted grep (only to check this claim) finds:

```
src/pages/dashboard/PageSkills.vue:129:  :aria-label="`${$t('common.delete')} ${skill.name}`"
```

That builds the label by concatenating a translated fragment with the name. Fix: add a key with a placeholder, for example `generalInfo.deleteSkill: 'Xóa {name}'` / `'Delete {name}'`, in both vi and en. Then use `$t('generalInfo.deleteSkill', { name: skill.name })`, and cite the live aria-label again. Run the typecheck grep again too.

## Cited (OK)
- Branch `feature/issue-374-skill-badges`: not main or staging, so no MAIN_EDIT.
- The commands match `doctrine/MEMORY.md`. Test: `Tests 311 passed (311)`. Build: `✓ built in 3.79s`. Lint: 0. Typecheck: 90 (at most the baseline of 90), and the grep over every changed src file found nothing (`grep-exit=1`).
- Criteria 1–4: verbatim live output on the owner account (read-only), with 10 named groups and 43 badges. On the QA account: add 200, a badge under `QA-374g`, the × deletes with 200, still gone after a reload, and the tag was cleaned up so the account is back as found. Covered by the `groupSkills` spec. The slot fallback keeps the table for personal skills and foreign languages.
- The comments row is present. Supersedes: none, and #374 has no other active row. Seal gate: none (no commit or push). The diff is proportional to the node.

## Missing
- Criterion 5: the × aria-label is not built through i18n interpolation (see Reason).

## Forbidden hit
none

## PM status
Not changed (REOPEN). Under RatchetOnly the row stays `sealed_pending_verifier`. A REOPEN pointer was added to the row text.

## Re-run
none (audit only). The one targeted grep of `PageSkills.vue` ran only to check the i18n source of the aria-label, which the note claims but does not show. No build, lint or test was run again.
