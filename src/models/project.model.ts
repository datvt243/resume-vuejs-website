/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId, defaultDateStartEnd, defaultDescription, defaultLink, defaultCheckboxBoolean, withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

export const PROJECT_TYPES = ['company', 'personal']

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'type',
        label: 'field.projectType',
        type: 'select',
        options: PROJECT_TYPES.map(value => ({ value, text: `option.projectType.${value}` })),
        valid: yup => yup.string().oneOf(PROJECT_TYPES).required(_mesRequired),
        default: 'personal',
        col: 'col-md-6',
    },
    {
        // options are filled in at runtime from the candidate's experiences (PageProject)
        name: 'experienceId',
        label: 'field.linkedExperience',
        type: 'select',
        options: [],
        valid: yup =>
            yup
                .string()
                .nullable()
                .when('type', { is: 'company', then: (s: any) => s.required(_mesRequired) }),
        default: '',
        col: 'col-md-6',
        showIf: (values: Record<string, any>) => values.type === 'company',
    },
    {
        name: 'name',
        label: 'field.projectName',
        type: 'text',
        valid: yup => yup.string().max(50, withParams('validation.maxChars', { max: 50 })).required(_mesRequired),
        default: '',
    },
    {
        name: 'position',
        label: 'field.position',
        type: 'text',
        valid: yup => yup.string().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
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
