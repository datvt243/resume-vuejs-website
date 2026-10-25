# 2026-10-25 - issue-315-user-menu-label - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-315-user-menu-label`
- Note under review: `evidence/implementer/2026-10-25-issue-315-user-menu-label.md`

## Verdict: SEAL

## Isolation proof
Spawned as a fresh subagent with the task string `verifier "issue-315-user-menu-label — evidence note agent-hub/evidence/implementer/2026-10-25-issue-315-user-menu-label.md"` and the instruction "You are a fresh, separate verifier subagent; you did NOT write this diff". This context holds no implementer turns.

## Cited
| Check | Evidence in note |
|---|---|
| 1. Caret has translated name, not markup | spec asserts caret `.sr-only` = `'Open account menu'` with HTML `text`; red on old `Dropdown.vue` (`1 failed | 9 passed`), green with fix (`14 passed`). Header passes `$t('header.accountMenu')`. |
| 2. `aria-haspopup` / `aria-expanded` | same spec: `aria-haspopup="true"` on both buttons, main `aria-expanded="false"` |
| i18n vi + en | key in both locales (diff table); also seen in worktree `src/i18n/index.ts` lines 21 and 496 |
| Commands per `doctrine/MEMORY.md` | `npm run test` (278 passed + 1 pre-existing VeeForm failure, baseline cited from #307 note) · `npm run build` `✓ built in 3.69s` · `npm run typecheck` 90 = baseline, none in changed files |
| Comments per code-comments.md | one `//` WHY comment, no `(#N)` |
| Branch (`NoMainEdit`) | `fix/issue-315-user-menu-label` off `staging` `3c06ad3`; worktree branch confirmed |
| Supersedes / Still open | both `none`; no other open #315 row on the active diagram |
| Seal gate | no commit/push, none required |
| Proportionality | 4 source files, all within the issue; fallback keeps `PageReference` caret unchanged |

## Missing: none
Manual browser check is BLOCKED (hidden Chrome window), stated openly; the component spec mounts the real `Dropdown`, which covers both criteria.

## Forbidden states: none hit
ADHOC_WORK no (node on diagram) · NO_EVIDENCE no · EDIT_UNVERIFIED no (outputs cited, typecheck stated) · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row updated on this SEAL) · MAIN_EDIT no.

## PM status
Row collapsed to a SEALED pointer; full row appended to `haven/diagrams/dev-loop-archive.md`. Pointer rows went to 23, so the 3 oldest (`issue-221-table-default`, `issue-222-forms`, `issue-223-crud-lists`, already in the archive) were removed, leaving 20.

## Re-run: none
Audit only; note outputs are verbatim, commands match doctrine, not outward-facing.
