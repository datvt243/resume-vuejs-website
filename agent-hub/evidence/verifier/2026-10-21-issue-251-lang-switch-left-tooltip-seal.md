# 2026-10-21 - issue-251-lang-switch-left-tooltip - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-251-lang-switch-left-tooltip` in `haven/diagrams/dev-loop.prime-mermaid.md` (row updated in place IN_PROGRESS → SEALED)
- Evidence reviewed: `evidence/implementer/2026-10-20-issue-251-lang-switch-left-tooltip.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh verifier subagent with the task string "#251 follow-up: move VI/EN switch to header left with info tooltip about CV language — evidence note: agent-hub/evidence/implementer/2026-10-20-issue-251-lang-switch-left-tooltip.md (node issue-251-lang-switch-left-tooltip, branch feature/issue-251-header-language-switch)". It started with no implementer context and did not write any part of the diff. The pass was interrupted by a usage limit and resumed in the same subagent. Before writing anything I checked that no verdict note, log line or diagram change for this node already existed.

## Re-run
partial: one browser check (Playwright, dev server on :5173, 1440px). The note's 1440 hover observation was made on the first tooltip version (`invisible`, "visibility hidden"). The tooltip was then changed to `hidden` + `peer-hover:block` during the 375px attempts, so the note had no hover evidence for the final markup. Result on the final markup: tooltip `display:none` with no hover; with the pointer on the info icon, `display:block`, rect left 264 / right 520 / top 47.5, `docScroll 1440`, en text "Applies to both the interface and your CV language: the preview, the public CV link and the downloaded PDF." No build or test re-run.

## Checks
| Check | Result |
|---|---|
| Self-grading | Not my diff. |
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint` from repo root, plus a targeted `npx vitest run …`. The note says `Typecheck: CANNOT RUN — pending add-typecheck-script`. These match doctrine. |
| Output not truncated/hidden | Each command has its summary lines quoted (9/9 targeted, 254 passed + 1 failing, `✓ built in 3.83s`, lint printed no errors). No `...` and nothing marked truncated. |
| Pre-existing failure | `VeeForm.spec.ts > VI \| EN toggle > flags the hidden language…`. This is the same failure as in the sealed #251 and #249 notes, so it is not new. |

## Acceptance
| Criterion | Evidence | OK |
|---|---|---|
| Switch at the header's left corner | 1440: switch left 264 = header left 240 + 24px padding. At 375 it sits right after the menu/brand icon. | ✓ |
| Switch on its own, separate from the right-side actions | `LangSwitch` is its own group before `.ms-auto`. The right-side groups are listed. | ✓ |
| Info icon with a tooltip saying the switch also sets the CV language | vi/en strings are quoted in the note. Focus on the final markup was checked at 375 (`251b-375-focus.png`), and hover on the final markup was re-checked by me (see Re-run). `LangSwitch.spec.ts` covers the text switch, `aria-label`, and `aria-describedby` → `role="tooltip"`. | ✓ |
| No horizontal scroll at 375 (tooltip open or closed, logged in or out) | Logged in: `closedScroll 375, openScroll 375, tip [83, 339]`. Logged out: `docScroll 375, headerScroll 375, headerH 56`, on a single line. | ✓ |
| Build green, no new test failures | `✓ built in 3.83s`. 254 passed, 1 pre-existing failure. | ✓ |
| Comments per code-comments.md | `LangSwitch.vue` has a short why-description and no `(#N)` refs. | ✓ |

## Forbidden states
- `ADHOC_WORK`: no. The node is on the diagram and the change went through a worker pass.
- `NO_EVIDENCE`: no.
- `EDIT_UNVERIFIED`: no. Every claim has read-back output, typecheck is declared CANNOT RUN, and the stale hover observation was closed by the re-run.
- `CODE_IN_HAVEN`: no.
- `DIAGRAM_DRIFT`: no. The row is now SEALED.
- `MAIN_EDIT`: no. The branch is `feature/issue-251-header-language-switch`.

## Seal gate
Not outward-facing: no commit, push or API write, so no approval was needed.

## Proportionality
These header changes were needed to meet the 375px criterion, and the note discloses them:
- the header "Tải CV" shortcut is hidden below `sm`
- the logged-out brand text is hidden below `sm`
- the auth links get `whitespace-nowrap`

Nothing else was opportunistically fixed.

## Operator flags (not blocking)
- On phones the header download shortcut is gone. Download is still available on the Home CV card. This is a product trade-off for the operator to accept.
- The tooltip is not dismissible with Esc and not hoverable (WCAG 1.4.13). DESIGN.md §6.4 asks only for hover and focus, which is met. The text is short.
