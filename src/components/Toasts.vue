<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 *
 * Vue-native rewrite (node `tailwindcss-dropdown-toast-navbar`, part of
 * the Bootstrap -> Tailwind phased migration) — no longer instantiates
 * Bootstrap's `Toast` JS class. Reuses Bootstrap's own CSS (`.toast`,
 * `.toast-container`) as-is. Matches Bootstrap's default `autohide: true,
 * delay: 5000`. Every call to `show()` resets the auto-hide timer, so a
 * new toast message always gets a fresh 5s window even if one was
 * already visible.
 */

import { ref, defineProps, defineExpose, onBeforeUnmount } from 'vue'

const props = defineProps({
    content: { type: String, default: '' },
    bg: { type: String, default: 'success' },
})

const visible = ref(false)
let hideTimer = null

function show() {
    visible.value = true
    clearTimeout(hideTimer)
    hideTimer = setTimeout(hide, 5000)
}

function hide() {
    visible.value = false
    clearTimeout(hideTimer)
    hideTimer = null
}

function onRootClick(e) {
    if (e.target.closest('[data-bs-dismiss="toast"]')) hide()
}

onBeforeUnmount(() => clearTimeout(hideTimer))

defineExpose({
    show,
})
</script>

<template>
    <div class="toast-container fixed top-0 end-0 p-[1rem]">
        <div :class="`bg-${props.bg}`">
            <div ref="refToast" class="toast" :class="{ show: visible }" :style="{ display: visible ? 'block' : 'none' }"
                role="alert" aria-live="assertive" aria-atomic="true" @click="onRootClick">
                <div class="toast-header">
                    <strong class="me-auto text-uppercase ls-2">Thông báo</strong>
                    <span class="ms-auto">
                        <span class="btn btn-sm btn-outline" data-bs-dismiss="toast" aria-label="Close">
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                        </span>
                    </span>
                </div>
                <div class="toast-body" style="white-space: pre-line">{{ props.content }}</div>
            </div>
        </div>
    </div>
</template>
