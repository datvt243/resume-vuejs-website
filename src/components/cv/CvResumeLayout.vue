<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Shared, theme-able CV layout (issue #119) — the ONE
 * layout source rendered by both `PagePreview.vue` (dashboard PDF-export
 * preview, issue #55) and `PagePublicResume.vue` (public share-link page,
 * issue #56), so the two can never drift apart in markup/CSS. `theme`
 * picks a CSS variant (`classic`/`modern`/`compact`, see
 * `useCvTheme.ts`); `data` is the normalized resume shape already
 * returned as-is by the public API and assembled from `candidateStore` +
 * `useCandidate` on the dashboard side. `lang` (issue #182) picks which
 * half of the `{ vi, en }` fields is shown plus the fixed labels; the
 * public API already resolves those fields to plain strings for `?lang=`.
 */
import { computed } from 'vue'
import { formatDate, getLocalizedText, sanitizeHtml } from '@/utilities/index'
import generalInformationModel from '@/models/generalInformation.model'
import { resolveTheme } from '@/composables/useCvTheme'

const props = defineProps({
    data: { type: Object, required: true },
    theme: { type: String, default: 'classic' },
    lang: { type: String, default: 'vi' },
})

const LABELS = {
    vi: {
        notUpdated: 'Chưa cập nhật',
        general: 'Thông tin chung',
        career: 'Ngành nghề',
        levelCurrent: 'Cấp bậc hiện tại',
        education: 'Trình độ',
        yearsOfExperience: 'Số năm kinh nghiệm',
        workForm: 'Hình thức làm việc',
        workLocation: 'Địa điểm làm việc',
        educations: 'Học vấn',
        experiences: 'Kinh nghiệm',
        projects: 'Dự án',
        awards: 'Giải thưởng',
        certificates: 'Chứng chỉ',
        references: 'Người tham khảo',
        present: 'Hiện tại',
        noExpiration: 'Không thời hạn',
    },
    en: {
        notUpdated: 'Not updated',
        general: 'General information',
        career: 'Career',
        levelCurrent: 'Current level',
        education: 'Education level',
        yearsOfExperience: 'Years of experience',
        workForm: 'Employment type',
        workLocation: 'Work location',
        educations: 'Education',
        experiences: 'Experience',
        projects: 'Projects',
        awards: 'Awards',
        certificates: 'Certificates',
        references: 'References',
        present: 'Present',
        noExpiration: 'No expiration',
    },
}

// English text for the generalInformation select options (the model only
// carries the Vietnamese labels)
const OPTION_LABELS_EN = {
    intern: 'Intern',
    staff: 'Staff',
    teamLeader: 'Team Leader',
    manager: 'Manager',
    viceDirector: 'Vice Director',
    director: 'Director',
    ceo: 'CEO',
    highSchool: 'High School',
    associateDegree: 'Associate Degree',
    bachelorDegree: "Bachelor's Degree",
    masterDegree: "Master's Degree",
    doctorateDegree: 'Doctorate',
    fulltime: 'Full-time',
    parttime: 'Part-time',
    temporary: 'Temporary',
    internship: 'Probation',
    freelance: 'Freelance',
    contract: 'Contract',
    remote: 'Remote',
    consultant: 'Collaborator',
}

const isEn = computed(() => props.lang === 'en')
const t = computed(() => (isEn.value ? LABELS.en : LABELS.vi))
const text = value => getLocalizedText(value, isEn.value ? 'en' : 'vi')

const themeClass = computed(() => `cv-theme-${resolveTheme(props.theme)}`)
const fullName = computed(() => `${props.data.firstName || ''} ${props.data.lastName || ''}`.trim())
const generalInformation = computed(() => props.data.generalInformation || {})

function optionLabel(model, name, value) {
    const field = model.find(f => f.name === name)
    const opt = field?.options?.find(o => o.value === value)
    if (isEn.value && OPTION_LABELS_EN[value]) return OPTION_LABELS_EN[value]
    return opt?.text ?? value ?? ''
}

function dateRange(item) {
    const start = formatDate(item.startDate, 'MM/YYYY')
    const end = item.isCurrent ? t.value.present : formatDate(item.endDate, 'MM/YYYY')
    return `${start} - ${end}`
}

function certDateRange(item) {
    const start = formatDate(item.startDate, 'MM/YYYY')
    const end = item.isNoExpiration ? t.value.noExpiration : formatDate(item.endDate, 'MM/YYYY')
    return `${start} - ${end}`
}
</script>

<template>
    <div class="cv-preview block-container" :class="themeClass">
        <header class="cv-header">
            <h2 class="cv-name">{{ fullName || t.notUpdated }}</h2>
            <p v-if="generalInformation.positionDesired" class="cv-position">{{ generalInformation.positionDesired }}</p>
            <p class="cv-contact">
                <span v-if="data.phone">{{ data.phone }}</span>
                <span v-if="data.address"> · {{ data.address }}</span>
                <span v-if="data.email"> · {{ data.email }}</span>
            </p>
            <p v-if="data.introduction" class="cv-introduction">{{ text(data.introduction) }}</p>
        </header>

        <section v-if="generalInformation.career || generalInformation.careerGoal" class="cv-section">
            <h3 class="cv-section-title">{{ t.general }}</h3>
            <ul class="cv-facts">
                <li v-if="generalInformation.career"><strong>{{ t.career }}:</strong> {{ text(generalInformation.career) }}</li>
                <li v-if="generalInformation.levelCurrent">
                    <strong>{{ t.levelCurrent }}:</strong> {{ optionLabel(generalInformationModel, 'levelCurrent', generalInformation.levelCurrent) }}
                </li>
                <li v-if="generalInformation.education">
                    <strong>{{ t.education }}:</strong> {{ optionLabel(generalInformationModel, 'education', generalInformation.education) }}
                </li>
                <li v-if="generalInformation.yearsOfExperience !== '' && generalInformation.yearsOfExperience != null">
                    <strong>{{ t.yearsOfExperience }}:</strong> {{ generalInformation.yearsOfExperience }}
                </li>
                <li v-if="generalInformation.workForm">
                    <strong>{{ t.workForm }}:</strong> {{ optionLabel(generalInformationModel, 'workForm', generalInformation.workForm) }}
                </li>
                <li v-if="generalInformation.workLocation"><strong>{{ t.workLocation }}:</strong> {{ generalInformation.workLocation }}</li>
            </ul>
            <div v-if="generalInformation.careerGoal" class="cv-paragraph" v-html="sanitizeHtml(text(generalInformation.careerGoal))"></div>
        </section>

        <section v-if="data.educations?.length" class="cv-section">
            <h3 class="cv-section-title">{{ t.educations }}</h3>
            <div v-for="edu in data.educations" :key="edu._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ edu.school }}</span>
                    <span class="cv-item-date">{{ dateRange(edu) }}</span>
                </div>
                <p v-if="edu.major" class="cv-item-sub">{{ edu.major }}</p>
                <p v-if="edu.description" class="cv-item-desc">{{ text(edu.description) }}</p>
            </div>
        </section>

        <section v-if="data.experiences?.length" class="cv-section">
            <h3 class="cv-section-title">{{ t.experiences }}</h3>
            <div v-for="exp in data.experiences" :key="exp._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ exp.company }}</span>
                    <span class="cv-item-date">{{ dateRange(exp) }}</span>
                </div>
                <p v-if="exp.position" class="cv-item-sub">{{ exp.position }}</p>
                <div v-if="exp.description" class="cv-item-desc" v-html="sanitizeHtml(text(exp.description))"></div>
            </div>
        </section>

        <section v-if="data.projects?.length" class="cv-section">
            <h3 class="cv-section-title">{{ t.projects }}</h3>
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
                <p v-if="pj.description" class="cv-item-desc">{{ text(pj.description) }}</p>
            </div>
        </section>

        <section v-if="data.awards?.length" class="cv-section">
            <h3 class="cv-section-title">{{ t.awards }}</h3>
            <div v-for="aw in data.awards" :key="aw._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ aw.name }}</span>
                    <span class="cv-item-date">{{ formatDate(aw.issueDate, 'MM/YYYY') }}</span>
                </div>
                <p v-if="aw.organization" class="cv-item-sub">{{ aw.organization }}</p>
                <div v-if="aw.description" class="cv-item-desc" v-html="sanitizeHtml(text(aw.description))"></div>
            </div>
        </section>

        <section v-if="data.certificates?.length" class="cv-section">
            <h3 class="cv-section-title">{{ t.certificates }}</h3>
            <div v-for="ce in data.certificates" :key="ce._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ ce.name }}</span>
                    <span class="cv-item-date">{{ certDateRange(ce) }}</span>
                </div>
                <p v-if="ce.organization" class="cv-item-sub">{{ ce.organization }}</p>
                <p v-if="ce.description" class="cv-item-desc">{{ text(ce.description) }}</p>
            </div>
        </section>

        <section v-if="data.references?.length" class="cv-section">
            <h3 class="cv-section-title">{{ t.references }}</h3>
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

/* Modern: left-aligned header, accent-colored name + section titles */
.cv-theme-modern .cv-header {
    text-align: left;
    border-bottom: 3px solid var(--bs-success);
}
.cv-theme-modern .cv-name {
    color: var(--bs-success);
    font-size: 1.6rem;
}
.cv-theme-modern .cv-introduction {
    margin: 0;
}
.cv-theme-modern .cv-section-title {
    color: var(--bs-success);
    border-bottom: none;
    border-left: 4px solid var(--bs-success);
    padding-left: 0.6rem;
}

/* Compact: tighter spacing + smaller type, maximize density */
.cv-theme-compact {
    font-size: 0.85rem;
}
.cv-theme-compact .cv-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
}
.cv-theme-compact .cv-section {
    margin-bottom: 0.75rem;
}
.cv-theme-compact .cv-section-title {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    padding-bottom: 0.2rem;
}
.cv-theme-compact .cv-item {
    margin-bottom: 0.5rem;
}
</style>
