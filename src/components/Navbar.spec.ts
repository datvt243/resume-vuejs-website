import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'

// Vue-native rewrite (node `tailwindcss-dropdown-toast-navbar`) — the
// mobile collapse toggle used to work only as a side effect of
// Dropdown.vue/Toasts.vue importing Bootstrap JS elsewhere in the
// bundle; now it's self-contained.

describe('Navbar', () => {
    it('starts collapsed', () => {
        const wrapper = mount(Navbar, { slots: { default: '<li>link</li>' } })
        expect(wrapper.find('.navbar-collapse').classes()).not.toContain('show')
        expect(wrapper.find('.navbar-toggler').attributes('aria-expanded')).toBe('false')
    })

    it('expands on toggler click', async () => {
        const wrapper = mount(Navbar, { slots: { default: '<li>link</li>' } })
        await wrapper.find('.navbar-toggler').trigger('click')

        expect(wrapper.find('.navbar-collapse').classes()).toContain('show')
        expect(wrapper.find('.navbar-toggler').attributes('aria-expanded')).toBe('true')
    })

    it('collapses again on a second click', async () => {
        const wrapper = mount(Navbar, { slots: { default: '<li>link</li>' } })
        const toggler = wrapper.find('.navbar-toggler')
        await toggler.trigger('click')
        await toggler.trigger('click')

        expect(wrapper.find('.navbar-collapse').classes()).not.toContain('show')
        expect(wrapper.find('.navbar-toggler').attributes('aria-expanded')).toBe('false')
    })

    it('renders slot content inside the collapse region', () => {
        const wrapper = mount(Navbar, { slots: { default: '<li data-testid="link">link</li>' } })
        expect(wrapper.find('[data-testid="link"]').exists()).toBe(true)
    })
})
