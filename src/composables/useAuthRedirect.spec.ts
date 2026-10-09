import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('axios', () => ({
    default: { post: vi.fn().mockResolvedValue({ data: {} }), create: vi.fn() },
}))

import { authStore } from '@/stores/auth'
import { useAuthRedirect } from './useAuthRedirect'

const Blank = defineComponent({ render: () => h('div') })

const makeRouter = () =>
    createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/login', name: 'login', component: Blank },
            { path: '/resume/:slug', name: 'public-resume', component: Blank },
            {
                path: '/dashboard',
                component: Blank,
                meta: { requiresAuth: true },
                children: [{ path: 'information', component: Blank, meta: { requiresAuth: true } }],
            },
        ],
    })

const mountAt = async (path: string) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = makeRouter()
    router.push(path)
    await router.isReady()
    const App = defineComponent({
        setup() {
            useAuthRedirect()
            return () => h(RouterView)
        },
    })
    mount(App, { global: { plugins: [pinia, router] } })
    return router
}

const logIn = () => {
    localStorage.setItem('user', JSON.stringify({ email: 'dat@example.com' }))
    sessionStorage.setItem('refreshToken', 'rt')
}

describe('useAuthRedirect', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    it('redirects to /login when a forced logout happens on a protected route', async () => {
        logIn()
        const router = await mountAt('/dashboard/information')
        expect(authStore().isAuthenticated).toBe(true)

        // same call services/axios.ts makes on refresh failure: no router passed
        await authStore().logOut()
        await flushPromises()

        expect(router.currentRoute.value.name).toBe('login')
    })

    it('stays on a public route when auth is lost there', async () => {
        logIn()
        const router = await mountAt('/resume/dat')

        await authStore().logOut()
        await flushPromises()

        expect(router.currentRoute.value.path).toBe('/resume/dat')
    })

    it('does not navigate while auth stays valid', async () => {
        logIn()
        const router = await mountAt('/dashboard/information')

        authStore().setTokens({ token: 'new', tokenRefresh: 'rt2' })
        await flushPromises()

        expect(router.currentRoute.value.path).toBe('/dashboard/information')
    })
})
