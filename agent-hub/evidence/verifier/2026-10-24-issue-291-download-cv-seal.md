# 2026-10-24 - issue-291-download-cv - SEAL

- Worker: verifier (v0.1.0)
- Node: `issue-291-download-cv` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS → SEALED, row updated in place)
- Evidence reviewed: `evidence/implementer/2026-10-24-issue-291-download-cv.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh Agent-tool subagent with a brief stating "You are a fresh, isolated verifier. You did NOT write the diffs under review — a separate implementer session did (via `/todo` for frontend issue datvt243/resume-vuejs-website#291)", asked to verify two nodes in two hubs, with task string `verifier "agent-hub/evidence/implementer/2026-10-24-issue-291-download-cv.md"`. This context holds no implementer history. The diff was not opened (EvidenceOnly).

## Re-run
partial: `npm run test` from repo root → `Test Files  1 failed | 44 passed (45)`, `Tests  1 failed | 273 passed (274)`, matching the note exactly. Reason: the node made real API calls (logged-in GETs against the prod backend), which `CLAUDE.md`'s Seal gate counts as outward-facing, so an independent confirmation was worth the small cost.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint` from repo root; `Typecheck: CANNOT RUN — pending add-typecheck-script` stated. OK |
| Output not truncated | Verbatim summary lines (`Tests 1 failed \| 273 passed (274)`, `✓ built in 3.73s`, lint clean, per-spec counts 3/3 and 5/5). OK |
| Known failure | `VeeForm > VI \| EN toggle > flags the hidden language…`, the same pre-existing failure cited in the #266 notes (staging baseline). 273 = 275 − 5 removed + 3 new adds up. OK |
| Branch (NoMainEdit) | `fix/291-download-cv`, from `staging` via `gh issue develop 291 --base staging`. OK |
| Seal gate | No commit/push. Real backend: GETs and failing download attempts only, no writes. Render read-only, approved by the operator (AskUserQuestion). OK |
| Proportionality | All 3 download buttons changed; removed `getDownloadCvUrl` + 5 tests and imports only because they had no callers left. `PageApplication.vue` public link, preparing-toast, dead `localhost` checks listed under "Noticed, not done". OK |
| Comments per code-comments.md | Composable header + 2 short WHY comments, no issue refs. OK |
| i18n | `error.downloadCv` in vi + en; parity spec passes in the full run. OK |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| Find why Download CV doesn't download | Live fetch → 500 JSON for every variant; Render logs "Could not find Chrome (ver. 127.0.6533.88) … /opt/render/.cache/puppeteer". OK |
| Buttons follow the datvt243.github.io flow | Composable spec (blob request, params, filename, error toast, double-click guard) + manual checks 1–2. OK |
| Auth works without `?token=` | Manual check 1: request carries `Authorization`, URL has no `token=`. OK |
| All 3 buttons covered | Header + Home observed (2 `button[aria-busy]`, 0 `download-pdf` anchors); ATS check covered by the updated `PageAtsCheck.spec.ts` (ats/vi, classic/en). OK |
| No regressions | Re-run above, build green, lint clean. OK |
| Backend cause fixed | Owned by backend node `fix-render-puppeteer-cache-dir` (resume-nodejs-api#298), verified separately in that hub: `agent-hub/evidence/verifier/2026-10-24/render-puppeteer-cache-dir-seal.md` in the `resume-nodejs-api-298` worktree. Deploy pending release. OK as a cross-reference |

## Judgment: is error path + stubbed success enough for this node?
Yes. This node's scope (per its diagram row, "Frontend part (this node)") is the client flow: request with Bearer auth and refresh, blob → `<a download>`, loading state, error toast. Every branch of that flow has observed evidence: the real-backend 500 shows the error branch (toast, no JSON tab, header auth, no token in URL), and the stubbed 200 `%PDF` shows the success branch down to a real file the browser saved (`~/Downloads/Võ_Tấn_Đạt.pdf`, 44 bytes = the stub). The one thing the frontend can't show yet is the backend producing a PDF. That claim belongs to the backend node and its deploy, not to this node. The note says so honestly ("Not observed: a real PDF from the real backend").

## Forbidden states
`ADHOC_WORK` (node exists), `NO_EVIDENCE`, `EDIT_UNVERIFIED`, `CODE_IN_HAVEN`, `DIAGRAM_DRIFT` (row now SEALED), `MAIN_EDIT`: none hit.

## Follow-up (not blocking)
After backend #298 is released and deployed, click Download CV on the live site once and confirm a real PDF saves.
