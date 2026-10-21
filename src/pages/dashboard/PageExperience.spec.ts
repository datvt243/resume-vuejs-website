import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageExperience from './PageExperience.vue'
import { i18n } from '@/i18n'
import VeeForm from '@/components/veevalidate/VeeForm.vue'

const breakEntry = { _id: 'e2', isCareerBreak: true, careerBreakType: 'travel', startDate: 1641038400000, endDate: 1657022400000 }

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ experiences: ref([breakEntry]), removeRecordById: vi.fn(), addRecordToList: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc: vi.fn(), deleteDoc: vi.fn() }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button class="btn" @click="$emit(\'click\')">{{ text }}</button>' },
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: true,
    ListTransition: { template: '<ul><slot /></ul>' },
    ExperienceItem: {
        props: ['modelValue'],
        emits: ['onEdit', 'onView'],
        template: '<div><i class="exp" @click="$emit(\'onEdit\', modelValue)" /><i class="view" @click="$emit(\'onView\', modelValue)" /></div>',
    },
    Modal: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot /><slot name="footer" /></div>', methods: { show() {}, hide() {} } },
    VeeForm: { props: ['fields', 'document'], template: '<div />', methods: { reset() {} } },
    FontAwesomeIcon: true,
}

const mountPage = () => {
    setActivePinia(createPinia())
    return mount(PageExperience, { global: { stubs, plugins: [i18n] } })
}
const field = (w: any, name: string) => (w.findComponent(VeeForm).props('fields') as any[]).find(f => f.name === name)

describe('PageExperience — experience or career break', () => {
    it('asks for the type before showing the form, then fits the form to the choice', async () => {
        const w = mountPage()
        await w.find('.btn').trigger('click')
        expect(w.find('h2').text()).toBe('Bạn muốn thêm gì?')
        expect(w.findAll('[data-type]')).toHaveLength(2)

        await w.find('[data-type="typeBreak"]').trigger('click')
        expect(w.find('[data-type]').exists()).toBe(false)
        expect(w.find('h2').text()).toBe('Thêm khoảng nghỉ việc')
        expect(w.findComponent(VeeForm).props('document').isCareerBreak).toBe(true)
        expect(field(w, 'isCareerBreak').showIf()).toBe(false)
        expect(field(w, 'isCurrent').label).toBe('field.isOnBreak')
    })

    it('opens an existing career break straight on its form', async () => {
        const w = mountPage()
        await w.find('.exp').trigger('click')
        expect(w.find('[data-type]').exists()).toBe(false)
        expect(field(w, 'isCareerBreak').default).toBe(true)
    })

    it('shows a read-only detail view that can jump to edit', async () => {
        const w = mountPage()
        await w.find('.view').trigger('click')
        const view = w.findAll('h2')[1].element.parentElement!
        expect(view.textContent).toContain('Du lịch')
        expect(view.textContent).toContain('01/2022 - 07/2022')
        await w.findAll('button').find(b => b.text() === 'Sửa')!.trigger('click')
        expect(w.findComponent(VeeForm).props('document')._id).toBe('e2')
    })
})
