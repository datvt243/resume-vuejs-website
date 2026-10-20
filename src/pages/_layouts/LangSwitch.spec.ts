import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

describe('LangSwitch', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetModules()
    })

    async function mountSwitch() {
        const { i18n } = await import('@/i18n')
        const SegmentedControl = (await import('@/components/global/SegmentedControl.vue')).default
        const LangSwitch = (await import('./LangSwitch.vue')).default
        const { useCvLang } = await import('@/composables/useCvLang')
        const wrapper = mount(LangSwitch, { global: { plugins: [i18n], components: { SegmentedControl }, stubs: { FontAwesomeIcon: true } } })
        return { wrapper, useCvLang }
    }

    it('sets the shared CV/UI language and relabels the tooltip', async () => {
        const { wrapper, useCvLang } = await mountSwitch()
        expect(wrapper.find('[role="tooltip"]').text()).toContain('ngôn ngữ CV')

        await wrapper.findAll('[role="radio"]')[1].trigger('click')
        await flushPromises()

        expect(useCvLang().selectedLang.value).toBe('en')
        expect(wrapper.find('[role="tooltip"]').text()).toContain('CV language')
    })

    it('info button names the tooltip as its description', async () => {
        const { wrapper } = await mountSwitch()
        const info = wrapper.find('button[aria-describedby]')
        expect(info.attributes('aria-label')).toBeTruthy()
        expect(wrapper.find(`#${info.attributes('aria-describedby')}`).attributes('role')).toBe('tooltip')
    })
})
