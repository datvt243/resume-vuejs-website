import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resolveCvLang, DEFAULT_CV_LANG } from './useCvLang'

const STORAGE_KEY = 'cvLang'

// the state is module-scoped and read from localStorage on import — re-import for each case
const load = async () => (await import('./useCvLang')).useCvLang

describe('useCvLang', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetModules()
    })

    it('defaults to vi when nothing is stored', async () => {
        expect((await load())().selectedLang.value).toBe('vi')
        expect(DEFAULT_CV_LANG).toBe('vi')
    })

    it('restores a stored en choice', async () => {
        localStorage.setItem(STORAGE_KEY, 'en')
        expect((await load())().selectedLang.value).toBe('en')
    })

    it('ignores an unknown stored value', async () => {
        localStorage.setItem(STORAGE_KEY, 'fr')
        expect((await load())().selectedLang.value).toBe('vi')
    })

    it('setLang persists the choice, falling back to vi for invalid input', async () => {
        const { selectedLang, setLang } = (await load())()
        setLang('en')
        await Promise.resolve()
        expect(localStorage.getItem(STORAGE_KEY)).toBe('en')

        setLang('xx')
        expect(selectedLang.value).toBe('vi')
    })

    it('every caller shares one value, so the header switch reaches open pages', async () => {
        const useCvLang = await load()
        const header = useCvLang()
        const page = useCvLang()
        header.setLang('en')
        expect(page.selectedLang.value).toBe('en')
    })

    it('resolveCvLang only accepts en, everything else is vi', () => {
        expect(resolveCvLang('en')).toBe('en')
        expect(resolveCvLang(['en'])).toBe('vi')
        expect(resolveCvLang(undefined)).toBe('vi')
    })
})
