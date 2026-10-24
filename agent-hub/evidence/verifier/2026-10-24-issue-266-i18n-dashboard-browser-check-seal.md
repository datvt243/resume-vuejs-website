# 2026-10-24 - issue-266-i18n-dashboard-browser-check - SEAL

- Worker: verifier (v0.1.0)
- Node: `issue-266-i18n-dashboard-browser-check` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS → SEALED, row updated in place)
- Evidence reviewed: `evidence/implementer/2026-10-24-issue-266-i18n-dashboard-browser-check.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh Agent-tool subagent by the implementer session via `/todo #266`, with the task string `verifier "agent-hub/evidence/implementer/2026-10-24-issue-266-i18n-dashboard-browser-check.md"` and a brief stating "You did NOT write the diff under review". This context has no implementer history; the diff was not opened (EvidenceOnly).

## Re-run
none (audit only). Note output is verbatim, commands match `doctrine/MEMORY.md`, no outward-facing action, no PROJECT.md re-run trigger.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint` from repo root; `Typecheck: CANNOT RUN — pending add-typecheck-script` stated. OK |
| Output not truncated | Verbatim summary lines (`Tests 1 failed \| 275 passed (276)`, `✓ built in 4.16s`, lint clean, per-spec counts). OK |
| Branch (NoMainEdit) | `fix/266-i18n-audit`, from `staging` via `gh issue develop`. OK |
| Seal gate | No commit/push/API write. Login POST + GETs with the test account only, no save; same kind of logged-in check accepted in prior seals and explicitly requested by the #278 REOPEN. OK |
| Proportionality | Two fixes are leftover untranslated UI text found by the audit the issue asks for. Datepicker locale, CKEditor placeholder, a11y name, Intl formatting listed under "Noticed, not done". OK |
| Comments per code-comments.md | "No comments added or changed". OK |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| Re-audit for leftover hardcoded VI strings | Same grep, 39 lines, each group classified out of scope. OK |
| Logged-in VI/EN browser pass (#278 REOPEN Missing 1) | PageEducation: form, labels, placeholders, two validation errors (`required`, `maxChars` "Maximum 50 characters"), a `withEnglish` "Description (English)" label, discard dialog, recorded VI then EN. PageExperience: chooser + all career-break options, EN then VI. PageGeneralInformation: labels, select options, both table headers in EN. PageHome: completion labels VI → EN. All 16 routes swept in EN for raw keys / VI text and in VI for leftover English. OK |
| Leftover text found fixed | Bug 1 `TableDefault` select cell raw key: spec fails without fix (`+ "option.languageLevel.basic"`), passes with it, both locales. Bug 2 footer: spec + observed live on dev server VI/EN with href unchanged. OK |
| `vi`/`en` key parity | `src/i18n` parity + used-key spec passes (`5 passed`). OK |
| No regressions | Single known VeeForm failure reproduced on baseline `staging`; one extra VeeForm failure shown to be a flake (passes 3 isolated + 2 full runs, file imports neither changed file). Build green, lint clean. OK |

### Deviations from the Missing list, accepted
- Ran on the live site, not `npm run dev`: justified (no local API; CORS rejects a second localhost port), and `git diff origin/main origin/staging -- src` empty means the same pre-fix `src`.
- `withEnglish` label and `maxChars` message were seen on PageEducation, not PageGeneralInformation. They go through the same `Frm*`/`tr`/`withParams` path, and the Missing item's aim was to see that path in a browser. The EN raw-key sweep also covered PageGeneralInformation's labels.
- No table/pager on PageEducation (card list). Table headers were seen on PageGeneralInformation; the pager text was not named, but the raw-key sweep over all routes found no pager keys.
- `TableDefault` fix not seen in a browser (live site lacks it, no local login). It has a fail-before/pass-after spec, which `edit-verification.md` accepts for tested parts.

## Forbidden states
None hit: ADHOC_WORK (node exists), NO_EVIDENCE (note present), EDIT_UNVERIFIED (every claim run and read back), CODE_IN_HAVEN (none), DIAGRAM_DRIFT (row now SEALED), MAIN_EDIT (non-main branch).

## Old node `issue-266-i18n-phase2-4-remaining`
Stays **IN_PROGRESS**, row left verbatim. LAI-13 forbids demoting it, and SEALing it would need its own verifier verdict on its own note. The diagram's rule for an unfinished row closed by a later node (see `github-status-sync-20261006`) is to leave the old row as it is and record that it is superseded. This SEAL closes the gap from its REOPEN, and the new row now says it supersedes the old one.
