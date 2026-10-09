import { describe, it, expect, beforeEach } from 'vitest'
import { useCvLang, resolveCvLang, DEFAULT_CV_LANG } from './useCvLang'

const STORAGE_KEY = 'cvLang'

describe('useCvLang', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('defaults to vi when nothing is stored', () => {
        expect(useCvLang().selectedLang.value).toBe('vi')
        expect(DEFAULT_CV_LANG).toBe('vi')
    })

    it('restores a stored en choice and ignores unknown values', () => {
        localStorage.setItem(STORAGE_KEY, 'en')
        expect(useCvLang().selectedLang.value).toBe('en')

        localStorage.setItem(STORAGE_KEY, 'fr')
        expect(useCvLang().selectedLang.value).toBe('vi')
    })

    it('setLang persists the choice, falling back to vi for invalid input', async () => {
        const { selectedLang, setLang } = useCvLang()
        setLang('en')
        await Promise.resolve()
        expect(localStorage.getItem(STORAGE_KEY)).toBe('en')

        setLang('xx')
        expect(selectedLang.value).toBe('vi')
    })

    it('resolveCvLang only accepts en, everything else is vi', () => {
        expect(resolveCvLang('en')).toBe('en')
        expect(resolveCvLang(['en'])).toBe('vi')
        expect(resolveCvLang(undefined)).toBe('vi')
    })
})
