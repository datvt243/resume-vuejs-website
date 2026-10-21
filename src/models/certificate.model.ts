/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId, defaultDescription, defaultDateStartEnd, defaultCheckboxBoolean, withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'name',
        label: 'field.certificateName',
        type: 'text',
        valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
    },
    {
        name: 'organization',
        label: 'field.organization',
        type: 'text',
        valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
    },
    ...defaultDateStartEnd(true),
    defaultCheckboxBoolean({ name: 'isNoExpiration', label: 'field.noExpiration' }),
    /* defaultLink({ name: 'link', label: 'Link' }), */
    /* {
        name: 'images',
        label: 'Hình ảnh',
        valid: yup => yup.string().required(_mesRequired),
        type: 'file',
        col: 'col-md-12',
        default: '',
    }, */
    ...withEnglish(defaultDescription({ name: 'description', label: 'field.description', required: false })),
]

export default MODEL
