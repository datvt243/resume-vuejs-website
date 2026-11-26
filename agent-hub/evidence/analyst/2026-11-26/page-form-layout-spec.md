# Analyst spec — #538 page-form-layout

## Task (verbatim)
Page layout: stack title/description above content instead of left/right split.
"The page layout currently splits into a left column (title + description) and a right column (content/form). On iPad mini 6 (~744px CSS wide portrait, 1133 landscape) the left column wastes space, the right column is too narrow and the eye has to jump right. Switch the layout to top/bottom (header above content)."
VI: "layout page hiện tại đang chia left (title và description) right (content - form). tôi đã view trên ipad (mini 6) và thấy nó ko ổn lắm, lần left chiếm layout mà ko đc gì, right quá ít để xem và phải lia mắt qua phải. hãy xem xét và đưa layout về trên dưới"

## Doc path
`agent-hub/doctrine/features/page-form-layout.md` (new, Status: draft; INDEX row added)

## Sources read
doctrine/domains/PROJECT.md, doctrine/MEMORY.md, doctrine/features/INDEX.md, DESIGN.md §4–4.4,
src/components/global/FormSection.vue, src/pages/_layouts/LayoutDefault.vue (sidebar/width lines),
tailwind.config.cjs (no custom screens → lg = 1024px), src/routers/index.ts (routes), grep of every `<FormSection` user and spec.

## Code map
- `src/components/global/FormSection.vue:1-29` — the whole split: `section.grid.lg:grid-cols-3` (l.20), header div (l.21-25), content `lg:col-span-2` (l.26). The only file that needs a code change.
- `DESIGN.md:269-273` — §4.3 template text prescribing `grid lg:grid-cols-3`; update to stacked.
- `src/pages/_layouts/LayoutDefault.vue:105,148,152` — sidebar `w-60` shown from `lg`, content `lg:pl-60`, `max-w-6xl` (why 1133px leaves ~580px for the form).
- Users (no change needed): `src/pages/dashboard/PageInformation.vue`, `PageAccountSettings.vue`, `PageGeneralInformation.vue`, `PageSalaryCalculator.vue`, `src/components/PickedSkills.vue:53` (actions slot), `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue:167` (actions slot) → used by PageSkills, PageLanguages. All wrap in `max-w-4xl`.
- Specs mounting real FormSection: `PickedSkills.spec.ts`, `VeeFormGeneralInformationUpdate.spec.ts`; none assert grid/col-span classes (grep `grid-cols|col-span` in *.spec.ts → none).
- Not in scope: `src/pages/home/PageHome.vue:129-130` (dashboard cards grid, §4.1).

## Questions + answers
None blocking. Defaults documented in the doc: stack at all widths; actions stay below description.

## Isolation proof
Fresh analyst subagent; got only the issue text + operator VI original from the spawner, no implementer reasoning or diff. Branch feature/issue-538-page-layout-stack @ da06aa4, no code edited.

## Outcome
spec_ready
