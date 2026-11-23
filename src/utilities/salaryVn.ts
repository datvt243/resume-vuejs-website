/**
 * Vietnamese monthly salary Gross ↔ Net (employee side, resident, labor
 * contract) for the salary calculator (issue #404). Pure: no Vue, no i18n.
 */

export type Region = 1 | 2 | 3 | 4

/**
 * Every legal value the calculator uses — update here when the law changes.
 * - Rates: Luật BHXH 58/2024/QH15, Luật BHYT, Luật Việc làm (BHXH 8%, BHYT 1.5%, BHTN 1%)
 * - Base salary 2,530,000 from 01/07/2026: Nghị định 161/2026/NĐ-CP (BHXH/BHYT cap = 20×)
 * - Regional minimum wages from 01/01/2026: Nghị định 293/2025/NĐ-CP (BHTN cap = 20×);
 *   01/01/2027 values (Nghị định 399/2026) are issue #509
 * - Family deduction: Nghị quyết 110/2025/UBTVQH15
 * - PIT brackets on monthly taxable salary: Luật Thuế TNCN 109/2025/QH15, Điều 9
 */
export const SALARY_VN = {
    effectiveFrom: '01/07/2026',
    rates: { bhxh: 0.08, bhyt: 0.015, bhtn: 0.01 },
    baseSalary: 2_530_000,
    regionalMinWage: { 1: 5_310_000, 2: 4_730_000, 3: 4_140_000, 4: 3_700_000 } as Record<Region, number>,
    capMultiplier: 20,
    personalDeduction: 15_500_000,
    dependentDeduction: 6_200_000,
    // `upTo` is inclusive: taxable exactly on an edge pays the lower rate
    pitBrackets: [
        { upTo: 10_000_000, rate: 0.05 },
        { upTo: 30_000_000, rate: 0.1 },
        { upTo: 60_000_000, rate: 0.2 },
        { upTo: 100_000_000, rate: 0.3 },
        { upTo: Infinity, rate: 0.35 },
    ],
}

export interface SalaryInput {
    dependents?: number
    region?: Region
}

export interface SalaryBreakdown {
    gross: number
    bhxh: number
    bhyt: number
    bhtn: number
    insurance: number
    personalDeduction: number
    dependentDeduction: number
    taxable: number
    pit: number
    net: number
}

/** Unrounded — round only for display. */
export function grossToNet({ gross, dependents = 0, region = 1 }: SalaryInput & { gross: number }): SalaryBreakdown {
    const { rates, baseSalary, regionalMinWage, capMultiplier, personalDeduction, dependentDeduction, pitBrackets } = SALARY_VN
    const healthBase = Math.min(gross, capMultiplier * baseSalary)
    const bhxh = healthBase * rates.bhxh
    const bhyt = healthBase * rates.bhyt
    const bhtn = Math.min(gross, capMultiplier * regionalMinWage[region]) * rates.bhtn
    const insurance = bhxh + bhyt + bhtn
    const dependentTotal = dependents * dependentDeduction
    const taxable = Math.max(0, gross - insurance - personalDeduction - dependentTotal)

    let pit = 0
    let lower = 0
    for (const { upTo, rate } of pitBrackets) {
        if (taxable <= lower) break
        pit += (Math.min(taxable, upTo) - lower) * rate
        lower = upTo
    }

    return { gross, bhxh, bhyt, bhtn, insurance, personalDeduction, dependentDeduction: dependentTotal, taxable, pit, net: gross - insurance - pit }
}

/**
 * Inverse of `grossToNet`. Net is strictly increasing in gross and
 * 0.58 × gross ≤ net ≤ gross, so the answer lies in [net, net / 0.5];
 * bisection runs to float precision rather than stopping at a tolerance.
 */
export function netToGross({ net, ...rest }: SalaryInput & { net: number }): SalaryBreakdown {
    let lo = net
    let hi = net / 0.5
    for (let i = 0; i < 200 && hi - lo > 1e-6; i++) {
        const mid = (lo + hi) / 2
        if (grossToNet({ gross: mid, ...rest }).net < net) lo = mid
        else hi = mid
    }
    return grossToNet({ gross: (lo + hi) / 2, ...rest })
}
