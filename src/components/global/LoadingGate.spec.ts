import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import LoadingGate from './LoadingGate.vue'

function mountGate(spinner: unknown, props: Record<string, unknown> = {}) {
    return mount(LoadingGate, {
        props,
        slots: { default: '<p class="empty">Chưa có dữ liệu</p>' },
        global: { provide: { spinner, toast: null } },
    })
}

describe('LoadingGate', () => {
    it('shows the skeleton, not the empty state, while the spinner is loading', async () => {
        const spinner = ref({ isLoading: true })
        const wrapper = mountGate(spinner)
        expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
        expect(wrapper.find('.empty').exists()).toBe(false)

        spinner.value = { isLoading: false }
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.empty').exists()).toBe(true)
    })

    it('falls back to the slot when no spinner is mounted yet', () => {
        expect(mountGate(ref(null)).find('.empty').exists()).toBe(true)
    })
    it('form variant keeps the slot mounted but hidden while loading, so the form keeps its watchers', async () => {
        const spinner = ref({ isLoading: true })
        const wrapper = mountGate(spinner, { variant: 'form' })
        expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
        expect(wrapper.find('.empty').exists()).toBe(true)
        expect((wrapper.find('.empty').element.parentElement as HTMLElement).style.display).toBe('none')

        spinner.value = { isLoading: false }
        await wrapper.vm.$nextTick()
        expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)
        expect((wrapper.find('.empty').element.parentElement as HTMLElement).style.display).toBe('')
    })
})
