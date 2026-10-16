<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Loading overlay + 30s cold-start countdown (backend chạy
 * trên Render free tier, lần gọi API đầu tiên có thể mất tới 30s). Thông báo
 * cold start chỉ hiện khi request đã chờ quá COLD_START_NOTICE_AFTER giây —
 * request nhanh chỉ thấy spinner thường, không bị doạ "đợi 30 giây".
 */

import { ref, computed, defineExpose, onBeforeUnmount } from 'vue'

defineExpose({
    show,
    hide,
})

const COLD_START_SECONDS = 30
const COLD_START_NOTICE_AFTER = 3

const isLoading = ref(false)
const secondsLeft = ref(COLD_START_SECONDS)
let intervalId = null

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
    <div v-if="isLoading" class="spinner-container">
        <span v-if="!isColdStart" class="spinner-border text-success" role="status">
            <span class="sr-only">Loading...</span>
        </span>

        <template v-else>
            <div class="countdown-ring" :class="{ overtime: isOvertime }" :style="{ '--percent': `${progressPercent}%` }">
                <span v-if="!isOvertime" class="countdown-number">{{ secondsLeft }}</span>
                <span v-else class="spinner-border spinner-border-sm text-success" role="status">
                    <span class="sr-only">Loading...</span>
                </span>
            </div>

            <div class="mt-[1rem] text-center loading-info" role="status" aria-live="polite">
                <div class="font-semibold">Server đang khởi động, vui lòng đợi ~{{ COLD_START_SECONDS }} giây</div>
                <div class="text-sm opacity-75 mt-1">Server chạy gói miễn phí nên tự ngủ khi không dùng, lần gọi đầu tiên cần thời gian để khởi động lại.</div>
                <div v-if="isOvertime" class="text-sm opacity-75 mt-1">Server khởi động lâu hơn dự kiến, vui lòng đợi thêm chút nữa...</div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.spinner-container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;

    background-color: rgba(51, 51, 51, 0.75);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    ~ * {
        filter: blur(10px);
    }
}

.countdown-ring {
    --percent: 0%;

    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: conic-gradient(#00d095 var(--percent), rgba(255, 255, 255, 0.2) 0);
    transition: background 1s linear;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        inset: 6px;
        border-radius: 50%;
        background-color: #333;
    }

    &.overtime {
        background: conic-gradient(#00d095 100%, rgba(255, 255, 255, 0.2) 0);
        animation: pulse 1.2s ease-in-out infinite;
    }
}

.countdown-number {
    position: relative;
    z-index: 1;
    font-weight: 600;
    font-size: 1.25rem;
    color: #fff;
}

.countdown-ring .spinner-border {
    position: relative;
    z-index: 1;
}

.loading-info {
    max-width: 320px;
    color: #fff;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}
</style>
