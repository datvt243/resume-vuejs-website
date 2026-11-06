# 2026-11-06 - issue-409-profile-modal-layout
Worker: implementer · Version: 0.1.0 · Node: `issue-409-profile-modal-layout` (haven/diagrams/dev-loop.prime-mermaid.md)
Task (verbatim): "#409 Profile CV: modal edit bị che UI — rà soát và sửa layout. Page /dashboard/profile, modal edit/create/clone (src/pages/dashboard/PageProfile.vue:188-231, Modal size=modal-xl, modal-dialog-scrollable, is-hidden-footer; 6 checklist sections each max-height 12rem overflow-y auto, then VeeForm with name field + Save/Cancel at the bottom). Suspected: nested scroll, name field + Save pushed below modal bottom; .profile-checklist uses var(--bs-border-color) (Bootstrap removed). Acceptance: identify what's hidden (screenshots desktop+mobile); name field at top of modal; Save/Cancel always visible (fixed modal footer); no nested scroll, long checklists still usable; border/tokens per DESIGN.md (no --bs-* vars); check edit, create, clone; light + dark mode. Branch: fix/issue-409-profile-modal-layout" — issue #409 https://github.com/datvt243/resume-vuejs-website/issues/409

## Branch
`fix/issue-409-profile-modal-layout` (off `staging` @ d9f88bf, synced with `git pull origin staging`, created via `gh issue develop 409 --base staging`)

## Hub bytes before
84539

## What was hidden (live, before the fix)
Measured on the unmodified files (temporarily restored from `HEAD`, then the fix copied back), qa.full@example.com, `/dashboard/profile` → Sửa "Tổng hợp":
| viewport | dialog bottom | name input top | Save bar top | nested scroll containers |
|---|---|---|---|---|
| 1366×768 | 740 | **828** | **802** | 0 (lists short enough) |
| 390×844 | 836 | **864** | **838** | **1** |

1. The `name` field and the Save/Cancel bar sat below the dialog's bottom edge. You had to scroll the whole body past all 6 checklists to reach them.
2. Every checkbox was clipped to a sliver at the left edge of its list (`before-desktop.png`). The scoped `.profile-checklist-item { padding: 0.125rem 0 }` zeroed `.form-check`'s `padding-left: 1.5em`. The input's `margin-left: -1.5em` then pushed it outside the list, where the list's `overflow-y: auto` clipped it.
3. A list taller than 12rem scrolled inside the scrolling modal body (nested scroll, seen at 390px).

## Diff
| file | why |
|---|---|
| src/components/veevalidate/VeeForm.vue | New default `<slot>` between the fields (and the hidden `_id` input) and the sticky button bar. No existing consumer passes default-slot content (grepped every `<VeeForm`), so other forms render unchanged. |
| src/pages/dashboard/PageProfile.vue | Checklist moved into VeeForm's default slot, so the order is name → checklists → sticky Save/Cancel, and the sticky bar now spans the whole modal body. Comment updated (the old one said VeeForm has no default slot). The list `div` uses `rounded-md border border-line px-3 py-2` instead of `.profile-checklist` (no `max-height`/`overflow` → no nested scroll, no `--bs-border-color`). Items use `form-check py-0.5` instead of `.profile-checklist-item`, keeping `.form-check`'s left padding so checkboxes sit inside the list. Scoped `<style>` block removed. |
| src/components/veevalidate/VeeForm.spec.ts | +1 test: default-slot content renders after `.row` and before the `[data-submit]` bar. |

"Fixed modal footer" was done with VeeForm's existing `sticky bottom-0` bar, not Modal's `#footer` slot. The Save button and its `meta.valid`/`submitting` state live inside VeeForm, and nothing exposes them. Moving them into Modal's footer would mean new exposed API on VeeForm and a second Close button. The sticky bar stays pinned to the bottom of the modal body's scroll area for the whole scroll (measured below).

## Command
`npm run build` · `npm run lint` · `npm run test` · `npx vitest run src/components/veevalidate/VeeForm.spec.ts` · `npm run typecheck`

## Output
- build: `✓ built in 6.26s`
- lint: `eslint src --ext .js,.ts,.vue` → exit 0
- VeeForm spec: `✓ src/components/veevalidate/VeeForm.spec.ts (21 tests)` / `Tests  21 passed (21)`
- test: `Test Files  56 passed (56)` / `Tests  364 passed (364)` (363 before the new test)
- typecheck: `grep -c "error TS"` = 81 (baseline 90); `grep -cE "PageProfile|VeeForm.vue"` = 0

## Live check (after the fix)
Dev server localhost:5173 (working tree of this branch), qa.full@example.com. Read-only: each modal was opened and closed with Esc, nothing saved. Theme switched via `data-bs-theme` on `<html>` (same attribute `useTheme.ts:28` sets). Body scrolled to the end via `scrollTop = scrollHeight`, then measured again:
| theme · width | modes | dialog bottom | name top | bar bottom (top / scrolled to end) | nested scroll | page x-overflow |
|---|---|---|---|---|---|---|
| light 1440 | create, edit, clone | 872 | 128 | 855 / 855 | 0 | no |
| dark 1440 | create, edit, clone | 872 | 128 | 855 / 855 | 0 | no |
| dark 375 | create, edit, clone | 804 | 108 | 787 / 787 | 0 | no |
| light 375 | create, edit, clone | 804 | 108 | 787 / 787 | 0 | no |
- Titles: "Thêm profile" (create, empty name), "Sửa: Tổng hợp" (edit), "Nhân bản: Tổng hợp" (clone). The name field is filled for edit and clone.
- Checkbox inside its list after the `py-0.5` fix: light 1440 cb.left 500 > box.left 487; dark 1440 same; dark 375 cb.left 38 > box.left 25 (`inside: true` for all three).
- Modal content bg: light `rgb(255, 255, 255)`, dark `rgb(17, 17, 19)`. The sticky bar bg matches in both.
- Keyboard pass (dark 375): Tab goes Đóng → name → [Chọn tất cả, Bỏ chọn, checkboxes…] ×6 sections → Hủy → Lưu → back to Đóng, so the focus trap wraps and the order matches the visual order.

Screenshots in `evidence/implementer/2026-11-06/issue-409-shots/` (gitignored by `.gitignore:27`, local only; for the PR they still have to be attached by hand). I opened each one and reviewed it:
| file | observed |
|---|---|
| before-desktop.png | No name field visible; checkboxes are thin green slivers clipped at the list's left border |
| before-mobile.png | Same, at 390px |
| after2-light-1440-edit.png / after2-dark-1440-edit.png | Name field first; full checkboxes inside bordered lists; Hủy / Lưu bar at the bottom of the dialog |
| after2-dark-375-edit.png | Same at 375px; long labels wrap inside the list, no horizontal overflow |
| after-light-1440-create.png, after-dark-1440-clone.png, after-light-375-clone.png | Create and clone layouts. **Taken before the `py-0.5` fix**, so the checkboxes there still straddle the list border. Layout and measurements are otherwise identical; the checkbox fix was re-measured in edit mode only. |

## Acceptance
| Criterion | Evidence |
|---|---|
| Identify what's hidden (desktop + mobile screenshots) | "What was hidden" table + before-desktop/mobile.png |
| Name field at the top of the modal | name top 128 (1440) / 108 (375), above every checklist, in all 12 runs |
| Save/Cancel always visible (fixed footer) | bar bottom 855 < dialog bottom 872 (1440) and 787 < 804 (375), both at scroll top and scrolled to end |
| No nested scroll; long checklists usable | `nested: 0` in all 12 runs; `max-height`/`overflow-y` removed; per-section Chọn tất cả / Bỏ chọn kept |
| Border/tokens per DESIGN.md, no `--bs-*` | `git diff -U0 -- src \| grep '^+' \| grep -nE "#[0-9a-fA-F]{3,6}\|\[[0-9.]+(rem\|px)\]\|opacity-[0-9]+\|--bs-"` → exit 1 (no match); the list uses `border-line` + `rounded-md` (DESIGN §2/§199). The only `bs-` left in PageProfile.vue is the `data-bs-dismiss` attribute, not a CSS var. |
| Edit, create, clone; light + dark | Live check table: 4 theme×width combos × 3 modes |
| DESIGN.md §10 | tokens ✓ (grep above) · one primary action (Lưu) ✓ · empty section state "Chưa có mục nào." (pre-existing, still shown) ✓ · keyboard pass ✓ · screenshots 1440 light / 1440 dark / 375 dark ✓ · lint+test+build ✓ · Vercel Web Interface Guidelines pass: **not run** (`web-design-guidelines` skill not invoked) |
| comments per code-comments.md | 1 HTML comment in VeeForm (why the slot exists and where it sits); PageProfile's comment rewritten to the 3-line why (slot position + `selectedIds` merged on submit), stale "VeeForm has no default slot" text removed |

## Supersedes
none (no other non-SEALED row cites #409)

## Still open
none

## Noticed, not done
- `size="modal-xl"` matches no CSS rule (only `.modal-lg` exists in `src/styles/tailwind.css`), so this dialog renders at the 500px default. That is close to DESIGN §5.9's 480/640px, so I left it.
- The sticky bar uses `bottom-0` inside `.modal-body`'s 1rem padding, so a line of the next section shows in the strip below the bar while scrolling (visible in after2-light-1440-edit.png). This is existing VeeForm behaviour in every modal; it doesn't hide controls.
- Modal's dirty guard covers only VeeForm fields. Unsaved checkbox changes close on Esc without a discard confirm. This was already true before the fix; out of scope.
- Shared debug browser: another session navigated tab 0 to localhost:3390 once, and the prod API returned 429 after repeated reloads. I waited for the rate limit to clear, then ran the live check.
- Uncommitted `.claude/commands/issues-ls.md` and `.claude/skills/ship/SKILL.md` came along from `staging`. They're unrelated to this task and I didn't touch them.

## Seal gate
none (no commit/push/API write)

---
## Round 2 — response to REOPEN `evidence/verifier/2026-11-06/issue-409-profile-modal-layout-reopen.md`

### 1. Vercel Web Interface Guidelines pass (DESIGN.md §10)
Ran the `web-design-guidelines` skill: rules fetched fresh from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` (191 lines), applied to `PageProfile.vue` (modal template) and `VeeForm.vue` (slot + button bar).
| file:line | rule | result |
|---|---|---|
| src/components/veevalidate/VeeForm.vue:194 (`<form>`) | Focus States: "Sticky headers/footers/overlays must not cover the focused element" | **Violation, fixed.** A live Tab pass (edit, 26 Tabs) found focused controls under the sticky bar: 1440 `Chọn tất cả`/`Bỏ chọn` bottom 870 > bar top 798; 375 checkbox bottom 755 > bar top 730. Fix: `[&_*]:scroll-mb-20` on VeeForm's `<form>`. 80px clears the bar (57px) plus `.modal-body`'s 16px bottom padding; `scroll-mb-16` (64px) still left a 9px overlap (measured: bottom 807 > 798). Fixed in VeeForm, where the sticky bar lives, so every VeeForm form gets it. |
| PageProfile.vue checklist `<label class="form-check">` | Forms: label + control share one hit target | pass — the label wraps the input |
| PageProfile.vue section header `flex … justify-between` | Content: flex children need `min-w-0` | pass — `flex-wrap`, and the short label + 2 buttons wrap instead of overflowing (no x-overflow at 375) |
| PageProfile.vue label text | Content: long content | pass — long titles wrap inside the list (after3-dark-375-clone.png) |
| PageProfile.vue `{{ n }}/{{ m }}` counts | Typography: tabular-nums | pass — `tabular-nums` already present |
| PageProfile.vue empty section | Content: empty states | pass — "Chưa có mục nào." (`profileCv.noItems`) |
| Modal.vue `.modal-body` | Touch: `overscroll-behavior: contain` in modals | not in this diff (Modal.vue untouched) → Noticed, not done |
| remaining rules (images, animation, i18n formats, hydration, navigation) | — | n/a: none of these constructs is in the changed lines |

Re-measured after the fix (same 26-Tab pass in edit mode): 1440 → `scrollMarginBottom: "80px"`, ok 24, bar 2, covered `[]`; 375 → `"80px"`, ok 24, bar 2, covered `[]`.

### 2. Create/clone re-shot on current code
Fresh tab (another session had taken over the shared debug-browser tab), qa.full@example.com, Esc to close, nothing saved:
| theme · width | mode | title | cb.left | box.left | inside |
|---|---|---|---|---|---|
| light 1440 | create | Thêm profile | 500 | 487 | true |
| light 1440 | clone | Nhân bản: Tổng hợp | 500 | 487 | true |
| dark 1440 | create | Thêm profile | 500 | 487 | true |
| dark 1440 | clone | Nhân bản: Tổng hợp | 500 | 487 | true |
| dark 375 | create | Thêm profile | 38 | 25 | true |
| dark 375 | clone | Nhân bản: Tổng hợp | 38 | 25 | true |
Screenshots: `issue-409-shots/after3-{light-1440,dark-1440,dark-375}-{create,clone}.png`. I opened after3-dark-375-clone.png: checkboxes inside the bordered lists, Hủy/Lưu at the dialog bottom. It opened scrolled, because the body kept its scroll position from the previous Tab pass (see Noticed). The round-1 `after-*-create/clone` shots are superseded by these.

### 3. Correction to round 1
Round 1 said typecheck `81, none in changed files`, but that run came **before** the new VeeForm spec was added. With the spec added, typecheck reported 82, including `VeeForm.spec.ts(68,30): error TS2488` (spreading an `HTMLCollection`). Fixed with `Array.from(...)`.

### Diff added this round
| file | change |
|---|---|
| src/components/veevalidate/VeeForm.vue | `<form class="form [&_*]:scroll-mb-20">` + 1-line why comment |
| src/components/veevalidate/VeeForm.spec.ts | `[...children]` → `Array.from(children)` (TS2488) |

### Output (final, this round)
- typecheck: `grep -c "error TS"` = 81 (baseline 90); `grep "error TS" | grep -cE "VeeForm|PageProfile"` = 0
- test: `Test Files  56 passed (56)` / `Tests  364 passed (364)`
- lint: exit 0
- build: `✓ built in 4.27s`; `scroll-mb-20` present in `dist/assets/index-D2wVMqVj.css`
- token grep (`git diff -U0 -- src | grep '^+' | grep -nE "#[0-9a-fA-F]{3,6}|\[[0-9.]+(rem|px)\]|opacity-[0-9]+|--bs-"`) → exit 1 (no match). `[&_*]` is a selector variant, not an arbitrary value.

### Acceptance delta
| Criterion | Evidence |
|---|---|
| DESIGN §10 Web Interface Guidelines pass | table in section 1; 1 violation found and fixed, 0 covered-focus after the fix |
| create/clone checkbox inside list on current code | table in section 2, 6/6 `inside: true` |
| comments per code-comments.md | +1 `<!-- -->` why-line for `scroll-mb-20` (why, not what) |

### Noticed, not done (added)
- `Modal.vue` doesn't reset `.modal-body` scroll on `show()`, so reopening a modal keeps the previous scroll position and the name field can start out of view. Same for every modal; Modal.vue is not in this diff.
- `.modal` / `.modal-body` have no `overscroll-behavior: contain` (guideline). Same for every modal; not in this diff.
