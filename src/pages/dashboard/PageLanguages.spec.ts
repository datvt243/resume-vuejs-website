import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageLanguages from './PageLanguages.vue'
import { i18n } from '@/i18n'
import { candidateStore } from '@/stores/candidate'

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ generalInformation: ref([]), getData: vi.fn(), loadError: ref(false) }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button @click="$emit(\'click\')">{{ text }}</button>' },
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: { template: '<div class="no-data"><slot /></div>' },
    VeeFormGeneralInformationUpdate: { template: '<form class="edit-form" />' },
}

function mountPage(foreignLanguages: unknown[]) {
    setActivePinia(createPinia())
    candidateStore().setCandidateByField({ generalInformation: { _id: 'g1', foreignLanguages } })
    return mount(PageLanguages, { global: { plugins: [i18n], stubs } })
}
const button = (wrapper: ReturnType<typeof mountPage>, text: string) => wrapper.findAll('button').find(b => b.text() === text)!

describe('PageLanguages — view / edit', () => {
    it('shows a read-only list with translated levels, and Sửa / Đóng toggle the edit form', async () => {
        const wrapper = mountPage([
            { language: 'English', level: 'advanced' },
            { language: 'Japanese', level: 'N3' },
        ])
        expect(wrapper.findAll('li').map(li => li.text())).toEqual(['EnglishKhá', 'JapaneseN3'])
        expect(wrapper.find('.edit-form').exists()).toBe(false)

        await button(wrapper, 'Sửa').trigger('click')
        expect(wrapper.find('.edit-form').exists()).toBe(true)
        expect(wrapper.find('li').exists()).toBe(false)

        await button(wrapper, 'Đóng').trigger('click')
        expect(wrapper.find('.edit-form').exists()).toBe(false)
        expect(wrapper.findAll('li')).toHaveLength(2)
    })

    it('empty list shows NoData whose add button opens the edit form', async () => {
        const wrapper = mountPage([])
        expect(wrapper.find('.no-data').exists()).toBe(true)
        expect(wrapper.findAll('button').some(b => b.text() === 'Sửa')).toBe(false)

        await button(wrapper, 'Thêm').trigger('click')
        expect(wrapper.find('.edit-form').exists()).toBe(true)
    })
})
