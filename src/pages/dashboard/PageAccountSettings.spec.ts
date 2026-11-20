import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageAccountSettings from './PageAccountSettings.vue'
import { i18n } from '@/i18n'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
// VeeForm pulls in CKEditor (not loadable in jsdom)
vi.mock('@/components/veevalidate/VeeForm.vue', () => ({ default: { name: 'VeeForm', render: () => null } }))
vi.mock('@/composables/useHelper', () => ({ useHelper: () => ({ loading: { value: false }, toast: vi.fn() }) }))
vi.mock('@/composables/useDocument', () => ({ useDocument: () => ({ updatePatchDoc: vi.fn() }) }))
const confirmDelete = vi.fn()
vi.mock('@/lib/swal.lib', () => ({ confirmDelete: (opts: unknown) => confirmDelete(opts) }))
const handleBase = vi.fn()
vi.mock('@/services/base', () => ({ handleBase: (...args: unknown[]) => handleBase(...args) }))

const ButtonStub = { props: ['text'], template: '<button @click="$emit(\'click\')">{{ text }}</button>' }

describe('PageAccountSettings — delete account', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        confirmDelete.mockReset()
        handleBase.mockReset()
    })

    it('asks for the typed `delete` and only then sends DELETE candidate', async () => {
        const wrapper = mount(PageAccountSettings, {
            global: {
                plugins: [i18n],
                stubs: { Button: ButtonStub, Heading: true, SegmentedControl: true, LoadingGate: true, FormSection: { template: '<section><slot /></section>' } },
            },
        })
        const label = i18n.global.t('account.delete')
        await wrapper.findAll('button').find(b => b.text() === label)!.trigger('click')

        const opts = confirmDelete.mock.calls[0][0]
        expect(opts.typed).toBe(true)
        expect(handleBase).not.toHaveBeenCalled()
        await opts.callback()
        expect(handleBase).toHaveBeenCalledTimes(1)
        expect(handleBase.mock.calls[0][0]).toEqual({ method: 'delete', url: 'candidate' })
    })
})
