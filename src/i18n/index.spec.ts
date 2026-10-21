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

    // vite build doesn't type-check `en: typeof vi`, and a missing key renders as the raw key
    it('has the same keys in vi and en, and every key used in src exists', async () => {
        const { i18n } = await import('./index')
        const flat = (o: Record<string, any>, p = ''): string[] =>
            Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`]))
        const { vi, en } = i18n.global.messages.value as Record<string, Record<string, any>>
        const keys = flat(vi)
        expect(flat(en)).toEqual(keys)

        const sources = import.meta.glob(['/src/**/*.{vue,ts,js}', '!/src/**/*.spec.ts'], { query: '?raw', import: 'default', eager: true })
        const groups = Object.keys(vi).join('|')
        const used = new Set(Object.values(sources).flatMap(src => [...(src as string).matchAll(new RegExp(`'((?:${groups})\\.[\\w.]+)'`, 'g'))].map(m => m[1])))
        expect([...used].filter(k => !keys.includes(k))).toEqual([])
    })

    it('tr unpacks withParams, translating string params that are keys', async () => {
        const { tr, withParams } = await import('./index')
        const { useCvLang } = await import('@/composables/useCvLang')
        expect(tr(withParams('validation.maxChars', { max: 100 }))).toBe('Tối đa 100 ký tự')
        expect(tr(withParams('form.englishField', { label: 'field.description' }))).toBe('Mô tả (English)')
        expect(tr(withParams('form.englishField', { label: 'Github' }))).toBe('Github (English)')

        useCvLang().setLang('en')
        await nextTick()
        expect(tr(withParams('validation.maxChars', { max: 100 }))).toBe('Maximum 100 characters')
        expect(tr(withParams('form.englishField', { label: 'field.description' }))).toBe('Description (English)')
    })
})
