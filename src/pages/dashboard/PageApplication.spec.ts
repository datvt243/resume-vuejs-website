import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { candidateStore } from '@/stores/candidate'
import PageApplication from './PageApplication.vue'
import VeeForm from '@/components/veevalidate/VeeForm.vue'
import { useCvLang } from '@/composables/useCvLang'
import { t } from '@/i18n'

const { updateDoc, download } = vi.hoisted(() => ({ updateDoc: vi.fn(), download: vi.fn() }))

const lists: Record<string, unknown[]> = {
    applications: [
        { _id: 'a1', company: 'Acme', position: 'Dev', appliedDate: 0, status: 'applied', profileId: 'p1' },
        { _id: 'a2', company: 'NoProfile', position: 'Dev', appliedDate: 0, status: 'applied', profileId: null },
        { _id: 'a3', company: 'Deleted', position: 'Dev', appliedDate: 0, status: 'applied', profileId: 'gone' },
        { _id: 'a4', company: 'Int', position: 'Dev', appliedDate: 0, status: 'interview', profileId: null },
        { _id: 'a5', company: 'Off', position: 'Dev', appliedDate: 0, status: 'offer', profileId: null },
        { _id: 'a6', company: 'Acc', position: 'Dev', appliedDate: 0, status: 'accepted', profileId: null },
        { _id: 'a7', company: 'Rej', position: 'Dev', appliedDate: 0, status: 'rejected', profileId: null },
        { _id: 'a8', company: 'Legacy', position: 'Dev', appliedDate: 0, status: 'pending', profileId: null },
    ],
    profiles: [{ _id: 'p1', name: 'Frontend CV' }],
}

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: ({ field }: { field: string }) => ({ [field]: ref(lists[field]), removeRecordById: vi.fn(), addRecordToList: vi.fn(), getData: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc, deleteDoc: vi.fn() }),
}))
vi.mock('@/composables/useDownloadCv', () => ({
    useDownloadCv: () => ({ download, isDownloading: ref(false) }),
}))
vi.mock('vue-router', () => ({
    useRouter: () => ({ resolve: ({ params, query }: any) => ({ href: `#/cv/${params.slug}?profile=${query.profile}` }) }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: true,
    ItemActions: true,
    LoadingGate: { template: '<div><slot /></div>' },
    NoData: true,
    ListTransition: { template: '<ul><slot /></ul>' },
    ItemTemplate: { template: '<div class="item"><slot /></div>' },
    Modal: { template: '<div><slot /></div>', methods: { show() {}, hide() {} } },
    VeeForm: { props: ['fields', 'submitFn'], template: '<div />' },
    FontAwesomeIcon: true,
}

function mountPage(candidate: Record<string, unknown> = { email: 'me@x.com', slug: 'dat-vo' }) {
    setActivePinia(createPinia())
    candidateStore().setCandidate(candidate)
    return mount(PageApplication, { global: { stubs } })
}

describe('PageApplication — CV profile per application', () => {
    it('fills the profile select options from the candidate profiles', () => {
        const fields = mountPage().findComponent(VeeForm).props('fields') as any[]
        expect(fields.find(f => f.name === 'profileId').options).toEqual([{ text: 'Frontend CV', value: 'p1' }])
    })

    const pdfBtn = (item: ReturnType<ReturnType<typeof mountPage>['find']>) => item.find(`button[aria-label="${t('crud.application.downloadPdf')}"]`)

    it('shows public link + PDF only for an application whose profile still exists', () => {
        const items = mountPage().findAll('.item')
        const links = items[0].findAll('a[target="_blank"]').map(a => a.attributes('href'))
        expect(items[0].text()).toContain('Frontend CV')
        expect(links).toEqual(['#/cv/dat-vo?profile=p1'])
        expect(pdfBtn(items[0]).exists()).toBe(true)
        expect(items[1].findAll('a[target="_blank"]')).toHaveLength(0)
        expect(pdfBtn(items[1]).exists()).toBe(false)
        expect(pdfBtn(items[2]).exists()).toBe(false)
    })

    it('downloads the owner ATS PDF for the application profile in the shared CV language (#448)', async () => {
        useCvLang().setLang('en')
        await pdfBtn(mountPage().findAll('.item')[0]).trigger('click')
        useCvLang().setLang('vi')
        expect(download).toHaveBeenCalledWith({ template: 'ats', lang: 'en', profile: 'p1' })
    })

    it('falls back to the email when no slug is set', () => {
        const href = mountPage({ email: 'me@x.com' }).findAll('.item')[0].find('a[target="_blank"]').attributes('href')
        expect(href).toBe('#/cv/me@x.com?profile=p1')
    })

    it('omits a since-deleted profile on save so the backend keeps the stored link', async () => {
        const submit = mountPage().findComponent(VeeForm).props('submitFn') as (_values: unknown) => Promise<void>
        await submit({ _id: 'a3', company: 'Deleted', appliedDate: 0, profileId: 'gone' })
        await submit({ _id: 'a1', company: 'Acme', appliedDate: 0, profileId: 'p1' })
        expect(updateDoc.mock.calls[0][0]).not.toHaveProperty('profileId')
        expect(updateDoc.mock.calls[1][0].profileId).toBe('p1')
    })
})

describe('PageApplication — status transitions (#423)', () => {
    const statusField = (w: ReturnType<typeof mountPage>) => (w.findComponent(VeeForm).props('fields') as any[]).find(f => f.name === 'status')
    const values = (w: ReturnType<typeof mountPage>) => statusField(w).options.map((o: any) => o.value)
    const all = ['applied', 'interview', 'offer', 'accepted', 'rejected']

    async function open(event: 'edit' | 'duplicate', company: string) {
        const w = mountPage()
        w.findAllComponents({ name: 'ItemActions' }).find(c => c.attributes('label') === company)!.vm.$emit(event)
        await w.vm.$nextTick()
        return w
    }

    it('renders accepted with its own badge color', () => {
        const items = mountPage().findAll('.item')
        const badgeOf = (i: number) => items[i].find('span').classes().join(' ')
        expect(items[5].text()).toContain(t('option.applicationStatus.accepted'))
        expect(new Set([0, 3, 4, 5, 6].map(badgeOf)).size).toBe(5)
    })

    it('offers every status on Add and on Duplicate', async () => {
        expect(values(mountPage())).toEqual(all)
        const w = await open('duplicate', 'Off')
        expect(values(w)).toEqual(all)
        expect(statusField(w).disabled).toBe(false)
    })

    it.each([
        ['Acme', ['applied', 'interview', 'offer', 'rejected'], false],
        ['Int', ['interview', 'offer', 'rejected'], false],
        ['Off', ['offer', 'accepted', 'rejected'], false],
        ['Acc', ['accepted'], true],
        ['Rej', ['rejected'], true],
        ['Legacy', ['applied', 'interview', 'offer', 'rejected'], false],
    ])('edit of %s offers only the allowed moves', async (company, expected, disabled) => {
        const w = await open('edit', company)
        expect(values(w)).toEqual(expected)
        expect(statusField(w).disabled).toBe(disabled)
    })
})
