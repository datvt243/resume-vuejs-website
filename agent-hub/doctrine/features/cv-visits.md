# Visit analytics

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-visits-spec.md`
- Source: backfill from code
- Issues: #454, #455, #456, datvt243/resume-nodejs-api#396
- Anchors: `src/pages/dashboard/PageVisits.vue`, `src/composables/useVisits.ts`, `src/composables/useVisitStats.ts`, `src/components/visits/VisitChart.vue`, `src/pages/_layouts/LayoutDefault.vue`, `src/pages/public/PagePublicResume.vue`

## Goal
The candidate sees how often their public CV was opened, from where, and when — and can wipe that history.

## Behavior
1. Visits are recorded when someone opens the public link (see `public-resume.md`).
2. When the signed-in layout mounts, it loads the visit list once per session (`GET api/v1/candidate/visits`) into the candidate store: `visitCount` (= `meta.total`, else list length) and `visits`. A failed load sets `visitsLoadError`. Home and this page read that cache.
3. `/dashboard/visits` heading: a range switch Day / Week / Month (default Day) and "Delete all" (disabled while there is a load error or no visits).
4. Stats come from `GET api/v1/candidate/visits/stats` with `interval`, `from` and the browser time zone: Day = last 30 days, Week = last 12 ISO weeks starting Monday, Month = last 12 calendar months. Changing the range reloads. Axis labels: `DD/MM`, "Week N", `MM/YYYY`.
5. KPIs for the range: views (hint shows the all-time total from the cached list); top source and top country, each with its share of views as a rounded percent, or "—" / "no data".
6. Chart of views per bucket (pulsing placeholder while loading).
7. Breakdowns: sources and countries, sorted by count descending, with share bars; no recorded referrer shows as "Direct / unknown", no geo match as "Unknown"; an empty range shows "no views in range".
8. Detail table of the cached visit list, 25 per page, with Prev/Next and a "from–to of total" label: time (`dd/mm/yyyy hh:mm`, `vi-VN` format; invalid → "—"), location (or "—"), IP (or "—"). Empty → empty state. If the page count shrinks, the current page moves back to the last page.
9. Either load failing → the whole page shows an error block with "Retry", which reloads only what failed.
10. Delete all: confirm dialog stating the number of visits, then `DELETE api/v1/candidate/visits`; on success both the list and the stats reload.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageVisits.spec.ts` passes.
- `npx vitest run src/composables/useVisits.spec.ts src/composables/useVisitStats.spec.ts src/components/visits/VisitChart.spec.ts` passes (`formatBucket`, `visitStatsFrom`).
- With 26 cached visits the table shows 25 rows and a second page.
- When the stats request fails, the page shows the error block, not "0 views".

## Edge cases
- A cached count of `0` is a real answer, not "not loaded" (no refetch).
- Visit with no `createdAt` → time "—".

## Out of scope
- Filtering out the owner's own visits.
- Exporting visit data.

## Open questions
1. The table shows the IP address of every visitor. Is showing raw IPs to the CV owner intended (privacy)? → **Answer (operator 2026-11-07):** Intended (owner's own analytics)
2. If the API paginates `GET candidate/visits`, the table only shows the first page while the "all-time" hint uses `meta.total`. Does the endpoint return all visits? → **Answer (operator 2026-11-07):** Change: use the API pagination once datvt243/resume-nodejs-api#396 lands — #454
3. Dates and numbers always use `vi-VN` formatting, even in the English UI. Intended? → **Answer (operator 2026-11-07):** Bug: format by app language — #455
4. "Delete all" has a normal confirm only, though it cannot be undone. Should it require typing, like skill deletion? → **Answer (operator 2026-11-07):** Change: typed `delete` — #456
5. The cached visit list is loaded once per session; new visits appear only after a reload or a retry. Intended? → **Answer (operator 2026-11-07):** Intended

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-visits-spec.md` | - |
