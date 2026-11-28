# Home overview

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/home-overview-spec.md`; Behavior #4 (#440, 10 sections) verified by `evidence/verifier/2026-11-24/issue-440-cv-skills-languages-seal.md`
- Last verified: 41ea24e
- Source: backfill from code
- Issues: #59, #403, #440, #455
- Anchors: `src/pages/home/PageHome.vue`, `src/composables/useProfileCompletion.ts`, `src/composables/useVisitStats.ts`, `src/composables/useVisits.ts`, `src/components/visits/VisitChart.vue`

## Goal
After signing in, the candidate sees at a glance how complete their CV is, how often it was viewed, and can download it.

## Behavior
1. Route `/` (signed in only). Four blocks top to bottom: profile strip, KPI row, visits chart + completion checklist, CV card.
2. Profile strip: avatar image if `avatar` is set, else initials (first letters of first + last name, uppercase, `U` if none); full name or the "no name" text; desired position or the "no position" text; a badge "Open to work" (green) or "Not looking" (grey) from `openToWork`; an "Update profile" link to `/dashboard/information`.
   *(#403 — draft)* Under the desired position, the desired salary range from General information, formatted as in `general-information.md` Behavior #5g; no line when neither end is set.
3. KPI row, three cards, each a link:
   - Views: the cached visit count (`—` if the visit load failed) → `/dashboard/visits`.
   - Completion: `<percent>%`, hint "<done>/<total>" → the first missing section, else `/dashboard/information`.
   - Applications: number of job applications → `/dashboard/application`.
   Numbers are formatted with the `vi-VN` locale.
4. Completion = 8 sections, 1 point each, rounded percent: Information and General information are complete when every required model field has a value; Education, Experience, Project, Award, Certificate, Reference are complete when they have at least one entry. Missing sections are listed as links; when none are missing, the "profile complete" text shows.
   *(#440 — draft)* Completion becomes **10 sections**: add **Skills** (`nav.skills` → `/dashboard/skills`) and **Languages** (`nav.languages` → `/dashboard/languages`) as list-style sections, placed right after General information in the sidebar order (Information, General information, Skills, Languages, Education, Experience, Project, Award, Certificate, Reference) — so they also come in that order in the missing list and as the KPI's "first missing" link. Skills is complete when `candidateStore.getGeneralInformation` has at least one entry in any of `mainSkills`, `familiarSkills`, `professionalSkills`, `personalSkills`; Languages when `foreignLanguages` has at least one entry. Both read the store like the General information section — no new request. Percent and the "<done>/<total>" hint use 10.
5. Visits chart: views for the last 30 days by day (from `GET api/v1/candidate/visits/stats` with `interval=day`, `from`, the browser time zone), with the total and a "View details" link to `/dashboard/visits`. While loading: a grey pulsing box. On failure: an error block with "Retry", which reloads whichever source failed.
6. CV card: the CV file name (see `cv-preview-export.md`), an "auto-generated" note, a template switch Classic / ATS (default Classic), a disabled "Attach file" button marked "coming soon", and a "Download CV" button that downloads with the chosen template and the current CV language. The button shows a spinner and is disabled while downloading. Header link "Check ATS" → `/dashboard/ats-check`.

## Acceptance criteria
- `npx vitest run src/composables/useProfileCompletion.spec.ts` passes.
- `npx vitest run src/composables/useVisitStats.spec.ts` passes.
- With only Information complete and no list entries, the completion KPI shows `13%` (1/8) and the list shows 7 links. *(#440: becomes `10%` (1/10) and 9 links.)*
- (#440) `npx vitest run src/composables/useProfileCompletion.spec.ts` covers: 10 sections, labels in the order above; empty store → 0% and 10 missing; `nav.skills` incomplete with all four skill lists empty/missing and complete with only `personalSkills: [{ name: 'Teamwork' }]` (and likewise with only one of `mainSkills`/`familiarSkills`/`professionalSkills`); `nav.languages` incomplete with `foreignLanguages: []`/missing and complete with `[{ language: 'English', level: 'basic' }]`; `to` values `/dashboard/skills` and `/dashboard/languages`; 100% only with all 10 complete; 2/10 complete = `20%`; 1/10 = `10%`.
- When the visits stats request fails, the chart area shows the error block with a Retry button, not `0` views.

## Edge cases
- No first/last name → "no name" text, initials `U`.
- Visit count load failed → Views KPI shows `—`.
- All 8 sections complete → "profile complete" text, Completion KPI links to `/dashboard/information`. *(#440: all 10.)*
- (#440) General information never saved (no document) → Skills and Languages both count as missing, no error.
- (#440) Only `professionalSkillsGroup` tags, no skills → Skills missing.
- (#440) Information + General information complete, nothing else → the Completion KPI links to `/dashboard/skills` (first missing), not `/dashboard/education` as before.

## Out of scope
- Attaching an uploaded CV file (button is a "coming soon" placeholder).
- Full visit analytics (see `cv-visits.md`).

## Open questions
1. Completion counts 8 sections; Skills and Languages are not counted. Intended? → **Answer (operator 2026-11-07):** Change: count both — #440
2. KPI and chart numbers always use `vi-VN` formatting, even when the app language is English. Intended? → **Answer (operator 2026-11-07):** Bug — #455
3. The code notes "backend has no avatar field yet" — the avatar here only appears once the backend sends `avatar`. Is that still the state? (Information page's avatar block is "coming soon".) → **Answer (operator 2026-11-07):** Intended (still "coming soon")
4. The Classic/ATS template choice resets to Classic on every visit and is not shared with the header's Download button (which uses no template). Intended? → **Answer (operator 2026-11-07):** Intended

5. (#440) The issue body says "Languages count in profile completion", but open question 1 above was answered "count both" (Skills and Languages), and `cv-skills.md` lists "Counting skills in profile completion" as out of scope. Should Skills count too? If yes, "complete" means: at least one professional skill, or at least one of main/familiar/professional/personal? → **Answer (operator 2026-11-24):** Both count — Skills and Languages are sections (10 total). Skills complete with at least one main, familiar, professional or personal skill; Languages complete with at least one foreign language.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/home-overview-spec.md` | - |
| 2026-11-21 | Behavior #2 (draft): salary range line in the profile strip (spec in general-information.md #5) | #403 | - |
| 2026-11-24 | Behavior #4 (draft): Languages counted in completion; Q5 open (Skills too?) | #440, see `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` | - |
| 2026-11-24 | Operator answered Q5: Skills + Languages both count (10 sections); Behavior #4 and criteria updated; still draft until SEAL | #440, see `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` | - |
