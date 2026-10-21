<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: toast (DESIGN.md §5.9) — bottom-right, auto-dismiss after
 * 4s. Every `show()` restarts the timer, so a new message always gets a
 * full window even if one was already visible.
 */

import { ref, computed, defineProps, defineExpose, onBeforeUnmount } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
    content: { type: String, default: '' },
    // success | danger | warning | info
    bg: { type: String, default: 'success' },
})

const TYPES = {
    success: { icon: 'fa-solid fa-circle-check', color: 'text-success' },
    danger: { icon: 'fa-solid fa-circle-xmark', color: 'text-danger' },
    warning: { icon: 'fa-solid fa-triangle-exclamation', color: 'text-warning' },
    info: { icon: 'fa-solid fa-circle-info', color: 'text-info' },
}
const type = computed(() => TYPES[props.bg] || TYPES.info)

const visible = ref(false)
let hideTimer = null

function show() {
    visible.value = true
    clearTimeout(hideTimer)
    hideTimer = setTimeout(hide, 4000)
}

function hide() {
    visible.value = false
    clearTimeout(hideTimer)
    hideTimer = null
}

onBeforeUnmount(() => clearTimeout(hideTimer))

defineExpose({
    show,
})
</script>

<template>
    <!-- The live region stays mounted so screen readers announce content changes -->
    <div class="toast-container fixed bottom-4 right-4 left-4 flex justify-end sm:left-auto" role="status" aria-live="polite" aria-atomic="true">
        <div class="toast w-full max-w-sm items-start gap-3 rounded-md border border-line bg-surface p-3 text-sm text-fg shadow-float"
            :class="{ show: visible }" :style="{ display: visible ? 'flex' : 'none' }">
            <FontAwesomeIcon :icon="type.icon" :class="type.color" class="mt-1 shrink-0" />
            <p class="toast-body m-0 min-w-0 flex-1 whitespace-pre-line">{{ props.content }}</p>
            <button type="button" :aria-label="t('form.closeToast')"
                class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-fg-3 hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                @click="hide">
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
            </button>
        </div>
    </div>
</template>
