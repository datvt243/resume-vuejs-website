# 2026-10-24 - issue-266-i18n-dashboard-browser-check

- Worker: implementer
- Version: 0.1.0
- Node: `issue-266-i18n-dashboard-browser-check` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim): "#266 [BUG] Một số text không chuyển theo ngôn ngữ (i18n) — rà soát toàn bộ và cập nhật i18n. Body: tôi thấy có các text ko chuyển theo lang. hãy kiểm tra lại toàn bộ và cập nhật i18n. Scope: audit every user-visible hardcoded string in `src/` that does not go through `src/i18n` and move it into the VI/EN message files so it follows the header language switch. Context: phases 1-4 already merged (#267, #278); #278's verifier REOPENed because dashboard pages were never checked in a real browser in EN. Remaining: re-audit for leftover hardcoded strings, fix any, and verify in a real browser (EN) that dashboard pages switch language."

## Hub bytes before: 205237

## Branch
`fix/266-i18n-audit`, created from up-to-date `staging` via `gh issue develop 266 --checkout --base staging` (linked to #266).

## Context
This closes the gap in `evidence/verifier/2026-10-21-issue-266-i18n-phase2-4-remaining-reopen.md` → "Missing": a logged-in browser pass over the dashboard in VI and EN. That code is already on `staging` and `main` (PR #278 merge commit is an ancestor of `origin/main`; `git diff origin/main origin/staging -- src` is empty; deploy run on main 2026-10-21T20:06:53Z = success). So the live site runs the same `src` this branch started from, and the browser pass ran there.

## Re-audit (same grep as phases 1–4: VI-diacritic lines in `src/**/*.{vue,ts,js}`, excluding specs, `src/i18n/`, comment-start lines)
Result: **39 lines**, the same 39 as #278's note, all out of scope: `CvResumeLayout.vue` LABELS (16), `experience.model.ts` `{ vi, en }` CV-content labels (13), `'Hình ảnh'` in commented-out blocks of award/certificate/project models (3), commented-out block in `PageRegister.vue` (4), CSS comment in `PagePreview.vue` (3).

## Browser pass (Playwright, live site `https://datvt243.github.io/resume-vuejs-website/`, logged in with the `.env` test account)
Why the live site and not a local dev server: `npm run dev` here uses `.env.development.local` → `VITE_API_URL=http://localhost:3001/` (no local API running). A second server on port 5174 pointed at the prod API failed login: the API's CORS rejects origin `http://localhost:5174` (console: "No 'Access-Control-Allow-Origin' header"). Port 5173 was already taken by the operator's own dev server, which I didn't stop. Nothing was saved: forms were opened, validation triggered client-side, then closed via Cancel → "Close anyway".

1. **Sweep of all 16 logged-in routes in EN** (`/`, every `/dashboard/*`): `<html lang="en">` and an English heading on every route. VI-diacritic text and raw-key matches (regex `\b(common|form|auth|validation|field|option|nav|…)\.[a-zA-Z.]+`, `::{`) over innerText plus placeholder/aria-label/title/option. Hits were only user CV content ("Võ Tấn Đạt", "Cao đẳng kỹ thuật Cao Thắng", profile name "Tổng hợp", address), with one exception: **`option.languageLevel.basic` raw key in the Foreign languages table, Level column** (`/dashboard/general-information`). → bug 1.
2. **Sweep of the same 16 routes in VI for leftover English** (common English words in visible text nodes + aria-label/title/placeholder, CKEditor/CV paper excluded): **footer "copyright by … me" on all 16 routes** → bug 2. Also `aria-label="Clear value"` on 8 routes, from `@vuepic/vue-datepicker` defaults (not in `src`; see Noticed). Everything else was CV content.
3. **PageEducation, add form open, live switch VI → EN with errors showing** (typed+cleared School, 260 chars in Major):
   - VI: title "Thêm học vấn"; labels "Tên trường, Chuyên ngành, Ngày bắt đầu, Ngày kết thúc, Đang học tại đây, Mô tả, Mô tả (English)"; placeholders "Vui lòng nhập tên trường", "Vui lòng nhập chuyên ngành"; errors "Vui lòng nhập", "Tối đa 50 ký tự"; buttons "Hủy, Lưu".
   - EN: title "Add education"; labels "School, Major, Start date, End date, I currently study here, Description, Description (English)"; placeholders "Enter school", "Enter major"; errors "This field is required", "Maximum 50 characters"; buttons "Cancel, Save".
   - Discard dialog in EN: "You have unsaved changes. Close anyway? / Stay / Close anyway".
   - Education has no table (card list); card actions EN "Add education / Edit … / Duplicate … / Delete …", VI "Thêm học vấn / Sửa … / Nhân bản … / Xóa …".
4. **PageExperience → Add → chooser → Career break**, live switch EN → VI:
   - Chooser EN: "What would you like to add? | Work experience | A job or position you have held. | Career break | Explain time you spent away from work."
   - EN: title "Add career break"; options "Please select, Career transition, Caregiving, Full-time parenting, Gap year, Health and well-being, Layoff or position eliminated, Personal goal pursuit, Professional development, Relocation, Retirement, Travel, Voluntary work".
   - VI: title "Thêm khoảng nghỉ việc"; options "Vui lòng chọn, Chuyển đổi nghề nghiệp, Chăm sóc người thân, Chăm sóc con toàn thời gian, Năm nghỉ (gap year), Sức khoẻ, Bị cắt giảm nhân sự, Theo đuổi mục tiêu cá nhân, Phát triển chuyên môn, Chuyển nơi ở, Nghỉ hưu, Du lịch, Hoạt động tình nguyện".
5. **PageGeneralInformation in EN**: all field labels, select options (Current level, Education level, Employment type), section headings and table headers (#, Skill, Years of experience, Group, Actions / Language, Level) in English. The only raw key is bug 1. `(English)` labels and `maxChars` messages were checked in step 3 (same `Frm*`/`withParams` path).
6. **PageHome**, VI → EN: "Hoàn thành hồ sơ / 5/8 mục đã đủ / Hoàn thiện hồ sơ / Còn thiếu 3 mục / Giải thưởng, Chứng chỉ, Người tham khảo" → "Profile completion / 5/8 sections complete / Complete your profile / 3 sections missing / Awards, Certificates, References".

## Diff
| File | Why |
|---|---|
| `src/components/table/TableDefault.vue` | Bug 1. `displayValue` mapped a select value to its option `text`, which has been an i18n key since #278, and rendered it as-is. Now `tr(objectSelect[name]?.[value]) ?? value`: translates keys, passes literal option text through (e.g. user skill groups), falls back to the raw value for unknown values. One shared root-cause fix; it covers every `TableDefault` with a select column (sort uses the same function). |
| `src/components/table/TableDefault.spec.ts` | New test: select cell shows "Cơ bản" in VI and "Basic" in EN after a locale switch, and an unknown value stays as-is. Confirmed it fails without the fix (`Received "option.languageLevel.basic"`). |
| `src/pages/_layouts/Footer.vue` | Bug 2. Hardcoded "copyright by <a>me</a>" → `<i18n-t keypath="footer.copyright">` with a `#me` link slot (no concatenated fragments, per CLAUDE.md i18n rules). Same pattern as `PageImportLinkedin.vue`. |
| `src/i18n/index.ts` | `footer.copyright` / `footer.me` in both `vi` ("bản quyền thuộc về {me}" / "tôi") and `en` ("copyright by {me}" / "me"; original EN wording kept). |
| `src/pages/_layouts/Footer.spec.ts` | New: VI and EN text after a locale switch, link href unchanged. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New node row appended at the end (`AppendOnly`). |

## Command
From repo root:
- `npm run test`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script

## Output
- `npx vitest run src/components/table/TableDefault.spec.ts`: `Tests  6 passed (6)`. Without the `.vue` fix: `Tests  1 failed | 5 passed (6)`, `- "Cơ bản",` / `+ "option.languageLevel.basic",`.
- `npx vitest run src/pages/_layouts/Footer.spec.ts src/i18n`: `Tests  5 passed (5)` (includes the vi/en key-parity + used-key spec).
- `npm run test`, last two full runs: `Tests  1 failed | 275 passed (276)`, both times the known `VeeForm > VI | EN toggle > flags the hidden language that has a validation error`. On baseline `staging` (`git stash -u`) that test fails the same way: `Tests  1 failed | 18 passed (19)` for `VeeForm.spec.ts`.
  - One earlier full run showed `Tests  2 failed | 274 passed (276)`. The extra one was `VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit`. It passed in 3 isolated runs of `VeeForm.spec.ts` and 2 further full runs, so it's a timing flake. `VeeForm.spec.ts` imports neither changed file.
- `npm run build`: `✓ built in 4.16s`
- `npm run lint`: no output after `> eslint src --ext .js,.ts,.vue` (clean)
- Footer on the operator's dev server (`http://localhost:5173/#/login`, serves this working tree): VI `bản quyền thuộc về tôi © 2026`, EN `copyright by me © 2026`, href `https://github.com/datvt243` both times.

## Acceptance
| Criterion | Evidence |
|---|---|
| Re-audit for leftover hardcoded VI strings | 39 lines, all classified out of scope (Re-audit section) |
| Logged-in browser check in VI and EN (#278 REOPEN "Missing" 1) | Browser pass steps 1–6: PageEducation form + validation, PageExperience career-break options, PageGeneralInformation labels/options/table, PageHome completion labels, plus all 16 routes swept in both languages |
| Leftover text found by the browser pass fixed | Bug 1 (`TableDefault` select cell raw key) and bug 2 (footer) fixed, each with a spec. Footer seen switching live in the dev server. |
| Both `vi` and `en` have every key | `src/i18n/index.spec.ts` parity + used-key test passes |
| No regressions | Same single known failure as `staging`; build green; lint clean |
| Comments per code-comments.md | No comments added or changed |

**Not observed in a browser:** the `TableDefault` fix itself. The live site doesn't have it yet, and no local server can log in (CORS + no local API, see Browser pass). Its evidence is the spec (fails before, passes after, both locales) plus the live-site reading that showed the raw key before the fix.

## Noticed, not done
- `@vuepic/vue-datepicker` (`FrmDatePicker.vue`) uses its English defaults: `aria-label` "Clear value" etc. and likely the calendar month/day names. Localizing it means passing the library's `locale`/`aria-labels` props from the UI locale. That's third-party config, not hardcoded `src` text, so it's a separate follow-up.
- The header user-menu button's accessible name is raw HTML: `<span class="block max-w-16 truncate sm:max-w-32">Võ Tấn Đạt</span>` (seen in the accessibility snapshot). An a11y bug, not i18n.
- CKEditor placeholder is just "Vui lòng nhập" / "Enter": `FrmCkediter.vue` passes no placeholder to `CKEditor.vue:26`, so the label part is missing. It's also set once in the editor config, so it won't change on a live language switch. One datepicker/empty-label field also shows the placeholder "Vui lòng nhập " / "Enter ".
- Carried over from #278's note, still open: `Intl.*('vi-VN')` number/date formatting doesn't follow the UI locale; backend messages stay in the API's language; dead `Navbar.vue`/`FrmArray.vue`.
- Flaky VeeForm "typing then clearing" test (see Output).
- `.env` holds the test account password in plain text (gitignored). Fine for local use.

## Seal gate
None crossed. No commit, push or API write. Browser actions were a login (auth POST), GETs, and client-side-only form interactions closed without saving.
