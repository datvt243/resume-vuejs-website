import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import FrmDatePicker from './FrmDatePicker.vue'

describe('FrmDatePicker', () => {
    it('points its label at the real date input and labels the clear button in the UI language', async () => {
        const wrapper = mount(FrmDatePicker, { props: { name: 'startDate', label: 'field.startDate' }, global: { stubs: { FontAwesomeIcon: true } } })
        await flushPromises()
        const label = wrapper.find('label')

        expect(label.text()).toBe('Ngày bắt đầu')
        expect(wrapper.find(`#${label.attributes('for')}`).element.tagName).toBe('INPUT')
        expect(wrapper.find('[aria-label="Xóa ngày"]').exists()).toBe(true)
    })
})
