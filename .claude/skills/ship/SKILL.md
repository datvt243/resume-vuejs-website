---
name: ship
description: "Commit any pending changes on the current task branch, open a PR into `staging`, and merge it — for resume-vuejs-website. Usage: /ship [\"<commit message>\"]. Refuses to run directly on `main` OR `staging` (both are GitHub branch-protected as of 2026-08-30 — no raw git push works on either anymore). Requires npm run build green first. Deletes fix/* branches after merge, keeps feature/* branches. Invoking /ship IS the seal-gate approval, no extra confirmation asked. `main` only ever receives code via `/release`, never `/ship` — see `.claude/skills/release/SKILL.md`."
---

# /ship ["<commit message>"] — commit, PR + merge branch → staging

`args` (optional) is the commit message. If empty, infer one from the
current diff following Conventional Commits (`fix:`/`feat:`/`docs:`/
`chore:`...), matching the repo's actual commit history style
(`git log --oneline`).

Calling `/ship` IS the approval for this outward-facing action (Seal Gate,
see `agent-hub/CLAUDE.md`) — don't ask for confirmation again, unless you
hit a blocker (red build, currently on `main`/`staging`, PR blocked...).

> **2026-08-30 change**: `main` and `staging` are both real GitHub
> branch-protected branches now (PR required, 0 approvals needed,
> `enforce_admins: true`, no force-push, no deletion). A raw `git push`
> to either is rejected with `GH006` — verified directly, not assumed.
> `/ship` now targets `staging` (not `main`) and merges via `gh pr
> create` + `gh pr merge`, never a bare `git merge && git push`. `main`
> is production — it only receives code through `/release`
> (`.claude/skills/release/SKILL.md`), which merges `staging -> main`
> after a real build+lint gate and a version bump.

## Steps
1. `git branch --show-current`.
   - On `main` or `staging` + clean working tree → report "`<branch>` is
     clean, nothing to ship", stop.
   - On `main` or `staging` + uncommitted changes → **REFUSE** to ship
     directly on a protected branch (`MAIN_EDIT`-equivalent — the rule
     now covers both). Tell the operator, suggest
     `git checkout -b <branch> staging` first (new work branches off
     `staging`, not `main`), then call `/ship` again.
2. On a branch that is neither `main` nor `staging`:
   a. `npm run build` (the exact command from
      `agent-hub/doctrine/MEMORY.md`) — READ BACK the output verbatim. Red
      → stop immediately, do NOT commit/PR, report the real error to the
      operator.
   b. If `git status --short` is non-empty: `git add` exactly the files
      relevant to the current change (don't add unrelated
      junk/artifacts), commit with the given message or an inferred one,
      ending with a `Co-Authored-By: Claude <model> <noreply@anthropic.com>` line naming
      the model actually running this session (use the attribution line from
      the session context if one is given; never hardcode a model name).
   c. `git push -u origin <branch>` (pushing a brand-new/updated feature
      branch is unaffected by `staging`/`main`'s protection — only those
      2 branches reject direct pushes).
   d. `gh pr create --base staging --head <branch> --title "<commit
      title>" --body "<short summary>"` — target is `staging`, never
      `main`.
   e. `gh pr merge <PR#> --merge` — real merge commit, not squash/rebase
      (matches this repo's existing merge-commit convention). If `gh pr
      merge` reports the PR is blocked (pending checks, conflicts) — stop,
      report the real `gh` output, don't force-merge.
   f. Delete the local (and now-merged remote) branch depending on its
      kind:
      - Name starts with `fix/...` (bugfix) → `git branch -d <branch>` +
        `git push origin --delete <branch>` (delete — a fix branch's
        lifecycle ends once merged).
      - Name starts with `feature/...` (new feature) → **KEEP IT**
        locally, but the remote copy can still be deleted (GitHub already
        offers this post-merge) — ask if unsure, don't auto-delete a
        `feature/*` branch's local copy.
      - Any other name that doesn't match the two patterns above (e.g.
        `chore/...`, `docs/...`, `work/<node>`) → treat as fix-like,
        delete after merge (safe default, fewer stray branches).
3. Report the result briefly: commit hash, PR number + merge commit,
   branch merged, whether it was deleted or kept, whether push succeeded
   — don't repeat the diff content (it's already in git log).

## Rules
- NEVER attempt a raw `git push` to `main` or `staging` — both reject it
  (`GH006`, verified 2026-08-30). Everything into either goes through
  `gh pr create` + `gh pr merge`.
- NEVER merge if `npm run build` is red.
- NO force-push, NO `--no-verify`, NO skipping hooks, NO `gh pr merge
  --admin` to bypass a blocked check.
- If the repo is mid merge-conflict or mid-rebase → stop, tell the
  operator, don't `--abort`/`-X ours` on your own.
- Files under `agent-hub/` in the diff still get added/committed normally,
  but when reporting in step 3, follow the terse rule: name the file only,
  don't show its content.
- `/ship` does not run the verifier itself. If the branch name matches
  `fix/issue-<n>-...`/`work/<node>`, do a quick check of
  `agent-hub/haven/diagrams/*.md` — if the related node isn't `SEALED` yet,
  shipping is still allowed (this is a plain git/PR command) but warn the
  operator with one short line.
- `/ship` never touches `main` — that's exclusively `/release`'s job.
