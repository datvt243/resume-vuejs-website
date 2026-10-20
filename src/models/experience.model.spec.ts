import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import model, { experienceTitle, careerBreakPayload } from './experience.model'

// same schema VeeForm builds from the model
const schema = yup.object(Object.fromEntries(model.map(f => [f.name, f.valid?.(yup)])))
const base = { startDate: 1, endDate: 2, isCurrent: false, description: 'd' }

describe('experience model', () => {
    it('lets a career break skip company/position but requires a known type', async () => {
        expect(await schema.isValid({ ...base, isCareerBreak: true, careerBreakType: 'travel', company: '', position: '' })).toBe(true)
        expect(await schema.isValid({ ...base, isCareerBreak: true, careerBreakType: '' })).toBe(false)
        expect(await schema.isValid({ ...base, isCareerBreak: true, careerBreakType: 'vacation' })).toBe(false)
    })

    it('still requires company/position on a normal entry', async () => {
        expect(await schema.isValid({ ...base, isCareerBreak: false, company: '', position: '' })).toBe(false)
        expect(await schema.isValid({ ...base, company: 'ACME', position: 'Dev', careerBreakType: '' })).toBe(true)
    })

    it('builds the payload PageExperience sends', () => {
        expect(careerBreakPayload({ ...base, isCareerBreak: true, careerBreakType: 'travel', company: 'Old', position: 'Dev' })).toEqual({
            ...base,
            isCareerBreak: true,
            careerBreakType: 'travel',
            company: '',
            position: '',
        })
        expect(careerBreakPayload({ ...base, company: 'ACME', position: 'Dev', careerBreakType: 'travel' })).toEqual({
            ...base,
            isCareerBreak: false,
            careerBreakType: '',
            company: 'ACME',
            position: 'Dev',
        })
    })

    it('titles entries', () => {
        expect(experienceTitle({ company: 'ACME' })).toBe('ACME')
        expect(experienceTitle({ isCareerBreak: true, careerBreakType: 'layoff' })).toBe('Nghỉ việc tạm thời — Bị cắt giảm nhân sự')
        expect(experienceTitle({ isCareerBreak: true, careerBreakType: 'layoff' }, 'en')).toBe('Career break — Layoff or position eliminated')
        expect(experienceTitle({ isCareerBreak: true })).toBe('Nghỉ việc tạm thời')
    })
})
