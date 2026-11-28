import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PageSkills from './PageSkills.vue'
import { i18n } from '@/i18n'
import { candidateStore } from '@/stores/candidate'

const replace = vi.hoisted(() => vi.fn())
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ replace }) }))
const doc = vi.hoisted(() => ({ value: {} as Record<string, unknown> }))
const baseDoc = () => ({ _id: 'g1', professionalSkills: [{ name: 'Vue', group: 'FE' }], mainSkills: [] })
vi.mock('@/composables/useCandidate', () => ({
    useCandidate: () => ({ generalInformation: ref([doc.value]), getData: vi.fn() }),
}))
const updatePatchDoc = vi.fn()
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ updatePatchDoc: (...args: unknown[]) => updatePatchDoc(...args) }),
}))

const confirmDelete = vi.fn()
const requireGeneralInformation = vi.fn()
vi.mock('@/lib/swal.lib', () => ({ confirmDelete: (opts: unknown) => confirmDelete(opts), requireGeneralInformation: () => requireGeneralInformation() }))

// the page reads the document `_id` from the store, so seed it like a loaded account
function freshStore(id = 'g1') {
    setActivePinia(createPinia())
    candidateStore().setCandidate({ generalInformation: { _id: id } })
}

const PickedStub = { name: 'PickedSkills', props: ['title', 'addText', 'modelValue', 'skills', 'groups', 'max', 'save'], template: '<div />' }

function mountPage() {
    return mount(PageSkills, {
        global: {
            plugins: [i18n],
            stubs: { PickedSkills: PickedStub, Heading: true, Button: true, Tabs: true, VeeFormGeneralInformationUpdate: true, GroupTags: true },
        },
    })
}

describe('PageSkills — main skills save', () => {
    beforeEach(() => {
        updatePatchDoc.mockReset()
        doc.value = baseDoc()
        freshStore()
    })

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
        freshStore()
        const wrapper = mount(PageSkills, { global: { plugins: [i18n], stubs: listStubs } })
        expect(wrapper.find('.no-data').exists()).toBe(true)
        expect(wrapper.find('.border-line .no-data').exists()).toBe(false)
    })

    it('shows the grouped skills and no empty box when there are skills', () => {
        listItems = [{ name: 'Vue', group: 'FE' }]
        freshStore()
        const wrapper = mount(PageSkills, { global: { plugins: [i18n], stubs: listStubs } })
        expect(wrapper.find('.no-data').exists()).toBe(false)
        expect(wrapper.find('h3').text()).toBe('FE')
    })
})

describe('PageSkills — main/familiar skills need professional skills first (#527)', () => {
    it('labels each picker button, and need-skills opens the Professional tab with the group input focused', async () => {
        doc.value = baseDoc()
        freshStore()
        const input = document.createElement('input')
        input.id = 'skill-group-input'
        document.body.appendChild(input)
        const wrapper = mountPage()
        const [main, familiar] = wrapper.findAllComponents(PickedStub)
        expect([main.props('addText'), familiar.props('addText')]).toEqual(['Chọn kỹ năng chính', 'Chọn kỹ năng quen thuộc'])

        main.vm.$emit('need-skills')
        await flushPromises()
        expect(replace).toHaveBeenCalledWith({ query: { tab: 'professional' } })
        expect(document.activeElement).toBe(input)
        input.remove()
    })
})

describe('PageSkills — delete group', () => {
    it('asks for the typed `delete`, then patches the group and its skills away', async () => {
        listItems = [{ name: 'Vue', group: 'FE' }]
        doc.value = baseDoc()
        freshStore()
        confirmDelete.mockReset()
        updatePatchDoc.mockReset()
        const wrapper = mount(PageSkills, { global: { plugins: [i18n], stubs: listStubs } })
        const label = i18n.global.t('generalInfo.deleteGroup', { name: 'FE' })
        await wrapper.find(`[aria-label="${label}"]`).trigger('click')

        const opts = confirmDelete.mock.calls[0][0]
        expect(opts.typed).toBe(true)
        expect(updatePatchDoc).not.toHaveBeenCalled()
        await opts.callback()
        expect(updatePatchDoc).toHaveBeenCalledTimes(1)
        expect(updatePatchDoc.mock.calls[0][0]).toMatchObject({ professionalSkills: [] })
    })
})

describe('PageSkills — main/familiar skills follow skill changes (#437)', () => {
    beforeEach(() => {
        updatePatchDoc.mockReset()
        doc.value = { ...baseDoc(), professionalSkills: [{ name: 'Vue', group: 'FE' }, { name: 'Go', group: 'BE' }], mainSkills: [{ name: 'Vue' }, { name: 'Go' }], familiarSkills: [{ name: 'Go' }] }
        freshStore()
    })

    const syncPayload = () =>
        mount(PageSkills, { global: { plugins: [i18n], stubs: { ...listStubs, VeeFormGeneralInformationUpdate: { name: 'VeeFormStub', props: ['syncPayload', 'fieldKey'], template: '<div />' } } } })
            .findAllComponents({ name: 'VeeFormStub' })
            .find(c => c.props('fieldKey') === 'professionalSkills')!
            .props('syncPayload')

    it('rename: the new name replaces the old one', () => {
        const list = [{ name: 'Vue.js', group: 'FE' }, { name: 'Go', group: 'BE' }]
        expect(syncPayload()(list, { Vue: 'Vue.js' })).toEqual({ mainSkills: [{ name: 'Vue.js' }, { name: 'Go' }] })
    })

    it('rename onto an already-picked name keeps it once', () => {
        expect(syncPayload()([{ name: 'Go', group: 'FE' }, { name: 'Go', group: 'BE' }], { Vue: 'Go' })).toEqual({ mainSkills: [{ name: 'Go' }] })
    })

    it('delete: the name is removed from both, unchanged fields are not sent', () => {
        expect(syncPayload()([{ name: 'Vue', group: 'FE' }], {})).toEqual({ mainSkills: [{ name: 'Vue' }], familiarSkills: [] })
        expect(syncPayload()([{ name: 'Vue', group: 'FE' }, { name: 'Go', group: 'BE' }], {})).toEqual({})
    })

    it('delete group: its skills leave main/familiar skills in the same PATCH', async () => {
        listItems = doc.value.professionalSkills as unknown[]
        confirmDelete.mockReset()
        const wrapper = mount(PageSkills, { global: { plugins: [i18n], stubs: listStubs } })
        await wrapper.find(`[aria-label="${i18n.global.t('generalInfo.deleteGroup', { name: 'BE' })}"]`).trigger('click')
        await confirmDelete.mock.calls[0][0].callback()
        expect(updatePatchDoc).toHaveBeenCalledTimes(1)
        expect(updatePatchDoc.mock.calls[0][0]).toMatchObject({ professionalSkills: [{ name: 'Vue', group: 'FE' }], mainSkills: [{ name: 'Vue' }], familiarSkills: [] })
    })
})

describe('PageSkills — General information never saved (#438)', () => {
    it('shows the message instead of patching when the document has no _id', async () => {
        updatePatchDoc.mockReset()
        requireGeneralInformation.mockReset()
        doc.value = baseDoc()
        freshStore('')
        const main = mountPage().findAllComponents(PickedStub)[0]
        await main.props('save')([{ name: 'Vue' }])
        expect(requireGeneralInformation).toHaveBeenCalledTimes(1)
        expect(updatePatchDoc).not.toHaveBeenCalled()
    })
})
