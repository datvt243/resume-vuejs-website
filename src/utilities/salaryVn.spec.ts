import { describe, it, expect } from 'vitest'
import { grossToNet, netToGross } from './salaryVn'

// worked examples from doctrine/features/salary-calculator.md (region I, values from 01/07/2026)
const cases = [
    { gross: 15_000_000, dependents: 0, insurance: 1_575_000, pit: 0, net: 13_425_000 },
    { gross: 30_000_000, dependents: 0, insurance: 3_150_000, pit: 635_000, net: 26_215_000 },
    { gross: 60_000_000, dependents: 1, insurance: 5_407_000, pit: 3_078_600, net: 51_514_400 },
    { gross: 150_000_000, dependents: 2, insurance: 5_869_000, pit: 26_180_850, net: 117_950_150 },
]

describe('salaryVn (issue #404)', () => {
    it.each(cases)('gross $gross, $dependents dependents → net $net', ({ gross, dependents, insurance, pit, net }) => {
        const r = grossToNet({ gross, dependents })
        expect(Math.round(r.insurance)).toBe(insurance)
        expect(Math.round(r.pit)).toBe(pit)
        expect(Math.round(r.net)).toBe(net)
    })

    it.each(cases)('net $net, $dependents dependents → gross $gross', ({ gross, dependents, net }) => {
        expect(Math.abs(netToGross({ net, dependents }).gross - gross)).toBeLessThanOrEqual(1)
    })

    it('Gross → Net → Gross round-trips within 1 đ across a sweep, every region', () => {
        for (const region of [1, 2, 3, 4] as const) {
            for (let g = 1_000_000; g <= 300_000_000; g += 997_001) {
                const net = Math.round(grossToNet({ gross: g, dependents: 1, region }).net)
                expect(Math.abs(netToGross({ net, dependents: 1, region }).gross - g)).toBeLessThanOrEqual(1)
            }
        }
    })

    it('taxable exactly on a bracket edge pays the lower rate', () => {
        // below the caps insurance is 10.5%, so this gross leaves taxable 10,000,000
        const edge = grossToNet({ gross: (10_000_000 + 15_500_000) / 0.895 })
        expect(edge.taxable).toBeCloseTo(10_000_000, 4)
        expect(edge.pit).toBeCloseTo(500_000, 4)
    })

    it('BHTN cap follows the region', () => {
        expect(grossToNet({ gross: 200_000_000, region: 1 }).bhtn).toBe(1_062_000)
        expect(grossToNet({ gross: 200_000_000, region: 4 }).bhtn).toBe(740_000)
    })

    it('very large input stays finite', () => {
        const r = grossToNet({ gross: 10_000_000_000 })
        expect(Number.isFinite(r.net)).toBe(true)
        expect(Math.abs(netToGross({ net: r.net }).gross - 10_000_000_000)).toBeLessThanOrEqual(1)
    })
})
