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
        label: 'Mật khẩu mới',
        type: 'password',
        text: 'Tối thiểu 12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
        valid: yup =>
            yup
                .string()
                .min(12, 'Mật khẩu phải có ít nhất 12 ký tự')
                .matches(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
                .matches(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
                .matches(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
                .matches(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
                .required(),
    },
    {
        name: 'repassword',
        label: 'Nhập lại mật khẩu',
        type: 'password',
        valid: yup =>
            yup
                .string()
                .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp')
                .required('Vui lòng nhập lại mật khẩu'),
    },
]

async function _handleResetPassword(values) {
    await handleResetPassword({ ...values, token: route.query.token }, { loading: refSpinner, toast: refToast, router })
}
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" text="Đặt lại mật khẩu" />
            <p v-if="!route.query.token" class="text-sm text-danger">
                Liên kết đặt lại mật khẩu không hợp lệ. Mở lại đúng liên kết trong email.
            </p>
            <VeeForm :fields="formFields" :submit-fn="_handleResetPassword" :submit-text="'Đặt lại mật khẩu'" />
        </div>
    </div>
</template>

