# Analyst spec — #402 Project read-only View modal

## Task (verbatim)
Title: Project: bổ sung chế độ View (xem chi tiết read-only)
Body: Trang Project chưa có chế độ xem chi tiết (read-only). Card ProjectItem chỉ có edit / duplicate / delete. Bổ sung tính năng View giống Experience.
Context: src/components/project/ProjectItem.vue:63 — ItemActions chưa truyền viewable, nên không có nút view. Experience đã có mẫu: ItemActions viewable → @on-view → modal view read-only + nút Edit (src/pages/dashboard/PageExperience.vue).
Acceptance criteria:
- Card Project có nút view (ItemActions viewable, action="view").
- Bấm view mở modal read-only hiển thị đủ field của project (tên, thời gian, mô tả HTML đã sanitize, …).
- Modal có nút Edit (Button action="update") chuyển sang form edit.
- Có toggle VI | EN cho field localized (cùng hướng với #400, dùng chung state lang #399).
- Text/aria-label qua i18n (vi + en); theo DESIGN.md.

## Doc
`doctrine/features/cv-timeline-sections.md` (existing feature, updated): Behavior #9 (draft), AC (#402 rows), edge cases, out of scope, changelog row; anchor `src/components/global/ItemActions.vue` added. INDEX row already lists #402 — unchanged.

## Sources read
- agent-hub/haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}
- agent-hub/doctrine/domains/PROJECT.md, doctrine/MEMORY.md (test commands), doctrine/features/INDEX.md, cv-timeline-sections.md
- evidence/analyst/2026-11-19/experience-view-lang-toggle-spec.md (#400 precedent)
- src/components/project/ProjectItem.vue (ItemActions without `viewable`, emits onEdit/onDelete/onDuplicate)
- src/pages/dashboard/PageProject.vue (edit/duplicate flow, `localizedToForm` for description, technology join)
- src/pages/dashboard/PageExperience.vue lines 146-168, 256-291 (view modal, toggle, Edit footer) — implemented in 6b40a14
- src/components/experience/ExperienceItem.vue:53, src/components/global/ItemActions.vue:23-31 (view button, aria-label `common.view`)
- src/models/project.model.ts (only `description` localized; link label is literal 'Link'), src/types/model.type.ts:111 (link yup `.url()`)
- src/utilities/index.ts:115 (`sanitizeHtml` = DOMPurify), src/i18n/index.ts (`form.contentLang`, `field.projectName`, `field.technology` exist; no `field.link`)
- src/components/cv/CvResumeLayout.vue:170 (CV shows link as text), PageApplication.vue:169 (precedent: URL rendered as `<a target="_blank" rel="noopener">`)
- src/pages/dashboard/PageProject.spec.ts (existing harness)

## Decisions taken from precedent (not invented)
- Modal title = project name (Experience uses its main title field).
- Link rendered as clickable new-tab link with rel="noopener" (PageApplication jobLink precedent; value is yup-validated URL). Missing values → "—" (Experience break-type precedent).
- Only `description` follows the content toggle (only localized field; same as #400 answer Q7).

## Questions + answers
None open — issue + Experience reference + #400 answers decide every Behavior item. Outcome: spec_ready.

## Notes for implementer
- A `field.link` i18n key (vi + en) is needed for the view's link label — none exists today.
- Behavior #8 (#400) still reads "not yet implemented/sealed" though 6b40a14 shipped it; the analyst does not change seal status.

## Isolation proof
Spawned as a blank-context analyst subagent; received only the issue text, branch name and pointers to the reference files. No implementer reasoning or diff seen; branch feature/project-modal-view was clean.
