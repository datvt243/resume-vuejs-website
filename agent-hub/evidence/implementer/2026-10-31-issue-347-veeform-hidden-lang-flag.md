# 2026-10-31 — issue-347-veeform-hidden-lang-flag

- Worker: implementer · Version: 0.1.0
- Node: `issue-347-veeform-hidden-lang-flag` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "#347 [TEST] VeeForm.spec.ts: test 'flags the hidden language that has a validation error' hỏng (gần như luôn luôn)". Operator ran `/todo #347`.

## Hub bytes before: 2568964 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`, same method as the previous notes)

## Branch
`fix/issue-347-veeform-hidden-lang-flag` (off `staging` @ `84cd237`, via `gh issue develop 347`).

## Acceptance criteria
1. The VI|EN "flags the hidden language" test passes reliably: the file run alone passes 5 times in a row, and `npm run test` passes 3 times in a row.
2. The cause is identified as either a test-timing bug or a real component bug (the issue's two hypotheses). A component bug would be fixed in the component, a timing bug in the test.
3. Build/lint pass; typecheck stays at the baseline.

## Root cause (probed, not assumed)
A throwaway probe spec (copied the test, logged state, then deleted it) showed that after clearing the VI field:
- after `flushPromises()`: VI tab text `"VI"`, no `border-danger`.
- after a 50 ms real-timer wait plus `flushPromises()`: `"VI!"` and `border-danger` both present.
So the component flags correctly. vee-validate runs schema validation on a short real timer that `flushPromises()` doesn't wait for, and the test asserted too early. That rules out a component bug (hypothesis 2).

The same probe against `typing then clearing a required field…` showed the submit button's `disabled` is `undefined` right after `flushPromises()`, and `""` (set) after 50 ms. So the two tests named `BUG (real, verified)…`, which claim `meta.valid`/the submit guard is dead, were wrong. The guard works; those tests asserted before validation landed. They pass early and fail when validation finishes first, which is the "2nd failure only under full-suite load" recorded in `2026-10-27-issue-312-visits-error-retry.md`. Same root cause and same file, so they're fixed here.

## Diff
| file | why |
|---|---|
| `src/components/veevalidate/VeeForm.spec.ts` | VI\|EN test: `vi.waitFor` on the `!` instead of one `flushPromises()`. `BUG…does NOT disable submit` became `typing then clearing a required field disables submit`, which `vi.waitFor`s the `disabled` attribute. `BUG…still calls submitFn` became `…does not call submitFn` (waits for disabled, clicks, expects not called). Removed the two long comments that documented the wrong "dead guard" conclusion. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

No `src/` component change.

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- Before (clean branch): `npx vitest run src/components/veevalidate/VeeForm.spec.ts -t "flags the hidden"`: `AssertionError: expected 'VI' to contain '!'` / `Tests  1 failed | 18 skipped (19)`
- After, `npx vitest run src/components/veevalidate/VeeForm.spec.ts` 5 times: `Tests  19 passed (19)` every time
- After, `npm run test` 3 times: `Test Files  50 passed (50)` / `Tests  303 passed (303)` every time
- `npm run build`: `✓ built in 5.83s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS`, the same as the baseline. 0 in `VeeForm.spec.ts`.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Reliable pass | 5/5 file runs and 3/3 full runs green (was 5/5 failing) |
| 2. Cause identified, fixed in the right place | probe output above: the component flags after the debounce, so this is a test-timing fix |
| 3. build/lint/typecheck | as listed above |
| Comments per code-comments.md | One comment added: a 1-line why-comment in the `disables submit` test (`vee-validate debounces schema validation on a real timer, so flushPromises alone can assert too early`). Two multi-line comments removed because they stated a disproved conclusion. No `(#N)` refs. |

## Manual observation
Not done in a live browser. The probe is a real mount of `VeeForm.vue` in jsdom, not a live UI check.

## Supersedes: none
## Still open: none for #347

## Noticed, not done
- CI (`.github/workflows/ci.yml`) still runs only lint + build, not `npm run test`, which is how this went unnoticed. Adding a test step is now viable (suite fully green 3/3), but it's a separate change.
- The evidence notes that recorded the "dead `meta.valid` guard" finding are historical, so I left them as-is. Nothing in `doctrine/` repeats the claim (grep for `meta.valid` / `dead guard`: no hits).

## Seal gate
none (no commit/push; no data written)
