import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { confirmDelete } from './swal.lib'

const swalFire = vi.fn()
vi.mock('sweetalert2', () => ({ default: { fire: (...args: unknown[]) => swalFire(...args) } }))

describe('confirmDelete', () => {
    beforeEach(() => swalFire.mockReset())

    it('typed: only exactly "delete" passes the input check', () => {
        swalFire.mockResolvedValue({ isConfirmed: false })
        confirmDelete({ typed: true })
        const { input, inputValidator } = swalFire.mock.calls[0][0]
        expect(input).toBe('text')
        for (const value of ['', 'delet', 'Delete', 'delete ', ' delete']) expect(inputValidator(value)).toBeTruthy()
        expect(inputValidator('delete')).toBeFalsy()
    })

    it('typed: keeps the warning, escaped, above the typed prompt', () => {
        swalFire.mockResolvedValue({ isConfirmed: false })
        confirmDelete({ typed: true, getHtml: () => 'Group <b>x</b>' })
        const { html, text } = swalFire.mock.calls[0][0]
        expect(html).toContain('Group &lt;b&gt;x&lt;/b&gt;<br>')
        expect(html).toContain('"delete"')
        expect(text).toBeUndefined()
    })

    it('runs the callback only once confirmed', async () => {
        const callback = vi.fn()
        swalFire.mockResolvedValue({ isConfirmed: false })
        confirmDelete({ typed: true, callback })
        await flushPromises()
        expect(callback).not.toHaveBeenCalled()

        swalFire.mockResolvedValue({ isConfirmed: true, value: 'delete' })
        confirmDelete({ typed: true, callback })
        await flushPromises()
        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('untyped: plain text warning, no input', () => {
        swalFire.mockResolvedValue({ isConfirmed: false })
        confirmDelete({ getHtml: () => 'Sure?' })
        const opts = swalFire.mock.calls[0][0]
        expect(opts.text).toBe('Sure?')
        expect(opts.input).toBeUndefined()
    })
})
