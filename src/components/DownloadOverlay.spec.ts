import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

const axiosMock = vi.fn()
vi.mock('@/services/axios', () => ({
    instanceAxios: { get: (...args: unknown[]) => axiosMock(...args) },
}))
vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))
const confirmMock = vi.fn()
vi.mock('@/lib/swal.lib', () => ({ confirmDiscardChanges: (...args: unknown[]) => confirmMock(...args) }))
const swalClose = vi.fn()
vi.mock('sweetalert2', () => ({ default: { close: () => swalClose() } }))

import DownloadOverlay from './DownloadOverlay.vue'
import { useDownloadCv, isDownloading, cancelDownload } from '@/composables/useDownloadCv'
import { authStore } from '@/stores/auth'

const Blank = defineComponent({ render: () => h('div') })

const setup = async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: Blank },
            { path: '/other', component: Blank },
            { path: '/login', component: Blank },
        ],
    })
    router.push('/')
    await router.isReady()
    // `attachTo` trips over this @vue/test-utils + Vue 3.4 pair (see Modal.spec); focus() needs the nodes in the document
    const wrapper = mount(defineComponent({ render: () => h('div', [h(DownloadOverlay)]) }), { global: { plugins: [pinia, router] } })
    document.body.appendChild(wrapper.element)
    return { router, wrapper }
}

// starts a download that only settles when aborted, like axios; returns the request's abort signal
const startDownload = async () => {
    axiosMock.mockImplementation((_url, { signal }) => new Promise((_res, rej) => signal.addEventListener('abort', () => rej(new Error('canceled')))))
    useDownloadCv().download()
    await flushPromises()
    return axiosMock.mock.calls.at(-1)?.[1].signal as AbortSignal
}

describe('DownloadOverlay', () => {
    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify({ email: 'qa@example.com' }))
        sessionStorage.setItem('refreshToken', 'rt')
        axiosMock.mockReset()
        confirmMock.mockReset()
        swalClose.mockReset()
    })
    afterEach(async () => {
        cancelDownload()
        await flushPromises()
    })

    it('navigates freely with no download running', async () => {
        const { router, wrapper } = await setup()
        await router.push('/other')
        expect(confirmMock).not.toHaveBeenCalled()
        expect(router.currentRoute.value.path).toBe('/other')
        wrapper.unmount()
    })

    it('shows the dialog with Cancel focused, and Stay keeps the route and the download', async () => {
        const { router, wrapper } = await setup()
        const signal = await startDownload()
        const dialog = wrapper.get('[role="dialog"][aria-modal="true"]')
        expect(document.activeElement?.textContent).toBe('Hủy')
        expect(dialog.get('[aria-live="polite"]').text()).toBe('Đang tạo PDF…')

        confirmMock.mockResolvedValue(false)
        await router.push('/other')
        expect(router.currentRoute.value.path).toBe('/')
        expect(signal.aborted).toBe(false)
        expect(isDownloading.value).toBe(true)

        await dialog.trigger('keydown', { key: 'Escape' })
        expect(signal.aborted).toBe(true)
        wrapper.unmount()
    })

    it('Leave aborts the download and navigates', async () => {
        const { router, wrapper } = await setup()
        const signal = await startDownload()
        confirmMock.mockResolvedValue(true)
        await router.push('/other')
        expect(signal.aborted).toBe(true)
        expect(router.currentRoute.value.path).toBe('/other')
        wrapper.unmount()
    })

    it('closes the leave prompt and lets the navigation through when the download ends under it', async () => {
        const { router, wrapper } = await setup()
        let finish!: () => void
        axiosMock.mockReturnValue(new Promise((_res, rej) => (finish = () => rej(new Error('500')))))
        useDownloadCv().download()
        await flushPromises()
        let answer!: (_v: boolean) => void
        confirmMock.mockReturnValue(new Promise(r => (answer = r)))
        swalClose.mockImplementation(() => answer(false))

        const nav = router.push('/other')
        await flushPromises()
        finish()
        await nav

        expect(swalClose).toHaveBeenCalled()
        expect(router.currentRoute.value.path).toBe('/other')
        wrapper.unmount()
    })

    it('lets a forced logout through without asking', async () => {
        const { router, wrapper } = await setup()
        const signal = await startDownload()
        sessionStorage.clear()
        authStore().setTokens()
        await router.push('/login')
        expect(confirmMock).not.toHaveBeenCalled()
        expect(router.currentRoute.value.path).toBe('/login')
        expect(signal.aborted).toBe(false)
        wrapper.unmount()
    })
})
