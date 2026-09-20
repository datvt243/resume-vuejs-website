/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { defaultId } from '@/types/model.type'

const _mesRequired = 'Vui lòng nhập'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'company',
        label: 'Công ty',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên công ty',
        valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'position',
        label: 'Vị trí ứng tuyển',
        type: 'text',
        placeholder: 'Vui lòng nhập Vị trí ứng tuyển',
        valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'appliedDate',
        label: 'Ngày nộp đơn',
        type: 'date',
        placeholder: 'Vui lòng nhập Ngày nộp đơn',
        valid: yup => yup.number().required(_mesRequired),
        col: 'col-md-6',
        convertTo: 'date',
        default: +new Date(),
    },
    {
        name: 'status',
        label: 'Trạng thái',
        type: 'select',
        options: [
            { text: 'Đã nộp', value: 'applied' },
            { text: 'Phỏng vấn', value: 'interview' },
            { text: 'Offer', value: 'offer' },
            { text: 'Từ chối', value: 'rejected' },
        ],
        default: 'applied',
        placeholder: 'Vui lòng chọn Trạng thái',
        valid: yup => yup.string().required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'jobLink',
        label: 'Link tin tuyển dụng',
        type: 'text',
        placeholder: 'Vui lòng nhập Link tin tuyển dụng',
        valid: yup => yup.string().trim().max(500, 'Tối đa 500 ký tự').url('Link không đúng định dạng').nullable(),
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'note',
        label: 'Ghi chú',
        type: 'textarea',
        placeholder: 'Vui lòng nhập Ghi chú',
        valid: yup => yup.string().trim().max(1000, 'Tối đa 1000 ký tự'),
        default: '',
        col: 'col-md-12',
    },
]

export default MODEL
