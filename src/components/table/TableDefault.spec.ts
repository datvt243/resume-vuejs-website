import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import TableDefault from './TableDefault.vue'

const settings = [
    { name: 'name', label: 'Kỹ năng', type: 'text' },
    { name: 'exp', label: 'Năm kinh nghiệm', type: 'number' },
]

function mountTable(modelValue: object[], extra: object = {}) {
    return mount(TableDefault, {
        props: { modelValue, settings, colControl: 'none', ...extra },
        global: { stubs: { FontAwesomeIcon: true, NoData: { template: '<p class="no-data">empty</p>' } } },
        slots: { tbodyMore: ({ doc }: { doc: { index: number } }) => h('td', { class: 'idx' }, String(doc.index)) },
    })
}

const bodyCol = (wrapper: ReturnType<typeof mountTable>, n: number) =>
    wrapper.findAll('tbody tr').map(tr => tr.findAll('td')[n].text())

describe('TableDefault', () => {
    it('renders NoData in a single spanning row when empty', () => {
        const wrapper = mountTable([])
        expect(wrapper.findAll('tbody tr')).toHaveLength(1)
        expect(wrapper.find('tbody td').attributes('colspan')).toBe('999')
        expect(wrapper.find('.no-data').exists()).toBe(true)
    })

    it('keeps header labels as given, right-aligns number columns, shows "—" for empty values', () => {
        const wrapper = mountTable([{ _id: '1', name: '', exp: 3 }])
        expect(wrapper.findAll('thead th').map(th => th.text())).toEqual(['#', 'Kỹ năng', 'Năm kinh nghiệm'])
        expect(wrapper.findAll('thead th')[2].classes()).toContain('text-right')
        expect(bodyCol(wrapper, 1)).toEqual(['—'])
        expect(wrapper.findAll('tbody td')[2].classes()).toContain('tabular-nums')
    })

    it('sorts asc → desc → off with aria-sort, and tbodyMore still gets the original index', async () => {
        const data = [
            { _id: 'a', name: 'Vue', exp: 2 },
            { _id: 'b', name: 'Go', exp: 10 },
            { _id: 'c', name: 'Rust', exp: 1 },
        ]
        const wrapper = mountTable(data)
        const expTh = () => wrapper.findAll('thead th')[2]

        expect(expTh().attributes('aria-sort')).toBe('none')
        await expTh().find('button').trigger('click')
        expect(expTh().attributes('aria-sort')).toBe('ascending')
        expect(bodyCol(wrapper, 2)).toEqual(['1', '2', '10']) // numeric, not "1, 10, 2"
        expect(wrapper.findAll('.idx').map(td => td.text())).toEqual(['2', '0', '1'])

        await expTh().find('button').trigger('click')
        expect(expTh().attributes('aria-sort')).toBe('descending')
        expect(bodyCol(wrapper, 2)).toEqual(['10', '2', '1'])

        await expTh().find('button').trigger('click')
        expect(expTh().attributes('aria-sort')).toBe('none')
        expect(bodyCol(wrapper, 1)).toEqual(['Vue', 'Go', 'Rust'])
    })

    it('paginates by pageSize with a range label and disabled ends', async () => {
        const data = Array.from({ length: 5 }, (_, i) => ({ _id: String(i), name: `n${i}`, exp: i }))
        const wrapper = mountTable(data, { pageSize: 2 })
        const [prev, next] = wrapper.findAll('footer button')

        expect(wrapper.findAll('tbody tr')).toHaveLength(2)
        expect(wrapper.find('footer').text()).toContain('1–2 trong 5 · Trang 1 / 3')
        expect(prev.attributes('disabled')).toBeDefined()

        await next.trigger('click')
        await next.trigger('click')
        expect(bodyCol(wrapper, 0)).toEqual(['5'])
        expect(wrapper.find('footer').text()).toContain('5–5 trong 5 · Trang 3 / 3')
        expect(next.attributes('disabled')).toBeDefined()
    })

    it('hides the pager when everything fits on one page', () => {
        expect(mountTable([{ _id: '1', name: 'a', exp: 1 }]).find('footer').exists()).toBe(false)
    })
})
