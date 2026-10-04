/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import axios from 'axios'
import { API, subURL } from '@/config/api.config'
import { authStore } from '@/stores/auth'

/**
 * Auth = `Authorization: Bearer <token>` from the in-memory authStore —
 * NOT cookies: the API is cross-site from github.io, so its cookies are
 * third-party and blocked by most browsers (see stores/auth.ts).
 */
const instanceAxios = axios.create({
    baseURL: API,
})

instanceAxios.interceptors.request.use(config => {
    const token = authStore().getToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

/**
 * silent refresh: khi access token hết hạn/chưa có (401 — vd. sau khi
 * reload trang, access token chỉ nằm trong memory), đổi refresh token
 * (sessionStorage) lấy cặp token mới trước khi force logout.
 */
let _refreshPromise = null

const refreshTokens = async () => {
    const store = authStore()
    const refreshToken = store.getRefreshToken
    if (!refreshToken) throw new Error('No refresh token')
    const res = await axios.post(`${API}${subURL}auth/refresh`, { refreshToken })
    store.setTokens(res.data?.data ?? {})
}

instanceAxios.interceptors.response.use(
    res => res,
    async err => {
        const originalRequest = err.config

        if (err.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true
            try {
                /**
                 * dedupe: nhiều request 401 cùng lúc chỉ gọi auth/refresh một
                 * lần — bắt buộc, vì backend rotate (blacklist) refresh token
                 * cũ sau mỗi lần refresh.
                 */
                if (!_refreshPromise) {
                    _refreshPromise = refreshTokens().finally(() => {
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
    // FormData (e.g. the LinkedIn-export import upload) must NOT get a
    // forced 'application/json' Content-Type — axios/the browser need to
    // set their own 'multipart/form-data; boundary=...' header instead,
    // which only happens when no Content-Type is set here at all.
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    return new Promise((resolve, reject) => {
        instanceAxios({
            url: customURL ? customURL : url,
            method,
            params,
            data,
            headers: isFormData
                ? undefined
                : {
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
