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
        sessionStorage.clear()
        setActivePinia(createPinia())
        vi.mocked(axios.post).mockReset().mockResolvedValue({ data: {} })
    })

    it('starts unauthenticated with no user in localStorage', () => {
        const store = authStore()
        expect(store.isAuthenticated).toBe(false)
        expect(store.getUser).toEqual({})
    })

    it('reads an existing user from localStorage and refresh token from sessionStorage on creation', () => {
        localStorage.setItem('user', JSON.stringify({ email: 'dat@example.com' }))
        sessionStorage.setItem('refreshToken', 'rt')
        const store = authStore()
        expect(store.getUser).toEqual({ email: 'dat@example.com' })
        expect(store.getRefreshToken).toBe('rt')
        expect(store.getToken).toBe('')
        expect(store.isAuthenticated).toBe(true)
    })

    it('a cached user without a refresh token (e.g. a new tab) is not authenticated', () => {
        localStorage.setItem('user', JSON.stringify({ email: 'dat@example.com' }))
        const store = authStore()
        expect(store.isAuthenticated).toBe(false)
    })

    it('setTokens keeps the access token in memory only and the refresh token in sessionStorage', () => {
        const store = authStore()
        store.setTokens({ token: 'at', tokenRefresh: 'rt' })
        expect(store.getToken).toBe('at')
        expect(store.getRefreshToken).toBe('rt')
        expect(sessionStorage.getItem('refreshToken')).toBe('rt')
        expect(JSON.stringify({ ...localStorage })).not.toContain('at')
    })

    it('setUser merges into the reactive user, persists to localStorage, and marks authenticated', () => {
        const store = authStore()
        store.setTokens({ token: 'at', tokenRefresh: 'rt' })
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

    it('logOut calls the backend logout endpoint with the Bearer access token', async () => {
        const store = authStore()
        store.setTokens({ token: 'at', tokenRefresh: 'rt' })
        store.setUser({ email: 'dat@example.com' })

        await store.logOut()

        expect(axios.post).toHaveBeenCalledTimes(1)
        const [url, , options] = vi.mocked(axios.post).mock.calls[0]
        expect(url).toContain('auth/logout')
        expect(options).toMatchObject({ headers: { Authorization: 'Bearer at' } })
    })

    it('logOut clears localStorage, resets user, and cleans the candidate store', async () => {
        const store = authStore()
        store.setUser({ email: 'dat@example.com' })

        const candidate = candidateStore()
        candidate.setCandidate({ _id: '1', name: 'resume' })

        await store.logOut()

        expect(localStorage.getItem('user')).toBeNull()
        expect(sessionStorage.getItem('refreshToken')).toBeNull()
        expect(store.getToken).toBe('')
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
