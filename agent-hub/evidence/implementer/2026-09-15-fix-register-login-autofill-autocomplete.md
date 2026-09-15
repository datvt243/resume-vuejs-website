# 2026-09-15 — fix-register-login-autofill-autocomplete

- Worker: implementer
- Version: 0.1.0
- Node: `fix-register-login-autofill-autocomplete`
- Task (verbatim): "Fix: register page inheriting browser-autofilled
  values from login page. Root cause: FrmInput.vue/FrmPwd.vue inputs have
  no autocomplete/name attribute, so Chrome misidentifies the
  near-identical Login/Register forms and autofills saved login
  credentials into Register's email/password fields. Fix: add
  autocomplete hints to formFields in PageLogin.vue (email: 'username',
  password: 'current-password') and PageRegister.vue (email: 'email',
  password: 'new-password', repassword: 'new-password') — passed through
  via VeeForm's existing v-bind=\"attrs\" fallthrough, no Frm*.vue
  component changes needed."
- Status: sealed_pending_verifier

## Hub bytes before
209190 (root=12569, doctrine=27207, active diagram=143297,
implementer bundle=14963, verifier bundle=11154 — measured before this
node's row was appended)

## Branch
`fix/register-login-autofill-autocomplete`, checked out from
`origin/staging` (staging already includes the merged
`feature/tailwindcss-setup` work, PR #124).

## Investigation (before writing any diff)
Operator reported (Vietnamese): "page đang ký đang ghi nhớ value của page
login" (the register page remembers the login page's values). Used the
already-running `/open-browser-debugger` session (port 9888) to check
whether this is an app-level state bug:

1. Navigated to `/login` (real SPA route,
   `http://localhost:5173/resume-vuejs-website/login`), typed
   `sometestuser@example.com` / `SomeTestPassword123!` into the email and
   password fields via CDP `Runtime.evaluate` (native property setter +
   `input` event dispatch — not `.value =` directly, which vee-validate's
   `@input` handler wouldn't see).
2. Clicked the real "Đăng ký" nav link (`Header.vue:46`, `to: '/register'`)
   — a genuine client-side SPA navigation, not `Page.navigate` (which
   would force a full reload and not reproduce the real user flow).
3. Read back the Register page's input values: all three (`email`,
   `password`, `repassword`) were empty.

This rules out a Vue/vee-validate state leak: `VeeForm.vue:59` calls its
own `useForm()` per component instance — `PageLogin.vue` and
`PageRegister.vue` are different route components, each gets a fresh,
fully isolated form context. No shared Pinia store or module-level state
holds these values either (grepped `src/stores/` — only `auth`/
`candidate`, neither touches login/register form fields).

**Real root cause**: read `src/components/veevalidate/part/FrmInput.vue`
and `FrmPwd.vue` in full — neither sets `name` or `autocomplete` on the
rendered `<input>`, only `:id="props.name"`. Since `id="email"`/
`id="password"` are identical strings on both `/login` and `/register`,
and there is no `autocomplete` hint to tell the browser "this is a new
account" vs "this is an existing login", Chrome's autofill heuristics can
misidentify the Register form as a login form and offer/fill the saved
Login credential into it — the same class of browser-native behavior
already documented in node `tailwindcss-post-ship-review-fixes`'s
`:-webkit-autofill` finding.

## Diff
| File | Change | Why |
|---|---|---|
| `src/pages/auth/PageLogin.vue` | Added `autocomplete: 'username'` to the `email` field, `autocomplete: 'current-password'` to the `password` field in `formFields` | Tells the browser these are login credentials for an EXISTING account |
| `src/pages/auth/PageRegister.vue` | Added `autocomplete: 'email'` to the `email` field, `autocomplete: 'new-password'` to both `password` and `repassword` fields in `formFields` | Tells the browser this is a NEW-account form — the standard signal that suppresses saved-login-credential autofill and instead offers the browser's own password generator |

No changes to `FrmInput.vue`/`FrmPwd.vue`: `VeeForm.vue:134`
(`<component :is="..." v-bind="el" />`) already spreads every extra
`formFields` key onto the field component; `FrmInput.vue`/`FrmPwd.vue`
capture the ones they declare as props and forward the rest via
`useAttrs()` + `v-bind="attrs"` (`FrmInput.vue:44`, `FrmPwd.vue:60`) onto
the real `<input>` — so a plain data key was enough, matching
`SmallestDiff`.

## Command
```
npm run build
```
(from `doctrine/MEMORY.md`; no separate test command for this project)

## Output
```
> resume-vuejs-website@1.9.0 build
> vite build

vite v5.3.2 building for production...
transforming...
✓ 1304 modules transformed.
rendering chunks...
computing gzip size...
...
✓ built in 3.44s
```
Only the pre-existing "chunks are larger than 500 kB" advisory — no
errors, matches every prior node's build output on this branch lineage.

## Manual UI verification (step 7, UI diff — not an automated test)
Re-used the already-running `npm run dev` + port-9888 Chrome debug
session. Via CDP:
1. Navigated to `/login`, read `getAttribute('autocomplete')` on each
   `<input>`: `email` → `"username"`, `password` → `"current-password"`.
2. Clicked the real "Đăng ký" nav link (SPA navigation), read the
   Register page's inputs: `email` → `"email"`, `password` →
   `"new-password"`, `repassword` → `"new-password"`.

Both match the diff exactly — the attributes render on the real DOM, not
just in source.

Could not trigger real Chrome-autofill-suggestion behavior itself in this
session's debug profile (`~/.chrome-debug-profile` has no saved
credentials for this origin — this is a fresh profile launched by
`/open-browser-debugger`, distinct from the operator's real default
Chrome profile mentioned in node `tailwindcss-post-ship-review-fixes`).
The fix is the standard, well-documented `autocomplete` token set
(MDN/Chromium autofill docs: `username`/`current-password` for login,
`email`/`new-password` for account-creation forms) — verified applied
correctly to the real DOM; verifying the resulting autofill *suppression*
end-to-end would require the operator's own saved-password profile,
disclosed here rather than implied as tested.

## Acceptance
| Criterion | Evidence |
|---|---|
| Register/Login forms remain functionally unchanged (no field added/removed, no validation changed) | `git diff --stat`: `PageLogin.vue \| 2 ++`, `PageRegister.vue \| 3 +++` — pure additions, no other lines touched |
| `autocomplete` hints differentiate Login (existing account) from Register (new account) per field | CDP read-back above: `username`/`current-password` on Login vs `email`/`new-password` on Register |
| `npm run build` green | `✓ built in 3.44s`, no errors |
| No `Frm*.vue` component changes needed | `git status --short` shows only `PageLogin.vue`/`PageRegister.vue` (+ this diagram file) changed |

## Noticed, not done
- `FrmInput.vue`/`FrmPwd.vue` also omit a `name` attribute entirely (only
  `id`) — out of scope for this fix (the `autocomplete` attribute alone
  is Chromium's primary signal; `name` matters more for `<form>`-level
  submission, which this app doesn't use since `VeeForm.vue` handles
  submit via `@click` on a `type="button"` button, not native form
  submit). Not fixed here — separate concern, no operator-reported
  symptom tied to it.
- Other auth pages (`PageForgotPassword.vue`, `PageResetPassword.vue`)
  also use `FrmInput.vue`/`FrmPwd.vue` for email/password-like fields but
  were not reported as affected and were not touched, per `SmallestDiff`.

## Seal gate
None — no commit/push/merge in this pass. Merging
`fix/register-login-autofill-autocomplete` → `staging` is a separate,
later `/ship` action requiring operator approval.

## Forbidden states check
- `ADHOC_WORK` — node added to `dev-loop.prime-mermaid.md` (`AppendOnly`,
  end of table) before this note. Clear.
- `NO_EVIDENCE` — this note. Clear.
- `EDIT_UNVERIFIED` — build run and read back verbatim; `autocomplete`
  attributes confirmed on the live DOM via CDP, not inferred. Clear.
- `CODE_IN_HAVEN` — only this note + the diagram row (both `.md`) touched
  under `haven/`/`evidence/`. Clear.
- `DIAGRAM_DRIFT` — diagram row added matching this diff. Clear.
- `MAIN_EDIT` — branch is `fix/register-login-autofill-autocomplete`, cut
  from `origin/staging`, not `main`/`staging` directly. Clear.
