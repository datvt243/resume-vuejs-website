import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import MODEL from './education.model'
import REFERENCE from './reference.model'
import GENERAL from './generalInformation.model'
import { modalDefault as INFORMATION } from './information.model'
import EXPERIENCE from './experience.model'
import PROJECT from './project.model'
import CERTIFICATE from './certificate.model'
import AWARD from './award.model'

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
        expect(schoolEn.isValidSync('a'.repeat(256))).toBe(false)
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
    ['general positionDesired', schemaOf(GENERAL, 'positionDesired'), 1, 100],
    ['information firstName', schemaOf(INFORMATION, 'firstName'), 1, 15],
    ['information lastName', schemaOf(INFORMATION, 'lastName'), 1, 35],
    ['information address', schemaOf(INFORMATION, 'address'), 1, 255],
    ['education school', schemaOf(MODEL, 'school'), 1, 255],
    ['education major', major, 3, 255],
    ['project name', schemaOf(PROJECT, 'name'), 1, 50],
    ['project position', schemaOf(PROJECT, 'position'), 1, 100],
    ['certificate name', schemaOf(CERTIFICATE, 'name'), 1, 50],
    ['certificate organization', schemaOf(CERTIFICATE, 'organization'), 1, 50],
    ['award name', schemaOf(AWARD, 'name'), 1, 50],
    ['award organization', schemaOf(AWARD, 'organization'), 1, 50],
])('%s', (_, schema, min, max) => {
    it(`accepts ${min}-${max} characters only`, () => {
        expect(schema.isValidSync('a'.repeat(min - 1))).toBe(false)
        expect(schema.isValidSync('a'.repeat(min))).toBe(true)
        expect(schema.isValidSync('a'.repeat(max))).toBe(true)
        expect(schema.isValidSync('a'.repeat(max + 1))).toBe(false)
    })
})

describe('experience position', () => {
    const position = schemaOf(EXPERIENCE, 'position')
    it('accepts up to 100 characters', () => {
        expect(position.isValidSync('a'.repeat(100), { parent: {} } as any)).toBe(true)
        expect(position.isValidSync('a'.repeat(101), { parent: {} } as any)).toBe(false)
    })
})

// API requires a link of at most 100 characters
describe.each([
    ['project link', schemaOf(PROJECT, 'link')],
    ['award link', schemaOf(AWARD, 'link')],
])('%s', (_, schema) => {
    const url = 'https://a.co/' + 'a'.repeat(87)
    it('is required and max 100 characters', () => {
        expect(schema.isValidSync('')).toBe(false)
        expect(schema.isValidSync(url)).toBe(true)
        expect(schema.isValidSync(url + 'a')).toBe(false)
    })
})
