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
