import { describe, it, expect, beforeEach } from 'vitest'
import { useActiveProfile } from './useActiveProfile'

const STORAGE_KEY = 'cvActiveProfileId'

describe('useActiveProfile', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('defaults to no active profile (empty string = no filter) when nothing is stored', () => {
        const { activeProfileId } = useActiveProfile()
        expect(activeProfileId.value).toBe('')
    })

    it('restores a previously-persisted profile id', () => {
        localStorage.setItem(STORAGE_KEY, 'profile-123')
        const { activeProfileId } = useActiveProfile()
        expect(activeProfileId.value).toBe('profile-123')
    })

    it('setActiveProfile persists a chosen id to localStorage', async () => {
        const { activeProfileId, setActiveProfile } = useActiveProfile()
        setActiveProfile('profile-abc')
        expect(activeProfileId.value).toBe('profile-abc')
        // watch() flushes on the next microtask/tick, not synchronously.
        await Promise.resolve()
        expect(localStorage.getItem(STORAGE_KEY)).toBe('profile-abc')
    })

    it('setActiveProfile with an empty/falsy value clears the stored id (back to "no filter")', async () => {
        const { activeProfileId, setActiveProfile } = useActiveProfile()
        setActiveProfile('profile-abc')
        await Promise.resolve()
        expect(localStorage.getItem(STORAGE_KEY)).toBe('profile-abc')

        setActiveProfile('')
        expect(activeProfileId.value).toBe('')
        await Promise.resolve()
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
})
