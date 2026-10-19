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

const formFields = [
    /* {
        name: 'firstName',
        label: 'Họ',
        type: 'text',
        placeholder: 'Vui lòng nhập Họ',
        valid: (yup) => yup.string().min(0).max(10).required(),
        col: 'col-md-6',
    },
    {
        name: 'lastName',
        label: 'Tên',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên',
        valid: (yup) => yup.string().min(0).max(30).required(),
        col: 'col-md-6',
    }, */
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Vui lòng nhập Email',
        autocomplete: 'email',
        valid: yup => yup.string().email().required(),
    },
    {
        name: 'password',
        label: 'Mật khẩu',
        type: 'password',
        autocomplete: 'new-password',
        text: 'Tối thiểu 12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
        // khớp với format backend yêu cầu (verified qua API: tối thiểu 12
        // ký tự + đủ 4 loại) — trước đây không có rule này nên đăng ký
        // luôn bị backend từ chối 401 mà UI chỉ hiện toast chung chung
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
        autocomplete: 'new-password',
        valid: yup =>
            yup
                .string()
                .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp')
                .required('Vui lòng nhập lại mật khẩu'),
    },
]
</script>

<template>
    <div class="flex justify-center py-12">
        <div class="w-full max-w-md rounded-md border border-line bg-surface p-6">
            <Heading :level="1" text="Đăng ký" />
            <VeeForm
                :fields="formFields"
                :submit-fn="
                    values => {
                        handleRegister(values, { toast: refToast, loading: refSpinner })
                    }
                "
                submit-text="Tạo tài khoản"
            />
        </div>
    </div>
</template>

