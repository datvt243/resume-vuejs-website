/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import axios from 'axios'
import { API, subURL } from '@/config/api.config'
import { authStore } from '@/stores/auth'
import { getCsrfHeader } from '@/utilities'

const SAFE_METHODS = ['get', 'head', 'options']

/**
 * `withCredentials: true` (issue #8): auth now rides on the backend's
 * httpOnly cookies (`token`/`refreshToken`) instead of a Bearer header
 * built from localStorage — the browser attaches/receives them
 * automatically on every request, cross-site (`SameSite=None`) included.
 */
const instanceAxios = axios.create({
    baseURL: API,
    withCredentials: true,
})

/**
 * Attach the CSRF double-submit header (issue #8/#134) on every
 * state-changing request — the backend requires it whenever auth comes
 * from the cookie, and this runs on every dispatch (including the
 * post-refresh retry below), so it's never stale.
 */
instanceAxios.interceptors.request.use(config => {
    const method = (config.method || 'get').toLowerCase()
    if (!SAFE_METHODS.includes(method)) {
        const csrfHeader = getCsrfHeader()
        Object.keys(csrfHeader).forEach(key => {
            config.headers[key] = csrfHeader[key]
        })
    }
    return config
})

/**
 * silent refresh: khi access token hết hạn (401), thử đổi lấy token mới
 * bằng refresh token trước khi force logout.
 */
let _refreshPromise = null

instanceAxios.interceptors.response.use(
    res => res,
    async err => {
        const originalRequest = err.config

        if (err.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true
            try {
                /**
                 * dedupe: nhiều request 401 cùng lúc chỉ gọi auth/refresh một
                 * lần, chia sẻ chung 1 promise thay vì mỗi request tự refresh.
                 * refreshToken tự gửi qua cookie (withCredentials) — không
                 * còn đọc/truyền tay từ localStorage.
                 */
                if (!_refreshPromise) {
                    _refreshPromise = axios
                        .post(
                            `${API}${subURL}auth/refresh`,
                            {},
                            { withCredentials: true, headers: getCsrfHeader() },
                        )
                        .finally(() => {
                            _refreshPromise = null
                        })
                }
                await _refreshPromise
                return instanceAxios(originalRequest)
            } catch (refreshErr) {
                authStore().logOut()
                return Promise.reject(refreshErr)
            }
        }

        return Promise.reject(err)
    },
)

export const _axios = async props => {
    const { url, method, params, data, customURL = null } = props
    return new Promise((resolve, reject) => {
        instanceAxios({
            url: customURL ? customURL : url,
            method,
            params,
            data,
            headers: {
                'Content-Type': 'application/json',
            },
            baseURL: API,
        })
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                reject(err.response?.data ?? { message: 'Lỗi kết nối, vui lòng thử lại', errors: {}, invalidToken: false })
            })
    })
}
