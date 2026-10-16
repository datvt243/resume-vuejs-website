import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, reactive } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageImportLinkedin from './PageImportLinkedin.vue'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({
    handleBase: (...args: unknown[]) => handleBaseMock(...args),
}))

vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ addRecordToList: vi.fn() }),
}))

vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc: vi.fn() }),
}))

const stubs = {
    Heading: { props: ['text'], template: '<div><h2>{{ text }}</h2><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button class="stub-btn" @click="$emit(\'click\')">{{ text }}</button>' },
    Modal: { props: ['title'], template: '<div class="stub-modal">{{ title }}<slot /></div>' },
    VeeForm: true,
    NoData: true,
    FontAwesomeIcon: true,
}

const parsed = {
    educations: [{ school: 'HCMUS', major: 'CS', startDate: null, endDate: null, isCurrent: false, description: '' }],
    experiences: [{ company: 'Acme', position: 'Frontend Dev', startDate: 1577836800000, endDate: null, isCurrent: true, description: '' }],
    extractedText: 'Jane Doe\nEXPERIENCE\nAcme — Frontend Dev',
}

function mountPage() {
    setActivePinia(createPinia())
    return mount(PageImportLinkedin, { global: { stubs } })
}

async function selectFile(wrapper: ReturnType<typeof mountPage>, accept: string, name: string, data: object) {
    handleBaseMock.mockImplementation(async (_opts, _props, cb) => cb({ data }))
    const input = wrapper.find(`input[accept="${accept}"]`)
    Object.defineProperty(input.element, 'files', { value: [new File(['x'], name)], configurable: true })
    await input.trigger('change')
    await flushPromises()
}

describe('PageImportLinkedin', () => {
    beforeEach(() => {
        handleBaseMock.mockReset()
    })

    it('POSTs the PDF as multipart field `file` to candidate/parse-cv-pdf', async () => {
        const wrapper = mountPage()
        await selectFile(wrapper, '.pdf,application/pdf', 'cv.pdf', parsed)

        const [opts] = handleBaseMock.mock.calls[0]
        expect(opts.method).toBe('post')
        expect(opts.url).toBe('candidate/parse-cv-pdf')
        expect(opts.data).toBeInstanceOf(FormData)
        expect((opts.data.get('file') as File).name).toBe('cv.pdf')
    })

    it('still POSTs the .zip to candidate/parse-linkedin-export', async () => {
        const wrapper = mountPage()
        await selectFile(wrapper, '.zip', 'export.zip', { educations: [], experiences: [] })

        expect(handleBaseMock.mock.calls[0][0].url).toBe('candidate/parse-linkedin-export')
    })

    it('lists parsed PDF entries for review and shows the extracted text, without saving anything', async () => {
        const wrapper = mountPage()
        await selectFile(wrapper, '.pdf,application/pdf', 'cv.pdf', parsed)

        const text = wrapper.text()
        expect(text).toContain('HCMUS')
        expect(text).toContain('Acme')
        expect(text).toContain('Nguồn: PDF')
        expect(wrapper.find('details pre').text()).toContain('EXPERIENCE')
        expect(wrapper.findAll('.stub-modal').map(m => m.text())).toEqual(
            expect.arrayContaining([expect.stringContaining('(từ PDF)')]),
        )
        // only the parse call — nothing persisted until the user submits a form
        expect(handleBaseMock).toHaveBeenCalledTimes(1)
    })

    it('hides the extracted-text block for a LinkedIn import (no extractedText)', async () => {
        const wrapper = mountPage()
        await selectFile(wrapper, '.zip', 'export.zip', { educations: parsed.educations, experiences: [] })

        expect(wrapper.find('details').exists()).toBe(false)
        expect(wrapper.text()).toContain('Nguồn: LinkedIn')
    })
})
