# 2026-11-24 - issue-442-406-cv-section-order (analyst spec)

- Worker: analyst · Recipe: spec_feature (SPEC mode)
- Branch: feature/issue-442-406-cv-section-order (no code touched, nothing committed)
- Outcome: needs_input (Q14–18)

## Task (verbatim)
#442 feat(cv): lưu thứ tự kéo thả Education / Project lên backend; Experience luôn sort theo thời gian — Drag-and-drop order is saved only in localStorage['cv-manual-order:<collection>:<candidateId>'], so Preview / public page / PDF and other devices ignore it. Expected: Education and Project drag-and-drop saves through the backend reorder endpoint (resume-nodejs-api#413); Preview and the CV use the stored order. Experience: no manual order — always sorted by date (newest first); remove drag-and-drop there. Drop the localStorage order once the backend order is used.

#406 feat(cv): sort project trong CV/PDF theo loại company → personal — Backend added Project type 'company' | 'personal' + experienceId (resume-nodejs-api#361). CvResumeLayout.vue renders data.projects in API order (no sort), while experiences are sorted startDate desc. Proposal: company first, personal after; within each group startDate desc. Project without type → personal. Optional group headings (i18n vi/en). If the user already has a manual drag order → keep it, default sort only when none. AC: CV preview/PDF company before personal, newest first per group; no-type → personal; test for the sort function.

## Doc path
- `doctrine/features/cv-timeline-sections.md` — Behavior #12 (#442), #13 (#406), #4 marked superseded, new AC / edge cases / out-of-scope lines, Q14–18, changelog row.
- `doctrine/features/INDEX.md` — row issues + #406, resume-nodejs-api#361.
- `doctrine/features/public-resume.md` — changelog pointer row only.

## Sources read
- Hub: `haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}`, `doctrine/domains/PROJECT.md`, `doctrine/MEMORY.md`, `doctrine/features/{INDEX,cv-timeline-sections,public-resume}.md`
- Issues: vuejs #442, #406; nodejs-api #413 (no comments), PR #466 diff (`src/services/index.ts` `byManualOrder`/`baseReorderDocuments`/`baseFindDocument`, `BaseController.ts` `baseReorder`, `candidate_me/index.ts`, validators) plus current `main` of `src/services/index.ts` (`baseUpdateDocument` returns `getDocumentUpdated(_id, select: fields sent)` → no `order` in update response) and `src/candidate_me/index.ts` (public sections keep `order`, `type`; `_id: 0`)
- Frontend: `src/composables/useManualOrder.ts`, `src/composables/useCandidate.ts` (`sortData` date-sorts every list — would override backend order), `src/composables/useDocument.ts`, `src/pages/dashboard/Page{Project,Education,Experience,Preview}.vue`, `src/pages/public/PagePublicResume.vue`, `src/components/cv/CvResumeLayout.vue` (line 78 experience sort; projects/educations unsorted), `src/composables/useDownloadCv.ts` (server PDF), `src/services/base.ts` (`toastError`), `src/i18n/index.ts` (`common.dragToSort`)

## Key findings
- Combining #442 + #406 needs no "has manual order?" detection: one comparator `order asc (missing last) → type company-first → startDate desc` gives the type default when nothing is ordered, the user's order once they drag (reorder sets every entry), and puts later-created entries last — matching the backend's own rule except the type step.
- `useCandidate.sortData` must stop date-sorting educations/projects, or the backend order is lost on dashboard + Preview.
- Update response lacks `order` → the store must keep the existing `order` on replace, else an edited entry jumps to the end.
- Server Download CV / ATS have no type step (Q17).

## Questions + answers
14. Group headings? → recommended: no.
15. Success toast on each drop? → recommended: no, errors only.
16. Old localStorage orders: discard vs migrate? → recommended: discard.
17. Server Download CV lacks type step: accept / backend issue / frontend writes default? → recommended: backend issue.
18. Failed reorder: revert vs keep? → recommended: revert.
(No operator answers yet.)

## Isolation proof
Fresh analyst spawn given only the task text (two issue summaries + pointers to backend issues/PR and code paths). No implementer reasoning, diff or diagram node seen; no implementation for #442/#406 exists on this branch. All anchors above read/grep-confirmed in this spawn.

## Round 2 (2026-11-24)
Operator answers relayed by the coordinator: Q14 no group headings; Q15 errors only, no success toast; Q16 discard legacy localStorage, no migration (key removal fine); Q17 (b) backend follow-up datvt243/resume-nodejs-api#502, frontend ships now, Download CV / ATS gap accepted; Q18 revert + error toast. Folded into Behavior #12/#13, AC (no-toast + no-heading checks), Out of scope, Q14–18 closed, changelog row. No open questions remain. Outcome: spec_ready. Doc stays draft-marked until its node is SEALED.
