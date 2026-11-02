import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import MODEL from './education.model'
import REFERENCE from './reference.model'
import GENERAL from './generalInformation.model'

const schemaOf = (model: typeof MODEL, name: string) => model.find(f => f.name === name)!.valid!(yup)
const major = schemaOf(MODEL, 'major')

describe('education major', () => {
    // the API rejects majors shorter than 3 characters with a 400
    it('rejects fewer than 3 characters', () => {
        expect(major.isValidSync('QA')).toBe(false)
        expect(major.isValidSync('CNTT')).toBe(true)
    })
})

describe('education school/major EN fields', () => {
    const majorEn = schemaOf(MODEL, 'major_en')
    const schoolEn = schemaOf(MODEL, 'school_en')

    it('are optional: an empty EN input passes even though VI has a minimum', () => {
        expect(majorEn.isValidSync('')).toBe(true)
        expect(schoolEn.isValidSync('')).toBe(true)
    })

    it('still apply the VI length rules once filled', () => {
        expect(majorEn.isValidSync('CS')).toBe(false)
        expect(majorEn.isValidSync('Computer Science')).toBe(true)
        expect(schoolEn.isValidSync('a'.repeat(101))).toBe(false)
    })

    it('keep VI required', () => {
        expect(schemaOf(MODEL, 'school').isValidSync('')).toBe(false)
        expect(major.isValidSync('')).toBe(false)
    })
})

// length rules the API enforces, so a too-short or too-long value fails in the form, not as a 400
describe.each([
    ['reference fullName', schemaOf(REFERENCE, 'fullName'), 3, 50],
    ['general workLocation', schemaOf(GENERAL, 'workLocation'), 3, 100],
])('%s', (_, schema, min, max) => {
    it(`accepts ${min}-${max} characters only`, () => {
        expect(schema.isValidSync('a'.repeat(min - 1))).toBe(false)
        expect(schema.isValidSync('a'.repeat(min))).toBe(true)
        expect(schema.isValidSync('a'.repeat(max))).toBe(true)
        expect(schema.isValidSync('a'.repeat(max + 1))).toBe(false)
    })
})
