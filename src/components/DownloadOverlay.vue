<script setup>
/**
 * Full-page overlay while the server-rendered CV downloads (DESIGN.md §5.9 exception):
 * status + Cancel, and a leave guard — in-app navigation asks first, leaving aborts the download.
 */

import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { isDownloading, downloadStatus, cancelDownload } from '@/composables/useDownloadCv'
import { authStore } from '@/stores/auth'
import { confirmDiscardChanges } from '@/lib/swal.lib'
import { buttonClass } from '@/lib/button.lib'
import { t } from '@/i18n'

const store = authStore()
const refCancel = ref(null)
// eslint-disable-next-line no-unused-vars -- used in the template
const cancelBtnClass = buttonClass({ variant: 'secondary' })
let returnFocusTo = null
let leavePromptOpen = false

watch(isDownloading, async (on) => {
    if (on) {
        returnFocusTo = document.activeElement
        await nextTick()
        refCancel.value?.focus()
        return
    }
    // the download ended under the leave prompt: drop the prompt, the guard then lets the navigation through
    if (leavePromptOpen) return Swal.close()
    await nextTick()
    returnFocusTo?.focus()
    // the account-menu item is hidden once its menu closes — fall back to the menu trigger
    if (returnFocusTo?.closest?.('.user-menu') && document.activeElement !== returnFocusTo) {
        document.querySelector('.user-menu [aria-haspopup]')?.focus()
    }
})

const removeGuard = useRouter().beforeEach(async () => {
    // a forced logout already killed the request — no prompt on the way to login
    if (!isDownloading.value || !store.isAuthenticated) return true
    leavePromptOpen = true
    const leave = await confirmDiscardChanges({ title: t('download.leaveTitle'), confirmText: t('download.leave') })
    leavePromptOpen = false
    if (!leave && isDownloading.value) return false
    cancelDownload()
    return true
})
onBeforeUnmount(removeGuard)
</script>

<template>
    <!-- Cancel is the only focusable element, so Tab stays on it; tabindex keeps focus in the dialog on a backdrop click -->
    <div
        v-if="isDownloading"
        class="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-overlay-title"
        aria-describedby="download-overlay-status"
        tabindex="-1"
        @keydown.esc="cancelDownload"
        @keydown.tab.prevent
    >
        <div class="flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-fg shadow-float">
            <span class="spinner-border spinner-border-sm mt-0.5 text-accent" aria-hidden="true"></span>
            <div class="min-w-0 flex-1">
                <h2 id="download-overlay-title" class="m-0 text-md font-semibold">{{ t('download.title') }}</h2>
                <p id="download-overlay-status" class="mb-0 mt-1 text-fg-2" aria-live="polite">
                    {{ t(downloadStatus === 'downloading' ? 'download.downloading' : 'download.generating') }}
                </p>
                <div class="mt-4 flex justify-end">
                    <button ref="refCancel" type="button" :class="cancelBtnClass" @click="cancelDownload">{{ t('common.cancel') }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
