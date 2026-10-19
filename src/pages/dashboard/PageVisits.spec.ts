import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageVisits from './PageVisits.vue'
import Heading from '@/components/global/Heading.vue'
import { candidateStore } from '@/stores/candidate'

const interval = ref('day')
const stats = ref<any>(null)
vi.mock('@/composables/useVisitStats', () => ({
    useVisitStats: () => ({ interval, stats }),
    INTERVAL_LABELS: { day: 'ngày', week: 'tuần', month: 'tháng' },
}))

function mountPage() {
    return mount(PageVisits, {
        // Heading renders for real: the interval control lives in its actions slot
        global: { components: { Heading }, stubs: { VisitChart: true, NoData: true } },
    })
}

describe('PageVisits', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        interval.value = 'day'
        stats.value = null
    })

    it('renders no chart or breakdowns before stats arrive, but keeps the visit table', () => {
        const wrapper = mountPage()

        expect(wrapper.findComponent({ name: 'VisitChart' }).exists()).toBe(false)
        expect(wrapper.find('table').exists()).toBe(true)
        expect(wrapper.findAll('th').map(th => th.text())).toEqual(['Thời gian', 'Vị trí', 'Địa chỉ IP'])
    })

    it('shows the total and labels null source/country instead of leaving them blank', () => {
        stats.value = {
            interval: 'day',
            total: 4,
            series: [],
            sources: [
                { source: 'linkedin.com', count: 3 },
                { source: null, count: 1 },
            ],
            countries: [{ country: null, count: 4 }],
        }
        const wrapper = mountPage()
        const text = wrapper.text()

        expect(text).toContain('Lượt xem · 30 ngày')
        expect(text).toContain('Nguồn hàng đầu · 30 ngày')
        expect(text).toContain('linkedin.com')
        expect(text).toContain('(75%)')
        expect(text).toContain('Trực tiếp / không rõ')
        expect(text).toContain('Không rõ')
        expect(wrapper.findComponent({ name: 'VisitChart' }).exists()).toBe(true)
    })

    it('shows an empty message for a breakdown with no rows', () => {
        stats.value = { interval: 'day', total: 0, series: [], sources: [], countries: [] }
        const wrapper = mountPage()

        expect(wrapper.findAll('p').filter(p => p.text() === 'Chưa có lượt xem trong khoảng này.')).toHaveLength(2)
    })

    it('switches interval from the toggle', async () => {
        const wrapper = mountPage()

        await wrapper.find('[data-interval="week"]').trigger('click')

        expect(interval.value).toBe('week')
        expect(wrapper.find('[data-interval="week"]').attributes('aria-checked')).toBe('true')
        expect(wrapper.find('[data-interval="day"]').attributes('aria-checked')).toBe('false')
    })

    it('paginates the detail table 25 rows at a time and shows "—" for missing values', async () => {
        const visits = Array.from({ length: 30 }, (_, i) => ({
            _id: `v${i}`,
            createdAt: '2026-10-19T10:00:00.000Z',
            location: i === 0 ? '' : 'Hà Nội',
            ip: '1.2.3.4',
        }))
        candidateStore().setCandidateByField({ visits })
        const wrapper = mountPage()

        expect(wrapper.findAll('tbody tr')).toHaveLength(25)
        expect(wrapper.find('tbody tr').findAll('td')[1].text()).toBe('—')
        expect(wrapper.text()).toContain('1–25 trong 30')

        const next = wrapper.findAll('button').find(b => b.text() === 'Sau')!
        await next.trigger('click')

        expect(wrapper.findAll('tbody tr')).toHaveLength(5)
        expect(wrapper.text()).toContain('26–30 trong 30')
        expect(next.attributes('disabled')).toBeDefined()
    })
})
