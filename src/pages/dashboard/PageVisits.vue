<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Analytics page for profile visits (DESIGN.md §4.2) —
 * range control → KPIs → chart → source/country breakdowns → paginated
 * detail table. Read-only: stats come from `useVisitStats` (aggregated
 * server-side per interval), the detail rows from the cache
 * `LayoutDefault.vue` already filled via `useVisits()`. Reading that cache
 * through a `computed` (instead of calling `useVisits()` again) keeps it
 * reactive to the parent's in-flight fetch.
 */
import { computed, ref, watch } from 'vue'
import VisitChart from '@/components/visits/VisitChart.vue'
import { candidateStore } from '@/stores/candidate'
import { useVisitStats, INTERVAL_LABELS } from '@/composables/useVisitStats'
import { buttonClass } from '@/lib/button.lib'

const candidate = candidateStore()
const dataList = computed(() => candidate.getCandidate?.visits || [])

const { interval, stats } = useVisitStats()
const INTERVAL_OPTIONS = [
    { value: 'day', range: '30 ngày' },
    { value: 'week', range: '12 tuần' },
    { value: 'month', range: '12 tháng' },
].map(o => ({ ...o, label: `Theo ${INTERVAL_LABELS[o.value]}` }))
const rangeText = computed(() => INTERVAL_OPTIONS.find(o => o.value === interval.value)?.range)

const numberFormat = new Intl.NumberFormat('vi-VN')

// null = no referrer recorded (direct visit, or recorded before referrer tracking) / no geo match.
const breakdowns = computed(() => {
    const total = stats.value?.total || 0
    const toRows = (rows, key, nullLabel) =>
        [...(rows || [])]
            .sort((a, b) => b.count - a.count)
            .map(r => ({ label: r[key] ?? nullLabel, count: r.count, share: total ? (r.count / total) * 100 : 0 }))
    return [
        { title: 'Nguồn truy cập', rows: toRows(stats.value?.sources, 'source', 'Trực tiếp / không rõ') },
        { title: 'Quốc gia', rows: toRows(stats.value?.countries, 'country', 'Không rõ') },
    ]
})

const kpis = computed(() => {
    const [sources, countries] = breakdowns.value
    const top = rows => (rows[0] ? { value: rows[0].label, hint: `${Math.round(rows[0].share)}% lượt xem` } : { value: '—', hint: 'Chưa có dữ liệu' })
    return [
        { label: `Lượt xem · ${rangeText.value}`, value: numberFormat.format(stats.value?.total ?? 0), hint: `Tổng ${numberFormat.format(dataList.value.length)} lượt từ trước tới nay` },
        { label: `Nguồn hàng đầu · ${rangeText.value}`, ...top(sources.rows) },
        { label: `Quốc gia hàng đầu · ${rangeText.value}`, ...top(countries.rows) },
    ]
})

/* detail table — DESIGN.md §5.4: paginate past 100 rows */
const PAGE_SIZE = 25
const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(dataList.value.length / PAGE_SIZE)))
const pageRows = computed(() => dataList.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const rangeLabel = computed(() => {
    const total = dataList.value.length
    if (!total) return ''
    const from = (page.value - 1) * PAGE_SIZE + 1
    const to = Math.min(page.value * PAGE_SIZE, total)
    return `${numberFormat.format(from)}–${numberFormat.format(to)} trong ${numberFormat.format(total)}`
})
watch(pageCount, n => {
    if (page.value > n) page.value = n
})

const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })
function formatVisitTime(value) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '—' : `${dateFormat.format(d)} ${timeFormat.format(d)}`
}

const pagerBtn = buttonClass({ variant: 'secondary', size: 'sm' })
</script>

<template>
    <Heading :level="1" text="Lượt truy cập hồ sơ" description="Mỗi lần ai đó mở hồ sơ công khai qua link chia sẻ.">
        <SegmentedControl v-model="interval" :options="INTERVAL_OPTIONS" aria-label="Khoảng thời gian" />
    </Heading>

    <div class="space-y-6">
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6" aria-label="Chỉ số">
            <div v-for="k in kpis" :key="k.label" class="min-w-0 rounded-md border border-line bg-surface p-4">
                <p class="m-0 text-sm text-fg-2">{{ k.label }}</p>
                <p class="m-0 mt-1 truncate text-xl font-semibold tracking-tight" :title="k.value">{{ k.value }}</p>
                <p class="m-0 mt-1 text-xs text-fg-3">{{ k.hint }}</p>
            </div>
        </section>

        <section class="rounded-md border border-line bg-surface" aria-labelledby="visits-chart-title">
            <header class="flex h-12 items-center border-b border-line px-4">
                <h2 id="visits-chart-title" class="m-0 text-md font-semibold">Lượt xem theo {{ INTERVAL_LABELS[interval] }} · {{ rangeText }}</h2>
            </header>
            <div class="p-4">
                <VisitChart v-if="stats" :series="stats.series" :interval="stats.interval" />
                <div v-else class="h-56 rounded bg-surface-2 motion-safe:animate-pulse" aria-hidden="true"></div>
            </div>
        </section>

        <div v-if="stats" class="grid gap-6 md:grid-cols-2">
            <section v-for="b in breakdowns" :key="b.title" class="rounded-md border border-line bg-surface">
                <header class="flex h-12 items-center border-b border-line px-4">
                    <h2 class="m-0 text-md font-semibold">{{ b.title }}</h2>
                </header>
                <ul v-if="b.rows.length" class="m-0 list-none space-y-3 p-4">
                    <li v-for="r in b.rows" :key="r.label" class="text-sm">
                        <div class="flex justify-between gap-4">
                            <span class="min-w-0 truncate" :title="r.label">{{ r.label }}</span>
                            <span class="shrink-0 tabular-nums">{{ numberFormat.format(r.count) }} <span class="text-fg-3">({{ Math.round(r.share) }}%)</span></span>
                        </div>
                        <div class="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
                            <div class="share-fill h-full rounded-full" :style="{ width: `${r.share}%` }"></div>
                        </div>
                    </li>
                </ul>
                <p v-else class="m-0 p-4 text-sm text-fg-2">Chưa có lượt xem trong khoảng này.</p>
            </section>
        </div>

        <section class="rounded-md border border-line bg-surface" aria-labelledby="visits-table-title">
            <header class="flex h-12 items-center justify-between gap-4 border-b border-line px-4">
                <h2 id="visits-table-title" class="m-0 text-md font-semibold">Chi tiết từng lượt</h2>
                <span v-if="rangeLabel" class="text-xs text-fg-3 tabular-nums">{{ rangeLabel }}</span>
            </header>
            <div class="overflow-x-auto">
                <table class="visits-table w-full text-sm">
                    <thead>
                        <tr>
                            <th scope="col">Thời gian</th>
                            <th scope="col">Vị trí</th>
                            <th scope="col">Địa chỉ IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="v in pageRows" :key="v._id">
                            <td class="whitespace-nowrap tabular-nums">{{ formatVisitTime(v.createdAt) }}</td>
                            <td class="max-w-xs truncate" :title="v.location || ''">{{ v.location || '—' }}</td>
                            <td class="whitespace-nowrap font-mono text-fg-2">{{ v.ip || '—' }}</td>
                        </tr>
                        <tr v-if="!pageRows.length">
                            <td colspan="3" class="empty">
                                <NoData title="Chưa có lượt truy cập" description="Chia sẻ link hồ sơ công khai để bắt đầu ghi nhận." />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <footer v-if="pageCount > 1" class="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
                <span class="text-xs text-fg-3 tabular-nums">Trang {{ page }} / {{ pageCount }}</span>
                <div class="flex gap-2">
                    <button type="button" :class="pagerBtn" :disabled="page <= 1" @click="page--">Trước</button>
                    <button type="button" :class="pagerBtn" :disabled="page >= pageCount" @click="page++">Sau</button>
                </div>
            </footer>
        </section>
    </div>
</template>

<style scoped>
.visits-table th {
    @apply sticky top-0 h-9 whitespace-nowrap border-b border-line bg-surface px-4 text-left text-xs font-medium text-fg-3;
}
.visits-table td {
    @apply h-10 border-b border-line px-4;
}
.visits-table tbody tr:last-child td {
    @apply border-b-0;
}
.visits-table tbody tr:hover td:not(.empty) {
    @apply bg-surface-2;
}
.visits-table td.empty {
    height: auto;
}
/* Single series → chart slot 1 (DESIGN.md §6.1) */
.share-fill {
    background: var(--chart-1);
}
</style>
