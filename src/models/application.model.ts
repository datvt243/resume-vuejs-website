/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId } from '@/types/model.type'

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'company',
        label: 'field.company',
        type: 'text',
        valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'position',
        label: 'field.appliedPosition',
        type: 'text',
        valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'appliedDate',
        label: 'field.appliedDate',
        type: 'date',
        valid: yup => yup.number().required(_mesRequired),
        col: 'col-md-6',
        convertTo: 'date',
        default: +new Date(),
    },
    {
        name: 'status',
        label: 'field.status',
        type: 'select',
        options: [
            { text: 'option.applicationStatus.applied', value: 'applied' },
            { text: 'option.applicationStatus.interview', value: 'interview' },
            { text: 'option.applicationStatus.offer', value: 'offer' },
            { text: 'option.applicationStatus.rejected', value: 'rejected' },
        ],
        default: 'applied',
        valid: yup => yup.string().required(_mesRequired),
        col: 'col-md-6',
    },
    {
        // options are filled in at runtime from the candidate's profiles; '' unlinks
        name: 'profileId',
        label: 'field.cvProfile',
        type: 'select',
        options: [],
        default: '',
        valid: yup => yup.string().nullable(),
        col: 'col-md-12',
    },
    {
        name: 'jobLink',
        label: 'field.jobLink',
        type: 'text',
        valid: yup => yup.string().trim().max(500, withParams('validation.maxChars', { max: 500 })).url('validation.urlInvalid').nullable(),
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'note',
        label: 'field.note',
        type: 'textarea',
        valid: yup => yup.string().trim().max(1000, withParams('validation.maxChars', { max: 1000 })),
        default: '',
        col: 'col-md-12',
    },
]

export default MODEL
