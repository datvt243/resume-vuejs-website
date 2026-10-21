<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */
import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { handleLogin } from '@/services/auth'
import { authStore } from '@/stores/auth'

const router = useRouter()
const refSpinner = inject('spinner')
const refToast = inject('toast')

const store = authStore()
if (store.isAuthenticated) {
    router?.push('/dashboard/information')
}

const formFields = [
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'auth.emailPlaceholder',
        autocomplete: 'username',
        /* value: 'david@gmail.com', */
        valid: yup => yup.string().email('validation.emailInvalid').required('validation.emailRequired'),
    },
    {
        name: 'password',
        label: 'auth.password',
        type: 'password',
        autocomplete: 'current-password',
        /* value: 'david243', */
        valid: yup => yup.string().required('validation.passwordRequired'),
    },
    {
        name: 'rememberMe',
        label: 'auth.rememberMe',
        type: 'checkbox',
    },
]

async function _handleLogin(values) {
    await handleLogin(values, { loading: refSpinner, toast: refToast, router })
}
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" :text="$t('auth.loginTitle')" />
            <VeeForm :fields="formFields" :submit-fn="_handleLogin" :submit-text="$t('auth.loginTitle')">
                <template #button>
                    <RouterLink to="/forgot-password" class="ms-auto self-center whitespace-nowrap text-sm">{{ $t('auth.forgotPasswordLink') }}</RouterLink>
                </template>
            </VeeForm>
        </div>
    </div>
</template>

