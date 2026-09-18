/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: CV layout theme selection (issue #119) — 3 CSS/layout
 * variants (Classic/Modern/Compact) shared by the PDF-export preview
 * (`PagePreview.vue`) and the public share-link page
 * (`PagePublicResume.vue`) via `CvResumeLayout.vue`. Pure frontend, no
 * backend field needed (matches the issue's own scope note): the owner's
 * choice persists to `localStorage` for their own dashboard/PDF export,
 * and carries to the public page via a `?theme=` query param appended to
 * the copyable public link in `PageInformation.vue` — so anonymous
 * visitors see the same theme without any server-side storage.
 */
import { ref, watch } from 'vue'

export interface CvTheme {
    value: string
    label: string
}

export const THEMES: CvTheme[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'modern', label: 'Modern' },
    { value: 'compact', label: 'Compact' },
]

export const DEFAULT_THEME = 'classic'

const STORAGE_KEY = 'cvTheme'

export function isValidTheme(value: unknown): value is string {
    return THEMES.some(t => t.value === value)
}

export function resolveTheme(value: unknown): string {
    return isValidTheme(value) ? value : DEFAULT_THEME
}

export function useCvTheme() {
    const stored = localStorage.getItem(STORAGE_KEY)
    const selectedTheme = ref(resolveTheme(stored))

    watch(selectedTheme, value => {
        localStorage.setItem(STORAGE_KEY, value)
    })

    function setTheme(value: string) {
        selectedTheme.value = resolveTheme(value)
    }

    return { selectedTheme, setTheme, THEMES, DEFAULT_THEME }
}
