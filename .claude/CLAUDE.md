# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
**resume-vuejs-website** — Resume/CV management SPA. Users manage structured resume data (education, experience, projects, awards, certificates, references) via a Node.js REST API.

- **Repo:** https://github.com/datvt243/resume-vuejs-website
- **Live:** https://datvt243.github.io/resume-vuejs-website/
- **Backend:** https://nodejs-resume-api-ts.onrender.com/api/v1/ (Render free tier, cold start ~30s)
- **Branch:** `main` → auto-deploys to `gh-pages` via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`; CI (`.github/workflows/ci.yml`, lint + build) also runs on push/PR to `main`

## Stack
Vue 3 + Vite 5 · Pinia · Vue Router 4 · VeeValidate 4 + Yup · Axios · Bootstrap 5 · CKEditor 5 · FontAwesome 6 · SweetAlert2 · TypeScript (partial — see gotchas)

## Commands
```bash
npm run dev      # http://localhost:5173
npm run build    # output: dist/
npm run preview
```

## Key Architecture Patterns

### 1. Model-Driven Forms
Every data section has a `src/models/*.model.ts` file — an array of `modelItem[]` that defines both UI config and Yup validation in one place. `VeeForm.vue` consumes it to auto-render fields.
```ts
// modelItem shape (src/types/model.type.ts)
{ name, label, type, default, valid?: (yup) => schema, col?, convertTo?, options? }
```

### 2. Composables CRUD Pattern
- `useCandidate(field, collection?)` — fetches & caches list data by field name into Pinia, exposes `addRecordToList`, `removeRecordById`
- `useDocument(collection, fields)` — generic CRUD: `updateDoc` (POST/PUT by `_id` presence), `deleteDoc`, `updatePatchDoc`
- `useHelper()` — injects `spinner` (Ref) and `toast` (fn) provided by `App.vue`

### 3. Global State (Pinia)
- `authStore` (`src/stores/auth.js`) — token, user, isAuthenticated; persists to localStorage
- `candidateStore` (`src/stores/candidate.js`) — full resume object, caches to avoid re-fetching

### 4. Global Components
All `src/components/global/*.vue` are auto-registered globally via `src/plugins/GlobalComponents.js`. Use without import: `<Heading>`, `<Button>`, `<NoData>`, `<ListTransition>`, `<Box>`, `<Dropdown>`.

## Directory Map
```
src/
├── components/
│   ├── global/          # Auto-registered: Button, Heading, NoData, ListTransition, Box, Dropdown
│   ├── veevalidate/     # VeeForm.vue (main), VeeFormGeneralInformationUpdate.vue, part/Frm*.vue
│   ├── table/           # TableDefault.vue + render-fn parts
│   ├── convert/         # convert.js — date/boolean/truncate display components
│   ├── {education,experience,project}/  # Domain item cards
│   ├── Modal.vue · Spinner.vue · Toasts.vue
├── composables/         # useCandidate.ts · useDocument.ts · useHelper.js · useInitTable.ts
├── config/              # api.config.js (URL) · regex.config.js
├── lib/                 # swal.lib.js (confirmDelete helper)
├── models/              # *.model.ts — form field definitions per entity
├── pages/
│   ├── _layouts/        # LayoutDefault.vue (pug) · LayoutAuth.vue · Header · Footer · Main
│   ├── auth/            # PageLogin · PageRegister
│   ├── dashboard/       # PageDashboard + Page{Information,GeneralInformation,Education,...}
├── plugins/             # GlobalComponents.js · initFontAwesomeIcon.js
├── routers/index.js     # Routes + beforeEach auth guard
├── services/            # axios.js · base.js (handleBase) · auth.js (handleLogin/Register)
├── stores/              # auth.js · candidate.js
├── types/               # api.type.ts · model.type.ts · table.type.ts · ...
└── utilities/index.ts   # formatDate · formatDateToInput
```

## API
- Base: `http://localhost:3001/` (dev) or `https://nodejs-resume-api-ts.onrender.com/` (prod)
- Auth header: `Authorization: Bearer <token>` on every request
- URL pattern: `api/v1/{collection}/{action}` — e.g. `api/v1/education/update`
- **Bearer auth, not cookies** — API is cross-site from github.io, so its auth cookies are third-party and blocked by most browsers. Access token: memory only (`authStore.getToken`); refresh token: `sessionStorage` key `"refreshToken"`; user: `localStorage` key `"user"`. On 401, `services/axios.ts` refreshes once (deduped — backend rotates refresh tokens) then retries. Download links (`download-pdf`) pass the token as `?token=`.

## Known Bugs (do not replicate these patterns)

| # | Location | Issue |
|---|---|---|
| [#8](https://github.com/datvt243/resume-vuejs-website/issues/8) | `stores/auth.ts` | Tokens readable by JS (access token in memory, refresh token in sessionStorage) — XSS could still read them while the tab is open. The httpOnly-cookie fix was reverted because cross-site cookies broke login; a real fix needs frontend + API on the same site (custom domain) |

> Issues #1, #2, #3, #4, #5, #9, #10 (previously listed here: router history,
> GET login, VeeForm prop mutation, VeeForm reset typo, Toasts `v-html`,
> non-reactive spinner, GroupTags prop mutation) are fixed and closed —
> don't re-"fix" them. Full backlog: https://github.com/datvt243/resume-vuejs-website/issues

## Gotchas

- **TypeScript is mixed** — `.js` files exist alongside `.ts`. When editing `.js` files, no type checking. Migration tracked in [#13](https://github.com/datvt243/resume-vuejs-website/issues/13).
- **Pug in LayoutDefault** — `src/pages/_layouts/LayoutDefault.vue` uses `<template lang="pug">`. Other files use standard HTML templates.
- **`_id` drives create vs update** — `useDocument.updateDoc` sends POST if `_id` is falsy, PUT if truthy. Always ensure `_id` is set correctly before calling.
- **`useCandidate` collection heuristic** — if `collection` prop omitted, strips trailing `s` from field name (`educations` → `education`). Explicit `collection` is safer.
- **`subURL = 'api/v1/'`** is hardcoded in both `services/auth.js` and `services/base.js` — DRY violation, tracked in [#17](https://github.com/datvt243/resume-vuejs-website/issues/17).
- **No tests** — zero test setup. Adding Vitest tracked in [#7](https://github.com/datvt243/resume-vuejs-website/issues/7).
- **`tokenRefresh`** returned from login API but never stored or used — tracked in [#12](https://github.com/datvt243/resume-vuejs-website/issues/12).

## Error Handling Convention
`handleBase(axiosOptions, { loading, toast }, callback)` in `services/base.js` is the standard wrapper — handles spinner, toast success/error, and auto-logout on `invalidToken`. Use this for all API calls except auth (which uses `services/auth.js` directly).

## Preferred Patterns
- Prefer `async/await` + `try/catch` over `.then()/.catch()` chains
- Prefer `computed` over `onMounted` for derived data
- Never mutate props — copy with spread or destructuring
- New form sections → create a `models/*.model.ts`, use `useCandidate` + `useDocument` + `VeeForm`
