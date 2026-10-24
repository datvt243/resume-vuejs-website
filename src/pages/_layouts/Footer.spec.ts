import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { i18n } from '@/i18n'
import Footer from './Footer.vue'

describe('Footer', () => {
    it('translates the copyright line and keeps the link', async () => {
        const wrapper = mount(Footer, { global: { plugins: [i18n] } })
        const year = new Date().getFullYear()
        expect(wrapper.text()).toBe(`bản quyền thuộc về tôi © ${year}`)
        expect(wrapper.find('a').attributes('href')).toBe('https://github.com/datvt243')

        i18n.global.locale.value = 'en'
        await nextTick()
        expect(wrapper.text()).toBe(`copyright by me © ${year}`)
        i18n.global.locale.value = 'vi'
    })
})
