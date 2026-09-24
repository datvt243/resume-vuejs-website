import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios'

vi.mock('axios', () => ({
    default: { post: vi.fn() },
}))

import { authStore } from './auth'
import { candidateStore } from './candidate'

describe('authStore', () => {
    beforeEach(() => {
        localStorage.clear()
        document.cookie = ''
        setActivePinia(createPinia())
        vi.mocked(axios.post).mockReset().mockResolvedValue({ data: {} })
    })

    it('starts unauthenticated with no user in localStorage', () => {
        const store = authStore()
        expect(store.isAuthenticated).toBe(false)
        expect(store.getUser).toEqual({})
    })

    it('reads an existing user from localStorage on creation', () => {
        localStorage.setItem('user', JSON.stringify({ email: 'dat@example.com' }))
        const store = authStore()
        expect(store.getUser).toEqual({ email: 'dat@example.com' })
        expect(store.isAuthenticated).toBe(true)
    })

    it('setUser merges into the reactive user, persists to localStorage, and marks authenticated', () => {
        const store = authStore()
        store.setUser({ name: 'Dat', email: 'dat@example.com' })
        expect(store.getUser).toEqual({ name: 'Dat', email: 'dat@example.com' })
        expect(JSON.parse(localStorage.getItem('user') as string)).toEqual({ name: 'Dat', email: 'dat@example.com' })
        expect(store.isAuthenticated).toBe(true)
    })

    it('clearUser empties the reactive user object (issue #38 regression)', () => {
        const store = authStore()
        store.setUser({ name: 'Dat', email: 'dat@example.com' })
        store.clearUser()
        expect(store.getUser).toEqual({})
    })

    it('logOut calls the backend logout endpoint (issue #8: clears the httpOnly auth cookies server-side)', async () => {
        const store = authStore()
        store.setUser({ email: 'dat@example.com' })

        await store.logOut()

        expect(axios.post).toHaveBeenCalledTimes(1)
        const [url, , options] = vi.mocked(axios.post).mock.calls[0]
        expect(url).toContain('auth/logout')
        expect(options).toMatchObject({ withCredentials: true })
    })

    it('logOut clears localStorage, resets user, and cleans the candidate store', async () => {
        const store = authStore()
        store.setUser({ email: 'dat@example.com' })

        const candidate = candidateStore()
        candidate.setCandidate({ _id: '1', name: 'resume' })

        await store.logOut()

        expect(localStorage.getItem('user')).toBeNull()
        expect(store.getUser).toEqual({})
        expect(store.isAuthenticated).toBe(false)
        expect(candidate.getCandidate).toEqual({ gender: 0, marital: 0 })
    })

    it('logOut still clears local state when the backend call fails (best-effort)', async () => {
        vi.mocked(axios.post).mockRejectedValue(new Error('network error'))
        const store = authStore()
        store.setUser({ email: 'dat@example.com' })

        await store.logOut()

        expect(store.getUser).toEqual({})
        expect(store.isAuthenticated).toBe(false)
    })

    it('logOut navigates to /login when a router is passed', async () => {
        const store = authStore()
        const push = vi.fn()
        await store.logOut({ router: { push } })
        expect(push).toHaveBeenCalledWith('/login')
    })

    it('logOut does not throw when called without a router', async () => {
        const store = authStore()
        await expect(store.logOut()).resolves.not.toThrow()
    })
})
