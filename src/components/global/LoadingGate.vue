<script setup>
/**
 * Shows a list skeleton (DESIGN.md §5.9) while the app-wide spinner has a request in
 * flight, otherwise its slot — so an empty state only appears once a fetch is done.
 */

import { computed, defineProps } from 'vue'
import { useHelper } from '@/composables/useHelper'
import { t } from '@/i18n'

const props = defineProps({
    // list: card of skeleton rows, slot rendered only after loading
    // form: field skeleton, slot stays mounted (v-show) — VeeForm only picks up `document`
    //       through a non-immediate watcher, so remounting it after the data landed would leave it blank
    variant: { type: String, default: 'list' },
})

const { loading } = useHelper()
const busy = computed(() => !!loading?.value?.isLoading)
</script>

<template>
    <template v-if="props.variant === 'form'">
        <div v-if="busy" class="space-y-4 pb-4" aria-busy="true">
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="i in 4" :key="i" class="space-y-1" aria-hidden="true">
                <div class="h-4 w-24 rounded bg-surface-2 motion-safe:animate-pulse"></div>
                <div class="h-8 rounded bg-surface-2 motion-safe:animate-pulse"></div>
            </div>
        </div>
        <div v-show="!busy"><slot></slot></div>
    </template>
    <template v-else>
        <div v-if="busy" class="divide-y divide-line rounded-md border border-line bg-surface" aria-busy="true">
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="i in 3" :key="i" class="flex items-start gap-3 px-4 py-3" aria-hidden="true">
                <div class="h-8 w-8 shrink-0 rounded bg-surface-2 motion-safe:animate-pulse"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-4 w-1/3 rounded bg-surface-2 motion-safe:animate-pulse"></div>
                    <div class="h-3 w-1/4 rounded bg-surface-2 motion-safe:animate-pulse"></div>
                </div>
            </div>
        </div>
        <slot v-else></slot>
    </template>
</template>
