import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from './Spinner.vue'

async function tick(wrapper: ReturnType<typeof mount>, seconds: number) {
    vi.advanceTimersByTime(seconds * 1000)
    await wrapper.vm.$nextTick()
}

describe('Spinner', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders nothing until show()', () => {
        const wrapper = mount(Spinner)
        expect(wrapper.find('.spinner-container').exists()).toBe(false)
    })

    it('shows only a plain spinner for the first 3 seconds, no cold-start notice', async () => {
        const wrapper = mount(Spinner)
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.spinner-container .spinner-border').exists()).toBe(true)
        expect(wrapper.find('.countdown-ring').exists()).toBe(false)
        expect(wrapper.text()).not.toContain('Server đang khởi động')

        await tick(wrapper, 2)
        expect(wrapper.text()).not.toContain('Server đang khởi động')
    })

    it('switches to the cold-start notice + countdown once the request has been pending 3 seconds', async () => {
        const wrapper = mount(Spinner)
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await tick(wrapper, 3)

        expect(wrapper.text()).toContain('Server đang khởi động, vui lòng đợi ~30 giây')
        expect(wrapper.find('.countdown-number').text()).toBe('27')
    })

    it('hide() before 3 seconds never shows the notice, and the next show() starts fresh', async () => {
        const wrapper = mount(Spinner)
        const vm = wrapper.vm as unknown as { show: () => void; hide: () => void }
        vm.show()
        await tick(wrapper, 1)
        vm.hide()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.spinner-container').exists()).toBe(false)

        await tick(wrapper, 5)
        vm.show()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.countdown-ring').exists()).toBe(false)
    })

    it('shows the overtime message after 30 seconds', async () => {
        const wrapper = mount(Spinner)
        ;(wrapper.vm as unknown as { show: () => void }).show()
        await tick(wrapper, 31)

        expect(wrapper.text()).toContain('Server khởi động lâu hơn dự kiến')
    })
})
