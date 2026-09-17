<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: QR code for a given text value (issue #121) — renders to
 * a canvas for live preview, offers PNG (canvas) and SVG (`QRCode.toString`)
 * downloads. No new heavy dependency: `qrcode` (npm) does the encoding,
 * matching the issue's own "light existing npm library" option.
 */

import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
    value: { type: String, default: '' },
    size: { type: Number, default: 200 },
})

const canvasRef = ref(null)

async function render() {
    if (!props.value || !canvasRef.value) return
    await QRCode.toCanvas(canvasRef.value, props.value, { width: props.size, margin: 1 })
}

onMounted(render)
watch(() => props.value, render)

function triggerDownload(href, filename) {
    const link = document.createElement('a')
    link.href = href
    link.download = filename
    link.click()
}

function downloadPng() {
    if (!canvasRef.value) return
    triggerDownload(canvasRef.value.toDataURL('image/png'), 'qr-code.png')
}

async function downloadSvg() {
    if (!props.value) return
    const svgString = await QRCode.toString(props.value, { type: 'svg', margin: 1, width: props.size })
    const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }))
    triggerDownload(url, 'qr-code.svg')
    URL.revokeObjectURL(url)
}
</script>

<template>
    <div v-if="value" class="qr-code-block">
        <canvas ref="canvasRef"></canvas>
        <div class="qr-code-actions">
            <Button icon="fa-solid fa-download" type="outline-secondary" size="sm" text="Tải PNG" @click="downloadPng" />
            <Button icon="fa-solid fa-download" type="outline-secondary" size="sm" text="Tải SVG" @click="downloadSvg" />
        </div>
    </div>
</template>

<style scoped>
.qr-code-block {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.qr-code-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}
</style>
