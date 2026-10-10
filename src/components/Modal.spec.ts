import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Modal from './Modal.vue'
import VeeForm from './veevalidate/VeeForm.vue'
import type { modelItem } from '@/types/model.type'

const confirmDiscardChanges = vi.fn()
vi.mock('@/lib/swal.lib', () => ({ confirmDiscardChanges: () => confirmDiscardChanges() }))

// Same reason as VeeForm.spec.ts: the real barrel pulls in CKEditor, which
// can't load under jsdom.
vi.mock('@/components/veevalidate', async () => {
    const stub = (name: string) => ({ name, render: () => null })
    return {
        FrmInput: (await import('./veevalidate/part/FrmInput.vue')).default,
        FrmCheckbox: stub('FrmCheckbox'),
        FrmTextArea: stub('FrmTextArea'),
        FrmSelect: stub('FrmSelect'),
        FrmCurrency: stub('FrmCurrency'),
        FrmPwd: stub('FrmPwd'),
        FrmDatePicker: stub('FrmDatePicker'),
        FrmCkediter: stub('FrmCkediter'),
    }
})

const fields = [{ name: 'name', label: 'Name', type: 'text', default: '' }] as unknown as modelItem[]

function mountModalWithForm() {
    const Host = defineComponent({
        setup(_, { expose }) {
            const refModal = ref()
            const document = ref<Record<string, unknown>>({})
            expose({ refModal, document })
            return () =>
                h(Modal, { ref: refModal, isHiddenFooter: true }, () => h(VeeForm, { fields, document: document.value }))
        },
    })
    return mount(Host, { global: { stubs: { FontAwesomeIcon: true } } })
}

async function open(wrapper: ReturnType<typeof mountModalWithForm>) {
    const vm = wrapper.vm as any
    vm.refModal.show()
    await flushPromises()
}

const isOpen = (wrapper: ReturnType<typeof mountModalWithForm>) =>
    wrapper.find('.modal').attributes('style')?.includes('display: block')

// An open Modal keeps a document-level keydown listener until hidden/unmounted.
enableAutoUnmount(afterEach)

describe('Modal unsaved-changes guard', () => {
    beforeEach(() => {
        confirmDiscardChanges.mockReset()
    })

    it('closes without asking when the form is untouched', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        await wrapper.find('[data-bs-dismiss="modal"]').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(false)
    })

    it('focusing a field without changing it does not count as unsaved', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        await wrapper.find('input[type="text"]').trigger('focusin')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(false)
    })

    it('asks before closing a dirty form and stays open when the user cancels', async () => {
        confirmDiscardChanges.mockResolvedValue(false)
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await flushPromises()

        expect(confirmDiscardChanges).toHaveBeenCalledTimes(1)
        expect(isOpen(wrapper)).toBe(true)
    })

    it('closes a dirty form once the user confirms (dismiss button)', async () => {
        confirmDiscardChanges.mockResolvedValue(true)
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        await wrapper.find('[data-bs-dismiss="modal"]').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).toHaveBeenCalledTimes(1)
        expect(isOpen(wrapper)).toBe(false)
    })

    it('typing a change then reverting it counts as clean', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        await input.setValue('')
        await wrapper.find('[data-bs-dismiss="modal"]').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(false)
    })

    it('a second Escape while the confirm is open does not stack another confirm', async () => {
        let resolve!: (_confirmed: boolean) => void
        confirmDiscardChanges.mockReturnValue(new Promise<boolean>(r => (resolve = r)))
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        resolve(false)
        await flushPromises()

        expect(confirmDiscardChanges).toHaveBeenCalledTimes(1)
        expect(isOpen(wrapper)).toBe(true)
    })

    it('a click outside the dialog (on the .modal layer) asks on a dirty form', async () => {
        confirmDiscardChanges.mockResolvedValue(true)
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        await wrapper.find('.modal').trigger('mousedown')
        await wrapper.find('.modal').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).toHaveBeenCalledTimes(1)
        expect(isOpen(wrapper)).toBe(false)
    })

    it('a click outside closes a clean form without asking', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        await wrapper.find('.modal').trigger('mousedown')
        await wrapper.find('.modal').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(false)
    })

    it('a drag that starts inside the dialog and ends outside does not close it', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        await wrapper.find('input[type="text"]').trigger('mousedown')
        await wrapper.find('.modal').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(true)
    })

    it('a click inside the dialog body does not close it', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        await wrapper.find('.modal-body').trigger('mousedown')
        await wrapper.find('.modal-body').trigger('click')
        await flushPromises()

        expect(isOpen(wrapper)).toBe(true)
    })

    it('programmatic hide() (after save) never asks, even when dirty', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        ;(wrapper.vm as any).refModal.hide()
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(false)
    })

    it('loading a different document clears the unsaved state', async () => {
        const wrapper = mountModalWithForm()
        await open(wrapper)

        const input = wrapper.find('input[type="text"]')
        await input.trigger('focusin')
        await input.setValue('Dat')
        ;(wrapper.vm as any).document = { _id: '1', name: 'Saved' }
        await flushPromises()
        await wrapper.find('[data-bs-dismiss="modal"]').trigger('click')
        await flushPromises()

        expect(confirmDiscardChanges).not.toHaveBeenCalled()
        expect(isOpen(wrapper)).toBe(false)
    })
})
