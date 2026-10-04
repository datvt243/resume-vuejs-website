import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageAtsCheck from './PageAtsCheck.vue'
import type { AtsCheckResponse } from '@/types/ats.type'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({
    handleBase: (...args: unknown[]) => handleBaseMock(...args),
}))

vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))

// Global components (auto-registered in the real app via GlobalComponents.js)
// stubbed down to just what this page relies on: Heading renders its slot,
// Button emits click.
const stubs = {
    Heading: { props: ['text'], template: '<div><h2>{{ text }}</h2><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button class="stub-btn" @click="$emit(\'click\')">{{ text }}</button>' },
    FontAwesomeIcon: true,
}

const response: AtsCheckResponse = {
    score: 72,
    pages: 2,
    checks: [
        { id: 'text-extractable', passed: true, severity: 'error', message: 'Text is extractable' },
        { id: 'metadata', passed: false, severity: 'error', message: 'PDF metadata missing' },
        { id: 'page-count', passed: false, severity: 'warning', message: 'More than 2 pages' },
    ],
    extractedText: 'Jane Doe — Frontend Developer',
    keywordMatch: { matched: ['typescript'], missing: ['vitest'], coverage: 0.5 },
}

function mountPage() {
    setActivePinia(createPinia())
    return mount(PageAtsCheck, { global: { stubs } })
}

async function runCheck(wrapper: ReturnType<typeof mountPage>, data: AtsCheckResponse = response) {
    handleBaseMock.mockImplementation(async (_opts, _props, cb) => cb({ data }))
    await wrapper.find('.stub-btn').trigger('click')
    await flushPromises()
}

describe('PageAtsCheck (issue #159)', () => {
    // block body on purpose: a function returned from beforeEach is run by
    // vitest as a cleanup hook — `mockReset()` returns the mock itself
    beforeEach(() => {
        handleBaseMock.mockReset()
    })

    it('POSTs cv/ats-check with the default ats template + vi lang, and no jobDescription when empty', async () => {
        const wrapper = mountPage()
        await runCheck(wrapper)

        const [opts] = handleBaseMock.mock.calls[0]
        expect(opts).toEqual({ method: 'post', url: 'cv/ats-check', data: { template: 'ats', lang: 'vi' } })
    })

    it('sends the trimmed jobDescription, chosen template and lang', async () => {
        const wrapper = mountPage()
        await wrapper.find('textarea').setValue('  TypeScript, Vitest  ')
        await wrapper.find('select').setValue('en')
        await wrapper.findAll('button').find(b => b.text() === 'Classic')!.trigger('click')
        await runCheck(wrapper)

        const [opts] = handleBaseMock.mock.calls[0]
        expect(opts.data).toEqual({ template: 'classic', lang: 'en', jobDescription: 'TypeScript, Vitest' })
    })

    it('renders score, failed-check count, per-check severity badges and keyword report', async () => {
        const wrapper = mountPage()
        expect(wrapper.text()).not.toContain('/100')

        await runCheck(wrapper)
        const text = wrapper.text()

        expect(text).toContain('72')
        expect(text).toContain('2 trang')
        expect(text).toContain('2 tiêu chí chưa đạt')
        expect(text).toContain('PDF metadata missing')
        expect(wrapper.findAll('.badge.text-bg-danger').map(b => b.text())).toEqual(['Lỗi'])
        expect(wrapper.findAll('.badge.text-bg-warning').map(b => b.text())).toEqual(['Cảnh báo'])
        expect(text).toContain('50%')
        expect(wrapper.findAll('.badge.text-bg-success').map(b => b.text())).toEqual(['typescript'])
        expect(wrapper.findAll('.badge.text-bg-secondary').map(b => b.text())).toEqual(['vitest'])
        expect(text).toContain('Jane Doe — Frontend Developer')
    })

    it('hides the keyword section when the response has no keywordMatch', async () => {
        const wrapper = mountPage()
        const { keywordMatch: _omit, ...noKeywords } = response
        await runCheck(wrapper, noKeywords)

        expect(wrapper.text()).not.toContain('So khớp từ khóa')
    })

    it('points the download link at the selected template', async () => {
        const wrapper = mountPage()
        const link = () => wrapper.findAll('a').find(a => a.text().includes('Tải CV mẫu này'))!.attributes('href')

        expect(link()).toMatch(/api\/v1\/download-pdf\?template=ats$/)
        await wrapper.findAll('button').find(b => b.text() === 'Classic')!.trigger('click')
        expect(link()).toMatch(/api\/v1\/download-pdf$/)
    })
})
