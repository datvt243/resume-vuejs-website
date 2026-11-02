import { describe, it, expect } from 'vitest'
import { buttonClass } from './button.lib'

describe('buttonClass — action colors', () => {
    it.each([
        ['add', 'text-success'],
        ['update', 'text-warning'],
        ['delete', 'text-danger'],
        ['clone', 'text-info'],
        ['view', 'text-info'],
    ])('%s colors ghost and secondary buttons with %s', (action, color) => {
        const ghost = buttonClass({ variant: 'ghost', action })
        expect(ghost).toContain(color)
        expect(ghost).not.toContain('text-fg-2')
        const secondary = buttonClass({ variant: 'secondary', action })
        expect(secondary).toContain(color)
        expect(secondary).toContain('border-line-strong')
        expect(secondary).not.toContain('text-fg ')
    })

    it('leaves solid variants and unknown actions on their own colors', () => {
        expect(buttonClass({ variant: 'primary', action: 'update' })).toBe(buttonClass({ variant: 'primary' }))
        expect(buttonClass({ variant: 'ghost', action: 'nope' })).toBe(buttonClass({ variant: 'ghost' }))
    })
})
