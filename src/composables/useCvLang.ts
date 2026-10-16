/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: CV content language (issue #182) — which half of the
 * `{ vi, en }` fields the preview, the PDF download and the copyable
 * public link use. Same mechanism as `useCvTheme`: the owner's choice
 * persists to `localStorage`, and reaches anonymous visitors through a
 * `?lang=en` query param on the public link (the backend's public and
 * download-pdf endpoints both resolve localized fields from `?lang=`).
 */
import { ref, watch } from 'vue'

export type CvLang = 'vi' | 'en'

export const CV_LANGS: { value: CvLang; label: string }[] = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
]

export const DEFAULT_CV_LANG: CvLang = 'vi'

const STORAGE_KEY = 'cvLang'

export function resolveCvLang(value: unknown): CvLang {
    return value === 'en' ? 'en' : DEFAULT_CV_LANG
}

export function useCvLang() {
    const selectedLang = ref<CvLang>(resolveCvLang(localStorage.getItem(STORAGE_KEY)))

    watch(selectedLang, value => {
        localStorage.setItem(STORAGE_KEY, value)
    })

    function setLang(value: unknown) {
        selectedLang.value = resolveCvLang(value)
    }

    return { selectedLang, setLang, CV_LANGS, DEFAULT_CV_LANG }
}
