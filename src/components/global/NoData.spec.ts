import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoData from './NoData.vue'

describe('NoData', () => {
    it('draws its own dashed box, so callers must not wrap it in another bordered box', () => {
        const wrapper = mount(NoData, { global: { stubs: { FontAwesomeIcon: true } } })
        expect(wrapper.classes()).toEqual(expect.arrayContaining(['rounded-md', 'border', 'border-dashed', 'border-line']))
        expect(wrapper.text()).toContain('Chưa có dữ liệu')
    })
})
