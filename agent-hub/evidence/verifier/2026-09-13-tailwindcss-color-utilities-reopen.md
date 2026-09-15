# 2026-09-13 — tailwindcss-color-utilities — REOPEN

- Worker: verifier
- Node: `tailwindcss-color-utilities`
- New PM status: REOPEN (diagram row left at IN_PROGRESS, unchanged —
  `verify_seal.md` step 11 only updates PM status on SEAL)

## Isolation proof
Spawned as a fresh, isolated subagent whose task description states
verbatim: "you are a fresh, isolated subagent verifying node
`tailwindcss-color-utilities`... A separate implementer session wrote
this diff, not you — NeverVerifyOwnWork satisfied by construction."
This session's first actions were reading `manifest.yaml`/`SOUL.md`/
`recipes/verify_seal.md` fresh, then reading the implementer's evidence
note before touching any diff content — it wrote no part of the diff
under review. `NeverVerifyOwnWork` satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state, not the note's
prose:

1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. **New files, read directly**: `tailwind.config.cjs` and
   `src/styles/tailwind.css` are both untracked (`??` in `git status
   --short`, part of the ongoing uncommitted migration branch). Read
   both in full. `tailwind.css` line 762-820: exactly the 8 claimed
   dormant rules, in a `@layer components` block, matching the note's
   "Design" section byte-for-byte (`.text-primary{color:var(--bs-primary)}`
   … `.bg-body-tertiary{background-color:var(--bs-tertiary-bg)}`).
   `tailwind.config.cjs` safelist: all 8 classes present
   (`text-primary`, `text-success`, `text-info`, `text-warning`,
   `text-danger`, `border-success`, `border-danger`,
   `bg-body-tertiary`), correctly commented with the node name.
3. **Bootstrap `!important` claim, checked myself**:
   `node_modules/bootstrap/dist/css/bootstrap.css` lines 8502-8531
   (`.text-primary`/`.text-success`/`.text-info`/`.text-warning`/
   `.text-danger`), 7555-7573 (`.border-success`/`.border-danger`),
   8871-8874 (`.bg-body-tertiary`) — every one of the 8 real Bootstrap
   utility rules carries `!important` on its color property, exactly
   as claimed. Confirmed by direct `Read`, not grep-snippet-trusting.
4. **`--bs-*` variable scoping, checked myself**: lines 7-8
   (`:root, [data-bs-theme=light] { --bs-primary: #0d6efd; ... }`) and
   the `[data-bs-theme=dark]` block (line ~130-142,
   `--bs-tertiary-bg: #2b3035`) — genuinely root/attribute-scoped, not
   element-scoped. Dark mode stays automatic once activated, as
   claimed.
5. **Cascade-mechanics sanity check**: reasoned through it independently
   — both the new dormant rule and Bootstrap's real rule target the
   same single-class selector (equal specificity, 0,1,0). Per the CSS
   cascade, `!important` is resolved BEFORE specificity/source-order —
   an `!important` declaration always beats a non-`!important`
   declaration of equal (or even lower) specificity regardless of which
   rule appears first or last in the cascade. This is a materially
   different mechanism than the `@layer`-ordering / `.collapse`
   `visibility` analysis from `tailwindcss-navbar-component-system`
   (that one hinged on which block Tailwind buckets into which layer;
   this one hinges on cascade weight, which overrides layer/order
   entirely). The claim holds up as real CSS-spec reasoning, not
   pattern-matched from the prior node.
6. **Build, re-run myself**: `rm -rf dist && npm run build` →
   `✓ built in 4.94s`, only the pre-existing chunk-size warning.
   Matches the note.
7. **Compiled CSS, independently re-derived**: main bundle
   `dist/assets/index-D0tYCbg1.css` (232.70 kB, the large one, not a
   per-route chunk). Wrote my own Python regex script (not reused from
   the note) and located BOTH rules for all 8 classes: the new dormant
   rule at an earlier byte offset (`.text-danger{color:var(--bs-danger)}`
   @38933, from `tailwind.css`) and Bootstrap's real `!important` rule
   later (`.text-danger{--bs-text-opacity: 1;color:rgba(var(--bs-danger-rgb),var(--bs-text-opacity))!important}`
   @88974, from `bootstrap.scss`) — same pattern for all 8 classes
   (`.border-success`/`.border-danger` @38969/@39016 vs @78114/@78453,
   `.bg-body-tertiary` @39061 vs @94616). Both rules coexist; per the
   cascade reasoning in step 5, Bootstrap's `!important` one wins
   regardless of source order — confirmed empirically as well as
   logically.
8. **`text-bg-success-subtle` dead-code claim, checked myself**:
   `grep -n "^\.text-bg-" node_modules/bootstrap/dist/css/bootstrap.css`
   → exactly 8 rules (`primary`/`secondary`/`success`/`info`/`warning`/
   `danger`/`light`/`dark`, all solid, no `-subtle` variant). A direct
   search for `text-bg-.*-subtle` in the compiled Bootstrap CSS returns
   zero matches. Confirmed: `PageHome.vue`'s `text-bg-success-subtle`
   is not a real Bootstrap class, was dead code before this diff and
   remains dead code after it — leaving it untouched was correct, not
   a missed migration item.
9. **`Spinner.vue` claim, checked myself**: `.spinner-border`/
   `.spinner-border-sm` are untouched (a separate loading-animation
   component system, not a color utility) and the note logs this as a
   new, separate follow-up rather than silently dropping it. Confirmed.
10. **Lint, re-run myself**: `npm run lint` → exit 0, zero output
    beyond the npm command header. Matches the note's "exit 0, clean"
    claim.
11. **Test, re-run myself**: `npm run test` → `Test Files 16 passed
    (16)`, `Tests 111 passed (111)` — full green, no flaky
    `VeeForm.spec.ts` failures this run (within the documented
    108-111/111 band, no failures outside that file either way).
12. **Forbidden states** (all 6 checked): `ADHOC_WORK` clear (node
    exists on `dev-loop.prime-mermaid.md` at IN_PROGRESS, row 176,
    appended directly after the prior SEALED row 174, no reordering).
    `NO_EVIDENCE` clear (implementer note exists, read first).
    `EDIT_UNVERIFIED` clear (every claim above independently re-run,
    not inferred). `CODE_IN_HAVEN` clear (`find agent-hub/haven -name
    "*.vue" -o -name "*.ts" -o -name "*.js" -o -name "*.sh"` → zero
    matches). `DIAGRAM_DRIFT` — not applicable to REOPEN (status stays
    IN_PROGRESS, correctly not advanced). `MAIN_EDIT` clear (branch
    confirmed `feature/tailwindcss-setup`).
13. **Seal gate**: no outward-facing action in this diff (no
    commit/push/merge) — nothing to gate.

## Missing — REOPEN reason
Re-ran the survey grep myself per the task's explicit instruction to
check the note's claimed "~20 usages across 14 files" for accuracy.
Used both `class="..."` attribute form (no leading-dot requirement)
and Pug dot-chain form, across all 8 class names:

```
for cls in text-primary text-success text-info text-warning text-danger \
           border-success border-danger bg-body-tertiary; do
  grep -rlE "(class=\"[^\"]*\b${cls}\b[^\"]*\"|:class=\"[^\"]*\b${cls}\b|\.${cls}\b)" src/
done
```

This independently found **20 distinct consumer files** (deduplicated
across all 8 classes) and **27 file-level class occurrences** (sum
across classes, before dedup) — not "~20 usages across 14 files" as the
note's headline states. The 20 files are: `ItemTemplate.vue`,
`GroupTags.vue`, `Navbar.vue`, `Spinner.vue`, `FrmArray.vue`,
`FrmCkediter.vue`, `FrmCurrency.vue`, `FrmDate.vue`, `FrmDatePicker.vue`,
`FrmInput.vue`, `FrmPwd.vue`, `FrmSelect.vue`, `FrmTextArea.vue`,
`VeeFormGeneralInformationUpdate.vue`, `Header.vue`,
`LayoutDefault.vue`, `PageResetPassword.vue`, `PageAccountSettings.vue`,
`PageGeneralInformation.vue`, `PageReference.vue`. Spot-checked several
(`FrmDate.vue:55`, `ItemTemplate.vue:62`, `PageGeneralInformation.vue:161`,
`LayoutDefault.vue:63`, `Navbar.vue:34`, `Header.vue:69/88/105/111`) —
all real usages, not comments or dead code.

Critically, the note's **own per-class breakdown** (the itemized list
under "Survey"), when actually enumerated file-by-file, already lists
all 20 of these files correctly — nothing was missed by the underlying
survey. The defect is narrower but still real: the note's summary
headline ("~20 usages across 14 files") does not match its own
itemized list or the independently re-run grep, undercounting files by
6 (14 vs 20) and usages by roughly 7-25% depending on which of "20" or
"27" is the intended metric. A second, smaller instance of the same
class of error: the note says "6 of the `Frm*.vue` partials" but then
names 9 distinct files in the same sentence — independently confirmed
all 9 named files (`FrmCurrency`/`FrmArray`/`FrmDatePicker`/
`FrmCkediter`/`FrmSelect`/`FrmPwd`/`FrmInput`/`FrmTextArea`/`FrmDate`)
do carry `.text-danger`, and `FrmCheckbox.vue` (the 10th partial) does
not — so the file list is right, but "6 of" should read "9 of".

This is a REOPEN on evidence-accuracy grounds, matching the standing
precedent set by this same node series
(`2026-09-13-tailwindcss-remaining-utilities-sweep-reopen.md`, which
REOPENed for an analogous prose-vs-actual-file mismatch): the note
asserts a specific, checkable count that direct independent
re-derivation disproves. The underlying technical decision (add 8
dormant `@layer components` rules, zero consumer-file edits, safelist
all 8 classes) is functionally sound either way — the "14 files"
number never gates any code correctness — but per `EvidenceOnly` and
this hub's established bar for evidence notes, a citable factual
mismatch in the note's own headline claim is enough to withhold SEAL.

Fix needed before re-submitting: correct the "Survey" section's
headline to state the accurate count (20 distinct files / 27 file-level
occurrences, or restate "usages" to mean something the note defines
precisely) and correct "6 of the `Frm*.vue` partials" to "9 of the
`Frm*.vue` partials". No code change required — this is a note-text-only
fix.

## Re-run
`full` — reason: this class of change (new CSS added to a shared
`@layer components` stylesheet + a safelist change + a cross-cutting
survey claim spanning 14-20 files) matches this hub's established
pattern (nodes 6, 9, 11, 12) for needing independent re-run, not just
an audit — especially since the task explicitly asked for a from-scratch
compiled-CSS byte-offset check and a from-scratch survey re-grep. Ran:
`rm -rf dist && npm run build`, `npm run lint`, `npm run test`, plus an
independent Python regex sweep of the compiled CSS bundle, fresh
Bootstrap-source reads (`bootstrap.css` for `!important` rules and
`--bs-*` variable scoping), and a from-scratch 8-class survey grep —
all from scratch in this session, not reused from the note.

## Hub bytes
before=179179 (from node 12's verifier SEAL note's `hub_bytes_after`,
as stated in the implementer's note) · after=182857 (measured via the
`/hub-tokens` methodology, same 5 categories: root=12393,
doctrine=27207, active diagram=117140 (grew from this node's own
detailed IN_PROGRESS row being added since node 12's SEAL snapshot),
implementer bundle=14963, verifier bundle=11154 — no change to
recipe/manifest/SOUL this pass; diagram status left at IN_PROGRESS per
REOPEN, not advanced).
