<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Tự kiểm tra CV theo tiêu chí ATS (issue #159). Gọi
 *   `POST cv/ats-check` (backend resume-nodejs-api) — server render CV
 *   trong bộ nhớ, trích text thật ra khỏi PDF rồi chấm theo bộ check ATS.
 *   Không lưu gì cả. Kiểu dữ liệu trả về: `src/types/ats.type.ts`.
 *   `keywordMatch` chỉ có khi gửi kèm mô tả công việc (jobDescription).
 */

import { computed, ref } from 'vue'
import { useHelper } from '@/composables/useHelper'
import { handleBase } from '@/services/base'
import { API } from '@/config/api.config'
import { getDownloadCvUrl } from '@/utilities/index'
import { authStore } from '@/stores/auth'

const { loading, toast } = useHelper()

const TEMPLATES = [
    { value: 'ats', label: 'Tối ưu ATS' },
    { value: 'classic', label: 'Classic' },
]
const LANGS = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
]

const template = ref('ats')
const lang = ref('vi')
const jobDescription = ref('')

/** @type {import('vue').Ref<import('@/types/ats.type').AtsCheckResponse | null>} */
const result = ref(null)
// template của lần kiểm tra gần nhất — có thể khác `template` đang chọn
const checkedTemplate = ref('ats')

const _host = window.location.host === 'localhost' ? 'http://localhost:3001/' : API
const auth = authStore()
const downloadUrl = computed(() => getDownloadCvUrl(_host, template.value, auth.getToken, lang.value))

const scoreClass = computed(() => {
    const score = result.value?.score ?? 0
    if (score >= 80) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-danger'
})

const failedCount = computed(() => (result.value?.checks || []).filter(c => !c.passed).length)

async function handleCheck() {
    const data = { template: template.value, lang: lang.value }
    const jd = jobDescription.value.trim()
    jd && (data.jobDescription = jd)

    await handleBase({ method: 'post', url: 'cv/ats-check', data }, { loading, toast }, res => {
        result.value = res?.data || null
        checkedTemplate.value = data.template
    })
}
</script>

<template>
    <div class="mb-[1.5rem]">
        <Heading text="Kiểm tra CV theo ATS">
            <Button icon="fa-solid fa-gauge" type="outline-success" size="sm" text="Kiểm tra" @click="handleCheck" />
        </Heading>
        <p class="text-sm opacity-75">
            ATS (Applicant Tracking System) là hệ thống nhiều công ty dùng để tự động đọc và lọc CV. Server sẽ tạo CV từ hồ sơ hiện tại, đọc lại
            text thật trong file PDF và chấm điểm theo các tiêu chí an toàn cho ATS. Dán mô tả công việc (không bắt buộc) để xem các từ khóa CV
            còn thiếu.
        </p>

        <div class="flex flex-wrap items-center gap-[1rem] mb-3">
            <div class="flex items-center gap-[0.5rem]">
                <span class="text-sm opacity-75">Mẫu CV:</span>
                <button
                    v-for="t in TEMPLATES"
                    :key="t.value"
                    type="button"
                    class="btn btn-sm"
                    :class="template === t.value ? 'btn-success' : 'btn-outline-success'"
                    @click="template = t.value"
                >
                    {{ t.label }}
                </button>
            </div>
            <div class="flex items-center gap-[0.5rem]">
                <span class="text-sm opacity-75">Ngôn ngữ:</span>
                <select v-model="lang" class="form-select form-select-sm w-auto">
                    <option v-for="l in LANGS" :key="l.value" :value="l.value">{{ l.label }}</option>
                </select>
            </div>
            <a class="btn btn-sm btn-outline-secondary" :href="downloadUrl" target="_blank">
                <FontAwesomeIcon icon="fa-solid fa-download" class="me-1" />Tải CV mẫu này
            </a>
        </div>

        <label for="ats-job-description" class="form-label text-sm opacity-75">Mô tả công việc (không bắt buộc)</label>
        <textarea
            id="ats-job-description"
            v-model="jobDescription"
            class="form-control"
            rows="5"
            placeholder="Dán nội dung tin tuyển dụng vào đây để so khớp từ khóa..."
        ></textarea>
    </div>

    <template v-if="result">
        <div class="block-container mb-[1.5rem]">
            <Heading text="Kết quả" />
            <div class="flex flex-wrap items-baseline gap-[1.5rem]">
                <p class="mb-0">
                    <span class="h2 font-bold" :class="scoreClass">{{ result.score }}</span>
                    <span class="opacity-50">/100</span>
                </p>
                <p class="mb-0 opacity-75">{{ result.pages }} trang</p>
                <p class="mb-0 opacity-75">{{ failedCount ? `${failedCount} tiêu chí chưa đạt` : 'Đạt tất cả tiêu chí' }}</p>
            </div>
            <p v-if="checkedTemplate === 'classic'" class="text-sm opacity-50 mt-2 mb-0">
                Mẫu Classic không được thiết kế cho ATS nên điểm thấp hơn là bình thường — chọn "Tối ưu ATS" để so sánh.
            </p>
        </div>

        <div class="block-container mb-[1.5rem]">
            <Heading text="Chi tiết từng tiêu chí" />
            <ul class="list-unstyled mb-0">
                <li v-for="check in result.checks" :key="check.id" class="flex items-start gap-[0.5rem] py-2 border-b">
                    <FontAwesomeIcon
                        :icon="check.passed ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"
                        :class="check.passed ? 'text-success' : check.severity === 'error' ? 'text-danger' : 'text-warning'"
                        class="mt-1"
                    />
                    <div class="grow">
                        <span>{{ check.message }}</span>
                        <span
                            v-if="!check.passed"
                            class="badge rounded-pill ms-2"
                            :class="check.severity === 'error' ? 'text-bg-danger' : 'text-bg-warning'"
                        >
                            {{ check.severity === 'error' ? 'Lỗi' : 'Cảnh báo' }}
                        </span>
                    </div>
                </li>
            </ul>
        </div>

        <div v-if="result.keywordMatch" class="block-container mb-[1.5rem]">
            <Heading text="So khớp từ khóa với mô tả công việc" />
            <p class="mb-2">
                Độ phủ: <strong>{{ Math.round(result.keywordMatch.coverage * 100) }}%</strong>
            </p>
            <p class="text-sm opacity-75 mb-1">Đã có trong CV ({{ result.keywordMatch.matched.length }}):</p>
            <div class="flex flex-wrap gap-[0.375rem] mb-3">
                <span v-for="k in result.keywordMatch.matched" :key="`m_${k}`" class="badge rounded-pill text-bg-success">{{ k }}</span>
                <span v-if="!result.keywordMatch.matched.length" class="text-sm opacity-50">—</span>
            </div>
            <p class="text-sm opacity-75 mb-1">Còn thiếu ({{ result.keywordMatch.missing.length }}):</p>
            <div class="flex flex-wrap gap-[0.375rem]">
                <span v-for="k in result.keywordMatch.missing" :key="`x_${k}`" class="badge rounded-pill text-bg-secondary">{{ k }}</span>
                <span v-if="!result.keywordMatch.missing.length" class="text-sm opacity-50">—</span>
            </div>
        </div>

        <details class="block-container">
            <summary class="pointer">Text ATS đọc được từ CV</summary>
            <pre class="mt-2 mb-0 text-sm" style="white-space: pre-wrap">{{ result.extractedText }}</pre>
        </details>
    </template>
</template>
