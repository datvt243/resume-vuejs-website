<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Đặt lại mật khẩu — issue #61. Đọc `token` từ query string
 * (link được backend LOG ra, không gửi email thật — xem
 * PageForgotPassword.vue). Gọi POST auth/reset-password (real endpoint,
 * yêu cầu password khớp cùng độ mạnh với lúc đăng ký — cùng rule với
 * PageRegister.vue, verified khớp `passwordRegex`/`PASSWORD_MIN_LENGTH`
 * phía backend).
 */
import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { handleResetPassword } from '@/services/auth'

const route = useRoute()
const router = useRouter()
const refSpinner = inject('spinner')
const refToast = inject('toast')

const formFields = [
    {
        name: 'password',
        label: 'auth.newPassword',
        type: 'password',
        text: 'auth.passwordHint',
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
        valid: yup =>
            yup
                .string()
                .oneOf([yup.ref('password')], 'validation.passwordMismatch')
                .required('validation.confirmPasswordRequired'),
    },
]

async function _handleResetPassword(values) {
    await handleResetPassword({ ...values, token: route.query.token }, { loading: refSpinner, toast: refToast, router })
}
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" :text="$t('auth.resetTitle')" />
            <p v-if="!route.query.token" class="text-sm text-danger">
                {{ $t('auth.resetInvalidLink') }}
            </p>
            <VeeForm :fields="formFields" :submit-fn="_handleResetPassword" :submit-text="$t('auth.resetTitle')" />
        </div>
    </div>
</template>

