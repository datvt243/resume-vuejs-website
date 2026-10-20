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

export const DEFAULT_CV_LANG: CvLang = 'vi'

const STORAGE_KEY = 'cvLang'

export function resolveCvLang(value: unknown): CvLang {
    return value === 'en' ? 'en' : DEFAULT_CV_LANG
}

// module scope: the header switch and every page share one value (it also drives the UI locale, see src/i18n)
const selectedLang = ref<CvLang>(resolveCvLang(localStorage.getItem(STORAGE_KEY)))

watch(selectedLang, value => {
    localStorage.setItem(STORAGE_KEY, value)
})

function setLang(value: unknown) {
    selectedLang.value = resolveCvLang(value)
}

export function useCvLang() {
    return { selectedLang, setLang, DEFAULT_CV_LANG }
}
