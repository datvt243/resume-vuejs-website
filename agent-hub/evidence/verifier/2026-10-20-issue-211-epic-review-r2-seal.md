# 2026-10-20 - issue-211-epic-review (round 2) - SEAL

- Worker: verifier 0.1.0
- Node: `issue-211-epic-review` (`haven/diagrams/dev-loop.prime-mermaid.md`). PM status `IN_PROGRESS` → `SEALED`, row updated in place.
- Evidence note: `evidence/implementer/2026-10-20-issue-211-epic-review.md`, sections "REOPEN round 1 → round 2" (both).
- Previous verdict: `evidence/verifier/2026-10-20-issue-211-epic-review-reopen.md`.
- Branch: `feature/issue-211-epic-review` (named in the note, confirmed with `git branch --show-current`). No `MAIN_EDIT`.

## Isolation proof
Fresh Agent-tool subagent spawned by the implementer session after it updated the evidence note for round 2; no shared context. The spawn prompt was the round-2 verifier task string ("You are a fresh verifier subagent ... This is REOPEN round 2 ..."). This context wrote no part of the diff.

## Verdict: SEAL
`forbidden_hit: null`. All three items from the round-1 REOPEN now have citable evidence.

| Round-1 ask | Evidence (checked myself) |
|---|---|
| §10 screenshots at 1440 light, 1440 dark and 375 dark: Header user menu (open and closed), GroupTags, skill-delete Swal | I opened the PNGs in `evidence/implementer/2026-10-20-issue-211-shots/`. The `after-*` set is complete: 6 shots per viewport, 18 in all. User menu: the split seam renders as one line, the caret is a square 28×28 and not clipped, and the menu anchors right under the caret at all 3 sizes. It looks the same light and dark. GroupTags tags are neutral §5.6 chips, not the gray Bootstrap pills. Swal: `Hủy` (secondary) comes before `Xóa` (danger), the placeholder is `Nhập "delete"`, and nothing overflows at 375. `after-report.json` matches what the note says: menu h 28 with radii `6px 0 0 6px` / `0 6px 6px 0`, border `line-strong`; add button 32×32; tag h 20. |
| Keyboard focus ring on the GroupTags add button | In `after-{1440-light,1440-dark,375-dark}-grouptags-focus.png` the 2px ring is visible on all 4 sides, and the input does not cover it. `after-report.json` focus: `outline: solid 2px`, `z: 10`, `focusVisible: true`. I re-built, and `.focus-visible\:z-10` is in the compiled CSS. The fix is one class (`relative focus-visible:z-10`) plus a one-line comment that says WHY, which follows code-comments.md. |
| Diagram row says 4 `--bs-*` vars | The row now says "4 unused `--bs-*` bridge vars". |

Round-1 checks (a)–(c), presentation-only, Typecheck CANNOT RUN stated, and the comments row all still hold. The only code change since round 1 is the GroupTags class and its comment. It is proportionate.

## Note inaccuracies (recorded, not blocking)
- The 3 `before-*-grouptags-focus.png` files are **blank** (solid background, no element in view). The note lists `*-grouptags-focus` for both sets and does not say this. These shots are not needed for the verdict. The ask was the focus ring on the new code, and `before-report.json` records the before focus state anyway (`outline: auto 1px`, `z: 5`).
- The note says the before user-menu border was `rgb(161,161,170)`. `before-report.json` says that is true only in dark mode. In light mode it was `rgb(82,82,91)`.
- There is no `before-*-swal`. The note says so and explains why (see the incident).

## Incident judgment (production tags removed)
- **Honest and complete (NoSilentFailure): yes.** The note names the mechanism: the `button[aria-label^="Xóa"]` prefix selector also matched GroupTags' `Xóa thẻ …` buttons, and `removeTag` PATCHes straight away with no confirm. It also gives the scope (5 tags: CI/CD, VCS, Database plus 2 unknown), the limits on recovery (request bodies are not logged), the stop, the escalation as a seal-gate matter, and the operator's answer (backup, the operator restores and re-tests CRUD). The screenshots back up the timeline on their own. `before-1440-light-grouptags.png` shows CI/CD, VCS and Database. `before-1440-dark-grouptags.png` shows VCS and Database. `before-375-dark-grouptags.png` shows only Database. That is one tag lost per viewport iteration in run 3, exactly as the note says. One clarification for readers: the `before-*` set in the shots folder **is the output of that destructive run 3**. The note says this only through the `before-1440-light-grouptags.png` reference.
- **Later runs guarded: yes, as far as the evidence goes.** `after-report.json` ends with `"blockedWrites": []`. The after run went to `:5173` against `VITE_API_URL=http://localhost:3001/`, not production. The delete target was the exact injected row label, and every confirm was cancelled. Limitation: the CDP capture script was in the implementer's scratchpad and is not in the evidence. So "the guard was active" rests on the script's own report, not on code I read.
- **Effect on the code verdict: none.** The data loss came from a capture-script selector bug, not from the diff. It was still an unapproved real API write, which breaches the seal gate during evidence gathering. It was accidental, it stopped, it was escalated and it is recorded. It is not one of the 6 forbidden states, and it does not touch the shipped code. Process lesson for future capture passes: install the write guard **before** the first run against any account, not after.
- Not part of this diff, but the incident brought it to light: a GroupTags tag remove saves immediately with no confirm or undo. One misclick loses data. Worth its own issue.

## Noticed in the screenshots (not introduced here, need their own issues)
- Dark mode `Xóa` danger button: white text on `rgb(248,113,113)`, about 2.8:1. That breaks the §8 rule of 4.5:1 or more. The note already flags this. The old code used the same `bg-danger` fill, so this diff did not cause it.
- Dark mode Swal input: the placeholder `Nhập "delete"` renders at nearly full foreground contrast and looks like typed text (compare `after-1440-dark-swal.png` with the light one). `sweetalert2.scss` (`$swal2-input-color: inherit`) is unchanged by this diff.
- The Swal title and html still spell `xoá`, while the buttons now say `Xóa`. This is a minor copy inconsistency.

## Re-run
`full`. The operator directed it ("Re-run what your recipe requires": test, lint, build). That is not one of the 3 standard exceptions. It is an independent confirmation the operator asked for.
- `npm run test`: `Test Files 1 failed | 37 passed (38)`, `Tests 1 failed | 248 passed (249)`. The only failure is `× VeeForm > VI | EN toggle > flags the hidden language that has a validation error`, the known flaky baseline (confirmed pre-existing in round 1 with the diff stashed).
- `npm run lint`: exit 0.
- `npm run build`: `✓ built in 3.65s`. Compiled CSS has `.btn` 0, `.badge` 0, `.alert` 0, and `.focus-visible\:z-10` 1.
- Typecheck: CANNOT RUN (doctrine/MEMORY.md).
- To attribute the screenshot findings above, I read the `GroupTags.vue` and `VeeFormGeneralInformationUpdate.vue` diffs and `sweetalert2.scss`. That was attribution only, not a substitute for the note.

## Seal gate
This pass made no outward action: no commit, push, issue edit or API call. Ship through `/ship`, which is the operator's approval step.
