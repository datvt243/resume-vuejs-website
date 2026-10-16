import { describe, it, expect } from 'vitest'
import { toJsonResume, fromJsonResume, toIsoDate, fromIsoDate, htmlToText, JSON_RESUME_SCHEMA } from './jsonResume'

const local = (y: number, m: number, d = 1) => new Date(y, m - 1, d).getTime()

const cvData = {
    firstName: 'Đạt',
    lastName: 'Võ',
    email: 'dat@example.com',
    phone: '0900000000',
    address: 'TP.HCM',
    introduction: { vi: 'Giới thiệu', en: 'About me' },
    generalInformation: { positionDesired: 'Frontend Developer' },
    experiences: [
        { company: 'Acme', position: 'Dev', startDate: local(2020, 1, 15), endDate: local(2022, 6, 30), isCurrent: false, description: { vi: '<p>Làm A</p><ul><li>B</li></ul>', en: '<p>Did A</p>' } },
        { company: 'Now Co', position: 'Lead', startDate: local(2022, 7, 1), endDate: local(2023, 1, 1), isCurrent: true, description: '' },
    ],
    educations: [{ school: 'HCMUS', major: 'CS', startDate: local(2015, 9, 1), endDate: local(2019, 6, 1), isCurrent: false, description: 'Khá' }],
    projects: [{ name: 'Resume', position: 'Owner', technology: 'Vue, Vite ,', startDate: local(2024, 1, 1), isWorking: true, link: 'https://x.dev', description: 'CV app' }],
    awards: [{ name: 'Best', organization: 'Org', issueDate: local(2021, 3, 4), description: '' }],
    certificates: [{ name: 'AWS', organization: 'Amazon', startDate: local(2023, 5, 6) }],
    references: [{ fullName: 'Ms. A', company: 'Acme', position: 'CTO', phone: '0911' }],
}

describe('date helpers', () => {
    it('toIsoDate formats local dates and skips empty values', () => {
        expect(toIsoDate(local(2020, 1, 5))).toBe('2020-01-05')
        expect(toIsoDate(null)).toBeUndefined()
        expect(toIsoDate('')).toBeUndefined()
        expect(toIsoDate('abc')).toBeUndefined()
    })

    it('fromIsoDate accepts YYYY, YYYY-MM and YYYY-MM-DD', () => {
        expect(fromIsoDate('2020')).toBe(local(2020, 1, 1))
        expect(fromIsoDate('2020-03')).toBe(local(2020, 3, 1))
        expect(fromIsoDate('2020-03-09')).toBe(local(2020, 3, 9))
        expect(fromIsoDate('soon')).toBeNull()
        expect(fromIsoDate(undefined)).toBeNull()
    })
})

describe('htmlToText', () => {
    it('strips tags and keeps paragraph/list breaks', () => {
        expect(htmlToText('<p>Làm A</p><ul><li>B</li><li>C &amp; D</li></ul>')).toBe('Làm A\nB\nC & D')
        expect(htmlToText('  plain  ')).toBe('plain')
        expect(htmlToText('')).toBe('')
    })
})

describe('toJsonResume', () => {
    it('maps every section to JSON Resume v1.0.0 fields', () => {
        const r = toJsonResume(cvData, 'vi', { github: 'https://github.com/x', website: 'https://x.dev' })

        expect(r.$schema).toBe(JSON_RESUME_SCHEMA)
        expect(r.basics).toEqual({
            name: 'Đạt Võ',
            label: 'Frontend Developer',
            email: 'dat@example.com',
            phone: '0900000000',
            url: 'https://x.dev',
            summary: 'Giới thiệu',
            location: { address: 'TP.HCM' },
            profiles: [{ network: 'GitHub', url: 'https://github.com/x' }],
        })
        expect(r.work).toEqual([
            { name: 'Acme', position: 'Dev', startDate: '2020-01-15', endDate: '2022-06-30', summary: 'Làm A\nB' },
            { name: 'Now Co', position: 'Lead', startDate: '2022-07-01' },
        ])
        expect(r.education).toEqual([{ institution: 'HCMUS', area: 'CS', startDate: '2015-09-01', endDate: '2019-06-01' }])
        expect(r.projects).toEqual([
            { name: 'Resume', description: 'CV app', startDate: '2024-01-01', url: 'https://x.dev', roles: ['Owner'], keywords: ['Vue', 'Vite'] },
        ])
        expect(r.awards).toEqual([{ title: 'Best', awarder: 'Org', date: '2021-03-04' }])
        expect(r.certificates).toEqual([{ name: 'AWS', issuer: 'Amazon', date: '2023-05-06' }])
        expect(r.references).toEqual([{ name: 'Ms. A', reference: 'CTO — Acme' }])
        expect(r.meta.version).toBe('v1.0.0')
    })

    it('uses the English text when lang is en, falling back to Vietnamese', () => {
        const r = toJsonResume({ ...cvData, introduction: { vi: 'Chỉ VI', en: '' } }, 'en')
        expect(r.work[0].summary).toBe('Did A')
        expect(r.basics.summary).toBe('Chỉ VI')
    })

    it('handles an empty CV without throwing', () => {
        const r = toJsonResume({})
        expect(r.basics).toEqual({})
        expect(r.work).toEqual([])
        expect(r.education).toEqual([])
    })
})

describe('fromJsonResume', () => {
    it('maps work/education into the import-page shape', () => {
        const parsed = fromJsonResume({
            work: [
                { name: 'Acme', position: 'Dev', startDate: '2020-01', endDate: '2022-06', summary: 'Built X', highlights: ['Led Y', ''] },
                { company: 'Old Schema Co', position: 'Intern', startDate: '2019' },
            ],
            education: [{ institution: 'HCMUS', studyType: 'Bachelor', startDate: '2015-09-01', courses: ['Algo', 'DB'] }],
        })

        expect(parsed.experiences).toEqual([
            { company: 'Acme', position: 'Dev', startDate: local(2020, 1), endDate: local(2022, 6), isCurrent: false, description: 'Built X\n- Led Y' },
            { company: 'Old Schema Co', position: 'Intern', startDate: local(2019, 1), endDate: null, isCurrent: true, description: '' },
        ])
        expect(parsed.educations).toEqual([
            { school: 'HCMUS', major: 'Bachelor', startDate: local(2015, 9, 1), endDate: null, isCurrent: true, description: 'Algo, DB' },
        ])
    })

    it('round-trips work/education exported by toJsonResume', () => {
        const parsed = fromJsonResume(JSON.parse(JSON.stringify(toJsonResume(cvData))))
        expect(parsed.experiences.map(e => [e.company, e.position, e.startDate, e.isCurrent])).toEqual([
            ['Acme', 'Dev', local(2020, 1, 15), false],
            ['Now Co', 'Lead', local(2022, 7, 1), true],
        ])
        expect(parsed.educations[0]).toMatchObject({ school: 'HCMUS', major: 'CS', startDate: local(2015, 9, 1), endDate: local(2019, 6, 1) })
    })

    it('rejects things that are not a JSON Resume', () => {
        expect(() => fromJsonResume(null)).toThrow('JSON Resume')
        expect(() => fromJsonResume([1, 2])).toThrow('JSON Resume')
        expect(() => fromJsonResume({ foo: 'bar' })).toThrow('JSON Resume')
    })

    it('accepts a basics-only resume with no entries', () => {
        expect(fromJsonResume({ basics: { name: 'X' } })).toEqual({ educations: [], experiences: [] })
    })
})
