import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDownloadCv, withLangSuffix, cancelDownload, downloadStatus } from './useDownloadCv'
import { candidateStore } from '@/stores/candidate'

const axiosMock = vi.fn()
vi.mock('@/services/axios', () => ({
    instanceAxios: { get: (...args: unknown[]) => axiosMock(...args) },
}))
const pdfResponse = (headers = {}) => ({ data: new Blob(['%PDF']), headers })

const toastMock = vi.fn()
vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: toastMock }),
}))

describe('useDownloadCv', () => {
    let clickSpy: ReturnType<typeof vi.spyOn>
    const downloaded = () => (clickSpy.mock.contexts as HTMLAnchorElement[]).map(a => `${a.href} ${a.download}`)

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
        axiosMock.mockResolvedValue(pdfResponse())
        const { download, isDownloading } = useDownloadCv()

        const pending = download({ template: 'ats', lang: 'en' })
        expect(isDownloading.value).toBe(true)
        await pending

        expect(axiosMock).toHaveBeenCalledWith('api/v1/download-pdf', expect.objectContaining({ params: { template: 'ats', lang: 'en' }, responseType: 'blob' }))
        expect(downloaded()).toEqual(['blob:cv Võ_Tấn_Đạt_EN.pdf'])
        expect(isDownloading.value).toBe(false)
        expect(toastMock).not.toHaveBeenCalled()

        await download()
        expect(axiosMock).toHaveBeenLastCalledWith('api/v1/download-pdf', expect.objectContaining({ params: {} }))
    })

    it('saves under the Content-Disposition name the server sent', async () => {
        candidateStore().setCandidate({ firstName: 'Võ Tấn', lastName: 'Đạt', cvFileName: 'Dat Vo CV' })
        axiosMock.mockResolvedValue(pdfResponse({ 'content-disposition': 'attachment; filename="Dat_Vo_CV.pdf"' }))
        const { download } = useDownloadCv()

        await download()

        expect(downloaded()).toEqual(['blob:cv Dat_Vo_CV_VI.pdf'])
    })

    it('falls back to the candidate cvFileName when the header is missing', async () => {
        candidateStore().setCandidate({ firstName: 'Võ Tấn', lastName: 'Đạt', cvFileName: ' Dat Vo CV ' })
        axiosMock.mockResolvedValue(pdfResponse())
        const { download, cvFileName } = useDownloadCv()

        await download()

        expect(cvFileName.value).toBe('Dat Vo CV.pdf')
        expect(downloaded()).toEqual(['blob:cv Dat Vo CV_VI.pdf'])
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
        let resolve!: (_r: ReturnType<typeof pdfResponse>) => void
        axiosMock.mockReturnValue(new Promise(r => (resolve = r)))
        const { download } = useDownloadCv()

        const first = download()
        await download()
        resolve(pdfResponse())
        await first

        expect(axiosMock).toHaveBeenCalledTimes(1)
        expect(downloaded()).toEqual(['blob:cv CV_VI.pdf'])
    })

    // a beforeunload the page objects to has defaultPrevented set
    const unloadBlocked = () => {
        const e = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(e)
        return e.defaultPrevented
    }
    const pendingResponse = () => {
        let resolve!: (_r: ReturnType<typeof pdfResponse>) => void
        let reject!: (_e: unknown) => void
        axiosMock.mockReturnValue(new Promise((res, rej) => ((resolve = res), (reject = rej))))
        return { resolve: (r = pdfResponse()) => resolve(r), reject: (e: unknown) => reject(e) }
    }

    it('shares one state across instances and goes generating → downloading → idle, guarding unload meanwhile', async () => {
        const res = pendingResponse()
        const a = useDownloadCv()
        const b = useDownloadCv()

        const pending = a.download()
        expect(b.isDownloading.value).toBe(true)
        expect(downloadStatus.value).toBe('generating')
        expect(unloadBlocked()).toBe(true)
        await b.download()
        expect(axiosMock).toHaveBeenCalledTimes(1)

        axiosMock.mock.calls[0][1].onDownloadProgress()
        expect(downloadStatus.value).toBe('downloading')
        res.resolve()
        await pending

        expect(downloadStatus.value).toBe('idle')
        // axios' throttled trailing progress event lands after the request settled
        axiosMock.mock.calls[0][1].onDownloadProgress()
        expect(b.isDownloading.value).toBe(false)
        expect(downloaded()).toEqual(['blob:cv CV_VI.pdf'])
        expect(toastMock).not.toHaveBeenCalled()
        expect(unloadBlocked()).toBe(false)
    })

    it('removes the unload guard after a failure', async () => {
        const res = pendingResponse()
        const { download } = useDownloadCv()

        const pending = download()
        res.reject(new Error('500'))
        await pending

        expect(toastMock).toHaveBeenCalledTimes(1)
        expect(unloadBlocked()).toBe(false)
    })

    it('cancel aborts the request and saves nothing, even when the response lands after', async () => {
        const res = pendingResponse()
        const { download, isDownloading } = useDownloadCv()

        const pending = download()
        const { signal } = axiosMock.mock.calls[0][1]
        cancelDownload()
        expect(signal.aborted).toBe(true)
        res.resolve()
        await pending

        expect(downloaded()).toEqual([])
        expect(toastMock).not.toHaveBeenCalled()
        expect(isDownloading.value).toBe(false)
        expect(unloadBlocked()).toBe(false)
    })

    it('cancel that rejects the request shows no error toast', async () => {
        const res = pendingResponse()
        const { download } = useDownloadCv()

        const pending = download()
        cancelDownload()
        res.reject(new Error('canceled'))
        await pending

        expect(toastMock).not.toHaveBeenCalled()
    })

    it.each([
        ['Dat_Vo_CV.pdf', 'en', 'Dat_Vo_CV_EN.pdf'],
        ['Dat_Vo_CV_VI.pdf', 'en', 'Dat_Vo_CV_VI.pdf'],
        ['Dat_Vo_CV_en.pdf', 'vi', 'Dat_Vo_CV_en.pdf'],
        ['My.CV.v2.pdf', 'vi', 'My.CV.v2_VI.pdf'],
        ['DAVID', 'vi', 'DAVID_VI'],
        ['Vien', 'en', 'Vien_EN'],
    ])('withLangSuffix(%p, %p) → %p', (name, lang, expected) => {
        expect(withLangSuffix(name, lang)).toBe(expected)
    })
})
