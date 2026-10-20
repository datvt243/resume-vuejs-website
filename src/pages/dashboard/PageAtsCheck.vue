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
import { buttonClass } from '@/lib/button.lib'
import { badgeClass } from '@/lib/badge.lib'
import { useCvLang } from '@/composables/useCvLang'

const { loading, toast } = useHelper()

const TEMPLATES = [
    { value: 'ats', label: 'Tối ưu ATS' },
    { value: 'classic', label: 'Classic' },
]

const template = ref('ats')
// CV language comes from the header VI | EN switch
const { selectedLang: lang } = useCvLang()
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

const downloadBtn = buttonClass({ variant: 'secondary' })
const card = 'rounded-md border border-line bg-surface p-4'

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
    <div class="space-y-6">
        <Heading :level="1" text="Kiểm tra CV theo ATS" description="Chấm điểm CV theo cách hệ thống lọc hồ sơ (ATS) đọc file PDF, kèm so khớp từ khóa nếu bạn dán mô tả công việc.">
            <Button icon="fa-solid fa-gauge" type="primary" text="Kiểm tra" @click="handleCheck" />
        </Heading>

        <section :class="[card, 'space-y-4']">
            <div class="flex flex-wrap items-end gap-4">
                <div>
                    <p class="form-label block">Mẫu CV</p>
                    <SegmentedControl v-model="template" :options="TEMPLATES" aria-label="Mẫu CV" />
                </div>
                <a :class="downloadBtn" :href="downloadUrl" target="_blank" rel="noopener">
                    <FontAwesomeIcon icon="fa-solid fa-download" aria-hidden="true" />Tải CV mẫu này
                </a>
            </div>
            <div>
                <label for="ats-job-description" class="form-label">Mô tả công việc <span class="font-normal text-fg-3">(không bắt buộc)</span></label>
                <textarea
                    id="ats-job-description"
                    v-model="jobDescription"
                    class="form-control"
                    rows="5"
                    placeholder="Dán nội dung tin tuyển dụng để so khớp từ khóa…"
                ></textarea>
            </div>
        </section>

        <template v-if="result">
            <section :class="card">
                <Heading text="Kết quả" />
                <div class="flex flex-wrap items-baseline gap-6">
                    <p class="m-0">
                        <span class="text-xl font-semibold tracking-tight tabular-nums" :class="scoreClass">{{ result.score }}</span>
                        <span class="text-sm text-fg-3">/100</span>
                    </p>
                    <p class="m-0 text-sm text-fg-2">{{ result.pages }} trang</p>
                    <p class="m-0 text-sm text-fg-2">{{ failedCount ? `${failedCount} tiêu chí chưa đạt` : 'Đạt tất cả tiêu chí' }}</p>
                </div>
                <p v-if="checkedTemplate === 'classic'" class="mb-0 mt-2 text-xs text-fg-3">
                    Mẫu Classic không làm cho ATS nên điểm thấp hơn là bình thường; chọn "Tối ưu ATS" để so sánh.
                </p>
            </section>

            <section :class="card">
                <Heading text="Chi tiết từng tiêu chí" />
                <ul class="m-0 list-none divide-y divide-line p-0">
                    <li v-for="check in result.checks" :key="check.id" class="flex items-start gap-2 py-2">
                        <FontAwesomeIcon
                            :icon="check.passed ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"
                            :class="check.passed ? 'text-success' : check.severity === 'error' ? 'text-danger' : 'text-warning'"
                            class="mt-1"
                            aria-hidden="true"
                        />
                        <div class="flex min-w-0 grow flex-wrap items-center gap-2 text-sm">
                            <span>{{ check.message }}</span>
                            <span
                                v-if="!check.passed"
                                :class="badgeClass(check.severity === 'error' ? 'danger' : 'warning')"
                                :data-badge="check.severity === 'error' ? 'danger' : 'warning'"
                            >
                                {{ check.severity === 'error' ? 'Lỗi' : 'Cảnh báo' }}
                            </span>
                        </div>
                    </li>
                </ul>
            </section>

            <section v-if="result.keywordMatch" :class="card">
                <Heading text="So khớp từ khóa với mô tả công việc" />
                <p class="mb-4 mt-0 text-sm text-fg-2">
                    Độ phủ <strong class="text-md font-semibold tabular-nums text-fg">{{ Math.round(result.keywordMatch.coverage * 100) }}%</strong>
                </p>
                <p class="form-label block">Đã có trong CV ({{ result.keywordMatch.matched.length }})</p>
                <div class="mb-4 flex flex-wrap gap-1.5">
                    <span v-for="k in result.keywordMatch.matched" :key="`m_${k}`" :class="badgeClass('success')" data-badge="success">{{ k }}</span>
                    <span v-if="!result.keywordMatch.matched.length" class="text-sm text-fg-3">—</span>
                </div>
                <p class="form-label block">Còn thiếu ({{ result.keywordMatch.missing.length }})</p>
                <div class="flex flex-wrap gap-1.5">
                    <span v-for="k in result.keywordMatch.missing" :key="`x_${k}`" :class="badgeClass('neutral')" data-badge="neutral">{{ k }}</span>
                    <span v-if="!result.keywordMatch.missing.length" class="text-sm text-fg-3">—</span>
                </div>
            </section>

            <details :class="card">
                <summary class="cursor-pointer text-sm font-medium">Text ATS đọc được từ CV</summary>
                <pre class="mb-0 mt-2 whitespace-pre-wrap break-words text-sm text-fg-2">{{ result.extractedText }}</pre>
            </details>
        </template>
    </div>
</template>
