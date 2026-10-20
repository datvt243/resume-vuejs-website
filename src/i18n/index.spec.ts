import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'

describe('i18n', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetModules()
    })

    it('starts in the stored CV language and follows the header switch', async () => {
        localStorage.setItem('cvLang', 'en')
        const { i18n } = await import('./index')
        const { useCvLang } = await import('@/composables/useCvLang')
        expect(i18n.global.locale.value).toBe('en')
        expect(i18n.global.t('nav.experience')).toBe('Experience')
        expect(document.documentElement.lang).toBe('en')

        useCvLang().setLang('vi')
        await nextTick()
        expect(i18n.global.locale.value).toBe('vi')
        expect(i18n.global.t('nav.experience')).toBe('Kinh nghiệm')
        expect(document.documentElement.lang).toBe('vi')
    })
})
