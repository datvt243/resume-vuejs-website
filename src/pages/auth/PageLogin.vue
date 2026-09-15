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
        icon: 'fa-solid fa-envelope',
        text: "We'll never share your email with anyone else.",
        placeholder: 'Vui lòng nhập Email',
        autocomplete: 'username',
        /* value: 'david@gmail.com', */
        valid: yup => yup.string().email('Email sai định dạng').required('Email là bắt buộc'),
    },
    {
        name: 'password',
        label: 'Mật khẩu',
        type: 'password',
        icon: 'fa-solid fa-lock',
        autocomplete: 'current-password',
        /* value: 'david243', */
        valid: yup => yup.string().required('Mật khẩu là bắt buộc'),
    },
    {
        name: 'rememberMe',
        label: 'Ghi nhớ đăng nhập',
        type: 'checkbox',
    },
]

async function _handleLogin(values) {
    await handleLogin(values, { loading: refSpinner, toast: refToast, router })
}
</script>

<template>
    <div class="login-page flex items-center justify-center">
        <div class="auth-card">
            <Heading text="Đăng nhập" />
            <VeeForm :fields="formFields" :submit-fn="_handleLogin" :submit-text="'Login'">
                <template #button>
                    <RouterLink to="/forgot-password" class="ms-auto self-center text-sm">Quên mật khẩu?</RouterLink>
                </template>
            </VeeForm>
        </div>
    </div>
</template>

<style scoped lang="scss">
.login-page {
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
