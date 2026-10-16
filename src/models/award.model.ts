/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withEnglish } from '@/types/model.type'

const _mesRequired = 'Vui lòng nhập'

const MODEL: modelItem[] = [
    {
        name: '_id',
        label: 'ID',
        type: 'hidden',
        placeholder: 'Vui lòng nhập',
        valid: yup => yup.string().trim().nullable().default(null),
        col: 'col-md-12',
        default: null,
    },
    {
        name: 'name',
        label: 'Tên Chứng chỉ',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên giải thưởng chỉ',
        valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
        default: '',
    },
    {
        name: 'organization',
        label: 'Tên tổ chức',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên tổ chức',
        valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
        default: '',
    },
    {
        name: 'issueDate',
        label: 'Ngày nhận giải',
        type: 'date',
        placeholder: 'Vui lòng nhập Ngày bắt đầu',
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
        valid: yup => yup.string().trim().url().nullable(),
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
        label: 'Mô tả',
        type: 'ckediter',
        valid: yup => yup.string().trim().required(_mesRequired),
        col: 'col-md-12',
        convertTo: 'truncate',
        default: '',
    }),
]

export default MODEL
