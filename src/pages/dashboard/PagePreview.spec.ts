import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { candidateStore } from '@/stores/candidate'
import PagePreview from './PagePreview.vue'

const lists: Record<string, unknown[] | Record<string, unknown>> = {
    generalInformation: { positionDesired: 'Frontend Developer' },
    educations: [{ _id: 'e1', school: 'HCMUS', major: 'CS', startDate: new Date(2015, 8, 1).getTime() }],
    experiences: [
        { _id: 'x1', company: 'Acme', position: 'Dev', startDate: new Date(2020, 0, 1).getTime(), isCurrent: true, description: { vi: 'Mô tả', en: 'Desc' } },
        { _id: 'x2', company: 'Hidden Co', position: 'Dev' },
    ],
    projects: [],
    awards: [],
    certificates: [],
    references: [],
    profiles: [{ _id: 'p1', experienceIds: ['x1'], educationIds: ['e1'] }],
}

vi.mock('@/composables/useCandidate', () => ({
    useCandidate: ({ field }: { field: string }) => ({ [field]: ref(lists[field]) }),
}))

const stubs = {
    SegmentedControl: true,
    Heading: { props: ['text'], template: '<div><h2>{{ text }}</h2><slot /></div>' },
    Button: { props: ['text'], emits: ['click'], template: '<button class="stub-btn" @click="$emit(\'click\')">{{ text }}</button>' },
    CvResumeLayout: true,
    FontAwesomeIcon: true,
}

describe('PagePreview — JSON Resume export', () => {
    let blobs: Blob[]
    let clicked: { href: string; download: string }[]

    beforeEach(() => {
        localStorage.clear()
        blobs = []
        clicked = []
        vi.stubGlobal('URL', {
            ...URL,
            createObjectURL: (b: Blob) => {
                blobs.push(b)
                return 'blob:resume'
            },
            revokeObjectURL: vi.fn(),
        })
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
            const a = this as unknown as HTMLAnchorElement
            clicked.push({ href: a.href, download: a.download })
        })
    })
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    function mountPage() {
        setActivePinia(createPinia())
        candidateStore().setCandidate({ firstName: 'Đạt', lastName: 'Võ', phone: '0900', socialMedia: { github: 'https://github.com/x' } })
        return mount(PagePreview, { global: { stubs } })
    }

    async function exportJson(wrapper: ReturnType<typeof mountPage>) {
        await wrapper.findAll('.stub-btn').find(b => b.text() === 'Xuất JSON Resume')!.trigger('click')
        const text = await new Promise<string>(resolve => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.readAsText(blobs[0])
        })
        return JSON.parse(text)
    }

    it('downloads resume.json built from the previewed CV', async () => {
        const wrapper = mountPage()
        const json = await exportJson(wrapper)

        expect(clicked).toEqual([{ href: 'blob:resume', download: 'resume.json' }])
        expect(blobs[0].type).toBe('application/json')
        expect(json.basics).toMatchObject({ name: 'Đạt Võ', label: 'Frontend Developer', phone: '0900', profiles: [{ network: 'GitHub', url: 'https://github.com/x' }] })
        expect(json.work.map((w: { name: string }) => w.name)).toEqual(['Acme', 'Hidden Co'])
        expect(json.work[0]).toMatchObject({ summary: 'Mô tả', startDate: '2020-01-01' })
        expect(json.education[0]).toMatchObject({ institution: 'HCMUS', area: 'CS' })
    })

    it('follows the active profile filter, like the preview itself', async () => {
        localStorage.setItem('cvActiveProfileId', 'p1')
        const wrapper = mountPage()
        const json = await exportJson(wrapper)

        expect(json.work.map((w: { name: string }) => w.name)).toEqual(['Acme'])
    })
})
