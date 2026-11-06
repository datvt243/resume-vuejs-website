# Import CV (LinkedIn export, PDF, JSON Resume)

- Status: draft
- Source: backfill from code
- Issues: -
- Anchors: `src/pages/dashboard/PageImportLinkedin.vue`, `src/utilities/jsonResume.ts` (`fromJsonResume`), `src/services/base.ts`, `src/models/education.model.ts`, `src/models/experience.model.ts`

## Goal
A new user fills Education and Experience quickly from a file they already have, reviewing every item before it is saved.

## Behavior
1. `/dashboard/import-linkedin` shows a source switch — LinkedIn / PDF / JSON Resume — with a hint per source and one "Choose file" button.
   - LinkedIn: a `.zip` "Data export" (hint says to pick Positions and Education) → uploaded as `file` to `POST api/v1/candidate/parse-linkedin-export`.
   - PDF: `.pdf` (hint: one-column CV, up to 5MB, scanned images can't be read) → `POST api/v1/candidate/parse-cv-pdf`.
   - JSON Resume: `.json`, parsed in the browser by `fromJsonResume`; not uploaded.
2. Parsing never saves anything. After a parse the page shows "Source: <name>" (for PDF also "reading a PDF is only a best guess"), then two lists: "Education found" (school, or "(unknown school)"; major) and "Experience found" (company, or "(unknown company)"; position). An empty list shows "No items found".
3. For PDF, the extracted text appears in a collapsible block so the user can copy anything missed.
4. Each found item has "Add", which opens the normal Education or Experience form pre-filled with the parsed values (empty values fall back to field defaults). Saving creates a NEW entry (`POST <collection>/create`), adds it to that section's list, closes the modal and marks the item "Added" (no second Add).
5. Errors: invalid JSON → red toast "invalid JSON file"; other JSON Resume errors → toast with the error message; upload/parse failure → red toast with the API's reason. Choosing a file again resets the input so the same file can be re-picked.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageImportLinkedin.spec.ts` passes.
- `npx vitest run src/utilities/jsonResume.spec.ts` passes (`fromJsonResume`).
- Picking a `.json` file containing `{` shows the "invalid JSON file" toast and no lists.
- Importing the `resume.json` exported from Preview lists its education and experience entries.
- After "Add" + Save on one item, that item shows "Added" and the Education (or Experience) page lists the new entry.

## Edge cases
- Parsed item with no school/company → placeholder title, form fields empty.
- Parse succeeds with zero items → both lists show "No items found".

## Out of scope
- Importing Projects, Skills, Languages, Awards, Certificates or personal info.
- Saving without review (no "add all").

## Open questions
1. The 5MB PDF limit is only in the hint text; the browser does not check file size before uploading. Should it?
2. No duplicate detection: importing the same file twice lets the user add the same entries again. Intended?
3. Imported experiences skip the career-break normalisation the Experience page applies (`careerBreakPayload`). Can a parsed item be a career break, and should it be normalised?
4. JSON Resume also carries projects, skills, languages, awards and certificates — only education and experience are offered. Intended scope?
5. Route and file are named "import-linkedin" while the feature covers three sources. Rename, or keep for link stability?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
