# 2026-10-10 - issue-182-bilingual-cv - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-182-bilingual-cv` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Evidence reviewed: `evidence/implementer/2026-10-10-issue-182-bilingual-cv.md`

## Isolation proof
Spawned as a fresh, isolated verifier subagent with task string: "You are a fresh, isolated verifier subagent for the repo at /Users/_david/Workspace/Project/resume/resume-vuejs-website. You did NOT write the diff under review. Invoke the Skill tool with skill \"worker\" and args: verifier ...". This context holds no implementer turns. Diff not read; only one grep of `PageGeneralInformation.vue` to confirm the localized `career`/`careerGoal` fields render through `VeeForm` (where the toggle lives) and not through `VeeFormGeneralInformationUpdate` — confirmed (line 149).

## Re-run
none — audit-only. Commands match `doctrine/MEMORY.md`, output quoted verbatim (no `...`/truncation markers), every criterion cited; node is not outward-facing.

## Verdict: SEAL

| Check | Result |
|---|---|
| Commands vs MEMORY.md | `npm run test`, `npm run build`, `npm run lint`, per-file `npx vitest run`; Typecheck explicitly CANNOT RUN |
| Output truncated? | No |
| VI \| EN toggle to enter/edit English (issue #182) | 4 new VeeForm toggle tests pass (VI default, EN swap, non-localized always visible, error flag on hidden language); fail against staging `VeeForm.vue` — tests proven to catch the missing behaviour. All 8 backend `{vi,en}` fields wrapped via `withEnglish` |
| Saved as `{ vi, en }`, EN optional, no language mixing | "keeps both languages…" test; `localizedFromForm`/`splitLocalizedText` unit tests (strict, no cross-fallback) |
| `?lang=en` public link | `PagePublicResume.spec` (2) — forwards `params: { lang: 'en' }`, no param for default/unsupported; fail on staging. Share link appends `lang=en` |
| `?lang=en` PDF export | `getDownloadCvUrl(..., 'en')` → `…&lang=en&…` test; Home + ATS-check links use it |
| English display (Preview/public) | `CvResumeLayout` lang tests (3) incl. VI fallback; `useCvLang.spec` (4) |
| Backend contract | Read from backend source (`lang === 'en' ? 'en' : 'vi'` in `fnGetAboutMe`/`fnExportPDF`); no backend change needed |
| Full suite | `3 failed / 163 passed (166)` — all 3 the named pre-existing flaky "BUG (real, verified)"/pristine-submit VeeForm tests. This diff DOES touch `VeeForm.vue`, so prior notes' "untouched" rationale doesn't apply; accepted because the same session's run against staging `VeeForm.vue` also showed 2 of these flaky failures, and none of the failing tests is a new toggle test |
| Build / lint | `✓ built in 4.58s` / exit 0 |
| comments per code-comments.md | row present: JSDoc on new exported helpers, file header on `useCvLang.ts`, WHY comments |
| Forbidden states (6) | none hit — node on diagram, note written, results read back, no code in `haven/`, PM row updated (this pass), not on main |
| Branch (NoMainEdit) | `feature/issue-182-bilingual-cv` off `staging` (`cf463f2`) |
| Seal gate | none needed — no commit/push/merge |
| Proportionality | Scope matches the issue. `CvResumeLayout` raw-`career` fix is required for localized display, not opportunistic; `wrapLocalizedText` removal = no callers left; `PageImportLinkedin` change needed since it shares the models |

Disclosed gaps (accepted): no logged-in browser click-through and no live backend `?lang=en` call — the backend behaviour comes from reading its source, and component/unit specs cover the frontend side.

## Follow-ups (not blocking)
- `VeeForm.spec.ts` flakiness still has no issue — now more pressing since VeeForm is being actively extended.
- `Header.vue` download shortcut always vi/classic.
- EN copy of `career` inherits VI `max(50)`.
