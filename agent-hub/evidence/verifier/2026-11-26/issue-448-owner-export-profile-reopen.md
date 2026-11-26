# 2026-11-26 - issue-448-owner-export-profile - REOPEN

- Worker: verifier · Node: `issue-448-owner-export-profile` · New PM status: stays IN_PROGRESS (REOPEN is a verdict, not a state)
- Note audited: `evidence/implementer/2026-11-26/issue-448-owner-export-profile-plan.md`

## Isolation proof
Spawned fresh via the Agent tool, description "agent-hub VERIFIER worker ... verify one node", blank context; did not write the diff.

## Reasoning (audited from the note; diff opened only to confirm cited hunks)
- Branch `feature/issue-448-owner-export-profile` (not main/staging): ok. Feature doc cited: ok. Review section: ok (no unresolved correctness finding). Typecheck 74 <= baseline 75, 0 in touched files: ok. test 525 passed / build / lint 0: ok. Comments row: ok.
- Specs criteria (useDownloadCv active/empty/late-set, explicit profile wins, useActiveProfile 4/4): cited, met.
- Live header/Home/ATS download + ATS check query + per-application button: request URLs and statuses cited, met.

## Missing
1. `## Seal gate` section is absent (required by `evidence/README.md` implementer format; recipe step 8). The pass made external API calls to the production backend, including creating and deleting a profile and an application and toggling `isPublic` on a CV. The note records no operator approval (or "none" with justification) for these outward-facing writes/deletes. Seal gate invariant 7 -> cannot SEAL.
2. Cv-profiles.md acceptance (#448, 2nd and 4th bullets) require "the saved PDF contains exactly 1 experience" and "the file saves as `<CV file name>_VI|_EN.pdf`; Cancel -> request canceled, no file". The note itself states these were NOT live-verified (PDF text not read, only a 101705 B vs 69900 B size drop; file name and Cancel not observed). Inference from size is not citable evidence of the criterion. Either read the PDF content (e.g. a text-extraction tool) and observe the saved name/Cancel, or get the operator to accept the stated limit and record that answer in the note.

## Re-run
none - audit-only; no exception case in "Re-run scope" applies to the verdict.
