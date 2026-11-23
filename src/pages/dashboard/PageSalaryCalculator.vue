<script setup>
/**
 * Gross ↔ Net salary calculator (issue #404). Reference only: the amount starts at
 * General information's `salaryDesiredFrom` (gross) and nothing here is ever saved.
 * Law values + maths: `src/utilities/salaryVn.ts`.
 */

import { computed, ref, watch } from 'vue'
import { component as VueNumber } from '@coders-tm/vue-number-format'
import { candidateStore } from '@/stores/candidate'
import { useCandidate } from '@/composables/useCandidate'
import { SALARY_VN, grossToNet, netToGross } from '@/utilities/salaryVn'
import { t, uiLocale } from '@/i18n'

const candidate = candidateStore()
// fetches General information into the store when nothing has loaded it yet (read-only GET)
useCandidate({ field: 'generalInformation', collection: 'general-information' })
const savedSalary = computed(() => candidate.getGeneralInformation?.salaryDesiredFrom)

const direction = ref('gross')
const DIRECTIONS = computed(() => [
    { value: 'gross', label: t('salary.grossToNet') },
    { value: 'net', label: t('salary.netToGross') },
])
const REGIONS = [1, 2, 3, 4]

const amount = ref('')
const dependents = ref(0)
const region = ref(1)

// App.vue's candidate fetch can land after mount; stop following it once the user types
let edited = false
watch(savedSalary, v => !edited && (amount.value = typeof v === 'number' && v > 0 ? v : ''), { immediate: true })
// VueNumber sends `input:model-value` per keystroke, `update:model-value` only on change/blur
function onAmount(v) {
    edited = true
    amount.value = v === '' ? '' : +v
}
// keep the same salary when flipping direction: the amount becomes the other side of the current result
function setDirection(d) {
    if (d === direction.value) return
    const r = result.value
    direction.value = d
    if (!r) return
    edited = true
    amount.value = Math.round(d === 'net' ? r.net : r.gross)
}

const result = computed(() => {
    const value = Number(amount.value)
    if (amount.value === '' || !Number.isFinite(value) || value <= 0) return null
    const input = { dependents: Math.min(20, Math.max(0, Math.trunc(dependents.value) || 0)), region: region.value }
    return direction.value === 'gross' ? grossToNet({ gross: value, ...input }) : netToGross({ net: value, ...input })
})

const vnd = new Intl.NumberFormat('vi-VN')
const money = n => `${vnd.format(Math.round(n))} đ`
const pct = r => new Intl.NumberFormat(uiLocale.value, { style: 'percent', maximumFractionDigits: 1 }).format(r)

const rows = computed(() => {
    const r = result.value
    if (!r) return []
    const { rates } = SALARY_VN
    return [
        { label: t('salary.gross'), value: r.gross, strong: true },
        { label: t('salary.bhxh', { rate: pct(rates.bhxh) }), value: -r.bhxh },
        { label: t('salary.bhyt', { rate: pct(rates.bhyt) }), value: -r.bhyt },
        { label: t('salary.bhtn', { rate: pct(rates.bhtn) }), value: -r.bhtn },
        { label: t('salary.insurance'), value: -r.insurance },
        { label: t('salary.personalDeduction'), value: r.personalDeduction },
        { label: t('salary.dependentDeduction', { count: r.dependentDeduction / SALARY_VN.dependentDeduction }), value: r.dependentDeduction },
        { label: t('salary.taxable'), value: r.taxable },
        { label: t('salary.pit'), value: -r.pit },
        { label: t('salary.net'), value: r.net, strong: true },
    ]
})

const numberFormat = { decimal: ',', separator: '.', suffix: ' đ', precision: 0, masked: false }
</script>

<template>
    <div class="max-w-4xl space-y-6">
        <Heading :level="1" :text="t('salary.title')" :description="t('salary.description')" />

        <FormSection :title="t('salary.inputs')" :description="t('salary.inputsDescription')">
            <div class="space-y-4 pb-4">
                <SegmentedControl :model-value="direction" @update:model-value="setDirection" :options="DIRECTIONS" :aria-label="t('salary.direction')" />
                <div>
                    <label for="salary-amount" class="form-label">{{ direction === 'gross' ? t('salary.grossAmount') : t('salary.netAmount') }}</label>
                    <VueNumber id="salary-amount" :model-value="amount" v-bind="numberFormat" class="form-control" inputmode="numeric" autocomplete="off" @input:model-value="onAmount" @update:model-value="onAmount" />
                    <p v-if="!savedSalary" class="form-text mb-0">
                        {{ t('salary.noSavedSalary') }}
                        <RouterLink to="/dashboard/general-information" class="text-accent underline">{{ t('nav.generalInformation') }}</RouterLink>
                    </p>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label for="salary-dependents" class="form-label">{{ t('salary.dependents') }}</label>
                        <input id="salary-dependents" v-model.number="dependents" type="number" min="0" max="20" step="1" inputmode="numeric" class="form-control" />
                    </div>
                    <div>
                        <label for="salary-region" class="form-label">{{ t('salary.region') }}</label>
                        <select id="salary-region" v-model.number="region" class="form-control">
                            <option v-for="r in REGIONS" :key="r" :value="r">{{ t('salary.regionOption', { n: r }) }}</option>
                        </select>
                        <p class="form-text mb-0">{{ t('salary.regionHint') }}</p>
                    </div>
                </div>
            </div>
        </FormSection>

        <FormSection :title="t('salary.breakdown')" :description="t('salary.valuesAsOf', { date: SALARY_VN.effectiveFrom })" :card="false">
            <div v-if="result" class="overflow-x-auto rounded-md border border-line bg-surface">
                <table class="w-full text-sm">
                    <tbody>
                        <tr v-for="row in rows" :key="row.label" class="h-10 border-b border-line last:border-0">
                            <th scope="row" class="px-4 text-left" :class="row.strong ? 'font-semibold text-fg' : 'font-normal text-fg-2'">{{ row.label }}</th>
                            <td class="px-4 text-right tabular-nums" :class="row.strong ? 'font-semibold text-fg' : 'text-fg'">{{ money(row.value) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <NoData v-else icon="fa-solid fa-calculator" :title="t('salary.emptyTitle')" :description="t('salary.emptyDescription')" />
        </FormSection>
    </div>
</template>
