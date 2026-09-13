<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/table/index.js'

import { useInitTable } from '@/composables/useInitTable'
import Convert from '@/components/convert/convert'

/**
 *
 */
import { toRef, defineProps, computed, defineComponent, h, useSlots, reactive } from 'vue'
const slots = useSlots()
const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    colsHidden: { type: Array, default: () => [] },
    settings: { type: Array, default: () => [] },
    colControl: { type: String, default: 'name' },
    heightAuto: { type: Boolean, default: false },
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

/**
 * custom render
 */
const renderCellContent = defineComponent({
    slots: ['default'],
    props: ['col', 'field', 'doc', 'to', 'fieldType', 'fieldName'],
    render() {
        const { col, field, to, doc, fieldType = null, fieldName = null } = this

        let _value = doc?.[field]

        if (fieldType === 'select') {
            const obj = objectSelect[fieldName]
            _value = obj ? (obj[_value] ? obj[_value] : _value) : _value
        }

        if (field === col) {
            return h('div', { class: 'flex items-center' }, [
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
    <div class="table-container">
        <div class="table-responsive" :class="{ 'height-auto': props.heightAuto }">
            <Table class="table-bordered">
                <TableHead>
                    <TableRow>
                        <TableCell tag="th" class="whitespace-nowrap text-center" style="width: 80px">
                            <span class="inline-block" style="width: 30px">#</span>
                        </TableCell>
                        <template v-for="{ label, field } in getColsWithHiddenCells" :key="`thead_cell_${field}`">
                            <TableCell tag="th" class="whitespace-nowrap capitalize">{{ label }}</TableCell>
                        </template>
                        <slot name="theadMore"></slot>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <template v-if="props.modelValue.length">
                        <template v-for="(doc, index) in props.modelValue" :key="`doc_${doc._id}`">
                            <TableRow :model-value="doc">
                                <TableCell class="whitespace-nowrap text-center" style="width: 80px">{{ index + 1 }}</TableCell>
                                <template
                                    v-for="{ field, convert, className = '', type, name } in getColsWithHiddenCells"
                                    :key="`tbody_cell_${field}`"
                                >
                                    <TableCell :class="['whitespace-nowrap capitalize', className || '']">
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
                                <slot name="tbodyMore" :doc="{ index: index, ...doc }"></slot>
                            </TableRow>
                        </template>
                    </template>
                    <template v-else>
                        <tr>
                            <td colspan="999" class="text-center">
                                <div class="alert alert-warning m-0 p-[3rem] border-0">
                                    <span class="opacity-50">Không có dữ liệu để hiển thị</span>
                                </div>
                            </td>
                        </tr>
                    </template>
                </TableBody>
            </Table>
        </div>
    </div>
</template>

<style scoped>
.table-responsive {
    min-height: 300px;
}

.height-auto {
    height: auto !important;
    min-height: auto !important;
}
</style>
