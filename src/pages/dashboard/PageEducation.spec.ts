import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageEducation from './PageEducation.vue'
import { i18n } from '@/i18n'
import VeeForm from '@/components/veevalidate/VeeForm.vue'

const updateDoc = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ educations: ref([]), removeRecordById: vi.fn(), addRecordToList: vi.fn(), loadError: ref(null), getData: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc, deleteDoc: vi.fn() }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: true,
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: true,
    ListTransition: true,
    Modal: { template: '<div><slot /></div>', methods: { show() {}, hide() {} } },
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
