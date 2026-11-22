import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import MODEL from './generalInformation.model'

// same schema VeeForm builds from the model
const schema = yup.object(Object.fromEntries(MODEL.map(f => [f.name, f.valid?.(yup)])))
const errorsOf = async (values: Record<string, unknown>) => {
    try {
        await schema.validateAt('salaryDesiredFrom', values)
        await schema.validateAt('salaryDesiredTo', values)
        return null
    } catch (e: any) {
        return { path: e.path, message: e.message }
    }
}

describe('generalInformation model — desired salary range', () => {
    it('has From / To currency fields and no single salaryDesired', () => {
        const names = MODEL.map(f => f.name)
        expect(names).not.toContain('salaryDesired')
        expect(MODEL.find(f => f.name === 'salaryDesiredFrom')?.type).toBe('currency')
        expect(MODEL.find(f => f.name === 'salaryDesiredTo')?.type).toBe('currency')
    })

    it('rejects To < From under To, accepts a range or equal ends', async () => {
        expect(await errorsOf({ salaryDesiredFrom: 2000, salaryDesiredTo: 1000 })).toEqual({ path: 'salaryDesiredTo', message: 'validation.salaryRange' })
        expect(await errorsOf({ salaryDesiredFrom: 1000, salaryDesiredTo: 2000 })).toBeNull()
        expect(await errorsOf({ salaryDesiredFrom: 1000, salaryDesiredTo: 1000 })).toBeNull()
    })

    it('requires both ends and positive values', async () => {
        expect(await errorsOf({ salaryDesiredFrom: '', salaryDesiredTo: 1000 })).toEqual({ path: 'salaryDesiredFrom', message: 'validation.required' })
        expect(await errorsOf({ salaryDesiredFrom: 1000, salaryDesiredTo: undefined })).toEqual({ path: 'salaryDesiredTo', message: 'validation.required' })
        expect(await errorsOf({ salaryDesiredFrom: 0, salaryDesiredTo: 1000 })).toEqual({ path: 'salaryDesiredFrom', message: 'validation.salaryPositive' })
        expect(await errorsOf({ salaryDesiredFrom: 1000, salaryDesiredTo: -5 })).toMatchObject({ path: 'salaryDesiredTo', message: 'validation.salaryPositive' })
    })
})
