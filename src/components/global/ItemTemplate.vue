<script setup lang="ts">
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineProps, computed } from 'vue'
import type { PropType } from 'vue'
import { getLocalizedText } from '@/utilities/index'

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
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const model = computed(() => props.modelValue)

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const getDate = computed(() => {
    if (typeof props.modelValue.date === 'string') {
        return props.modelValue.date
    }
    return props.modelValue?.date?.()
})

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const description = computed(() => getLocalizedText(props.modelValue.description))
</script>

<template lang="pug">
.item.border.rounded(class="p-[1.5rem]")
    .flex
        .flex-shrink-0(class="pe-[1rem]")
            template(v-if="model?.image")
                img.image( :src="model.image" :alt="model.title")
            template(v-else)
                span.image.opacity-75.inline-block.mt-2.text-center
                    FontAwesomeIcon(:icon="['fa-solid', `${ props.icon }`]")
        .col.grow
            .flex(class="mb-[1rem]")
                .col-auto
                    p.item-title {{ model.title }}
                .col-auto.ms-auto
                    slot
            div.border-start.border-success(class="ps-[1rem] mb-[1.5rem]")
                p.item-note(v-if="model.subTitle") {{ model.subTitle }}
                p.item-note(v-if="getDate") {{ getDate }}
                slot(name="sub")
            div.item-description.post-content(v-if="description" v-html="description")

</template>
