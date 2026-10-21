/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId, defaultDateStartEnd, defaultDescription, defaultLink, defaultCheckboxBoolean, withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'name',
        label: 'field.projectName',
        type: 'text',
        valid: yup => yup.string().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
    },
    {
        name: 'position',
        label: 'field.position',
        type: 'text',
        valid: yup => yup.string().max(50, withParams('validation.maxChars', { max: 50 })).required(_mesRequired),
        default: '',
    },
    {
        name: 'technology',
        label: 'field.technology',
        type: 'text',
        valid: yup => yup.string().required(_mesRequired),
        default: '',
    },

    ...defaultDateStartEnd(true),
    defaultCheckboxBoolean({ name: 'isWorking', label: 'field.isWorking' }),

    defaultLink({ name: 'link', label: 'Link' }),
    /* 
    {
        name: 'isWorking',
        label: 'field.isWorking',
        type: 'checkbox',
        placeholder: '',
        default: false,
        valid: yup => yup.boolean(),
        col: 'col-md-12',
        cellClass: 'text-center',
        convertTo: 'boolean',
        checkedValue: false,
    },
    {
        name: 'images',
        label: 'Hình ảnh',
        valid: yup => yup.string().required(_mesRequired),
        type: 'file',
        col: 'col-md-12',
        default: '',
    }, */
    ...withEnglish(defaultDescription({ name: 'description', label: 'field.description' })),
]

export default MODEL
