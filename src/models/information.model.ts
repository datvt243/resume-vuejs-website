/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { defaultId, defaultDescription, defaultDate, defaultPhone, withEnglish } from '@/types/model.type'

const _mesRequired = 'Vui lòng nhập'

const modalDefault: modelItem[] = [
    defaultId,
    {
        name: 'firstName',
        label: 'Họ',
        type: 'text',
        placeholder: 'Vui lòng nhập Họ',
        valid: yup => yup.string().min(0).max(10, 'Tối đa 10 ký tự').required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'lastName',
        label: 'Tên',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên',
        valid: yup => yup.string().min(0).max(30, 'Tối đa 30 ký tự').required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'gender',
        label: 'Giới tính',
        type: 'select',
        options: [
            { value: 0, text: 'Nữ' },
            { value: 1, text: 'Nam' },
        ],
        valid: yup => yup.string().required(_mesRequired),
        default: 0,
        col: 'col-md-6',
    },
    {
        name: 'marital',
        label: 'Tình trạng hôn nhân',
        type: 'select',
        options: [
            { value: 0, text: 'Độc thân' },
            { value: 1, text: 'Đã kết hôn' },
        ],
        valid: yup => yup.string().required(_mesRequired),
        default: 0,
        col: 'col-md-6',
    },
    defaultDate({ name: 'birthday', label: 'Ngày sinh' }),
    {
        name: 'address',
        label: 'Địa chỉ',
        type: 'text',
        valid: yup => yup.string().required(_mesRequired),
        default: '',
        col: 'col-md-12',
    },

    defaultPhone({ name: 'phone', label: 'Số điện thoại' }),
    ...withEnglish(defaultDescription({ name: 'introduction', label: 'Giới thiệu bản thân' })),
]

const modalSocial: modelItem[] = [
    {
        name: 'socialMedia.github',
        label: 'Github',
        type: 'text',
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'socialMedia.linkedin',
        label: 'Linkedin',
        type: 'text',
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'socialMedia.website',
        label: 'Website',
        type: 'text',
        default: '',
        col: 'col-md-12',
    },
]

export { modalDefault, modalSocial }
