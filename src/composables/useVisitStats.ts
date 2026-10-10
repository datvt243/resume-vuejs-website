/**
 * Aggregated profile-visit stats for the authenticated candidate from
 * `GET /api/v1/candidate/visits/stats`: a zero-filled series per
 * day/week/month plus referrer-source and country breakdowns. Not cached
 * on candidateStore like `useVisits` — the result depends on the chosen
 * interval and is only shown on PageVisits.
 */

import type { Response } from '@/types/api.type'
import { ref, watch } from 'vue'
import { handleBase } from '@/services/base'
import { useHelper } from '@/composables/useHelper'

export type VisitStatsInterval = 'day' | 'week' | 'month'

export interface VisitStats {
    interval: VisitStatsInterval
    total: number
    series: { bucket: string; count: number }[]
    countries: { country: string | null; count: number }[]
    sources: { source: string | null; count: number }[]
}

export const INTERVAL_LABELS: Record<VisitStatsInterval, string> = { day: 'ngày', week: 'tuần', month: 'tháng' }

const DAY_MS = 24 * 60 * 60 * 1000

/** Axis label for a backend bucket key: `YYYY-MM-DD` → `DD/MM`, `YYYY-Www` → `Tuần N`, `YYYY-MM` → `MM/YYYY`. */
export function formatBucket(bucket: string, interval: VisitStatsInterval): string {
    if (interval === 'week') return `Tuần ${Number(bucket.split('-W')[1])}`
    const [y, m, d] = bucket.split('-')
    return interval === 'month' ? `${m}/${y}` : `${d}/${m}`
}

const toIsoDate = (utcMs: number) => new Date(utcMs).toISOString().slice(0, 10)

/**
 * `from` (inclusive local date) for each interval: 30 days, 12 ISO weeks
 * starting on a Monday, or 12 calendar months. "Today" is taken in `tz`,
 * the same zone the backend buckets by, so the first bucket is never a
 * partial one cut at the UTC date line.
 */
export function visitStatsFrom(interval: VisitStatsInterval, tz: string, nowMs = Date.now()): string {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(nowMs))
    const [year, month, day] = today.split('-').map(Number)
    const todayUtc = Date.UTC(year, month - 1, day)

    if (interval === 'month') return toIsoDate(Date.UTC(year, month - 12, 1))
    if (interval === 'week') {
        const mondayBased = (new Date(todayUtc).getUTCDay() + 6) % 7
        return toIsoDate(todayUtc - (mondayBased + 11 * 7) * DAY_MS)
    }
    return toIsoDate(todayUtc - 29 * DAY_MS)
}

export const useVisitStats = () => {
    const { loading } = useHelper()
    const interval = ref<VisitStatsInterval>('day')
    const stats = ref<VisitStats | null>(null)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh'

    async function getData() {
        await handleBase(
            {
                method: 'get',
                url: 'candidate/visits/stats',
                params: { interval: interval.value, from: visitStatsFrom(interval.value, tz), tz },
            },
            { loading, toast: null },
            (res: Response) => {
                stats.value = (res.data as VisitStats) ?? null
            },
        )
    }

    watch(interval, getData, { immediate: true })

    return { interval, stats, getData }
}
