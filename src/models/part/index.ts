import type { modelItem } from '@/types/model.type.ts'
const _mesRequired = 'validation.required'

export const startDate: modelItem = {
    name: 'startDate',
    label: 'field.startDate',
    type: 'date',
    valid: yup => yup.number().required(_mesRequired),
    col: 'col-md-6',
    convertTo: 'date',
    default: +new Date(),
    monthPicker: true,
}

export const endDate: modelItem = {
    name: 'endDate',
    label: 'field.endDate',
    type: 'date',
    valid: yup => yup.number().nullable(),
    col: 'col-md-6',
    convertTo: 'date',
    default: +new Date(),
    monthPicker: true,
}
