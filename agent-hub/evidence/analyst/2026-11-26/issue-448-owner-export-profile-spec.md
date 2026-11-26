# issue-448-owner-export-profile — spec (analyst)

- Worker: analyst · recipe spec_feature (spec mode) · 2026-11-26 · HEAD d84c704 · branch feature/issue-448-owner-export-profile
- Status returned: round 1 needs_input (Open questions 4, 5) → round 2 spec_ready (operator answers 2026-11-26)

## Task (verbatim)
#448 "Use the owner export with `?profile=` for "Download CV" and per-application PDF"
Problem: "Download CV" (server PDF from Header/Home) ignores the active CV profile. The per-application "Download PDF" / "View public CV" use the PUBLIC endpoints, so they fail while the CV is private.
Expected: Once datvt243/resume-nodejs-api#400 adds `?profile=` to the owner `GET /download-pdf`: "Download CV" passes the active profile. Per-application PDF uses the owner endpoint with the application's profile (works for a private CV). Blocked by resume-nodejs-api#400.

## Doc path
- Main: `doctrine/features/cv-profiles.md` (Behavior 6–11 draft, Acceptance (#448), Edge cases (#448), Open questions 4–5)
- Cross-ref lines + Changelog rows: `cv-preview-export.md` (6a, Out-of-scope note), `job-applications.md` (#5 sub-bullet), `ats-check.md` (2a). INDEX rows already list #448 — unchanged.

## Sources read
agent-hub/haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}; doctrine/domains/PROJECT.md (grep), doctrine/MEMORY.md (test commands), doctrine/features/{INDEX,cv-profiles,cv-preview-export,job-applications,ats-check}.md; backend `gh pr view/diff 455 -R datvt243/resume-nodejs-api` (contract: query `profile=<id>`, caller's non-deleted profile → filtered, missing/unknown/deleted/foreign/malformed → unfiltered, all formats; same param on POST cv/ats-check as query); backend verifyToken tests (query token accepted on download-pdf); src files in Code map.

## Code map
- `src/composables/useDownloadCv.ts:32-84` — shared download flow; `download({template, lang})` builds `params` at 52-55 → add `profile` here (read localStorage at call time).
- `src/composables/useActiveProfile.ts:16-33` — ref initialised once from `localStorage.cvActiveProfileId`; per-call, not shared → stale in long-lived Header.
- `src/pages/_layouts/Header.vue:126,137` — header button + account-menu `download({ lang })`.
- `src/pages/home/PageHome.vue:212` — Home CV card `download({ template, lang })`.
- `src/pages/dashboard/PageAtsCheck.vue:58-68` — `handleBase({ method:'post', url:'cv/ats-check', data })`; `handleBase` supports `params` (`src/services/base.ts:17,25`). Download button :88.
- `src/pages/dashboard/PageApplication.vue:56-70` — `getProfileLinks` (shortcut comment, public pdfLink + publicLink, requires slug/email); template 174-186.
- `src/composables/useDownloadCv.spec.ts:18-170` — existing params/flow tests to extend.
- `src/pages/dashboard/PagePreview.vue:44-49`, `PageInformation.vue:140-151` — active-profile select + "unknown id → no filter" pattern.

## Questions + answers
- ats-check Q2 (operator 2026-11-07): "Change: send it once #400 lands — #448" → ATS check sending profile treated as in scope (Behavior 9). Issue body doesn't name it; the recorded operator answer ties it to #448.
- Q4 → **operator 2026-11-26: (a)** shared flow; cv-preview-export Out-of-scope line removed, 6a extended. Original: per-application PDF via shared `useDownloadCv` flow (overlay, Bearer) vs `?token=` new-tab link. Changes UX + reverses a cv-preview-export Out-of-scope line.
- Q5 → **operator 2026-11-26: (a)** leave as is, out of scope. Original: "View public CV" per application — leave / replace with owner Preview / other. Issue Expected names only the PDF.
- Not asked (decided from contract): stale active id sent as is (backend → unfiltered = Preview's behavior); "All profiles" → no param.

## Isolation proof
Fresh analyst spawn; task string = issue #448 text + caller's backend status check. No implementer reasoning or diff seen; no code written. Backend contract read directly from PR #455 diff, not from the caller.

## Round 2 (answers applied)
- cv-profiles.md: Behavior 10 (shared flow, `<button>`, overlay, shared state, explicit application profile wins over active), 11 (View public CV unchanged); acceptance + spec case for explicit `profile` override; Out of scope +2; Changelog row.
- Decided without asking (no observable change): per-app PDF button keeps today's show condition (profile exists + slug or email; email always exists).
- cv-preview-export.md: Out-of-scope line removed, 6a extended; job-applications.md: #5 sub-bullet + Out of scope updated.
