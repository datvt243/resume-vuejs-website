<script setup lang="ts">
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineProps, defineEmits, computed } from 'vue'
import type { PropType } from 'vue'

import { formatDate } from '@/utilities/index'
import { t } from '@/i18n'

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const emits = defineEmits(['onEdit', 'onDelete', 'onDuplicate'])
const props = defineProps({
    modelValue: {
        type: Object as PropType<{
            _id: string
            name: string
            position: string
            technology: string
            startDate: number
            endDate: number
            isWorking: boolean
            description: string
            link?: string
            image?: string
        }>,
        default: () => ({
            _id: '',
            name: '',
            position: '',
            technology: '',
            startDate: +new Date(),
            endDate: +new Date(),
            isWorking: false,
            description: '',
            link: '',
            image: '',
        }),
    },
})
const model = computed(() => props.modelValue)
const getDate = computed(() => {
    const { startDate, endDate, isWorking } = props.modelValue
    const _start = formatDate(startDate, 'MM/YYYY')
    const _end = isWorking ? t('common.present') : formatDate(endDate, 'MM/YYYY')
    return `${_start} - ${_end}`
})

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const item = computed(() => ({
    title: model.value.name,
    subTitle: model.value.position,
    date: getDate.value,
    description: model.value.description,
}))
</script>

<template lang="pug">
ItemTemplate(:model-value="item")
    ItemActions(:label="item.title" :delete-disabled="!model._id" @edit="emits('onEdit', {...model})" @duplicate="emits('onDuplicate', {...model})" @delete="emits('onDelete', {...model})")
    template(#sub)
        slot(name="sub")
</template>
