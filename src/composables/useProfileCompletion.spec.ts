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
    salaryDesiredFrom: 1000,
    salaryDesiredTo: 2000,
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

    it('reports 0% and all 10 sections missing when candidateStore is empty', async () => {
        const { result } = withUseProfileCompletion()
        await flushPromises()

        expect(result.percent.value).toBe(0)
        expect(result.sections.value).toHaveLength(10)
        expect(result.missingSections.value).toHaveLength(10)
    })

    it('marks "Thông tin cơ bản" complete only once every required field (per the model\'s own yup .required()) is filled', async () => {
        candidateStore().setCandidate({ ...FULL_INFORMATION })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const section = result.sections.value.find(s => s.label === 'nav.information')
        expect(section?.complete).toBe(true)

        // Remove one real required field (`address`, per information.model.ts）-> must flip back to incomplete
        candidateStore().setCandidate({ ...FULL_INFORMATION, address: '' })
        await flushPromises()
        const section2 = result.sections.value.find(s => s.label === 'nav.information')
        expect(section2?.complete).toBe(false)
    })

    it('does not require "careerGoal" for "Thông tin chung" (the only generalInformation field with no .required())', async () => {
        candidateStore().setCandidate({ generalInformation: { ...FULL_GENERAL_INFORMATION, careerGoal: '' } })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const section = result.sections.value.find(s => s.label === 'nav.generalInformation')
        expect(section?.complete).toBe(true)
    })

    it('counts "Thông tin chung" incomplete while either salary end is null', async () => {
        for (const missing of ['salaryDesiredFrom', 'salaryDesiredTo']) {
            candidateStore().setCandidate({ generalInformation: { ...FULL_GENERAL_INFORMATION, [missing]: null } })
            const { result } = withUseProfileCompletion()
            await flushPromises()
            expect(result.sections.value.find(s => s.label === 'nav.generalInformation')?.complete).toBe(false)
        }
    })

    it('treats a list section as complete once it has at least 1 record, regardless of that record\'s own fields', async () => {
        candidateStore().setCandidateByField({ educations: [{ _id: '1', school: 'Anything' }] })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const section = result.sections.value.find(s => s.label === 'nav.education')
        expect(section?.complete).toBe(true)
        expect(result.missingSections.value).toHaveLength(9)
    })

    it('reaches 100% only when all 10 sections (2 object + 8 list) are complete', async () => {
        candidateStore().setCandidate({
            ...FULL_INFORMATION,
            generalInformation: { ...FULL_GENERAL_INFORMATION, personalSkills: [{ name: 'Teamwork' }], foreignLanguages: [{ language: 'English', level: 'basic' }] },
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

    it('rounds the percentage (e.g. 2/10 complete sections = 20%)', async () => {
        candidateStore().setCandidate({
            ...FULL_INFORMATION,
            generalInformation: { ...FULL_GENERAL_INFORMATION },
        })
        const { result } = withUseProfileCompletion()
        await flushPromises()

        expect(result.percent.value).toBe(20)
    })

    it('counts Skills complete with any one skill list, and Languages with one language (#440)', async () => {
        const status = async (gi: Record<string, unknown>) => {
            candidateStore().setCandidate({ generalInformation: gi })
            const { result } = withUseProfileCompletion()
            await flushPromises()
            const by = (label: string) => result.sections.value.find(s => s.label === label)?.complete
            return [by('nav.skills'), by('nav.languages')]
        }
        expect(await status({ professionalSkillsGroup: ['Frontend'], foreignLanguages: [] })).toEqual([false, false])
        for (const key of ['mainSkills', 'familiarSkills', 'professionalSkills', 'personalSkills']) {
            expect((await status({ [key]: [{ name: 'Teamwork' }] }))[0]).toBe(true)
        }
        expect(await status({ foreignLanguages: [{ language: 'English', level: 'basic' }] })).toEqual([false, true])
    })

    it('rounds 1/10 complete sections to 10%, first missing link after General information is Skills', async () => {
        candidateStore().setCandidate({ ...FULL_INFORMATION })
        const { result } = withUseProfileCompletion()
        await flushPromises()
        expect(result.percent.value).toBe(10)
        expect(result.missingSections.value).toHaveLength(9)
        expect(result.sections.value.map(s => s.label).slice(0, 4)).toEqual(['nav.information', 'nav.generalInformation', 'nav.skills', 'nav.languages'])
    })

    it('every section links to its real dashboard route', async () => {
        const { result } = withUseProfileCompletion()
        await flushPromises()

        const byLabel = Object.fromEntries(result.sections.value.map(s => [s.label, s.to]))
        expect(byLabel).toEqual({
            'nav.information': '/dashboard/information',
            'nav.generalInformation': '/dashboard/general-information',
            'nav.skills': '/dashboard/skills',
            'nav.languages': '/dashboard/languages',
            'nav.education': '/dashboard/education',
            'nav.experience': '/dashboard/experience',
            'nav.project': '/dashboard/project',
            'nav.award': '/dashboard/award',
            'nav.certificate': '/dashboard/certificate',
            'nav.reference': '/dashboard/reference',
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
