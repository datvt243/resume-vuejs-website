import { describe, it, expect, vi, beforeEach } from 'vitest'

const { axiosMock, logOut } = vi.hoisted(() => ({ axiosMock: vi.fn(), logOut: vi.fn() }))
vi.mock('@/services/axios', async importOriginal => ({ ...(await importOriginal()), _axios: axiosMock }))
vi.mock('@/stores/auth', () => ({ authStore: () => ({ logOut }) }))

import { handleBase } from './base'

const LEGACY = { success: false, message: 'Dữ liệu không hợp lệ', errors: { company: 'Bắt buộc' } }
const NEW = {
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: [{ field: 'items.3.company', message: 'Bắt buộc' }] },
}

const run = async () => {
    const toast = vi.fn()
    const callback = vi.fn()
    await handleBase({ method: 'post', url: 'experience/' }, { toast }, callback)
    return { toast, callback }
}

describe('handleBase', () => {
    beforeEach(() => {
        axiosMock.mockReset()
        logOut.mockReset()
    })

    it.each([
        ['legacy', LEGACY],
        ['new', NEW],
    ])('shows message + field errors from the %s error body', async (_, body) => {
        axiosMock.mockRejectedValue(body)
        const { toast, callback } = await run()
        expect(toast).toHaveBeenCalledWith({ message: 'Dữ liệu không hợp lệ\n- Bắt buộc ', bg: 'danger' })
        expect(callback).not.toHaveBeenCalled()
        expect(logOut).not.toHaveBeenCalled()
    })

    it('treats a 2xx body with success:false as an error', async () => {
        axiosMock.mockResolvedValue({ success: false, message: 'Tạo thất bại', data: null })
        const { toast, callback } = await run()
        expect(callback).not.toHaveBeenCalled()
        expect(toast).toHaveBeenCalledWith({ message: 'Tạo thất bại', bg: 'danger' })
    })

    it('runs the callback and a success toast on success:true', async () => {
        const res = { success: true, message: 'OK', data: [] }
        axiosMock.mockResolvedValue(res)
        const { toast, callback } = await run()
        expect(callback).toHaveBeenCalledWith(res)
        expect(toast).toHaveBeenCalledWith({ message: 'OK', bg: 'success' })
    })

    it.each([
        ['new', { success: false, error: { code: 'TOKEN_REVOKED', message: 'x' } }],
        ['legacy', { success: false, errorCode: 'INVALID_TOKEN', message: 'x' }],
    ])('logs out on a %s token error code', async (_, body) => {
        axiosMock.mockRejectedValue(body)
        await run()
        expect(logOut).toHaveBeenCalled()
    })
})
