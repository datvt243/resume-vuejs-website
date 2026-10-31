import { describe, it, expect, vi, beforeEach } from 'vitest'

const { axiosMock, setUserMock } = vi.hoisted(() => ({ axiosMock: vi.fn(), setUserMock: vi.fn() }))
vi.mock('@/services/axios', () => ({ _axios: axiosMock }))
vi.mock('@/stores/auth', () => ({ authStore: () => ({ setTokens: vi.fn(), setUser: setUserMock }) }))
vi.mock('@/stores/candidate', () => ({ candidateStore: () => ({ setCandidate: vi.fn() }) }))

import { handleLogin, handleRegister } from './auth'
import { t } from '@/i18n'

const login = async () => {
    const toast = vi.fn()
    await handleLogin({ email: 'a@b.c', password: 'x' }, { toast })
    return toast.mock.calls.at(-1)?.[0]
}

describe('handleLogin errors', () => {
    beforeEach(() => {
        axiosMock.mockReset()
    })

    it.each([
        ['new envelope', { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } }, 'Email or password is incorrect'],
        ['legacy body', { success: false, message: 'Too many requests' }, 'Too many requests'],
    ])('shows the API reason from the %s', async (_, body, message) => {
        axiosMock.mockRejectedValue(body)
        expect(await login()).toEqual({ message, bg: 'danger' })
    })

    it('falls back to the generic message for a non-API error', async () => {
        axiosMock.mockRejectedValue(new TypeError('Cannot read properties of undefined'))
        expect(await login()).toEqual({ message: t('error.loginFailed'), bg: 'danger' })
    })
})

describe('handleLogin success', () => {
    it('sets the new user before fetching the candidate, so a cached previous user never shows', async () => {
        axiosMock.mockReset()
        setUserMock.mockReset()
        let userSetBeforeCandidate = false
        axiosMock
            .mockResolvedValueOnce({ message: 'ok', data: { user: { email: 'b@b.c' }, token: 't', tokenRefresh: 'r' } })
            .mockImplementationOnce(async () => {
                userSetBeforeCandidate = setUserMock.mock.calls.length === 1
                return { data: {} }
            })

        await handleLogin({ email: 'b@b.c', password: 'x' }, { toast: vi.fn() })

        expect(userSetBeforeCandidate).toBe(true)
        expect(setUserMock).toHaveBeenCalledWith({ email: 'b@b.c' })
    })
})

describe('handleRegister', () => {
    beforeEach(() => {
        axiosMock.mockReset()
    })

    it('sends only the fields auth/register accepts, then goes to login', async () => {
        axiosMock.mockResolvedValue({ message: 'ok' })
        const router = { push: vi.fn() }
        await handleRegister({ email: 'a@b.c', password: 'p', repassword: 'p', firstName: 'X' }, { toast: vi.fn(), router })
        expect(axiosMock.mock.calls[0][0].data).toEqual({ email: 'a@b.c', password: 'p', repassword: 'p' })
        expect(router.push).toHaveBeenCalledWith('/login')
    })
})
