# 2026-11-01 - issue-374-skill-name-emphasis

- Worker: implementer · Version: 0.1.0
- Node: `issue-374-skill-name-emphasis` (new node; `issue-374-skill-group-actions` already SEALED)
- Branch: `feature/issue-374-skill-badges` (same unshipped #374 branch)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/374 (follow-up)
- Task (verbatim): "phần tên skill cũng làm cho rõ lên"

## Hub bytes before
85553

## Acceptance criteria
1. Skill names in the professional-skills badges are visibly clearer than before (before: `badgeClass()` = `h-5 text-xs`, `text-fg-2` for the whole badge).
2. Years + × stay secondary; × still deletes (unchanged handler/aria-label).
3. Build, lint and tests pass. Typecheck stays at or below 90, with none in `PageSkills`.

## Diff
| file | why |
|---|---|
| `src/pages/dashboard/PageSkills.vue` | Badge span: `inline-flex h-7 items-center gap-1.5 rounded-sm bg-surface-2 px-2.5 text-sm` (same surface as the neutral badge, one step taller and larger); name wrapped in `<span class="font-medium text-fg">`; × button gets `text-fg-3` (years already `text-fg-3`). Unused `badgeClass` import removed. Shared `badge.lib` untouched (status badges elsewhere keep DESIGN §5.6 size). |

## Command / Output
- `npm run build` → `✓ built in 3.70s` · lint → `lint=0` · typecheck → `90`, `grep PageSkills` → no output (`grep-exit=1`) · `npm run test` → `Tests  311 passed (311)`
- Live, owner account (read-only, reload only): first badge `{"text":"JavaScript (ES6+)· 4 năm","height":"28px","fontSize":"13px","weight":"500","color":"rgb(250, 250, 250)"}` (was 20px / 12px / text-fg-2). Screenshot `.playwright-mcp/skill-groups.png`.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | live computed style 28px/13px/500/fg vs previous h-5/text-xs/fg-2; screenshot |
| 2 | diff only touches classes; × handler + aria-label unchanged |
| 3 | outputs above |
| comments per code-comments.md | no comments added |

## Supersedes
none

## Noticed, not done
- The owner account's professional skills changed during this session: 43 skills became 41, and `HTML5`, `CSS3` and `SCSS` became one skill `HTML5/SCSS · 5 năm`. No write from this session touched the owner account, so I'm asking the operator whether they made the change.

## Seal gate
none (no commit/push, no writes)
