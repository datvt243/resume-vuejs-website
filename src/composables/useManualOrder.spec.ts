import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useManualOrder } from './useManualOrder'
import { candidateStore } from '@/stores/candidate'

describe('useManualOrder', () => {
    beforeEach(() => {
        localStorage.clear()
        setActivePinia(createPinia())
    })

    it('returns the original order when nothing has been saved yet', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        const items = ref([{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }])

        const { orderedItems } = useManualOrder('education', items)

        expect(orderedItems.value.map(i => i._id)).toEqual(['a', 'b', 'c'])
    })

    it('reorder() persists to localStorage and orderedItems reflects it reactively', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        const items = ref([{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }])

        const { orderedItems, reorder } = useManualOrder('education', items)
        reorder([{ _id: 'c' }, { _id: 'a' }, { _id: 'b' }])

        expect(orderedItems.value.map(i => i._id)).toEqual(['c', 'a', 'b'])
        expect(JSON.parse(localStorage.getItem('cv-manual-order:education:c1')!)).toEqual(['c', 'a', 'b'])
    })

    it('a fresh composable instance picks up a previously-saved order on init', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        localStorage.setItem('cv-manual-order:education:c1', JSON.stringify(['b', 'a']))
        const items = ref([{ _id: 'a' }, { _id: 'b' }])

        const { orderedItems } = useManualOrder('education', items)

        expect(orderedItems.value.map(i => i._id)).toEqual(['b', 'a'])
    })

    it('appends records not present in the saved order to the end, keeping their natural order', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        localStorage.setItem('cv-manual-order:education:c1', JSON.stringify(['b']))
        // 'a' and 'c' are new records added after the last manual reorder
        const items = ref([{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }])

        const { orderedItems } = useManualOrder('education', items)

        expect(orderedItems.value.map(i => i._id)).toEqual(['b', 'a', 'c'])
    })

    it('drops a saved id that no longer exists in the real list (deleted record) without crashing', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        localStorage.setItem('cv-manual-order:education:c1', JSON.stringify(['deleted-id', 'a', 'b']))
        const items = ref([{ _id: 'a' }, { _id: 'b' }])

        const { orderedItems } = useManualOrder('education', items)

        expect(orderedItems.value.map(i => i._id)).toEqual(['a', 'b'])
    })

    it('scopes the storage key per candidate AND per collection — no cross-contamination', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        const eduItems = ref([{ _id: 'a' }, { _id: 'b' }])
        const expItems = ref([{ _id: 'a' }, { _id: 'b' }])

        const education = useManualOrder('education', eduItems)
        const experience = useManualOrder('experience', expItems)

        education.reorder([{ _id: 'b' }, { _id: 'a' }])

        expect(education.orderedItems.value.map(i => i._id)).toEqual(['b', 'a'])
        // experience's own order is untouched by education's reorder
        expect(experience.orderedItems.value.map(i => i._id)).toEqual(['a', 'b'])
    })

    it('does not throw when localStorage is unavailable (e.g. private-mode quota error)', () => {
        candidateStore().setCandidate({ _id: 'c1' })
        const originalSetItem = Storage.prototype.setItem
        Storage.prototype.setItem = () => {
            throw new Error('QuotaExceededError')
        }

        const items = ref([{ _id: 'a' }, { _id: 'b' }])
        const { orderedItems, reorder } = useManualOrder('education', items)

        expect(() => reorder([{ _id: 'b' }, { _id: 'a' }])).not.toThrow()
        // in-memory state still updates even though persistence silently failed
        expect(orderedItems.value.map(i => i._id)).toEqual(['b', 'a'])

        Storage.prototype.setItem = originalSetItem
    })
})
