import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { component as VueNumber } from '@coders-tm/vue-number-format'
import SegmentedControl from '@/components/global/SegmentedControl.vue'
import PageSalaryCalculator from './PageSalaryCalculator.vue'
import { candidateStore } from '@/stores/candidate'
import { setUiLang } from '@/i18n'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({ handleBase: (...args: unknown[]) => handleBaseMock(...args) }))
const axiosMock = vi.fn()
vi.mock('@/services/axios', () => ({ default: (...args: unknown[]) => axiosMock(...args) }))

const stubs = {
    Heading: { props: ['text'], template: '<h1>{{ text }}</h1>' },
    FormSection: { props: ['title', 'description'], template: '<section><h2>{{ title }}</h2><p>{{ description }}</p><slot /></section>' },
    NoData: { props: ['title', 'description'], template: '<div class="stub-nodata">{{ title }} {{ description }}</div>' },
    RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
    FontAwesomeIcon: true,
}

function mountPage(generalInformation: Record<string, unknown> = {}) {
    setActivePinia(createPinia())
    candidateStore().setCandidate({ generalInformation })
    return mount(PageSalaryCalculator, { global: { stubs, components: { SegmentedControl } } })
}

const netCell = (wrapper: ReturnType<typeof mountPage>) => wrapper.findAll('tr').at(-1)!.find('td').text()

describe('PageSalaryCalculator (issue #404)', () => {
    beforeEach(() => {
        handleBaseMock.mockReset()
        axiosMock.mockReset()
        setUiLang('vi')
    })

    it('starts from the saved gross salaryDesiredFrom and shows its net', async () => {
        const wrapper = mountPage({ salaryDesiredFrom: 30_000_000, salaryDesiredTo: 40_000_000 })
        await flushPromises()

        expect(wrapper.findComponent(VueNumber).props('modelValue')).toBe(30_000_000)
        expect(netCell(wrapper)).toBe('26.215.000 đ')
        expect(wrapper.find('a[href="/dashboard/general-information"]').exists()).toBe(false)
    })

    it('editing the amount recalculates without a request and leaves General information unchanged', async () => {
        const wrapper = mountPage({ salaryDesiredFrom: 30_000_000 })
        wrapper.findComponent(VueNumber).vm.$emit('update:model-value', 15_000_000)
        await flushPromises()

        expect(netCell(wrapper)).toBe('13.425.000 đ')
        expect(handleBaseMock).not.toHaveBeenCalled()
        expect(axiosMock).not.toHaveBeenCalled()
        expect(candidateStore().getGeneralInformation.salaryDesiredFrom).toBe(30_000_000)
    })

    it('Net → Gross keeps the same salary: the amount becomes its net, the table its gross', async () => {
        const wrapper = mountPage({ salaryDesiredFrom: 30_000_000 })
        await wrapper.findAll('button[role="radio"]').find(b => b.text() === 'Net → Gross')!.trigger('click')

        expect(wrapper.findComponent(VueNumber).props('modelValue')).toBe(26_215_000)
        expect(wrapper.find('tr td').text()).toBe('30.000.000 đ')

        wrapper.findComponent(VueNumber).vm.$emit('input:model-value', '13425000')
        await flushPromises()
        expect(wrapper.find('tr td').text()).toBe('15.000.000 đ')
    })

    it('without a saved salary: empty amount, empty state and a link to General information', async () => {
        const wrapper = mountPage()
        await flushPromises()

        expect(wrapper.findComponent(VueNumber).props('modelValue')).toBe('')
        expect(wrapper.find('table').exists()).toBe(false)
        expect(wrapper.find('.stub-nodata').exists()).toBe(true)
        expect(wrapper.find('a[href="/dashboard/general-information"]').exists()).toBe(true)
        expect(wrapper.text()).not.toContain('NaN')
    })

    it('translates labels when the app language switches to English', async () => {
        const wrapper = mountPage({ salaryDesiredFrom: 30_000_000 })
        setUiLang('en')
        await flushPromises()

        expect(wrapper.text()).toContain('Personal income tax')
        expect(wrapper.text()).not.toContain('Thuế TNCN')
    })
})
