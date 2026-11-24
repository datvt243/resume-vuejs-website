import { describe, it, expect, vi } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageProject from './PageProject.vue'
import { i18n } from '@/i18n'
import VeeForm from '@/components/veevalidate/VeeForm.vue'
import { useFormLang } from '@/composables/useFormLang'

const updateDoc = vi.hoisted(() => vi.fn())
const setFieldError = vi.hoisted(() => vi.fn())
const experiences = vi.hoisted(() => [
    { _id: 'e1', company: 'Acme Corp', position: 'Frontend Developer' },
    { _id: 'e2', isCareerBreak: true, careerBreakType: 'travel' },
])
const extraProjects = vi.hoisted((): Record<string, any>[] => [])
const reorder = vi.hoisted(() => vi.fn())
const project = vi.hoisted((): Record<string, any> => ({
    _id: 'p1', name: 'P1', position: 'Dev', technology: ['Vue', 'TS'], startDate: 1641038400000, endDate: null, isWorking: true, link: 'https://x.dev',
    description: { vi: 'Mô tả', en: 'Desc' },
}))

vi.mock('@/composables/useCandidate', async () => {
    const { ref } = await import('vue')
    return {
        useCandidate: ({ field }: { field: string }) => {
            if (field === 'experiences') return { experiences: ref(experiences) }
            const projects = ref([project, ...extraProjects])
            reorder.mockImplementation(list => (projects.value = list))
            return { projects, removeRecordById: vi.fn(), addRecordToList: vi.fn(), reorder, loadError: ref(null), getData: vi.fn() }
        },
    }
})
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc, deleteDoc: vi.fn() }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button class="btn" @click="$emit(\'click\')">{{ text }}</button>' },
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: true,
    ListTransition: { template: '<ul><slot /></ul>' },
    ProjectItem: { props: ['modelValue'], emits: ['onView'], template: '<div class="card"><i class="view" @click="$emit(\'onView\', modelValue)" /><slot name="sub" /></div>' },
    Modal: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot /><slot name="footer" /></div>', methods: { show() {}, hide() {} } },
    VeeForm: { props: ['fields', 'document', 'submitFn'], template: '<div />', methods: { reset() {}, setFieldError } },
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

describe('PageProject — type / linked experience (#401)', () => {
    const submit = (w: ReturnType<typeof mountPage>, values: Record<string, any>) =>
        w.findComponent(VeeForm).props('submitFn')({ _id: 'x1', startDate: 1, endDate: 2, isWorking: false, ...values })

    it('offers only real jobs as "Company — Position"', () => {
        const w = mountPage()
        const field = w.findComponent(VeeForm).props('fields').find((f: any) => f.name === 'experienceId')
        expect(field.options).toEqual([{ text: 'Acme Corp — Frontend Developer', value: 'e1' }])
    })

    it('sends experienceId null for a personal project and keeps it for a company one', async () => {
        updateDoc.mockClear()
        const w = mountPage()
        await submit(w, { type: 'personal', experienceId: 'e1' })
        expect(updateDoc.mock.calls[0][0]).toMatchObject({ type: 'personal', experienceId: null })
        await submit(w, { type: 'company', experienceId: 'e1' })
        expect(updateDoc.mock.calls[1][0]).toMatchObject({ type: 'company', experienceId: 'e1' })
    })

    it('opens a legacy project as personal and drops a link to a missing experience', async () => {
        const w = mountPage()
        const vm = w.vm as any
        vm.showModalEditDoc({ ...project, type: undefined, experienceId: undefined })
        expect(w.findComponent(VeeForm).props('document').type).toBe('personal')
        vm.showModalEditDoc({ ...project, type: 'company', experienceId: 'gone' })
        expect(w.findComponent(VeeForm).props('document')).toMatchObject({ type: 'company', experienceId: '' })
        vm.showModalDuplicateDoc({ ...project, type: 'company', experienceId: 'e1' })
        expect(w.findComponent(VeeForm).props('document')).toMatchObject({ type: 'company', experienceId: 'e1' })
    })

    it('puts experience save errors under the field instead of a toast', async () => {
        updateDoc.mockClear()
        setFieldError.mockClear()
        const w = mountPage()
        await submit(w, { type: 'company', experienceId: 'e1' })
        const onError = updateDoc.mock.calls[0][2]
        expect(onError({ success: false, error: { code: 'BAD_REQUEST', message: 'X' } })).toBe(true)
        expect(setFieldError).toHaveBeenLastCalledWith('experienceId', 'X')
        expect(onError({ success: false, error: { code: 'VALIDATION_ERROR', message: 'v', details: [{ field: 'experienceId', message: 'Y' }] } })).toBe(true)
        expect(setFieldError).toHaveBeenLastCalledWith('experienceId', 'Y')
        expect(onError({ success: false, error: { code: 'VALIDATION_ERROR', message: 'v', details: [{ field: 'name', message: 'Z' }] } })).toBe(false)
        expect(onError({ success: false, error: { code: 'INTERNAL_ERROR', message: 'boom' } })).toBe(false)
        expect(setFieldError).toHaveBeenCalledTimes(2)

        // a personal project can't hit the experience check — its errors keep toasting
        await submit(w, { type: 'personal', experienceId: '' })
        expect(updateDoc.mock.calls[1][2]({ success: false, error: { code: 'BAD_REQUEST', message: 'X' } })).toBe(false)
    })

    it('shows the type badge and the linked experience on each card', () => {
        extraProjects.push(
            { ...project, _id: 'p2', type: 'company', experienceId: 'e1' },
            { ...project, _id: 'p3', type: 'company', experienceId: 'gone' },
        )
        try {
            const cards = mountPage().findAll('.card')
            expect(cards[0].find('[data-project-type]').text()).toBe('Cá nhân')
            expect(cards[1].find('[data-project-type]').text()).toBe('Công ty')
            expect(cards[1].text()).toContain('Acme Corp · Frontend Developer')
            expect(cards[2].find('[data-project-type]').text()).toBe('Công ty')
            expect(cards[2].text()).toContain('Kinh nghiệm liên kết đã bị xoá')
            expect(cards[0].text()).not.toContain('Kinh nghiệm liên kết đã bị xoá')
        } finally {
            extraProjects.length = 0
        }
    })
})

describe('PageProject — #442 drag-and-drop saves through useCandidate.reorder', () => {
    it('dropping B onto A reorders to B, A and writes nothing to localStorage', async () => {
        extraProjects.push({ _id: 'p2', name: 'P2' })
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        try {
            const w = mountPage()
            const rows = w.findAll('li[draggable="true"]')
            expect(rows).toHaveLength(2)
            await rows[1].trigger('dragstart')
            await rows[0].trigger('drop')

            expect(reorder.mock.calls[0][0].map((e: { _id: string }) => e._id)).toEqual(['p2', 'p1'])
            expect(w.findAllComponents(stubs.ProjectItem).map(c => c.props('modelValue')._id)).toEqual(['p2', 'p1'])
            expect(setItem).not.toHaveBeenCalled()
        } finally {
            extraProjects.length = 0
            setItem.mockRestore()
            reorder.mockClear()
        }
    })

    it('dropping an entry on itself sends nothing', async () => {
        const w = mountPage()
        const row = w.find('li[draggable="true"]')
        await row.trigger('dragstart')
        await row.trigger('drop')
        expect(reorder).not.toHaveBeenCalled()
    })
})

