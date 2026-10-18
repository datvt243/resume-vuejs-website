# 2026-10-19 - issue-213-preview-raw-html - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-213-preview-raw-html` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Input: `evidence/implementer/2026-10-19-issue-213-preview-raw-html.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a separate Agent-tool subagent by the implementer session for task #213, with a fresh context whose task string was: `verifier "agent-hub/evidence/implementer/2026-10-19-issue-213-preview-raw-html.md"` (plus the instruction not to modify `src/`, not to commit/push, and not to start or stop dev servers). This context did not write the diff and never opened it; it read only the evidence note.

## Re-run
`none` - audit-only. The output is verbatim, the commands match `doctrine/MEMORY.md` (`npm run test`, `npm run build`, Typecheck declared CANNOT RUN), and the node is not outward-facing.

## Acceptance (from issue #213 body + node row)
| Criterion | Cited evidence | OK |
|---|---|---|
| `introduction` renders HTML, no raw `<p>` | spec `.cv-introduction strong` = `Dat`; live preview `{"introTag":"DIV","introHasP":true,"rawTagsVisible":false}` | yes |
| `edu` / `pj` / `ce` `description` checked and fixed | spec asserts `<strong>CS</strong>`, `<strong>Vue</strong>`, `<strong>SAA</strong>` inside `.cv-item-desc`; all 4 fields traced to `defaultDescription` → `type: 'ckediter'` | yes |
| Sanitize kept | spec: injected `<script>` → no `alert(2)`; uses existing `sanitizeHtml` | yes |
| Spec catches regression | `.vue` change stashed → `Tests  2 failed | 3 passed (5)`; with fix `5 passed (5)` | yes |
| Build green | `✓ built in 4.03s` | yes |
| Tests: no new failure | 1 failure, `VeeForm > VI \| EN toggle > flags the hidden language...`; the same test fails on clean `origin/staging` in `evidence/implementer/2026-10-19-issue-212-form-select-dark.md` line 44. Diff does not touch VeeForm | yes |
| Typecheck row | Explicitly `CANNOT RUN - pending add-typecheck-script` | yes |
| Comments per code-comments.md | No comments added | yes |

## Forbidden states
- `ADHOC_WORK`: clear, the node row exists.
- `NO_EVIDENCE`: clear, the note exists.
- `EDIT_UNVERIFIED`: clear, every claim has real output.
- `CODE_IN_HAVEN`: clear, the only haven change is a diagram row.
- `DIAGRAM_DRIFT`: clear, the row is now SEALED.
- `MAIN_EDIT`: clear, branch `fix/issue-213-preview-raw-html`, cut from `staging` (confirmed current branch).

## Seal gate / proportionality
- Nothing committed or pushed, so no approval needed. Shipping goes through `/ship`.
- Scope matches the issue exactly (the 4 fields the issue names). `<p>` → `<div>` is required to avoid nested `<p>`. Plain-text legacy data, backend PDF, and flaky VeeForm spec were noted, not fixed.
