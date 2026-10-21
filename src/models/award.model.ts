/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    {
        name: '_id',
        label: 'ID',
        type: 'hidden',
        valid: yup => yup.string().trim().nullable().default(null),
        col: 'col-md-12',
        default: null,
    },
    {
        name: 'name',
        label: 'field.awardName',
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
    {
        name: 'issueDate',
        label: 'field.awardDate',
        type: 'date',
        valid: yup => yup.number().required(_mesRequired),
        col: 'col-md-6',
        convertTo: 'date',
        default: +new Date(),
        monthPicker: true,
    },
    {
        name: 'link',
        label: 'Link',
        type: 'text',
        valid: yup => yup.string().trim().url('validation.urlInvalid').nullable(),
        col: 'col-md-12',
        default: '',
    },
    /* {
        name: 'images',
        label: 'Hình ảnh',
        valid: yup => yup.string().trim().required(_mesRequired),
        type: 'file',
        col: 'col-md-12',
        default: '',
    }, */
    ...withEnglish({
        name: 'description',
        label: 'field.description',
        type: 'ckediter',
        valid: yup => yup.string().trim().required(_mesRequired),
        col: 'col-md-12',
        convertTo: 'truncate',
        default: '',
    }),
]

export default MODEL
