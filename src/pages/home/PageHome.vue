<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Overview page (route '/'), DESIGN.md §4.1 — profile strip →
 * KPI row → visits chart + completion checklist → CV card. Only real data:
 * the view count is cached by LayoutDefault (useVisits), the chart reads
 * useVisitStats, completion comes from useProfileCompletion and the
 * application count from useCandidate.
 */

import { computed, ref } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { authStore } from '@/stores/auth'
import { useProfileCompletion } from '@/composables/useProfileCompletion'
import { useCandidate } from '@/composables/useCandidate'
import { useVisitStats } from '@/composables/useVisitStats'
import { useCvLang } from '@/composables/useCvLang'
import { API } from '@/config/api.config'
import { getDownloadCvUrl } from '@/utilities/index'
import { buttonClass } from '@/lib/button.lib'
import VisitChart from '@/components/visits/VisitChart.vue'

const candidate = candidateStore()
const auth = authStore()
const numberFormat = new Intl.NumberFormat('vi-VN')

/* profile strip */
const info = computed(() => candidate.getCandidate)
const generalInfo = computed(() => candidate.getGeneralInformation)
const fullName = computed(() => {
    const { firstName = '', lastName = '' } = info.value
    return `${firstName} ${lastName}`.trim() || 'Chưa cập nhật tên'
})
const initials = computed(() => {
    const { firstName = '', lastName = '' } = info.value
    return (`${firstName?.[0] || ''}${lastName?.[0] || ''}` || 'U').toUpperCase()
})
// backend has no avatar field yet; render it once it exists
const avatarUrl = computed(() => info.value?.avatar || '')
const position = computed(() => generalInfo.value?.positionDesired || '')
const isOpenToWork = computed(() => !!generalInfo.value?.openToWork)

/* KPIs */
const { percent: profileCompletion, sections, missingSections } = useProfileCompletion()
const { applications } = useCandidate({ field: 'applications', collection: 'application' })
const kpis = computed(() => [
    {
        label: 'Lượt xem hồ sơ',
        value: numberFormat.format(info.value?.visitCount ?? 0),
        hint: 'Tổng số lần hồ sơ công khai được mở',
        to: '/dashboard/visits',
    },
    {
        label: 'Hoàn thành hồ sơ',
        value: `${profileCompletion.value}%`,
        hint: `${sections.value.length - missingSections.value.length}/${sections.value.length} mục đã đủ`,
        to: missingSections.value[0]?.to || '/dashboard/information',
    },
    {
        label: 'Đơn ứng tuyển',
        value: numberFormat.format(applications.value?.length ?? 0),
        hint: 'Đang theo dõi',
        to: '/dashboard/application',
    },
])

/* visits chart (default interval: day, last 30 days) */
const { stats } = useVisitStats()

/* CV card — the PDF is generated server-side from the profile on download */
const _host = window.location.host === 'localhost' ? 'http://localhost:3001/' : API
const CV_TEMPLATES = [
    { value: 'classic', label: 'Classic' },
    { value: 'ats', label: 'Tối ưu ATS' },
]
const cvTemplate = ref('classic')
const { selectedLang } = useCvLang()
// plain link navigation → no Authorization header, pass the in-memory access token as `?token=`
const downloadCVUrl = computed(() => getDownloadCvUrl(_host, cvTemplate.value, auth.getToken, selectedLang.value))
const cvFileName = computed(() => {
    const { firstName = '', lastName = '' } = info.value
    const name = `${firstName}_${lastName}`.replace(/\s+/g, '_').replace(/^_+|_+$/g, '')
    return `${name || 'CV'}.pdf`
})

const btnSecondary = buttonClass({ variant: 'secondary' })
const btnPrimary = buttonClass({ variant: 'primary' })
const btnGhost = buttonClass({ variant: 'ghost', size: 'sm' })
</script>

<template>
    <h1 class="sr-only">Tổng quan</h1>
    <div class="space-y-6">
        <!-- Profile strip -->
        <section class="flex flex-wrap items-center gap-4 rounded-md border border-line bg-surface p-4" aria-label="Hồ sơ">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-subtle text-sm font-semibold text-accent">
                <img v-if="avatarUrl" :src="avatarUrl" alt="" class="h-full w-full object-cover" />
                <span v-else aria-hidden="true">{{ initials }}</span>
            </div>
            <div class="min-w-0 flex-1">
                <p class="m-0 truncate text-md font-semibold text-fg">{{ fullName }}</p>
                <p class="m-0 truncate text-sm text-fg-2">{{ position || 'Chưa có vị trí mong muốn' }}</p>
            </div>
            <span
                class="inline-flex h-5 items-center gap-1.5 rounded-sm px-2 text-xs font-medium"
                :class="isOpenToWork ? 'bg-success-subtle text-success' : 'bg-surface-2 text-fg-2'"
            >
                <span class="h-1.5 w-1.5 rounded-full" :class="isOpenToWork ? 'bg-success' : 'bg-fg-3'" aria-hidden="true"></span>
                {{ isOpenToWork ? 'Đang mở tìm việc' : 'Không tìm việc' }}
            </span>
            <RouterLink to="/dashboard/information" :class="btnSecondary">Cập nhật hồ sơ</RouterLink>
        </section>

        <!-- KPI row -->
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6" aria-label="Chỉ số">
            <RouterLink
                v-for="k in kpis"
                :key="k.label"
                :to="k.to"
                class="block rounded-md border border-line bg-surface p-4 text-fg no-underline hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
                <p class="m-0 text-sm text-fg-2">{{ k.label }}</p>
                <p class="m-0 mt-1 text-xl font-semibold tracking-tight">{{ k.value }}</p>
                <p class="m-0 mt-1 text-xs text-fg-3">{{ k.hint }}</p>
            </RouterLink>
        </section>

        <!-- Main row -->
        <div class="grid gap-6 lg:grid-cols-3">
            <section class="min-w-0 rounded-md border border-line bg-surface lg:col-span-2" aria-labelledby="home-visits-title">
                <header class="flex h-12 items-center justify-between border-b border-line px-4">
                    <h2 id="home-visits-title" class="m-0 text-md font-semibold">Lượt xem 30 ngày</h2>
                    <RouterLink to="/dashboard/visits" class="text-sm font-medium text-accent no-underline hover:text-accent-hover hover:underline">Xem chi tiết</RouterLink>
                </header>
                <div class="p-4">
                    <template v-if="stats">
                        <p class="m-0 mb-2 text-sm text-fg-2">
                            <span class="text-base font-semibold text-fg">{{ numberFormat.format(stats.total) }}</span> lượt xem
                        </p>
                        <VisitChart :series="stats.series" :interval="stats.interval" />
                    </template>
                    <div v-else class="h-56 rounded bg-surface-2 motion-safe:animate-pulse" aria-hidden="true"></div>
                </div>
            </section>

            <section class="rounded-md border border-line bg-surface" aria-labelledby="home-completion-title">
                <header class="flex h-12 items-center border-b border-line px-4">
                    <h2 id="home-completion-title" class="m-0 text-md font-semibold">Hoàn thiện hồ sơ</h2>
                </header>
                <div class="p-4">
                    <div class="flex items-center gap-3">
                        <div
                            class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
                            role="progressbar"
                            aria-label="Mức hoàn thành hồ sơ"
                            :aria-valuenow="profileCompletion"
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >
                            <div class="h-full rounded-full bg-brand" :style="{ width: `${profileCompletion}%` }"></div>
                        </div>
                        <span class="text-sm font-medium">{{ profileCompletion }}%</span>
                    </div>
                    <template v-if="missingSections.length">
                        <p class="m-0 mt-4 text-sm text-fg-2">Còn thiếu {{ missingSections.length }} mục</p>
                        <ul class="m-0 mt-2 list-none space-y-1 p-0">
                            <li v-for="section in missingSections" :key="section.to">
                                <RouterLink :to="section.to" class="text-sm text-accent no-underline hover:text-accent-hover hover:underline">{{ section.label }}</RouterLink>
                            </li>
                        </ul>
                    </template>
                    <p v-else class="m-0 mt-4 text-sm text-fg-2">Hồ sơ đã đủ các mục bắt buộc.</p>
                </div>
            </section>
        </div>

        <!-- CV card -->
        <section class="rounded-md border border-line bg-surface" aria-labelledby="home-cv-title">
            <header class="flex h-12 items-center justify-between border-b border-line px-4">
                <h2 id="home-cv-title" class="m-0 text-md font-semibold">CV của bạn</h2>
                <RouterLink to="/dashboard/ats-check" :class="btnGhost">Kiểm tra điểm ATS</RouterLink>
            </header>
            <div class="flex flex-wrap items-center gap-4 p-4">
                <div class="flex min-w-0 flex-1 items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-2 text-fg-2" aria-hidden="true">
                        <FontAwesomeIcon icon="fa-solid fa-file-lines" />
                    </div>
                    <div class="min-w-0">
                        <p class="m-0 truncate text-sm font-medium text-fg">{{ cvFileName }}</p>
                        <p class="m-0 text-xs text-fg-3">Tạo tự động từ hồ sơ, luôn là bản mới nhất</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <SegmentedControl v-model="cvTemplate" :options="CV_TEMPLATES" aria-label="Mẫu CV" />
                    <span title="Sắp ra mắt">
                        <button type="button" :class="btnSecondary" disabled aria-describedby="home-attach-soon">
                            <FontAwesomeIcon icon="fa-solid fa-paperclip" />
                            <span>Đính kèm file</span>
                        </button>
                        <span id="home-attach-soon" class="sr-only">Sắp ra mắt</span>
                    </span>
                    <a :href="downloadCVUrl" :download="cvFileName" target="_blank" :class="btnPrimary">
                        <FontAwesomeIcon icon="fa-solid fa-download" />
                        <span>Tải CV</span>
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>
