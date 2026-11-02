import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageVisits from './PageVisits.vue'
import Heading from '@/components/global/Heading.vue'
import SegmentedControl from '@/components/global/SegmentedControl.vue'
import Button from '@/components/global/Button.vue'
import { candidateStore } from '@/stores/candidate'

const interval = ref('day')
const stats = ref<any>(null)
const loadError = ref(false)
const reloadStats = vi.fn()
const confirmDelete = vi.fn()
vi.mock('@/lib/swal.lib', () => ({ confirmDelete: (opts: unknown) => confirmDelete(opts) }))
const handleBase = vi.fn()
vi.mock('@/services/base', () => ({ handleBase: (...args: unknown[]) => handleBase(...args) }))
vi.mock('@/composables/useVisitStats', () => ({
    useVisitStats: () => ({ interval, stats, loadError, getData: reloadStats }),
}))

function mountPage() {
    return mount(PageVisits, {
        // Heading renders for real: the interval control lives in its actions slot
        global: { components: { Heading, SegmentedControl, Button }, stubs: { VisitChart: true, NoData: true, FontAwesomeIcon: true } },
    })
}

describe('PageVisits', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        interval.value = 'day'
        stats.value = null
        loadError.value = false
        reloadStats.mockReset()
        confirmDelete.mockReset()
        handleBase.mockReset()
    })

    it('shows an error with a retry instead of zeros when a load failed, retrying only what failed', async () => {
        const reloadVisits = vi.fn()
        candidateStore().setCandidateByField({ visitsLoadError: true })
        const wrapper = mount(PageVisits, {
            global: {
                components: { Heading, SegmentedControl },
                stubs: { VisitChart: true, NoData: { template: '<div><slot /></div>' }, Button: { template: '<button />' } },
                provide: { reloadVisits },
            },
        })

        expect(wrapper.find('[role="alert"]').exists()).toBe(true)
        expect(wrapper.find('table').exists()).toBe(false)
        await wrapper.find('[role="alert"] button').trigger('click')
        expect(reloadVisits).toHaveBeenCalledTimes(1)
        expect(reloadStats).not.toHaveBeenCalled()
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

        const radio = (label: string) => wrapper.findAll('[role="radio"]').find(b => b.text() === label)!
        await radio('Theo tuần').trigger('click')

        expect(interval.value).toBe('week')
        expect(radio('Theo tuần').attributes('aria-checked')).toBe('true')
        expect(radio('Theo ngày').attributes('aria-checked')).toBe('false')
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

    describe('delete all', () => {
        const visits = [{ _id: 'v1', createdAt: '2026-10-19T10:00:00.000Z', location: 'Hà Nội', ip: '1.2.3.4' }]
        const deleteButton = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('button').find(b => b.text() === 'Xóa tất cả')!

        function mountWithVisits(reloadVisits = vi.fn()) {
            candidateStore().setCandidateByField({ visits })
            return mount(PageVisits, {
                global: { components: { Heading, SegmentedControl, Button }, stubs: { VisitChart: true, NoData: true, FontAwesomeIcon: true }, provide: { reloadVisits } },
            })
        }

        it('confirms, then hard-deletes and reloads the visit list and the stats', async () => {
            confirmDelete.mockImplementation(({ callback }) => callback())
            handleBase.mockImplementation(async (_opt, _props, cb) => cb({ data: { deletedCount: 1 } }))
            const reloadVisits = vi.fn()
            await deleteButton(mountWithVisits(reloadVisits)).trigger('click')

            expect(confirmDelete.mock.calls[0][0].getHtml()).toContain('vĩnh viễn')
            expect(handleBase.mock.calls[0][0]).toEqual({ method: 'delete', url: 'candidate/visits' })
            expect(reloadVisits).toHaveBeenCalledTimes(1)
            expect(reloadStats).toHaveBeenCalledTimes(1)
        })

        it('does not call the API when the confirm is cancelled', async () => {
            await deleteButton(mountWithVisits()).trigger('click')

            expect(confirmDelete).toHaveBeenCalledTimes(1)
            expect(handleBase).not.toHaveBeenCalled()
        })

        it('keeps the data when the API fails (callback never runs)', async () => {
            confirmDelete.mockImplementation(({ callback }) => callback())
            handleBase.mockResolvedValue(undefined)
            const reloadVisits = vi.fn()
            await deleteButton(mountWithVisits(reloadVisits)).trigger('click')

            expect(reloadVisits).not.toHaveBeenCalled()
            expect(reloadStats).not.toHaveBeenCalled()
        })

        it('is disabled with no visits', () => {
            expect(deleteButton(mountPage()).attributes('disabled')).toBeDefined()
        })
    })
})
