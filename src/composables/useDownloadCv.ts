/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: download the server-rendered CV (`GET api/v1/download-pdf`)
 *   as a file — fetch → blob → <a download>, same flow as datvt243.github.io's
 *   `useDownloadResume`.
 */

import { computed, ref } from 'vue'
import { subURL } from '@/config/api.config'
import { _axios } from '@/services/axios'
import { candidateStore } from '@/stores/candidate'
import { useHelper } from '@/composables/useHelper'
import { t } from '@/i18n'

export const useDownloadCv = () => {
    const { toast } = useHelper()
    const candidate = candidateStore()
    const isDownloading = ref(false)

    const cvFileName = computed(() => {
        const { firstName = '', lastName = '' } = candidate.getCandidate || {}
        const name = `${firstName}_${lastName}`.replace(/\s+/g, '_').replace(/^_+|_+$/g, '')
        return `${name || 'CV'}.pdf`
    })

    /**
     * Through `_axios`, not a plain link: the Bearer header and 401 refresh
     * only exist there (a `?token=` link has no token after a reload), and a
     * failure becomes a toast instead of a tab of raw JSON.
     * `classic` and `vi` are the backend defaults, so they're left off.
     */
    const download = async ({ template = 'classic', lang = 'vi' } = {}) => {
        if (isDownloading.value) return
        isDownloading.value = true
        try {
            const params = {
                ...(template === 'ats' && { template }),
                ...(lang === 'en' && { lang }),
            }
            const blob = await _axios({ method: 'get', url: `${subURL}download-pdf`, params, responseType: 'blob' })
            const href = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = href
            link.download = cvFileName.value
            link.click()
            // revoking in the same tick can cancel the download in some browsers
            setTimeout(() => URL.revokeObjectURL(href))
        } catch {
            toast?.({ message: t('error.downloadCv'), bg: 'danger' })
        } finally {
            isDownloading.value = false
        }
    }

    return { download, isDownloading, cvFileName }
}
