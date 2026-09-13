import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Dropdown from './Dropdown.vue'

// Vue-native rewrite (node `tailwindcss-dropdown-toast-navbar`) dropped
// Bootstrap's `Dropdown` JS class — these are the first real tests this
// component has ever had, covering exactly the interactive behavior a
// live browser session would otherwise need to check (open/close toggle,
// click-outside, Escape, click-inside-item-closes).

// `attachTo: document.body` would be the normal way to make the wrapper
// reachable by `document`-level listeners (onDocClick/onKeydown), but
// @vue/test-utils@2.4.11's attachTo path calls the Vue-3.5+-only
// `app.onUnmount()` API — this repo pins vue@^3.4.29 (resolved 3.4.31,
// predates 3.5), so attachTo throws `app.onUnmount is not a function`.
// Attach manually instead: same effect (the wrapper's root element is a
// real child of `document.body`, so clicks/keydowns bubble all the way
// to `document`), without touching the broken code path.
function mountDropdown(props: Record<string, unknown> = {}) {
    const wrapper = mount(Dropdown, {
        props,
        slots: {
            default: '<li class="dropdown-item" data-testid="item">Item</li>',
        },
        global: {
            stubs: { FontAwesomeIcon: true },
        },
    })
    document.body.appendChild(wrapper.element)
    return wrapper
}

describe('Dropdown', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('starts closed', () => {
        const wrapper = mountDropdown()
        expect(wrapper.find('.dropdown').classes()).not.toContain('show')
        expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show')
    })

    it('opens on toggle click and STAYS open (not immediately re-closed by the same click bubbling to the new document listener)', async () => {
        const wrapper = mountDropdown()
        await wrapper.find('button').trigger('click')
        expect(wrapper.find('.dropdown').classes()).toContain('show')
        expect(wrapper.find('.dropdown-menu').classes()).toContain('show')
    })

    it('closes on a second toggle click', async () => {
        const wrapper = mountDropdown()
        const btn = wrapper.find('button')
        await btn.trigger('click')
        expect(wrapper.find('.dropdown').classes()).toContain('show')
        await btn.trigger('click')
        expect(wrapper.find('.dropdown').classes()).not.toContain('show')
    })

    it('closes on a click outside the component', async () => {
        const wrapper = mountDropdown()
        await wrapper.find('button').trigger('click')
        expect(wrapper.find('.dropdown').classes()).toContain('show')

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.dropdown').classes()).not.toContain('show')
    })

    it('closes on Escape', async () => {
        const wrapper = mountDropdown()
        await wrapper.find('button').trigger('click')
        expect(wrapper.find('.dropdown').classes()).toContain('show')

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.dropdown').classes()).not.toContain('show')
    })

    it('closes when a slotted menu item is clicked', async () => {
        const wrapper = mountDropdown()
        await wrapper.find('button').trigger('click')
        expect(wrapper.find('.dropdown').classes()).toContain('show')

        await wrapper.find('[data-testid="item"]').trigger('click')

        expect(wrapper.find('.dropdown').classes()).not.toContain('show')
    })

    it('split mode renders both the label button and a separate caret toggle, caret opens the menu', async () => {
        const wrapper = mountDropdown({ split: true })
        const buttons = wrapper.findAll('button')
        expect(buttons.length).toBe(2) // label button + split caret toggle

        await buttons[1].trigger('click') // the caret toggle is the split-specific button
        expect(wrapper.find('.dropdown').classes()).toContain('show')
    })

    it('unmounting while open does not throw (cleans up its document listeners)', async () => {
        const wrapper = mountDropdown()
        await wrapper.find('button').trigger('click')
        expect(() => wrapper.unmount()).not.toThrow()

        // a stray listener would still react to this and throw/mutate a
        // destroyed component's refs — dispatching after unmount is the
        // real regression guard
        expect(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))).not.toThrow()
    })
})
