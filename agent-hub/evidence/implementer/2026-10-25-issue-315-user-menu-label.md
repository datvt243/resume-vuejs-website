# 2026-10-25 - issue-315-user-menu-label

- Worker: implementer
- Version: 0.1.0
- Node: `issue-315-user-menu-label` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator): "xong hết thì tiếp tục P3-P4". This pass covers issue #315 "[QC][P3] A11y: nút mở menu tài khoản có accessible name là chuỗi HTML thô".

## Hub bytes before: 82257
(82425 measured right after appending this node's row, minus that row, 168 bytes.)

## Branch
`fix/issue-315-user-menu-label`, created from up-to-date `staging` (`3c06ad3`, after the P2 merges) via `gh issue develop 315 --base staging --name fix/issue-315-user-menu-label`. It is checked out in the git worktree `../rv-wt315` (`node_modules` symlinked).

## Acceptance criteria (from #315)
1. The header user-menu caret is announced with a real, translated name ("Mở menu tài khoản" / "Open account menu"), not the `<span …>` markup.
2. The menu trigger buttons expose `aria-haspopup` (and `aria-expanded`).

## Diff
| File | Why |
|---|---|
| `src/components/global/Dropdown.vue` | New optional prop `label`. The split caret's `sr-only` text is `label \|\| text`. `text` is rendered with `v-html` on the main button, so it can be markup, and the old caret printed that markup as literal text. Added `aria-haspopup="true"` on the main button, the caret and the `href` variant (`attrBtnToggle`), plus `aria-expanded` on the main button (it already had it on the caret and the link). One `//` WHY comment on the prop. |
| `src/pages/_layouts/Header.vue` | User menu passes `:label="$t('header.accountMenu')"`. |
| `src/i18n/index.ts` | `header.accountMenu`: vi "Mở menu tài khoản", en "Open account menu". Added to both locales. |
| `src/components/global/Dropdown.spec.ts` | New test: split + HTML `text` + `label` → caret `sr-only` = label; both buttons `aria-haspopup="true"`; main `aria-expanded="false"`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

The other consumer (`PageReference`'s split action menu, plain-text `text`, no `label`) keeps its current caret name through the fallback.

## Command
From the worktree root: `npm run test` · `npm run build` · `npm run typecheck`. Also `npx vitest run src/components/global/Dropdown.spec.ts src/components/Navbar.spec.ts`, with and without the `Dropdown.vue` change (`git stash push src/components/global/Dropdown.vue`).

## Output
With the fix: `Tests  14 passed (14)` (Dropdown + Navbar specs).
Without the fix (old `Dropdown.vue`):
```
   × Dropdown > names the split caret from `label`, not the (HTML) `text`, and marks both buttons as menu triggers 6ms
      Tests  1 failed | 9 passed (10)
```
`npm run test`: `Tests  1 failed | 278 passed (279)`. The single failure is the pre-existing `VeeForm > VI | EN toggle > flags the hidden language…`, which also fails on `staging` (baseline recorded in `2026-10-25-issue-307-modal-save-close.md`).
`npm run build`: `✓ built in 3.69s`
`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline); `grep -E "Dropdown|Header|i18n/index"` → no match.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Caret has a translated name, not markup | spec `caret.find('.sr-only').text()` → `'Open account menu'` for an HTML `text`; red on the old component. Header passes `$t('header.accountMenu')`, and both locales have the key (diff). |
| 2. `aria-haspopup` / `aria-expanded` | same spec: `aria-haspopup` `'true'` on both buttons, main `aria-expanded` `'false'` |
| i18n rule (key in vi + en) | `src/i18n/index.ts` diff: two lines, one per locale |
| Tests / build / typecheck | 278 passed + 1 pre-existing failure · `✓ built in 3.69s` · 90 = baseline |
| Comments per code-comments.md | One `//` WHY comment, no `(#N)` |

**Manual browser check: BLOCKED.** The Playwright-controlled Chrome window reports `visibilityState: "hidden"` (see the #308/#309 notes), so the live accessibility tree was not re-read. The component spec mounts the real `Dropdown`.

## Supersedes: none
## Still open: none
## Noticed, not done: none new

## Seal gate
None (no commit/push).
