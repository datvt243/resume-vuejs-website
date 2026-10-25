<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import LayoutDefault from '@/pages/_layouts/LayoutDefault.vue'
import LayoutAuth from '@/pages/_layouts/LayoutAuth.vue'

import Spinner from '@/components/Spinner.vue'
import Toasts from '@/components/Toasts.vue'

/**
 *
 */
import { ref, reactive, provide, onMounted } from 'vue'
import { authStore } from '@/stores/auth'
import { candidateStore } from '@/stores/candidate'

import { handleBase } from '@/services/base'
import { useAuthRedirect } from '@/composables/useAuthRedirect'

const store = authStore()
const candidate = candidateStore()
useAuthRedirect()

onMounted(async () => {
    if (store.isAuthenticated) {
        /**
         * lấy thông tin user
         */
        refSpinner?.value?.show()
        try {
            await (async () => {
                const { email } = store.getUser
                const opt = { method: 'get', url: `candidate/${email}` }
                await handleBase(opt, {}, res => {
                    candidate.setCandidate({ ...res.data })
                })
            })()
        } catch (err) {
            throw new Error(`App, ${err}`)
        } finally {
            refSpinner?.value?.hide()
        }
    }
})

/**
 * spinner
 */
const refSpinner = ref(null)
provide('spinner', refSpinner)

/**
 * Toasts
 */
const refToast = ref(null)
const toastAttrs = reactive({
    content: '',
    bg: '',
})
provide('toast', showToast)
function showToast({ message, bg }) {
    toastAttrs.content = message
    toastAttrs.bg = bg
    setTimeout(() => {
        refToast.value?.show()
    }, 100)
}
</script>

<template>
    <Spinner ref="refSpinner" />
    <div class="clearfix" :inert="refSpinner?.isColdStart">
        <component :is="store.isAuthenticated ? LayoutDefault : LayoutAuth">
            <RouterView />
        </component>
    </div>
    <Toasts ref="refToast" v-bind="toastAttrs" />
</template>

<style scoped></style>
