/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { toValue } from 'vue'
import { authStore } from '@/stores/auth'
import { subURL } from '@/config/api.config'
import { _axios, TOKEN_ERROR_CODES, errorCodeOf } from '@/services/axios'

export const handleBase = async (axiosOptions, props, callback) => {
    /**
     *
     */
    await handleFrameFetch(axiosOptions, props, callback, async (axiosOptions, toast, callback) => {
        const { method, url, data = null, params = null, customURL = null } = axiosOptions

        const _props = (() => {
            const _result = {
                method,
                url: customURL ? customURL : `${subURL}${url}`,
            }
            data && (_result.data = data)
            params && (_result.params = params)
            return _result
        })()

        const __helper = _helper({ toast })
        await _axios(_props)
            .then(res => {
                // some endpoints answer 2xx with success:false (API-STANDARD C1)
                if (res?.success === false) return __helper.error(res)
                callback?.(res)
                __helper.success(res)
            })
            .catch(err => {
                __helper.error(err)
            })
    })
}

const handleFrameFetch = async (axiosOptions, props, callback, action) => {
    const { loading = null, toast = null } = props

    /**
     * spinner loading
     */
    toValue(loading)?.show()

    /**
     * fetch data
     *
     */
    try {
        await action?.(axiosOptions, toast, callback)
    } finally {
        /**
         * spinner hide
         */
        toValue(loading)?.hide()
    }
}

const _helper = props => {
    const { toast } = props
    return {
        success: res => {
            const { message = '' } = res
            toast?.({
                message: message,
                bg: 'success',
            })
        },
        error: err => {
            // read both the new `error` envelope and the legacy flat body (API-STANDARD C6)
            const message = err?.error?.message ?? err?.message ?? ''
            const errors = err?.error?.details ?? err?.errors ?? {}

            /**
             * báo lỗi
             */
            const _message = []

            /**
             *
             */
            message && _message.push(message)

            /**
             *
             */
            if (errors && Object.keys(errors).length) {
                for (const [, mess] of Object.entries(errors)) {
                    // new details are `{ field, message }`, legacy ones plain strings
                    _message.push(`- ${mess?.message ?? mess} `)
                }
            }

            /**
             * show toast
             */
            toast &&
                toast?.({
                    message: _message.join('\n') + '',
                    bg: 'danger',
                })

            /**
             * lỗi trả về là token error thì logout
             */
            if (TOKEN_ERROR_CODES.includes(errorCodeOf(err))) {
                const store = authStore()
                store?.logOut()
            }
        },
    }
}
