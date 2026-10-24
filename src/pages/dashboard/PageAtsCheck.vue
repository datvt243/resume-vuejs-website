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
import { useDownloadCv } from '@/composables/useDownloadCv'
import { buttonClass } from '@/lib/button.lib'
import { badgeClass } from '@/lib/badge.lib'
import { useCvLang } from '@/composables/useCvLang'
import { t } from '@/i18n'

const { loading, toast } = useHelper()

const TEMPLATES = computed(() => [
    { value: 'ats', label: t('home.templateAts') },
    { value: 'classic', label: 'Classic' },
])

const template = ref('ats')
// CV language comes from the header VI | EN switch
const { selectedLang: lang } = useCvLang()
const jobDescription = ref('')

/** @type {import('vue').Ref<import('@/types/ats.type').AtsCheckResponse | null>} */
const result = ref(null)
// template của lần kiểm tra gần nhất — có thể khác `template` đang chọn
const checkedTemplate = ref('ats')

const { download, isDownloading } = useDownloadCv()

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
        <Heading :level="1" :text="t('ats.title')" :description="t('ats.description')">
            <Button icon="fa-solid fa-gauge" type="primary" :text="t('ats.check')" @click="handleCheck" />
        </Heading>

        <section :class="[card, 'space-y-4']">
            <div class="flex flex-wrap items-end gap-4">
                <div>
                    <p class="form-label block">{{ t('home.cvTemplate') }}</p>
                    <SegmentedControl v-model="template" :options="TEMPLATES" :aria-label="t('home.cvTemplate')" />
                </div>
                <button
                    type="button"
                    :class="downloadBtn"
                    :disabled="isDownloading"
                    :aria-busy="isDownloading"
                    @click="download({ template, lang })"
                >
                    <FontAwesomeIcon :icon="isDownloading ? 'fa-solid fa-spinner' : 'fa-solid fa-download'" :spin="isDownloading" aria-hidden="true" />{{ t('ats.downloadTemplate') }}
                </button>
            </div>
            <div>
                <label for="ats-job-description" class="form-label">{{ t('ats.jobDescription') }} <span class="font-normal text-fg-3">{{ t('common.optional') }}</span></label>
                <textarea
                    id="ats-job-description"
                    v-model="jobDescription"
                    class="form-control"
                    rows="5"
                    :placeholder="t('ats.jobDescriptionPlaceholder')"
                ></textarea>
            </div>
        </section>

        <template v-if="result">
            <section :class="card">
                <Heading :text="t('ats.result')" />
                <div class="flex flex-wrap items-baseline gap-6">
                    <p class="m-0">
                        <span class="text-xl font-semibold tracking-tight tabular-nums" :class="scoreClass">{{ result.score }}</span>
                        <span class="text-sm text-fg-3">/100</span>
                    </p>
                    <p class="m-0 text-sm text-fg-2">{{ t('ats.pages', { count: result.pages }) }}</p>
                    <p class="m-0 text-sm text-fg-2">{{ failedCount ? t('ats.failedCount', { count: failedCount }) : t('ats.allPassed') }}</p>
                </div>
                <p v-if="checkedTemplate === 'classic'" class="mb-0 mt-2 text-xs text-fg-3">
                    {{ t('ats.classicNote') }}
                </p>
            </section>

            <section :class="card">
                <Heading :text="t('ats.details')" />
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
                                {{ check.severity === 'error' ? t('ats.error') : t('ats.warning') }}
                            </span>
                        </div>
                    </li>
                </ul>
            </section>

            <section v-if="result.keywordMatch" :class="card">
                <Heading :text="t('ats.keywordMatch')" />
                <p class="mb-4 mt-0 text-sm text-fg-2">
                    {{ t('ats.coverage') }} <strong class="text-md font-semibold tabular-nums text-fg">{{ Math.round(result.keywordMatch.coverage * 100) }}%</strong>
                </p>
                <p class="form-label block">{{ t('ats.matched', { count: result.keywordMatch.matched.length }) }}</p>
                <div class="mb-4 flex flex-wrap gap-1.5">
                    <span v-for="k in result.keywordMatch.matched" :key="`m_${k}`" :class="badgeClass('success')" data-badge="success">{{ k }}</span>
                    <span v-if="!result.keywordMatch.matched.length" class="text-sm text-fg-3">—</span>
                </div>
                <p class="form-label block">{{ t('ats.missing', { count: result.keywordMatch.missing.length }) }}</p>
                <div class="flex flex-wrap gap-1.5">
                    <span v-for="k in result.keywordMatch.missing" :key="`x_${k}`" :class="badgeClass('neutral')" data-badge="neutral">{{ k }}</span>
                    <span v-if="!result.keywordMatch.missing.length" class="text-sm text-fg-3">—</span>
                </div>
            </section>

            <details :class="card">
                <summary class="cursor-pointer text-sm font-medium">{{ t('ats.extractedText') }}</summary>
                <pre class="mb-0 mt-2 whitespace-pre-wrap break-words text-sm text-fg-2">{{ result.extractedText }}</pre>
            </details>
        </template>
    </div>
</template>
