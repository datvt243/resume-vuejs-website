# 2026-10-21 - issue-266-i18n-phase1-shared-auth

- Worker: implementer (v0.1.0)
- Node: `issue-266-i18n-phase1-shared-auth` (`haven/diagrams/dev-loop.prime-mermaid.md`, appended IN_PROGRESS)
- Task (verbatim, via `/todo`): "tôi thấy có các text ko chuyển theo lang. hãy kiểm tra lại toàn bộ và cập nhật i18n" → issue [#266](https://github.com/datvt243/resume-vuejs-website/issues/266)
- Status: `sealed_pending_verifier`

## Hub bytes before: 198075
Measured right after appending this node's row (the row was added before the measurement, so the number includes about 600 bytes from it).

## Branch
`fix/issue-266-i18n-missing-text`, created with `gh issue develop` from `staging` `1f8cce6` (after fetch and pull).

## Scope (initiative-scoping.md)
Baseline audit: every non-comment line containing Vietnamese characters in `src/**/*.{vue,ts,js}`, excluding `*.spec.ts`, `src/i18n/`, `Author:` headers and lines starting with `//`, `*`, `/*` or `<!--`. Result: **568 lines in 64 files**. Only the header and nav used i18n before this change. The operator chose a phased split (AskUserQuestion answer: "Phases, by area"):
- **P1 (this node):** shared components, dialogs, form parts and validation display, services' toast messages, auth pages.
- P2: dashboard pages.
- P3: `src/models/*` and field labels.
- P4: home and public pages.
- After P4, re-run the same audit.

## Diff (32 src files, +333/-130)
| File | Why |
|---|---|
| `src/i18n/index.ts` | New VI/EN groups: `common`, `form`, `spinner`, `confirm`, `error`, `auth`, `validation`. New exports `t` (= `i18n.global.t`, usable in lib/services and in specs that mount without the plugin) and `tr(s)` (translates `s` if it is a message key, else returns it unchanged). |
| `src/i18n/index.spec.ts` | New test for `tr`: a key is translated, literal text and `''` pass through, and the output follows `setLang('en')`. |
| `components/veevalidate/part/Frm*.vue` (10) | `label`, `text`, `placeholder` and `errorMessage` render through `tr`. The default placeholder prefix is now `t('common.pleaseEnter')`. Also translated: FrmSelect's "Vui lòng chọn" and FrmPwd's aria-label. Model field configs and yup messages can now be message keys and update live; existing literal labels still render as before. |
| `components/veevalidate/VeeForm.vue` | Default `submitText` is `''`, falling back to `t('common.save')`. Also translated: the Cancel button, the content-language aria-label and the error-flag title. |
| `components/veevalidate/VeeFormGeneralInformationUpdate.vue` | Swal delete-confirm texts, the Add/Cancel/Save buttons, the actions column header, the delete aria-label and the modal title (`form.editTitle`/`form.addTitle`). |
| `components/{Spinner,Modal,Toasts,QrCode,GroupTags}.vue`, `global/{ItemActions,LoadingGate,NoData}.vue`, `table/TableDefault.vue`, `ckeditor/CKEditor.vue`, `convert/part/toBoolean.js` | Hardcoded VI strings replaced with `t(...)`. NoData's default `title` is now `''`, falling back to `t('common.noData')`. |
| `lib/swal.lib.js`, `services/axios.ts`, `services/auth.ts` | Confirm-dialog text, the network-error message and the login-failed toast now use `t(...)` when called. |
| `pages/auth/Page{Login,Register,ForgotPassword,ResetPassword}.vue` | Field configs use message keys for labels, placeholders, hints and yup messages. Register/Reset `.email()` and `.required()` used yup's default English messages; they now use keys too. Headings, submit text and links use `$t`. |

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test`, `npm run build`, `npm run lint`. Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
`npm run test`:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 13ms
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
AssertionError: expected 'VI' to contain '!'
 Test Files  1 failed | 39 passed (40)
      Tests  1 failed | 255 passed (256)
```
Baseline on `staging` before the diff: `Tests  1 failed | 254 passed (255)`, with the same pre-existing failure (also cited in the issue-262 and issue-251 verifier notes). +1 passing test (the new `tr` spec). The `Error: Not implemented: navigation` jsdom line is also on the baseline: `git stash` run → count 1.

`npm run build`: `✓ built in 4.14s`

`npm run lint`: no problems reported. Output ends at `> eslint src --ext .js,.ts,.vue` with nothing after it, the same as the stashed baseline.

## Manual check (Playwright on `npm run dev`, real browser, `#/login`)
I typed "bad" in email and blurred it, then clicked the header VI and EN switches:
- VI: `h1 "Đăng nhập"`, labels `Email / Mật khẩu / Ghi nhớ đăng nhập`, placeholder `Vui lòng nhập Email`, error `Email sai định dạng`, submit `Đăng nhập`, link `Quên mật khẩu?`, `<html lang="vi">`
- EN: `h1 "Log in"`, labels `Email / Password / Remember me`, placeholder `Enter your email`, error `Invalid email format`, submit `Log in`, link `Forgot password?`, `<html lang="en">`; show-password aria-label `Show password`

The error message that was already on screen switched language too, with no re-validation.

## Re-measure (same audit command)
After this diff: **476 lines in 38 files** (was 568 in 64). The only hits left in P1 scope are `PageRegister.vue:27-37` (`Họ`/`Tên`). They are inside a `/* … */` commented-out block, which the audit's line-start filter does not catch. This is dead code, not UI.

## Acceptance
| Criterion | Evidence |
|---|---|
| P1 files have no hardcoded VI UI text | Re-measure grep: no P1 hits except the dead comment block |
| Text follows the header VI/EN switch | Playwright VI/EN readings above. `tr` spec passes. |
| VI default unchanged (existing specs assert VI text) | All specs asserting VI strings pass (Toasts, Modal, LoadingGate, VeeForm*, i18n); only the known failure fails |
| No regressions | `Tests 1 failed \| 255 passed (256)` vs baseline `1 failed \| 254 passed (255)`; `✓ built in 4.14s`; lint clean |
| Comments per code-comments.md | 2 added in `i18n/index.ts`: a `//` saying why `t` is exported, and a one-line `/** */` JSDoc on exported `tr`. No issue refs. |

## Noticed, not done
- `FrmCurrency.vue:73` binds `:placeholder="getPlaceholder"`, but `getPlaceholder` is never defined in that file. This bug was there before this diff.
- The dead commented-out `firstName`/`lastName` block in `PageRegister.vue` should be deleted, as separate cleanup.
- The header comment in `src/i18n/index.ts` ("Untranslated screens keep their hard-coded Vietnamese text") stays accurate until P4.
- The active diagram is about 127KB, far over the ~15KB guideline, and needs an archive pass.

## Seal gate
None. No commit, push or API write. The manual check only rendered the login page, with no submit.
