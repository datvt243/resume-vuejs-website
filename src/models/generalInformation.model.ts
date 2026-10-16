/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { defaultCheckboxBoolean, withEnglish } from '@/types/model.type'
/* import { formatDateToInput } from '@/utilities/index' */

const _mesRequired = 'Vui lòng nhập'

const MODEL: modelItem[] = [
    {
        name: '_id',
        label: 'ID',
        type: 'hidden',
        placeholder: 'Vui lòng nhập Vị trí mong muốn',
        valid: yup => yup.string().nullable().default(null),
        default: null,
    },
    defaultCheckboxBoolean({ name: 'openToWork', label: 'Đang mở tìm việc' }),
    {
        name: 'positionDesired',
        label: 'Vị trí mong muốn',
        type: 'text',
        placeholder: 'Vui lòng nhập Vị trí mong muốn',
        valid: yup => yup.string().max(50).trim().required(_mesRequired),
        default: '',
    },
    ...withEnglish({
        name: 'career',
        label: 'Ngành nghề',
        type: 'text',
        placeholder: 'Vui lòng nhập Ngành nghề',
        valid: yup => yup.string().max(50).trim().required(_mesRequired),
        default: '',
    }),
    {
        name: 'levelCurrent',
        label: 'Cấp bậc hiện tại',
        type: 'select',
        options: [
            { text: 'Thực tập sinh', value: 'intern' },
            { text: 'Nhân viên', value: 'staff' },
            { text: 'Trưởng nhóm', value: 'teamLeader' },
            { text: 'Quản lý', value: 'manager' },
            { text: 'Phó giám đốc', value: 'viceDirector' },
            { text: 'Giám đốc', value: 'director' },
            { text: 'Tổng giám đốc', value: 'ceo' },
        ],
        default: 'staff',
        placeholder: 'Vui lòng nhập Cấp bậc hiện tại',
        valid: yup => yup.string().max(50).trim().required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'levelDesired',
        label: 'Cấp bậc mong muốn',
        type: 'select',
        options: [
            { text: 'Thực tập sinh', value: 'intern' },
            { text: 'Nhân viên', value: 'staff' },
            { text: 'Trưởng nhóm', value: 'teamLeader' },
            { text: 'Quản lý', value: 'manager' },
            { text: 'Phó giám đốc', value: 'viceDirector' },
            { text: 'Giám đốc', value: 'director' },
            { text: 'Tổng giám đốc', value: 'ceo' },
        ],
        default: 'staff',
        placeholder: 'Vui lòng nhập Cấp bậc mong muốn',
        valid: yup => yup.string().max(50).trim().required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'education',
        label: 'Trình độ',
        type: 'select',
        options: [
            { text: 'Trung học phổ thông', value: 'highSchool' },
            { text: 'Trung cấp/Cao đẳng', value: 'associateDegree' },
            { text: 'Đại học', value: 'bachelorDegree' },
            { text: 'Thạc sĩ', value: 'masterDegree' },
            { text: 'Tiến sĩ', value: 'doctorateDegree' },
        ],
        default: 'bachelorDegree',
        placeholder: 'Vui lòng nhập Trình độ',
        valid: yup => yup.string().trim().max(50).required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'yearsOfExperience',
        label: 'Số năm kinh nghiệm',
        type: 'number',
        placeholder: 'Vui lòng nhập Số năm kinh nghiệm',
        valid: yup =>
            yup
                .number('Vui lòng nhập vào số')
                .integer('Vui lòng nhập vào số nguyên')
                .min(0, 'Số năm kinh nghiệm phải lớn hơn 0')
                .required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'salaryDesired',
        label: 'Mức lương mong muốn',
        type: 'currency',
        placeholder: 'Vui lòng nhập Mức lương mong muốn',
        valid: yup =>
            yup
                .number('Vui lòng nhập vào số')
                .integer('Vui lòng nhập vào số nguyên')
                .positive('Mức lương mong muốn phải lớn hơn 0')
                .required(_mesRequired),
        default: '',
    },
    {
        name: 'workForm',
        label: 'Hình thức làm việc',
        type: 'select',
        options: [
            { value: 'fulltime', text: 'Toàn thời gian' },
            { value: 'parttime', text: 'Bán thời gian' },
            { value: 'temporary', text: 'Thời vụ' },
            { value: 'internship', text: 'Thử việc' },
            { value: 'freelance', text: 'Freelance' },
            { value: 'contract', text: 'Hợp đồng' },
            { value: 'remote', text: 'Làm việc từ xa' },
            { value: 'consultant', text: 'Cộng tác viên' },
        ],
        placeholder: 'Vui lòng nhập Mức lương mong muốn',
        valid: yup => yup.string().required(_mesRequired),
        default: 'fulltime',
    },
    {
        name: 'workLocation',
        label: 'Địa điểm làm việc',
        type: 'text',
        default: '',
        placeholder: 'Vui lòng nhập Địa điểm làm việc',
        valid: yup => yup.string().required(_mesRequired),
    },
    ...withEnglish({
        name: 'careerGoal',
        label: 'Mục tiêu công việc',
        type: 'ckediter',
        default: '',
        placeholder: 'Vui lòng nhập Mức lương mong muốn',
        valid: yup => yup.string(),
    }),
]

export default MODEL
