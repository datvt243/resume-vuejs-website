/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import axios from 'axios'
import { candidateStore } from '@/stores/candidate'
import { API, subURL } from '@/config/api.config'

const REFRESH_TOKEN_KEY = 'refreshToken'

const readRefreshToken = (): string => {
    try {
        return sessionStorage.getItem(REFRESH_TOKEN_KEY) || ''
    } catch (e) {
        return ''
    }
}

/**
 * Auth = Bearer token, NOT cookies. The frontend (github.io) and the API
 * (onrender.com) are different sites, so the backend's auth cookies are
 * third-party cookies — blocked by default in Safari/Firefox/Brave/Chrome
 * Incognito (login "succeeds" then every request 401s), and the
 * `csrfToken` cookie is never readable from `document.cookie` here anyway.
 *
 * Mitigation for #8 (XSS reading a token from localStorage):
 * - access token: memory only (Pinia ref) — gone on reload, re-obtained
 *   via the refresh token on the first 401 (see services/axios.ts)
 * - refresh token: sessionStorage — scoped to this tab, cleared when it
 *   closes; never localStorage
 * `_user` stays in localStorage (display data only, not a credential).
 */
export const authStore = defineStore('auth', () => {
    const _user = reactive(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {})
    const _token = ref('')
    const _refreshToken = ref(readRefreshToken())

    const getUser = computed(() => _user)
    const getToken = computed(() => _token.value)
    const getRefreshToken = computed(() => _refreshToken.value)
    // a cached user without a refresh token (e.g. a new tab) can't make
    // authenticated calls — treat it as logged out instead of 401-looping
    const isAuthenticated = computed(() => !!_user?.email && !!_refreshToken.value)

    function setTokens({ token = '', tokenRefresh = '' } = {}) {
        _token.value = token
        _refreshToken.value = tokenRefresh
        try {
            if (tokenRefresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, tokenRefresh)
            else sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        } catch (e) {
            // storage unavailable (private mode) — session lasts until reload
        }
    }

    async function logOut(opt = {}) {
        try {
            // revokes the refresh token server-side
            if (_token.value) {
                await axios.post(`${API}${subURL}auth/logout`, {}, { headers: { Authorization: `Bearer ${_token.value}` } })
            }
        } catch (e) {
            // best-effort: still clear local state below even if this fails
            // (e.g. already-expired token, offline)
        }

        // remove storage
        localStorage.removeItem('user')
        setTokens()

        // reset [user]
        Object.keys(_user).forEach(key => delete _user[key])
        candidateStore().clean()

        // direct router
        opt?.router?.push('/login')
    }

    function setUser(val) {
        Object.assign(_user, val)
        localStorage.setItem('user', JSON.stringify(val))
    }

    function clearUser() {
        Object.keys(_user).forEach(key => delete _user[key])
    }

    return {
        logOut,
        isAuthenticated,
        setUser,
        clearUser,
        getUser,
        getToken,
        getRefreshToken,
        setTokens,
    }
})
