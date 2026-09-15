# 2026-09-14 — tailwindcss-post-ship-review-fixes

- Worker: implementer
- Node: `tailwindcss-post-ship-review-fixes`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 17. After node 16 (`tailwindcss-bootstrap-removal`) sealed, the
operator asked to inspect the real dashboard before `/ship` — first via
a self-created test account, then via a real Chrome instance with
remote debugging enabled (`/open-browser-debugger`) logged in with the
operator's own real account (Chrome's saved-password autofill). This is
exactly the disclosed residual-risk category from every CSS node this
session ("no live browser available") — real visual QA surfaced 2 real
bugs plus 1 UX request, all fixed here before shipping.

## Finding 1 (operator-reported): login page header misaligned
Operator: "page login, header bị lệch" (header is off/misaligned).

**Root cause, found via CDP bounding-box inspection**: `Navbar.vue` (the
unauthenticated-header component, self-contained mobile-collapse
rewrite from node `tailwindcss-dropdown-toast-navbar`) nests `.container`
INSIDE `.navbar`:
```html
<nav class="navbar navbar-expand-lg ...">
  <div class="container">
    <a class="navbar-brand">...</a>
    <button class="navbar-toggler">...</button>
    <div class="navbar-collapse">...</div>
  </div>
</nav>
```
Node `tailwindcss-navbar-component-system`'s `.navbar` rule
(`display:flex; justify-content:space-between; ...`) only lays out
`.navbar`'s DIRECT children. Since `.container`'s own base rule (node
`tailwindcss-grid-system`: `width:100%; margin:auto`) is NOT flex, and
`.navbar` here has exactly ONE direct child (`.container`), the
`justify-content:space-between` had nothing to distribute — the
brand/toggler/collapse inside `.container` fell back to normal
block/inline flow instead. Confirmed via
`getBoundingClientRect()`: at a 375px mobile viewport, the hamburger
toggler sat at x=148 (right next to the 120px-wide brand) instead of
being pushed to the far right edge — 171px of dead space on the right.

Bootstrap's real `_navbar.scss` (re-checked) handles exactly this case:
it flex-ifies `.navbar` itself AND separately extends a
`%container-flex-properties` placeholder onto `.navbar > .container` /
`.navbar > .container-fluid` specifically, for exactly this nested
scenario. Node 12's original build only reproduced the first half.

This bug did NOT affect the AUTHENTICATED header (`Header.vue`'s
`v-else` branch) — there, `.container` wraps `.navbar` from the
OUTSIDE, so `.navbar` itself already receives its real flex children
directly. That's why every prior node's static verification (compiled-
CSS checks, the harness page, even the CDP session logged into the
authenticated dashboard) never caught this — the authenticated path was
never actually exercising the broken code path. Only the unauthenticated
header (login/register/forgot-password/reset-password) was affected,
which is exactly where the operator was looking when they reported it.

**Fix**: added the missing rule to `src/styles/tailwind.css`:
```css
.navbar > .container {
    display: flex;
    flex-wrap: inherit;
    align-items: center;
    justify-content: space-between;
}
```
`flex-wrap: inherit` (not a hardcoded value) matches Bootstrap's real
placeholder exactly, so it correctly picks up `.navbar-expand-lg`'s
`flex-wrap: nowrap` override at ≥992px without needing a separate rule.

## Finding 2 (operator-reported): input autofill color wrong in dark mode
Operator: "chỉnh màu input cho phù hợp với dark theme" (fix input color
for dark theme).

**Root cause, found via computed-style inspection**: Chrome's own
saved-password autofill (the operator's real, saved `votan.it@gmail.com`
credential) forces a browser-native background color
(`rgb(232, 240, 254)`, a light blue) onto `<input>` elements via the
`:-webkit-autofill` UA pseudo-class — this is standard browser
behavior, not something a plain `background-color` declaration on
`.form-control` can override (browsers apply autofill styling with
higher cascade precedence than ordinary author-CSS background/color).
Confirmed via `getComputedStyle(...).backgroundColor` on the real
autofilled input in the operator's actual browser: `rgb(232, 240, 254)`
in dark mode, clashing badly against the near-black `.auth-card`.

**Fix**: added the standard `:-webkit-autofill` override trick to
`.form-control` in `tailwind.css` — an inset `box-shadow` sized to fully
cover the input (authors CAN override the shadow, just not the
background directly), tinted to `var(--bs-body-bg)` so it tracks the
current theme automatically; `-webkit-text-fill-color` to fix the typed
text color the same way; and a very long `transition-delay` on
`background-color` so Chrome's own flash-then-fade autofill animation
never gets a chance to render before this rule applies.

**Verified in both themes, on the operator's real browser via CDP**:
```
getComputedStyle(emailInput).backgroundColor
  dark:  rgb(33, 37, 41)   ==  #212529 == --bs-body-bg (dark)
  light: rgb(255, 255, 255) ==  #ffffff == --bs-body-bg (light)
```
Both now correctly track the theme instead of Chrome's fixed autofill
blue.

## Finding 3 (operator UX request, not a bug): Login button + "Quên mật khẩu?" same row
Operator: "đưa Quên Mật Khẩu và button Login lên cùng 1 hàng" (put
"Forgot password" and the Login button on the same row).

Previously `PageLogin.vue` rendered `<RouterLink to="/forgot-password">`
as a separate element BELOW `<VeeForm>` entirely (its own block, `mt-
[1rem]`), while the Login button lived inside `VeeForm`'s own `.footer`
flex row. Fixed by moving the link into `VeeForm`'s existing `#button`
slot (the same extension point every CRUD page's Modal already uses for
its own "Đóng" button — confirmed via grep, an established pattern, not
a new one), with `ms-auto self-center` to push it to the right end of
the same flex row as the Login button:
```html
<VeeForm :fields="formFields" :submit-fn="_handleLogin" :submit-text="'Login'">
    <template #button>
        <RouterLink to="/forgot-password" class="ms-auto self-center text-sm">Quên mật khẩu?</RouterLink>
    </template>
</VeeForm>
```

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 3.47s`, only the
   pre-existing chunk-size warning.
2. `npm run lint` → exit 0, clean.
3. `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
   (111)` (all previously-flaky `VeeForm.spec.ts` tests passed this
   run too — documented flakiness, not related to this diff).
4. Compiled CSS confirmed via direct string search:
   `.navbar>.container{display:flex;flex-wrap:inherit;align-items:center;justify-content:space-between}`
   and the `:-webkit-autofill` rule block, both present verbatim.
5. **Re-verified live on the operator's real browser** (CDP, remote
   debugging port 9888, the operator's actual logged-in session) after
   each fix:
   - Navbar: re-inspected `.navbar-toggler`'s bounding box at 375px width
     after the fix — now flush against the right edge (space-between
     working). Screenshot comparison before/after confirms the visual
     fix.
   - Autofill: re-measured `getComputedStyle` background color in both
     themes (see Finding 2) — matches theme tokens exactly, not
     Chrome's fixed autofill blue.
   - Login row: screenshot confirms "Quên mật khẩu?" now sits to the
     right of the Login button on the same row, both themes.
6. Forbidden states: branch = `feature/tailwindcss-setup` (`MAIN_EDIT`
   clear). Node added to `dev-loop.prime-mermaid.md` before this note
   (`ADHOC_WORK` clear). This note exists (`NO_EVIDENCE` clear). No
   `.vue`/`.js`/`.ts` under `haven/` (`CODE_IN_HAVEN` clear).
   `EDIT_UNVERIFIED` avoided — every claim actually run and read back,
   including live re-verification on a real browser, not simulated.

## Why this wasn't caught earlier, disclosed
Both real bugs (Findings 1 and 2) are exactly the category of gap every
CSS node since node 4 explicitly disclosed as a residual risk: no live
browser was available for most of this session, so verification relied
on compiled-CSS presence checks and a hand-built static harness page
(used successfully for Modal/Toast/Table/etc. in node 15's write-up).
Neither of those methods could have caught Finding 1 (a real *layout*
bug, only visible with actual flex computation across nested real
elements at a specific viewport width) or Finding 2 (browser-native
autofill styling, which doesn't exist in a hand-built static harness at
all, and requires a REAL saved password to trigger). This is precisely
why the operator's insistence on real-browser QA before shipping was
correct and valuable — both bugs are now fixed and confirmed on the
same real browser/account where they were found.

## Hub bytes
before=203007 (from node 16's verifier SEAL note's `hub_bytes_after`) ·
after not yet measured — verifier to measure at SEAL/REOPEN time.
