/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { defaultId, defaultDescription, defaultDateStartEnd, defaultCheckboxBoolean, withEnglish } from '@/types/model.type'

const _mesRequired = 'Vui lòng nhập'

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'name',
        label: 'Tên Chứng chỉ',
        type: 'text',
        placeholder: 'Vui lòng nhập Tên Chứng chỉ',
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
    ...defaultDateStartEnd(true),
    defaultCheckboxBoolean({ name: 'isNoExpiration', label: 'Không thời hạn' }),
    /* defaultLink({ name: 'link', label: 'Link' }), */
    /* {
        name: 'images',
        label: 'Hình ảnh',
        valid: yup => yup.string().required(_mesRequired),
        type: 'file',
        col: 'col-md-12',
        default: '',
    }, */
    ...withEnglish(defaultDescription({ name: 'description', label: 'Mô tả', required: false })),
]

export default MODEL
