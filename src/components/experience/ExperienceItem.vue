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
import { t } from '@/i18n'
import { experienceTitle } from '@/models/experience.model'

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const emits = defineEmits(['onView', 'onEdit', 'onDelete', 'onDuplicate'])
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
    const _end = isCurrent ? t('common.present') : formatDate(endDate, 'MM/YYYY')
    return `${_start} - ${_end}`
})

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const item = computed(() => ({
    // job title first, company below; a break (or old entry) without a position falls back to experienceTitle
    title: model.value.position || experienceTitle(model.value),
    subTitle: model.value.position ? model.value.company : '',
    date: getDate.value,
    description: model.value.description,
}))
</script>

<template lang="pug">
ItemTemplate(:model-value="item")
    ItemActions(:label="item.title" viewable @view="emits('onView', {...model})" @edit="emits('onEdit', {...model})" @duplicate="emits('onDuplicate', {...model})" @delete="emits('onDelete', {...model})")
</template>
