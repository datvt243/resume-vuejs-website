/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultCheckboxBoolean, withEnglish } from '@/types/model.type'
/* import { formatDateToInput } from '@/utilities/index' */

const _mesRequired = 'validation.required'

const MODEL: modelItem[] = [
    {
        name: '_id',
        label: 'ID',
        type: 'hidden',
        valid: yup => yup.string().nullable().default(null),
        default: null,
    },
    defaultCheckboxBoolean({ name: 'openToWork', label: 'field.openToWork' }),
    {
        name: 'positionDesired',
        label: 'field.positionDesired',
        type: 'text',
        valid: yup => yup.string().max(50, withParams('validation.maxChars', { max: 50 })).trim().required(_mesRequired),
        default: '',
    },
    ...withEnglish({
        name: 'career',
        label: 'field.career',
        type: 'text',
        valid: yup => yup.string().max(50, withParams('validation.maxChars', { max: 50 })).trim().required(_mesRequired),
        default: '',
    }),
    {
        name: 'levelCurrent',
        label: 'field.levelCurrent',
        type: 'select',
        options: [
            { text: 'option.level.intern', value: 'intern' },
            { text: 'option.level.staff', value: 'staff' },
            { text: 'option.level.teamLeader', value: 'teamLeader' },
            { text: 'option.level.manager', value: 'manager' },
            { text: 'option.level.viceDirector', value: 'viceDirector' },
            { text: 'option.level.director', value: 'director' },
            { text: 'option.level.ceo', value: 'ceo' },
        ],
        default: 'staff',
        valid: yup => yup.string().max(50, withParams('validation.maxChars', { max: 50 })).trim().required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'levelDesired',
        label: 'field.levelDesired',
        type: 'select',
        options: [
            { text: 'option.level.intern', value: 'intern' },
            { text: 'option.level.staff', value: 'staff' },
            { text: 'option.level.teamLeader', value: 'teamLeader' },
            { text: 'option.level.manager', value: 'manager' },
            { text: 'option.level.viceDirector', value: 'viceDirector' },
            { text: 'option.level.director', value: 'director' },
            { text: 'option.level.ceo', value: 'ceo' },
        ],
        default: 'staff',
        valid: yup => yup.string().max(50, withParams('validation.maxChars', { max: 50 })).trim().required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'education',
        label: 'field.educationLevel',
        type: 'select',
        options: [
            { text: 'option.degree.highSchool', value: 'highSchool' },
            { text: 'option.degree.associateDegree', value: 'associateDegree' },
            { text: 'option.degree.bachelorDegree', value: 'bachelorDegree' },
            { text: 'option.degree.masterDegree', value: 'masterDegree' },
            { text: 'option.degree.doctorateDegree', value: 'doctorateDegree' },
        ],
        default: 'bachelorDegree',
        valid: yup => yup.string().trim().max(50, withParams('validation.maxChars', { max: 50 })).required(_mesRequired),
        col: 'col-md-6',
    },
    {
        name: 'yearsOfExperience',
        label: 'field.yearsOfExperience',
        type: 'number',
        inputmode: 'numeric',
        valid: yup =>
            yup
                .number()
                .typeError('validation.number')
                .integer('validation.integer')
                .min(0, 'validation.yearsOfExperienceMin')
                .required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'salaryDesired',
        label: 'field.salaryDesired',
        type: 'currency',
        valid: yup =>
            yup
                .number()
                .typeError('validation.number')
                .integer('validation.integer')
                .positive('validation.salaryPositive')
                .required(_mesRequired),
        default: '',
    },
    {
        name: 'workForm',
        label: 'field.workForm',
        type: 'select',
        options: [
            { value: 'fulltime', text: 'option.workForm.fulltime' },
            { value: 'parttime', text: 'option.workForm.parttime' },
            { value: 'temporary', text: 'option.workForm.temporary' },
            { value: 'internship', text: 'option.workForm.internship' },
            { value: 'freelance', text: 'option.workForm.freelance' },
            { value: 'contract', text: 'option.workForm.contract' },
            { value: 'remote', text: 'option.workForm.remote' },
            { value: 'consultant', text: 'option.workForm.consultant' },
        ],
        valid: yup => yup.string().required(_mesRequired),
        default: 'fulltime',
    },
    {
        name: 'workLocation',
        label: 'field.workLocation',
        type: 'text',
        default: '',
        valid: yup => yup.string().required(_mesRequired),
    },
    ...withEnglish({
        name: 'careerGoal',
        label: 'field.careerGoal',
        type: 'ckediter',
        default: '',
        valid: yup => yup.string(),
    }),
]

export default MODEL
