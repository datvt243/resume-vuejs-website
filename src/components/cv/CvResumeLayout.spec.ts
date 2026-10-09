import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CvResumeLayout from './CvResumeLayout.vue'

const data = {
    firstName: 'Dat',
    lastName: 'Vo',
    generalInformation: { career: 'IT', careerGoal: '<p>Goal <strong>A</strong></p>' },
    experiences: [{ _id: 'e1', company: 'ACME', description: '<p>Built <em>things</em></p><script>alert(1)</script>' }],
    awards: [{ _id: 'a1', name: 'Award', description: { vi: '<ul><li>Top</li></ul>', en: '' } }],
}

describe('CvResumeLayout', () => {
    it('renders CKEditor descriptions as HTML instead of raw tags', () => {
        const wrapper = mount(CvResumeLayout, { props: { data } })
        const html = wrapper.html()

        expect(wrapper.find('.cv-paragraph strong').text()).toBe('A')
        expect(wrapper.find('.cv-item-desc em').text()).toBe('things')
        expect(wrapper.find('.cv-item-desc li').text()).toBe('Top')
        expect(wrapper.text()).not.toContain('<p>')
        expect(html).not.toContain('&lt;p&gt;')
    })

    it('strips scripts from descriptions', () => {
        const wrapper = mount(CvResumeLayout, { props: { data } })
        expect(wrapper.find('script').exists()).toBe(false)
        expect(wrapper.html()).not.toContain('alert(1)')
    })
})
