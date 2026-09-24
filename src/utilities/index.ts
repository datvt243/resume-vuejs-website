/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

type StrDate = number | string
type formatStringDate = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'MM/YYYY'
type Str = 'dd' | 'mm' | 'yyyy'

const getDate = (date: number) => {
    const d = new Date(date)
    let _y: StrDate = d.getFullYear(),
        _m: StrDate = d.getMonth() + 1,
        _d: StrDate = d.getDate()
    _m = _m < 10 ? `0${_m}` : _m
    _d = _d < 10 ? `0${_d}` : _d
    return { d: _d, m: _m, y: _y }
}
const getObject = (data: { d: StrDate; m: StrDate; y: StrDate }): Record<string, string> => {
    const { d, m, y } = data
    return {
        dd: d + '',
        mm: m + '',
        yyyy: y + '',
    }
}

export const formatDate = (date: null | number, format: formatStringDate = 'DD/MM/YYYY'): string => {
    if (!date) return '--/--'
    const { d, m, y } = getDate(date)
    const obj = getObject({ d, m, y })

    let _result = ''

    const split = format.split('/') as Array<Str>
    for (let i = 0, _stop = split.length; i < _stop; i++) {
        const s: Str = split[i]
        const _val = obj?.[s.toLocaleLowerCase()] || ''
        _result += `${i !== 0 ? '/' : ''}${_val}`
    }

    return _result
}

export const formatDateToInput = (date: number | null): string => {
    if (!date) return '--/--'
    const { d, m, y } = getDate(date)
    return `${y}-${m}-${d}`
}

type LocalizedText = string | { vi?: string; en?: string } | null | undefined

/**
 * Some backend fields (e.g. `description`) can come back as a localized
 * object `{ vi, en }` instead of a plain string. Extract a displayable
 * string regardless of which shape was returned, defaulting to `vi`.
 */
export const getLocalizedText = (value: LocalizedText, lang: 'vi' | 'en' = 'vi'): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value[lang] || value.vi || value.en || ''
}

/**
 * Inverse of `getLocalizedText`: re-wrap an edited plain string back into
 * the `{ vi, en }` shape the backend expects, preserving whatever `en`
 * value was on the original (pre-edit) value. Use right before sending a
 * field back to the API that was unwrapped for editing with `getLocalizedText`.
 */
export const wrapLocalizedText = (newText: string, original: LocalizedText): { vi: string; en: string } => {
    const en = original && typeof original === 'object' ? original.en || '' : ''
    return { vi: newText || '', en }
}

const CSRF_COOKIE_NAME = 'csrfToken'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Read a cookie by name (document.cookie has no native getter). Used for
 * the CSRF double-submit cookie (issue #8/#134) — the auth token cookies
 * themselves are httpOnly and deliberately unreadable from here.
 */
export const getCookie = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Header to attach on state-changing requests once auth moved to httpOnly
 * cookies (issue #8) — the backend's `verifyToken`/`verifyCsrf` middleware
 * requires this to match the `csrfToken` cookie for any cookie-sourced,
 * non-GET request. Empty object (no header) when the cookie isn't set yet
 * (e.g. not logged in) — the backend only checks it for cookie-sourced auth.
 */
export const getCsrfHeader = (): Record<string, string> => {
    const token = getCookie(CSRF_COOKIE_NAME)
    return token ? { [CSRF_HEADER_NAME]: token } : {}
}
