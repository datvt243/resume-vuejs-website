import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageVisits from './PageVisits.vue'

const interval = ref('day')
const stats = ref<any>(null)
vi.mock('@/composables/useVisitStats', () => ({
    useVisitStats: () => ({ interval, stats }),
    INTERVAL_LABELS: { day: 'ngày', week: 'tuần', month: 'tháng' },
}))

function mountPage() {
    return mount(PageVisits, {
        global: { stubs: { TableDefault: true, VisitChart: true, Heading: true } },
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
        expect(wrapper.findComponent({ name: 'TableDefault' }).exists()).toBe(true)
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

        expect(text).toContain('4 lượt xem trong 30 ngày gần nhất')
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
        expect(wrapper.find('[data-interval="week"]').classes()).toContain('btn-primary')
    })
})
