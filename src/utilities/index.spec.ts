import { describe, it, expect } from 'vitest'
import { formatDate, formatDateToInput, getLocalizedText, wrapLocalizedText, getDownloadCvUrl } from './index'

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

describe('wrapLocalizedText', () => {
    it('wraps a plain new string, preserving the original en value', () => {
        expect(wrapLocalizedText('chào mới', { vi: 'chào', en: 'hello' })).toEqual({
            vi: 'chào mới',
            en: 'hello',
        })
    })

    it('defaults en to empty string when the original was not an {vi,en} object', () => {
        expect(wrapLocalizedText('chào mới', 'chào')).toEqual({ vi: 'chào mới', en: '' })
        expect(wrapLocalizedText('chào mới', null)).toEqual({ vi: 'chào mới', en: '' })
    })

    it('defaults vi to empty string for a falsy new text', () => {
        expect(wrapLocalizedText('', { vi: 'chào', en: 'hello' })).toEqual({ vi: '', en: 'hello' })
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
})
