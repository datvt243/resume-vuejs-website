/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { defaultId, defaultDateStartEnd, defaultDescription, defaultCheckboxBoolean, withEnglish } from '@/types/model.type'

const _mesRequired = 'Vui lòng nhập'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'school',
        label: 'Tên trường',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên trường',
        valid: yup => yup.string().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
        default: '',
    },
    {
        name: 'major',
        label: 'Chuyên ngành',
        type: 'text',
        placeholder: 'Vui lòng nhập Chuyên nhành',
        valid: yup => yup.string().max(50, 'Tối đa 50 ký tự').required(_mesRequired),
        default: '',
    },
    ...defaultDateStartEnd(true),
    defaultCheckboxBoolean({ name: 'isCurrent', label: 'Đang học tại đây' }),
    ...withEnglish(defaultDescription({ name: 'description', label: 'Mô tả', required: false })),
]

export default MODEL
