# Contributing

Thanks for helping. This file is the human summary of how changes land
here. The agent-side source of truth is `agent-hub/doctrine/domains/PROJECT.md`
— if the two ever disagree, PROJECT.md wins and this file gets fixed.

## Ways to contribute
- **Report a bug** — open an issue (see below). Security problems: do NOT
  open a public issue; contact the maintainer privately.
- **Suggest a feature** — open an issue describing the problem first, not
  just the solution.
- **Fix / build something** — every change starts from an issue, so each
  branch, PR and release note traces back to one.

## Opening an issue
- Title: `[<GROUP>] short summary`, where `<GROUP>` is the area or
  campaign (`[AUTH]`, `[QC]`, …) — `/issues-ls` groups by it.
- Priority: label `priority: highest|high|medium|low|lowest` (or a title
  tag `[P0]`–`[P4]`). Status beyond open/closed: `status: <value>` label.
- Bugs: steps to reproduce, expected vs. actual, browser/environment,
  logs/screenshots.

## Development setup
Node.js 20 (CI), npm.

| What | Command |
|---|---|
| Install | `npm ci` |
| Run locally | `npm run dev` → http://localhost:5173 |
| Lint | `npm run lint` — clean (0 errors); any error fails |
| Typecheck | `npm run typecheck` (`vue-tsc --noEmit`) — known baseline of 78 inherited errors; add none, especially in files you touch |
| Test | `npm run test` (coverage: `npm run test:coverage`; one file: `npx vitest run <path>`) |
| Build | `npm run build` (output `dist/`) |

Run lint, typecheck, test and build before opening a PR — CI runs lint + build.

## Branch model
```
fix/feature/chore/docs branch  →  PR  →  staging  →  release PR (/release)  →  main  →  deploy (gh-pages)
```
- **`staging`** — integration. Every branch is cut from it and its PR
  targets it.
- **`main`** — production. Only receives the release PR from `staging`.
  Nobody branches off it; no other PR targets it.

Always branch from a freshly pulled base:
```bash
git checkout staging && git pull
git checkout -b fix/issue-<n>-<slug>   # or feature/<slug>, chore/<slug>, docs/<slug>
```

### Branch naming
`fix/issue-<n>-<slug>` | `feature/<slug>` | `chore/<slug>` | `docs/<slug>`
— e.g. `fix/issue-34-converttotruncate-length`.
- `<slug>`: kebab-case, short.
- The prefix decides what `/ship` does after merge: `fix/*` is deleted,
  `feature/*` is kept, everything else deleted.
- Put the issue number in the name when there is one
  (`feature/issue-405-cv-filename`) — `/ship` turns it into `Closes #<n>`
  in the PR body; without it the issue won't close on release.

## Commit messages
[Conventional Commits](https://www.conventionalcommits.org/):
`<type>(<scope>): <summary>` — e.g. `fix(cv): keep section order on save`.
`feat` → minor bump, `fix`/`perf` → patch, `!` or `BREAKING CHANGE:` → major.

## Pull requests
- Target `staging`; body contains `Closes #<n>`.
- One issue per PR; keep it reviewable.
- CI (`.github/workflows/ci.yml`: `npm run lint` + `npm run build`) runs on
  every PR into `main`/`staging` — keep it green. It is not yet a
  *required* check (see Branch protection), so don't merge on red.
- Never `--force` push a shared branch, never `--no-verify`. A failing
  hook or check gets fixed, not bypassed.
- Merge with a real merge commit (`gh pr merge --merge`), on feature PRs
  and the release PR alike.

## Branch protection
Both `main` and `staging` are GitHub branch-protected (2026-08-30):
`enforce_admins: true`, PR required, no force-push, no deletion. A
direct `git push` is rejected (`GH006`), owner included — verified for
real. No required status checks yet: CI runs but doesn't block a merge.

### Why `required_approving_review_count: 0`
Solo-maintainer repo, and GitHub won't let an author approve their own
PR — `1`+ would make every PR unmergeable. `0` still forces every change
through a PR (diff, CI, audit trail). Raise it when a second maintainer joins.

## Releasing `staging` → `main`
`/release [major|minor|patch]` (default `minor`) runs, in order:
1. Gate: `npm run lint` + `npm run build` on `staging` — red stops here.
2. Version bump via its own small PR into `staging`, so `staging` carries
   the bump before it reaches `main`.
3. Release PR merged with `--merge` (real merge commit), annotated tag `vX.Y.Z`.
4. Push to `main` triggers deploy: `.github/workflows/deploy.yml` → `gh-pages`
   (lint + build + publish `dist/`). `/release` confirms the run started.
5. Close the issues this release actually shipped (`Closes`/`Fixes`/
   `Resolves #n`, checked against each issue's current state).

### Why the release merges with `--merge`, never squash
Squash collapses every commit of the release into one, losing which
change did what. A merge commit keeps each reviewed commit on `main`,
tied to the release tag, so `git bisect` / `git blame` / audits stay precise.

### Why issues don't close when a PR merges into `staging`
GitHub only auto-closes `Closes #n` on a merge into the **default**
branch (`main`). Issues merged into `staging` stay open (shown as
`done-dev` by `/issues-ls`) until the release PR carries them to production.

## Working with Claude Code (agent-hub)
| Task | Command |
|---|---|
| Orient a session | `/boot` |
| Issue → branch → implement → verify | `/todo "<task>"` or `/todo #<n>` (`--ship` to ship after SEAL) |
| Commit → PR → merge into `staging` | `/ship ["message"]` (needs `npm run build` green) |
| List issues, fix-first order | `/issues-ls --group` |
| Release to production | `/release [major\|minor\|patch]` |

`/ship` refuses to run on `main`/`staging`. Agent rules (forbidden
states, seal gate, verifier): `agent-hub/CLAUDE.md`.
