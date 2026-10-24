# CLAUDE.md

## Project
**resume-vuejs-website** — Resume/CV management SPA. Users manage structured resume data (education, experience, projects, awards, certificates, references) via a Node.js REST API.

- **Repo:** https://github.com/datvt243/resume-vuejs-website
- **Live:** https://datvt243.github.io/resume-vuejs-website/
- **Backend:** https://nodejs-resume-api-ts.onrender.com/api/v1/ (Render free tier, cold start ~30s)
- **Deploy:** every push to `main` auto-deploys to `gh-pages` (`.github/workflows/deploy.yml`); CI (`.github/workflows/ci.yml`, lint + build) runs on push/PR to `main` and `staging`

## Stack
Vue 3 + Vite 5 · Pinia · Vue Router 4 · VeeValidate 4 + Yup · Axios · Tailwind CSS 3.4 (Bootstrap removed — legacy class names re-implemented in `src/styles/tailwind.css`) · CKEditor 5 · FontAwesome 6 · SweetAlert2 · TypeScript (partial — see gotchas)

## Commands
```bash
npm run dev      # http://localhost:5173
npm run build    # output: dist/
npm run preview
npm run lint
npm run test     # vitest run (specs: src/**/*.spec.ts)
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
- `authStore` (`src/stores/auth.ts`) — token (memory only), user (localStorage), isAuthenticated — see API section
- `candidateStore` (`src/stores/candidate.ts`) — full resume object, caches to avoid re-fetching

### 4. Global Components
All `src/components/global/*.vue` are auto-registered globally via `src/plugins/GlobalComponents.js`. Use without import: `<Heading>`, `<Button>`, `<NoData>`, `<ListTransition>`, `<Box>`, `<Dropdown>`, `<ItemTemplate>`, `<ItemActions>`, `<LoadingGate>`, `<FormSection>`, `<SegmentedControl>`.
- `ItemActions` — CRUD row buttons shared by every list page: edit (`info`), duplicate (`success`), delete (`danger`); pass `viewable` to add an eye button that emits `view` (only Experience uses it so far). The colors use `!` modifiers because the ghost `Button` variant sets its own text/hover colors.

## API
- Base: `http://localhost:3001/` (dev) or `https://nodejs-resume-api-ts.onrender.com/` (prod)
- Auth header: `Authorization: Bearer <token>` on every request
- URL pattern: `api/v1/{collection}/{action}` — e.g. `api/v1/education/update`
- **Bearer auth, not cookies** — API is cross-site from github.io, so its auth cookies are third-party and blocked by most browsers. Access token: memory only (`authStore.getToken`); refresh token: `sessionStorage` key `"refreshToken"`; user: `localStorage` key `"user"`. On 401, `services/axios.ts` refreshes once (deduped — backend rotates refresh tokens) then retries. Download links (`download-pdf`) pass the token as `?token=`.
- **Tokens are JS-readable** — XSS could read them while the tab is open. An httpOnly-cookie fix was reverted because cross-site cookies broke login; a real fix needs frontend + API on the same site (custom domain). Don't reintroduce `localStorage` for tokens.
- Issue backlog: https://github.com/datvt243/resume-vuejs-website/issues

## Gotchas

- **TypeScript is mixed** — `.js` files exist alongside `.ts`. When editing `.js` files, no type checking.
- **Pug templates** — `_layouts/{LayoutDefault,LayoutAuth,Header,Footer}.vue`, `ListTransition.vue` and the `{Education,Experience,Project}Item.vue` cards use `<template lang="pug">`. Everything else uses HTML templates.
- **`_id` drives create vs update** — `useDocument.updateDoc` sends POST if `_id` is falsy, PUT if truthy. Always ensure `_id` is set correctly before calling.
- **Experience vs career break** — one `experience` collection, split by `isCareerBreak`. `PageExperience` asks for the type before showing a new entry's form (`isCareerBreak` ref, `null` = chooser), hides the checkbox and sets its default from the choice; edit/duplicate take the type from the doc, so an entry can't be switched between types. `careerBreakPayload` clears company/position (or the break type) on save, and `experienceTitle` gives the display title for both.
- **`useCandidate` collection heuristic** — if `collection` prop omitted, strips trailing `s` from field name (`educations` → `education`). Explicit `collection` is safer.

## Error Handling Convention
`handleBase(axiosOptions, { loading, toast }, callback)` in `services/base.ts` is the standard wrapper — handles spinner, toast success/error, and auto-logout on `invalidToken`. Use this for all API calls except auth (which uses `services/auth.ts` directly).

## Preferred Patterns
- Prefer `async/await` + `try/catch` over `.then()/.catch()` chains
- Prefer `computed` over `onMounted` for derived data
- Never mutate props — copy with spread or destructuring
- New form sections → create a `models/*.model.ts`, use `useCandidate` + `useDocument` + `VeeForm`

## i18n (UI text)
Every user-visible string goes through `src/i18n/index.ts` — never hardcode it. This includes labels, buttons, headings, placeholders, `aria-label`/`title`, toasts, Swal dialogs and yup messages. The header VI | EN switch drives `i18n.global.locale`.
- **Add the key to both `vi` and `en`**, grouped by area (`common`, `form`, `auth`, `validation`, …). `en` is typed `typeof vi`, so the editor flags a missing EN key, but `vite build` doesn't type-check, so check it yourself. Reuse `common.*` (save, cancel, delete, …) before adding a new key.
- **Templates** → `$t('group.key')`. **Script / `lib/` / `services/` / components mounted in specs** → `import { t } from '@/i18n'` (works without the plugin installed).
- **Field configs** (`models/*.model.ts`, page `formFields`) and **yup messages** → pass the key string itself (`label: 'auth.password'`, `.required('validation.emailRequired')`). `Frm*` parts render it through `tr()`, which translates keys and passes literal text through, so it updates live on a language switch.
- Interpolate with `{name}` (`t('form.addTitle', { name })`), never string-concatenate translated fragments. Don't put a literal `@`, `$`, `|`, `{` or `}` in a message (vue-i18n syntax).
- Not i18n: user CV *content* (`{ vi, en }` localized fields, `getLocalizedText`) and `CvResumeLayout`'s own `lang`-prop labels.
- Need a param in a string-only slot (yup message, field label)? `withParams('validation.maxChars', { max: 100 })` — `tr` unpacks it and translates string params that are keys.

## UI / Design
Before creating, editing, or reviewing any UI (pages, components, styles), read `DESIGN.md` at the repo root and follow it — tokens, layout templates, components, and the definition-of-done checklist. To restyle an existing page, follow its §0.2 refactor procedure (audit → plan → apply → verify).

## Workflow
- Tracked code work goes through agent-hub (`agent-hub/README.md`): `/todo "<task>"` → `/ship`.
- Never push directly to `main` or `staging` (GitHub-protected, PR-only). Branch `fix/*`/`feature/*`/`hotfix/*` off `staging`, PR into `staging`; `staging` → `main` only via `/release`. Rationale: `CONTRIBUTING.md`.
