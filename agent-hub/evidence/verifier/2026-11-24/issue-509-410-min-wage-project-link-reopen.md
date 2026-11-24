# Verdict: REOPEN - issue-509-410-min-wage-project-link (2026-11-24)

- Node: `issue-509-410-min-wage-project-link` · Branch: `feature/issue-509-410-min-wage-project-link` (dedicated, NoMainEdit ok)
- Evidence note: `evidence/implementer/2026-11-24/issue-509-410-min-wage-project-link-plan.md`

## Cited (ok)
- #509: all `salary-calculator.md` Behavior 10 criteria cited with output (spec rows 150M/2dep, region IV 808,000, effectiveFrom/regionalMinWage test, grep 293/2025 absent + 399/2026 at line 12). `npm run test` 489 passed, lint exit 0, build ok, typecheck 78 = baseline, none in touched files. Review + Feature doc + Supersedes + Seal gate lines present.

## Missing (REOPEN reasons)
1. `cv-timeline-sections.md` #410 acceptance requires `project.model.spec.ts` to cover `'  '` (whitespace-only) as valid and the >100-char case failing with the `validation.maxChars` message. The new spec (note's Diff table) tests only `''`, a valid URL, `'abc'`, and a 100+ char URL returning false. No whitespace-only case and no maxChars message assertion, so no evidence for either.
2. The doc's Manual criterion (QA account, `/dashboard/project`: empty Link sends `POST api/v1/project/create`; `abc` shows URL error and sends no request) has no evidence. The note says "Not checked live". The doc names this as an acceptance criterion; "covered by specs" does not substitute.

## Forbidden states
None hit (NoMainEdit ok, diagram row present, evidence written). Verdict is REOPEN only for the missing evidence above.

## Isolation proof
Spawned fresh via Agent tool, description "Verify issue-509-410 seal" style task string from the parent ("Run /worker verifier ... node issue-509-410-min-wage-project-link"); this context did not write the diff and holds none of the implementer's reasoning.

## Re-run
none
