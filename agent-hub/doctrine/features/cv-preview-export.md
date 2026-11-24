# CV preview, theme, language and export (incl. Download CV)

- Status: verified (Behavior 1–9) — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-preview-export-spec.md`; Behavior 10–17 (#408, #452) verified by `evidence/verifier/2026-11-23/issue-408-452-download-overlay-menu-seal.md`; Behavior 18–23 (#440) verified by `evidence/verifier/2026-11-24/issue-440-cv-skills-languages-seal.md`
- Source: backfill from code
- Issues: #55, #116, #119, #182, #408, #421, #440, #448, #451, #452
- Anchors: `src/pages/dashboard/PagePreview.vue`, `src/components/cv/CvResumeLayout.vue`, `src/composables/useCvTheme.ts`, `src/composables/useCvLang.ts`, `src/composables/useActiveProfile.ts`, `src/composables/useDownloadCv.ts`, `src/utilities/jsonResume.ts`, `src/pages/_layouts/Header.vue`, `src/pages/home/PageHome.vue`, `src/pages/dashboard/PageAtsCheck.vue`, `src/routers/index.ts`, `src/lib/swal.lib.js`

## Goal
The candidate sees their CV exactly as others will, picks how it looks and which language it is in, and gets it as a PDF or JSON file.

## Behavior
1. `/dashboard/preview` loads Information, General information, Education, Experience, Project, Award, Certificate, Reference and CV profiles (cached per session) and renders them with the shared `CvResumeLayout` (same layout as the public link).
2. Controls (hidden when printing):
   - Theme: Classic / Modern / Compact. Stored in `localStorage.cvTheme`; an unknown stored value falls back to `classic`.
   - CV language: Tiếng Việt / English. Stored in `localStorage.cvLang`; anything but `en` means `vi`. One shared value for the whole app (header, Home, Preview, ATS, Account settings).
   - CV profile (shown only if profiles exist): "All profiles" or one profile. Stored in `localStorage.cvActiveProfileId`. With a profile chosen, each list section shows only that profile's selected entries (filtered in the browser). An id that no longer exists means no filter.
3. The layout shows the localized half (`vi`/`en`) of each bilingual field and its fixed labels in the chosen CV language. The email shown is the signed-in user's email.
4. "Export PDF" opens the browser print dialog (`window.print()`). While this page is open, printing hides the header, footer, sidebar and controls; leaving the page removes that print mode.
5. "Export JSON" downloads `<computed CV file name>_VI|_EN.json` (#8 name with `.json`, suffix per #7) in JSON Resume format, built from the same filtered data, the chosen CV language and the social links.
6. "Download CV" (header button on wider screens, and the Home CV card) downloads the server-rendered PDF: `GET api/v1/download-pdf` with the Bearer token, `template=ats` only when ATS is chosen (the Home CV card and the ATS check page offer that choice; the header button always uses Classic), `lang=en` only when the CV language is English. A second click while downloading is ignored; the button shows a spinner.
7. Downloaded file name: the server's `Content-Disposition` name if present, else the computed CV file name; then `_VI` or `_EN` is added before the extension unless the name already ends with `_vi`/`_en` (any case).
8. Computed CV file name: the custom name from Account settings + `.pdf` if set (trimmed), else `<firstName>_<lastName>.pdf` with spaces turned into `_`, else `CV.pdf`.
9. Download failure → red toast "could not download CV".

### Download state, overlay and leave guard (#408, #452 — draft)
10. One download state for the whole app. Every "Download CV" entry point — header button, account-menu item (#17), Home CV card, ATS check page — starts the same flow and shows the same overlay. While a download runs, all of them are disabled with a spinner and any new start is ignored (replaces the per-button rule in #6).
11. While downloading, a full-page overlay covers the app (the page behind is not clickable or focusable): `role="dialog"`, `aria-modal="true"`, a title, a status line with `aria-live="polite"`, and a **Cancel** button that has focus as soon as the overlay opens. Status text: "Generating PDF…" from the start until the first bytes of the file arrive, then "Downloading…". Esc = Cancel (DESIGN.md §Modal: Esc closes). DESIGN.md gets this overlay as a second allowed blocking overlay next to the cold-start one (answer Q7) — the DESIGN.md edit ships with the code change.
12. Cancel (button or Esc) aborts the request (`AbortController`): no file is saved, even if the response arrives right after; the overlay closes; no toast (answer Q10).
13. In-app route change while downloading (browser Back/Forward, `router.push` from code) → a Swal warning confirm in the style of `confirmDiscardChanges`: stay / leave. Leave → the download is aborted (as #12) and the navigation happens. Stay → the navigation is cancelled, the URL stays, the download and overlay continue. No download running → no prompt, navigation unchanged.
14. Reload or close the tab while downloading → the browser's own "leave site?" warning (`beforeunload`; the browser sets the text). The listener exists only while downloading: it is removed on success, error and cancel.
15. Success → the file is saved as in #7, the overlay closes; no toast — the browser's download UI is the feedback (answer Q8).
16. Failure (network, server error, the 90s axios timeout) → the overlay closes and the red toast from #9 shows; the leave guard and `beforeunload` are gone.
17. Account menu (header user dropdown) gets a "Download CV" item (`header.downloadCv`), shown only below the `sm` breakpoint, where the header button is hidden (answer Q9); from `sm` up the header button is the only header entry. It runs the same flow as the header button: Classic template, current CV language.

### Skills and Languages on the CV layout (#440 — draft, operator answered Q11–15 on 2026-11-24)
18. `CvResumeLayout.vue` (one markup for every theme — Classic / Modern / Compact are CSS-only variants, so the new sections use the existing `.cv-section` / `.cv-section-title` styling with no per-theme markup) gets two new sections, both read from `data.generalInformation` (no new request: Preview already passes the whole general-information document; the public API `GET api/me/<slug>` returns it whole too — backend `src/candidate_me/index.ts` spreads it and only localizes `career`/`careerGoal`). Placement (Q11, mirrors the backend classic PDF): **Skills right after General information** (before Education); **Languages right before References** (after Certificates). New order: header → General information → Skills → Education → Experience → Projects → Awards → Certificates → Languages → References.
19. **Skills** section, title `Kỹ năng` / `Skills`. All labels are new keys in the component's own `LABELS` `vi`/`en` table, not `src/i18n` (CLAUDE.md "Not i18n: CvResumeLayout's own lang-prop labels"). Content is plain text rows `<label>: <name>, <name>, …` (names only, no years, comma + space separated, stored order; same in every theme — Q12a, Q12c). Rows in this order, each hidden when it has no names:
    1. `Kỹ năng chính` / `Main skills`: `mainSkills[].name`.
    2. `Kỹ năng quen thuộc` / `Familiar skills`: `familiarSkills[].name`.
    3. One row per professional skill group: label = group name, names = that group's `professionalSkills`, grouped with the existing `groupSkills(professionalSkills, professionalSkillsGroup)` from `src/utilities/index.ts` (groups in `professionalSkillsGroup` order; a `group` value not in that list comes after, under its own name). Skills without a group form a last row labelled `Kỹ năng chuyên môn` / `Professional skills` (the backend PDF's label for ungrouped/flat skills, `createPDF.ts` `renderSkills`). **Any professional skill whose name is also in `mainSkills` or `familiarSkills` is left out** (exact name match); a group left with no names is hidden (Q12b).
    4. `Kỹ năng cá nhân` / `Personal skills`: `personalSkills[].name`.
    The whole section is hidden when no row has a name (e.g. all lists empty/missing, as every other empty section).
    Example (vi): `Kỹ năng chính: Vue, TypeScript` · `Frontend: React, Tailwind` · `Kỹ năng cá nhân: Teamwork`.
20. **Languages** section, title `Ngoại ngữ` / `Languages`: one entry per `foreignLanguages` item, stored order, as `<language> (<level>)`, e.g. `English (Advanced)` (Q13). A known level (`basic`, `intermediate`, `advanced`, `expert`) is translated into the **CV language** (`lang` prop), not the UI language — as `optionLabel` already does (`i18n.global.t('option.languageLevel.<level>', {}, { locale: props.lang })`); vi: `Cơ bản` / `Trung bình` / `Khá` / `Giỏi`. An unknown legacy free-text level (e.g. `fluent`) is shown as stored (`cv-languages.md` Behavior #2). An empty level → the language alone, no `()`. Hidden when the list is empty or missing.
21. Skills and Languages are not filtered by the CV profile (`cv-profiles.md` Out of scope: they are not part of a profile) — the same content shows with "All profiles", any profile, and on `?profile=` public links.
22. Print ("Export PDF") shows both sections as rendered on screen.
23. Follow-up issues (Q14, Q15), opened by the implementer as part of this task, no backend code change: (a) ONE issue on `datvt243/resume-nodejs-api` covering all three export gaps with file/line refs — `mainSkills`/`familiarSkills` missing from the classic PDF, ATS PDF and DOCX; raw stored language level printed (`createPDF.ts` `renderForeignLanguages`, `createPDF.ats.ts` `buildLanguagesSection`, `createDocx.ts` ~163–167); classic PDF and DOCX section labels hard-coded Vietnamese for `lang=en` (`createPDF.ts` `renderSkills`/`renderForeignLanguages`, `createDocx.ts` ~99–103, ~163–167); (b) one frontend issue on `datvt243/resume-vuejs-website` for adding `skills`/`languages` to the JSON Resume export (`src/utilities/jsonResume.ts`). Both linked from #440.
## Acceptance criteria
- `npx vitest run src/pages/dashboard/PagePreview.spec.ts` passes.
- `npx vitest run src/composables/useDownloadCv.spec.ts` passes (`withLangSuffix`, file name, params).
- `npx vitest run src/composables/useCvTheme.spec.ts src/composables/useCvLang.spec.ts src/composables/useActiveProfile.spec.ts` passes.
- `npx vitest run src/utilities/jsonResume.spec.ts` passes.
- Choosing "Modern" then reloading `#/dashboard/preview` keeps Modern selected.
- With CV language English and name "Nguyen Van A" with no custom name and no server name, the file saves as `Nguyen_Van_A_EN.pdf`.
- (#408) `npx vitest run src/composables/useDownloadCv.spec.ts` also covers: success (state goes generating → downloading on the first `onDownloadProgress` → idle, one file clicked); failure (danger toast, idle, no file); success calls no toast; cancel (the `signal` passed to `instanceAxios.get` is aborted, no file even when the mocked response resolves after, no toast at all); two `useDownloadCv()` instances see the same `isDownloading`; a `beforeunload` event dispatched during a download has `defaultPrevented === true`, and after success/error/cancel it does not.
- (#408) Live: start a download on Home → `[role="dialog"][aria-modal="true"]` is in the DOM, `document.activeElement` is its Cancel button, the status element has `aria-live="polite"`; the same overlay appears when started from the header and from `#/dashboard/ats-check`.
- (#408) Live: during a download press browser Back → Swal confirm; Stay → URL unchanged, overlay still up; Leave → route changes, the `download-pdf` request shows as canceled in DevTools Network, no file saved, no toast. With no download running, Back shows no prompt.
- (#408) Live: Cancel → overlay gone, request canceled, no file in the downloads list, no toast. Success → overlay gone, file saved, no toast.
- (#452) Live at 375px width: open the account menu → "Download CV" item; clicking it sends `GET api/v1/download-pdf` with no `template` param and shows the overlay. At 640px width and up the account menu has no "Download CV" item (the header button shows instead).
- (#440) `npx vitest run src/components/cv/CvResumeLayout.spec.ts` covers, with `generalInformation = { mainSkills: [{name:'Vue'}], familiarSkills: [{name:'Go'}], professionalSkillsGroup: ['Frontend','Backend'], professionalSkills: [{name:'Vue',exp:3,group:'Frontend'},{name:'React',exp:2,group:'Frontend'},{name:'Go',exp:1,group:'Backend'},{name:'Docker',exp:1}], personalSkills: [{name:'Teamwork'}], foreignLanguages: [{language:'English',level:'advanced'},{language:'French',level:'fluent'},{language:'German',level:''}] }`: `lang="vi"` renders the rows `Kỹ năng chính: Vue`, `Kỹ năng quen thuộc: Go`, `Frontend: React` (Vue left out), no `Backend` row (its only skill is familiar), `Kỹ năng chuyên môn: Docker`, `Kỹ năng cá nhân: Teamwork`, in that order; no years text; entries `English (Khá)`, `French (fluent)`, `German`; section titles `Kỹ năng` and `Ngoại ngữ`; the Skills title comes after General information and before Education, Languages after Certificates and before References. `lang="en"` renders `Skills`, `Main skills: Vue`, `Professional skills: Docker`, `Languages`, `English (Advanced)`. With all five lists empty neither section title is in the DOM.
- (#440) Live (QA account `qa.full@example.com`, `#/dashboard/preview`): Skills and Languages show in Classic, Modern and Compact, in Tiếng Việt and English; the same content shows on that account's `#/resume/<slug>` and `?lang=en`; with a CV profile selected they are unchanged. `qa.empty@example.com` shows neither section.
- (#440) One issue exists on `datvt243/resume-nodejs-api` listing all three export gaps (main/familiar skills missing; raw level printed; classic PDF + DOCX labels hard-coded Vietnamese for `lang=en`) with file/line refs, linked from #440 (`gh issue list -R datvt243/resume-nodejs-api --search "440"` shows it). No file under `resume-nodejs-api` is changed by this task.
- (#440) One follow-up issue exists on `datvt243/resume-vuejs-website` for JSON Resume `skills`/`languages` export, linked from #440; `src/utilities/jsonResume.ts` is unchanged.
- Every new i18n key exists in both `vi` and `en` in `src/i18n/index.ts`; `npm run lint` and `npm run build` pass. (#440 also: `npm run test` passes; `npm run typecheck` gains no errors in changed files.)
- DESIGN.md's loading rules list the download overlay as an allowed blocking overlay next to the cold-start one.

## Edge cases
- `localStorage.cvTheme = 'bogus'` → Classic.
- Active profile deleted → all entries shown.
- Server name `Foo_vi.pdf` with lang `en` → kept as `Foo_vi.pdf` (no second suffix).
- No first/last name and no custom name → `CV.pdf` → `CV_VI.pdf`.
- Overlay up → header links, sidebar and logout can't be clicked, so an in-app route change during a download only comes from Back/Forward, a keyboard shortcut, or code.
- Session lost mid-download (token refresh fails in `services/axios.ts` → `logOut`) → the request fails, the overlay closes, the user lands on login with **no** leave confirm (the download is already dead).
- Cancel while the token refresh is in flight → the retried request carries the aborted signal and never saves a file; treated as a cancel, not an error.
- Download started from the account menu → the dropdown closes; when the overlay closes, focus goes back to the trigger if it's still in the page, else to the header account button.
- A second download clicked from another entry point while one runs → ignored (#10), no second request.
- The cold-start overlay (`Spinner.vue`, DESIGN.md) is not triggered by the download (it doesn't go through `handleBase`), so only the download overlay shows.
- (#440) `mainSkills` holds a name that no longer exists in `professionalSkills` (stale, #437 not fixed yet) → still shown as stored; the layout does not cross-check.
- (#440) Public API response from an older backend without `foreignLanguages` / skill fields → treated as empty lists, no error.
- (#440) A group in `professionalSkillsGroup` with no skills, or whose skills are all main/familiar → not shown; a skill whose `group` is not in `professionalSkillsGroup` → its own row under that group name, after the listed groups (`groupSkills` behavior).
- (#440) Every professional skill is also main or familiar, and no personal skills → only the main/familiar rows show.
- (#440) Only `professionalSkillsGroup` tags exist, no skills at all → no Skills section.

## Out of scope
- Storing theme/profile on the server.
- Attaching an uploaded CV file (Home "coming soon").
- Stopping the PDF render on the server after Cancel (only the browser request is aborted).
- A percentage progress bar.
- The per-profile PDF link in Job applications (`PageApplication.vue`, a `?token=` link in a new tab) — not this flow, no overlay.
- Export PDF (print) and Export JSON — instant, no overlay.
- (#440) Skill/language content is not translated — names are user CV content shown as typed (no `{ vi, en }` field exists for them).
- (#440) Editing skills/languages, reordering them, per-profile selection (`cv-skills.md`, `cv-languages.md`, `cv-profiles.md`).
- (#440) Any backend change (export gaps go to the backend issue, Behavior #23a) and JSON Resume skills/languages (follow-up issue, #23b).
- (#440) Skill years (`exp`) on the CV.

## Open questions
1. "Export PDF" here prints the browser preview (theme + profile applied), while "Download CV" fetches a server PDF that gets no theme and no profile. The two PDFs can differ. Intended? → **Answer (operator 2026-11-07):** Intended (two kinds of export); the profile part is tracked in #448
2. The layout has no Skills or Languages section, so neither appears in the preview, the print or the JSON's layout data. Intended? → **Answer (operator 2026-11-07):** Change — #440
3. Theme and active profile are per-page refs (not shared live like the CV language): changing them on one page does not update another open page until it re-mounts. Intended? → **Answer (operator 2026-11-07):** Intended
4. JSON export is always `resume.json` (no name, no language suffix), unlike the PDF. Intended? → **Answer (operator 2026-11-07):** Bug: same base name as the PDF + `_VI`/`_EN` — #451
5. The Classic/ATS template choice exists on Home and on the ATS check page; the header button always downloads Classic. Intended? → **Answer (operator 2026-11-07):** Intended
6. The header Download button is hidden below the `sm` breakpoint, and the account menu has no download entry — no download on small phones except via Home. Intended? → **Answer (operator 2026-11-07):** Change: add "Download CV" to the account menu — #452

7. (#408) DESIGN.md says "No full-page spinner over content… Spinners only inside buttons", with one exception: the backend cold-start overlay. The #408 overlay is a second full-page overlay. OK to add it to DESIGN.md as a second exception ("server PDF download")? → **Answer (operator 2026-11-23):** Yes — add it to DESIGN.md as a second allowed blocking overlay next to cold start.
8. (#408 — Q1) On success: close the overlay silently (the browser's download UI is the feedback), or also show a green toast ("CV downloaded")? → **Answer (operator 2026-11-23):** Close silently, no toast.
9. (#452 — Q2) The account-menu "Download CV" item: show at every screen size (duplicates the header button on `sm`+), or only below `sm`, where the header button is hidden? → **Answer (operator 2026-11-23):** Below `sm` only.
10. (#408 — Q3) After Cancel (button, Esc or leave-confirm): no toast, or a neutral toast ("Download cancelled")? → **Answer (operator 2026-11-23):** No toast.

11. (#440) Where do the two sections sit in the layout? Current order: header → General information → Education → Experience → Projects → Awards → Certificates → References. The backend classic PDF (`resume-nodejs-api` `src/services/createPDF.ts` lines 118–127) uses: Career → **Skills** → Experience → Project → Education → Awards → Certificates → **Languages** → References. Option A: mirror the PDF slots (Skills right after General information, Languages right before References). Option B: both together right after General information. Option C: other. → **Answer (operator 2026-11-24):** Option A — mirror the PDF: Skills right after General information; Languages right before References.
12. (#440) Professional skills block: (a) show years next to each skill (e.g. `Vue · 3 năm`) or names only? (b) a skill picked as main/familiar also appears in its professional group — show it twice, or leave picked skills out of the professional list? (c) inline comma list per group (`Frontend: Vue, React`) or chips/tags? → **Answer (operator 2026-11-24):** (a) names only, no years; (b) leave skills already picked as main/familiar out of the professional groups, a group left empty is hidden; (c) plain comma list per row, e.g. "Kỹ năng chính: Vue, TypeScript", "Frontend: React, Tailwind", "Kỹ năng cá nhân: Teamwork" — same in every theme.
13. (#440) Language line format: `English — Advanced`, `English (Advanced)` (as the backend PDF does), or a level badge like `/dashboard/languages`? → **Answer (operator 2026-11-24):** "English (Advanced)" — level translated into the CV language; legacy free-text level shown as stored.
14. (#440) The backend export check (issue "Expected" #3). Findings from `resume-nodejs-api` @ `staging` 28e61e5 (read-only): classic PDF (`createPDF.ts`), ATS PDF (`createPDF.ats.ts`) and DOCX (`createDocx.ts`) already render professional skills (grouped in both PDFs, flat in DOCX), personal skills (ATS: only with `includePersonalSkills`, off by default) and foreign languages — but **none render `mainSkills` or `familiarSkills`**, and **all show the raw stored level** (`advanced`, not `Khá`/`Advanced`); classic PDF and DOCX labels are hard-coded Vietnamese (`Kỹ năng chuyên môn`, `Ngoại ngữ`) even for `lang=en`. Is opening the backend issue part of this frontend task (the implementer opens it with these findings), done separately by the operator, or dropped? And should that backend issue cover all three gaps or only main/familiar skills? → **Answer (operator 2026-11-24):** The implementer opens ONE issue on datvt243/resume-nodejs-api covering all 3 gaps with file/line refs. No backend code change in this task. Acceptance criterion.
15. (#440) Export JSON (`src/utilities/jsonResume.ts`) has no `skills`/`languages` either (JSON Resume has both keys). In scope of #440, or a separate issue? Default if unanswered: out of scope. → **Answer (operator 2026-11-24):** Out of scope for #440; the implementer opens a separate frontend follow-up issue for JSON Resume skills/languages export.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-preview-export-spec.md` | - |
| 2026-11-21 | Behavior #5: JSON file named like the PDF (#451); object URL revoke deferred (#421) | operator decision 2026-11-07 (open question 4) | issue-421-451-export-json |
| 2026-11-23 | Behavior 10–17 (shared download state, full-page overlay with Cancel, leave guard + `beforeunload`, account-menu Download CV), draft | #408, #452 spec, see `evidence/analyst/2026-11-23/cv-preview-export-408-452-spec.md` | - |
| 2026-11-23 | Operator answered Q7–10; Behavior 11, 12, 15, 17 and criteria updated; still draft until SEAL | operator answers, see `evidence/analyst/2026-11-23/cv-preview-export-408-452-spec.md` | - |
| 2026-11-24 | Behavior 18–22 (Skills + Languages sections on `CvResumeLayout`), draft; Q11–15 open | #440 spec, see `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` | - |
| 2026-11-24 | Operator answered Q11–15; Behavior 18–20 finalized, #23 (backend + JSON follow-up issues) added, criteria updated; still draft until SEAL | #440, see `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` | - |
