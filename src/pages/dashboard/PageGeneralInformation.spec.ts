import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageGeneralInformation from './PageGeneralInformation.vue'
import { i18n } from '@/i18n'
import VeeForm from '@/components/veevalidate/VeeForm.vue'

const updateDoc = vi.hoisted(() => vi.fn())
const setFieldError = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ generalInformation: ref([]), getData: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: true,
    FormSection: { template: '<div><slot /></div>' },
    LoadingGate: { template: '<div><slot /></div>' },
    VeeForm: { props: ['fields', 'document', 'submitFn'], template: '<div />', methods: { setFieldError } },
}

describe('PageGeneralInformation — salary range save', () => {
    it('sends both range keys and puts salary 400s under the field, not a toast', async () => {
        setActivePinia(createPinia())
        const w = mount(PageGeneralInformation, { global: { stubs, plugins: [i18n] } })
        await w.findComponent(VeeForm).props('submitFn')({ _id: 'g1', salaryDesiredFrom: 1000, salaryDesiredTo: 2000, career: 'IT', careerEn: '' })
        const [payload, , onError] = updateDoc.mock.calls[0]
        expect(payload).toMatchObject({ salaryDesiredFrom: 1000, salaryDesiredTo: 2000 })
        expect(payload).not.toHaveProperty('salaryDesired')

        expect(onError({ success: false, error: { code: 'VALIDATION_ERROR', message: 'v', details: [{ field: 'salaryDesiredTo', message: 'Y' }] } })).toBe(true)
        expect(setFieldError).toHaveBeenLastCalledWith('salaryDesiredTo', 'Y')
        expect(onError({ success: false, error: { code: 'VALIDATION_ERROR', message: 'v', details: [{ field: 'workLocation', message: 'Z' }] } })).toBe(false)
        expect(onError({ success: false, error: { code: 'INTERNAL_ERROR', message: 'boom' } })).toBe(false)
        expect(setFieldError).toHaveBeenCalledTimes(1)
    })
})
