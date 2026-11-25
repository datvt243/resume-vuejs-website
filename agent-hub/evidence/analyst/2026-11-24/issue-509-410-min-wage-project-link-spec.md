# Analyst — issue #509 + #410 spec (branch feature/issue-509-410-min-wage-project-link)

## Task (verbatim, from the spawning session)
### #509 — Salary calculator: update regional minimum wages for 01/01/2027 (Nghị định 399/2026)
Problem: The Gross ↔ Net calculator (#404) ships with the 2026 regional minimum wages (region I 5,310,000, Nghị định 293/2025), which set the BHTN cap (20 × regional minimum wage).
Expected: From 01/01/2027, Nghị định 399/2026 raises the regional minimum wages (region I → 5,700,000). Update the constants in the calculator's single law-constants block, plus its vitest spec values. Re-check the base salary and family deduction amounts at the same time. Follow-up of #404.

### #410 — fix(project): make Project form's Link field optional
Context: src/models/project.model.ts uses defaultLink({ name: 'link', label: 'Link' }). defaultLink (src/types/model.type.ts) adds .required(_mesRequired); currently only project uses it (certificate is commented out).
Proposal: make project `link` optional — add an option (e.g. required?: boolean) to defaultLink or declare it in the project model. Keep url() + max(100) validation when filled.
Acceptance: [ ] Saving a project with empty Link → no error, sent to API. [ ] Invalid URL / >100 chars → still errors. [ ] Test for the model.
Backend dependency datvt243/resume-nodejs-api#364 is CLOSED (landed).

## Outcome
Pass 1: needs_input (#509 Q4–Q5). Pass 2 (operator answers relayed by coordinator, 2026-11-24): spec_ready for #509 and #410.

## Docs written
- doctrine/features/salary-calculator.md — Behavior 10 (draft), values table row, #509 acceptance, Q4–Q5, changelog
- doctrine/features/cv-timeline-sections.md — Behavior #7 (link optional), #410 acceptance + edge case, changelog
- doctrine/features/INDEX.md — #509 / #410 added to the rows

## Sources read
- haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}
- doctrine/MEMORY.md (test commands), doctrine/features/INDEX.md, salary-calculator.md, cv-timeline-sections.md
- src/utilities/salaryVn.ts (SALARY_VN block, sources comment already names #509), src/utilities/salaryVn.spec.ts
- src/types/model.type.ts:111 (defaultLink — only live caller src/models/project.model.ts:66; certificate.model.ts:31 commented out), src/models/project.model.spec.ts, src/pages/dashboard/PageProject.vue:294-297, src/components/cv/CvResumeLayout.vue:170, src/utilities/jsonResume.ts:97
- yup check (node): `string().trim().url().max(100)` → '' ok, '  ' ok, 'abc' url error, 101+ chars max error — so dropping `.required` is enough; url() skips empty strings.
- Web (press, not the decree text): NĐ 399/2026/NĐ-CP effective 01/01/2027, replaces 293/2025; I 5,700,000 · II 5,080,000 · III 4,450,000 · IV 4,040,000 ("mức thấp nhất 4,04 triệu") — matches the operator-supplied row recorded in salary-calculator.md on 2026-11-23. Sources: vietnamplus.vn post1145853, vov.vn post1346877, hcc.nghean.gov.vn 2829. No source found for a 2027 change to base salary or family deduction.

## Computed acceptance numbers (region I, 2027 wages, base 2,530,000, deductions unchanged)
gross 150,000,000, 2 dependents: insurance 4,807,000 + 1,140,000 = 5,947,000; taxable 116,153,000; PIT 500,000 + 2,000,000 + 6,000,000 + 12,000,000 + 5,653,550 = 26,153,550; net 117,899,450. Region IV gross 90,000,000 → BHTN 808,000.

## Questions + answers
4. When do the 2027 values reach users? Ship now with effectiveFrom 01/01/2027 (early for December 2026), implement now but release on/after 01/01/2027, or keep both sets and pick by date?
   → Operator 2026-11-24: (a) ship now, effectiveFrom '01/01/2027' ("values as of 01/01/2027"), accept a month of early values.
5. Confirm base salary 2,530,000 and family deduction 15,500,000 / 6,200,000 stay unchanged on 01/01/2027, or give the new amount + legal source.
   → Operator 2026-11-24: unchanged — base salary 2,530,000 (Nghị định 161/2026), self 15,500,000 / dependent 6,200,000 (Nghị quyết 110/2025).

## Isolation proof
Spawned as a separate analyst subagent with only the task text above; no implementer reasoning or diff seen. Main session had not run the yup check or the web cross-check.
