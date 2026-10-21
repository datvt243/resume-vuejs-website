# 2026-10-21 - issue-266-i18n-phase2-4-remaining - REOPEN

- Worker: verifier (v0.1.0)
- Node: `issue-266-i18n-phase2-4-remaining` (`haven/diagrams/dev-loop.prime-mermaid.md`, left IN_PROGRESS)
- Evidence reviewed: `evidence/implementer/2026-10-21-issue-266-i18n-phase2-4-remaining.md`
- Verdict: **REOPEN**

## Isolation proof
Spawned as a fresh subagent with the task string "verifier \"agent-hub/evidence/implementer/2026-10-21-issue-266-i18n-phase2-4-remaining.md\"" plus an operator brief stating "You were launched as a separate subagent specifically to verify". This context has no implementer history and did not write the diff; the diff was not opened (EvidenceOnly).

## Re-run
none (audit only). REOPEN is decided off the note's own gap; per "Re-run scope", a note missing evidence is reopened, not repaired by the verifier.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run lint`, `npm run build` from repo root; Typecheck declared CANNOT RUN. OK |
| Output not truncated | Verbatim summary lines (`Tests 1 failed \| 270 passed (271)`, `✓ built in 3.64s`, lint clean). OK |
| Branch (NoMainEdit) | `fix/issue-266-i18n-remaining-text`, cut from `staging` `e5984fe`. OK |
| Seal gate | No commit/push/API write. N/A |
| Proportionality | Wording fixes (award label copy-paste, `.min(0)` message, ignored `yup.number('…')` messages) are side effects of moving those strings, in scope. `.claude/CLAUDE.md` line update matches the finished phases. Dead `Navbar.vue`/`FrmArray.vue` left alone. OK |
| Comments per code-comments.md | Row present, cites JSDoc on `withParams`/`tr` and one-line whys, no issue refs. OK |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| Remaining hardcoded VI UI text moved | Audit 476 -> 39, remainder classified out of scope. OK |
| Both `vi` and `en` have every key | New parity + used-key spec passes. OK |
| No regressions | Same single known VeeForm failure as baseline; lint clean; build green. OK |
| **Text follows the header VI/EN switch** | **MISSING for the un-specced dashboard pages.** Observed only on the public 404 page, `#/register`, and spec-mounted pages (Visits, ImportLinkedin, AtsCheck, Application, Preview). The note itself says: "Not manually checked: every dashboard page (`/dashboard/*`, home)". That leaves PageEducation, PageExperience, PageProject, PageAward, PageCertificate, PageReference, PageInformation, PageGeneralInformation, PageProfile, PageAccountSettings and PageHome with no observed EN/VI rendering, and those pages are where the new runtime-only mechanisms land: model labels/options as keys through `tr`, `withParams` in yup messages and `withEnglish` labels, career-break option getters, TableDefault `tr(label)` headers and pager. "Templates use `$t`" is reasoning, not observation (`doctrine/standards/edit-verification.md`: changed parts without tests need a manual `npm run dev` check). |

## Forbidden states
`EDIT_UNVERIFIED` (partial): the "follows the switch" claim is made for pages whose rendering was not run and read back. No other state hit (branch named, evidence present, diagram row exists, no code in haven).

## Missing (to SEAL on the next pass)
1. Logged-in Playwright pass on `npm run dev`: for at least PageEducation (form open + one validation error + table headers/pager), PageExperience (career-break select options), PageGeneralInformation (a `withEnglish` "(English)" label and a `validation.maxChars` message) and PageHome (profile-completion labels), record the VI reading, switch the header to EN, record the EN reading. Spot-read the rest of the listed pages in EN for leftover raw keys (`field.*`, `option.*`, `x::{...}`).
2. If no test account is available, the operator supplies one or performs the click-through and the note records their observation.
