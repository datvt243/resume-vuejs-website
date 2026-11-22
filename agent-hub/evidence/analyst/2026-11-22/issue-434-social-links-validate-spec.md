# Analyst spec — issue #434 social links validation

- Date: 2026-11-22
- Branch: feature/issue-434-social-links-validate → superseded 2026-11-22 by coordinator: #434 + #436 ship on one node `issue-434-436-social-links-copy`, branch `feature/issue-434-436-social-links-copy` (see `issue-436-share-copy-link-spec.md`)
- Status returned: spec_ready
- Doc: `agent-hub/doctrine/features/personal-information.md` (UPDATED, no new doc — INDEX row already lists #434; doc Status left `verified` for the backfilled parts, new item 5a tagged "pending SEAL of its node")

## Task (verbatim)
Issue #434 "Social links: validate GitHub / LinkedIn / Website as http(s) URLs"
## Problem
The Social links form (`/dashboard/information`) accepts any text.
## Expected
Optional fields, but when filled each must be an `http`/`https` URL; invalid → field error (vi + en), no request.
Decided by the operator while confirming agent-hub/doctrine/features/personal-information.md (2026-11-07).

## Changes to the doc
- Behavior 5: dropped "(free text)"; added 5a (http/https only when filled, error key `validation.urlInvalid`, no request).
- Acceptance: 2 new criteria (spec test cases in `src/models/information.model.spec.ts`; live check message + no PATCH).
- Edge cases: legacy non-http(s) stored link blocks save until fixed/cleared; clearing stays valid.
- Out of scope: host matching, reachability, max length.
- Changelog row, node `issue-434-436-social-links-copy` (renamed from `issue-434-social-links-validate` at coordinator request).

## Sources read
- agent-hub/haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}
- agent-hub/doctrine/domains/PROJECT.md, agent-hub/doctrine/MEMORY.md, agent-hub/doctrine/features/INDEX.md (row 17), agent-hub/doctrine/features/personal-information.md
- src/models/information.model.ts (fields `modalSocial` unused — only referenced in a comment at PageInformation.vue:48; `socialMediaPayload`)
- src/pages/dashboard/PageInformation.vue:44-80, 204-214, 262-268 (real `socialMediaFields` live in the page, no `valid`)
- src/i18n/index.ts:159 / 696 — `validation.urlInvalid` exists in vi + en (no new key needed)
- src/models/award.model.ts:50, application.model.ts:68 — existing `.url('validation.urlInvalid')` convention
- src/models/information.model.spec.ts — existing spec
- Ran: yup 1.4.0 `string().url()` → `ftp://a.com` true, `https://github.com/a` true, `github.com/a` false, `javascript:alert(1)` false, `http://localhost` false. So `.url()` alone does NOT enforce http(s) — flagged in Behavior 5a.

## Questions + answers
- Q3 (2026-11-07, personal-information spec): "Social link fields have no URL validation. Intended?" → operator: "Change: validate http(s) when filled — #434". No further open questions blocking Behavior/Acceptance.
- Noted, not asked (non-blocking, implementer's call within the rule): whether surrounding spaces are trimmed before checking (other models use `.trim()`); `http://localhost` is rejected by yup's regex — irrelevant for public social links.

## Isolation proof
Spawned as a separate analyst subagent with only the task text + paths in the prompt; no implementer reasoning or diff seen (branch has no code diff for #434; `git status` shows only `.claude/skills/todo/SKILL.md` modified). All anchors above grep-confirmed in this spawn.
