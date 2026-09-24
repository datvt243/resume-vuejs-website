/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import axios from 'axios'
import { candidateStore } from '@/stores/candidate'
import { API, subURL } from '@/config/api.config'
import { getCsrfHeader } from '@/utilities'

/**
 * issue #8: the JWT itself no longer lives here — it's an httpOnly cookie
 * the browser holds and sends automatically, unreadable from JS (that was
 * the whole point, XSS can no longer exfiltrate it via localStorage).
 * `_user` stays cached (display data only, not a credential) and doubles
 * as the client-side "am I logged in" signal.
 */
export const authStore = defineStore('auth', () => {
    const _user = reactive(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {})

    const getUser = computed(() => _user)
    const isAuthenticated = computed(() => !!_user?.email)

    async function logOut(opt = {}) {
        try {
            // clears the httpOnly auth cookies server-side — without this
            // call they'd keep authenticating requests even after the UI
            // "logs out" locally.
            await axios.post(`${API}${subURL}auth/logout`, {}, { withCredentials: true, headers: getCsrfHeader() })
        } catch (e) {
            // best-effort: still clear local state below even if this fails
            // (e.g. already-expired token, offline)
        }

        // remove localStorage
        localStorage.removeItem('user')

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
    }
})
