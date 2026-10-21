# 2026-10-21 - issue-266-i18n-phase2-4-remaining

- Worker: implementer (v0.1.0)
- Node: `issue-266-i18n-phase2-4-remaining` (`haven/diagrams/dev-loop.prime-mermaid.md`, appended IN_PROGRESS at the end of the table)
- Task (via `/todo #266`): "tôi thấy có các text ko chuyển theo lang. hãy kiểm tra lại toàn bộ và cập nhật i18n". Scope: every user-visible hardcoded string in `src/` outside `src/i18n` moves into the VI/EN messages so it follows the header switch. This node covers the remaining phases 2–4 from the phase-1 plan (dashboard pages, `src/models/*`, home and public pages), done together.
- Status: `sealed_pending_verifier`

## Hub bytes before: 204611
Measured after appending this node's row (root `*.md` + `doctrine/` + active diagram + both worker bundles).

## Branch
`fix/issue-266-i18n-remaining-text`, created with `gh issue develop 266 --base staging` after `git fetch` + `git checkout staging` + `git pull origin staging` (staging `e5984fe`). The phase-1 branch `fix/issue-266-i18n-missing-text` had been deleted after merge (PR #267).

## Approach
- **Models** (`src/models/*`, `src/types/model.type.ts`, `src/models/part/index.ts`): labels, select option `text` and yup messages are now message keys (`field.*`, `option.*`, `validation.*`). The `Frm*` parts already render them through `tr()`. I deleted the `placeholder: 'Vui lòng nhập X'` lines because the `Frm*` parts already build `t('common.pleaseEnter') + label` in the current language. Visible change: VI placeholders now show the label in lowercase.
- **Param messages**: new `withParams(key, params)` in `src/i18n/index.ts` packs a key and its params into one string (`key::{json}`) for slots that only take a string (yup messages, `withEnglish`'s `"<label> (English)"` label). `tr` unpacks it and also translates string params that are keys. Used for `validation.maxChars` and `form.englishField`.
- **Career-break select options**: the backend already sends both `{ vi, en }` labels, so each option's `text` is a getter that reads `i18n.global.locale` at render time. `experienceTitle`'s default `lang` is now the UI locale (CvResumeLayout passes `lang` explicitly, so it is unchanged).
- **CvResumeLayout**: option text is now a key, so `optionLabel` renders it with `i18n.global.t(key, {}, { locale: props.lang })` (the CV's language, not the UI's). I deleted its duplicate `OPTION_LABELS_EN` table; those EN strings moved into the `en.option.*` messages unchanged. Its own `LABELS` (lang-prop labels) are left alone, per CLAUDE.md.
- **Shared rendering**: `FrmSelect` options render with `tr(el.text)`. `TableDefault` headers render with `tr(label)`. The TableDefault pager ("Trang"/"trong") was missed in phase 1 because the audit regex only matches diacritics; it now uses `common.pageOf`/`common.rowRange`.
- **Pages**: templates use `$t(...)`. Pages mounted by specs (Visits, ImportLinkedin, AtsCheck, Application, Preview, PublicResume, VisitChart) use the imported `t`, per CLAUDE.md. `submit-text="Lưu"` is removed wherever VeeForm's default `common.save` already gives the same text. Two hints with a link mid-sentence (ImportLinkedin) use `<i18n-t>` with slots, and that spec now installs the i18n plugin.
- `useProfileCompletion` section labels are now `nav.*` keys, and PageHome renders them with `$t`. `useVisitStats.INTERVAL_LABELS` is deleted (replaced by `visits.interval/range/chartTitle.*`), and `formatBucket` week labels use `visits.weekN`.
- Message `information.shareDescription` says "VI hoặc EN" instead of "VI | EN": `|` is vue-i18n plural syntax (CLAUDE.md rule).

## Diff (46 files, +1215/-535)
`src/i18n/index.ts` (new groups `field`, `option`, `crud`, `generalInfo`, `information`, `visits`, `home`, `importCv`, `ats`, `profileCv`, `account`, `preview`, `publicResume`, plus keys added to `common`/`form`/`validation`/`error`; new `withParams`, `tr` extended), `src/i18n/index.spec.ts`, 10 models + `model.type.ts` + `models/part`, 17 pages, `CvResumeLayout`, `TableDefault`, `FrmSelect`, `VisitChart`, 3 item cards, `useProfileCompletion`, `useVisitStats`, `jsonResume.ts`, 4 specs updated, `.claude/CLAUDE.md` (the "legacy screens until phases 2–4" line is replaced by a `withParams` note).

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test`, `npm run lint`, `npm run build`. Typecheck: CANNOT RUN — pending add-typecheck-script. The new spec below covers the one type check that matters here (VI/EN key parity).

## Output
Baseline on this branch before any edit: `Tests  1 failed | 268 passed (269)`. The failure is the known VeeForm VI|EN toggle failure that phase 1's note also cites.

After:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 8ms
 Test Files  1 failed | 41 passed (42)
      Tests  1 failed | 270 passed (271)
```
+2 new tests in `src/i18n/index.spec.ts`:
1. `tr` unpacks `withParams` (VI and EN, with a key param and a literal param).
2. VI and EN have identical key trees, and every single-quoted `'<group>.<key>'` literal in `src/**/*.{vue,ts,js}` (excluding specs) exists in the messages. On its first run it flagged 3 matches (`field.key`, `field.value`, `error.code`), all false positives from code identifiers in double quotes or backticks, which shows it does scan the sources. After restricting the regex to single quotes: passes. Keys built dynamically with template literals (`visits.chartTitle.${interval}`) are not covered by this check.

`npm run lint`: no problems (output ends at `> eslint src --ext .js,.ts,.vue`).
`npm run build`: `✓ built in 3.64s`.

Spec changes, and why:
- `useProfileCompletion.spec.ts`: section `label`s are now keys (`nav.*`). The composable returns keys and the page translates them.
- `PageVisits.spec.ts`: dropped `INTERVAL_LABELS` from the module mock (the export no longer exists).
- `PageAtsCheck.spec.ts`: the download-link test switches to EN and then looked for the link by its VI text. The text now correctly changes to EN, so the spec finds the link by `a[href*="download-pdf"]` instead.
- `PageImportLinkedin.spec.ts`: mounts with `plugins: [i18n]` for `<i18n-t>`.

## Re-measure (same audit as phase 1: Vietnamese-diacritic lines in `src/**/*.{vue,ts,js}`, excluding specs, `src/i18n/`, `Author:` lines and lines starting with a comment marker)
Before: **476 lines in 38 files**. After: **39 lines in 7 files**, all out of scope:
- `CvResumeLayout.vue` (16): its own `LABELS.vi`, the lang-prop CV labels (CLAUDE.md: not i18n).
- `experience.model.ts` (13): `CAREER_BREAK_TYPES`/`CAREER_BREAK_LABEL` `{ vi, en }` backend CV-content labels.
- `award/certificate/project.model.ts` (1 each): `label: 'Hình ảnh'` inside `/* … */` dead blocks.
- `PageRegister.vue` (4): the dead commented-out block phase 1 already noted.
- `PagePreview.vue` (3): a Vietnamese CSS comment inside `<style>`.

Second sweep for text the diacritic grep can't see (static `text=`/`title=`/`label=`/`placeholder=`/`aria-label=`/`description=`/`heading=`/`alt=` attributes and capitalized text nodes): found the TableDefault pager (fixed), plus `Navbar.vue` "Toggle navigation" and `FrmArray.vue` "Add"/"Remove". Both of those components have no importers in `src/` (dead code), so I left them; see below.

## Manual check (Playwright on the running `npm run dev`, port 5173, cwd confirmed as this repo via `lsof`)
- `#/resume/zz-no-such-slug-266` (public page, real API 404): with `cvLang=vi`: `<html lang="vi">`, "Không tìm thấy hồ sơ" / "Hồ sơ không tồn tại hoặc chưa được chia sẻ công khai.". With `cvLang=en`: `<html lang="en">`, "Profile not found" / "This profile doesn't exist or hasn't been shared publicly.".
- `#/register` read in EN: "Sign up", labels `Email / Password / Confirm password` (phase-1 page, no regression).
- **Not manually checked:** every dashboard page (`/dashboard/*`, home). They need a logged-in session, and no test credentials are available in this session. Their VI/EN rendering is covered only by the spec-mounted pages (Visits, ImportLinkedin, AtsCheck, Application, Preview), the key-existence spec and the build. The verifier/operator should click through the dashboard in EN once.

## Acceptance
| Criterion | Evidence |
|---|---|
| Remaining hardcoded VI UI text moved to i18n | Audit 476 → 39, every remaining line classified as out of scope above |
| Text follows the header VI/EN switch | Public page Playwright readings; `tr`/`withParams` spec in both locales; templates use `$t`/`t` (reactive to locale) |
| Both `vi` and `en` have every key | New parity + used-key spec passes |
| VI default unchanged except where noted | Existing VI-asserting specs pass. Intentional wording changes: placeholders now use the lowercase label; "Chỉnh sửa: X" → existing `form.editTitle` "Sửa: X"; award name label "Tên Chứng chỉ" → "Tên giải thưởng" (copy-paste bug); years-of-experience message "phải lớn hơn 0" → "không được âm" (the rule is `.min(0)`); profile-completion label "Kinh nghiệm làm việc" → `nav.experience` "Kinh nghiệm" |
| Yup messages that were silently ignored now show | `yup.number('…')` takes no message, so those messages never appeared and yup's English default showed instead. They are now `.number().typeError('validation.number')`. `.max(50)`/`.url()` without a message now use `validation.maxChars`/`validation.urlInvalid` |
| No regressions | `1 failed \| 270 passed` vs baseline `1 failed \| 268 passed` (same known failure); lint clean; build green |
| Comments per code-comments.md | New one-line comments only for non-obvious whys: `withParams`/`tr` JSDoc, career-break getter, CvResumeLayout locale, spec rationale. No issue refs added. |

## Noticed, not done
- `Navbar.vue` ("Toggle navigation") and `FrmArray.vue` ("Add"/"Remove") are unused (no importers in `src/`). Candidates for deletion rather than translation.
- Table cells for select fields (e.g. foreign-language `level` in VeeFormGeneralInformationUpdate's table) show the raw stored value (`basic`), not the option label. This was the behavior before this diff.
- `Intl.NumberFormat('vi-VN')`/`DateTimeFormat('vi-VN')` on PageVisits/PageHome/TableDefault don't follow the UI locale (digit grouping and date order only, no words).
- Backend-provided strings (ATS `check.message`, API error messages) stay in whatever language the API returns.
- `FrmCurrency.vue` `getPlaceholder` undefined (phase 1 note) is still open.
- The active diagram is still far over its size guideline (phase 1 note).

## Seal gate
None crossed. No commit, push or API write. The manual check only read pages (the public page GET returned 404 for a fake slug).
