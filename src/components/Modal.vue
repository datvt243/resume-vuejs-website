<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 *
 * Vue-native rewrite (node `tailwindcss-modal-rewrite`, part of the
 * Bootstrap -> Tailwind phased migration) — no longer instantiates
 * Bootstrap's `Modal` JS class. Still reuses Bootstrap's own CSS
 * (`.modal.show`, `.modal-backdrop`, `body.modal-open`) as-is, so no new
 * CSS is needed and dark mode (`--bs-*` vars) keeps working unchanged.
 *
 * Kept identical for every consumer: same props, same slots (default,
 * footer), same exposed `show()`/`hide()` API — zero consumer files
 * changed by this rewrite.
 *
 * Disclosed simplifications vs Bootstrap's Modal JS (operator-approved):
 * - No Tab/Shift+Tab focus-trap — focuses the panel on open, ESC closes.
 * - No scrollbar-width padding-right compensation on `body.modal-open`.
 * - No fade/slide transition — the previous version had no `fade` class
 *   either (instant show/hide), preserved as-is.
 */

import { ref, defineProps, defineExpose, useSlots, onBeforeUnmount, nextTick } from 'vue'

const slots = useSlots()

const props = defineProps({
    title: { type: String, default: 'Modal Title' },
    size: { type: String, default: 'modal-lg' },
    isHiddenFooter: { type: Boolean, default: false },
})

const refModal = ref(null)
const visible = ref(false)

// Module-scope so >1 simultaneously-mounted <Modal> instance (e.g.
// PageGeneralInformation.vue mounts 3) doesn't have one instance's
// hide() re-enable body scroll while another instance is still open.
let openModalCount = 0

function onKeydown(e) {
    if (e.key === 'Escape') hide()
}

function show() {
    if (visible.value) return
    visible.value = true
    if (openModalCount === 0) {
        document.body.classList.add('modal-open')
    }
    openModalCount++
    document.addEventListener('keydown', onKeydown)
    nextTick(() => refModal.value?.focus())
}

function hide() {
    if (!visible.value) return
    visible.value = false
    openModalCount = Math.max(0, openModalCount - 1)
    if (openModalCount === 0) {
        document.body.classList.remove('modal-open')
    }
    document.removeEventListener('keydown', onKeydown)
}

// Replaces Bootstrap's global delegated `[data-bs-dismiss="modal"]`
// click handler — scoped to this instance's own root. Slot content
// (e.g. a consumer page's own "Đóng" button inside VeeForm's #button
// slot) is a real DOM descendant of refModal's root, so bubbling still
// reaches this listener without any consumer markup changes.
function onRootClick(e) {
    if (e.target.closest('[data-bs-dismiss="modal"]')) hide()
}

onBeforeUnmount(() => {
    if (visible.value) hide()
})

defineExpose({
    show,
    hide,
})
</script>

<template>
    <!--
        Both `:class="{ show: visible }"` AND `:style="{ display: ... }"` are
        required — confirmed via a live browser check that Bootstrap's own
        `.modal.show` CSS rule does NOT set `display: block` (Bootstrap's JS
        sets that as an inline style itself; the `show` class only drives
        opacity/transform for its fade transition). Class alone silently
        left the modal invisible despite carrying the `show` class.
    -->
    <div class="modal draggable" :class="{ show: visible }" :style="{ display: visible ? 'block' : 'none' }" tabindex="-1"
        ref="refModal" @click="onRootClick">
        <div class="modal-dialog modal-dialog-scrollable" :class="props.size">
            <div class="modal-content">
                <div class="modal-header">
                    <p class="modal-title h5 m-0">{{ props.title }}</p>
                    <span class="ms-auto">
                        <span class="btn btn-sm btn-outline-danger" data-bs-dismiss="modal" aria-label="Close">
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                        </span>
                    </span>
                </div>
                <div class="modal-body">
                    <template v-if="slots?.default">
                        <slot></slot>
                    </template>
                    <p v-else>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, facilis!</p>
                </div>
                <div class="modal-footer" v-if="!isHiddenFooter">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <template v-if="slots?.footer"><slot name="footer"></slot></template>
                </div>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <div v-if="visible" class="modal-backdrop show" @click="hide()"></div>
    </Teleport>
</template>
