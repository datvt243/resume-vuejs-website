---
name: release
description: "Release staging → main for resume-vuejs-website: real build+lint gate, semver bump, annotated git tag, relies on the existing gh-pages deploy workflow, syncs the bump back to staging, closes issues actually shipped in this release. Usage: /release [major|minor|patch] (default: minor). Both main and staging are GitHub branch-protected (PR required, 0 approvals needed, enforce_admins on) — every step here goes through `gh pr create`/`gh pr merge`, never a raw `git push` to either branch."
argument-hint: "[major|minor|patch]"
---

Base directory for this skill: `.claude/skills/release`

# /release [major|minor|patch] — ship staging → main

> Not a self-approving pass — running `/release` IS the operator's
> go-ahead for every outward-facing action below (PR create/merge, tag
> push, issue close), per `agent-hub/CLAUDE.md`'s seal gate. Don't pause
> to ask again mid-flow unless you hit a real blocker (red build, nothing
> to release, PR blocked, `gh` auth failure).

## Why this shape (read once, then follow the steps)
`main` and `staging` are both real GitHub branch-protected branches
(`enforce_admins: true`, PR required with `required_approving_review_count: 0`,
no force-push, no deletion — set up 2026-08-30). That protection means
**no branch ever accepts a raw `git push` again, including from this
skill** — every change lands via `gh pr create` + `gh pr merge`, even
where a plain `git merge && git push` would have worked before. This is
why the version bump happens as its own tiny PR into `staging` FIRST
(step 3) rather than as a bare commit added after the `staging -> main`
merge the way a first draft of this workflow might assume — `staging`
already carries the bump by the time it merges into `main`, so there is
nothing left to "sync back" except a drift-check (step 8).

## Branch-off rule (applies to ALL work from now on, not just this skill)
Every `fix/feature/hotfix` branch is cut from `staging`, PRs target
`staging`. `main` only ever receives code via this `/release` skill
merging `staging` into it. `/ship` (see its own SKILL.md) enforces the
`staging`-not-`main` half of this; this skill enforces the
`main`-only-via-release half.

## Steps

### 0. Guard
- `git branch --show-current` — if mid-merge/mid-rebase, stop, report,
  don't `--abort` unilaterally.
- `gh auth status` — if not authenticated, stop, report the real error.

### 1. Anything to release?
```bash
git fetch origin main staging
git log origin/main..origin/staging --oneline
```
Empty → stop, report "nothing to release, staging == main", don't create
an empty PR.

### 2. Pre-flight build+lint on `staging` — BEFORE any merge
```bash
git checkout staging && git pull
npm run lint   # exact command from agent-hub/doctrine/MEMORY.md
npm run build  # exact command from agent-hub/doctrine/MEMORY.md
```
READ BACK both outputs verbatim. Either red → **stop immediately, do not
create any PR**, report the real error to the operator.

### 3. Version bump — special-case FIRST, then the normal path
```bash
git tag -l | sort -V | tail -1   # latest tag, empty if none exist yet
```
- **If NO tag exists at all in the repo**: don't bump anything. The
  release version IS whatever `package.json`'s `"version"` field already
  says. Skip straight to step 4's PR (no version-bump PR needed) — there
  is nothing to change, just merge and tag the current version as-is.
- **Otherwise** (the normal path, and what this repo's first `/release`
  run actually does — a `v1.0.0` tag already exists here): compute the
  new version from the latest tag using semver, bump type from `$ARGUMENTS`
  (`major`/`minor`/`patch`), **default `minor`** — chosen deliberately
  (not `patch`) because this repo's real history is dominated by
  `feat:`-sized batches, not tiny patches; see
  `doctrine/domains/PROJECT.md` → Decisions for the reasoning trail once
  this skill's first real run adds one. Then:
  ```bash
  git checkout -b release/vX.Y.Z-version-bump staging
  # edit package.json "version" field to X.Y.Z by hand (jq/sed both fine,
  # just don't touch any other field)
  git add package.json
  git commit -m "chore(release): bump version to vX.Y.Z"
  git push -u origin release/vX.Y.Z-version-bump
  gh pr create --base staging --head release/vX.Y.Z-version-bump \
    --title "chore(release): bump version to vX.Y.Z" \
    --body "Version bump for the upcoming vX.Y.Z release."
  gh pr merge <PR#> --merge   # real merge commit, not squash
  git checkout staging && git pull
  git branch -d release/vX.Y.Z-version-bump
  git push origin --delete release/vX.Y.Z-version-bump
  ```
  The branch-delete step is not optional — a `release/*` branch left
  behind after merge is pure litter (it can never be reused, the next
  release picks a new version number). Audit finding 2026-09-01: this
  step was missing from the original skill and left 2 merged-but-
  undeleted branches (`release/v1.2.0-version-bump`,
  `release/v1.3.0-version-bump`) on the remote before it was added.
  Re-run `npm run lint` + `npm run build` on the now-bumped `staging` tip
  — same rule as step 2, red → stop, don't proceed to step 4.

### 4. `staging` → `main`, real merge commit (never squash)
```bash
gh pr create --base main --head staging \
  --title "release: vX.Y.Z" \
  --body "$(git log origin/main..staging --oneline)"
gh pr merge <PR#> --merge
```
`--merge` (not `--squash`, not `--rebase`) is load-bearing: it's what
keeps `staging`'s real commit history visible on `main` — squashing here
would silently defeat the whole point of a 2-tier workflow.

### 5. Tag
```bash
git checkout main && git pull
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

### 6. Deploy check (no separate hook — this repo relies entirely on the
existing `.github/workflows/deploy.yml`, which auto-triggers on push to
`main`; confirmed with the operator 2026-08-30, no `DEPLOY_HOOK_URL` or
similar exists or is wanted here)
```bash
sleep 5
gh run list --workflow=deploy.yml --branch=main --limit=1
```
Report the run's status/URL. Don't block on it finishing — GitHub Pages
deploys can take a minute; just confirm the run actually started (proof
the merge triggered it), don't claim "deployed" without that.

### 7. Sync-back check (see "Why this shape" — normally a no-op by
construction, not a real sync step)
```bash
git diff staging main -- package.json
```
Empty → confirmed already in sync (expected, since `staging` carried the
bump into the merge). Non-empty → something drifted; open a small
`staging <- main` PR to reconcile (`gh pr create --base staging --head main`,
merge it) rather than silently ignoring the mismatch.

### 8. Close issues actually shipped in this release
`Closes #n`/`Fixes #n`/`Resolves #n` in "Closes #n" don't auto-close
anything here, because those commits merged into `staging` first, not
`main` — GitHub only auto-closes on a merge into the repo's **default**
branch. Do it by hand instead:
```bash
git log <PREVIOUS_TAG>..vX.Y.Z --format="%B" \
  | grep -iEo "(close[sd]?|fix(e[sd])?|resolve[sd]?) #[0-9]+" \
  | grep -Eo "[0-9]+" | sort -un
```
For each number found: `gh issue view <n> --json state` first — if
already `CLOSED` (common on this repo's very first `/release` run, since
most of these references predate this workflow and were auto-closed
under the old direct-push-to-main setup), skip it silently, don't
re-open/re-close/error. If `OPEN`, close it for real:
```bash
gh issue close <n> --comment "Released in vX.Y.Z."
```
Never close an issue just because its number appears somewhere in a
commit message without one of those 3 keywords right before it — that's
how a stray "#7" mentioned in prose would get misread as a close.

### 9. Report
```
🏷️  Released: vX.Y.Z (previous: vPREV)
🔀 PR #<n>: staging -> main (merge commit <sha>)
🚀 Deploy run: <gh run URL>, status: <queued|in_progress|...>
🔁 Sync-back: already in sync | opened PR #<n> to reconcile
✅ Issues closed: #a, #b (or "none newly closed")
```

## Hard rules
- NEVER `git push` a commit directly onto `main` or `staging` — both
  reject it anyway (`GH006`, verified 2026-08-30), but don't even try;
  everything goes through `gh pr create` + `gh pr merge`.
- NEVER `gh pr merge --squash`/`--rebase` for the `staging -> main` PR in
  step 4 — must be `--merge`, preserves history, non-negotiable per the
  operator's explicit ask.
- NEVER merge (any PR in this flow) if the build/lint gate in step 2 (or
  its re-check in step 3) is red.
- NEVER skip the "already closed?" check in step 8 before closing an
  issue.
- If `gh pr merge` reports the PR is blocked (checks pending, conflicts)
  — stop, report the real `gh` output, don't force-merge, don't retry
  blindly.
