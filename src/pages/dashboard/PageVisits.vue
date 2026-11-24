<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Analytics page for profile visits (DESIGN.md §4.2) —
 * range control → KPIs → chart → source/country breakdowns → paginated
 * detail table. Read-only: stats come from `useVisitStats` (aggregated
 * server-side per interval), the detail table pages `GET candidate/visits`
 * itself (`page`/`limit`) and takes the all-time total from its `meta`.
 */
import { computed, inject, ref, watch } from 'vue'
import VisitChart from '@/components/visits/VisitChart.vue'
import { useVisitStats } from '@/composables/useVisitStats'
import { t, uiLocale } from '@/i18n'
import { buttonClass } from '@/lib/button.lib'
import { confirmDelete } from '@/lib/swal.lib'
import { useHelper } from '@/composables/useHelper'
import { handleBase } from '@/services/base'

const { interval, stats, loadError: statsError, getData: reloadStats } = useVisitStats()
// LayoutDefault's cached count (Home's stat card) — refreshed after Delete all
const reloadVisits = inject('reloadVisits', null)
const { loading, toast } = useHelper()

/* detail table — DESIGN.md §5.4: paginate past 100 rows; the API pages it */
const PAGE_SIZE = 25
const page = ref(1)
// page the shown rows belong to — the range label must not jump ahead while the next page loads
const shownPage = ref(1)
const pageRows = ref([])
const total = ref(0)
const pageCount = ref(1)
const tableError = ref(false)
async function loadPage() {
    const requested = page.value
    let loaded = false
    await handleBase({ method: 'get', url: 'candidate/visits', params: { page: requested, limit: PAGE_SIZE } }, { loading, toast: null, toastError: toast }, res => {
        loaded = true
        // a slower reply for a page the user already left must not overwrite the current one
        if (requested !== page.value) return
        shownPage.value = requested
        pageRows.value = Array.isArray(res.data) ? res.data : []
        total.value = res.meta?.total ?? pageRows.value.length
        pageCount.value = Math.max(1, res.meta?.totalPages ?? 1)
    })
    if (requested !== page.value) return
    tableError.value = !loaded
    // the list shrank (e.g. deleted elsewhere) — move back to the last page
    if (page.value > pageCount.value) page.value = pageCount.value
}
watch(page, loadPage, { immediate: true })
const rangeLabel = computed(() => {
    if (!total.value) return ''
    const from = (shownPage.value - 1) * PAGE_SIZE + 1
    const to = Math.min(from + pageRows.value.length - 1, total.value)
    return t('common.rowRange', { from: numberFormat.value.format(from), to: numberFormat.value.format(to), total: numberFormat.value.format(total.value) })
})

const loadError = computed(() => statsError.value || tableError.value)
function retry() {
    if (statsError.value) reloadStats()
    if (tableError.value) loadPage()
}
function deleteAll() {
    confirmDelete({
        title: t('visits.deleteAllTitle'),
        getHtml: () => t('visits.deleteAllText', { count: numberFormat.value.format(total.value) }),
        typed: true,
        callback: () =>
            handleBase({ method: 'delete', url: 'candidate/visits' }, { loading, toast }, () => {
                reloadVisits?.()
                reloadStats()
                page.value === 1 ? loadPage() : (page.value = 1)
            }),
    })
}

const INTERVAL_OPTIONS = computed(() => ['day', 'week', 'month'].map(value => ({ value, label: t(`visits.interval.${value}`) })))
const rangeText = computed(() => t(`visits.range.${interval.value}`))

const numberFormat = computed(() => new Intl.NumberFormat(uiLocale.value))

// null = no referrer recorded (direct visit, or recorded before referrer tracking) / no geo match.
const breakdowns = computed(() => {
    const total = stats.value?.total || 0
    const toRows = (rows, key, nullLabel) =>
        [...(rows || [])]
            .sort((a, b) => b.count - a.count)
            .map(r => ({ label: r[key] ?? nullLabel, count: r.count, share: total ? (r.count / total) * 100 : 0 }))
    return [
        { title: t('visits.sources'), rows: toRows(stats.value?.sources, 'source', t('visits.directOrUnknown')) },
        { title: t('visits.countries'), rows: toRows(stats.value?.countries, 'country', t('visits.unknown')) },
    ]
})

const kpis = computed(() => {
    const [sources, countries] = breakdowns.value
    const top = rows => (rows[0] ? { value: rows[0].label, hint: t('visits.shareOfViews', { share: Math.round(rows[0].share) }) } : { value: '—', hint: t('common.noData') })
    return [
        { label: t('visits.kpiViews', { range: rangeText.value }), value: numberFormat.value.format(stats.value?.total ?? 0), hint: t('visits.kpiViewsHint', { total: numberFormat.value.format(total.value) }) },
        { label: t('visits.kpiTopSource', { range: rangeText.value }), ...top(sources.rows) },
        { label: t('visits.kpiTopCountry', { range: rangeText.value }), ...top(countries.rows) },
    ]
})

const dateFormat = computed(() => new Intl.DateTimeFormat(uiLocale.value, { day: '2-digit', month: '2-digit', year: 'numeric' }))
const timeFormat = computed(() => new Intl.DateTimeFormat(uiLocale.value, { hour: '2-digit', minute: '2-digit' }))
function formatVisitTime(value) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '—' : `${dateFormat.value.format(d)} ${timeFormat.value.format(d)}`
}

const pagerBtn = buttonClass({ variant: 'secondary', size: 'sm' })
</script>

<template>
    <Heading :level="1" :text="t('visits.title')" :description="t('visits.description')">
        <SegmentedControl v-model="interval" :options="INTERVAL_OPTIONS" :aria-label="t('visits.timeRange')" />
        <Button icon="fa-solid fa-trash" :text="t('visits.deleteAll')" action="delete" :disabled="loadError || !total" @click="deleteAll" />
    </Heading>

    <div v-if="loadError" role="alert">
        <NoData icon="fa-solid fa-triangle-exclamation" :title="t('error.loadList')" :description="t('error.loadListDescription')">
            <Button icon="fa-solid fa-rotate-right" :text="t('common.retry')" @click="retry" />
        </NoData>
    </div>
    <div v-else class="space-y-6">
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6" :aria-label="t('visits.kpis')">
            <div v-for="k in kpis" :key="k.label" class="min-w-0 rounded-md border border-line bg-surface p-4">
                <p class="m-0 text-sm text-fg-2">{{ k.label }}</p>
                <p class="m-0 mt-1 truncate text-xl font-semibold tracking-tight" :title="k.value">{{ k.value }}</p>
                <p class="m-0 mt-1 text-xs text-fg-3">{{ k.hint }}</p>
            </div>
        </section>

        <section class="rounded-md border border-line bg-surface" aria-labelledby="visits-chart-title">
            <header class="flex h-12 items-center border-b border-line px-4">
                <h2 id="visits-chart-title" class="m-0 text-md font-semibold">{{ t(`visits.chartTitle.${interval}`) }} · {{ rangeText }}</h2>
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
                <p v-else class="m-0 p-4 text-sm text-fg-2">{{ t('visits.noViewsInRange') }}</p>
            </section>
        </div>

        <section class="rounded-md border border-line bg-surface" aria-labelledby="visits-table-title">
            <header class="flex h-12 items-center justify-between gap-4 border-b border-line px-4">
                <h2 id="visits-table-title" class="m-0 text-md font-semibold">{{ t('visits.details') }}</h2>
                <span v-if="rangeLabel" class="text-xs text-fg-3 tabular-nums">{{ rangeLabel }}</span>
            </header>
            <div class="overflow-x-auto">
                <table class="visits-table w-full text-sm">
                    <thead>
                        <tr>
                            <th scope="col">{{ t('visits.time') }}</th>
                            <th scope="col">{{ t('visits.location') }}</th>
                            <th scope="col">{{ t('visits.ip') }}</th>
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
                                <NoData :title="t('visits.empty')" :description="t('visits.emptyDescription')" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <footer v-if="pageCount > 1" class="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
                <span class="text-xs text-fg-3 tabular-nums">{{ t('common.pageOf', { page, pageCount }) }}</span>
                <div class="flex gap-2">
                    <button type="button" :class="pagerBtn" :disabled="page <= 1" @click="page--">{{ t('common.prev') }}</button>
                    <button type="button" :class="pagerBtn" :disabled="page >= pageCount" @click="page++">{{ t('common.next') }}</button>
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
