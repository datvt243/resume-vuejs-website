<script setup>
/**
 * Confirms a pending email change (issue #460, backend resume-nodejs-api#412): the link
 * mailed by `POST auth/change-email` opens this page. Works signed in or out; a signed-in
 * tab is signed out after success, because its stored `user.email` is now the old address.
 */

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import { useHelper } from '@/composables/useHelper'
import { handleBase } from '@/services/base'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const auth = authStore()
const { loading, toast } = useHelper()
// a repeated ?token= gives an array — treat it as no token
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

// 'pending' | 'success' | 'error'
const status = ref('pending')
const message = ref('')

onMounted(async () => {
    if (!token.value) return
    await handleBase(
        { method: 'get', url: 'auth/confirm-email-change', params: { token: token.value } },
        {
            loading,
            toast: null,
            onError: err => {
                status.value = 'error'
                message.value = err?.error?.message ?? err?.message ?? t('error.generic')
                return true
            },
        },
        async res => {
            if (auth.isAuthenticated) {
                toast?.({ message: t('auth.confirmEmailSignInAgain'), bg: 'success' })
                await auth.logOut({ router })
                return
            }
            // this tab has no session, but another tab's stored user still holds the old email (App.vue reload fetch)
            if (auth.getUser?.email) await auth.logOut()
            status.value = 'success'
            message.value = res?.message || ''
        },
    )
})
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" :text="t('auth.confirmEmailTitle')" />
            <template v-if="!token">
                <p class="text-sm text-danger">{{ t('auth.confirmEmailInvalidLink') }}</p>
                <RouterLink to="/login" class="text-sm">{{ t('auth.backToLogin') }}</RouterLink>
            </template>
            <p v-else-if="status === 'pending'" class="text-sm text-fg-2" aria-live="polite">{{ t('auth.confirmEmailPending') }}</p>
            <template v-else-if="status === 'success'">
                <p class="text-sm text-success" aria-live="polite">{{ message || t('auth.confirmEmailSuccess') }}</p>
                <RouterLink to="/login" class="text-sm">{{ t('auth.goToLogin') }}</RouterLink>
            </template>
            <template v-else>
                <p class="text-sm text-danger" role="alert">{{ message }}</p>
                <RouterLink to="/login" class="text-sm">{{ t('auth.backToLogin') }}</RouterLink>
            </template>
        </div>
    </div>
</template>
