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

    it('tr translates message keys and passes literal text through', async () => {
        const { tr } = await import('./index')
        const { useCvLang } = await import('@/composables/useCvLang')
        expect(tr('validation.emailRequired')).toBe('Email là bắt buộc')
        expect(tr('Email')).toBe('Email')
        expect(tr('Tối thiểu 12 ký tự, gồm chữ hoa.')).toBe('Tối thiểu 12 ký tự, gồm chữ hoa.')
        expect(tr('')).toBe('')

        useCvLang().setLang('en')
        await nextTick()
        expect(tr('validation.emailRequired')).toBe('Email is required')
    })
})
