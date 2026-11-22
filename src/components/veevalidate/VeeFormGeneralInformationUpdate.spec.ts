import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import VeeFormGeneralInformationUpdate from './VeeFormGeneralInformationUpdate.vue'
import Button from '@/components/global/Button.vue'
import FormSection from '@/components/global/FormSection.vue'
import TableDefault from '@/components/table/TableDefault.vue'

const swalFire = vi.fn()
vi.mock('sweetalert2', () => ({ default: { fire: (...args: unknown[]) => swalFire(...args) } }))

const updatePatchDoc = vi.fn()
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: {}, updatePatchDoc: (...args: unknown[]) => updatePatchDoc(...args) }),
}))

// VeeForm pulls in CKEditor via the veevalidate barrel (not loadable in jsdom)
vi.mock('@/components/veevalidate/VeeForm.vue', () => ({ default: { name: 'VeeForm', props: ['fields', 'document', 'submitFn'], render: () => null } }))

// Renders the per-row action slot so the delete link can be clicked
const TableStub = defineComponent({
    setup(_, { slots }) {
        return () => h('table', slots.tbodyMore?.({ doc: { index: 0 } }))
    },
})

function mountComponent({ id = 'c1', props = {} } = {}) {
    return mount(VeeFormGeneralInformationUpdate, {
        props: { fieldKey: 'personalSkills', modelValue: { personalSkills: [{ name: 'a' }] }, ...props },
        global: {
            provide: { candidate: ref({ _id: id }) },
            components: { Button, FormSection },
            stubs: { TableDefault: TableStub, Modal: true, FontAwesomeIcon: true },
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

        await wrapper.find('button[aria-label^="Xóa"]').trigger('click')
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

        await wrapper.find('button[aria-label^="Xóa"]').trigger('click')
        await flushPromises()

        expect(updatePatchDoc).toHaveBeenCalledTimes(1)
        expect(updatePatchDoc.mock.calls[0][0]).toEqual({ _id: 'c1', personalSkills: [] })
    })
})

describe('VeeFormGeneralInformationUpdate — save hooks', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        swalFire.mockReset()
        updatePatchDoc.mockReset()
    })

    it('#437: merges syncPayload fields into the same PATCH', async () => {
        swalFire.mockResolvedValue({ value: 'delete' })
        const syncPayload = vi.fn(() => ({ mainSkills: [] }))
        const wrapper = mountComponent({ props: { syncPayload } })

        await wrapper.find('button[aria-label^="Xóa"]').trigger('click')
        await flushPromises()

        expect(syncPayload).toHaveBeenCalledWith([], {})
        expect(updatePatchDoc.mock.calls[0][0]).toEqual({ _id: 'c1', personalSkills: [], mainSkills: [] })
    })

    it('#438: no document _id → shows the "save General information first" message, no PATCH', async () => {
        swalFire.mockResolvedValue({ isConfirmed: false })
        const wrapper = mountComponent({ id: '' })

        await wrapper.find('button[aria-label^="Xóa"]').trigger('click')
        await flushPromises()

        expect(swalFire).toHaveBeenCalledTimes(1)
        expect(swalFire.mock.calls[0][0].title).toBe('Chưa lưu Thông tin chung')
        expect(updatePatchDoc).not.toHaveBeenCalled()
    })
})

describe('VeeFormGeneralInformationUpdate — #441 edit a row', () => {
    const levelOptions = ['basic', 'advanced', 'expert'].map(value => ({ value, text: `option.languageLevel.${value}` }))
    const fields = [
        { name: 'language', label: 'generalInfo.language', type: 'text', default: '' },
        { name: 'level', label: 'generalInfo.level', type: 'select', options: levelOptions, default: '' },
    ]
    const list = () => [
        { language: 'English', level: 'basic' },
        { language: 'French', level: 'advanced' },
    ]
    const show = vi.fn()

    function mountTable() {
        return mount(VeeFormGeneralInformationUpdate, {
            props: { fieldKey: 'foreignLanguages', modelValue: { foreignLanguages: list() }, fields, hasButtonAdd: true },
            global: {
                provide: { candidate: ref({ _id: 'c1' }) },
                components: { Button, FormSection, TableDefault },
                stubs: { FontAwesomeIcon: true, NoData: true, Modal: { template: '<div><slot /></div>', methods: { show, hide() {} } } },
            },
        })
    }
    const form = (w: ReturnType<typeof mountTable>) => w.findComponent({ name: 'VeeForm' })

    beforeEach(() => {
        setActivePinia(createPinia())
        swalFire.mockReset()
        updatePatchDoc.mockReset()
        show.mockReset()
    })

    it('clicking a row opens the modal pre-filled, and save patches that row in place', async () => {
        const w = mountTable()
        await w.findAll('tbody tr')[0].find('td').trigger('click')
        expect(show).toHaveBeenCalledTimes(1)
        expect(form(w).props('document')).toMatchObject({ language: 'English', level: 'basic' })

        await form(w).props('submitFn')({ language: 'English', level: 'expert' })
        expect(updatePatchDoc.mock.calls[0][0]).toEqual({
            _id: 'c1',
            foreignLanguages: [
                { language: 'English', level: 'expert' },
                { language: 'French', level: 'advanced' },
            ],
        })
    })

    it('the row Edit button opens the same form; Delete does not', async () => {
        swalFire.mockResolvedValue({ value: undefined })
        const w = mountTable()
        await w.find('button[aria-label="Sửa French"]').trigger('click')
        expect(show).toHaveBeenCalledTimes(1)
        expect(form(w).props('document')).toMatchObject({ language: 'French', level: 'advanced' })

        await w.find('button[aria-label="Xóa English"]').trigger('click')
        expect(show).toHaveBeenCalledTimes(1)
    })
})
