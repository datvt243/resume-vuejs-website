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
import { candidateStore } from '@/stores/candidate'

const candidate = candidateStore()
const dataList = computed(() => candidate.getCandidate?.visits || [])

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
        <TableDefault :model-value="dataList" :settings="settings" />
    </div>
</template>
