<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: empty state (DESIGN.md §5.8); the default slot holds one action.
 */

import { defineProps } from 'vue'

defineProps({
    title: { type: String, default: 'Chưa có dữ liệu' },
    description: { type: String, default: '' },
    icon: { type: String, default: 'fa-solid fa-folder-open' },
})
</script>

<template>
    <div class="flex flex-col items-center px-4 py-12 text-center">
        <FontAwesomeIcon :icon="icon" class="text-xl text-fg-3" />
        <p class="mb-0 mt-3 text-md font-semibold text-fg">{{ title }}</p>
        <p v-if="description" class="mb-0 mt-1 max-w-sm text-sm text-fg-2">{{ description }}</p>
        <div v-if="$slots.default" class="mt-4">
            <slot />
        </div>
    </div>
</template>
