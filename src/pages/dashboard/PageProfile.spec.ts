import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageProfile from './PageProfile.vue'
import { i18n } from '@/i18n'

// Profile keeps id 'gone' of a deleted experience; only 'e1' still exists.
const lists: Record<string, ReturnType<typeof ref>> = {
    profiles: ref([{ _id: 'p1', name: 'Frontend', experienceIds: ['e1', 'gone'], educationIds: [] }]),
    experiences: ref([{ _id: 'e1', company: 'Acme' }]),
}

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: ({ field }: { field: string }) => ({ [field]: lists[field] || ref([]), removeRecordById: vi.fn(), addRecordToList: vi.fn(), loadError: ref(null), getData: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc: vi.fn(), deleteDoc: vi.fn() }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: true,
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: true,
    ListTransition: { template: '<ul><slot /></ul>' },
    ItemTemplate: { props: ['modelValue'], template: '<div class="card">{{ modelValue.subTitle }}|{{ modelValue.description }}</div>' },
    ItemActions: true,
    Modal: { template: '<div><slot /></div>', methods: { show() {}, hide() {} } },
    VeeForm: { template: '<div />', methods: { reset() {} } },
    FontAwesomeIcon: true,
}

describe('PageProfile — summary counts (#449)', () => {
    it('ignores ids of deleted entries', () => {
        setActivePinia(createPinia())
        i18n.global.locale.value = 'en'
        const w = mount(PageProfile, { global: { stubs, plugins: [i18n] } })
        expect(w.find('.card').text()).toBe('1 items selected|1 experience')
    })
})
