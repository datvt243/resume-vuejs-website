/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
    // Bootstrap -> Tailwind phased migration (see
    // agent-hub/haven/diagrams/dev-loop.prime-mermaid.md ->
    // `tailwindcss-setup` through `tailwindcss-bootstrap-removal`).
    // Bootstrap (package + `src/styles/bootstrap.scss`) is gone as of
    // the final node — Tailwind is now the sole CSS framework.
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    // Node `tailwindcss-button-component-system`: Tailwind's content-based
    // purge applies even to hand-written @layer components CSS — a class
    // name gets dropped from the compiled output if its exact string never
    // appears literally in a scanned content file, REGARDLESS of it being
    // explicitly authored here. Discovered the hard way (verifier REOPEN):
    // 7 of 16 button-color variants were silently missing because those
    // specific colors (primary/warning/info/light/dark solid,
    // outline-light/outline-dark) happen not to be used literally anywhere
    // in src/ yet, while e.g. btn-secondary/btn-danger survived purely by
    // coincidence (they DO appear literally elsewhere). Relying on
    // incidental usage elsewhere is fragile — safelisting every class this
    // component system defines, explicitly, regardless of current usage.
    safelist: [
        'btn',
        'btn-sm',
        'btn-primary',
        'btn-secondary',
        'btn-success',
        'btn-danger',
        'btn-warning',
        'btn-info',
        'btn-light',
        'btn-dark',
        'btn-outline-primary',
        'btn-outline-secondary',
        'btn-outline-success',
        'btn-outline-danger',
        'btn-outline-warning',
        'btn-outline-info',
        'btn-outline-light',
        'btn-outline-dark',
        'btn-group',
        'btn-group-sm',
        'dropdown-toggle',
        'dropdown-toggle-split',
        // Node `tailwindcss-dropdown-menu-styling`
        'dropdown-menu',
        'dropdown-item',
        'dropdown-divider',
        'disabled',
        // Node `tailwindcss-badge-alert`
        'badge',
        'rounded-pill',
        'text-bg-success',
        'text-bg-secondary',
        'alert',
        'alert-warning',
        // Node `tailwindcss-form-controls`
        'form-control',
        'form-label',
        'form-text',
        'form-check',
        'form-check-input',
        'form-check-label',
        // Node `tailwindcss-grid-system` — only the exact grid classes
        // actually used anywhere in src/ (confirmed via grep), not
        // Bootstrap's full col-1..col-11/offset-*/row-cols-* set.
        'container',
        'row',
        'col',
        'col-auto',
        'col-12',
        'col-md-6',
        'col-md-12',
        // VeeForm.vue's `:class="[`justify-${props.buttonPosition}`]"` is a
        // dynamic template-string interpolation — Tailwind's content
        // scanner can't statically resolve it, so classes not ALSO used
        // literally elsewhere get silently purged. Verified via compiled
        // CSS: `justify-center` survived by incidental literal usage
        // elsewhere, but `justify-start`/`justify-end` did not (0 matches)
        // — a real, live bug caught before it shipped, not hypothetical.
        'justify-start',
        'justify-end',
        'justify-center',
        // Node `tailwindcss-navbar-component-system`
        'nav',
        'nav-link',
        'navbar',
        'navbar-brand',
        'navbar-nav',
        'navbar-expand-lg',
        'navbar-toggler',
        'navbar-toggler-icon',
        'navbar-collapse',
        // NOTE: bare `collapse` deliberately NOT safelisted/used anywhere
        // — it collides with Tailwind's own `.collapse{visibility:collapse}`
        // utility (see `Navbar.vue`'s and `tailwind.css`'s comments on
        // this node for the real bug that caused).
        // Node `tailwindcss-color-utilities` — dormant until Bootstrap's
        // own `!important` utility CSS is removed at the final node.
        'text-primary',
        'text-success',
        'text-info',
        'text-warning',
        'text-danger',
        'border-success',
        'border-danger',
        'bg-body-tertiary',
        // Node `tailwindcss-spinner-border` — real component classes,
        // live immediately (no Bootstrap `!important` dormancy this time).
        'spinner-border',
        'spinner-border-sm',
        // Post-ship-review fix: `.navbar > .container` combinator rule
        // reuses the already-safelisted `container` token, no new entry
        // needed — noted here for cross-reference.
        // Node `tailwindcss-root-tokens-and-remaining-gaps` — final
        // pre-removal gap-fill. All already appear literally in src/,
        // safelisted defensively per the established discipline anyway.
        'h4',
        'h5',
        'h6',
        'clearfix',
        'text-uppercase',
        'border-start',
        'dropdown',
        'input-group',
        'input-group-sm',
        'input-group-text',
        'table',
        'table-hover',
        'table-bordered',
        'table-responsive',
        'toast',
        'toast-container',
        'toast-header',
        'toast-body',
        'modal',
        'modal-dialog',
        'modal-dialog-scrollable',
        'modal-lg',
        'modal-content',
        'modal-header',
        'modal-title',
        'modal-body',
        'modal-footer',
        'modal-backdrop',
        // Genuine custom app CSS, extracted from bootstrap.scss's tail
        'heading',
        'pointer',
        'footer',
        'item',
        'item-title',
        'item-note',
        'image',
        'post-content',
        // Found via verifier REOPEN — a real, live consumer this node's
        // first pass wrongly declared dead (Pug-syntax grep miss).
        'list',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
