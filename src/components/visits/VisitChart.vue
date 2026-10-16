<script setup>
/**
 * Single-series bar chart of visits per bucket (SVG, no chart library).
 * One hue, so no legend — the page heading names the series. Hover/focus
 * a column to see its exact count; the visit table below the chart is the
 * accessible table view.
 */
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { formatBucket, INTERVAL_LABELS } from '@/composables/useVisitStats'

const props = defineProps({
    // [{ bucket: 'YYYY-MM-DD' | 'YYYY-Www' | 'YYYY-MM', count }]
    series: { type: Array, default: () => [] },
    interval: { type: String, default: 'day' },
})

const HEIGHT = 220
const PAD = { top: 12, right: 8, bottom: 24, left: 32 }
const plotH = HEIGHT - PAD.top - PAD.bottom

/**
 * Drawn at the container's real pixel width rather than scaled through a
 * fixed viewBox, so axis text stays 11px on a phone and `labelEvery`
 * thins labels for the space actually available.
 */
const root = ref(null)
const width = ref(720)
let observer = null
onMounted(() => {
    if (root.value?.clientWidth) width.value = root.value.clientWidth
    if (typeof ResizeObserver === 'undefined' || !root.value) return
    observer = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width > 0) width.value = entry.contentRect.width
    })
    observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
const plotW = computed(() => width.value - PAD.left - PAD.right)

/** Round the axis max up to a 1/2/5 step so gridlines land on whole counts. */
function niceMax(max) {
    if (max <= 4) return 4
    const step = 10 ** Math.floor(Math.log10(max / 4))
    const nice = [1, 2, 5, 10].map(m => m * step).find(s => s * 4 >= max)
    return nice * 4
}

const yMax = computed(() => niceMax(Math.max(0, ...props.series.map(s => s.count))))
const ticks = computed(() => [0, 1, 2, 3, 4].map(i => (yMax.value / 4) * i))
const slot = computed(() => plotW.value / Math.max(1, props.series.length))
// 2px surface gap between neighbours; cap the width so 12 buckets don't turn into slabs.
const barW = computed(() => Math.max(1, Math.min(slot.value - 2, 28)))

const bars = computed(() =>
    props.series.map((s, i) => {
        const h = (s.count / yMax.value) * plotH
        return {
            ...s,
            label: formatBucket(s.bucket, props.interval),
            x: PAD.left + i * slot.value + (slot.value - barW.value) / 2,
            y: PAD.top + plotH - h,
            h,
        }
    }),
)

// Label every bucket when they fit, else thin out so labels never collide.
// Room per label: "DD/MM" ≈ 44px; "Tuần NN" / "MM/YYYY" ≈ 56px at 11px.
const labelEvery = computed(() => Math.max(1, Math.ceil((props.interval === 'day' ? 44 : 56) / slot.value)))

const y = v => PAD.top + plotH - (v / yMax.value) * plotH

/** Rounded top only, square at the baseline. */
function barPath(b) {
    const r = Math.min(4, barW.value / 2, b.h)
    const x2 = b.x + barW.value
    const base = PAD.top + plotH
    return `M${b.x},${base}V${b.y + r}Q${b.x},${b.y} ${b.x + r},${b.y}H${x2 - r}Q${x2},${b.y} ${x2},${b.y + r}V${base}Z`
}

const active = ref(null)
const tooltip = computed(() => {
    if (active.value === null) return null
    const b = bars.value[active.value]
    if (!b) return null
    return { ...b, left: ((b.x + barW.value / 2) / width.value) * 100, top: (Math.min(b.y, PAD.top + plotH - 2) / HEIGHT) * 100 }
})
</script>

<template>
    <div ref="root" class="visit-chart relative" @mouseleave="active = null">
        <svg :width="width" :height="HEIGHT" :viewBox="`0 0 ${width} ${HEIGHT}`" class="block" role="img" :aria-label="`Lượt xem theo ${INTERVAL_LABELS[interval] ?? interval}`">
            <g class="grid">
                <template v-for="t in ticks" :key="t">
                    <line :x1="PAD.left" :x2="width - PAD.right" :y1="y(t)" :y2="y(t)" :class="t === 0 ? 'baseline' : 'gridline'" />
                    <text :x="PAD.left - 6" :y="y(t)" dy="0.32em" text-anchor="end" class="axis-label">{{ t }}</text>
                </template>
            </g>
            <g>
                <g v-for="(b, i) in bars" :key="b.bucket">
                    <path v-if="b.count > 0" :d="barPath(b)" class="bar" :class="{ dim: active !== null && active !== i }" />
                    <!-- Full-height hit target, wider than the bar -->
                    <rect
                        :x="PAD.left + i * slot"
                        :y="PAD.top"
                        :width="slot"
                        :height="plotH"
                        fill="transparent"
                        tabindex="0"
                        :aria-label="`${b.label}: ${b.count} lượt xem`"
                        @mouseenter="active = i"
                        @focus="active = i"
                        @blur="active = null"
                    />
                    <text
                        v-if="i % labelEvery === 0"
                        :x="b.x + barW / 2"
                        :y="HEIGHT - 6"
                        text-anchor="middle"
                        class="axis-label"
                    >
                        {{ b.label }}
                    </text>
                </g>
            </g>
        </svg>
        <div
            v-if="tooltip"
            class="chart-tooltip"
            :style="{ left: `${tooltip.left}%`, top: `${tooltip.top}%` }"
            role="status"
        >
            <div class="opacity-75">{{ tooltip.label }}</div>
            <strong>{{ tooltip.count }}</strong> lượt xem
        </div>
    </div>
</template>

<style scoped>
.bar {
    fill: var(--bs-primary);
    transition: opacity 0.15s;
}
.bar.dim {
    opacity: 0.45;
}
.gridline {
    stroke: var(--bs-border-color);
    stroke-width: 1;
    stroke-dasharray: 2 3;
}
.baseline {
    stroke: var(--bs-secondary-color);
    stroke-width: 1;
}
.axis-label {
    fill: var(--bs-secondary-color);
    font-size: 11px;
}
rect:focus {
    outline: none;
}
rect:focus-visible {
    outline: 2px solid var(--bs-primary);
}
.chart-tooltip {
    position: absolute;
    transform: translate(-50%, calc(-100% - 8px));
    pointer-events: none;
    white-space: nowrap;
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>
