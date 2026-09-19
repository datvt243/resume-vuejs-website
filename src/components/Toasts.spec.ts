import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toasts from './Toasts.vue'

// Vue-native rewrite (node `tailwindcss-dropdown-toast-navbar`) dropped
// Bootstrap's `Toast` JS class (which handled show/hide + the 5s
// autohide timer internally) — these are the first real tests this
// component has ever had.

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

    it('auto-hides after 5000ms (Bootstrap Toast default delay)', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).toContain('show')

        vi.advanceTimersByTime(5000)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('does not hide before the 5000ms delay elapses', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()

        vi.advanceTimersByTime(4999)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.toast').classes()).toContain('show')
    })

    it('calling show() again resets the auto-hide timer (a new toast message gets a fresh full window)', async () => {
        const wrapper = mountToasts()
        const vm = wrapper.vm as unknown as { show: () => void }
        vm.show()
        await wrapper.vm.$nextTick()

        vi.advanceTimersByTime(3000) // 3s into the first 5s window
        vm.show() // new message arrives — should restart the countdown
        await wrapper.vm.$nextTick()

        vi.advanceTimersByTime(4000) // 7s total elapsed, but only 4s since the reset
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).toContain('show') // would be hidden already if the timer hadn't reset

        vi.advanceTimersByTime(1000) // now 5s since the reset
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('clicking the dismiss button hides it immediately', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.toast').classes()).toContain('show')

        await wrapper.find('[data-bs-dismiss="toast"]').trigger('click')

        expect(wrapper.find('.toast').classes()).not.toContain('show')
    })

    it('unmounting while visible does not throw (clears its pending timer)', async () => {
        const wrapper = mountToasts()
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()

        expect(() => wrapper.unmount()).not.toThrow()
    })
})
