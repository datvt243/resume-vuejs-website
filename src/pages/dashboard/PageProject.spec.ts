import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageProject from './PageProject.vue'
import { i18n } from '@/i18n'
import VeeForm from '@/components/veevalidate/VeeForm.vue'
import { useFormLang } from '@/composables/useFormLang'

const updateDoc = vi.hoisted(() => vi.fn())
const project = vi.hoisted((): Record<string, any> => ({
    _id: 'p1', name: 'P1', position: 'Dev', technology: ['Vue', 'TS'], startDate: 1641038400000, endDate: null, isWorking: true, link: 'https://x.dev',
    description: { vi: 'Mô tả', en: 'Desc' },
}))

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ projects: ref([project]), removeRecordById: vi.fn(), addRecordToList: vi.fn(), loadError: ref(null), getData: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc, deleteDoc: vi.fn() }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button class="btn" @click="$emit(\'click\')">{{ text }}</button>' },
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: true,
    ListTransition: { template: '<ul><slot /></ul>' },
    ProjectItem: { props: ['modelValue'], emits: ['onView'], template: '<i class="view" @click="$emit(\'onView\', modelValue)" />' },
    Modal: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot /><slot name="footer" /></div>', methods: { show() {}, hide() {} } },
    VeeForm: { props: ['fields', 'document', 'submitFn'], template: '<div />', methods: { reset() {} } },
    FontAwesomeIcon: true,
}

const mountPage = () => {
    setActivePinia(createPinia())
    return mount(PageProject, { global: { stubs, plugins: [i18n] } })
}

describe('PageProject — view modal', () => {
    it('shows every field read-only and jumps to edit', async () => {
        const w = mountPage()
        await w.find('.view').trigger('click')
        const view = w.findAll('h2')[1].element.parentElement!
        for (const text of ['P1', 'Dev', 'Vue, TS', '01/2022 - Hiện tại', 'Mô tả']) expect(view.textContent).toContain(text)
        const a = w.find('a[href="https://x.dev"]')
        expect(a.attributes('target')).toBe('_blank')
        expect(a.attributes('rel')).toBe('noopener')
        await w.findAll('button').find(b => b.text() === 'Sửa')!.trigger('click')
        expect(w.findComponent(VeeForm).props('document')._id).toBe('p1')
    })

    it('switches the description VI | EN on the shared form language, falls back and sanitizes', async () => {
        const { formLang } = useFormLang()
        formLang.value = 'vi'
        const original = project.description
        try {
            const w = mountPage()
            await w.find('.view').trigger('click')
            await w.find('[role="radiogroup"] [data-lang="en"]').trigger('click')
            expect(w.find('dd.post-content').text()).toBe('Desc')
            expect(formLang.value).toBe('en')

            // fresh mount: the stub list isn't reactive
            project.description = { vi: 'Mô tả', en: '' }
            const w2 = mountPage()
            await w2.find('.view').trigger('click')
            expect(w2.find('dd.post-content').text()).toBe('Mô tả')

            project.description = { vi: '<img src=x onerror="alert(1)"><script>alert(1)</script>ok', en: '' }
            const w3 = mountPage()
            await w3.find('.view').trigger('click')
            const html = w3.find('dd.post-content').html()
            expect(html).not.toContain('onerror')
            expect(html).not.toContain('<script')

            // imported data skips the yup url() check — never render a javascript: href
            project.link = 'javascript:alert(1)'
            const w4 = mountPage()
            await w4.find('.view').trigger('click')
            expect(w4.find('a[href^="javascript"]').exists()).toBe(false)
        } finally {
            project.link = 'https://x.dev'
            project.description = original
            formLang.value = 'vi'
        }
    })
})

describe('PageProject — save payload', () => {
    it('sends endDate null when "current" is checked', async () => {
        const w = mountPage()
        await w.findComponent(VeeForm).props('submitFn')({ _id: 'x1', startDate: 1641038400000, endDate: 1657022400000, isWorking: true })
        expect(updateDoc.mock.calls[0][0]).toMatchObject({ endDate: null, isWorking: true })
    })
})
