<script>
// Real module scope (unlike top-level `let` in <script setup>, which is per instance)
let modalSeq = 0
</script>

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
 * Focus is trapped inside while open (Tab/Shift+Tab wrap) and returns to
 * the element that opened it on close (DESIGN.md §5.9).
 *
 * Disclosed simplifications vs Bootstrap's Modal JS (operator-approved):
 * - No scrollbar-width padding-right compensation on `body.modal-open`.
 * - No fade/slide transition — the previous version had no `fade` class
 *   either (instant show/hide), preserved as-is.
 */

import { ref, defineProps, defineExpose, useSlots, onBeforeUnmount, nextTick, provide } from 'vue'
import { confirmDiscardChanges } from '@/lib/swal.lib'
import { buttonClass } from '@/lib/button.lib'
import { t } from '@/i18n'

const slots = useSlots()

const props = defineProps({
    title: { type: String, default: 'Modal Title' },
    size: { type: String, default: 'modal-lg' },
    isHiddenFooter: { type: Boolean, default: false },
})

const refModal = ref(null)
const visible = ref(false)
// eslint-disable-next-line no-unused-vars -- used in the template
const titleId = `modal-title-${++modalSeq}`
// eslint-disable-next-line no-unused-vars -- used in the template
const closeBtnClass = buttonClass({ variant: 'secondary' })
let returnFocusTo = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

function trapTab(e) {
    const items = [...refModal.value.querySelectorAll(FOCUSABLE)].filter(el => !el.closest('[hidden], [style*="display: none"]'))
    if (!items.length) return e.preventDefault()
    const first = items[0]
    const last = items[items.length - 1]
    const inside = refModal.value.contains(document.activeElement)
    if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
    } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
    }
}

// Module-scope so >1 simultaneously-mounted <Modal> instance (e.g.
// PageGeneralInformation.vue mounts 3) doesn't have one instance's
// hide() re-enable body scroll while another instance is still open.
let openModalCount = 0

/**
 * Forms inside the modal (VeeForm) register an `isDirty` getter here, so a
 * user-initiated close can ask before discarding unsaved input. Programmatic
 * `hide()` (e.g. after a successful save) skips this check.
 */
const dirtyGuards = new Set()
provide('modalDirtyGuard', {
    register: fn => dirtyGuards.add(fn),
    unregister: fn => dirtyGuards.delete(fn),
})

// Swal's own Esc handler runs on window after ours — without this flag the
// same keypress would re-open the confirm instead of dismissing it.
let confirming = false

async function requestClose() {
    if (confirming) return
    if ([...dirtyGuards].some(isDirty => isDirty())) {
        confirming = true
        try {
            if (!(await confirmDiscardChanges())) return
        } finally {
            confirming = false
        }
    }
    hide()
}

function onKeydown(e) {
    if (e.key === 'Escape') requestClose()
    else if (e.key === 'Tab') trapTab(e)
}

function show() {
    if (visible.value) return
    returnFocusTo = document.activeElement
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
    returnFocusTo?.focus?.()
    returnFocusTo = null
}

// Replaces Bootstrap's global delegated `[data-bs-dismiss="modal"]`
// click handler — scoped to this instance's own root. Slot content
// (e.g. a consumer page's own "Đóng" button inside VeeForm's #button
// slot) is a real DOM descendant of refModal's root, so bubbling still
// reaches this listener without any consumer markup changes.
function onRootClick(e) {
    if (e.target.closest('[data-bs-dismiss="modal"]')) requestClose()
    else if (e.target === refModal.value && mousedownOnRoot) requestClose()
}

/**
 * `.modal` is a full-viewport layer above the teleported backdrop, so an
 * outside-dialog click lands on this root, not on `.modal-backdrop`. Like
 * Bootstrap, only count it when the press also started there — a text
 * selection dragged out of the dialog must not close it.
 */
let mousedownOnRoot = false
function onRootMousedown(e) {
    mousedownOnRoot = e.target === refModal.value
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
        role="dialog" aria-modal="true" :aria-labelledby="titleId"
        ref="refModal" @mousedown="onRootMousedown" @click="onRootClick">
        <div class="modal-dialog modal-dialog-scrollable" :class="props.size">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 :id="titleId" class="modal-title m-0 text-md font-semibold">{{ props.title }}</h2>
                    <button type="button" data-bs-dismiss="modal" :aria-label="t('common.close')"
                        class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded text-fg-2 hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                        <FontAwesomeIcon icon="fa-solid fa-xmark" />
                    </button>
                </div>
                <div class="modal-body">
                    <template v-if="slots?.default">
                        <slot></slot>
                    </template>
                    <p v-else>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, facilis!</p>
                </div>
                <div class="modal-footer" v-if="!isHiddenFooter">
                    <button type="button" :class="closeBtnClass" data-bs-dismiss="modal">{{ t('common.close') }}</button>
                    <template v-if="slots?.footer"><slot name="footer"></slot></template>
                </div>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <div v-if="visible" class="modal-backdrop show" @click="requestClose()"></div>
    </Teleport>
</template>
