# CV preview, theme, language and export (incl. Download CV)

- Status: draft
- Source: backfill from code
- Issues: #55, #116, #119, #182
- Anchors: `src/pages/dashboard/PagePreview.vue`, `src/components/cv/CvResumeLayout.vue`, `src/composables/useCvTheme.ts`, `src/composables/useCvLang.ts`, `src/composables/useActiveProfile.ts`, `src/composables/useDownloadCv.ts`, `src/utilities/jsonResume.ts`, `src/pages/_layouts/Header.vue`, `src/pages/home/PageHome.vue`

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
5. "Export JSON" downloads `resume.json` in JSON Resume format, built from the same filtered data, the chosen CV language and the social links.
6. "Download CV" (header button on wider screens, and the Home CV card) downloads the server-rendered PDF: `GET api/v1/download-pdf` with the Bearer token, `template=ats` only when ATS is chosen (the Home CV card and the ATS check page offer that choice; the header button always uses Classic), `lang=en` only when the CV language is English. A second click while downloading is ignored; the button shows a spinner.
7. Downloaded file name: the server's `Content-Disposition` name if present, else the computed CV file name; then `_VI` or `_EN` is added before the extension unless the name already ends with `_vi`/`_en` (any case).
8. Computed CV file name: the custom name from Account settings + `.pdf` if set (trimmed), else `<firstName>_<lastName>.pdf` with spaces turned into `_`, else `CV.pdf`.
9. Download failure → red toast "could not download CV".

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PagePreview.spec.ts` passes.
- `npx vitest run src/composables/useDownloadCv.spec.ts` passes (`withLangSuffix`, file name, params).
- `npx vitest run src/composables/useCvTheme.spec.ts src/composables/useCvLang.spec.ts src/composables/useActiveProfile.spec.ts` passes.
- `npx vitest run src/utilities/jsonResume.spec.ts` passes.
- Choosing "Modern" then reloading `#/dashboard/preview` keeps Modern selected.
- With CV language English and name "Nguyen Van A" with no custom name and no server name, the file saves as `Nguyen_Van_A_EN.pdf`.

## Edge cases
- `localStorage.cvTheme = 'bogus'` → Classic.
- Active profile deleted → all entries shown.
- Server name `Foo_vi.pdf` with lang `en` → kept as `Foo_vi.pdf` (no second suffix).
- No first/last name and no custom name → `CV.pdf` → `CV_VI.pdf`.

## Out of scope
- Storing theme/profile on the server.
- Attaching an uploaded CV file (Home "coming soon").

## Open questions
1. "Export PDF" here prints the browser preview (theme + profile applied), while "Download CV" fetches a server PDF that gets no theme and no profile. The two PDFs can differ. Intended?
2. The layout has no Skills or Languages section, so neither appears in the preview, the print or the JSON's layout data. Intended?
3. Theme and active profile are per-page refs (not shared live like the CV language): changing them on one page does not update another open page until it re-mounts. Intended?
4. JSON export is always `resume.json` (no name, no language suffix), unlike the PDF. Intended?
5. The Classic/ATS template choice exists on Home and on the ATS check page; the header button always downloads Classic. Intended?
6. The header Download button is hidden below the `sm` breakpoint, and the account menu has no download entry — no download on small phones except via Home. Intended?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
