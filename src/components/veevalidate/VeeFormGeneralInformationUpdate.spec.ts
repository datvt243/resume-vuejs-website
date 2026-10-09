import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import VeeFormGeneralInformationUpdate from './VeeFormGeneralInformationUpdate.vue'

const swalFire = vi.fn()
vi.mock('sweetalert2', () => ({ default: { fire: (...args: unknown[]) => swalFire(...args) } }))

const updatePatchDoc = vi.fn()
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: {}, updatePatchDoc: (...args: unknown[]) => updatePatchDoc(...args) }),
}))

// VeeForm pulls in CKEditor via the veevalidate barrel (not loadable in jsdom)
vi.mock('@/components/veevalidate/VeeForm.vue', () => ({ default: { name: 'VeeForm', render: () => null } }))

// Renders the per-row action slot so the delete link can be clicked
const TableStub = defineComponent({
    setup(_, { slots }) {
        return () => h('table', slots.tbodyMore?.({ doc: { index: 0 } }))
    },
})

function mountComponent() {
    return mount(VeeFormGeneralInformationUpdate, {
        props: { fieldKey: 'personalSkills', modelValue: { personalSkills: [{ name: 'a' }] } },
        global: {
            provide: { candidate: ref({ _id: 'c1' }) },
            stubs: { TableDefault: TableStub, Heading: true, Modal: true, FontAwesomeIcon: true },
        },
    })
}

describe('VeeFormGeneralInformationUpdate — delete confirmation', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        swalFire.mockReset()
        updatePatchDoc.mockReset()
    })

    it('rejects any input other than "delete" with a message instead of closing silently', async () => {
        swalFire.mockResolvedValue({ value: undefined })
        const wrapper = mountComponent()

        await wrapper.find('a.dropdown-item').trigger('click')
        await flushPromises()

        const { inputValidator } = swalFire.mock.calls[0][0]
        expect(inputValidator('delet')).toBeTruthy()
        expect(inputValidator('')).toBeTruthy()
        expect(inputValidator('delete')).toBeFalsy()
        expect(updatePatchDoc).not.toHaveBeenCalled()
    })

    it('deletes the row once "delete" is confirmed', async () => {
        swalFire.mockResolvedValue({ value: 'delete' })
        const wrapper = mountComponent()

        await wrapper.find('a.dropdown-item').trigger('click')
        await flushPromises()

        expect(updatePatchDoc).toHaveBeenCalledTimes(1)
        expect(updatePatchDoc.mock.calls[0][0]).toEqual({ _id: 'c1', personalSkills: [] })
    })
})
