import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDownloadCv } from './useDownloadCv'
import { candidateStore } from '@/stores/candidate'

const axiosMock = vi.fn()
vi.mock('@/services/axios', () => ({
    _axios: (...args: unknown[]) => axiosMock(...args),
}))

const toastMock = vi.fn()
vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: toastMock }),
}))

describe('useDownloadCv', () => {
    let clickSpy: ReturnType<typeof vi.spyOn>
    const downloaded = () => clickSpy.mock.contexts.map((a: HTMLAnchorElement) => `${a.href} ${a.download}`)

    beforeEach(() => {
        setActivePinia(createPinia())
        axiosMock.mockReset()
        toastMock.mockReset()
        URL.createObjectURL = vi.fn(() => 'blob:cv')
        URL.revokeObjectURL = vi.fn()
        clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    })
    afterEach(() => clickSpy.mockRestore())

    it('fetches the PDF as a blob with only non-default params and saves it under the candidate name', async () => {
        candidateStore().setCandidate({ firstName: 'Võ Tấn', lastName: 'Đạt' })
        axiosMock.mockResolvedValue(new Blob(['%PDF']))
        const { download, isDownloading } = useDownloadCv()

        const pending = download({ template: 'ats', lang: 'en' })
        expect(isDownloading.value).toBe(true)
        await pending

        expect(axiosMock).toHaveBeenCalledWith({ method: 'get', url: 'api/v1/download-pdf', params: { template: 'ats', lang: 'en' }, responseType: 'blob' })
        expect(downloaded()).toEqual(['blob:cv Võ_Tấn_Đạt.pdf'])
        expect(isDownloading.value).toBe(false)
        expect(toastMock).not.toHaveBeenCalled()

        await download()
        expect(axiosMock).toHaveBeenLastCalledWith(expect.objectContaining({ params: {} }))
    })

    it('shows an error toast instead of downloading when the API fails', async () => {
        axiosMock.mockRejectedValue(new Blob(['{"success":false}']))
        const { download, isDownloading } = useDownloadCv()

        await download()

        expect(downloaded()).toEqual([])
        expect(toastMock).toHaveBeenCalledWith({ message: 'Không tải được CV, vui lòng thử lại sau', bg: 'danger' })
        expect(isDownloading.value).toBe(false)
    })

    it('ignores clicks while a download is in flight', async () => {
        let resolve!: (_b: Blob) => void
        axiosMock.mockReturnValue(new Promise<Blob>(r => (resolve = r)))
        const { download } = useDownloadCv()

        const first = download()
        await download()
        resolve(new Blob(['%PDF']))
        await first

        expect(axiosMock).toHaveBeenCalledTimes(1)
        expect(downloaded()).toEqual(['blob:cv CV.pdf'])
    })
})
