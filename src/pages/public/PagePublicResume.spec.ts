import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PagePublicResume from './PagePublicResume.vue'

const axiosMock = vi.fn()
vi.mock('@/services/axios', () => ({ _axios: (...args: unknown[]) => axiosMock(...args) }))

async function mountAt(path: string) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/resume/:slug', name: 'public-resume', component: PagePublicResume }],
    })
    await router.push(path)
    const wrapper = mount(PagePublicResume, { global: { plugins: [router] } })
    await flushPromises()
    return wrapper
}

describe('PagePublicResume — ?lang', () => {
    beforeEach(() => {
        axiosMock.mockReset()
        axiosMock.mockResolvedValue({ success: true, data: { firstName: 'Dat', introduction: 'About me' } })
    })

    it('forwards ?lang=en to the API and renders the English labels', async () => {
        const wrapper = await mountAt('/resume/dat?lang=en')

        expect(axiosMock.mock.calls[0][0]).toMatchObject({ customURL: 'api/me/dat', params: { lang: 'en' } })
        expect(wrapper.find('.cv-introduction').text()).toBe('About me')
    })

    it('sends no lang param by default or for an unsupported value', async () => {
        await mountAt('/resume/dat')
        await mountAt('/resume/dat?lang=fr')

        expect(axiosMock.mock.calls[0][0].params).toEqual({})
        expect(axiosMock.mock.calls[2][0].params).toEqual({})
    })
})

describe('PagePublicResume — visit tracking', () => {
    beforeEach(() => {
        axiosMock.mockReset()
        axiosMock.mockImplementation(async ({ method }) => (method === 'get' ? { success: true, data: { firstName: 'Dat' } } : {}))
    })

    it('records the visit with the page referrer so the backend can attribute the source', async () => {
        vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://www.linkedin.com/feed/')

        await mountAt('/resume/dat')

        expect(axiosMock).toHaveBeenCalledWith({
            method: 'post',
            customURL: 'api/me/dat/visit',
            data: { referrer: 'https://www.linkedin.com/feed/' },
        })
    })

    it('sends an empty referrer for a direct visit', async () => {
        vi.spyOn(document, 'referrer', 'get').mockReturnValue('')

        await mountAt('/resume/dat')

        const visitCall = axiosMock.mock.calls.find(([opt]) => opt.method === 'post')
        expect(visitCall?.[0].data).toEqual({ referrer: '' })
    })

    it('does not record a visit when the profile is not found', async () => {
        axiosMock.mockImplementation(async () => ({ success: false }))

        await mountAt('/resume/dat')

        expect(axiosMock.mock.calls.some(([opt]) => opt.method === 'post')).toBe(false)
    })
})
