import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CvResumeLayout from './CvResumeLayout.vue'

const data = {
    firstName: 'Dat',
    lastName: 'Vo',
    introduction: '<p>I am <strong>Dat</strong></p><script>alert(2)</script>',
    educations: [{ _id: 'ed1', school: 'HCMUT', description: '<p>Major <strong>CS</strong></p>' }],
    projects: [{ _id: 'p1', name: 'Resume', description: '<p><strong>Vue</strong></p>' }],
    certificates: [{ _id: 'c1', name: 'AWS', description: '<p><strong>SAA</strong></p>' }],
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
        expect(wrapper.find('.cv-introduction strong').text()).toBe('Dat')
        const descs = wrapper.findAll('.cv-item-desc').map(d => d.html())
        expect(descs.some(d => d.includes('<strong>CS</strong>'))).toBe(true)
        expect(descs.some(d => d.includes('<strong>Vue</strong>'))).toBe(true)
        expect(descs.some(d => d.includes('<strong>SAA</strong>'))).toBe(true)
        expect(wrapper.text()).not.toContain('<p>')
        expect(html).not.toContain('&lt;p&gt;')
    })

    it('strips scripts from descriptions', () => {
        const wrapper = mount(CvResumeLayout, { props: { data } })
        expect(wrapper.find('script').exists()).toBe(false)
        expect(wrapper.html()).not.toContain('alert(1)')
        expect(wrapper.html()).not.toContain('alert(2)')
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

    it('titles a career break by its type in the CV language', () => {
        const withBreak = { ...data, experiences: [{ _id: 'e2', isCareerBreak: true, careerBreakType: 'travel', company: '', position: '' }] }
        const titles = (lang: string) => mount(CvResumeLayout, { props: { data: withBreak, lang } }).findAll('.cv-item-title').map(t => t.text())
        expect(titles('vi')).toContain('Nghỉ việc tạm thời — Du lịch')
        expect(titles('en')).toContain('Career break — Travel')
    })

    it('lists experience newest first, career breaks included, whatever order the API returns', () => {
        const experiences = [
            { _id: 'a', company: 'JOBTEST', startDate: Date.UTC(2022, 1) },
            { _id: 'b', company: 'FASTCODING', startDate: Date.UTC(2014, 10) },
            { _id: 'c', company: 'Laidon', startDate: Date.UTC(2024, 11), isCurrent: true },
            { _id: 'd', isCareerBreak: true, careerBreakType: 'travel', startDate: Date.UTC(2024, 4) },
        ]
        const titles = mount(CvResumeLayout, { props: { data: { experiences } } }).findAll('.cv-item-title').map(t => t.text())
        expect(titles).toEqual(['Laidon', 'Nghỉ việc tạm thời — Du lịch', 'JOBTEST', 'FASTCODING'])
    })

    it('lists project technologies as text, trimmed, not as a raw array', () => {
        const projects = [
            { _id: 'p1', name: 'Resume', position: 'Owner', technology: ['Vue3', ' Pinia', ''] },
            { _id: 'p2', name: 'Blog', position: 'Dev', technology: [] },
        ]
        const subs = mount(CvResumeLayout, { props: { data: { ...data, projects } } }).findAll('.cv-item-sub').map(s => s.text())

        expect(subs).toContain('Owner · Vue3, Pinia')
        expect(subs).toContain('Dev')
        expect(subs.join('|')).not.toContain('Dev ·')
        expect(subs.join()).not.toContain('[')
    })

    it('lists company projects first, newest first, unless the user set an order, with no type headings (#406)', () => {
        const titles = (projects: Record<string, any>[]) =>
            mount(CvResumeLayout, { props: { data: { projects } } }).findAll('.cv-item-title').map(t => t.text())
        const personal = { _id: 'p1', name: 'Blog', type: 'personal', startDate: Date.UTC(2024, 0) }
        const company = { _id: 'p2', name: 'Shop', type: 'company', startDate: Date.UTC(2020, 0) }

        expect(titles([personal, company])).toEqual(['Shop', 'Blog'])
        expect(titles([{ ...personal, order: 0 }, { ...company, order: 1 }])).toEqual(['Blog', 'Shop'])
        const w = mount(CvResumeLayout, { props: { data: { projects: [personal, company] } } })
        expect(w.findAll('.cv-section-title').map(t => t.text())).toEqual(['Dự án'])
    })

    describe('skills and languages (#440)', () => {
        const withSkills = {
            firstName: 'Dat',
            generalInformation: {
                career: 'IT',
                mainSkills: [{ name: 'Vue' }],
                familiarSkills: [{ name: 'Go' }],
                professionalSkillsGroup: ['Frontend', 'Backend'],
                professionalSkills: [
                    { name: 'Vue', exp: 3, group: 'Frontend' },
                    { name: 'React', exp: 2, group: 'Frontend' },
                    { name: 'Go', exp: 1, group: 'Backend' },
                    { name: 'Docker', exp: 1 },
                ],
                personalSkills: [{ name: 'Teamwork' }],
                foreignLanguages: [
                    { language: 'English', level: 'advanced' },
                    { language: 'French', level: 'fluent' },
                    { language: 'German', level: '' },
                ],
            },
            educations: [{ _id: 'ed1', school: 'HCMUT' }],
            certificates: [{ _id: 'c1', name: 'AWS' }],
            references: [{ _id: 'r1', fullName: 'Ref' }],
        }
        const titles = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.cv-section-title').map(h => h.text())
        const sectionItems = (wrapper: ReturnType<typeof mount>, title: string) =>
            wrapper
                .findAll('.cv-section')
                .find(s => s.find('.cv-section-title').text() === title)!
                .findAll('li')
                .map(li => li.text())

        it('lists skill rows names-only, picked skills left out of their groups, and languages with the CV-language level', () => {
            const wrapper = mount(CvResumeLayout, { props: { data: withSkills } })
            expect(titles(wrapper)).toEqual(['Thông tin chung', 'Kỹ năng', 'Học vấn', 'Chứng chỉ', 'Ngoại ngữ', 'Người tham khảo'])
            expect(sectionItems(wrapper, 'Kỹ năng')).toEqual([
                'Kỹ năng chính: Vue',
                'Kỹ năng quen thuộc: Go',
                'Frontend: React',
                'Kỹ năng chuyên môn: Docker',
                'Kỹ năng cá nhân: Teamwork',
            ])
            expect(sectionItems(wrapper, 'Ngoại ngữ')).toEqual(['English (Khá)', 'French (fluent)', 'German'])
        })

        it('uses English labels and levels for lang="en"', () => {
            const wrapper = mount(CvResumeLayout, { props: { data: withSkills, lang: 'en' } })
            expect(sectionItems(wrapper, 'Skills')).toContain('Main skills: Vue')
            expect(sectionItems(wrapper, 'Skills')).toContain('Professional skills: Docker')
            expect(sectionItems(wrapper, 'Languages')).toContain('English (Advanced)')
        })

        it('hides both sections when every list is empty or missing', () => {
            const wrapper = mount(CvResumeLayout, { props: { data: { firstName: 'Dat', generalInformation: { career: 'IT', professionalSkillsGroup: ['Frontend'], foreignLanguages: [] } } } })
            expect(titles(wrapper)).toEqual(['Thông tin chung'])
        })
    })
})
