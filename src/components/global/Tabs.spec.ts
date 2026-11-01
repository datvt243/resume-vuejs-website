import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tabs from './Tabs.vue'

const TABS = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
]

function mountTabs(modelValue = 'a') {
    return mount(Tabs, {
        props: { modelValue, tabs: TABS },
        slots: { a: '<p>panel A</p>', b: '<p>panel B</p>' },
    })
}

describe('Tabs', () => {
    it('shows only the selected panel, wired to its tab', () => {
        const wrapper = mountTabs()
        const [a, b] = wrapper.findAll('[role="tab"]')
        expect(a.attributes('aria-selected')).toBe('true')
        expect(b.attributes('tabindex')).toBe('-1')
        const panel = wrapper.find('[role="tabpanel"]')
        expect(panel.text()).toBe('panel A')
        expect(panel.attributes('aria-labelledby')).toBe(a.attributes('id'))
        expect(a.attributes('aria-controls')).toBe(panel.attributes('id'))
    })

    it('click and arrow keys (wrapping) select a tab', async () => {
        const wrapper = mountTabs()
        await wrapper.findAll('[role="tab"]')[1].trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])

        await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowLeft' })
        expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['b'])
        await wrapper.findAll('[role="tab"]')[1].trigger('keydown', { key: 'ArrowRight' })
        expect(wrapper.emitted('update:modelValue')?.[2]).toEqual(['a'])
    })
})
