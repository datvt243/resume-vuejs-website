/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: which CV profile (issue #116) is currently selected for
 * the PDF-export preview and the copyable public link — pure frontend
 * choice persisted to localStorage, mirroring `useCvTheme.ts`'s pattern.
 * An empty string means "no profile filter" (full data, same as before
 * this feature existed) — the stored id is NOT validated against the
 * real profiles list here (this composable doesn't fetch them); callers
 * must fall back to "no filter" themselves if the id no longer resolves
 * to a real profile (e.g. it was deleted).
 */
import { ref, watch } from 'vue'

const STORAGE_KEY = 'cvActiveProfileId'

export function useActiveProfile() {
    const activeProfileId = ref(localStorage.getItem(STORAGE_KEY) || '')

    watch(activeProfileId, value => {
        if (value) {
            localStorage.setItem(STORAGE_KEY, value)
        } else {
            localStorage.removeItem(STORAGE_KEY)
        }
    })

    function setActiveProfile(id: string) {
        activeProfileId.value = id || ''
    }

    return { activeProfileId, setActiveProfile }
}
