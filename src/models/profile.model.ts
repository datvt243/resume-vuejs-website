/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: issue #116 — a CV "profile" is a named subset (by _id
 * reference, no data duplication) of the candidate's existing Education/
 * Experience/Project/Certificate/Award/Reference records, matching backend
 * `resume-nodejs-api#133`'s `profile.model.ts` exactly. Only `name` is a
 * VeeForm-driven field here — the 6 `*Ids` arrays are picked via a custom
 * checklist UI in `PageProfile.vue` (no existing `modelItem.type` fits
 * "multi-select against dynamically-fetched records", and adding one to
 * the shared `VeeForm.vue` would be a much bigger, riskier change than
 * this feature needs), then merged into the submitted payload alongside
 * VeeForm's own `values` — see `PageProfile.vue`'s `handleUpdate`.
 */

import type { modelItem } from '@/types/model.type.ts'
import { defaultId } from '@/types/model.type'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'name',
        label: 'Tên profile',
        type: 'text',
        placeholder: 'VD: CV Frontend, CV Backend...',
        valid: yup => yup.string().trim().min(1, 'Tên profile không được trống').max(100, 'Tối đa 100 ký tự').required('Vui lòng nhập tên profile'),
        default: '',
        col: 'col-md-12',
    },
]

export default MODEL
