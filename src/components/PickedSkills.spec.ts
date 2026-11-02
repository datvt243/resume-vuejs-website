import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import MainSkills from './MainSkills.vue'
import Button from '@/components/global/Button.vue'
import FormSection from '@/components/global/FormSection.vue'

const hide = vi.fn()
// always-open modal so the picker body and footer render
const ModalStub = defineComponent({
    setup(_, { slots, expose }) {
        expose({ show: () => {}, hide })
        return () => h('div', [slots.default?.(), slots.footer?.()])
    },
})

const skills = [
    { name: 'Vue', group: 'Frontend' },
    { name: 'React', group: 'Frontend' },
    { name: 'Node', group: 'Backend' },
]

function mountComponent(save = vi.fn().mockResolvedValue(true), modelValue = [{ name: 'Vue' }]) {
    return mount(MainSkills, {
        props: { modelValue, skills, groups: ['Frontend', 'Backend'], max: 2, save },
        global: {
            components: { Button, FormSection },
            stubs: { Modal: ModalStub, NoData: { template: '<p class="no-data" />' }, FontAwesomeIcon: true },
            mocks: { $t: (key: string) => key },
        },
    })
}

const names = (wrapper: ReturnType<typeof mountComponent>) => wrapper.findAll('label').map(l => l.find('span').text())

describe('MainSkills picker', () => {
    it('filters by group and searches by name', async () => {
        const wrapper = mountComponent()
        await wrapper.find('select').setValue('Frontend')
        expect(names(wrapper)).toEqual(['Vue', 'React'])
        await wrapper.find('input[type=search]').setValue('rea')
        expect(names(wrapper)).toEqual(['React'])
    })

    it('starts from the saved selection, caps it at max and saves the names', async () => {
        const save = vi.fn().mockResolvedValue(true)
        const wrapper = mountComponent(save)
        await wrapper.findAll('button').find(b => b.text() === 'common.add')!.trigger('click')

        const boxes = () => wrapper.findAll('input[type=checkbox]')
        expect(boxes().map(b => (b.element as HTMLInputElement).checked)).toEqual([true, false, false])
        await boxes()[2].trigger('change')
        expect(boxes().map(b => (b.element as HTMLInputElement).disabled)).toEqual([false, true, false])

        await wrapper.findAll('button').find(b => b.text() === 'common.save')!.trigger('click')
        await flushPromises()
        expect(save).toHaveBeenCalledWith([{ name: 'Vue' }, { name: 'Node' }])
        expect(hide).toHaveBeenCalled()
    })

    it('× on a badge saves the list without that skill', async () => {
        const save = vi.fn().mockResolvedValue(true)
        const wrapper = mountComponent(save, [{ name: 'Vue' }, { name: 'Node' }])
        await wrapper.find('button[aria-label="generalInfo.deleteSkill"]').trigger('click')
        expect(save).toHaveBeenCalledWith([{ name: 'Node' }])
    })

    it('keeps the picker open when the save fails', async () => {
        hide.mockClear()
        const wrapper = mountComponent(vi.fn().mockResolvedValue(false))
        await wrapper.findAll('button').find(b => b.text() === 'common.save')!.trigger('click')
        await flushPromises()
        expect(hide).not.toHaveBeenCalled()
    })

    it('boxes the empty state only when there are no main skills', () => {
        const empty = mountComponent(vi.fn(), [])
        const box = empty.findAll('.no-data')[0].element.parentElement!
        expect(box.className).toContain('border border-line')
        expect(box.tagName).toBe('DIV')

        const filled = mountComponent(vi.fn(), [{ name: 'Vue' }])
        expect(filled.find('ul li').text()).toContain('Vue')
        // the picker's own "no match" state lives in the modal, outside the section
        expect(filled.findAll('.border-line .no-data')).toHaveLength(0)
    })
})
