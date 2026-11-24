import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageEducation from './PageEducation.vue'
import { i18n } from '@/i18n'
import VeeForm from '@/components/veevalidate/VeeForm.vue'
import { useFormLang } from '@/composables/useFormLang'

const updateDoc = vi.hoisted(() => vi.fn())
const eduEntry: Record<string, any> = vi.hoisted(() => ({}))

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ educations: ref([eduEntry]), removeRecordById: vi.fn(), addRecordToList: vi.fn(), loadError: ref(null), getData: vi.fn() }),
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
    EducationItem: { props: ['modelValue'], emits: ['onView'], template: '<i class="view" @click="$emit(\'onView\', modelValue)" />' },
    Modal: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot /><slot name="footer" /></div>', methods: { show() {}, hide() {} } },
    VeeForm: { props: ['fields', 'document', 'submitFn'], template: '<div />', methods: { reset() {} } },
    FontAwesomeIcon: true,
}

describe('PageEducation — save payload', () => {
    it('sends endDate null when "current" is checked', async () => {
        setActivePinia(createPinia())
        const w = mount(PageEducation, { global: { stubs, plugins: [i18n] } })
        await w.findComponent(VeeForm).props('submitFn')({ _id: 'x1', startDate: 1641038400000, endDate: 1657022400000, isCurrent: true })
        expect(updateDoc.mock.calls[0][0]).toMatchObject({ endDate: null, isCurrent: true })
    })
})

describe('PageEducation — #444 read-only view', () => {
    const mountPage = () => {
        setActivePinia(createPinia())
        return mount(PageEducation, { global: { stubs, plugins: [i18n] } })
    }
    const base = {
        _id: 'ed1',
        school: { vi: 'ĐH A', en: 'Univ A' },
        major: { vi: 'CNTT', en: 'IT' },
        isCurrent: true,
        startDate: 1641038400000,
        endDate: null,
        description: { vi: 'Mô tả', en: 'Desc' },
    }

    it('shows the entry in the shared VI | EN language and jumps to edit', async () => {
        const { formLang } = useFormLang()
        formLang.value = 'vi'
        Object.assign(eduEntry, base)
        try {
            const w = mountPage()
            await w.find('.view').trigger('click')
            const view = () => w.findAll('h2')[1].element.parentElement!.textContent
            expect(w.findAll('h2')[1].text()).toBe('ĐH A')
            expect(view()).toContain('CNTT')
            expect(view()).toContain('01/2022 - Hiện tại')
            expect(w.find('dd.post-content').text()).toBe('Mô tả')

            await w.find('[role="radiogroup"] [data-lang="en"]').trigger('click')
            expect(formLang.value).toBe('en')
            expect(w.findAll('h2')[1].text()).toBe('Univ A')
            expect(view()).toContain('IT')
            expect(w.find('dd.post-content').text()).toBe('Desc')

            await w.findAll('button').find(b => b.text() === 'Sửa')!.trigger('click')
            expect(w.findComponent(VeeForm).props('document')._id).toBe('ed1')
        } finally {
            for (const k of Object.keys(eduEntry)) delete eduEntry[k]
            formLang.value = 'vi'
        }
    })

    it('falls back to VI when EN is empty and strips unsafe HTML', async () => {
        const { formLang } = useFormLang()
        formLang.value = 'en'
        Object.assign(eduEntry, base, { description: { vi: 'Mô tả<script>x()</script><img src="a" onerror="x()">', en: '' } })
        try {
            const w = mountPage()
            await w.find('.view').trigger('click')
            const dd = w.find('dd.post-content')
            expect(dd.text()).toBe('Mô tả')
            expect(dd.html()).not.toContain('<script')
            expect(dd.html()).not.toContain('onerror')
        } finally {
            for (const k of Object.keys(eduEntry)) delete eduEntry[k]
            formLang.value = 'vi'
        }
    })
})
