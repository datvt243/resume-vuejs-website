<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Quên mật khẩu — issue #61. Gọi POST auth/forgot-password
 * (real endpoint, backend luôn trả về message chung chung dù email có
 * tồn tại hay không). LƯU Ý: backend hiện chỉ LOG link reset chứ chưa
 * gửi email thật (backend issue #70, chưa có mail provider) — disclose
 * rõ trong UI thay vì im lặng giả vờ đã gửi email.
 */
import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { inject } from 'vue'
import { handleForgotPassword } from '@/services/auth'

const refSpinner = inject('spinner')
const refToast = inject('toast')

const formFields = [
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        icon: 'fa-solid fa-envelope',
        placeholder: 'Vui lòng nhập Email',
        valid: yup => yup.string().email('Email sai định dạng').required('Email là bắt buộc'),
    },
]

async function _handleForgotPassword(values) {
    await handleForgotPassword(values, { loading: refSpinner, toast: refToast })
}
</script>

<template>
    <div class="forgot-password-page flex items-center justify-center">
        <div class="auth-card">
            <Heading text="Quên mật khẩu" />
            <p class="text-sm opacity-75">
                Nhập email đã đăng ký, hệ thống sẽ tạo một liên kết đặt lại mật khẩu.
            </p>
            <VeeForm :fields="formFields" :submit-fn="_handleForgotPassword" :submit-text="'Gửi yêu cầu'" />
            <RouterLink to="/login" class="inline-block mt-[1rem] text-sm">Quay lại đăng nhập</RouterLink>
        </div>
    </div>
</template>

<style scoped lang="scss">
.forgot-password-page {
    min-height: 70vh;
}

.auth-card {
    width: 100%;
    max-width: 440px;
    padding: 2rem 2.25rem;
    border-radius: 1rem;
    background-color: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color-translucent);
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.25);
}
</style>
