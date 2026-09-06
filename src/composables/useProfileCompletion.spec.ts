import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useProfileCompletion } from './useProfileCompletion'
import { candidateStore } from '@/stores/candidate'
import { modalDefault as informationModel } from '@/models/information.model'
import generalInformationModel from '@/models/generalInformation.model'

const handleBaseMock = vi.fn()
vi.mock('@/services/base', () => ({
    handleBase: (...args: unknown[]) => handleBaseMock(...args),
}))

vi.mock('@/composables/useHelper', () => ({
    useHelper: () => ({ loading: ref(null), toast: vi.fn() }),
}))

// Same reasoning as useCandidate.spec.ts: `onBeforeMount` inside the
// composable (via the 6 internal `useCandidate` calls) needs an active
// component instance.
function withUseProfileCompletion() {
    let result: ReturnType<typeof useProfileCompletion>
    const wrapper = mount(
        defineComponent({
            setup() {
                result = useProfileCompletion()
                return () => h('div')
            },
        }),
    )
    return { result: result!, wrapper }
}

// Every required field from `informationModel` (Thông tin cơ bản) filled.
const FULL_INFORMATION = {
    firstName: 'Dat',
    lastName: 'Vo',
    gender: 1,
    marital: 0,
    birthday: +new Date('1990-01-01'),
    address: 'HCMC',
    phone: '0900000000',
}

// Every required field from `generalInformationModel` (Thông tin chung)
// filled (`careerGoal` has no `.required()`, deliberately left out).
const FULL_GENERAL_INFORMATION = {
    positionDesired: 'Dev',
    career: 'IT',
    levelCurrent: 'staff',
    levelDesired: 'teamLeader',
    education: 'bachelorDegree',
    yearsOfExperience: 3,
    salaryDesired: 1000,
    workForm: 'fulltime',
    workLocation: 'Remote',
}

describe('useProfileCompletion', () => {
    beforeEach(() => {
        handleBaseMock.mockReset()
        // list sections empty by default -> no real fetch needed for most tests
        handleBaseMock.mockImplementation(async (_opt: unknown, _props: unknown, cb: (_res: unknown) => void) =>
            cb({ success: true, message: '', data: [] }),
        )
        setActivePinia(createPinia())
    })

    it('reports 0% and all 8 sections missing when candidateStore is empty', async () => {
        const { result } = withUseProfileCompletion()
        await flushPromises()

        expect(result.percent.value).toBe(0)
        expect(result.sections.value).toHaveLength(8)
        expect(result.missingSections.value).toHaveLength(8)
    })

    it('marks "Thông tin cơ bản" complete only once every required field (per the model\'s own yup .required()) is filled', async () => {
        candidateStore().setCandidate({ ...FULL_INFORMATION })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const section = result.sections.value.find(s => s.label === 'Thông tin cơ bản')
        expect(section?.complete).toBe(true)

        // Remove one real required field (`address`, per information.model.ts）-> must flip back to incomplete
        candidateStore().setCandidate({ ...FULL_INFORMATION, address: '' })
        await flushPromises()
        const section2 = result.sections.value.find(s => s.label === 'Thông tin cơ bản')
        expect(section2?.complete).toBe(false)
    })

    it('does not require "careerGoal" for "Thông tin chung" (the only generalInformation field with no .required())', async () => {
        candidateStore().setCandidate({ generalInformation: { ...FULL_GENERAL_INFORMATION, careerGoal: '' } })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const section = result.sections.value.find(s => s.label === 'Thông tin chung')
        expect(section?.complete).toBe(true)
    })

    it('treats a list section as complete once it has at least 1 record, regardless of that record\'s own fields', async () => {
        candidateStore().setCandidateByField({ educations: [{ _id: '1', school: 'Anything' }] })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const section = result.sections.value.find(s => s.label === 'Học vấn')
        expect(section?.complete).toBe(true)
        expect(result.missingSections.value).toHaveLength(7)
    })

    it('reaches 100% only when all 8 sections (2 object + 6 list) are complete', async () => {
        candidateStore().setCandidate({
            ...FULL_INFORMATION,
            generalInformation: { ...FULL_GENERAL_INFORMATION },
        })
        candidateStore().setCandidateByField({
            educations: [{ _id: '1' }],
            experiences: [{ _id: '1' }],
            projects: [{ _id: '1' }],
            awards: [{ _id: '1' }],
            certificates: [{ _id: '1' }],
            references: [{ _id: '1' }],
        })

        const { result } = withUseProfileCompletion()
        await flushPromises()

        expect(result.percent.value).toBe(100)
        expect(result.missingSections.value).toHaveLength(0)
    })

    it('rounds the percentage (e.g. 2/8 complete sections = 25%)', async () => {
        candidateStore().setCandidate({
            ...FULL_INFORMATION,
            generalInformation: { ...FULL_GENERAL_INFORMATION },
        })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        expect(result.percent.value).toBe(25)
    })

    it('every section links to its real dashboard route', async () => {
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const byLabel = Object.fromEntries(result.sections.value.map(s => [s.label, s.to]))
        expect(byLabel).toEqual({
            'Thông tin cơ bản': '/dashboard/information',
            'Thông tin chung': '/dashboard/general-information',
            'Học vấn': '/dashboard/education',
            'Kinh nghiệm làm việc': '/dashboard/experience',
            'Dự án': '/dashboard/project',
            'Giải thưởng': '/dashboard/award',
            'Chứng chỉ': '/dashboard/certificate',
            'Người tham khảo': '/dashboard/reference',
        })
    })

    it('sanity check: informationModel and generalInformationModel both declare at least 1 real .required() field', () => {
        // guards against a future model refactor silently removing every
        // .required() (which would make every object-section "complete"
        // by default via the `requiredFields.length > 0` check)
        expect(informationModel.some(f => f.name !== '_id' && f.valid)).toBe(true)
        expect(generalInformationModel.some(f => f.name !== '_id' && f.valid)).toBe(true)
    })
})
