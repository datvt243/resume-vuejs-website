# 2026-11-05 — issue-405-cv-filename — REOPEN (round 3)

- Worker: verifier · Version: 0.1.0
- Node: `issue-405-cv-filename`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-405-cv-filename-plan.md` (whole note, focus on `## Round 3 — after REOPEN-2`) + the 4 cited screenshots in `evidence/implementer/2026-11-05/issue-405-shots/`
- Previous verdicts: `...-reopen.md`, `...-reopen-2.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched for a third verifier pass with the task "This is the third verifier pass ... round 2's open items: web-design-guidelines pass not run; screenshot paths + an error-state shot not cited ... you may view them" and skill args `verifier "issue-405-cv-filename — evidence note: ... (see '## Round 3 — after REOPEN-2' at the bottom)"`. No memory of writing any diff round.

## Verdict: REOPEN

## Reason
**The cited 1440 light screenshot is the dark one.** `shasum` gives
`settings-cvname-1440-light.png` = `settings-cvname-1440-dark.png` =
`37abbcbc951786607ff7e522d640855775894482` (both 896x169). Viewed, both show a
dark background. The note says the light shot shows "empty input with example
placeholder ... no clip", but no light-theme shot of the default state exists.
The only light shot is the error state (`settings-cvname-1440-light-error.png`,
which is fine). So the §10 "1440 light" item cites evidence that is not what it
says it is (`EvidenceOnly`).

Fix: retake `settings-cvname-1440-light.png` in light theme (default state, placeholder visible), check that its `shasum` differs from the dark shot, and cite it in a round-4 line.

## Cited (OK)
- Round-2 reason 1 (web-design-guidelines) is resolved. The WIG pass is cited per line (`PageAccountSettings.vue:39/41/42`). Placeholder (example + `…`) and `spellcheck=false` are fixed. autocomplete, label/for, focus and inline error pass. The shared-component gaps (`name=""`, submit disabled on invalid) are listed under Noticed with a reason (shared VeeForm, out of scope). Acceptable.
- Round-2 reason 2 is partly resolved. Paths and a one-line description are given for each shot. Viewed and match the note: `-1440-dark` (dark, placeholder, Hủy + Lưu thay đổi), `-375-dark` (stacked, full-width input, no overflow), and `-1440-light-error` (`a/b`, red border, inline yup message, save disabled). Only `-1440-light` fails, as above.
- Round 3 commands match doctrine: test `Tests  357 passed (357)`, lint exit 0, build `✓ built in 6.94s`, typecheck 81 (baseline 90), 0 errors in touched files. Output not cut.
- Round-3 i18n: `account.cvFileNamePlaceholder` in vi and en. No forbidden vue-i18n chars.
- Original criteria: still covered by round-1 live checks 2–5 and the 5-test spec (unchanged; see the earlier verdicts). Comments row OK.
- Branch `feature/issue-405-cv-filename`, so no MAIN_EDIT. Supersedes and Still open: none. Seal gate: no commit or push. QA account write restored to ''.
- Proportionality: the round-3 diff is 2 field-config props plus 1 i18n key per locale. Minimal.

## Missing
- A real 1440 light screenshot of the default state (the current file is byte-identical to the dark one).

## Forbidden hit
none (sealing as-is would be `EDIT_UNVERIFIED` on §10 "1440 light")

## Re-run
partial — no build/test/lint re-run. Ran `shasum`/`file` on the 4 cited screenshots and viewed them, because round 2 REOPENed specifically on screenshot evidence.

## PM status
Not changed (REOPEN). Added a round-3 REOPEN pointer to the row.
