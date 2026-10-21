/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { phoneRegex } from '@/config/regex.config'
import { EN_FIELD_SUFFIX } from '@/utilities/index'
import { withParams } from '@/i18n'

type inputType =
    | 'text'
    | 'email'
    | 'number'
    | 'hidden'
    | 'password'
    | 'file'
    | 'date'
    | 'currency'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'textarea'
    | 'ckediter'

interface Options {
    value: string | number | boolean
    text: string
}

const _mesRequired = 'validation.required'

interface Part {
    name: string
    label: string
    col?: string
    placeholder?: string
    required?: boolean
    attrs?: Record<string, any>
}

export interface modelItem {
    // request
    name: string
    label: string
    type: inputType
    default: any
    // optional
    text?: string
    placeholder?: string
    valid?: (_yup: any) => any
    col?: string
    convertTo?: string
    checkedValue?: boolean
    options?: Options[]
    cellClass?: string
    // VeeForm hides the field while this returns false (values and validation stay)
    showIf?: (_values: Record<string, any>) => boolean
    [key: string]: any
}

export const defaultId: modelItem = {
    name: '_id',
    label: 'ID',
    type: 'hidden',
    valid: yup => yup.string().nullable().default(null),
    col: 'col-md-12',
    default: null,
}

export const defaultDescription = function (props: Part): modelItem {
    const result: modelItem = {
        name: props.name,
        label: props.label,
        type: 'ckediter',
        valid: yup => yup.string().trim().required(_mesRequired),
        col: props?.col || 'col-md-12',
        convertTo: 'truncate',
        default: '',
    }
    const { required = false } = props
    if (required) {
        result.valid = yup => yup.string().trim().required(_mesRequired)
    } else {
        result.valid = yup => yup.string().trim()
    }
    return result
}

/**
 * Pair a localized (`{ vi, en }` in the backend) field with its English
 * sibling `<name>_en`. VeeForm shows one or the other via its VI | EN
 * toggle (`lang`); the English copy keeps the same rules minus `required`.
 */
export const withEnglish = function (item: modelItem): modelItem[] {
    const { valid } = item
    return [
        { ...item, lang: 'vi' },
        {
            ...item,
            name: `${item.name}${EN_FIELD_SUFFIX}`,
            label: withParams('form.englishField', { label: item.label }),
            placeholder: '',
            lang: 'en',
            ...(valid && { valid: (yup: any) => valid(yup).notRequired() }),
        },
    ]
}

export const defaultLink = function (props: Part): modelItem {
    return {
        name: props.name,
        label: props.label,
        type: 'text',
        valid: yup => yup.string().url('validation.urlInvalid').nullable(),
        col: props?.col || 'col-md-12',
        default: '',
    }
}

export const defaultDate = function (props: Part): modelItem {
    return {
        name: props.name,
        label: props.label,
        type: 'date',
        valid: yup => yup.number().required(_mesRequired),
        default: +new Date('1990-01-01'),
        col: props?.col || 'col-md-12',
    }
}
export const defaultDateStartEnd = function (isMonthPicker = false): modelItem[] {
    const _startLabel = 'field.startDate',
        _endLabel = 'field.endDate'

    // endDate mặc định phải SAU startDate — trước đây cả 2 cùng dùng
    // `+new Date()`, ở monthPicker mode 2 giá trị luôn bị làm tròn về
    // cùng tháng/năm, khiến backend từ chối "endDate phải lớn hơn
    // startDate" ngay khi tạo mới mà chưa hề đụng tới 2 field này
    const _defaultEndDate = new Date()
    _defaultEndDate.setMonth(_defaultEndDate.getMonth() + 1)

    return [
        {
            name: 'startDate',
            label: _startLabel,
            type: 'date',
            valid: yup => yup.number().required(_mesRequired),
            col: 'col-md-6',
            convertTo: 'date',
            default: +new Date(),
            ...(isMonthPicker && { monthPicker: true }),
        },
        {
            name: 'endDate',
            label: _endLabel,
            type: 'date',
            valid: yup => yup.number().required(_mesRequired).min(yup.ref('startDate'), 'validation.endAfterStart'),
            col: 'col-md-6',
            convertTo: 'date',
            default: +_defaultEndDate,
            ...(isMonthPicker && { monthPicker: true }),
        },
    ]
}

export const defaultCheckboxBoolean = function (props: Part): modelItem {
    const { attrs = {} } = props
    return {
        name: props.name,
        label: props.label,
        type: 'checkbox',
        placeholder: props?.placeholder || '',
        default: false,
        valid: yup => yup.boolean(),
        col: props?.col || 'col-md-12',
        cellClass: 'text-center',
        convertTo: 'boolean',
        checkedValue: false,
        ...(Object.keys(attrs).length && { ...attrs }),
    }
}

export const defaultPhone = function (props: Part): modelItem {
    return {
        name: props.name,
        label: props.label,
        type: 'text',
        inputmode: 'tel',
        valid: yup =>
            yup
                .string()
                .matches(phoneRegex, {
                    excludeEmptyString: true,
                    message: 'validation.phoneInvalid',
                })
                .required(_mesRequired),
        default: '',
        col: 'col-md-12',
    }
}
