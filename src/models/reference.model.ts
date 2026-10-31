/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId, defaultPhone } from '@/types/model.type'

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'fullName',
        label: 'field.referenceName',
        type: 'text',
        valid: yup => yup.string().min(3, withParams('validation.minChars', { min: 3 })).max(50, withParams('validation.maxChars', { max: 50 })).required(_mesRequired),
        default: '',
    },
    {
        name: 'company',
        label: 'field.companyName',
        type: 'text',
        valid: yup => yup.string().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
    },
    {
        name: 'position',
        label: 'field.jobTitle',
        type: 'text',
        valid: yup => yup.string().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
    },
    defaultPhone({ name: 'phone', label: 'field.phone' }),
]

export default MODEL
