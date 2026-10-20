# 2026-10-20 - issue-251-header-language-switch - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-251-header-language-switch` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Evidence under review: `evidence/implementer/2026-10-20-issue-251-header-language-switch.md`

## Verdict: SEAL

## Isolation proof
This pass was spawned as a fresh subagent whose task string began "You are a fresh, isolated verifier subagent ... You did NOT write the diff under review — a separate implementer session did", and invoked `/worker verifier "#251 ... evidence note: agent-hub/evidence/implementer/2026-10-20-issue-251-header-language-switch.md ..."`. This context holds no implementer turns; it read only the evidence note, not the diff.

## Re-run
none — audit-only. Not outward-facing (no commit/push/API write), no `/release` gate, and the note's outputs are cited per command.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint` from repo root; `Typecheck: CANNOT RUN — pending add-typecheck-script` stated explicitly. Match. |
| Output not truncated/hidden | Summary lines quoted per command (vitest counts, `✓ built in 3.75s`, lint no errors). No `...`/"truncated". |
| Branch (`NoMainEdit`) | `feature/issue-251-header-language-switch`, cut from `staging` @ `f4edb61`. Not main/staging. |
| Seal gate | No outward-facing action; commit/PR left to `/ship`. |
| Proportionality | New dep `vue-i18n` and header+sidebar-only translation match the operator's recorded scope choice ("Switch + CV + i18n setup"). Removing the per-page CV selectors follows from "đưa EN/VI lên header" (move to header). Header download link now passing `lang` is part of "switch controls CV language". `yarn.lock` reverted, not opportunistically fixed. |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| VI \| EN switch in header | Browser radios `VI:true,EN:false` → `VI:false,EN:true`; screenshots 375/1440. |
| Switch controls CV language | Preview summary text changed on header click; download href `lang=en`; `localStorage.cvLang: "en"`. |
| Switch controls UI language (vue-i18n) | Sidebar/header switched to English; `src/i18n/index.spec.ts` passes (`Experience`/`Kinh nghiệm`, `<html lang>`). |
| Shared state header ↔ pages | `useCvLang.spec.ts` "every caller shares one value" passes (6 tests); preview updated live. |
| Rest of screens out of scope | Only `header.*`/`nav.*` keys; follow-ups noted. |
| No horizontal scroll at 375px | `docScroll: 375, headerScroll: 375, viewport: 375`. |
| Build green | `✓ built in 3.75s`. |
| No new test failures | `252 passed, 1 failed`; the failure is `VeeForm.spec.ts:287`, documented as failing 3/3 on base in `evidence/implementer/2026-10-20-issue-249-experience-unsaved-warning.md` (lines 42-45) — confirmed pre-existing. |
| Comments per code-comments.md | Note lists the new comments (one-line whys, file description), no `(#N)` refs. |

## Forbidden states
`ADHOC_WORK` no (node on diagram, worker pass) · `NO_EVIDENCE` no · `EDIT_UNVERIFIED` no (all claims have read-back output; typecheck declared CANNOT RUN) · `CODE_IN_HAVEN` no · `DIAGRAM_DRIFT` no (PM row now SEALED) · `MAIN_EDIT` no.

## Missing
None.

## Carried forward (not blocking)
- Follow-up issues for translating remaining screens not yet filed.
- `yarn.lock` lacks `vue-i18n` (CI uses `npm ci`).
- `VeeForm.spec.ts:287` still failing on `staging`.

## PM status
`issue-251-header-language-switch`: IN_PROGRESS → SEALED (row updated in place).
