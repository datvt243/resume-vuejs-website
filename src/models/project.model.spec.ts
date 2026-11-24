import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import model from './project.model'

// same schema VeeForm builds from the model
const schema = yup.object(Object.fromEntries(model.map(f => [f.name, f.valid?.(yup)])))
const field = (name: string) => model.find(f => f.name === name)!
const valid = (values: Record<string, any>, name: string) => schema.validateAt(name, values).then(() => true, () => false)

describe('project model — type / linked experience', () => {
    it('defaults to personal, with company/personal options', () => {
        expect(field('type').default).toBe('personal')
        expect(field('type').options!.map(o => o.value)).toEqual(['company', 'personal'])
    })

    it('shows the experience select only for a company project', () => {
        expect(field('experienceId').showIf!({ type: 'personal' })).toBe(false)
        expect(field('experienceId').showIf!({ type: 'company' })).toBe(true)
    })

    it('requires an experience only for a company project', async () => {
        await expect(schema.validateAt('experienceId', { type: 'company', experienceId: '' })).rejects.toThrow('validation.required')
        expect(await valid({ type: 'personal', experienceId: '' }, 'experienceId')).toBe(true)
        expect(await valid({ type: 'personal', experienceId: null }, 'experienceId')).toBe(true)
        expect(await valid({ type: 'company', experienceId: 'e1' }, 'experienceId')).toBe(true)
        expect(await valid({ type: 'other' }, 'type')).toBe(false)
    })
})

describe('project model — link (issue #410)', () => {
    it('is optional, but still checks the URL and length when filled', async () => {
        expect(await valid({ link: '' }, 'link')).toBe(true)
        expect(await valid({ link: '  ' }, 'link')).toBe(true)
        expect(await valid({ link: 'https://x.dev' }, 'link')).toBe(true)
        await expect(schema.validateAt('link', { link: 'abc' })).rejects.toThrow('validation.urlInvalid')
        await expect(schema.validateAt('link', { link: `https://x.dev/${'a'.repeat(100)}` })).rejects.toThrow('validation.maxChars')
    })
})
