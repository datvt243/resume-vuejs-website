/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { i18n, withParams } from '@/i18n'
import { defaultId, withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

// endDate mặc định phải SAU startDate — trước đây cả 2 cùng dùng
// `+new Date()`, ở monthPicker mode 2 giá trị luôn bị làm tròn về cùng
// tháng/năm, khiến backend từ chối "endDate phải lớn hơn startDate" ngay
// khi tạo mới mà chưa hề đụng tới 2 field này
const _defaultEndDate = new Date()
_defaultEndDate.setMonth(_defaultEndDate.getMonth() + 1)

// LinkedIn's career break types, labels from the backend `cv.careerBreakTypes`
export const CAREER_BREAK_TYPES: Record<string, { vi: string; en: string }> = {
    careerTransition: { vi: 'Chuyển đổi nghề nghiệp', en: 'Career transition' },
    caregiving: { vi: 'Chăm sóc người thân', en: 'Caregiving' },
    fullTimeParenting: { vi: 'Chăm sóc con toàn thời gian', en: 'Full-time parenting' },
    gapYear: { vi: 'Năm nghỉ (gap year)', en: 'Gap year' },
    healthAndWellbeing: { vi: 'Sức khoẻ', en: 'Health and well-being' },
    layoff: { vi: 'Bị cắt giảm nhân sự', en: 'Layoff or position eliminated' },
    personalGoal: { vi: 'Theo đuổi mục tiêu cá nhân', en: 'Personal goal pursuit' },
    professionalDevelopment: { vi: 'Phát triển chuyên môn', en: 'Professional development' },
    relocation: { vi: 'Chuyển nơi ở', en: 'Relocation' },
    retirement: { vi: 'Nghỉ hưu', en: 'Retirement' },
    travel: { vi: 'Du lịch', en: 'Travel' },
    voluntaryWork: { vi: 'Hoạt động tình nguyện', en: 'Voluntary work' },
}
const CAREER_BREAK_LABEL = { vi: 'Nghỉ việc tạm thời', en: 'Career break' }

export function experienceTitle(exp: { isCareerBreak?: boolean; careerBreakType?: string; company?: string }, lang = i18n.global.locale.value as 'vi' | 'en'): string {
    if (!exp?.isCareerBreak) return exp?.company || ''
    const type = CAREER_BREAK_TYPES[exp.careerBreakType || '']?.[lang]
    return type ? `${CAREER_BREAK_LABEL[lang]} — ${type}` : CAREER_BREAK_LABEL[lang]
}

// a career break has no company/position and a normal entry no break type —
// clearing them stops a toggled entry from sending a stale value
export function careerBreakPayload<T extends Record<string, any>>(values: T): T {
    const isCareerBreak = !!values.isCareerBreak
    return isCareerBreak
        ? { ...values, isCareerBreak, company: '', position: '' }
        : { ...values, isCareerBreak, careerBreakType: '' }
}

const isCareerBreak = (values: Record<string, any>) => !!values.isCareerBreak

const MODEL: modelItem[] = [
    defaultId,
    {
        name: 'isCareerBreak',
        label: 'field.isCareerBreak',
        type: 'checkbox',
        placeholder: '',
        default: false,
        valid: yup => yup.boolean(),
        col: 'col-md-12',
        convertTo: 'boolean',
        checkedValue: false,
    },
    {
        name: 'careerBreakType',
        label: 'field.careerBreakType',
        type: 'select',
        // getter: the backend sends both labels, so pick the one for the current UI language at render time
        options: Object.entries(CAREER_BREAK_TYPES).map(([value, labels]) => ({
            value,
            get text() {
                return labels[i18n.global.locale.value as 'vi' | 'en']
            },
        })),
        valid: yup =>
            yup.string().when('isCareerBreak', {
                is: true,
                then: (s: any) => s.oneOf(Object.keys(CAREER_BREAK_TYPES), 'validation.careerBreakTypeInvalid').required('validation.selectRequired'),
                otherwise: (s: any) => s.nullable(),
            }),
        default: '',
        showIf: isCareerBreak,
    },
    {
        name: 'company',
        label: 'field.companyName',
        type: 'text',
        valid: yup =>
            yup
                .string()
                .max(100, withParams('validation.maxChars', { max: 100 }))
                .when('isCareerBreak', { is: true, otherwise: (s: any) => s.required(_mesRequired) }),
        default: '',
        showIf: (values: Record<string, any>) => !isCareerBreak(values),
    },
    {
        name: 'position',
        label: 'field.position',
        type: 'text',
        valid: yup =>
            yup
                .string()
                .max(50, withParams('validation.maxChars', { max: 50 }))
                .when('isCareerBreak', { is: true, otherwise: (s: any) => s.required(_mesRequired) }),
        default: '',
        showIf: (values: Record<string, any>) => !isCareerBreak(values),
    },
    {
        name: 'startDate',
        label: 'field.startDate',
        type: 'date',
        valid: yup => yup.number().required(_mesRequired),
        col: 'col-md-6',
        convertTo: 'date',
        default: +new Date(),
        monthPicker: true,
    },
    {
        name: 'endDate',
        label: 'field.endDate',
        type: 'date',
        valid: yup => yup.number().nullable(),
        col: 'col-md-6',
        convertTo: 'date',
        default: +_defaultEndDate,
        monthPicker: true,
    },
    {
        name: 'isCurrent',
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
    ...withEnglish({
        name: 'description',
        label: 'field.description',
        type: 'ckediter',
        valid: yup => yup.string().required(_mesRequired),
        col: 'col-md-12',
        convertTo: 'truncate',
        default: '',
    }),
]

export default MODEL
