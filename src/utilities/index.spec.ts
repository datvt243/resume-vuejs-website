import { describe, it, expect } from 'vitest'
import { formatDate, formatDateToInput, getLocalizedText, splitLocalizedText, localizedToForm, localizedFromForm, getDownloadCvUrl, sanitizeHtml, escapeHtml } from './index'

describe('formatDate', () => {
    it('returns the placeholder for a falsy date', () => {
        expect(formatDate(null)).toBe('--/--')
    })

    it('formats DD/MM/YYYY by default, padding single-digit day/month', () => {
        // 2026-09-05 (month index 8 = September, day 5)
        const ts = new Date(2026, 8, 5).getTime()
        expect(formatDate(ts)).toBe('05/09/2026')
    })

    it('formats MM/DD/YYYY when requested', () => {
        const ts = new Date(2026, 0, 20).getTime() // 2026-01-20
        expect(formatDate(ts, 'MM/DD/YYYY')).toBe('01/20/2026')
    })

    it('formats MM/YYYY when requested', () => {
        const ts = new Date(2026, 11, 1).getTime() // 2026-12-01
        expect(formatDate(ts, 'MM/YYYY')).toBe('12/2026')
    })
})

describe('formatDateToInput', () => {
    it('returns the placeholder for a falsy date', () => {
        expect(formatDateToInput(null)).toBe('--/--')
    })

    it('formats as YYYY-MM-DD, padding single-digit day/month', () => {
        const ts = new Date(2026, 8, 5).getTime() // 2026-09-05
        expect(formatDateToInput(ts)).toBe('2026-09-05')
    })
})

describe('getLocalizedText', () => {
    it('returns an empty string for null/undefined', () => {
        expect(getLocalizedText(null)).toBe('')
        expect(getLocalizedText(undefined)).toBe('')
    })

    it('returns a plain string unchanged', () => {
        expect(getLocalizedText('hello')).toBe('hello')
    })

    it('picks the requested language from an {vi, en} object', () => {
        expect(getLocalizedText({ vi: 'chào', en: 'hello' }, 'en')).toBe('hello')
        expect(getLocalizedText({ vi: 'chào', en: 'hello' }, 'vi')).toBe('chào')
    })

    it('defaults to vi, then falls back to en, when the requested language is missing', () => {
        expect(getLocalizedText({ vi: 'chào' })).toBe('chào')
        expect(getLocalizedText({ en: 'hello' })).toBe('hello')
    })
})

describe('splitLocalizedText', () => {
    it('splits a {vi, en} object without falling back across languages', () => {
        expect(splitLocalizedText({ vi: 'chào', en: 'hello' })).toEqual({ vi: 'chào', en: 'hello' })
        expect(splitLocalizedText({ en: 'hello' })).toEqual({ vi: '', en: 'hello' })
    })

    it('treats a plain string as the vi text and a falsy value as empty', () => {
        expect(splitLocalizedText('chào')).toEqual({ vi: 'chào', en: '' })
        expect(splitLocalizedText(null)).toEqual({ vi: '', en: '' })
    })
})

describe('localizedToForm / localizedFromForm', () => {
    it('unwraps each named field into <name> (vi) + <name>_en', () => {
        const doc = { description: { vi: 'mô tả', en: 'desc' }, other: 'x' }
        expect(localizedToForm(doc, ['description'])).toEqual({ description: 'mô tả', description_en: 'desc' })
    })

    it('folds <name>_en back into {vi, en}, drops the sibling key and leaves other fields alone', () => {
        const values = { _id: '1', description: 'mô tả', description_en: 'desc' }
        expect(localizedFromForm(values, ['description'])).toEqual({ _id: '1', description: { vi: 'mô tả', en: 'desc' } })
        expect(values).toEqual({ _id: '1', description: 'mô tả', description_en: 'desc' })
    })

    it('round-trips a record and defaults missing halves to empty strings', () => {
        const doc = { career: { vi: 'IT' }, careerGoal: 'mục tiêu' }
        const names = ['career', 'careerGoal']
        expect(localizedFromForm(localizedToForm(doc, names), names)).toEqual({
            career: { vi: 'IT', en: '' },
            careerGoal: { vi: 'mục tiêu', en: '' },
        })
    })
})

describe('getDownloadCvUrl', () => {
    const host = 'https://api.example.com/'

    it('defaults to the classic template with no query string (unchanged pre-#159 URL)', () => {
        expect(getDownloadCvUrl(host)).toBe('https://api.example.com/api/v1/download-pdf')
    })

    it('omits the query string for an explicit classic template', () => {
        expect(getDownloadCvUrl(host, 'classic')).toBe('https://api.example.com/api/v1/download-pdf')
    })

    it('adds template=ats for the ATS-optimized template', () => {
        expect(getDownloadCvUrl(host, 'ats')).toBe('https://api.example.com/api/v1/download-pdf?template=ats')
    })

    it('appends the access token as ?token= (link navigation sends no Authorization header)', () => {
        expect(getDownloadCvUrl(host, 'classic', 'abc')).toBe('https://api.example.com/api/v1/download-pdf?token=abc')
        expect(getDownloadCvUrl(host, 'ats', 'abc')).toBe('https://api.example.com/api/v1/download-pdf?template=ats&token=abc')
    })

    it('adds lang=en for the English CV and omits the default vi', () => {
        expect(getDownloadCvUrl(host, 'classic', '', 'vi')).toBe('https://api.example.com/api/v1/download-pdf')
        expect(getDownloadCvUrl(host, 'ats', 'abc', 'en')).toBe('https://api.example.com/api/v1/download-pdf?template=ats&lang=en&token=abc')
    })
})

describe('sanitizeHtml', () => {
    it('returns an empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('')
        expect(sanitizeHtml(null)).toBe('')
        expect(sanitizeHtml(undefined)).toBe('')
    })

    it('keeps CKEditor formatting markup', () => {
        const html = '<p>Hello <strong>bold</strong></p><ul><li>one</li></ul>'
        expect(sanitizeHtml(html)).toBe(html)
    })

    it('strips scripts, event handlers and javascript: URLs', () => {
        expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>')
        expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x">')
        expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>')
    })
})

describe('escapeHtml', () => {
    it('escapes HTML-significant characters', () => {
        expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe('&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;')
    })

    it('leaves plain names unchanged', () => {
        expect(escapeHtml('Đạt Võ')).toBe('Đạt Võ')
    })
})
