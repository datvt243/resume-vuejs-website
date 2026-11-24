import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageConfirmEmailChange from './PageConfirmEmailChange.vue'
import { authStore } from '@/stores/auth'
import { setUiLang } from '@/i18n'

const route = { query: {} as Record<string, unknown> }
const push = vi.fn()
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ push }) }))
const toast = vi.fn()
vi.mock('@/composables/useHelper', () => ({ useHelper: () => ({ loading: null, toast }) }))
const handleBase = vi.fn()
vi.mock('@/services/base', () => ({ handleBase: (...args: unknown[]) => handleBase(...args) }))

const stubs = {
    Heading: { props: ['text'], template: '<h1>{{ text }}</h1>' },
    RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
}
const mountPage = () => mount(PageConfirmEmailChange, { global: { stubs } })

describe('PageConfirmEmailChange (#460)', () => {
    beforeEach(() => {
        // the auth store restores user / refresh token from storage on creation
        localStorage.clear()
        sessionStorage.clear()
        setActivePinia(createPinia())
        handleBase.mockReset()
        toast.mockReset()
        push.mockReset()
        setUiLang('en')
        route.query = { token: 't1' }
    })

    it('without a token: invalid-link text, a link to login, no request', async () => {
        route.query = { token: ['a', 'b'] }
        const wrapper = mountPage()
        await flushPromises()

        expect(handleBase).not.toHaveBeenCalled()
        expect(wrapper.text()).toContain('This email confirmation link is invalid')
        expect(wrapper.find('a[href="/login"]').exists()).toBe(true)
    })

    it('signed out, 200: one GET with the token, success text and a link to login, no logout', async () => {
        const logOut = vi.spyOn(authStore(), 'logOut')
        handleBase.mockImplementation(async (_opts, _props, cb) => cb({ message: 'Email changed' }))
        const wrapper = mountPage()
        await flushPromises()

        expect(handleBase).toHaveBeenCalledTimes(1)
        expect(handleBase.mock.calls[0][0]).toEqual({ method: 'get', url: 'auth/confirm-email-change', params: { token: 't1' } })
        expect(wrapper.text()).toContain('Email changed')
        expect(wrapper.find('a[href="/login"]').text()).toBe('Go to log in')
        expect(logOut).not.toHaveBeenCalled()
    })

    it('signed in, 200: signs out and goes to /login with the "sign in with your new email" toast', async () => {
        const auth = authStore()
        auth.setUser({ email: 'old@example.com' })
        auth.setTokens({ token: 'a', tokenRefresh: 'r' })
        const logOut = vi.spyOn(auth, 'logOut').mockResolvedValue(undefined)
        handleBase.mockImplementation(async (_opts, _props, cb) => cb({ message: 'Email changed' }))
        mountPage()
        await flushPromises()

        expect(handleBase).toHaveBeenCalledTimes(1)
        expect(logOut).toHaveBeenCalledWith({ router: expect.objectContaining({ push }) })
        expect(toast).toHaveBeenCalledWith({ message: 'Your email has been changed. Sign in again with your new email.', bg: 'success' })
    })

    it('signed out in this tab but a stored user from another tab: clears it, still shows success', async () => {
        const auth = authStore()
        auth.setUser({ email: 'old@example.com' })
        const logOut = vi.spyOn(auth, 'logOut')
        handleBase.mockImplementation(async (_opts, _props, cb) => cb({ message: 'Email changed' }))
        const wrapper = mountPage()
        await flushPromises()

        expect(logOut).toHaveBeenCalledWith()
        expect(localStorage.getItem('user')).toBeNull()
        expect(wrapper.text()).toContain('Email changed')
        expect(push).not.toHaveBeenCalled()
    })

    it('400: shows the API message and a link back to login', async () => {
        handleBase.mockImplementation(async (_opts, props) => props.onError({ success: false, error: { message: 'Link expired' } }))
        const wrapper = mountPage()
        await flushPromises()

        expect(wrapper.find('[role="alert"]').text()).toBe('Link expired')
        expect(wrapper.find('a[href="/login"]').exists()).toBe(true)
    })
})
