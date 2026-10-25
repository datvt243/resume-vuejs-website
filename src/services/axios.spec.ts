import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

const { store } = vi.hoisted(() => ({
    store: { getToken: 'old', getRefreshToken: 'refresh', setTokens: vi.fn(), logOut: vi.fn() },
}))
vi.mock('@/stores/auth', () => ({ authStore: () => store }))

// every request (instance + the plain axios.post refresh) goes through this fake adapter
const adapter = vi.fn()
axios.defaults.adapter = adapter
const { _axios } = await import('./axios')

const reply = (config, status, data) => {
    const res = { status, data, config, headers: {}, statusText: '' }
    if (status < 300) return Promise.resolve(res)
    return Promise.reject(Object.assign(new Error(`${status}`), { config, response: res, isAxiosError: true }))
}
const refreshCalls = () => adapter.mock.calls.filter(([c]) => c.url.endsWith('auth/refresh')).length

describe('_axios 401 interceptor', () => {
    beforeEach(() => {
        adapter.mockReset()
        store.setTokens.mockReset()
        store.logOut.mockReset()
    })

    it.each([
        ['400 VALIDATION_ERROR', 400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'bad' } }],
        ['401 INVALID_CREDENTIALS (new)', 401, { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'bad' } }],
        ['401 INVALID_CREDENTIALS (legacy)', 401, { success: false, errorCode: 'INVALID_CREDENTIALS', message: 'bad' }],
    ])('%s does not refresh or log out', async (_, status, body) => {
        adapter.mockImplementation(config => reply(config, status, body))
        await expect(_axios({ method: 'post', url: 'api/v1/auth/login' })).rejects.toEqual(body)
        expect(refreshCalls()).toBe(0)
        expect(store.logOut).not.toHaveBeenCalled()
    })

    it.each([
        ['new TOKEN_EXPIRED', { success: false, error: { code: 'TOKEN_EXPIRED', message: 'exp' } }],
        ['legacy body without code', { success: false, message: 'exp' }],
    ])('401 %s refreshes then retries', async (_, body) => {
        let first = true
        adapter.mockImplementation(config => {
            if (config.url.endsWith('auth/refresh')) return reply(config, 200, { data: { token: 'new' } })
            if (first) return (first = false), reply(config, 401, body)
            return reply(config, 200, { success: true, data: 'ok' })
        })
        await expect(_axios({ method: 'get', url: 'api/v1/education/' })).resolves.toEqual({ success: true, data: 'ok' })
        expect(refreshCalls()).toBe(1)
        expect(store.setTokens).toHaveBeenCalledWith({ token: 'new' })
    })

    it('rejects with the new-shape NETWORK_ERROR body when there is no response', async () => {
        adapter.mockImplementation(() => Promise.reject(new Error('Network Error')))
        await expect(_axios({ method: 'get', url: 'x' })).rejects.toMatchObject({ success: false, error: { code: 'NETWORK_ERROR' } })
    })
})

describe('_axios up-front refresh after a reload', () => {
    beforeEach(() => {
        adapter.mockReset()
        store.setTokens.mockReset()
        store.logOut.mockReset()
    })

    it('refreshes once before sending when only the refresh token is left, so no request 401s first', async () => {
        store.getToken = ''
        store.setTokens.mockImplementation(({ token }) => (store.getToken = token))
        adapter.mockImplementation(config =>
            config.url.endsWith('auth/refresh') ? reply(config, 200, { data: { token: 'new' } }) : reply(config, 200, { success: true }),
        )

        await Promise.all([_axios({ method: 'get', url: 'api/v1/award/' }), _axios({ method: 'get', url: 'api/v1/project/' })])

        const sent = adapter.mock.calls.map(([c]) => c.url)
        expect(refreshCalls()).toBe(1)
        expect(sent.filter(u => !u.endsWith('auth/refresh'))).toHaveLength(2)
        expect(adapter.mock.calls.filter(([c]) => !c.url.endsWith('auth/refresh')).every(([c]) => c.headers.Authorization === 'Bearer new')).toBe(true)
        store.getToken = 'old'
    })
})
