/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Tính % hoàn thành hồ sơ thật — issue #59. Mỗi
 * `src/models/*.model.ts` đã tự khai báo field nào bắt buộc qua
 * `valid: yup => ...required(...)` (dùng chung schema với `VeeForm.vue`)
 * — composable này gọi lại đúng hàm `valid(yup)` đó rồi đọc
 * `schema.describe().tests` để biết field có `required` hay không, thay
 * vì hard-code lại danh sách field (drift risk nếu model đổi sau này).
 *
 * 8 section coi ngang nhau (1 điểm/section, không cộng dồn theo số field)
 * để tránh lệch trọng số — 2 section dạng object (Thông tin cơ bản,
 * Thông tin chung) có nhiều field required hơn hẳn các section dạng
 * danh sách (mỗi section danh sách chỉ có 1-2 field required/item), cộng
 * theo số field sẽ khiến điền xong 2 section object đã chiếm phần lớn %
 * dù chưa đụng tới Education/Experience/... — không khớp ví dụ của issue
 * ("chưa có Reference, chưa điền Certificate" ám chỉ SECTION còn thiếu,
 * không phải field còn thiếu).
 * - Section object: "hoàn thành" = mọi field required đều có giá trị.
 * - Section danh sách: "hoàn thành" = có ít nhất 1 bản ghi.
 */

import { computed } from 'vue'
import * as yup from 'yup'
import { candidateStore } from '@/stores/candidate'
import { useCandidate } from '@/composables/useCandidate'
import { modalDefault as informationModel } from '@/models/information.model'
import generalInformationModel from '@/models/generalInformation.model'
import type { modelItem } from '@/types/model.type'

function isRequiredField(field: modelItem): boolean {
    if (field.name === '_id' || !field.valid) return false
    try {
        const schema = field.valid(yup)
        return !!schema?.describe?.()?.tests?.some((t: { name?: string }) => t.name === 'required')
    } catch {
        return false
    }
}

function isFilled(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return !Number.isNaN(value)
    return true
}

export const useProfileCompletion = () => {
    const candidate = candidateStore()

    // Fetch (nếu chưa cache) từng section danh sách — cùng cách
    // PagePreview.vue đã làm cho 7 section, đảm bảo % tính đúng ngay cả
    // khi user chưa từng ghé qua trang con đó trong phiên này.
    const { educations } = useCandidate({ field: 'educations', collection: 'education' })
    const { experiences } = useCandidate({ field: 'experiences' })
    const { projects } = useCandidate({ field: 'projects' })
    const { awards } = useCandidate({ field: 'awards' })
    const { certificates } = useCandidate({ field: 'certificates' })
    const { references } = useCandidate({ field: 'references' })

    function objectSection(label: string, to: string, model: modelItem[], data: Record<string, any>) {
        const requiredFields = model.filter(isRequiredField)
        const complete = requiredFields.length > 0 && requiredFields.every(f => isFilled(data?.[f.name]))
        return { label, to, complete }
    }

    function listSection(label: string, to: string, data: any) {
        return { label, to, complete: Array.isArray(data) && data.length > 0 }
    }

    const sections = computed(() => [
        objectSection('Thông tin cơ bản', '/dashboard/information', informationModel, candidate.getCandidate),
        objectSection('Thông tin chung', '/dashboard/general-information', generalInformationModel, candidate.getGeneralInformation),
        listSection('Học vấn', '/dashboard/education', educations.value),
        listSection('Kinh nghiệm làm việc', '/dashboard/experience', experiences.value),
        listSection('Dự án', '/dashboard/project', projects.value),
        listSection('Giải thưởng', '/dashboard/award', awards.value),
        listSection('Chứng chỉ', '/dashboard/certificate', certificates.value),
        listSection('Người tham khảo', '/dashboard/reference', references.value),
    ])

    const missingSections = computed(() => sections.value.filter(s => !s.complete))

    const percent = computed(() => {
        const total = sections.value.length
        if (!total) return 0
        const complete = sections.value.filter(s => s.complete).length
        return Math.round((complete / total) * 100)
    })

    return { percent, sections, missingSections }
}
