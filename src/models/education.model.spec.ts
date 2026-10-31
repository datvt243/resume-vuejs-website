import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import MODEL from './education.model'

const major = MODEL.find(f => f.name === 'major')!.valid!(yup)

describe('education major', () => {
    // the API rejects majors shorter than 3 characters with a 400
    it('rejects fewer than 3 characters', () => {
        expect(major.isValidSync('QA')).toBe(false)
        expect(major.isValidSync('CNTT')).toBe(true)
    })
})
