<script setup lang="ts">
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineProps, defineEmits, computed } from 'vue'
import type { PropType } from 'vue'
import type { Experience } from '@/types/experience.type'
import { formatDate } from '@/utilities/index'

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const emits = defineEmits(['onEdit', 'onDelete', 'onDuplicate'])
const props = defineProps({
    modelValue: {
        type: Object as PropType<Experience>,
        default: () => ({
            _id: '',
            company: '',
            position: '',
            startDate: +new Date(),
            endDate: +new Date(),
            isCurrent: false,
            description: '',
            image: '',
            website: '',
        }),
    },
})
const model = computed(() => props.modelValue)
const getDate = computed(() => {
    const { startDate, endDate, isCurrent } = props.modelValue
    const _start = formatDate(startDate, 'MM/YYYY')
    const _end = isCurrent ? 'Hiện tại' : formatDate(endDate, 'MM/YYYY')
    return `${_start} - ${_end}`
})

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const item = computed(() => ({
    title: model.value.company,
    subTitle: model.value.position,
    date: getDate.value,
    description: model.value.description,
}))
</script>

<template lang="pug">
ItemTemplate(:model-value="item")
    .btn-group
        a.btn.btn-sm.btn-outline-danger.icon(href="javascript:void(0)" @click="emits('onDelete', {...model})")
            FontAwesomeIcon(icon="fa-solid fa-trash")
        a.btn.btn-sm.btn-outline-warning.icon(href="javascript:void(0)" @click="emits('onEdit', {...model})")
            FontAwesomeIcon(icon="fa-solid fa-square-pen")
        a.btn.btn-sm.btn-outline-primary.icon(href="javascript:void(0)" @click="emits('onDuplicate', {...model})")
            FontAwesomeIcon(icon="fa-solid fa-copy")
</template>
