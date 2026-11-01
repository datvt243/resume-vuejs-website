<script>
// shortcut: per-module counter for tab/panel ids, switch to useId() once on Vue ≥ 3.5
let uid = 0
</script>

<script setup>
/**
 * Tabs (DESIGN.md §5.7): switch between page sections, underline style. `v-model`
 * holds the selected tab's `value`; each panel is the slot named after that value.
 * Arrow keys move between tabs (WAI-ARIA tabs pattern).
 */

import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    // [{ value, label }]
    tabs: { type: Array, default: () => [] },
    ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const id = `tabs-${++uid}`
const tabRefs = ref([])

function onKeydown(e, index) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!step) return
    const next = (index + step + props.tabs.length) % props.tabs.length
    emit('update:modelValue', props.tabs[next].value)
    tabRefs.value[next]?.focus()
}
</script>

<template>
    <div>
        <div class="flex gap-4 border-b border-line" role="tablist" :aria-label="ariaLabel || undefined">
            <button
                v-for="(tab, i) in tabs"
                :id="`${id}-tab-${tab.value}`"
                :key="tab.value"
                ref="tabRefs"
                type="button"
                role="tab"
                :aria-selected="modelValue === tab.value ? 'true' : 'false'"
                :aria-controls="`${id}-panel-${tab.value}`"
                :tabindex="modelValue === tab.value ? 0 : -1"
                class="-mb-px inline-flex h-9 items-center border-b-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                :class="modelValue === tab.value ? 'border-fg font-medium text-fg' : 'border-transparent text-fg-2 hover:text-fg'"
                @click="emit('update:modelValue', tab.value)"
                @keydown="onKeydown($event, i)"
            >
                {{ tab.label }}
            </button>
        </div>
        <div :id="`${id}-panel-${modelValue}`" class="pt-6" role="tabpanel" :aria-labelledby="`${id}-tab-${modelValue}`">
            <slot :name="modelValue" />
        </div>
    </div>
</template>
