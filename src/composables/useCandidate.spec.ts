import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useCandidate } from './useCandidate'
import { candidateStore } from '@/stores/candidate'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({
    handleBase: (...args: unknown[]) => handleBaseMock(...args),
}))

vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))

// `onBeforeMount` inside the composable needs an active component instance.
// `useCandidate`'s return type has a dynamic `[field]: result` key, which
// TypeScript can't narrow per call site (falls back to a wide union
// including the other returned functions) — cast to `any` here rather
// than changing the composable's typing, which is out of this task's scope.
function withUseCandidate(field: string, collection: string | null = null) {
    let result: any
    const wrapper = mount(
        defineComponent({
            setup() {
                result = useCandidate({ field, collection })
                return () => h('div')
            },
        }),
    )
    return { result, wrapper }
}

describe('useCandidate', () => {
    beforeEach(() => {
        handleBaseMock.mockReset()
        setActivePinia(createPinia())
    })

    it('fetches from the API on mount when there is no cached data, then caches it in candidateStore', async () => {
        handleBaseMock.mockImplementation(async (_opt, _props, cb) =>
            cb({ success: true, message: '', data: [{ _id: '1', startDate: 100 }] }),
        )

        const { result } = withUseCandidate('educations')
        await flushPromises()

        expect(handleBaseMock).toHaveBeenCalledTimes(1)
        const [axiosOpt] = handleBaseMock.mock.calls[0]
        // no explicit collection given -> strips the trailing 's' from the field name
        expect(axiosOpt).toMatchObject({ method: 'get', url: 'education/' })
        expect(result.educations.value).toEqual([{ _id: '1', startDate: 100 }])
        expect(candidateStore().getCandidateByField('educations')).toEqual([{ _id: '1', startDate: 100 }])
    })

    it('uses the explicit collection name instead of the field-name heuristic when given', async () => {
        handleBaseMock.mockImplementation(async (_opt, _props, cb) => cb({ success: true, message: '', data: [] }))

        withUseCandidate('educations', 'education-override')
        await flushPromises()

        const [axiosOpt] = handleBaseMock.mock.calls[0]
        expect(axiosOpt).toMatchObject({ url: 'education-override/' })
    })

    it('skips the fetch entirely when candidateStore already has cached data for that field', async () => {
        candidateStore().setCandidateByField({ educations: [{ _id: 'cached' }] })

        const { result } = withUseCandidate('educations')
        await flushPromises()

        expect(handleBaseMock).not.toHaveBeenCalled()
        expect(result.educations.value).toEqual([{ _id: 'cached' }])
    })

    it('sorts fetched list results by startDate descending', async () => {
        handleBaseMock.mockImplementation(async (_opt, _props, cb) =>
            cb({
                success: true,
                message: '',
                data: [
                    { _id: 'old', startDate: 100 },
                    { _id: 'new', startDate: 300 },
                    { _id: 'mid', startDate: 200 },
                ],
            }),
        )

        const { result } = withUseCandidate('educations')
        await flushPromises()

        expect(result.educations.value.map((e: { _id: string }) => e._id)).toEqual(['new', 'mid', 'old'])
    })

    it('addRecordToList pushes a brand-new record (no _id)', async () => {
        handleBaseMock.mockImplementation(async (_opt, _props, cb) => cb({ success: true, message: '', data: [] }))
        const { result } = withUseCandidate('educations')
        await flushPromises()

        result.addRecordToList({ name: 'new one' })

        expect(result.educations.value).toEqual([{ name: 'new one' }])
        expect(candidateStore().getCandidateByField('educations')).toEqual([{ name: 'new one' }])
    })

    it('sorting a cached list does not reorder the array held in candidateStore', async () => {
        candidateStore().setCandidateByField({
            educations: [
                { _id: 'old', startDate: 100 },
                { _id: 'new', startDate: 300 },
            ],
        })

        const { result } = withUseCandidate('educations')
        await flushPromises()

        expect(result.educations.value.map((e: { _id: string }) => e._id)).toEqual(['new', 'old'])
        expect(candidateStore().getCandidateByField('educations').map((e: { _id: string }) => e._id)).toEqual(['old', 'new'])
    })

    it('addRecordToList syncs a record without _id into candidateStore', async () => {
        candidateStore().setCandidateByField({ educations: [{ _id: '1', startDate: 100 }] })
        const { result } = withUseCandidate('educations')
        await flushPromises()

        result.addRecordToList({ name: 'new one' })

        expect(candidateStore().getCandidateByField('educations')).toEqual([{ _id: '1', startDate: 100 }, { name: 'new one' }])
    })

    it('updateField writes the given values into candidateStore', () => {
        const { result } = withUseCandidate('generalInformation')

        result.updateField({ field: 'skills', values: ['vue'] })

        expect(candidateStore().getCandidateByField('skills')).toEqual(['vue'])
    })

    it('addRecordToList replaces an existing record in place when the _id matches', async () => {
        handleBaseMock.mockImplementation(async (_opt, _props, cb) =>
            cb({ success: true, message: '', data: [{ _id: '1', name: 'old' }] }),
        )
        const { result } = withUseCandidate('educations')
        await flushPromises()

        result.addRecordToList({ _id: '1', name: 'updated' })

        expect(result.educations.value).toEqual([{ _id: '1', name: 'updated' }])
    })

    it('removeRecordById filters the record out and syncs candidateStore', async () => {
        handleBaseMock.mockImplementation(async (_opt, _props, cb) =>
            cb({
                success: true,
                message: '',
                data: [
                    { _id: '1', name: 'a' },
                    { _id: '2', name: 'b' },
                ],
            }),
        )
        const { result } = withUseCandidate('educations')
        await flushPromises()

        result.removeRecordById('1')

        expect(result.educations.value).toEqual([{ _id: '2', name: 'b' }])
        expect(candidateStore().getCandidateByField('educations')).toEqual([{ _id: '2', name: 'b' }])
    })

    it('updateGeneralInformationByField delegates to candidateStore.setGeneralInformation', () => {
        candidateStore().setCandidate({ generalInformation: { fullName: 'Dat' } })
        const { result } = withUseCandidate('generalInformation')

        result.updateGeneralInformationByField({ fullName: 'Vo Dat' })

        expect(candidateStore().getGeneralInformation).toEqual({ fullName: 'Vo Dat' })
    })
})
