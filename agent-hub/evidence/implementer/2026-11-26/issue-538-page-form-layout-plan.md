# 2026-11-26 - issue-538-page-form-layout

- Worker: implementer · Version: 0.1.0
- Node: `issue-538-page-form-layout` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Branch: `feature/issue-538-page-layout-stack` (off `staging` @ `da06aa4`, created via `gh issue develop 538`)
- Task: "#538 Page layout: stack title/description above content instead of left/right split — spec: agent-hub/doctrine/features/page-form-layout.md (analyst evidence agent-hub/evidence/analyst/2026-11-26/page-form-layout-spec.md). Change src/components/global/FormSection.vue (remove lg:grid-cols-3 / lg:col-span-2, stack at all widths) and DESIGN.md §4.3. Branch feature/issue-538-page-layout-stack."

## Hub bytes before: 103034

## Feature doc: doctrine/features/page-form-layout.md
(draft spec from the analyst, no open questions; its 6 acceptance criteria are the node's criteria.)

## Diff
| File | Why |
|---|---|
| `src/components/global/FormSection.vue` | `<section class="grid gap-4 lg:grid-cols-3 lg:gap-6">` → `grid gap-3` (was `gap-4` in the first pass, tightened after review); content div drops `lg:col-span-2`; header comment says "title + description on top, fields card below at full width (all viewports)" |
| `DESIGN.md` §4.3 | First bullet: Stripe-style `lg:grid-cols-3` split → stacked sections at every width (`grid gap-3`), with the #538 reason |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New node row `issue-538-page-form-layout` |

Not mine: `.claude/skills/todo/SKILL.md` was already modified in the working tree before this branch was created (operator's edit, carried over) — not part of this node. `agent-hub/doctrine/features/{page-form-layout.md,INDEX.md}` were written by the analyst (pass 0).

## Command (doctrine/MEMORY.md, repo root)
`npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`

## Output (final run, after the review's `gap-3` edit)
```
test=0
 Test Files  70 passed (70)
      Tests  525 passed (525)
lint=0
> resume-vuejs-website@1.46.0 lint
> eslint src --ext .js,.ts,.vue
build=0
✓ built in 3.85s
tc=2
74            ← `grep -c "error TS"` on the typecheck output
0             ← `grep -c FormSection` on the typecheck output
```
Typecheck: 74 errors ≤ baseline 75 (doctrine/MEMORY.md), none in a changed file.

## Live check
Vite `npm run dev` (started by me, stopped after) + debug Chrome :9888 via Playwright MCP, QA account `qa.full@example.com` (never the owner). For each `section.grid` with an `h2`: section rect vs. content rect.
- 1133×744, `/dashboard/information`: 5 sections ("Ảnh đại diện", "Thông tin cá nhân", "Mạng xã hội", "Link CV công khai", "Chia sẻ CV") — all `secL 264, secW 845, cardL 264, cardW 845, headerAbove true`. (Before: card was `lg:col-span-2` of 3 ≈ 2/3 of the width.)
- 1133×744, `/dashboard/account-settings`: 6 sections, all `sameBox true, w 845, headerAbove true`. "Xóa tài khoản": `titleColor rgb(248, 113, 113)`, `border rgb(248, 113, 113)`; others `rgb(250,250,250)` / `rgb(39,39,42)`.
- 744×1133, account-settings: 6× `[true, true, 712]` ([sameBox, headerAbove, width]).
- 1440×900, account-settings: 6× `[true, true, 896]`.
- Live check ran on the first pass (`gap-4`); the review's `gap-4`→`gap-3` only changes the vertical gap inside the section, not the left/width/order the criteria measure — not re-measured.
- Screenshot: `.playwright-mcp/issue-538-account-1133.png` (gitignored) — titles stacked above full-width cards, delete-account section red.

## Acceptance (features/page-form-layout.md)
| # | Criterion | Evidence |
|---|---|---|
| 1 | No `grid-cols-3`/`col-span-2` in FormSection.vue | `grep -n "grid-cols-3\|col-span-2" src/components/global/FormSection.vue` → no output |
| 2 | No `lg:grid-cols-3` in DESIGN.md §4.3 | `sed -n '/### 4.3/,/### 4.4/p' DESIGN.md \| grep -n "lg:grid-cols-3"` → no output (§4.1 line kept, out of scope) |
| 3 | 1133×744 information + account-settings: title above card, same left/width | Live check rows 1-2 |
| 4 | Same at 744×1133 and 1440×900 | Live check rows 3-4 (account-settings) |
| 5 | Danger section red title + red border | "Xóa tài khoản" `rgb(248, 113, 113)` both |
| 6 | test/lint/build exit 0 | `test=0` (525 passed), `lint=0`, `build=0` |
| - | comments per code-comments.md | One header JSDoc line updated to the new layout (describes what/why the component is, no history); no new comments |

## Supersedes: none
(`grep -n "538" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.)

## Review (`/code-review medium`, branch diff vs main incl. working tree)
- FormSection:20 — stacked `gap-4` (16px) too close to the page's `space-y-6` (24px) between sections → **fixed**: `gap-3`, DESIGN.md §4.3 updated to match; checks re-run (Output above).
- FormSection:24 — `actions` slot on its own row under the description → not changed: the spec (`features/page-form-layout.md` Behavior #3 / Open questions default) keeps it there; moved to Noticed.
- FormSection:7 — `import { defineProps }` compiler-macro warning → pre-existing, not this diff; Noticed.
- `useDownloadCv.ts:53` ×2, `PageAtsCheck.vue:65` (stale active-profile id) → from #448 commits already on staging, not this diff; Noticed.
- `.claude/skills/todo/SKILL.md:137,141` (`--owner`, match by `content.number`) → operator's uncommitted edit, not this diff; Noticed.

## Noticed, not done
- Actions slot could sit beside the title (`flex justify-between`) now that the header is full width — operator call, spec kept current order.
- `FormSection.vue:7` imports `defineProps` (compiler macro warning).
- #448 follow-up: `useDownloadCv.ts:53` / `PageAtsCheck.vue:65` forward a stored active-profile id without checking it still exists; Header/PageHome download silently uses the active profile.
- `.claude/skills/todo/SKILL.md` step 6: `--owner` undefined for cross-owner projects; board item matched by `content.number` only (ambiguous across repos).
- `card: false` content with `actions` slot (PickedSkills / VeeFormGeneralInformationUpdate on Skills/Languages) not measured live — same template path, the class change applies identically.

## Dead ends
none

## Seal gate
none — no commit/push/merge in this pass.
