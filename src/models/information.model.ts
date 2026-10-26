/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { modelItem } from '@/types/model.type.ts'
import { withParams } from '@/i18n'
import { defaultId, defaultDescription, defaultDate, defaultPhone, withEnglish } from '@/types/model.type'

const _mesRequired = 'validation.required'

const modalDefault: modelItem[] = [
    defaultId,
    {
        name: 'firstName',
        label: 'field.familyName',
        type: 'text',
        autocomplete: 'family-name',
        valid: yup => yup.string().min(0).max(10, withParams('validation.maxChars', { max: 10 })).required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'lastName',
        label: 'field.givenName',
        type: 'text',
        autocomplete: 'given-name',
        valid: yup => yup.string().min(0).max(30, withParams('validation.maxChars', { max: 30 })).required(_mesRequired),
        default: '',
        col: 'col-md-6',
    },
    {
        name: 'gender',
        label: 'field.gender',
        type: 'select',
        options: [
            { value: 0, text: 'option.gender.female' },
            { value: 1, text: 'option.gender.male' },
        ],
        valid: yup => yup.string().required(_mesRequired),
        default: 0,
        col: 'col-md-6',
    },
    {
        name: 'marital',
        label: 'field.marital',
        type: 'select',
        options: [
            { value: 0, text: 'option.marital.single' },
            { value: 1, text: 'option.marital.married' },
        ],
        valid: yup => yup.string().required(_mesRequired),
        default: 0,
        col: 'col-md-6',
    },
    defaultDate({ name: 'birthday', label: 'field.birthday' }),
    {
        name: 'address',
        label: 'field.address',
        type: 'text',
        autocomplete: 'street-address',
        valid: yup => yup.string().required(_mesRequired),
        default: '',
        col: 'col-md-12',
    },

    { ...defaultPhone({ name: 'phone', label: 'field.phone' }), autocomplete: 'tel' },
    ...withEnglish(defaultDescription({ name: 'introduction', label: 'field.introduction' })),
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

// PATCH replaces the whole `socialMedia` object and the form only submits links the user
// touched (untouched ones are `undefined`) — keep the stored ones, drop cleared ones (the API rejects '', omitting removes it)
export function socialMediaPayload(stored: Record<string, string> = {}, edited: Record<string, string | undefined> = {}): Record<string, string> {
    const touched = Object.entries(edited).filter(([, v]) => v !== undefined)
    return Object.fromEntries(Object.entries({ ...stored, ...Object.fromEntries(touched) }).filter((e): e is [string, string] => !!e[1]))
}

export { modalDefault, modalSocial }
