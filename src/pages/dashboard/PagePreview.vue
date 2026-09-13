<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Trang xem trước CV tổng hợp toàn bộ dữ liệu (thông tin
 * chung, học vấn, kinh nghiệm, dự án, giải thưởng, chứng chỉ, người tham
 * khảo) và cho xuất ra PDF/in qua trình duyệt (window.print() +
 * @media print) — issue #55.
 */

import { computed, onMounted, onUnmounted } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { authStore } from '@/stores/auth'
import { useCandidate } from '@/composables/useCandidate'
import { formatDate, getLocalizedText } from '@/utilities/index'
import generalInformationModel from '@/models/generalInformation.model'

const candidate = candidateStore()
const auth = authStore()

const info = computed(() => candidate.getCandidate)
const fullName = computed(() => `${info.value.firstName || ''} ${info.value.lastName || ''}`.trim())

const { generalInformation } = useCandidate({ field: 'generalInformation', collection: 'general-information' })
const { educations } = useCandidate({ field: 'educations', collection: 'education' })
const { experiences } = useCandidate({ field: 'experiences' })
const { projects } = useCandidate({ field: 'projects' })
const { awards } = useCandidate({ field: 'awards' })
const { certificates } = useCandidate({ field: 'certificates' })
const { references } = useCandidate({ field: 'references' })

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

function handlePrint() {
    window.print()
}

// Chỉ bật CSS ẩn header/sidebar/footer khi in TRONG LÚC đang ở trang này
// (class trên <body>, gỡ lại khi rời trang) — tránh ảnh hưởng in ấn ở các
// trang khác.
onMounted(() => document.body.classList.add('cv-print-mode'))
onUnmounted(() => document.body.classList.remove('cv-print-mode'))
</script>

<template>
    <div class="mb-[1.5rem] no-print">
        <Heading text="Xem trước CV">
            <Button text="Xuất PDF / In" icon="fa-solid fa-download" type="outline-success" size="sm" @click="handlePrint()" />
        </Heading>
    </div>

    <div id="cv-print-area" class="cv-preview block-container">
        <header class="cv-header">
            <h2 class="cv-name">{{ fullName || 'Chưa cập nhật' }}</h2>
            <p v-if="generalInformation.positionDesired" class="cv-position">{{ generalInformation.positionDesired }}</p>
            <p class="cv-contact">
                <span v-if="info.phone">{{ info.phone }}</span>
                <span v-if="info.address"> · {{ info.address }}</span>
                <span v-if="auth.getUser?.email"> · {{ auth.getUser.email }}</span>
            </p>
            <p v-if="info.introduction" class="cv-introduction">{{ getLocalizedText(info.introduction) }}</p>
        </header>

        <section v-if="generalInformation.career || generalInformation.careerGoal" class="cv-section">
            <h3 class="cv-section-title">Thông tin chung</h3>
            <ul class="cv-facts">
                <li v-if="generalInformation.career"><strong>Ngành nghề:</strong> {{ generalInformation.career }}</li>
                <li v-if="generalInformation.levelCurrent">
                    <strong>Cấp bậc hiện tại:</strong> {{ optionLabel(generalInformationModel, 'levelCurrent', generalInformation.levelCurrent) }}
                </li>
                <li v-if="generalInformation.education">
                    <strong>Trình độ:</strong> {{ optionLabel(generalInformationModel, 'education', generalInformation.education) }}
                </li>
                <li v-if="generalInformation.yearsOfExperience !== '' && generalInformation.yearsOfExperience != null">
                    <strong>Số năm kinh nghiệm:</strong> {{ generalInformation.yearsOfExperience }}
                </li>
                <li v-if="generalInformation.workForm">
                    <strong>Hình thức làm việc:</strong> {{ optionLabel(generalInformationModel, 'workForm', generalInformation.workForm) }}
                </li>
                <li v-if="generalInformation.workLocation"><strong>Địa điểm làm việc:</strong> {{ generalInformation.workLocation }}</li>
            </ul>
            <p v-if="generalInformation.careerGoal" class="cv-paragraph">{{ getLocalizedText(generalInformation.careerGoal) }}</p>
        </section>

        <section v-if="educations.length" class="cv-section">
            <h3 class="cv-section-title">Học vấn</h3>
            <div v-for="edu in educations" :key="edu._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ edu.school }}</span>
                    <span class="cv-item-date">{{ dateRange(edu) }}</span>
                </div>
                <p v-if="edu.major" class="cv-item-sub">{{ edu.major }}</p>
                <p v-if="edu.description" class="cv-item-desc">{{ getLocalizedText(edu.description) }}</p>
            </div>
        </section>

        <section v-if="experiences.length" class="cv-section">
            <h3 class="cv-section-title">Kinh nghiệm</h3>
            <div v-for="exp in experiences" :key="exp._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ exp.company }}</span>
                    <span class="cv-item-date">{{ dateRange(exp) }}</span>
                </div>
                <p v-if="exp.position" class="cv-item-sub">{{ exp.position }}</p>
                <p v-if="exp.description" class="cv-item-desc">{{ getLocalizedText(exp.description) }}</p>
            </div>
        </section>

        <section v-if="projects.length" class="cv-section">
            <h3 class="cv-section-title">Dự án</h3>
            <div v-for="pj in projects" :key="pj._id" class="cv-item">
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

        <section v-if="awards.length" class="cv-section">
            <h3 class="cv-section-title">Giải thưởng</h3>
            <div v-for="aw in awards" :key="aw._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ aw.name }}</span>
                    <span class="cv-item-date">{{ formatDate(aw.issueDate, 'MM/YYYY') }}</span>
                </div>
                <p v-if="aw.organization" class="cv-item-sub">{{ aw.organization }}</p>
                <p v-if="aw.description" class="cv-item-desc">{{ getLocalizedText(aw.description) }}</p>
            </div>
        </section>

        <section v-if="certificates.length" class="cv-section">
            <h3 class="cv-section-title">Chứng chỉ</h3>
            <div v-for="ce in certificates" :key="ce._id" class="cv-item">
                <div class="cv-item-head">
                    <span class="cv-item-title">{{ ce.name }}</span>
                    <span class="cv-item-date">{{ certDateRange(ce) }}</span>
                </div>
                <p v-if="ce.organization" class="cv-item-sub">{{ ce.organization }}</p>
                <p v-if="ce.description" class="cv-item-desc">{{ getLocalizedText(ce.description) }}</p>
            </div>
        </section>

        <section v-if="references.length" class="cv-section">
            <h3 class="cv-section-title">Người tham khảo</h3>
            <div v-for="rf in references" :key="rf._id" class="cv-item">
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

<style>
/* Không dùng `scoped` ở đây vì cần chọn `body`/`header`/`footer` — những
   phần tử ngoài template của component này. Class `cv-print-mode` chỉ
   được gắn lên <body> khi component này đang mounted (xem script), nên
   không ảnh hưởng tới việc in ở các trang khác. */
@media print {
    body.cv-print-mode header,
    body.cv-print-mode footer,
    body.cv-print-mode .dashboard-sidebar,
    body.cv-print-mode .no-print {
        display: none !important;
    }
    body.cv-print-mode .dashboard-layout {
        display: block !important;
    }
    body.cv-print-mode #cv-print-area {
        max-width: 100%;
    }
}
</style>
