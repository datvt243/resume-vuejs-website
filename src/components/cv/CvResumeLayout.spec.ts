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
    describe('lang', () => {
        const bilingual = {
            firstName: 'Dat',
            introduction: { vi: 'Giới thiệu', en: 'About me' },
            generalInformation: { career: { vi: 'CNTT', en: 'IT' }, levelCurrent: 'teamLeader', careerGoal: { vi: '<p>Mục tiêu</p>', en: '<p>Goal</p>' } },
            experiences: [{ _id: 'e1', company: 'ACME', isCurrent: true, description: { vi: '<p>Mô tả</p>', en: '<p>Desc</p>' } }],
        }

        it('defaults to the Vietnamese text and labels', () => {
            const wrapper = mount(CvResumeLayout, { props: { data: bilingual } })
            const text = wrapper.text()
            expect(text).toContain('Giới thiệu')
            expect(text).toContain('Ngành nghề: CNTT')
            expect(text).toContain('Trưởng nhóm')
            expect(text).toContain('Kinh nghiệm')
            expect(text).toContain('Hiện tại')
            expect(wrapper.find('.cv-item-desc').text()).toBe('Mô tả')
        })

        it('renders the English text, section titles and option labels for lang="en"', () => {
            const wrapper = mount(CvResumeLayout, { props: { data: bilingual, lang: 'en' } })
            const text = wrapper.text()
            expect(text).toContain('About me')
            expect(text).toContain('Career: IT')
            expect(text).toContain('Team Leader')
            expect(text).toContain('Experience')
            expect(text).toContain('Present')
            expect(wrapper.find('.cv-paragraph').text()).toBe('Goal')
            expect(wrapper.find('.cv-item-desc').text()).toBe('Desc')
            expect(text).not.toContain('Mô tả')
        })

        it('falls back to the Vietnamese text when the English copy is empty', () => {
            const data = { firstName: 'Dat', introduction: { vi: 'Giới thiệu', en: '' } }
            const wrapper = mount(CvResumeLayout, { props: { data, lang: 'en' } })
            expect(wrapper.find('.cv-introduction').text()).toBe('Giới thiệu')
        })
    })
})
