<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: data table (DESIGN.md §5.4) — client-side sort + pagination over `modelValue`.
 */

import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/table/index.js'

import { useInitTable } from '@/composables/useInitTable'
import Convert from '@/components/convert/convert'
import { buttonClass } from '@/lib/button.lib'

/**
 *
 */
import { toRef, defineProps, computed, defineComponent, h, useSlots, reactive, ref, watch } from 'vue'
const slots = useSlots()
const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    colsHidden: { type: Array, default: () => [] },
    settings: { type: Array, default: () => [] },
    colControl: { type: String, default: 'name' },
    heightAuto: { type: Boolean, default: false },
    pageSize: { type: Number, default: 25 },
})

const { columns } = useInitTable(toRef(props.settings))

const getCols = computed(() => columns.value.filter(c => c.field !== '_id'))
const getColsWithHiddenCells = computed(() => getCols.value.filter(c => !props.colsHidden.includes(c.field)))

/**
 * tạo các object có type=select, để hiển thị (translate) text theo value
 */
const objectSelect = reactive({})
for (const el of props.settings) {
    if (el.type === 'select') {
        objectSelect[el.name] = {}
        const _options = el.options
        for (const { text, value } of _options) {
            objectSelect[el.name][value] = text
        }
    }
}
const displayValue = (doc, field, type, name) => {
    const value = doc?.[field]
    return type === 'select' ? (objectSelect[name]?.[value] ?? value) : value
}

/**
 * sort — asc → desc → off; empty values always last
 */
const sort = ref({ field: null, dir: 'asc' })
const collator = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' })
const isEmpty = v => v === undefined || v === null || v === ''
function toggleSort(field) {
    const { field: current, dir } = sort.value
    sort.value = current !== field ? { field, dir: 'asc' } : dir === 'asc' ? { field, dir: 'desc' } : { field: null, dir: 'asc' }
    page.value = 1
}
const ariaSort = field => (sort.value.field !== field ? 'none' : sort.value.dir === 'asc' ? 'ascending' : 'descending')
const sortIcon = field => (sort.value.field !== field ? 'fa-solid fa-sort' : sort.value.dir === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down')

const rows = computed(() => {
    const col = getCols.value.find(c => c.field === sort.value.field)
    if (!col) return props.modelValue
    const sign = sort.value.dir === 'asc' ? 1 : -1
    return [...props.modelValue].sort((a, b) => {
        const va = displayValue(a, col.field, col.type, col.name)
        const vb = displayValue(b, col.field, col.type, col.name)
        if (isEmpty(va) || isEmpty(vb)) return isEmpty(va) - isEmpty(vb)
        const diff = typeof va === 'number' && typeof vb === 'number' ? va - vb : collator.compare(String(va), String(vb))
        return diff * sign
    })
})

/**
 * pagination
 */
const numberFormat = new Intl.NumberFormat('vi-VN')
const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / props.pageSize)))
const pageStart = computed(() => (page.value - 1) * props.pageSize)
const pageRows = computed(() => rows.value.slice(pageStart.value, pageStart.value + props.pageSize))
const rangeLabel = computed(() => {
    const total = rows.value.length
    const to = Math.min(pageStart.value + props.pageSize, total)
    return `${numberFormat.format(pageStart.value + 1)}–${numberFormat.format(to)} trong ${numberFormat.format(total)}`
})
watch(pageCount, n => {
    if (page.value > n) page.value = n
})
const pagerBtn = buttonClass({ variant: 'secondary', size: 'sm' })

/**
 * custom render
 */
const renderCellContent = defineComponent({
    slots: ['default'],
    props: ['col', 'field', 'doc', 'to', 'fieldType', 'fieldName'],
    render() {
        const { col, field, to, doc, fieldType = null, fieldName = null } = this

        const _value = displayValue(doc, field, fieldType, fieldName)

        if (field === col) {
            return h('div', { class: 'flex items-center gap-2' }, [
                h(Convert, { 'model-value': _value, to: to }),
                h(
                    'div',
                    {
                        class: 'ms-auto',
                    },
                    this.$slots?.default && this.$slots.default(),
                ),
            ])
        }
        return h(Convert, { 'model-value': _value, to: to })
    },
})
</script>

<template>
    <div class="rounded-md border border-line bg-surface">
        <div class="overflow-x-auto" :class="{ 'table-scroll': !props.heightAuto && pageRows.length }">
            <Table class="data-table w-full text-sm">
                <TableHead>
                    <TableRow>
                        <TableCell tag="th" scope="col" class="w-12 text-right">#</TableCell>
                        <template v-for="{ label, field, type } in getColsWithHiddenCells" :key="`thead_cell_${field}`">
                            <TableCell tag="th" scope="col" :aria-sort="ariaSort(field)" :class="{ 'text-right': type === 'number' }">
                                <button type="button" class="sort-btn" @click="toggleSort(field)">
                                    {{ label }}
                                    <FontAwesomeIcon :icon="sortIcon(field)" aria-hidden="true" />
                                </button>
                            </TableCell>
                        </template>
                        <slot name="theadMore"></slot>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <template v-if="pageRows.length">
                        <template v-for="(doc, index) in pageRows" :key="`doc_${doc._id}`">
                            <TableRow :model-value="doc">
                                <TableCell class="text-right tabular-nums text-fg-3">{{ pageStart + index + 1 }}</TableCell>
                                <template
                                    v-for="{ field, convert, className = '', type, name } in getColsWithHiddenCells"
                                    :key="`tbody_cell_${field}`"
                                >
                                    <TableCell :class="[{ 'text-right tabular-nums': type === 'number' }, className]">
                                        <renderCellContent
                                            :col="props.colControl"
                                            :field="field"
                                            :to="convert.to"
                                            :doc="doc"
                                            :field-type="type"
                                            :field-name="name"
                                        >
                                            <div v-if="slots.control"><slot name="control" :doc="doc"></slot></div>
                                        </renderCellContent>
                                    </TableCell>
                                </template>
                                <!-- index into modelValue, not the sorted page: consumers splice by it -->
                                <slot name="tbodyMore" :doc="{ index: props.modelValue.indexOf(doc), ...doc }"></slot>
                            </TableRow>
                        </template>
                    </template>
                    <template v-else>
                        <tr>
                            <td colspan="999" class="empty">
                                <NoData />
                            </td>
                        </tr>
                    </template>
                </TableBody>
            </Table>
        </div>
        <footer v-if="pageCount > 1" class="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
            <span class="text-xs tabular-nums text-fg-3">{{ rangeLabel }} · Trang {{ page }} / {{ pageCount }}</span>
            <div class="flex gap-2">
                <button type="button" :class="pagerBtn" :disabled="page <= 1" @click="page--">Trước</button>
                <button type="button" :class="pagerBtn" :disabled="page >= pageCount" @click="page++">Sau</button>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* room for the row Dropdown menu, which overflow-x-auto would otherwise clip */
.table-scroll {
    min-height: 300px;
}

/* :deep so cells passed in through theadMore / tbodyMore get the same look */
.data-table :deep(thead > tr > *) {
    @apply sticky top-0 h-9 whitespace-nowrap border-b border-line bg-surface px-3 text-left text-xs font-medium text-fg-3;
}
.data-table :deep(tbody > tr > *) {
    @apply h-10 whitespace-nowrap border-b border-line px-3;
}
.data-table :deep(tbody > tr:last-child > *) {
    @apply border-b-0;
}
.data-table :deep(tbody > tr:hover > *:not(.empty)) {
    @apply bg-surface-2;
}
/* beats the header's text-left above */
.data-table :deep(th.text-right) {
    text-align: right;
}
.data-table td.empty {
    height: auto;
    white-space: normal;
}
.sort-btn {
    @apply inline-flex items-center gap-1 rounded hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent;
}
</style>
