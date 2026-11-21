# 2026-11-21 - issue-457-import-size-limit
- Worker: implementer · Version: 0.1.0
- Node: `issue-457-import-size-limit` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#457 Import CV: check the 5MB PDF limit before uploading — On /dashboard/import-linkedin the 5MB PDF limit is only in the hint text; the browser uploads larger files and waits for the backend 400. Expected: PDF > 5MB (LinkedIn zip > 20MB) → error toast (vi + en), no upload."
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/457

## Branch
`fix/issue-457-import-cv-check` (cut from synced `staging` via `gh issue develop 457 --checkout --base staging`, linked to #457)

## Hub bytes before
100317

## Feature doc
`doctrine/features/import-cv.md` — Open question 1 ("The 5MB PDF limit is only in the hint text…") answered by the operator 2026-11-07: "Bug: check size before upload — #457". Behavior line 14 (PDF hint "up to 5MB") unchanged. No Behavior contradicted; doc not edited.

## Limits source
Backend repo `resume-nodejs-api` (sibling dir): `src/middlewares/uploadCV.middleware.ts:47` `CV_MAX_FILE_SIZE = 5 * 1024 * 1024`, `src/middlewares/uploadLinkedInExport.middleware.ts:18` `LINKEDIN_EXPORT_MAX_FILE_SIZE = 20 * 1024 * 1024`. Frontend uses the same `maxMb * 1024 * 1024` with `>` (backend test `cvFileRoutes.test.ts:73` rejects `5MiB + 1`), so exactly 5MiB still uploads.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageImportLinkedin.vue` | `maxMb` on `SOURCES.linkedin` (20) / `SOURCES.pdf` (5); in `handleSelectFile`, after the JSON Resume branch and before building `FormData`: `file.size > maxMb * 1024 * 1024` → `toast({ message: t('importCv.fileTooLarge', { max }), bg: 'danger' })` and return (no `handleBase`). JSON Resume path untouched (parsed in browser, no upload) |
| `src/i18n/index.ts` | `importCv.fileTooLarge` in `vi` ("File quá lớn, tối đa {max}MB") and `en` ("File is too large, up to {max}MB") |
| `src/pages/dashboard/PageImportLinkedin.spec.ts` | 2 new tests: PDF 5MiB+1 and .zip 20MiB+1 → toast with the vi message, `handleBase` never called; PDF exactly 5MiB → `handleBase` called once |
| `haven/diagrams/dev-loop.prime-mermaid.md` | new node row, IN_PROGRESS |

Not mine: `.claude/skills/todo/SKILL.md` was already modified on `staging` before this branch was cut (session-start git status) — leave it out of this commit.

## Command
From `doctrine/MEMORY.md`, repo root: `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck` (standalone Typecheck row, baseline 78).

## Output
`npm run test` (tail):
```
 Test Files  61 passed (61)
      Tests  396 passed (396)
   Start at  17:43:35
   Duration  8.55s (transform 3.32s, setup 0ms, collect 14.69s, tests 3.16s, environment 21.76s, prepare 3.67s)
```
(was 394 on the previous node → +2 new tests)

`npm run build` (tail):
```
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 4.05s
```
`npm run lint >/dev/null 2>&1; echo "lint exit $?"` → `lint exit 0`

`npm run typecheck 2>&1 | grep -c "error TS"` → `78` (= baseline); `npm run typecheck 2>&1 | grep -E "PageImportLinkedin|i18n/index"` → no output.

Dev server (`npx vite --port 5173`, started by me, stopped after): `GET /resume-vuejs-website/src/pages/dashboard/PageImportLinkedin.vue` → `200`, transformed module contains `fileTooLarge` and `maxMb: 20`. No logged-in click-through in a browser; the behavior is covered by the page spec.

## Acceptance
| Criterion | Evidence |
|---|---|
| PDF > 5MB → danger toast, no upload | spec "rejects a PDF over 5MB or a .zip over 20MB…" (`toHaveBeenLastCalledWith({ message: 'File quá lớn, tối đa 5MB', bg: 'danger' })`, `handleBaseMock).not.toHaveBeenCalled()`) in "396 passed" |
| LinkedIn .zip > 20MB → danger toast, no upload | same spec, `20` iteration |
| Message in vi + en | `importCv.fileTooLarge` added to both `vi` and `en` (diff i18n/index.ts); `en: typeof vi` and typecheck shows no error in i18n/index.ts |
| Files at the limit still upload | spec "uploads a PDF of exactly 5MB" → `handleBase` called once |
| matches `features/import-cv.md` Open question 1 answer | check happens before `FormData`/`handleBase`, see Diff |
| test/build/lint green, typecheck ≤ baseline, none in touched files | see Output |
| comments per code-comments.md | One added comment on `SOURCES` (why `maxMb` exists / that it mirrors the backend) — a "why" line, not narration |

## Supersedes
none. `grep -n "457" haven/diagrams/dev-loop.prime-mermaid.md` and `dev-loop-archive.md` showed no other row before this one.

## Still open
none

## Review
`/code-review` not run as a skill; inline pass over the full diff + `handleSelectFile`'s callers (the three `<input type="file">` `@change` handlers in the template):
- `sourceKey` is only ever `linkedin`/`pdf`/`jsonresume`; `jsonresume` returns earlier, so `SOURCES[sourceKey].maxMb` is always defined at the check. No finding.
- `e.target.value = ''` runs before the check, so re-picking the same too-large file fires `change` again and re-toasts. No finding.
- Boundary uses `>` to match the backend's multer `fileSize` limit (exceeding it errors; equal passes). No finding.
No findings.

## Noticed, not done
- Hints only mention the 5MB PDF limit; the LinkedIn hint doesn't say "up to 20MB". Out of scope (issue asks for the check, not hint text).

## Seal gate
none — no commit/push/real API call in this pass.
