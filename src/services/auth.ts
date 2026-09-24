/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { _axios } from '@/services/axios'
import { authStore } from '@/stores/auth'
import { candidateStore } from '@/stores/candidate'
import { toValue } from 'vue'
import { subURL } from '@/config/api.config'

export const handleLogin = async (values, props) => {
    const { email, password } = values
    const { loading = null, toast = null, router = null } = props

    /**
     * spinner loading
     */
    toValue(loading)?.show()

    /**
     * fetch data
     *
     */
    try {
        const loginRes = await _axios({
            method: 'post',
            url: `${subURL}auth/login`,
            data: {
                email: email.trim(),
                password: password.trim(),
            },
        })

        toast?.({
            message: loginRes.message,
            bg: 'success',
        })

        const { user } = loginRes.data

        // auth cookies (token/refreshToken/csrfToken) are already set by the
        // login response itself (withCredentials) — no token to pass along.
        const candidateRes = await _axios({ method: 'get', url: `${subURL}candidate/${email.trim()}` })
        candidateStore().setCandidate({ ...candidateRes.data })

        const store = authStore()
        store.setUser({ ...user })
        router?.push('/dashboard/information')
    } catch (err) {
        toast?.({
            message: 'Đăng nhập thất bại',
            bg: 'danger',
        })
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}

export const handleForgotPassword = async (values, props) => {
    const { email } = values
    const { loading = null, toast = null } = props

    /**
     * spinner loading
     */
    toValue(loading)?.show()

    try {
        const res = await _axios({
            method: 'post',
            url: `${subURL}auth/forgot-password`,
            data: {
                email: email.trim(),
            },
        })

        toast?.({
            message: res.message,
            bg: 'success',
        })
    } catch (err) {
        const { message = '' } = err
        toast?.({
            message: message + '',
            bg: 'danger',
        })
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}

export const handleResetPassword = async (values, props) => {
    const { token, password, repassword } = values
    const { loading = null, toast = null, router = null } = props

    /**
     * spinner loading
     */
    toValue(loading)?.show()

    try {
        const res = await _axios({
            method: 'post',
            url: `${subURL}auth/reset-password`,
            data: {
                token,
                password,
                repassword,
            },
        })

        toast?.({
            message: res.message,
            bg: 'success',
        })

        router?.push('/login')
    } catch (err) {
        const { message = '' } = err
        toast?.({
            message: message + '',
            bg: 'danger',
        })
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}

export const handleRegister = async (values, props) => {
    const { firstName, lastName, email, password, repassword } = values
    const { loading = null, toast = null, router = null } = props

    /**
     * spinner loading
     */
    toValue(loading)?.show()

    try {
        const res = await _axios({
            method: 'post',
            url: `${subURL}auth/register`,
            data: {
                firstName,
                lastName,
                email,
                password,
                repassword,
            },
        })

        toast?.({
            message: res.message,
            bg: 'success',
        })

        router?.push('/login')
    } catch (err) {
        const { message = '' } = err
        toast?.({
            message: message + '',
            bg: 'danger',
        })
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}
