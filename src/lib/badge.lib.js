/**
 * Badge classes from DESIGN.md §5.6.
 */
const base = 'inline-flex h-5 items-center gap-1.5 rounded-sm px-2 text-xs font-medium'

const variants = {
    neutral: 'bg-surface-2 text-fg-2',
    success: 'bg-success-subtle text-success',
    warning: 'bg-warning-subtle text-warning',
    danger: 'bg-danger-subtle text-danger',
    info: 'bg-info-subtle text-info',
}

export function badgeClass(variant = 'neutral') {
    return `${base} ${variants[variant] || variants.neutral}`
}
