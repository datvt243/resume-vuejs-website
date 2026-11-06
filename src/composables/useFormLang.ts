/**
 * Description: VI | EN toggle of the content-language forms (issue #399) —
 * which half of the `{ vi, en }` fields a `VeeForm` shows. Not the UI
 * language (`i18n.global.locale`) nor the CV output language (`useCvLang`).
 */
import { ref } from 'vue'

// module scope: every form shares one value, so it survives a route change
const formLang = ref<'vi' | 'en'>('vi')

export function useFormLang() {
    return { formLang }
}
