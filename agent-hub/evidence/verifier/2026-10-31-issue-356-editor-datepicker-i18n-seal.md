# 2026-10-31 — issue-356-editor-datepicker-i18n — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-356-editor-datepicker-i18n` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note reviewed: `evidence/implementer/2026-10-31-issue-356-editor-datepicker-i18n.md`

## Isolation proof
Separately spawned Agent subagent from the implementer's `/todo` session: this context was started cold with a task string ("You are a fresh verifier subagent ... You did NOT write this diff — you were spawned specifically to verify it") and holds no turn of the implementer pass. It read only the evidence note, never the src diff.

## Verdict: SEAL

## Cited
| Check | Result |
|---|---|
| Commands match `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck` from repo root |
| Output not truncated | verbatim result lines: 51 files / 307 tests passed; `✓ built in 3.88s`; lint exit 0; typecheck 90 `error TS` = baseline, 0 in changed files |
| AC1 CKEditor in UI language, live switch, content kept | manual observation: VI toolbar/aria-label/`lang="vi"`; EN switch with modal open → English toolbar + aria-label, no console errors; typed text survived VI→EN→VI |
| AC2 clear-button label + label→real input | new spec green, red with the fix stashed (`expected 'DIV' to be 'INPUT'`); live `for=dp-input-*` → `INPUT`, `Xóa ngày` / `Clear date` |
| AC3 test/build/lint/typecheck + live check | rows above; live check covers CKEditor (jsdom can't) |
| Comments per code-comments.md | row present: 3 `//` one-line why-comments, no `(#N)` refs, no template comment |
| i18n key in both vi and en | `form.clearDate` vi `Xóa ngày`, en `Clear date` |
| 6b Supersedes | `## Supersedes: none`; no other open #356 row on the active diagram |
| Branch (`NoMainEdit`) | `fix/issue-356-editor-datepicker-i18n` off `staging` |
| Seal gate | none needed: no commit/push, QA account `qa.full@example.com` only, modal closed with discard, nothing saved |
| Proportionality | 3 src files + 1 spec, each mapped to an AC; extra picker aria labels and debounce edge left under "Noticed, not done" |

## Missing
none

## Forbidden states
ADHOC_WORK no (node row exists) · NO_EVIDENCE no · EDIT_UNVERIFIED no (all four commands read back) · CODE_IN_HAVEN no (diagram row only) · DIAGRAM_DRIFT no (row added, now SEALED) · MAIN_EDIT no

## Re-run
none — audit-only; note is verbatim, commands match doctrine, every AC cited, node not outward-facing.

## PM status
Row collapsed in place to a SEALED pointer; full row appended to `haven/diagrams/dev-loop-archive.md`. Active pointer rows were 26 after this one, so the 6 oldest (281, 266, 291, 295, 309, 308; all already in the archive) were deleted to keep 20.

## Residual risk (from the note, accepted)
Picker overlay month names and other forms (Experience/Project/import/basic info) not checked live; they share the same two components. Text typed within the v-model debounce before a language switch can be lost on remount.
