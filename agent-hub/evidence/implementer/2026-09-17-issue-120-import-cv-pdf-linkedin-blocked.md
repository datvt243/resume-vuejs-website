# 2026-09-17 — issue-120-import-cv-pdf-linkedin (blocked)

- Worker: implementer
- Version: 0.1.0
- Node: `issue-120-import-cv-pdf-linkedin` (new node)
- Task (verbatim): "#120" (operator, via `/todo`)

## Hub bytes before
240587 (root=12393, doctrine=27207, active diagram=174870,
implementer bundle=14963, verifier bundle=11154 — categories per
`/hub-tokens`' "per-session total" formula). Note: active diagram is well
over the 15KB `/hub-tokens` threshold (174870B) — flagging under "Noticed,
not done" below, out of scope for this task.

## Branch
None — no code change was made (nothing to branch for; see conclusion).

## Investigation
1. Read GitHub issue #120 (`gh issue view 120`, frontend repo
   `datvt243/resume-vuejs-website`): "[ENHANCEMENT] Import CV từ file PDF
   hoặc LinkedIn export". The issue's OWN scope note already says: "Parse
   phía backend (cần thư viện parse PDF/text extraction) — không nên parse
   phía frontend"; "Map kết quả parse vào form đã có sẵn để user review và
   sửa trước khi lưu"; "Cần issue backend riêng cho phần parse (endpoint
   mới)". So the issue author already flags this as backend-dependent —
   checked the sibling backend repo before trusting that at face value,
   per the `issue-8-jwt-localstorage`/`issue-117-public-slug` precedent of
   always rechecking a cross-repo dependency rather than assuming.
2. Checked the sibling backend repo
   (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`):
   - `git log --oneline -15` (backend `main`): most recent real feature
     work is `445e57e feat(candidate): vanity slug for public profile
     (#120 backend)` (v1.5.0), `4383246 feat(candidate-profile): soft-delete
     + restore for CV sections (#121 backend)`, Docker support, prod-port
     fix, IDOR fix — none touch PDF parsing, text extraction, or LinkedIn
     import.
   - `grep -rli "parse|linkedin|pdf" src/` in the backend found only
     `uploadCV.middleware.ts` + `candidate.route.ts`/`candidate.controller.ts`'s
     `/upload-cv` and `/cv-file` endpoints. Read these directly:
     `uploadCVMiddleware` validates a PDF (mimetype + extension, ≤5MB) and
     `multer` saves it to disk as `<candidateId>-cv.pdf`; `fnUploadCV`
     (candidate.controller.ts:66-83) only writes a DB record pointing at
     the stored file; `fnDownloadCV` only serves that same stored file
     back. **No text extraction, no field parsing, no structured-data
     output anywhere in this path** — it's a raw store-and-retrieve
     feature (presumably for a "download my CV as a file" use case),
     unrelated to auto-filling Education/Experience.
   - `gh issue list --repo datvt243/resume-nodejs-api --state all --search
     "parse OR pdf OR linkedin OR import"` → 7 results, none about
     parsing a CV file into structured fields (`#120` closed = vanity
     slug, `#87` closed = PDF *export* missing fields, `#76` closed =
     DOCX/JSON *export* formats, `#79`/`#75`/`#72` unrelated). **No backend
     issue exists yet for the parse endpoint this feature needs** —
     confirming the frontend issue's own note that a separate backend
     issue would need to be filed first, which hasn't happened.
3. Checked the frontend repo itself for any existing plumbing to wire up
   (`grep -rli "upload-cv|uploadCV|import.*cv|linkedin" src/`): only a
   `socialMedia.linkedin` profile-link text field in
   `src/models/information.model.ts` / `PageInformation.vue` — a URL
   input, unrelated to file import/parsing. No frontend upload UI, no
   client calling `/upload-cv` or `/cv-file`, nothing to extend.

## Conclusion
**Blocked on backend.** The feature requires a NEW backend endpoint that
parses an uploaded PDF or LinkedIn export into structured
Education/Experience data — this does not exist (the backend's only
PDF-related endpoints, `/upload-cv` + `/cv-file`, are store/download only,
with zero text-extraction logic), and no backend issue tracking that
parse endpoint exists yet either. Building a frontend upload UI now would
have nothing real to call, and per `NORTHSTAR.md`'s "no unproven 'should
be done'" and `SmallestDiff`, a cosmetic/stubbed upload form with no real
backend behind it would misrepresent progress — not created. Issue #120
stays OPEN, diagram node is `BLOCKED_ON_BACKEND`.

## Command
None run — no code changed, nothing to build.

## Acceptance
| Criterion | Evidence |
|---|---|
| Confirmed the issue's own backend dependency, not assumed stale | Issue #120 body: "Cần issue backend riêng cho phần parse (endpoint mới)" |
| Checked backend repo for existing parse capability, not assumed | Read `uploadCV.middleware.ts` + `candidate.controller.ts:66-83` directly — store/download only, no parsing |
| Checked for a backend issue already tracking the parse endpoint | `gh issue list --repo datvt243/resume-nodejs-api --state all --search "parse OR pdf OR linkedin OR import"` — 7 results, none match |
| Checked frontend for existing plumbing worth extending | `grep -rli "upload-cv\|uploadCV\|import.*cv\|linkedin" src/` — only an unrelated `socialMedia.linkedin` URL field |
| No fake/cosmetic diff created | `git status --short` in frontend repo — untouched by this note |

## Noticed, not done
- `haven/diagrams/dev-loop.prime-mermaid.md` is 174870B, well over the
  15KB `/hub-tokens` archive threshold (only 4 archive passes done so far,
  last one 2026-09-06) — out of scope for this task, flagging for a
  dedicated `/hub-tokens` + archive pass.
- If the operator wants this feature to move forward, the actual next
  step is filing a NEW issue on `datvt243/resume-nodejs-api` for a
  PDF/LinkedIn-export parsing endpoint (as issue #120's own scope note
  already says) — not filed here, out of this task's scope (frontend
  repo only).

## Seal gate
No outward-facing action, no diff — nothing to ship. Per `/todo`'s rule
for a `blocked` implementer result: stop immediately, report to the
operator, do not loop, no verifier pass needed (nothing to verify — no
diff, no build claim).
