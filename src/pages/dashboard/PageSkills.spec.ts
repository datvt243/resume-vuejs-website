import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageSkills from './PageSkills.vue'
import { i18n } from '@/i18n'
import { candidateStore } from '@/stores/candidate'

vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ generalInformation: ref([{ _id: 'g1', professionalSkills: [{ name: 'Vue', group: 'FE' }], mainSkills: [] }]), getData: vi.fn() }),
}))
const updatePatchDoc = vi.fn()
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ updatePatchDoc: (...args: unknown[]) => updatePatchDoc(...args) }),
}))

const PickedStub = { name: 'PickedSkills', props: ['title', 'modelValue', 'skills', 'groups', 'max', 'save'], template: '<div />' }

function mountPage() {
    setActivePinia(createPinia())
    return mount(PageSkills, {
        global: {
            plugins: [i18n],
            stubs: { PickedSkills: PickedStub, Heading: true, Button: true, Tabs: true, VeeFormGeneralInformationUpdate: true, GroupTags: true },
        },
    })
}

describe('PageSkills — main skills save', () => {
    beforeEach(() => updatePatchDoc.mockReset())

    it('patches mainSkills, updates the store in place and reports success', async () => {
        updatePatchDoc.mockImplementation(async (_payload, cb) => cb?.({ data: { mainSkills: [{ name: 'Vue' }] } }))
        const wrapper = mountPage()
        const store = candidateStore()
        const setGeneralInformation = vi.spyOn(store, 'setGeneralInformation').mockImplementation(() => {})
        const main = wrapper.findAllComponents(PickedStub)[0]
        expect(main.props('skills')).toEqual([{ name: 'Vue', group: 'FE' }])
        expect(main.props('max')).toBe(5)

        expect(await main.props('save')([{ name: 'Vue' }])).toBe(true)
        expect(updatePatchDoc.mock.calls[0][0]).toMatchObject({ mainSkills: [{ name: 'Vue' }] })
        expect(setGeneralInformation).toHaveBeenCalledWith({ mainSkills: [{ name: 'Vue' }] })
    })

    it('familiar skills save their own field, with no limit', async () => {
        updatePatchDoc.mockImplementation(async (_payload, cb) => cb?.({ data: { familiarSkills: [{ name: 'Vue' }] } }))
        const wrapper = mountPage()
        const setGeneralInformation = vi.spyOn(candidateStore(), 'setGeneralInformation').mockImplementation(() => {})
        const familiar = wrapper.findAllComponents(PickedStub)[1]
        expect(familiar.props('title')).toBe('Kỹ năng quen thuộc')
        expect(familiar.props('max')).toBeUndefined()

        expect(await familiar.props('save')([{ name: 'Vue' }])).toBe(true)
        expect(updatePatchDoc.mock.calls[0][0]).toMatchObject({ familiarSkills: [{ name: 'Vue' }] })
        expect(updatePatchDoc.mock.calls[0][0]).not.toHaveProperty('mainSkills')
        expect(setGeneralInformation).toHaveBeenCalledWith({ familiarSkills: [{ name: 'Vue' }] })
    })

    it('reports failure when the API rejects the save (callback never runs)', async () => {
        updatePatchDoc.mockResolvedValue(undefined)
        const main = mountPage().findAllComponents(PickedStub)[0]
        expect(await main.props('save')([{ name: 'Vue' }])).toBe(false)
    })
})

// renders the professional tab and hands `listItems` to its `list` slot
let listItems: unknown[] = []
const listStubs = {
    PickedSkills: true,
    Heading: true,
    Button: true,
    GroupTags: true,
    NoData: { template: '<p class="no-data">Chưa có dữ liệu</p>' },
    Tabs: { template: '<div><slot name="professional" /></div>' },
    VeeFormGeneralInformationUpdate: {
        setup: () => ({ listItems }),
        template: '<div><slot name="list" :items="listItems" :remove="() => {}" :add="() => {}" :edit="() => {}" /></div>',
    },
}

describe('PageSkills — empty professional list', () => {
    it('shows the empty state on its own (NoData draws the box)', () => {
        listItems = []
        setActivePinia(createPinia())
        const wrapper = mount(PageSkills, { global: { plugins: [i18n], stubs: listStubs } })
        expect(wrapper.find('.no-data').exists()).toBe(true)
        expect(wrapper.find('.border-line .no-data').exists()).toBe(false)
    })

    it('shows the grouped skills and no empty box when there are skills', () => {
        listItems = [{ name: 'Vue', group: 'FE' }]
        setActivePinia(createPinia())
        const wrapper = mount(PageSkills, { global: { plugins: [i18n], stubs: listStubs } })
        expect(wrapper.find('.no-data').exists()).toBe(false)
        expect(wrapper.find('h3').text()).toBe('FE')
    })
})

