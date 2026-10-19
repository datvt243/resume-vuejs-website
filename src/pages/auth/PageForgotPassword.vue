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
        placeholder: 'Vui lòng nhập Email',
        valid: yup => yup.string().email('Email sai định dạng').required('Email là bắt buộc'),
    },
]

async function _handleForgotPassword(values) {
    await handleForgotPassword(values, { loading: refSpinner, toast: refToast })
}
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" text="Quên mật khẩu" description="Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu." />
            <VeeForm :fields="formFields" :submit-fn="_handleForgotPassword" :submit-text="'Gửi yêu cầu'">
                <template #button>
                    <RouterLink to="/login" class="ms-auto self-center whitespace-nowrap text-sm">Quay lại đăng nhập</RouterLink>
                </template>
            </VeeForm>
        </div>
    </div>
</template>

