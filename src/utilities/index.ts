/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import DOMPurify from 'dompurify'

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

/**
 * URL of the server-rendered CV download (`GET api/v1/download-pdf`).
 * Issue #159: `template=ats` picks the backend's ATS-optimized template;
 * `classic` is the backend default, so it's left off the URL entirely —
 * keeps the classic link byte-identical to what it was before #159.
 * `token`: this is a plain link navigation, so no Authorization header —
 * the backend also accepts the access token as `?token=`.
 */
export const getDownloadCvUrl = (host: string, template: 'classic' | 'ats' = 'classic', token = ''): string => {
    const params = new URLSearchParams()
    if (template === 'ats') params.set('template', 'ats')
    if (token) params.set('token', token)
    const query = params.toString()
    return `${host}api/v1/download-pdf${query ? `?${query}` : ''}`
}

/**
 * Strip scripts, event handlers and `javascript:` URLs from user-authored
 * rich text (CKEditor output, imported data) before it reaches `v-html`.
 * Access/refresh tokens are JS-readable, so any XSS here can read them.
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
    if (!html) return ''
    return DOMPurify.sanitize(html)
}

/**
 * Escape a plain-text value for interpolation into an HTML string.
 */
export const escapeHtml = (text: string): string =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
