import { describe, it, expect, beforeEach } from 'vitest'
import { useCvTheme, resolveTheme, isValidTheme, THEMES, DEFAULT_THEME } from './useCvTheme'

const STORAGE_KEY = 'cvTheme'

describe('useCvTheme', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('defaults to the classic theme when nothing is stored', () => {
        const { selectedTheme } = useCvTheme()
        expect(selectedTheme.value).toBe(DEFAULT_THEME)
        expect(DEFAULT_THEME).toBe('classic')
    })

    it('restores a previously-persisted valid theme', () => {
        localStorage.setItem(STORAGE_KEY, 'modern')
        const { selectedTheme } = useCvTheme()
        expect(selectedTheme.value).toBe('modern')
    })

    it('falls back to the default when localStorage holds an unknown/corrupt value', () => {
        localStorage.setItem(STORAGE_KEY, 'not-a-real-theme')
        const { selectedTheme } = useCvTheme()
        expect(selectedTheme.value).toBe(DEFAULT_THEME)
    })

    it('setTheme persists a valid choice to localStorage', async () => {
        const { selectedTheme, setTheme } = useCvTheme()
        setTheme('compact')
        expect(selectedTheme.value).toBe('compact')
        // watch() flushes on the next microtask/tick, not synchronously.
        await Promise.resolve()
        expect(localStorage.getItem(STORAGE_KEY)).toBe('compact')
    })

    it('setTheme with an invalid value resets to the default instead of storing garbage', () => {
        const { selectedTheme, setTheme } = useCvTheme()
        setTheme('modern')
        setTheme('does-not-exist')
        expect(selectedTheme.value).toBe(DEFAULT_THEME)
    })

    it('exposes exactly the 3 themes the issue asked for (Compact/Modern/Classic)', () => {
        expect(THEMES.map(t => t.value).sort()).toEqual(['classic', 'compact', 'modern'])
    })

    it('resolveTheme/isValidTheme reject anything outside THEMES, including the public-page query-param path', () => {
        // Regression guard: PagePublicResume.vue feeds an ANONYMOUS
        // visitor's raw route.query.theme straight into resolveTheme() —
        // it must never trust that input directly.
        expect(isValidTheme('modern')).toBe(true)
        expect(isValidTheme('<script>alert(1)</script>')).toBe(false)
        expect(resolveTheme(undefined)).toBe(DEFAULT_THEME)
        expect(resolveTheme(['modern'])).toBe(DEFAULT_THEME)
        expect(resolveTheme('compact')).toBe('compact')
    })
})
