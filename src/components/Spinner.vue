<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: non-blocking loading indicator (top bar + corner notice, DESIGN.md §5.9)
 * + 30s cold-start countdown (backend chạy
 * trên Render free tier, lần gọi API đầu tiên có thể mất tới 30s). Thông báo
 * cold start chỉ hiện khi request đã chờ quá COLD_START_NOTICE_AFTER giây —
 * request nhanh chỉ thấy spinner thường, không bị doạ "đợi 30 giây".
 */

import { ref, computed, defineExpose, onBeforeUnmount } from 'vue'

const COLD_START_SECONDS = 30
const COLD_START_NOTICE_AFTER = 3

const isLoading = ref(false)
const secondsLeft = ref(COLD_START_SECONDS)
let intervalId = null

defineExpose({
    show,
    hide,
    // read by LoadingGate so list pages show a skeleton, not "no data", while fetching
    isLoading,
})

const progressPercent = computed(() => ((COLD_START_SECONDS - secondsLeft.value) / COLD_START_SECONDS) * 100)
const isOvertime = computed(() => secondsLeft.value <= 0)
const isColdStart = computed(() => COLD_START_SECONDS - secondsLeft.value >= COLD_START_NOTICE_AFTER)

function show() {
    isLoading.value = true
    startCountdown()
}
function hide() {
    isLoading.value = false
    stopCountdown()
}

function startCountdown() {
    stopCountdown()
    secondsLeft.value = COLD_START_SECONDS
    intervalId = setInterval(() => {
        if (secondsLeft.value > 0) {
            secondsLeft.value -= 1
        } else {
            stopCountdown()
        }
    }, 1000)
}
function stopCountdown() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}

onBeforeUnmount(stopCountdown)
</script>

<template>
    <div v-if="isLoading" class="spinner-container" aria-live="polite">
        <div class="loading-bar" aria-hidden="true"></div>

        <div class="loading-notice flex items-start gap-3 rounded-md border border-line bg-surface p-3 text-sm text-fg shadow-float">
            <span v-if="!isColdStart" class="spinner-border spinner-border-sm text-accent" aria-hidden="true"></span>
            <span v-if="!isColdStart" class="text-fg-2" role="status">Đang tải…</span>

            <template v-else>
                <div class="countdown-ring" :class="{ overtime: isOvertime }" :style="{ '--percent': `${progressPercent}%` }">
                    <span v-if="!isOvertime" class="countdown-number">{{ secondsLeft }}</span>
                    <span v-else class="spinner-border spinner-border-sm text-accent" role="status">
                        <span class="sr-only">Đang tải…</span>
                    </span>
                </div>

                <div class="min-w-0" role="status">
                    <p class="m-0 font-medium">Server đang khởi động, vui lòng đợi ~{{ COLD_START_SECONDS }} giây</p>
                    <p class="mb-0 mt-1 text-xs text-fg-2">Gói miễn phí tự ngủ khi không dùng nên lần gọi đầu cần thời gian khởi động lại.</p>
                    <p v-if="isOvertime" class="mb-0 mt-1 text-xs text-fg-2">Server khởi động lâu hơn dự kiến, vui lòng đợi thêm chút nữa…</p>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
/* never blocks the page: no overlay, clicks pass through except on the notice itself */
.spinner-container {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 1080;
    pointer-events: none;
}

.loading-bar {
    @apply h-0.5 w-1/3 bg-accent;
}
@media (prefers-reduced-motion: no-preference) {
    .loading-bar {
        animation: loading-slide 1.2s ease-out infinite;
    }
}

.loading-notice {
    @apply fixed bottom-4 left-4 max-w-xs;
    pointer-events: auto;
}

.countdown-ring {
    --percent: 0%;
    @apply relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full;
    background: conic-gradient(var(--color-accent) var(--percent), var(--color-surface-2) 0);
    &::before {
        content: '';
        @apply absolute inset-1 rounded-full bg-surface;
    }
    &.overtime {
        background: conic-gradient(var(--color-accent) 100%, var(--color-surface-2) 0);
    }
}

.countdown-number {
    @apply relative z-10 text-sm font-semibold tabular-nums text-fg;
}

.countdown-ring .spinner-border {
    @apply relative z-10;
}

@keyframes loading-slide {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(300%);
    }
}
</style>
