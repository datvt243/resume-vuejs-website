<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Trang xem trước CV tổng hợp toàn bộ dữ liệu (thông tin
 * chung, học vấn, kinh nghiệm, dự án, giải thưởng, chứng chỉ, người tham
 * khảo) và cho xuất ra PDF/in qua trình duyệt (window.print() +
 * @media print) — issue #55. Layout/markup itself lives in the shared
 * `CvResumeLayout.vue` (issue #119) so this page and the public
 * share-link page can never drift apart; this page only assembles the
 * data + lets the owner pick a theme (persisted via `useCvTheme`).
 */

import { computed, onMounted, onUnmounted } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { authStore } from '@/stores/auth'
import { useCandidate } from '@/composables/useCandidate'
import { useCvTheme } from '@/composables/useCvTheme'
import CvResumeLayout from '@/components/cv/CvResumeLayout.vue'

const candidate = candidateStore()
const auth = authStore()

const info = computed(() => candidate.getCandidate)

const { generalInformation } = useCandidate({ field: 'generalInformation', collection: 'general-information' })
const { educations } = useCandidate({ field: 'educations', collection: 'education' })
const { experiences } = useCandidate({ field: 'experiences' })
const { projects } = useCandidate({ field: 'projects' })
const { awards } = useCandidate({ field: 'awards' })
const { certificates } = useCandidate({ field: 'certificates' })
const { references } = useCandidate({ field: 'references' })

const cvData = computed(() => ({
    firstName: info.value.firstName,
    lastName: info.value.lastName,
    phone: info.value.phone,
    address: info.value.address,
    email: auth.getUser?.email,
    introduction: info.value.introduction,
    generalInformation: generalInformation.value,
    educations: educations.value,
    experiences: experiences.value,
    projects: projects.value,
    awards: awards.value,
    certificates: certificates.value,
    references: references.value,
}))

const { selectedTheme, setTheme, THEMES } = useCvTheme()

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
    <div class="mb-[1.5rem] no-print flex flex-wrap items-center justify-between gap-[0.75rem]">
        <Heading text="Xem trước CV">
            <Button text="Xuất PDF / In" icon="fa-solid fa-download" type="outline-success" size="sm" @click="handlePrint()" />
        </Heading>
        <div class="flex items-center gap-[0.5rem]">
            <span class="text-sm opacity-75">Giao diện:</span>
            <button
                v-for="t in THEMES"
                :key="t.value"
                type="button"
                class="btn btn-sm"
                :class="selectedTheme === t.value ? 'btn-success' : 'btn-outline-success'"
                @click="setTheme(t.value)"
            >
                {{ t.label }}
            </button>
        </div>
    </div>

    <div id="cv-print-area">
        <CvResumeLayout :data="cvData" :theme="selectedTheme" />
    </div>
</template>

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
