import { describe, it, expect } from 'vitest'
import { compareEntries, compareProjects } from './sectionOrder'

const ids = (list: Record<string, any>[], cmp: typeof compareEntries) => [...list].sort(cmp).map(e => e._id)

describe('compareProjects (#406)', () => {
    it('puts company before personal (no type = personal), newest first in each group', () => {
        const list = [
            { _id: 'personal24', type: 'personal', startDate: Date.UTC(2024, 0) },
            { _id: 'company20', type: 'company', startDate: Date.UTC(2020, 0) },
            { _id: 'company23', type: 'company', startDate: Date.UTC(2023, 0) },
            { _id: 'none25', startDate: Date.UTC(2025, 0) },
        ]
        expect(ids(list, compareProjects)).toEqual(['company23', 'company20', 'none25', 'personal24'])
    })

    it('lets the manual order win over type and date', () => {
        const list = [
            { _id: 'a', type: 'company', startDate: 300, order: 2 },
            { _id: 'b', type: 'personal', startDate: 100, order: 0 },
            { _id: 'c', type: 'company', startDate: 200, order: 1 },
        ]
        expect(ids(list, compareProjects)).toEqual(['b', 'c', 'a'])
    })

    it('lists entries without an order after the ordered ones', () => {
        const list = [
            { _id: 'newCompany', type: 'company', startDate: 999 },
            { _id: 'o1', type: 'personal', startDate: 1, order: 1 },
            { _id: 'o0', type: 'personal', startDate: 2, order: 0 },
        ]
        expect(ids(list, compareProjects)).toEqual(['o0', 'o1', 'newCompany'])
    })

    it('sorts a missing startDate last within its group, and breaks equal orders by type then date', () => {
        expect(ids([{ _id: 'noDate', type: 'company' }, { _id: 'dated', type: 'company', startDate: 5 }], compareProjects)).toEqual(['dated', 'noDate'])
        const tied = [
            { _id: 'p', type: 'personal', startDate: 9, order: 0 },
            { _id: 'c', type: 'company', startDate: 1, order: 0 },
        ]
        expect(ids(tied, compareProjects)).toEqual(['c', 'p'])
    })
})

describe('compareEntries (#442)', () => {
    it('uses the order, then newest first, ignoring type', () => {
        const list = [
            { _id: 'old', startDate: 1 },
            { _id: 'new', type: 'company', startDate: 9 },
            { _id: 'ordered', startDate: 0, order: 0 },
        ]
        expect(ids(list, compareEntries)).toEqual(['ordered', 'new', 'old'])
    })

    it('falls back to issueDate / appliedDate', () => {
        expect(ids([{ _id: 'a', issueDate: 1 }, { _id: 'b', appliedDate: 2 }], compareEntries)).toEqual(['b', 'a'])
    })
})
