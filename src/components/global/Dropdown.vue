<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 *
 * Vue-native rewrite (node `tailwindcss-dropdown-toast-navbar`, part of
 * the Bootstrap -> Tailwind phased migration) — no longer instantiates
 * Bootstrap's `Dropdown` JS class. Reuses Bootstrap's own CSS
 * (`.dropdown-menu.show`) as-is.
 *
 * Simplification vs Bootstrap's Dropdown JS (disclosed, matches the
 * original 3-component survey): no Popper-based smart positioning —
 * `.dropdown-menu` still gets Bootstrap's plain `position: absolute`
 * relative to `.dropdown`, so it won't auto-flip near a viewport edge.
 * Both current consumers (PageReference's split action menu, Header's
 * user menu) are simple, non-edge-adjacent placements.
 */

import { ref, defineProps, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
    style: { type: String, default: 'primary' },
    text: { type: String, default: 'Dropdown button' },
    href: { type: String, default: '' },
    split: { type: Boolean, default: false },
    btnSize: { type: String, default: '' },
    isSm: { type: Boolean, default: false },
})

const refRoot = ref(null)
const isOpen = ref(false)

function toggle() {
    isOpen.value ? close() : open()
}

function open() {
    isOpen.value = true
    document.addEventListener('click', onDocClick, true)
    document.addEventListener('keydown', onKeydown)
}

function close() {
    if (!isOpen.value) return
    isOpen.value = false
    document.removeEventListener('click', onDocClick, true)
    document.removeEventListener('keydown', onKeydown)
}

function onDocClick(e) {
    if (refRoot.value && !refRoot.value.contains(e.target)) close()
}

function onKeydown(e) {
    if (e.key === 'Escape') close()
}

onBeforeUnmount(() => close())

const attrBtnToggle = computed(() => {
    const className = `btn btn-${props.style} ${!props.split ? 'dropdown-toggle' : ''} ${props.btnSize}`
    return {
        class: className,
        'aria-expanded': isOpen.value ? 'true' : 'false',
    }
})
</script>

<template>
    <div ref="refRoot" :class="['dropdown', { show: isOpen }, { 'btn-group': props.split, 'btn-group-sm': props.isSm }]">
        <template v-if="props.href">
            <a v-if="text" :href="props.href" role="button" v-bind="attrBtnToggle" @click.prevent="toggle">
                {{ props.text }}
            </a>
        </template>
        <template v-else>
            <button v-if="text" type="button" :class="['btn', `btn-${props.style}`]" v-html="props.text"
                @click="toggle"></button>
        </template>
        <template v-if="props.split">
            <button type="button" :class="['btn dropdown-toggle dropdown-toggle-split', `btn-${props.style}`]"
                :aria-expanded="isOpen ? 'true' : 'false'" @click="toggle">
                <span class="sr-only">{{ props.text }}</span>
            </button>
        </template>
        <ul class="dropdown-menu" :class="{ show: isOpen }" @click="close">
            <slot></slot>
        </ul>
    </div>
</template>
