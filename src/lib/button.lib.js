/**
 * Button classes from DESIGN.md §5.3 — shared by `Button.vue` and the
 * SweetAlert2 dialogs, which render their own <button> elements.
 */
const base =
    'inline-flex items-center justify-center gap-2 rounded text-sm font-medium no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50'

const variants = {
    primary: 'bg-accent text-accent-fg hover:bg-accent-hover hover:text-accent-fg',
    secondary: 'bg-surface border border-line-strong text-fg hover:bg-surface-2 hover:text-fg',
    ghost: 'text-fg-2 hover:bg-surface-2 hover:text-fg',
    danger: 'bg-danger text-white hover:text-white',
}

// action colors (add green, update orange, delete red, clone/view blue) for the
// secondary and ghost variants; solid variants keep their own fill
const actionTones = {
    secondary: {
        add: 'bg-surface border border-line-strong text-success hover:bg-success-subtle hover:text-success',
        update: 'bg-surface border border-line-strong text-warning hover:bg-warning-subtle hover:text-warning',
        delete: 'bg-surface border border-line-strong text-danger hover:bg-danger-subtle hover:text-danger',
        clone: 'bg-surface border border-line-strong text-info hover:bg-info-subtle hover:text-info',
        view: 'bg-surface border border-line-strong text-info hover:bg-info-subtle hover:text-info',
    },
    ghost: {
        add: 'text-success hover:bg-success-subtle hover:text-success',
        update: 'text-warning hover:bg-warning-subtle hover:text-warning',
        delete: 'text-danger hover:bg-danger-subtle hover:text-danger',
        clone: 'text-info hover:bg-info-subtle hover:text-info',
        view: 'text-info hover:bg-info-subtle hover:text-info',
    },
}

const sizes = {
    sm: { box: 'h-7 px-3', square: 'h-7 w-7' },
    md: { box: 'h-8 px-3', square: 'h-8 w-8' },
    lg: { box: 'h-10 px-4', square: 'h-10 w-10' },
}

export function buttonClass({ variant = 'secondary', size = 'md', iconOnly = false, action = '' } = {}) {
    const s = sizes[size] || sizes.md
    const color = actionTones[variant]?.[action] || variants[variant] || variants.secondary
    return [base, color, iconOnly ? s.square : s.box].join(' ')
}
