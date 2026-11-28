<script setup>
/**
 * Form / settings section (DESIGN.md §4.3): title + one-line description on top,
 * the fields card below at full width (all viewports).
 */

import { defineProps } from 'vue'

defineProps({
    // '' when a tab or heading right above already names the section
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    // false when the content is already a card (e.g. TableDefault) — no nested cards
    card: { type: Boolean, default: true },
    // destructive actions (e.g. delete account)
    danger: { type: Boolean, default: false },
})
</script>

<template>
    <section class="grid gap-3">
        <div class="min-w-0">
            <h2 v-if="title" class="m-0 text-md font-semibold" :class="danger ? 'text-danger' : 'text-fg'">{{ title }}</h2>
            <p v-if="description" class="mb-0 text-sm text-fg-2" :class="{ 'mt-1': title }">{{ description }}</p>
            <div v-if="$slots.actions" class="mt-3 flex gap-2"><slot name="actions" /></div>
        </div>
        <div class="min-w-0" :class="{ 'rounded-md border bg-surface px-4 pt-4': card, 'border-line': card && !danger, 'border-danger': card && danger }">
            <slot />
        </div>
    </section>
</template>
