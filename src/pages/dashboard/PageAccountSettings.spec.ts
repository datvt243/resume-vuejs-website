import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as yup from 'yup'
import { setActivePinia, createPinia } from 'pinia'
import PageAccountSettings from './PageAccountSettings.vue'
import { i18n } from '@/i18n'
import { authStore } from '@/stores/auth'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
// VeeForm pulls in CKEditor (not loadable in jsdom)
vi.mock('@/components/veevalidate/VeeForm.vue', () => ({
    default: { name: 'VeeForm', props: ['fields', 'submitFn'], template: '<div class="stub-veeform"><slot name="cancel" /></div>' },
}))
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

describe('PageAccountSettings — change password / change email (#460)', () => {
    const mountPage = () =>
        mount(PageAccountSettings, {
            global: {
                plugins: [i18n],
                stubs: { Button: ButtonStub, Heading: true, SegmentedControl: true, LoadingGate: true, FormSection: { template: '<section><slot /></section>' } },
            },
        })
    const openForm = async (wrapper: ReturnType<typeof mountPage>, label: string) => {
        await wrapper.findAll('button').find(b => b.text() === i18n.global.t(label))!.trigger('click')
        return wrapper.findAllComponents({ name: 'VeeForm' }).at(-1)!
    }
    const schemaOf = (fields: { name: string; valid: (_y: typeof yup) => yup.AnySchema }[]) =>
        yup.object(Object.fromEntries(fields.map(f => [f.name, f.valid(yup)])))
    const errorOf = async (fields: Parameters<typeof schemaOf>[0], values: Record<string, string>) => {
        try {
            await schemaOf(fields).validate(values, { abortEarly: true })
            return null
        } catch (e) {
            return (e as yup.ValidationError).message
        }
    }

    beforeEach(() => {
        setActivePinia(createPinia())
        handleBase.mockReset()
    })

    it('change password: Register rules, posts the three fields, stores the new tokens on 200', async () => {
        const wrapper = mountPage()
        expect(wrapper.findAllComponents({ name: 'VeeForm' })).toHaveLength(0)
        const form = await openForm(wrapper, 'account.changePassword')
        const fields = form.props('fields')

        expect(await errorOf(fields, { currentPassword: 'old', password: 'Abcdefghij1!', repassword: 'Abcdefghij1!' })).toBeNull()
        expect(await errorOf(fields, { currentPassword: 'old', password: 'Abcdefghi1!', repassword: 'Abcdefghi1!' })).toBe('validation.passwordMin')
        expect(await errorOf(fields, { currentPassword: 'old', password: 'Abcdefghij1!', repassword: 'Abcdefghij1?' })).toBe('validation.passwordMismatch')

        const auth = authStore()
        const setTokens = vi.spyOn(auth, 'setTokens')
        handleBase.mockImplementation(async (_opts, _props, cb) => cb({ data: { token: 'a2', tokenRefresh: 'r2' } }))
        await form.props('submitFn')({ currentPassword: 'old', password: 'Abcdefghij1!', repassword: 'Abcdefghij1!' })
        await flushPromises()

        expect(handleBase.mock.calls[0][0]).toEqual({ method: 'post', url: 'auth/change-password', data: { currentPassword: 'old', password: 'Abcdefghij1!', repassword: 'Abcdefghij1!' } })
        expect(setTokens).toHaveBeenCalledWith({ token: 'a2', tokenRefresh: 'r2' })
        expect(wrapper.findAllComponents({ name: 'VeeForm' })).toHaveLength(0)
    })

    it('change password: a 400 keeps the user signed in and the form open', async () => {
        const wrapper = mountPage()
        const form = await openForm(wrapper, 'account.changePassword')
        const auth = authStore()
        const logOut = vi.spyOn(auth, 'logOut')
        // handleBase reports the error itself and never calls the success callback
        handleBase.mockImplementation(async () => {})
        await form.props('submitFn')({ currentPassword: 'wrong', password: 'Abcdefghij1!', repassword: 'Abcdefghij1!' })
        await flushPromises()

        expect(logOut).not.toHaveBeenCalled()
        expect(wrapper.findAllComponents({ name: 'VeeForm' })).toHaveLength(1)
    })

    it('cancel closes the change-password form', async () => {
        const wrapper = mountPage()
        await openForm(wrapper, 'account.changePassword')
        await wrapper.find('.stub-veeform').findAll('button').find(b => b.text() === i18n.global.t('common.cancel'))!.trigger('click')
        expect(wrapper.findAllComponents({ name: 'VeeForm' })).toHaveLength(0)
    })

    it('change email: posts { currentPassword, email } and keeps the shown email after 200', async () => {
        const auth = authStore()
        auth.setUser({ email: 'qa.full@example.com' })
        const wrapper = mountPage()
        const form = await openForm(wrapper, 'account.changeEmail')
        const fields = form.props('fields')
        expect(await errorOf(fields, { email: 'not-an-email', currentPassword: 'x' })).toBe('validation.emailInvalid')

        handleBase.mockImplementation(async (_opts, _props, cb) => cb({ message: 'sent' }))
        await form.props('submitFn')({ email: ' new@example.com ', currentPassword: 'pw' })
        await flushPromises()

        expect(handleBase.mock.calls[0][0]).toEqual({ method: 'post', url: 'auth/change-email', data: { currentPassword: 'pw', email: 'new@example.com' } })
        expect(wrapper.find('[data-current-email]').text()).toBe('qa.full@example.com')
        expect(wrapper.findAllComponents({ name: 'VeeForm' })).toHaveLength(0)
    })
})
