<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { handleRegister } from '@/services/auth'
import { authStore } from '@/stores/auth'

const router = useRouter()
const refSpinner = inject('spinner')
const refToast = inject('toast')

const store = authStore()
if (store.isAuthenticated) {
    router?.push('/dashboard/information')
}

// no name fields: auth/register only accepts email/password/repassword — names are set later on the information page
const formFields = [
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'auth.emailPlaceholder',
        autocomplete: 'email',
        valid: yup => yup.string().email('validation.emailInvalid').required('validation.emailRequired'),
    },
    {
        name: 'password',
        label: 'auth.password',
        type: 'password',
        autocomplete: 'new-password',
        text: 'auth.passwordHint',
        // khớp với format backend yêu cầu (verified qua API: tối thiểu 12
        // ký tự + đủ 4 loại) — trước đây không có rule này nên đăng ký
        // luôn bị backend từ chối 401 mà UI chỉ hiện toast chung chung
        valid: yup =>
            yup
                .string()
                .min(12, 'validation.passwordMin')
                .matches(/[a-z]/, 'validation.passwordLower')
                .matches(/[A-Z]/, 'validation.passwordUpper')
                .matches(/[0-9]/, 'validation.passwordDigit')
                .matches(/[^A-Za-z0-9]/, 'validation.passwordSpecial')
                .required('validation.passwordRequired'),
    },
    {
        name: 'repassword',
        label: 'auth.confirmPassword',
        type: 'password',
        autocomplete: 'new-password',
        valid: yup =>
            yup
                .string()
                .oneOf([yup.ref('password')], 'validation.passwordMismatch')
                .required('validation.confirmPasswordRequired'),
    },
]
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" :text="$t('auth.registerTitle')" />
            <VeeForm
                :fields="formFields"
                :submit-fn="
                    values => {
                        handleRegister(values, { toast: refToast, loading: refSpinner, router })
                    }
                "
                :submit-text="$t('auth.createAccount')"
            />
        </div>
    </div>
</template>

