<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Read-only list of profile-visit records (candidate/visits
 * API — ip/location/timestamp per visit). Analytics data, not a
 * candidate-editable CV section, so no *.model.ts/VeeForm/useDocument
 * wiring like the other dashboard pages — just a plain `settings` array
 * for TableDefault's column rendering, no create/edit/delete actions
 * (no `#control` slot passed to TableDefault).
 *
 * Above the table: per-day/week/month chart + source/country breakdowns
 * from `useVisitStats` (aggregated server-side, fetched per interval).
 *
 * Reads the cache `LayoutDefault.vue` already populated (`useVisits()`,
 * which fetches once and caches both `visitCount` + `visits` on
 * candidateStore) via a `computed`, instead of calling `useVisits()`
 * again here — a second call would init its own local `ref` snapshot at
 * component-mount time, which wouldn't reactively pick up an
 * in-flight fetch started by the parent (same reasoning already applied
 * to PageHome.vue's `cvViewCount`).
 */
import { computed } from 'vue'
import TableDefault from '@/components/table/TableDefault.vue'
import VisitChart from '@/components/visits/VisitChart.vue'
import { candidateStore } from '@/stores/candidate'
import { useVisitStats, INTERVAL_LABELS } from '@/composables/useVisitStats'

const candidate = candidateStore()
const dataList = computed(() => candidate.getCandidate?.visits || [])

const { interval, stats } = useVisitStats()
const INTERVAL_OPTIONS = [
    { value: 'day', range: '30 ngày' },
    { value: 'week', range: '12 tuần' },
    { value: 'month', range: '12 tháng' },
]
const rangeText = computed(() => INTERVAL_OPTIONS.find(o => o.value === interval.value)?.range)

// null = no referrer recorded (direct visit, or recorded before referrer tracking) / no geo match.
const breakdowns = computed(() => {
    const total = stats.value?.total || 0
    const toRows = (rows, key, nullLabel) =>
        (rows || []).map(r => ({ label: r[key] ?? nullLabel, count: r.count, share: total ? (r.count / total) * 100 : 0 }))
    return [
        { title: 'Nguồn truy cập', rows: toRows(stats.value?.sources, 'source', 'Trực tiếp / không rõ') },
        { title: 'Quốc gia', rows: toRows(stats.value?.countries, 'country', 'Không rõ') },
    ]
})

const settings = [
    { name: 'createdAt', label: 'Thời gian', type: 'date', default: null, convertTo: 'date' },
    { name: 'location', label: 'Vị trí', type: 'text', default: '' },
    { name: 'ip', label: 'Địa chỉ IP', type: 'text', default: '' },
]
</script>

<template>
    <div class="mb-[1.5rem]">
        <Heading text="Lượt truy cập hồ sơ" />
        <p class="text-sm opacity-75">
            Mỗi lần trang hồ sơ công khai của bạn được xem (qua link chia sẻ) sẽ ghi một dòng ở đây — thời gian, vị trí
            (suy ra từ IP) và địa chỉ IP.
        </p>

        <div class="flex flex-wrap items-center gap-[1rem] my-[1rem]">
            <div class="btn-group btn-group-sm" role="group" aria-label="Khoảng thời gian">
                <button
                    v-for="o in INTERVAL_OPTIONS"
                    :key="o.value"
                    type="button"
                    class="btn"
                    :class="interval === o.value ? 'btn-primary' : 'btn-outline-primary'"
                    :data-interval="o.value"
                    @click="interval = o.value"
                >
                    Theo {{ INTERVAL_LABELS[o.value] }}
                </button>
            </div>
            <p v-if="stats" class="m-0 text-sm">
                <strong class="text-lg">{{ stats.total }}</strong> lượt xem trong {{ rangeText }} gần nhất
            </p>
        </div>

        <template v-if="stats">
            <VisitChart :series="stats.series" :interval="stats.interval" />

            <div class="row mt-[1.5rem]">
                <div v-for="b in breakdowns" :key="b.title" class="col-12 col-md-6 mb-[1rem]">
                    <p class="h6">{{ b.title }}</p>
                    <ul v-if="b.rows.length" class="list-unstyled m-0">
                        <li v-for="r in b.rows" :key="r.label" class="mb-[0.5rem] text-sm">
                            <div class="flex justify-between">
                                <span>{{ r.label }}</span>
                                <span>{{ r.count }} <span class="opacity-75">({{ Math.round(r.share) }}%)</span></span>
                            </div>
                            <div class="share-track"><div class="share-fill" :style="{ width: `${r.share}%` }"></div></div>
                        </li>
                    </ul>
                    <p v-else class="text-sm opacity-75 m-0">Chưa có lượt xem trong khoảng này.</p>
                </div>
            </div>
        </template>

        <p class="h6 mt-[1rem]">Chi tiết từng lượt</p>
        <TableDefault :model-value="dataList" :settings="settings" />
    </div>
</template>

<style scoped>
.share-track {
    height: 4px;
    border-radius: 2px;
    background: var(--bs-tertiary-bg);
    margin-top: 2px;
}
.share-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--bs-primary);
}
</style>
