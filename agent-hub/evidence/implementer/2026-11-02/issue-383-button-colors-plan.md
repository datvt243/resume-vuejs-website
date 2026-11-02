# 2026-11-02 - issue-383-button-colors

- Worker: implementer · Version: 0.1.0
- Node: `issue-383-button-colors`
- Branch: `feature/issue-383-button-colors` (off synced `staging` @ v1.36.0 sync, via `gh issue develop 383`)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/383
- Task (verbatim): "đồng bộ lại toàn bộ màu sắc của các Button, Add - xanh lá, update - cam, delete - đỏ, clone, view - xanh dương, màu sắc có thể điều chỉnh HUE cho phù hợp"

## Hub bytes before
84569

## Approach
- **One mechanism instead of ad-hoc classes.** `buttonClass({ action })` and `<Button action>` map `add|update|delete|clone|view` to semantic tokens: success, warning, danger, info, info.
- **Which variants.** Secondary and ghost variants get the tone's text color and a `-subtle` hover. Secondary keeps its border. Solid variants (primary, danger) keep their fill: primary is already green (accent), and danger is already red.
- **Why a lookup table.** Each tone string is a full class set, not concatenated with the variant classes. Two `text-*` classes on one element resolve by CSS order, not class order, so concatenating them would be unreliable. The full strings also stay literal for Tailwind's content scan.
- **Hue shift (allowed by the task).** The `warning` token moves from amber to orange:
  - light `#b45309` → `#c2410c` (orange-700; contrast on white ≈5.2:1, AA for text)
  - light subtle `#fffbeb` → `#fff7ed`
  - dark `#fbbf24` → `#fb923c`
  - dark subtle → the matching rgba
  - Other warning users (toasts, ATS warnings, the "interview" status badge) become orange too. That's consistent with orange = attention.

## Mapping applied
| action | where |
|---|---|
| add | every non-primary `fa-plus` Button (empty-state "Thêm …" on 8 list pages, VeeFormGeneralInformationUpdate, PickedSkills, PageSkills per-group add, PageImportLinkedin), GroupTags add-tag button |
| update | ItemActions edit; PageSkills rename group; PageExperience view-modal "Sửa" (was primary green → secondary + update) |
| delete | ItemActions delete; PageSkills delete group; VeeFormGeneralInformationUpdate table row delete |
| clone | ItemActions duplicate (was green → blue) |
| view | ItemActions view (was neutral → blue); PageApplication "view public CV" link |

Unchanged on purpose:
- Primary "Thêm …" header buttons (already green fill).
- Danger confirm buttons (red fill).
- Badge × buttons (neutral, red on hover).
- Save/cancel/pager/download buttons (not add, update, delete, clone or view).

## Diff
- `src/lib/button.lib.js`: `actionTones` + the `action` param.
- `src/components/global/Button.vue`: `action` prop.
- `src/components/global/ItemActions.vue`: `!` color overrides replaced by `action`.
- `src/styles/tailwind.css`: 4 warning token values.
- Callers listed in the table above.
- `src/lib/button.lib.spec.ts` (new): each action colors ghost + secondary, and solid variants or unknown actions stay unchanged.
- `DESIGN.md` §5.3: action-color table.
- `.claude/CLAUDE.md`: ItemActions line + the `action` prop rule.

## Command
`npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`. Built CSS grep. Live: Playwright, `qa.full@example.com` in separate contexts with `colorScheme` light and dark, read-only.

## Output
- `Tests  329 passed (329)` (+6 `button.lib.spec.ts`) | `✓ built in 3.72s` | `lint=0` | typecheck `90`. A grep over every changed file gives no output (`grep-exit=1`).
- Built CSS `dist/assets/index-*.css` contains `hover\:bg-warning-subtle`, `hover\:bg-info-subtle`, `hover\:bg-success-subtle`, `hover\:bg-danger-subtle`, `.text-warning` and `.text-info`. None of these classes was purged.
- Live computed `color`:
  ```
  light: Sửa rgb(194,65,12) · Nhân bản rgb(37,99,235) · Xóa rgb(220,38,38) · Thêm (main skills) rgb(21,128,61) · Đổi tên nhóm rgb(194,65,12) · Xóa nhóm rgb(220,38,38) · writes []
  dark:  Sửa rgb(251,146,60) · Nhân bản rgb(96,165,250) · Xóa rgb(248,113,113) · Thêm rgb(74,222,128) · Đổi tên nhóm rgb(251,146,60) · Xóa nhóm rgb(248,113,113) · writes []
  ```
  Screenshots: `.playwright-mcp/btn-colors-{education,skills}-{light,dark}.png`. The education row shows orange edit, blue duplicate and red delete, and the header add button is green.

## Acceptance
| Criterion (from task) | Evidence |
|---|---|
| Add green | live Thêm success green (both schemes); spec |
| Update orange | live Sửa / Đổi tên nhóm = new orange token; spec |
| Delete red | live Xóa / Xóa nhóm danger; spec |
| Clone + view blue | live Nhân bản info blue; view mapped in ItemActions + PageApplication (spec covers `view`) |
| Hue adjusted to fit | warning token amber → orange, AA contrast in light |
| Checks | outputs above |
| comments per code-comments.md | 1-line WHY on actionTones (solid keeps fill) and the Button prop |

## Supersedes
none

## Noticed, not done
- The view button (Experience only) and the PageApplication eye link weren't screenshotted live. They're covered by the mapping and spec.
- Badge × buttons stay neutral (red on hover). Making every × red would be visually loud. I can change it if wanted.

## Seal gate
none (no commit/push), no data writes.
