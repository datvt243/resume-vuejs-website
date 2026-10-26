import { describe, it, expect } from 'vitest'
import { socialMediaPayload } from './information.model'

const stored = { github: 'https://github.com/a', linkedin: 'https://linkedin.com/in/a', website: 'https://a.dev' }

describe('socialMediaPayload', () => {
    it('keeps the links the user did not touch', () => {
        expect(socialMediaPayload(stored, { github: 'https://github.com/b' })).toEqual({ ...stored, github: 'https://github.com/b' })
        // vee-validate reports untouched fields as undefined, not missing
        expect(socialMediaPayload(stored, { github: 'https://github.com/b', linkedin: undefined, website: undefined })).toEqual({ ...stored, github: 'https://github.com/b' })
    })

    it('drops a cleared link instead of sending an empty string', () => {
        expect(socialMediaPayload(stored, { linkedin: '' })).toEqual({ github: stored.github, website: stored.website })
    })

    it('handles a candidate with no links yet', () => {
        expect(socialMediaPayload(undefined, { website: 'https://b.dev' })).toEqual({ website: 'https://b.dev' })
        expect(socialMediaPayload(undefined, undefined)).toEqual({})
    })
})
