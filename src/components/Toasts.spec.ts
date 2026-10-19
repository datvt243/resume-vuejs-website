import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toasts from './Toasts.vue'

// DESIGN.md §5.9: auto-dismiss after 4s, polite live region, real close button.

function mountToasts(props: Record<string, unknown> = {}) {
    return mount(Toasts, {
        props,
        global: { stubs: { FontAwesomeIcon: true } },
    })
}

describe('Toasts', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('starts hidden', () => {
        const wrapper = mountToasts()
        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('show() makes it visible', async () => {
        const wrapper = mountToasts({ content: 'hello' })
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.toast').classes()).toContain('show')
        expect(wrapper.find('.toast-body').text()).toBe('hello')
    })

    it('auto-hides after 4000ms', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).toContain('show')

        vi.advanceTimersByTime(4000)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('does not hide before the 4000ms delay elapses', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()

        vi.advanceTimersByTime(3999)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.toast').classes()).toContain('show')
    })

    it('calling show() again resets the auto-hide timer (a new toast message gets a fresh full window)', async () => {
        const wrapper = mountToasts()
        const vm = wrapper.vm as unknown as { show: () => void }
        vm.show()
        await wrapper.vm.$nextTick()

        vi.advanceTimersByTime(3000) // 3s into the first 4s window
        vm.show() // new message arrives — should restart the countdown
        await wrapper.vm.$nextTick()

        vi.advanceTimersByTime(3000) // 6s total elapsed, but only 3s since the reset
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).toContain('show') // would be hidden already if the timer hadn't reset

        vi.advanceTimersByTime(1000) // now 4s since the reset
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('clicking the dismiss button hides it immediately', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).toContain('show')

        await wrapper.find('button[aria-label="Đóng thông báo"]').trigger('click')

        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('announces politely from a live region that stays mounted', () => {
        const wrapper = mountToasts()
        const region = wrapper.find('[aria-live]')
        expect(region.attributes('aria-live')).toBe('polite')
        expect(region.attributes('role')).toBe('status')
    })

    it('unmounting while visible does not throw (clears its pending timer)', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()

        expect(() => wrapper.unmount()).not.toThrow()
    })
})
