# Analyst spec — #440 CV layout: show skills and foreign languages

## Task (verbatim)
Title: CV layout: show skills and foreign languages (Preview + public resume)
## Problem
Main skills, familiar skills, professional/personal skills and foreign languages are edited in `/dashboard/skills` and `/dashboard/languages`, but `src/components/cv/CvResumeLayout.vue` (Preview and `/resume/:slug`) renders none of them. Languages are also not counted in profile completion (`src/composables/useProfileCompletion.ts`).
## Expected
- `CvResumeLayout` shows a Skills section (main skills first, then familiar / grouped professional skills, personal skills) and a Languages section (language + translated level), in every theme, vi + en.
- Languages count in profile completion.
- Check the backend PDF/DOCX export (datvt243/resume-nodejs-api) shows the same sections; open a backend issue if not.
Decided by the operator while confirming agent-hub/doctrine/features/cv-skills.md (2026-11-07).

## Outcome
Pass 1: `needs_input` — 6 open questions (cv-preview-export.md Q11–15, home-overview.md Q5).
Pass 2 (same day, operator answers): `spec_ready`. #441 confirmed shipped (v1.45.0, PR #507) and closed by the coordinator — out of this run.

## Docs written (all draft)
- `doctrine/features/cv-preview-export.md` — Behavior 18–22, acceptance, edge cases, out of scope, Q11–15, changelog (main spec for the shared layout)
- `doctrine/features/home-overview.md` — Behavior #4 addendum (Languages section in completion), acceptance, edge case, Q5
- `doctrine/features/public-resume.md` — pointer in Behavior #5
- `doctrine/features/cv-skills.md`, `cv-languages.md` — Out of scope notes point to the new spec (cv-languages Behavior #6 / #441 untouched)
- `doctrine/features/INDEX.md` — cv-preview-export status cell

## Sources read
- agent-hub: haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}, doctrine/domains/PROJECT.md (Invariants, Decisions), doctrine/MEMORY.md (commands), doctrine/features/{INDEX,cv-skills,cv-languages,cv-preview-export,public-resume,home-overview,cv-profiles}.md
- frontend: src/components/cv/CvResumeLayout.vue (+ .spec.ts test names), src/composables/useProfileCompletion.ts (+ .spec.ts), src/pages/dashboard/{PagePreview,PageSkills,PageLanguages}.vue, src/pages/public/PagePublicResume.vue, src/utilities/index.ts (`groupSkills`), src/utilities/jsonResume.ts (no skills/languages), src/i18n/index.ts (`option.languageLevel.*`, `generalInfo.*` skill labels, `nav.languages`)
- backend (read-only, ../resume-nodejs-api @ staging 28e61e5): src/services/createPDF.ts (section order 118–127, renderSkills, renderForeignLanguages), src/services/createPDF.ats.ts (skills + buildLanguagesSection), src/services/createDocx.ts (skills 99–103, languages 163–167), src/candidate_me/index.ts (public payload spreads generalInformation)

## Resolved from code/docs (not asked)
- Per-theme placement: themes are CSS-only variants of one markup → one placement serves all.
- Data source: Preview already passes the whole general-information doc; public API returns it whole → no request change.
- Labels: the layout's own `LABELS` vi/en table (CLAUDE.md), level text via `i18n.global.t(..., { locale: props.lang })` like `optionLabel`; legacy level shown as stored (cv-languages Behavior #2).
- Grouping: reuse `groupSkills`. Profiles don't filter skills/languages (cv-profiles Out of scope).

## Questions (pass 1)
1. cv-preview-export Q11 — placement of the two sections in the layout order.
2. Q12 — professional block: years shown? main/familiar repeated in groups? list vs chips?
3. Q13 — language line format.
4. Q14 — backend export check: findings (no main/familiar skills in any export; raw level; hard-coded vi labels in classic PDF + DOCX); who opens the backend issue and what it covers.
5. Q15 — Export JSON skills/languages in scope?
6. home-overview Q5 — does Skills count in completion too (conflict: issue says Languages; 2026-11-07 answer said "count both"); if yes, what makes it complete.

## Isolation proof
Spawned as a separate analyst subagent with only the task text + doc pointers from the main session; no implementer plan, diff or reasoning was given. All anchors above grep-confirmed in this spawn.

## Answers (operator 2026-11-24, relayed by the coordinator)
- Q11: Option A — Skills right after General information; Languages right before References.
- Q12a: names only, no years. Q12b: skills picked as main/familiar left out of the professional groups; a group left empty is hidden. Q12c: plain comma list per row ("Kỹ năng chính: Vue, TypeScript", "Frontend: React, Tailwind", "Kỹ năng cá nhân: Teamwork"), same in every theme.
- Q13: "English (Advanced)", level in the CV language; legacy free text as stored.
- Q14: implementer opens ONE backend issue covering all 3 gaps with file/line refs; no backend code change; acceptance criterion.
- Q15: out of scope; implementer opens a frontend follow-up issue for JSON Resume skills/languages.
- home-overview Q5: both count, 10 sections; Skills complete with ≥1 main/familiar/professional/personal skill; Languages with ≥1 foreign language.

## Pass 2 resolved without asking
- Ungrouped professional skills row label: `Kỹ năng chuyên môn` / `Professional skills` — the backend classic PDF's label for ungrouped/flat skills (`createPDF.ts` `renderSkills`), reads naturally on a CV.
- "Already picked" match = exact name match against `mainSkills`/`familiarSkills` (both are stored as `{ name }`).
- Completion order: Skills and Languages placed after General information, matching the sidebar (`src/pages/_layouts/LayoutDefault.vue` lines 67–80); side effect written as an edge case (first-missing link moves to `/dashboard/skills`).
