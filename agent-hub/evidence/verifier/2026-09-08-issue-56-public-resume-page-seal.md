# 2026-09-08 — issue-56-public-resume-page — SEAL

- Worker: verifier
- Node: `issue-56-public-resume-page`
- New PM status: SEALED

## Isolation proof
This pass runs as the background job explicitly launched with the task
"Run `/worker verifier '#56'` for resume-vuejs-website," whose own
instructions state it is "a DIFFERENT session than [the implementer]
— you are the required fresh, independent verifier subagent." This
session never wrote any part of `feature/issue-56-public-resume-page` —
it opened the repo fresh, read the implementer's evidence note as its
first action on this node, and only then read the diff/backend source
directly to check the note's claims (`NeverVerifyOwnWork` satisfied by
construction; separation confirmed by having zero prior context on this
branch before this run).

## Reasoning
Read the note first (`evidence/implementer/2026-09-08-issue-56-public-resume-page.md`),
then independently checked every claim against the real repo/branch/
backend rather than trusting the prose:

- **Branch** — `git status`/`git rev-parse --abbrev-ref HEAD` confirm
  `feature/issue-56-public-resume-page`, checked out cleanly, no commits
  yet ahead of `staging` (`git log staging..feature/issue-56-public-resume-page`
  empty) → matches note, `NoMainEdit` satisfied.
- **Diff scope** — `git diff staging --stat -- src/` (with `git add -N`
  on the untracked new file to make it visible to diff) shows exactly 2
  files: `src/routers/index.ts` (+8) and the new
  `src/pages/public/PagePublicResume.vue` (+275). `PagePreview.vue` and
  every other file the note says it deliberately left alone are
  confirmed untouched. Matches note, satisfies `SmallestDiff`.
- **Route/auth bypass** — read `src/routers/index.ts` directly: the new
  `/resume/:email` route object has no `meta.requiresAuth`, and the
  `beforeEach` guard's `to.matched.some(record => record.meta.requiresAuth)`
  check is therefore false for this route, falling straight to `next()`
  — genuinely public, same mechanism as `NotFound.vue`. Confirmed by
  reading the guard code, not inferred.
- **No `v-html`** — `grep -n "v-html" src/pages/public/PagePublicResume.vue`
  → no matches. CKEditor-authored fields (`introduction`, `career`,
  `careerGoal`, section `description`s) are all rendered via
  `{{ getLocalizedText(...) }}` double-brace interpolation, which Vue
  escapes. `getLocalizedText`/`wrapLocalizedText` in
  `src/utilities/index.ts` are pre-existing (confirmed
  `git diff staging -- src/utilities/index.ts` is empty) — not part of
  this diff, just reused.
- **Backend investigation, verified against the real sibling repo**
  (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`), not just
  taken from the note's prose:
  - `src/routers/index.ts` — `router.get('/api/me/:email', fnGetAboutMe)`
    and `router.post('/api/me/:email/visit', fnRecordVisit)` are declared
    directly on the top-level router, alongside (not nested under)
    `router.use('/api/v1', routerAPI)`. `src/routers/api/v1/index.ts`
    applies `verifyToken` per-route (`router.use('/candidate',
    verifyToken, routeCandidate)`, etc.) — confirming `/api/me/:email`
    and its `/visit` sibling sit genuinely outside that gate.
  - `src/candidate_me/index.ts` (`fnGetAboutMe`) — read in full: returns
    `formatReturnFailed('Email không tồn tại')` for BOTH "document not
    found" and `isPublic === false`, byte-identical message in both
    branches — confirms a private profile can't be distinguished from a
    nonexistent one, exactly as the note claims.
  - `src/models/candidate.model.ts:51` — `isPublic: { type: Boolean,
    default: true, ... }` — confirms default-public, matches note.
  - `fnRecordVisit`/`handlerRecordVisit` — reads `email` param, no auth
    middleware in its route declaration, creates a `Visit` doc keyed by
    `candidateId` — matches note's description of what the visit
    recorder does.
  - Live check: `curl https://nodejs-resume-api-ts.onrender.com/api/me/votan.it@gmail.com`
    with no `Authorization` header → real `success:true` payload
    containing `introduction` as raw HTML (`"<p>I am a Frontend
    Developer..."`), `generalInformation`, etc. — confirms the endpoint
    really is live, public, and returns the shape the new page reads.
    (Did not repeat the live `POST .../visit` call myself — the note
    already exercised it end-to-end against the same live account and a
    second identical write against production isn't needed to confirm
    the *code path*, which is already fully confirmed by reading
    `fnRecordVisit`'s source directly; avoids an extra unnecessary
    production DB write.)
- **Build** — re-ran `npm run build` from repo root myself:
  `✓ built in 5.54s`, `dist/assets/PagePublicResume-lDrCJ98e.js` present
  as its own lazy chunk (same content hash as the note's own build
  output) → matches.
- **Lint** — re-ran `npm run lint`: exit clean, no output → matches.
- **Tests** — re-ran `npm run test -- --run` three times: got
  `2 failed | 90 passed (92)` once (byte-identical to the note's claimed
  numbers) and `3 failed | 89 passed (92)` twice, the extra failure each
  time being a NON-"BUG"-named test in the same file
  (`VeeForm.spec.ts > clicking submit on a pristine form calls submitFn
  anyway...`) flipping pass/fail between runs. This is pre-existing
  flakiness, not a regression from this diff: `git diff staging --stat --
  src/components/veevalidate/` is empty (independently reconfirmed, not
  just trusted from the note), so nothing in this branch touches that
  file or its dependencies. The note's claimed count is accurate for
  *some* runs but understates the file's actual flakiness; since the
  acceptance criterion is "no regression" and the diff provably cannot
  have caused it, this doesn't block SEAL, but is recorded here — the
  flake itself may be worth its own `PROJECT.md` Traps row in a future
  pass (not this node's job to fix).
- **Layout note** — `src/App.vue` picks `LayoutDefault`/`LayoutAuth`
  purely by `store.isAuthenticated` (`<component :is="store.isAuthenticated
  ? LayoutDefault : LayoutAuth">`), not by route — confirmed by reading
  the file, matches note's "pre-existing, not introduced here" claim.
- **Header.vue precedent** — `_settings.getMe()` builds
  `${host}api/me/${email}` already, confirming the raw-JSON-link intent
  predates this page, as the note states.
- **`current-page` localStorage** — `beforeEach`'s
  `if (path !== '/') localStorage.setItem('current-page', path)` applies
  unconditionally to every route including the new one — confirmed
  pre-existing, not new.
- **Seal gate** — no commit exists on this branch
  (`git log staging..feature/issue-56-public-resume-page` empty, only
  uncommitted working-tree changes) — matches note's "no outward-facing
  action taken," no approval needed for anything beyond the (already
  logged) live GET curl and the note's own prior live POST.

All 8 acceptance-criteria rows in the note have citable, independently
reproduced evidence. No forbidden state hit (`ADHOC_WORK`, `NO_EVIDENCE`,
`EDIT_UNVERIFIED`, `CODE_IN_HAVEN`, `DIAGRAM_DRIFT`, `MAIN_EDIT` all
checked — none apply). Diff is proportional to the task; explicitly
declined scope creep (`PagePreview.vue` extraction, `isPublic` dashboard
toggle, `v-html` switch) is justified and logged, not silently skipped.

## Re-run
partial — re-ran `npm run build`, `npm run lint`, and `npm run test --
run` (the last one 3x) myself from repo root, per this task's explicit
instruction to independently re-run and read output back verbatim (a
stronger bar than this recipe's own cost-driven "audit only" default,
justified here because the node touches a new public/unauthenticated
surface and cross-repo backend claims). Did not repeat the live `POST
.../visit` call — the GET side was independently re-verified live, and
the POST code path was independently confirmed by reading
`fnRecordVisit`'s source directly instead of re-issuing a redundant
production write.

## Hub bytes
before=100045 (from the implementer note), after=106695
(root=12393 doctrine=27207 diagram=40978 impl=14963 verif=11154,
measured after updating this node's PM status to SEALED).
