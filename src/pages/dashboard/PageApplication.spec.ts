import { describe, it, expect, vi } from 'vitest'
import { ref, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { candidateStore } from '@/stores/candidate'
import PageApplication from './PageApplication.vue'
import VeeForm from '@/components/veevalidate/VeeForm.vue'

const { updateDoc } = vi.hoisted(() => ({ updateDoc: vi.fn() }))

const lists: Record<string, unknown[]> = {
    applications: [
        { _id: 'a1', company: 'Acme', position: 'Dev', appliedDate: 0, status: 'applied', profileId: 'p1' },
        { _id: 'a2', company: 'NoProfile', position: 'Dev', appliedDate: 0, status: 'applied', profileId: null },
        { _id: 'a3', company: 'Deleted', position: 'Dev', appliedDate: 0, status: 'applied', profileId: 'gone' },
    ],
    profiles: [{ _id: 'p1', name: 'Frontend CV' }],
}

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: ({ field }: { field: string }) => ({ [field]: ref(lists[field]), removeRecordById: vi.fn(), addRecordToList: vi.fn(), getData: vi.fn() }),
}))
vi.mock('@/composables/useDocument', () => ({
    useDocument: () => ({ document: reactive({}), updateDoc, deleteDoc: vi.fn() }),
}))
vi.mock('vue-router', () => ({
    useRouter: () => ({ resolve: ({ params, query }: any) => ({ href: `#/cv/${params.slug}?profile=${query.profile}` }) }),
}))

const stubs = {
    Heading: { template: '<div><slot /></div>' },
    Button: true,
    NoData: true,
    ListTransition: { template: '<ul><slot /></ul>' },
    ItemTemplate: { template: '<div class="item"><slot /></div>' },
    Modal: { template: '<div><slot /></div>' },
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

    it('shows public link + PDF only for an application whose profile still exists', () => {
        const items = mountPage().findAll('.item')
        const links = items[0].findAll('a[target="_blank"]').map(a => a.attributes('href'))
        expect(items[0].text()).toContain('Frontend CV')
        expect(links).toHaveLength(2)
        expect(links[0]).toBe('#/cv/dat-vo?profile=p1')
        expect(links[1]).toMatch(/api\/me\/dat-vo\/download-pdf\?template=ats&profile=p1$/)
        expect(items[1].findAll('a[target="_blank"]')).toHaveLength(0)
        expect(items[2].findAll('a[target="_blank"]')).toHaveLength(0)
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
