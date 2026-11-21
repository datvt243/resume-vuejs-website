import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import PageInformation from './PageInformation.vue'
import { candidateStore } from '@/stores/candidate'
import { i18n } from '@/i18n'

vi.mock('vue-router', () => ({ useRouter: () => ({ resolve: () => ({ href: '#/resume/x' }) }) }))
// VeeForm pulls in CKEditor (not loadable in jsdom)
const { VeeFormStub, toast, updateDoc, document } = vi.hoisted(() => ({
    VeeFormStub: { name: 'VeeForm', props: ['document', 'submitFn', 'fields'], render: () => null },
    toast: vi.fn(),
    updateDoc: vi.fn(),
    document: {} as Record<string, unknown>,
}))
vi.mock('@/components/veevalidate/VeeForm.vue', () => ({ default: VeeFormStub }))
vi.mock('@/components/QrCode.vue', () => ({ default: { render: () => null } }))
vi.mock('@/composables', () => ({
    useHelper: () => ({ toast }),
    useCandidate: () => ({ profiles: ref([]) }),
    useDocument: () => ({ document: Object.assign(document, { _id: '', gender: 0, marital: 0 }), updateDoc, updatePatchDoc: vi.fn() }),
}))

function mountPage() {
    return mount(PageInformation, {
        global: { plugins: [i18n], stubs: { Heading: true, Button: true, LoadingGate: { template: '<div><slot /></div>' }, FormSection: { template: '<section><slot /></section>' } } },
    })
}

describe('PageInformation — personal information', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        toast.mockReset()
        updateDoc.mockReset()
    })

    it('seeds the stored gender/marital booleans as the 0/1 select values (#432)', () => {
        candidateStore().setCandidate({ _id: 'c1', gender: true, marital: false })
        mountPage()
        expect(document.gender).toBe(1)
        expect(document.marital).toBe(0)
    })

    it('missing candidate id: toast only, no request (#433)', async () => {
        const wrapper = mountPage()
        await wrapper.findComponent(VeeFormStub).props('submitFn')({ gender: 1, marital: 0, birthday: '2000-01-01' })
        expect(toast).toHaveBeenCalledTimes(1)
        expect(updateDoc).not.toHaveBeenCalled()
    })
})
