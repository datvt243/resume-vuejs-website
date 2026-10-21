/**
 * Map between this app's CV data and the open JSON Resume format
 * (https://jsonresume.org/schema, v1.0.0) so a CV can be taken to other
 * JSON Resume themes/tools and brought back in.
 */

import { getLocalizedText } from '@/utilities/index'
import { t } from '@/i18n'

type Lang = 'vi' | 'en'
type AnyRecord = Record<string, any>

export const JSON_RESUME_SCHEMA = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json'

/** Epoch ms → `YYYY-MM-DD` in local time (the app stores dates picked as local dates). */
export const toIsoDate = (ms: unknown): string | undefined => {
    if (ms === null || ms === undefined || ms === '' || !Number.isFinite(Number(ms))) return undefined
    const d = new Date(Number(ms))
    if (Number.isNaN(d.getTime())) return undefined
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** `YYYY`, `YYYY-MM` or `YYYY-MM-DD` (the formats JSON Resume allows) → local epoch ms, or null. */
export const fromIsoDate = (value: unknown): number | null => {
    if (typeof value !== 'string') return null
    const m = value.trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/)
    if (!m) return null
    const d = new Date(Number(m[1]), m[2] ? Number(m[2]) - 1 : 0, m[3] ? Number(m[3]) : 1)
    return Number.isNaN(d.getTime()) ? null : d.getTime()
}

/** CKEditor HTML → plain text, keeping paragraph/list breaks as newlines. */
export const htmlToText = (html: string): string => {
    if (!html) return ''
    if (!/<[a-z][\s\S]*>/i.test(html)) return html.trim()
    const withBreaks = html.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, '\n')
    const doc = new DOMParser().parseFromString(withBreaks, 'text/html')
    return (doc.body.textContent || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n')
}

const compact = <T extends AnyRecord>(obj: T): T => {
    const result: AnyRecord = {}
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null || value === '') continue
        if (Array.isArray(value) && !value.length) continue
        result[key] = value
    }
    return result as T
}

/**
 * Build a JSON Resume document from the same data the CV preview renders
 * (`cvData` in PagePreview.vue, already filtered by the active profile).
 * Localized fields use `lang`, falling back to the other language.
 */
export const toJsonResume = (data: AnyRecord, lang: Lang = 'vi', socialMedia: AnyRecord = {}): AnyRecord => {
    const text = (value: unknown) => htmlToText(getLocalizedText(value as any, lang))
    const gi = data.generalInformation || {}
    const range = (item: AnyRecord, isOpenEnded: boolean) => ({
        startDate: toIsoDate(item.startDate),
        endDate: isOpenEnded ? undefined : toIsoDate(item.endDate),
    })

    const profiles = [
        { network: 'GitHub', url: socialMedia.github },
        { network: 'LinkedIn', url: socialMedia.linkedin },
    ].filter(p => p.url)

    return {
        $schema: JSON_RESUME_SCHEMA,
        basics: compact({
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            label: gi.positionDesired,
            email: data.email,
            phone: data.phone,
            url: socialMedia.website,
            summary: text(data.introduction),
            location: data.address ? { address: data.address } : undefined,
            profiles,
        }),
        work: (data.experiences || []).map((e: AnyRecord) =>
            compact({ name: e.company, position: e.position, ...range(e, e.isCurrent), summary: text(e.description) }),
        ),
        education: (data.educations || []).map((e: AnyRecord) =>
            compact({ institution: e.school, area: e.major, ...range(e, e.isCurrent) }),
        ),
        projects: (data.projects || []).map((p: AnyRecord) =>
            compact({
                name: p.name,
                description: text(p.description),
                ...range(p, p.isWorking),
                url: p.link,
                roles: p.position ? [p.position] : [],
                keywords: String(p.technology || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
            }),
        ),
        awards: (data.awards || []).map((a: AnyRecord) =>
            compact({ title: a.name, awarder: a.organization, date: toIsoDate(a.issueDate), summary: text(a.description) }),
        ),
        certificates: (data.certificates || []).map((c: AnyRecord) =>
            compact({ name: c.name, issuer: c.organization, date: toIsoDate(c.startDate) }),
        ),
        references: (data.references || []).map((r: AnyRecord) =>
            compact({ name: r.fullName, reference: [r.position, r.company].filter(Boolean).join(' — ') }),
        ),
        meta: { version: 'v1.0.0', lastModified: new Date().toISOString() },
    }
}

/**
 * Pull the `education`/`work` entries out of a JSON Resume document into
 * the same `{ educations, experiences }` shape the backend's LinkedIn/PDF
 * parse endpoints return, so the import page's review-before-save flow
 * can take it unchanged. Throws on anything that isn't a JSON Resume.
 */
export const fromJsonResume = (json: unknown): { educations: AnyRecord[]; experiences: AnyRecord[] } => {
    if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error(t('importCv.invalidJsonResume'))
    const doc = json as AnyRecord
    const work = Array.isArray(doc.work) ? doc.work : []
    const education = Array.isArray(doc.education) ? doc.education : []
    if (!work.length && !education.length && !doc.basics) throw new Error(t('importCv.invalidJsonResume'))

    const dates = (item: AnyRecord) => {
        const startDate = fromIsoDate(item.startDate)
        const endDate = fromIsoDate(item.endDate)
        // JSON Resume marks an ongoing entry by leaving endDate out
        return { startDate, endDate, isCurrent: !!startDate && !endDate }
    }

    const experiences = work
        .filter((w: unknown) => w && typeof w === 'object')
        .map((w: AnyRecord) => {
            const highlights = Array.isArray(w.highlights) ? w.highlights.filter(Boolean) : []
            const description = [w.summary, ...highlights.map((h: string) => `- ${h}`)].filter(Boolean).join('\n')
            // `company` is the pre-1.0 name of `name`
            return { company: w.name || w.company || '', position: w.position || '', ...dates(w), description }
        })

    const educations = education
        .filter((e: unknown) => e && typeof e === 'object')
        .map((e: AnyRecord) => ({
            school: e.institution || '',
            major: e.area || e.studyType || '',
            ...dates(e),
            description: Array.isArray(e.courses) ? e.courses.filter(Boolean).join(', ') : '',
        }))

    return { educations, experiences }
}
