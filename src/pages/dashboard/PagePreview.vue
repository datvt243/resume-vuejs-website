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

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { authStore } from '@/stores/auth'
import { useCandidate } from '@/composables/useCandidate'
import { useCvTheme } from '@/composables/useCvTheme'
import { useCvLang, LANG_OPTIONS } from '@/composables/useCvLang'
import { useActiveProfile } from '@/composables/useActiveProfile'
import { useDownloadCv, withLangSuffix } from '@/composables/useDownloadCv'
import CvResumeLayout from '@/components/cv/CvResumeLayout.vue'
import { toJsonResume } from '@/utilities/jsonResume'
import { pageBreaks, PX_PER_MM } from '@/utilities/pageBreaks'
import { t } from '@/i18n'

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

// Issue #116: filter the exported/printed sections to the active
// profile's selected subset — done CLIENT-SIDE (all sections are already
// loaded here) rather than a server round-trip like the public page uses.
const { profiles } = useCandidate({ field: 'profiles', collection: 'profile' })
const { activeProfileId, setActiveProfile } = useActiveProfile()
const activeProfile = computed(() => profiles.value.find(p => p._id === activeProfileId.value) || null)

function filterByProfile(list, idsField) {
    if (!activeProfile.value) return list
    const ids = activeProfile.value[idsField] || []
    return list.filter(item => ids.includes(item._id))
}

const cvData = computed(() => ({
    firstName: info.value.firstName,
    lastName: info.value.lastName,
    phone: info.value.phone,
    address: info.value.address,
    email: auth.getUser?.email,
    introduction: info.value.introduction,
    generalInformation: generalInformation.value,
    educations: filterByProfile(educations.value, 'educationIds'),
    experiences: filterByProfile(experiences.value, 'experienceIds'),
    projects: filterByProfile(projects.value, 'projectIds'),
    awards: filterByProfile(awards.value, 'awardIds'),
    certificates: filterByProfile(certificates.value, 'certificateIds'),
    references: filterByProfile(references.value, 'referenceIds'),
}))

const { selectedTheme, setTheme, THEMES } = useCvTheme()
const { selectedLang, setLang } = useCvLang()
const { cvFileName } = useDownloadCv()

function handlePrint() {
    window.print()
}

function handleExportJsonResume() {
    const json = toJsonResume(cvData.value, selectedLang.value, info.value.socialMedia || {})
    const url = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = withLangSuffix(cvFileName.value.replace(/\.pdf$/, '.json'), selectedLang.value)
    a.click()
    // revoking in the same tick can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(url))
}

// A4 297mm minus the 15mm top + bottom `@page` margin
const PAGE_HEIGHT = 267 * PX_PER_MM

const viewport = ref(null)
const sheet = ref(null)
const scale = ref(1)
const sheetHeight = ref(0)
const breaks = ref([])

/** A section title travels with its first entry (or first line), matching `break-after: avoid` with `orphans: 1`. */
function keepTogetherBlocks(content) {
    const box = content.getBoundingClientRect()
    // undo the on-screen scale so positions are in the unscaled A4 px the printer lays out
    const ratio = content.offsetHeight / box.height || 1
    const y = px => (px - box.top) * ratio
    const blocks = []
    for (const el of content.querySelectorAll('.cv-section-title, .cv-item')) {
        if (el.classList.contains('cv-item') && el.previousElementSibling?.classList.contains('cv-section-title')) continue
        const rect = el.getBoundingClientRect()
        let bottom = rect.bottom
        const next = el.classList.contains('cv-section-title') && el.nextElementSibling
        if (next) {
            const nextRect = next.getBoundingClientRect()
            const firstLine = (parseFloat(getComputedStyle(next).lineHeight) || 24) / ratio
            bottom = next.classList.contains('cv-item') ? nextRect.bottom : Math.min(nextRect.bottom, nextRect.top + firstLine)
        }
        blocks.push({ top: y(rect.top), bottom: y(bottom) })
    }
    return blocks
}

function measure() {
    const content = sheet.value?.firstElementChild
    if (!content) return
    breaks.value = pageBreaks(keepTogetherBlocks(content), content.offsetHeight, PAGE_HEIGHT)
    sheetHeight.value = sheet.value.offsetHeight
    if (viewport.value.clientWidth) scale.value = Math.min(1, viewport.value.clientWidth / sheet.value.offsetWidth)
}

watch([cvData, selectedTheme, selectedLang], () => nextTick(measure))

// injected only while mounted: Vue never removes a component's <style>, so a static @page would hit every later print
const pageStyle = document.createElement('style')
pageStyle.textContent = '@page { size: A4; margin: 15mm; }'

let observer = null
// Chỉ bật CSS ẩn header/sidebar/footer khi in TRONG LÚC đang ở trang này
// (class trên <body>, gỡ lại khi rời trang) — tránh ảnh hưởng in ấn ở các
// trang khác.
onMounted(() => {
    document.body.classList.add('cv-print-mode')
    document.head.append(pageStyle)
    measure()
    document.fonts?.ready.then(measure)
    if (typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(() => measure())
    observer.observe(viewport.value)
    observer.observe(sheet.value.firstElementChild)
})
onUnmounted(() => {
    document.body.classList.remove('cv-print-mode')
    pageStyle.remove()
    observer?.disconnect()
})
</script>

<template>
    <div class="no-print mb-6">
        <Heading :level="1" :text="t('preview.title')">
            <Button :text="t('preview.exportJson')" icon="fa-solid fa-download" @click="handleExportJsonResume()" />
            <Button :text="t('preview.exportPdf')" icon="fa-solid fa-download" type="primary" @click="handlePrint()" />
        </Heading>
        <div class="flex flex-wrap items-end gap-4 rounded-md border border-line bg-surface p-4">
            <div>
                <p class="form-label block">{{ t('preview.theme') }}</p>
                <SegmentedControl :model-value="selectedTheme" :options="THEMES" :aria-label="t('preview.cvTheme')" @update:model-value="setTheme" />
            </div>
            <div>
                <p class="form-label block">{{ t('preview.cvLanguage') }}</p>
                <SegmentedControl :model-value="selectedLang" :options="LANG_OPTIONS" :aria-label="t('preview.cvLanguage')" @update:model-value="setLang" />
            </div>
            <div v-if="profiles.length">
                <label for="preview-profile" class="form-label">{{ t('field.cvProfile') }}</label>
                <select id="preview-profile" class="form-select block" :value="activeProfileId" @change="setActiveProfile($event.target.value)">
                    <option value="">{{ t('information.allProfiles') }}</option>
                    <option v-for="p in profiles" :key="p._id" :value="p._id">{{ p.name }}</option>
                </select>
            </div>
        </div>
    </div>

    <div ref="viewport" class="cv-sheet-viewport" :style="scale < 1 ? { height: `${sheetHeight * scale}px` } : null">
        <!-- the sheet is paper: light tokens even when the app is dark -->
        <div id="cv-print-area" ref="sheet" class="cv-sheet" data-bs-theme="light" :style="scale < 1 ? { transform: `scale(${scale})` } : null">
            <CvResumeLayout :data="cvData" :theme="selectedTheme" :lang="selectedLang" />
            <div v-for="(y, i) in breaks" :key="i" class="cv-page-break no-print" :style="{ top: `calc(15mm + ${y}px)` }" aria-hidden="true">
                <span class="absolute -top-2.5 right-2 bg-surface px-1 text-xs leading-5 text-fg-3">{{ t('preview.pageN', { n: i + 2 }) }}</span>
            </div>
        </div>
    </div>
</template>

<style>
/* Không dùng `scoped` ở đây vì cần chọn `body`/`header`/`footer` — những
   phần tử ngoài template của component này. Class `cv-print-mode` chỉ
   được gắn lên <body> khi component này đang mounted (xem script), nên
   không ảnh hưởng tới việc in ở các trang khác. */

/* One A4 sheet: the 15mm padding is the `@page` margin (set in script), so screen and print lay out the same 180mm box */
.cv-sheet-viewport {
    overflow: hidden;
}
.cv-sheet {
    position: relative;
    box-sizing: border-box;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 15mm;
    background: var(--color-surface);
    color: var(--color-fg);
    box-shadow: var(--shadow-float);
    transform-origin: top left;
    /* break between any two lines, the granularity the page-break hints assume */
    orphans: 1;
    widows: 1;
}
.cv-sheet .cv-item {
    break-inside: avoid;
}
.cv-sheet .cv-section-title {
    break-after: avoid;
}
.cv-page-break {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed var(--color-line-strong);
}

@media print {
    body.cv-print-mode header:not(.cv-header),
    body.cv-print-mode footer,
    body.cv-print-mode #app-sidebar,
    body.cv-print-mode .no-print {
        display: none !important;
    }
    /* the layout's sidebar offset, padding and full-height columns would shift the CV or add a blank page */
    body.cv-print-mode #app-sidebar ~ div,
    body.cv-print-mode main {
        min-height: 0 !important;
        padding: 0 !important;
    }
    body.cv-print-mode .cv-sheet-viewport {
        height: auto !important;
        overflow: visible;
    }
    body.cv-print-mode .cv-sheet {
        width: auto;
        min-height: 0;
        padding: 0;
        box-shadow: none;
        transform: none !important;
    }
}
</style>
