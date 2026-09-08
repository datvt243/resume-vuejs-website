<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Public, read-only CV page reachable via a share link
 * (`/resume/:email`) — no login required. Fetches directly from the
 * backend's already-public `GET /api/me/:email` (gated server-side by the
 * candidate's `isPublic` flag; same response for "not found" and
 * "private" so a private profile can't be distinguished from a
 * non-existent one) — issue #56. Records a visit via
 * `POST /api/me/:email/visit` on load, completing the visit-tracking
 * feature (`dashboard-visit-count-integration`) that endpoint was built
 * for but nothing called yet.
 *
 * Deliberately bypasses `_axios`'s caller (`handleBase`)/`useCandidate`/
 * `useDocument` — those assume an authenticated dashboard context
 * (`api/v1/` prefix, toast + auto-logout-on-401 side effects that make no
 * sense for an anonymous visitor). Calls `_axios` directly with
 * `customURL` instead, which still shares the same `baseURL`/error-shape
 * handling.
 *
 * Layout note: like `NotFound.vue`, this route has no `meta.requiresAuth`
 * — `App.vue` still picks the shell by the VIEWER's own login state
 * (`LayoutDefault` if the viewer happens to be logged into their own
 * account, `LayoutAuth` otherwise), not by route. Pre-existing app-wide
 * behavior, not something newly introduced here.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { _axios } from '@/services/axios'
import { formatDate, getLocalizedText } from '@/utilities/index'
import generalInformationModel from '@/models/generalInformation.model'

const route = useRoute()
const email = route.params.email

const loading = ref(true)
const notFound = ref(false)
const data = ref(null)

function optionLabel(model, name, value) {
    const field = model.find(f => f.name === name)
    const opt = field?.options?.find(o => o.value === value)
    return opt?.text ?? value ?? ''
}

function dateRange(item) {
    const start = formatDate(item.startDate, 'MM/YYYY')
    const end = item.isCurrent ? 'Hiện tại' : formatDate(item.endDate, 'MM/YYYY')
    return `${start} - ${end}`
}

function certDateRange(item) {
    const start = formatDate(item.startDate, 'MM/YYYY')
    const end = item.isNoExpiration ? 'Không thời hạn' : formatDate(item.endDate, 'MM/YYYY')
    return `${start} - ${end}`
}

onMounted(async () => {
    try {
        const res = await _axios({ method: 'get', customURL: `api/me/${email}` })
        if (!res?.success || !res?.data) {
            notFound.value = true
            return
        }
        data.value = res.data

        /**
         * Ghi nhận lượt ghé thăm — fire-and-forget, không chặn hiển thị CV
         * nếu ghi nhận thất bại.
         */
        _axios({ method: 'post', customURL: `api/me/${email}/visit` }).catch(() => {})
    } catch {
        notFound.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div v-if="loading" class="text-center py-5">
        <p class="opacity-75">Đang tải hồ sơ...</p>
    </div>

    <div v-else-if="notFound" class="alert alert-warning text-center mx-auto" style="max-width: 500px">
        <p class="m-0 p-3">Hồ sơ không tồn tại hoặc không được chia sẻ công khai.</p>
    </div>

    <div v-else class="cv-preview block-container">
        <header class="cv-header">
            <h2 class="cv-name">{{ `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Chưa cập nhật' }}</h2>
            <p v-if="data.generalInformation?.positionDesired" class="cv-position">{{ data.generalInformation.positionDesired }}</p>
            <p class="cv-contact">
                <span v-if="data.phone">{{ data.phone }}</span>
                <span v-if="data.address"> · {{ data.address }}</span>
                <span v-if="data.email"> · {{ data.email }}</span>
            </p>
            <p v-if="data.introduction" class="cv-introduction">{{ getLocalizedText(data.introduction) }}</p>
        </header>

        <section v-if="data.generalInformation?.career || data.generalInformation?.careerGoal" class="cv-section">
            <h3 class="cv-section-title">Thông tin chung</h3>
            <ul class="cv-facts">
                <li v-if="data.generalInformation.career"><strong>Ngành nghề:</strong> {{ data.generalInformation.career }}</li>
                <li v-if="data.generalInformation.levelCurrent">
                    <strong>Cấp bậc hiện tại:</strong> {{ optionLabel(generalInformationModel, 'levelCurrent', data.generalInformation.levelCurrent) }}
                </li>
                <li v-if="data.generalInformation.education">
                    <strong>Trình độ:</strong> {{ optionLabel(generalInformationModel, 'education', data.generalInformation.education) }}
                </li>
                <li v-if="data.generalInformation.yearsOfExperience !== '' && data.generalInformation.yearsOfExperience != null">
                    <strong>Số năm kinh nghiệm:</strong> {{ data.generalInformation.yearsOfExperience }}
                </li>
                <li v-if="data.generalInformation.workForm">
                    <strong>Hình thức làm việc:</strong> {{ optionLabel(generalInformationModel, 'workForm', data.generalInformation.workForm) }}
                </li>
                <li v-if="data.generalInformation.workLocation"><strong>Địa điểm làm việc:</strong> {{ data.generalInformation.workLocation }}</li>
            </ul>
            <p v-if="data.generalInformation.careerGoal" class="cv-paragraph">{{ getLocalizedText(data.generalInformation.careerGoal) }}</p>
        </section>

        <section v-if="data.educations?.length" class="cv-section">
            <h3 class="cv-section-title">Học vấn</h3>
            <div v-for="edu in data.educations" :key="edu._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ edu.school }}</span>
                    <span class="cv-item-date">{{ dateRange(edu) }}</span>
                </div>
                <p v-if="edu.major" class="cv-item-sub">{{ edu.major }}</p>
                <p v-if="edu.description" class="cv-item-desc">{{ getLocalizedText(edu.description) }}</p>
            </div>
        </section>

        <section v-if="data.experiences?.length" class="cv-section">
            <h3 class="cv-section-title">Kinh nghiệm</h3>
            <div v-for="exp in data.experiences" :key="exp._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ exp.company }}</span>
                    <span class="cv-item-date">{{ dateRange(exp) }}</span>
                </div>
                <p v-if="exp.position" class="cv-item-sub">{{ exp.position }}</p>
                <p v-if="exp.description" class="cv-item-desc">{{ getLocalizedText(exp.description) }}</p>
            </div>
        </section>

        <section v-if="data.projects?.length" class="cv-section">
            <h3 class="cv-section-title">Dự án</h3>
            <div v-for="pj in data.projects" :key="pj._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ pj.name }}</span>
                    <span class="cv-item-date">{{ dateRange({ ...pj, isCurrent: pj.isWorking }) }}</span>
                </div>
                <p v-if="pj.position || pj.technology" class="cv-item-sub">
                    <span v-if="pj.position">{{ pj.position }}</span>
                    <span v-if="pj.position && pj.technology"> · </span>
                    <span v-if="pj.technology">{{ pj.technology }}</span>
                </p>
                <p v-if="pj.link" class="cv-item-link">{{ pj.link }}</p>
                <p v-if="pj.description" class="cv-item-desc">{{ getLocalizedText(pj.description) }}</p>
            </div>
        </section>

        <section v-if="data.awards?.length" class="cv-section">
            <h3 class="cv-section-title">Giải thưởng</h3>
            <div v-for="aw in data.awards" :key="aw._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ aw.name }}</span>
                    <span class="cv-item-date">{{ formatDate(aw.issueDate, 'MM/YYYY') }}</span>
                </div>
                <p v-if="aw.organization" class="cv-item-sub">{{ aw.organization }}</p>
                <p v-if="aw.description" class="cv-item-desc">{{ getLocalizedText(aw.description) }}</p>
            </div>
        </section>

        <section v-if="data.certificates?.length" class="cv-section">
            <h3 class="cv-section-title">Chứng chỉ</h3>
            <div v-for="ce in data.certificates" :key="ce._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ ce.name }}</span>
                    <span class="cv-item-date">{{ certDateRange(ce) }}</span>
                </div>
                <p v-if="ce.organization" class="cv-item-sub">{{ ce.organization }}</p>
                <p v-if="ce.description" class="cv-item-desc">{{ getLocalizedText(ce.description) }}</p>
            </div>
        </section>

        <section v-if="data.references?.length" class="cv-section">
            <h3 class="cv-section-title">Người tham khảo</h3>
            <div v-for="rf in data.references" :key="rf._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ rf.fullName }}</span>
                    <span v-if="rf.phone" class="cv-item-date">{{ rf.phone }}</span>
                </div>
                <p v-if="rf.position || rf.company" class="cv-item-sub">
                    <span v-if="rf.position">{{ rf.position }}</span>
                    <span v-if="rf.position && rf.company"> · </span>
                    <span v-if="rf.company">{{ rf.company }}</span>
                </p>
            </div>
        </section>
    </div>
</template>

<style scoped>
.cv-preview {
    max-width: 800px;
    margin: 0 auto;
}
.cv-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--bs-border-color-translucent);
}
.cv-name {
    margin-bottom: 0.25rem;
}
.cv-position {
    font-weight: 600;
    opacity: 0.85;
    margin-bottom: 0.25rem;
}
.cv-contact {
    font-size: 0.9rem;
    opacity: 0.75;
    margin-bottom: 0.5rem;
}
.cv-introduction {
    font-size: 0.95rem;
    max-width: 640px;
    margin: 0 auto;
}
.cv-section {
    margin-bottom: 1.5rem;
}
.cv-section-title {
    font-size: 1.05rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border-bottom: 1px solid var(--bs-border-color-translucent);
    padding-bottom: 0.35rem;
    margin-bottom: 0.75rem;
}
.cv-facts {
    padding-left: 1.1rem;
    margin-bottom: 0.5rem;
}
.cv-item {
    margin-bottom: 1rem;
}
.cv-item-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-weight: 600;
}
.cv-item-date {
    white-space: nowrap;
    opacity: 0.7;
    font-weight: 400;
    font-size: 0.85rem;
}
.cv-item-sub {
    opacity: 0.8;
    margin-bottom: 0.25rem;
}
.cv-item-link,
.cv-item-desc,
.cv-paragraph {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}
</style>
