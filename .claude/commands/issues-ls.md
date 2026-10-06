---
description: "List open GitHub issues for this repo, if it's hosted on GitHub. Read-only, no side effects."
argument-hint: "[--state open|closed|all] [gh issue list flags...]"
---

# /issues-ls — list GitHub issues for this repo

Read-only. Lists issues from GitHub if (and only if) this repo's remote is
a GitHub repo — no writes, no approval gate needed.

## Steps
1. **Check the remote is GitHub.** Run `git remote get-url origin` (fall
   back to another remote if `origin` doesn't exist). If it doesn't
   resolve, or the host isn't `github.com`, stop and report "not a GitHub
   repo — skip" — not an error, just nothing to do.
2. **Check `gh` CLI is available and authenticated.** Run `gh auth
   status`. If `gh` isn't installed or isn't authenticated, stop and
   report the exact output plus a one-line hint (`gh auth login`) — don't
   work around it (no calling the GitHub REST API directly with a token).
3. **List issues.** `gh issue list --state open --limit 50 --json
   number,title,labels,state,updatedAt,url` by default. If `$ARGUMENTS`
   is given, pass it through verbatim as extra flags to `gh issue list`
   instead of `--state open --limit 50` (e.g. `/issues-ls --state all`,
   `/issues-ls --label bug --assignee @me`), still adding the `--json`
   field list above unless the arguments already include their own
   `--json`.
4. **Display as a table**: issue number, title, **Status**, labels,
   state, updated-at, URL.
   - **Status** comes from the issue's `status: <value>` label (e.g.
     `status: pending` → `pending`, `status: waiting-backend` →
     `waiting-backend`). GitHub's own `state` is only `OPEN`/`CLOSED`, so
     this label is where the hub records finer-grained status (see
     `issue-122-ai-cv-suggestions-pending` /
     `issue-158-import-cv-pdf-waiting-backend` in
     `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md`). No `status:`
     label → `—`; more than one → show them all, comma-separated.
   - Leave the `status: *` labels out of the Labels column so they
     aren't listed twice.
   - Don't re-fetch per issue. The one `gh issue list --json` call has
     everything.
5. **No writes.** Never close/comment/edit an issue from this command —
   that's a separate manual `gh issue` call (or `/release`'s own
   issue-closing step), out of scope here.

## Runtime
Requires `gh` CLI authenticated against the project's GitHub remote. If
the repo isn't on GitHub, or `gh` isn't set up, report why and stop — no
fallback to scraping or an unauthenticated API call.
