<script setup lang="ts">
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineProps, computed } from 'vue'
import type { PropType } from 'vue'
import { getLocalizedText, sanitizeHtml } from '@/utilities/index'

interface Props {
    img?: string
    title: string
    subTitle: string
    date: string | (() => string)
    description: string | { vi?: string; en?: string }
}
const props = defineProps({
    modelValue: {
        type: Object as PropType<Props>,
        default: () => ({
            img: '',
            title: '',
            subTitle: '',
            date: '',
            description: '',
        }),
    },
    icon: { type: String, default: 'fa-building' },
})
const model = computed(() => props.modelValue)

const getDate = computed(() => {
    if (typeof props.modelValue.date === 'string') {
        return props.modelValue.date
    }
    return props.modelValue?.date?.()
})

const description = computed(() => sanitizeHtml(getLocalizedText(props.modelValue.description)))
</script>

<template>
    <div class="item flex flex-wrap items-start gap-3 px-4 py-3 sm:flex-nowrap">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-2 text-fg-3">
            <img v-if="model?.image" class="h-full w-full object-cover" :src="model.image" :alt="model.title" />
            <FontAwesomeIcon v-else :icon="['fa-solid', props.icon]" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1 basis-48">
            <p class="m-0 break-words text-base font-medium text-fg">{{ model.title }}</p>
            <p v-if="model.subTitle" class="m-0 break-words text-sm text-fg-2">{{ model.subTitle }}</p>
            <p v-if="getDate" class="m-0 mt-0.5 text-xs tabular-nums text-fg-3">{{ getDate }}</p>
            <slot name="sub"></slot>
            <div v-if="description" class="item-description post-content mt-2 line-clamp-2 break-words text-sm text-fg-2" v-html="description"></div>
        </div>
        <div v-if="$slots.default" class="ms-auto flex shrink-0 flex-wrap items-center gap-1">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
/* rows show a 2-line preview; rich-text block margins would leave a gap under the clamp */
.item-description :deep(*) {
    margin: 0;
}
</style>
