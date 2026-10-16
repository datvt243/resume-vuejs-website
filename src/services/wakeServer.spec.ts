import { describe, it, expect, vi, afterEach } from 'vitest'
import { wakeServer } from './wakeServer'

describe('wakeServer', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('GETs <api>health with no-cors, bypassing the HTTP cache', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null))
        vi.stubGlobal('fetch', fetchMock)

        await wakeServer('https://api.example.com/')

        expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/health', { mode: 'no-cors', cache: 'no-store' })
    })

    it('swallows network errors instead of rejecting', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

        await expect(wakeServer('https://api.example.com/')).resolves.toBeUndefined()
    })
})
