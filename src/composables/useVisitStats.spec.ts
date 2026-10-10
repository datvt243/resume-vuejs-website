import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { useVisitStats, visitStatsFrom, formatBucket } from './useVisitStats'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({
    handleBase: (...args: unknown[]) => handleBaseMock(...args),
}))

vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))

function withUseVisitStats() {
    let result: any
    mount(
        defineComponent({
            setup() {
                result = useVisitStats()
                return () => h('div')
            },
        }),
    )
    return result
}

describe('visitStatsFrom', () => {
    // 2026-10-10 18:00 UTC = 2026-10-11 01:00 in Ho Chi Minh (UTC+7), a Sunday there.
    const now = Date.UTC(2026, 9, 10, 18, 0, 0)

    it('day: 30 days back from "today" in the given time zone, not UTC', () => {
        expect(visitStatsFrom('day', 'Asia/Ho_Chi_Minh', now)).toBe('2026-09-12')
        expect(visitStatsFrom('day', 'UTC', now)).toBe('2026-09-11')
    })

    it('week: the Monday that starts the 12th ISO week back', () => {
        // Local today = Sun 2026-10-11 → its week starts Mon 2026-10-05; 11 weeks earlier.
        expect(visitStatsFrom('week', 'Asia/Ho_Chi_Minh', now)).toBe('2026-07-20')
        expect(new Date('2026-07-20T00:00:00Z').getUTCDay()).toBe(1)
    })

    it('month: the 1st of the month 11 months back, across a year boundary', () => {
        expect(visitStatsFrom('month', 'Asia/Ho_Chi_Minh', now)).toBe('2025-11-01')
        expect(visitStatsFrom('month', 'UTC', Date.UTC(2026, 0, 15))).toBe('2025-02-01')
    })
})

describe('formatBucket', () => {
    it('formats each backend bucket key for the axis', () => {
        expect(formatBucket('2026-10-05', 'day')).toBe('05/10')
        expect(formatBucket('2026-W07', 'week')).toBe('Tuần 7')
        expect(formatBucket('2026-03', 'month')).toBe('03/2026')
    })
})

describe('useVisitStats', () => {
    beforeEach(() => handleBaseMock.mockReset())

    it('fetches day stats on setup with interval/from/tz params and stores the response', async () => {
        const data = { interval: 'day', total: 3, series: [{ bucket: '2026-10-10', count: 3 }], countries: [], sources: [] }
        handleBaseMock.mockImplementation(async (_opt, _props, cb) => cb?.({ success: true, message: '', data }))

        const result = withUseVisitStats()
        await flushPromises()

        expect(handleBaseMock).toHaveBeenCalledTimes(1)
        const opt = handleBaseMock.mock.calls[0][0]
        expect(opt).toMatchObject({ method: 'get', url: 'candidate/visits/stats' })
        expect(opt.params.interval).toBe('day')
        expect(opt.params.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(typeof opt.params.tz).toBe('string')
        expect(result.stats.value).toEqual(data)
    })

    it('refetches when the interval changes', async () => {
        handleBaseMock.mockImplementation(async () => {})
        const result = withUseVisitStats()
        await flushPromises()

        result.interval.value = 'week'
        await nextTick()
        await flushPromises()

        expect(handleBaseMock).toHaveBeenCalledTimes(2)
        expect(handleBaseMock.mock.calls[1][0].params.interval).toBe('week')
    })
})
