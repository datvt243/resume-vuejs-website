import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VisitChart from './VisitChart.vue'

const series = (counts: number[]) => counts.map((count, i) => ({ bucket: `2026-10-${String(i + 1).padStart(2, '0')}`, count }))

describe('VisitChart', () => {
    it('draws one bar per non-zero bucket and one hit target per bucket', () => {
        const wrapper = mount(VisitChart, { props: { series: series([2, 0, 5]), interval: 'day' } })

        expect(wrapper.findAll('path.bar')).toHaveLength(2)
        expect(wrapper.findAll('rect[tabindex="0"]')).toHaveLength(3)
    })

    it('labels hit targets with bucket + count for screen readers', () => {
        const wrapper = mount(VisitChart, { props: { series: series([2, 0]), interval: 'day' } })

        const labels = wrapper.findAll('rect[tabindex="0"]').map(r => r.attributes('aria-label'))
        expect(labels).toEqual(['01/10: 2 lượt xem', '02/10: 0 lượt xem'])
    })

    it('shows a tooltip with the exact count on hover and hides it on leave', async () => {
        const wrapper = mount(VisitChart, { props: { series: series([2, 7]), interval: 'day' } })
        expect(wrapper.find('.chart-tooltip').exists()).toBe(false)

        await wrapper.findAll('rect[tabindex="0"]')[1].trigger('mouseenter')
        expect(wrapper.find('.chart-tooltip').text()).toContain('02/10')
        expect(wrapper.find('.chart-tooltip').text()).toContain('7')
        expect(wrapper.findAll('path.bar.dim')).toHaveLength(1)

        await wrapper.find('.visit-chart').trigger('mouseleave')
        expect(wrapper.find('.chart-tooltip').exists()).toBe(false)
    })

    it('rounds the y-axis max up to a whole-number step', () => {
        const wrapper = mount(VisitChart, { props: { series: series([13]), interval: 'day' } })

        const yLabels = wrapper.findAll('.grid text').map(t => t.text())
        expect(yLabels).toEqual(['0', '5', '10', '15', '20'])
    })

    it('thins x labels when 30 daily buckets would collide', () => {
        const wrapper = mount(VisitChart, { props: { series: series(Array(30).fill(1)), interval: 'day' } })

        const xLabels = wrapper.findAll('text[text-anchor="middle"]')
        expect(xLabels.length).toBeGreaterThan(1)
        expect(xLabels.length).toBeLessThan(30)
    })

    it('handles an empty series without NaN geometry', () => {
        const wrapper = mount(VisitChart, { props: { series: series([0, 0]), interval: 'day' } })

        expect(wrapper.findAll('path.bar')).toHaveLength(0)
        expect(wrapper.html()).not.toContain('NaN')
    })
})
