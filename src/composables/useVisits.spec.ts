import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useVisits } from './useVisits'
import { candidateStore } from '@/stores/candidate'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({
    handleBase: (...args: unknown[]) => handleBaseMock(...args),
}))

vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))

function withUseVisits() {
    let result: any
    mount(
        defineComponent({
            setup() {
                result = useVisits()
                return () => h('div')
            },
        }),
    )
    return result
}

describe('useVisits', () => {
    beforeEach(() => {
        handleBaseMock.mockReset()
        setActivePinia(createPinia())
    })

    it('reads the list from data and the count from meta.total, and caches both', async () => {
        const visits = [{ _id: 'a' }, { _id: 'b' }]
        handleBaseMock.mockImplementation(async (_opt, _props, cb) => cb({ success: true, message: '', data: visits, meta: { total: 1375 } }))

        const result = withUseVisits()
        await flushPromises()

        expect(handleBaseMock.mock.calls[0][0]).toEqual({ method: 'get', url: 'candidate/visits' })
        expect(result.count.value).toBe(1375)
        expect(result.visits.value).toEqual(visits)
        expect((candidateStore().getCandidate as any).visitCount).toBe(1375)
        expect((candidateStore().getCandidate as any).visits).toEqual(visits)
    })

    it('falls back to the list length without meta, and to empty for a non-array data', async () => {
        handleBaseMock.mockImplementationOnce(async (_opt, _props, cb) => cb({ success: true, message: '', data: [{ _id: 'a' }] }))
        const first = withUseVisits()
        await flushPromises()
        expect(first.count.value).toBe(1)

        setActivePinia(createPinia())
        handleBaseMock.mockImplementationOnce(async (_opt, _props, cb) => cb({ success: true, message: '', data: null }))
        const second = withUseVisits()
        await flushPromises()
        expect(second.count.value).toBe(0)
        expect(second.visits.value).toEqual([])
    })

    it('does not refetch when the count is already cached', async () => {
        candidateStore().setCandidateByField({ visitCount: 0, visits: [] })
        withUseVisits()
        await flushPromises()
        expect(handleBaseMock).not.toHaveBeenCalled()
    })
})
