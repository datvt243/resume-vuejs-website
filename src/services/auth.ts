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
import { t } from '@/i18n'

// the API's own reason (wrong credentials, too many requests, unreachable) beats a generic line
const apiErrorMessage = (err: unknown, fallback: string) => {
    const body = err as { success?: boolean; message?: string; error?: { message?: string } } | undefined
    // || not ??: an empty message must still fall back
    return body?.error?.message || (body?.success === false && body.message) || fallback
}

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

        const { user, token, tokenRefresh } = loginRes.data

        // Bearer auth (see stores/auth.ts) — tokens must be in the store
        // before the next request so the axios interceptor can attach them
        const store = authStore()
        store.setTokens({ token, tokenRefresh })
        // tokens alone make isAuthenticated true, so set the user now or the header shows a cached previous user while the candidate loads
        store.setUser({ ...user })
        const candidateRes = await _axios({ method: 'get', url: `${subURL}candidate/${email.trim()}` })
        candidateStore().setCandidate({ ...candidateRes.data })

        router?.push('/dashboard/information')
    } catch (err) {
        authStore().setTokens()
        toast?.({ message: apiErrorMessage(err, t('error.loginFailed')), bg: 'danger' })
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
        toast?.({ message: apiErrorMessage(err, t('error.generic')), bg: 'danger' })
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
        toast?.({ message: apiErrorMessage(err, t('error.generic')), bg: 'danger' })
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}

export const handleRegister = async (values, props) => {
    const { email, password, repassword } = values
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
                email: email.trim(),
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
        toast?.({ message: apiErrorMessage(err, t('error.generic')), bg: 'danger' })
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}
