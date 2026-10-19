<script setup>
/**
 * Form / settings section (DESIGN.md §4.3): title + one-line description on the left,
 * the fields card spanning the other two columns from `lg` up.
 */

import { defineProps } from 'vue'

defineProps({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    // false when the content is already a card (e.g. TableDefault) — no nested cards
    card: { type: Boolean, default: true },
})
</script>

<template>
    <section class="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div class="min-w-0">
            <h2 class="m-0 text-md font-semibold text-fg">{{ title }}</h2>
            <p v-if="description" class="mb-0 mt-1 text-sm text-fg-2">{{ description }}</p>
            <div v-if="$slots.actions" class="mt-3 flex gap-2"><slot name="actions" /></div>
        </div>
        <div class="min-w-0 lg:col-span-2" :class="{ 'rounded-md border border-line bg-surface px-4 pt-4': card }">
            <slot />
        </div>
    </section>
</template>
