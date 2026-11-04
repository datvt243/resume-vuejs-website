/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId, defaultDateStartEnd, defaultDescription, defaultCheckboxBoolean, withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    defaultId,
    ...withEnglish({
        name: 'school',
        label: 'field.school',
        type: 'text',
        valid: yup => yup.string().max(255, withParams('validation.maxChars', { max: 255 })).required(_mesRequired),
        default: '',
    }),
    ...withEnglish({
        name: 'major',
        label: 'field.major',
        type: 'text',
        valid: yup => yup.string().min(3, withParams('validation.minChars', { min: 3 })).max(255, withParams('validation.maxChars', { max: 255 })).required(_mesRequired),
        default: '',
    }),
    ...defaultDateStartEnd(true),
    defaultCheckboxBoolean({ name: 'isCurrent', label: 'field.isStudying' }),
    ...withEnglish(defaultDescription({ name: 'description', label: 'field.description', required: false })),
]

export default MODEL
