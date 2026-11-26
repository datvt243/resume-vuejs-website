# 2026-11-26 - issue-448-owner-export-profile

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-448-owner-export-profile` (IN_PROGRESS, row added this pass; slug grep in active + archive diagram = 0 hits before)
- Branch: `feature/issue-448-owner-export-profile` (off `staging` @ `d84c704`, `git pull origin staging` → "Already up to date.", created + linked via `gh issue develop 448 --checkout --base staging`)
- Status: sealed_pending_verifier
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/448 (type feat). Backend dep datvt243/resume-nodejs-api#400 CLOSED; PR #455 merged 2026-11-10, released v2.8.0 (PR #471, 2026-11-15) → the `status: waiting-backend` label is stale.

## Hub bytes before: 103040

## Feature doc: doctrine/features/cv-profiles.md
Behavior 6–11 + Acceptance (#448) + Edge cases (#448), written by the analyst (`evidence/analyst/2026-11-26/issue-448-owner-export-profile-spec.md`, spec_ready round 2; Open questions 4→a, 5→a answered by operator 2026-11-26). No open question left. Cross-refs: `cv-preview-export.md` 6a, `job-applications.md` #5, `ats-check.md` 2a.

## Diff (src only, `git diff --stat`)
```
 src/composables/useActiveProfile.ts                |  5 +++-
 src/composables/useDownloadCv.spec.ts              | 26 ++++++++++++++++++++
 src/composables/useDownloadCv.ts                   |  5 +++-
 src/pages/dashboard/PageApplication.spec.ts        | 21 +++++++++-------
 src/pages/dashboard/PageApplication.vue            | 14 +++++------
 src/pages/dashboard/PageAtsCheck.spec.ts           | 11 +++++++++
 src/pages/dashboard/PageAtsCheck.vue               |  5 +++-
```
- `useActiveProfile.ts`: new exported `getActiveProfileId()` reads `localStorage.cvActiveProfileId` at call time (Behavior 7); the ref initialiser reuses it.
- `useDownloadCv.ts`: `download({ template, lang, profile = getActiveProfileId() })`, params gain `...(profile && { profile })` (Behavior 6, 8; explicit profile wins → Behavior 10). Header / account menu / Home / ATS download call sites unchanged — they pick up the default.
- `PageAtsCheck.vue`: `handleCheck` adds `params: { profile }` only when an active id exists (query, body unchanged) (Behavior 9).
- `PageApplication.vue`: PDF `<a href=api/me/.../download-pdf>` → `<button type="button" :disabled="isDownloading" @click="download({ template: 'ats', lang: selectedLang, profile: item.profileId })">`, same icon/aria-label/title; `pdfLink` + unused `API` import removed; shortcut comment updated (public link only). Same show condition (`getProfileLinks(item)`) (Behavior 10). "View public CV" link unchanged (Behavior 11).
- Specs: `useDownloadCv.spec.ts` new `describe('CV profile (#448)')` (no profile → no key; key set AFTER composable creation → `{ profile: 'p1' }`; explicit `{ template:'ats', profile:'p2' }` with active p1 → `{ template:'ats', profile:'p2' }`). `PageApplication.spec.ts`: link test now expects 1 `<a>` (public) + a PDF button only on rows with a live profile; click test → `download({ template:'ats', lang:'en', profile:'p1' })`. `PageAtsCheck.spec.ts`: active p1 → `opts.params = { profile: 'p1' }`, body has no `profile`; existing "no profile" test still asserts exact opts (no `params` key).

## Commands (doctrine/MEMORY.md, repo root) — final run after all edits
- `npm run test` → ` Test Files  70 passed (70)` / `      Tests  525 passed (525)`
- `npm run build` → `✓ built in 4.14s`
- `npm run lint` → exit 0 (re-run after the last comment edit: `lint 0`)
- `npm run typecheck` → `74` `error TS` lines (≤ baseline 75); grep for `useDownloadCv|useActiveProfile|PageApplication|PageAtsCheck` in its output → `0`
- After the last edit (comment-only in PageApplication.vue): `npx vitest run src/pages/dashboard/PageApplication.spec.ts` → `Tests  13 passed (13)`
- `npx vitest run src/composables/useActiveProfile.spec.ts` was in the targeted run: `Test Files  4 passed (4)` / `Tests  41 passed (41)` (useDownloadCv 17, PageAtsCheck 7, PageApplication 13, useActiveProfile 4), and in the full suite above.

## Acceptance (cv-profiles.md #448)
| Criterion | Evidence |
|---|---|
| useDownloadCv spec: active `p1` → params `profile:'p1'`; empty → no key; set after creation → new id | `CV profile (#448)` › "sends the active profile, read at click time, and none for All profiles" — passes (17/17) |
| useDownloadCv spec: explicit `profile:'p2'` + `template:'ats'` wins over active `p1` | "lets an explicit profile win over the active one" — passes |
| useActiveProfile.spec passes | 4/4 in targeted run + full suite |
| Live: header Download CV with profile → `?profile=<id>`, filtered PDF; "All profiles" → no profile | Live (below) rows 1–2: `api/v1/download-pdf?lang=en` 101705 B vs `api/v1/download-pdf?lang=en&profile=6b08…5089` 69900 B; profile id set in localStorage AFTER the header was mounted → still sent. **Limit:** PDF text is glyph-encoded; no pdftotext/pypdf here, so "exactly 1 experience" not read from the PDF — only the size drop + backend contract (PR #455) support it |
| Live: same for Home card + ATS download | Home `api/v1/download-pdf?lang=en&profile=6b08…5089` 200; ATS download `api/v1/download-pdf?template=ats&lang=en&profile=6b08…5089` 200 |
| Live: ATS Check with profile → `cv/ats-check?profile=<id>`; none → no query | `api/v1/cv/ats-check?profile=6b08…5089` 200, body `{"template":"ats","lang":"en"}`; none → `api/v1/cv/ats-check` 200 |
| Live: per-application PDF → owner endpoint, `template=ats`, application's profile (not active), works while private, no `api/me/...download-pdf`, overlay w/ Cancel focused, file name, Cancel | Active = "Tổng hợp" (`6adf411b…8a53`); clicked row "QA448 Co" (profile `6b08…5089`): element `BUTTON` aria-label "Tải PDF theo profile"; only request `api/v1/download-pdf?template=ats&lang=en&profile=6b081fc8f9142c9ea3655089` → 200 `application/pdf` 54434 B, while `GET api/me/qa-full-2zd2` → 404 (CV set private for this check); overlay `[role=dialog][aria-modal=true]` attached, focused element text "Hủy". **Not live-verified:** saved file name (Playwright got no `download` event on the CDP-attached Chrome; sandbox denies reading `~/Downloads`) and Cancel → both rely on the unchanged shared flow's existing specs (`withLangSuffix` cases, "cancel aborts the request…") |
| Name `"   "` can't be saved / 1-of-3 Preview / delete active profile | Pre-existing criteria of the verified doc; code paths not touched by this diff (profile model, PagePreview, PageProfile unchanged) |
| Comments per `doctrine/standards/code-comments.md` | New `//` in useActiveProfile = WHY (stale ref); JSDoc line in `download` = param doc on exported API; PageApplication shortcut comment reworded to drop an issue ref (first draft had `(#448 …)`, fixed). No opt-ins ON |

## Live check setup (QA account `qa.full@example.com`, never the owner)
Vite started by this session on :5173 (prod API, `.env.development.local`), debug Chrome on :9888 launched by this session, login via UI. Tab was `visibilityState: hidden` (rAF stalled) → clicks via `element.click()` in page. Test data created via API and removed afterwards: profile `QA448 one-exp` (experienceIds = [JOBTEST `6adf41162987df4de8b08a33`]) → deleted; application "QA448 Co" → deleted; `isPublic` set false for the private-CV check → restored true (`GET api/me/qa-full-2zd2` → 200 after). Vite stopped (TaskStop) and debug Chrome killed; `:5173` and `:9888` confirmed free. qa.full's own only profile "Tổng hợp" selects all 5 experiences (analyst's caveat) — hence the temporary profile.

## Review (`/code-review medium`, run on the working-tree diff before the last 2 small edits)
1. Stale/deleted active id sent unvalidated (useDownloadCv) → **false positive**: backend contract (PR #455, cv-profiles.md Behavior 8 + Edge case) returns the unfiltered CV, no error, for unknown/deleted/foreign/malformed ids.
2. Same for ATS check → false positive, same contract.
3. `cvActiveProfileId` survives logout → cross-account id → by spec: cv-profiles.md Edge case "(#448) …another account signs in… foreign id → unfiltered (no leak, no error)". Not fixed.
4. Header download now filtered by the last-picked profile without UI hint → **by design** (Behavior 6, operator answer 2026-11-07 Q1).
5. `getActiveProfileId` vs `watch` flush race (set + download same tick) → no such caller today → Noticed, not done.
6. Per-instance ref vs module-level shared state → refactor beyond scope → Noticed, not done.
7. Ref initialiser duplicated the localStorage read → **fixed** (`ref(getActiveProfileId())`), suite re-run (525 passed).
8. `localStorage.getItem` can throw (blocked storage) → pre-existing pattern (the ref initialiser and `useCvTheme` already read it unguarded on mount) → Noticed, not done.
9. Per-row PDF button has no `aria-busy`/spinner → the shared overlay (`role=dialog`, Cancel focused, verified live) is the busy feedback; marking every row busy would mislead → not changed, Noticed.
10. ATS result not tied to the checked profile → pre-existing (only template tracked) → Noticed, not done.

## Supersedes: none
`grep -n "#448\|issue-448" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row (line 98).

## Noticed, not done
- GitHub label `status: waiting-backend` on #448 is stale (backend released v2.8.0) — operator/`/ship` may remove it.
- Review findings 5, 6, 8, 9, 10 above.
- `.claude/skills/todo/SKILL.md` is modified in the working tree from before this node — not part of this diff, `/ship` should not bundle it.
- `ls` in this shell sometimes prints the repo root listing instead of the target dir (seen again with `~/Downloads`) — the boot GUARD's `find` advice holds.

## Dead ends
- First `/download-pdf` header click via Playwright `locator.click()` timed out 30s (hidden tab, element never "stable") → switched to in-page `element.click()`.
- `POST profile/create` without `_id` → `VALIDATION_ERROR … "_id" "ID là bắt buộc"`; with `"_id": null` (same as `useDocument`) → success.

## Round 2 — REOPEN fixes (`evidence/verifier/2026-11-26/issue-448-owner-export-profile-reopen.md`)
No code change this round; evidence only. Commands from round 1 still describe the current tree (`git diff src/` unchanged since the final run above).

### Seal gate
Outward-facing actions this node took: prod-API calls on the **QA account `qa.full@example.com` only** (create/delete a temp profile "QA448 one-exp" ×2, create/delete a temp application "QA448 Co" ×2, `PATCH candidate/update isPublic false → true`, `GET download-pdf`/`cv/ats-check`, logins). Authorization: the operator's standing instruction in user memory `qa-test-accounts.md` — "QA accounts … for agents to log in with when testing fixes/features", "Feel free to change them", and `MEMORY.md` index line "use these for writes"; `owner-account-readonly.md` forbids writes only on the owner account (never touched). No per-action approval was asked this session — the verifier/operator should treat this as durable authorization or REOPEN on it. State restored after each round: profiles list → `['Tổng hợp']` (original only), test application deleted (`Xoá thành công` ×2), `GET api/me/qa-full-2zd2` → 200 (public again), debug-browser `localStorage.cvActiveProfileId` removed. No commit/push/merge happened (that's `/ship`).

### Criterion "saved PDF contains exactly 1 experience" — now read from the PDF text
Decoder: throwaway Python (scratchpad, not in repo) unpacking `/ObjStm` object streams + each font's `/ToUnicode` CMap, then counting company names (spaces stripped). Temp profile `6b0822def9142c9ea365512a` = experienceIds `[6adf41162987df4de8b08a33]` (JOBTEST). Experiences of qa.full: JOBTEST, FASTCODING·VIETRY·ZAGO, Laidon Group, 2 career breaks.
```
template=classic&lang=en                                 200 101705 JOBTEST=1 FASTCODING=1 Laidon=1
template=classic&lang=en&profile=6b0822def9142c9ea365512a 200 69900 JOBTEST=1 FASTCODING=0 Laidon=0
ats-full      (template=ats)                              JOBTEST=2 FASTCODING=1 Laidon=2
ats-filtered  (template=ats&profile=6b08…512a)            JOBTEST=1 FASTCODING=0 Laidon=0
```
→ with the profile active the PDF holds only the 1 selected experience; without it, all of them. Byte sizes match the round-1 live header requests (101705 / 69900), i.e. the same responses the UI got.

### Saved file name + Cancel — observed live (debug Chrome :9888, Vite :5173 both started this round and stopped after; ports confirmed free)
Instrumented `HTMLAnchorElement.prototype.click` to record `a.download` (real click still ran). Active profile = "Tổng hợp", clicked "QA448 Co" row (its profile = temp one-exp), CV lang EN:
- Saved name: `Nguyen_Van_Full_Information_Technology_CV_EN.pdf` (server `Content-Disposition` name + `_EN`, cv-preview-export #7–8). `_VI` variant not clicked live — same `withLangSuffix` path, covered by its spec cases.
- Cancel: overlay `[aria-labelledby="download-overlay-title"]` attached; `document.activeElement` = "Hủy", inside the overlay; row PDF button `disabled: true` while running; clicking Cancel → request `requestfailed` `net::ERR_ABORTED`; new saves `0`; no "Không tải được CV" toast.
- Correction to round 1: its `overlay: true` / "Hủy" check used `[role=dialog][aria-modal=true]`, which also matches the hidden application modal — round 2 re-checked with the overlay's own `aria-labelledby` selector (above), so the round-1 overlay claim is superseded by this one.

### Noticed, not done (new)
- Backend: `GET api/v1/download-pdf` **classic + vi, unfiltered** returns `500 {"code":"INTERNAL_SERVER_ERROR"}` for qa.full (`template=classic&lang=vi` and `lang=vi` both 500 ×2 tries; classic+en, ats+vi, and classic+vi+profile all 200). Not caused by this diff (no `profile` param in the failing request) — a resume-nodejs-api issue for the operator to file.
