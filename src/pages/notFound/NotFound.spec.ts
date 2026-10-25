import { describe, it, expect, afterEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import NotFound from './NotFound.vue'
import NoData from '@/components/global/NoData.vue'
import { i18n } from '@/i18n'

function mountPage() {
    return mount(NotFound, {
        global: { components: { NoData }, stubs: { FontAwesomeIcon: true, RouterLink: RouterLinkStub } },
    })
}

describe('NotFound', () => {
    afterEach(() => {
        i18n.global.locale.value = 'vi'
    })

    it('shows a translated empty state with a link back home', () => {
        const wrapper = mountPage()
        expect(wrapper.text()).toContain('Không tìm thấy trang')
        expect(wrapper.text()).not.toContain('404!!!')
        const link = wrapper.findComponent(RouterLinkStub)
        expect(link.props('to')).toBe('/')
        expect(link.text()).toBe('Về trang chủ')
    })

    it('follows the UI language', () => {
        i18n.global.locale.value = 'en'
        const wrapper = mountPage()
        expect(wrapper.text()).toContain('Page not found')
        expect(wrapper.findComponent(RouterLinkStub).text()).toBe('Back to home')
    })
})
