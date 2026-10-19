<script setup>
/**
 * Segmented control (DESIGN.md §5.7): switches a view in place. `v-model` holds the
 * selected option's `value`.
 */

import { defineProps, defineEmits } from 'vue'

defineProps({
    modelValue: { type: [String, Number], default: '' },
    // [{ value, label }]
    options: { type: Array, default: () => [] },
    ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <div class="inline-flex max-w-full flex-wrap rounded bg-surface-2 p-0.5" role="radiogroup" :aria-label="ariaLabel || undefined">
        <button
            v-for="o in options"
            :key="o.value"
            type="button"
            role="radio"
            :aria-checked="modelValue === o.value ? 'true' : 'false'"
            class="inline-flex h-7 items-center rounded-sm px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            :class="modelValue === o.value ? 'bg-surface text-fg shadow-sm' : 'text-fg-2 hover:text-fg'"
            @click="emit('update:modelValue', o.value)"
        >
            {{ o.label }}
        </button>
    </div>
</template>
