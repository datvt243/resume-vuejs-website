<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Nhập Học vấn/Kinh nghiệm từ file LinkedIn "Data export"
 *   (.zip), từ PDF CV cũ, hoặc từ file JSON Resume. LinkedIn/PDF qua 2
 *   endpoint backend (`POST candidate/parse-linkedin-export`,
 *   `POST candidate/parse-cv-pdf`), JSON Resume parse ngay trên trình duyệt
 *   — cả 3 trả về cùng một shape, KHÔNG lưu gì cả — mỗi mục tìm thấy
 *   phải qua đúng form Học vấn/Kinh nghiệm hiện có để người dùng review/sửa
 *   trước khi bấm lưu thật, không tự động lưu thẳng.
 */

import Modal from '@/components/Modal.vue'
import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { computed, ref } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { useHelper } from '@/composables/useHelper'
import { handleBase } from '@/services/base'
import { localizedFromForm } from '@/utilities/index'
import { fromJsonResume } from '@/utilities/jsonResume'
import { t } from '@/i18n'

import educationModel from '@/models/education.model'
import experienceModel from '@/models/experience.model'

const { loading, toast } = useHelper()

const { addRecordToList: addEducation } = useCandidate({ field: 'educations', collection: 'education' })
const { addRecordToList: addExperience } = useCandidate({ field: 'experiences' })

const { document: educationDoc, updateDoc: updateEducationDoc } = useDocument({ collection: 'education', fields: educationModel })
const { document: experienceDoc, updateDoc: updateExperienceDoc } = useDocument({ collection: 'experience', fields: experienceModel })

const SOURCES = {
    linkedin: { label: 'LinkedIn', url: 'candidate/parse-linkedin-export' },
    pdf: { label: 'PDF', url: 'candidate/parse-cv-pdf' },
    jsonresume: { label: 'JSON Resume', url: null },
}

const fileInput = ref(null)
const pdfInput = ref(null)
const jsonInput = ref(null)
const source = ref('linkedin')
const hasParsed = ref(false)
const parsedEducations = ref([])
const parsedExperiences = ref([])
const extractedText = ref('')

function triggerFilePicker() {
    fileInput.value?.click()
}

function triggerPdfPicker() {
    pdfInput.value?.click()
}

function triggerJsonPicker() {
    jsonInput.value?.click()
}

// which source the user is about to pick (UI only); `source` is what was actually parsed
const picker = ref('linkedin')
const PICKERS = computed(() => [
    { value: 'linkedin', label: 'LinkedIn', button: t('importCv.chooseZip'), open: triggerFilePicker },
    { value: 'pdf', label: 'PDF', button: t('importCv.choosePdf'), open: triggerPdfPicker },
    { value: 'jsonresume', label: 'JSON Resume', button: t('importCv.chooseJson'), open: triggerJsonPicker },
])
const activePicker = computed(() => PICKERS.value.find(p => p.value === picker.value))

function applyParsed(sourceKey, data) {
    source.value = sourceKey
    parsedEducations.value = (data?.educations || []).map(item => ({ ...item, _imported: false }))
    parsedExperiences.value = (data?.experiences || []).map(item => ({ ...item, _imported: false }))
    extractedText.value = data?.extractedText || ''
    hasParsed.value = true
}

async function handleSelectFile(e, sourceKey = 'linkedin') {
    const file = e.target?.files?.[0]
    e.target.value = ''
    if (!file) return

    if (sourceKey === 'jsonresume') {
        try {
            applyParsed(sourceKey, fromJsonResume(JSON.parse(await file.text())))
        } catch (err) {
            toast?.({ message: err instanceof SyntaxError ? t('importCv.invalidJson') : err.message, bg: 'danger' })
        }
        return
    }

    const formData = new FormData()
    formData.append('file', file)

    await handleBase({ method: 'post', url: SOURCES[sourceKey].url, data: formData }, { loading, toast }, res => {
        applyParsed(sourceKey, res.data)
    })
}

// Điền sẵn document từ 1 mục đã parse. Giữ `_id` truthy trong lúc modal mở
// — VeeForm.vue có watch(document) tự reset() form về default nếu `_id`
// falsy (cùng trap đã gặp ở tính năng "Nhân bản", issue #60) — nên set
// _id thật thành null ngay trước khi gọi updateDoc để POST tạo mới thay
// vì PUT ghi đè.
function prefill(doc, fields, item) {
    for (const f of fields) {
        const val = item[f.name]
        doc[f.name] = val !== undefined && val !== null && val !== '' ? val : f.default
    }
    doc._id = 'import'
}

/**
 * Education
 */
const refModalEdu = ref()
const activeEduItem = ref(null)

function openEducationModal(item) {
    prefill(educationDoc, educationModel, item)
    activeEduItem.value = item
    refModalEdu.value?.show()
}

async function handleSaveEducation(values) {
    const data = (val => {
        val.startDate = +new Date(val.startDate)
        val.endDate = +new Date(val.endDate)
        !val.isCurrent && (val.isCurrent = false)
        val._id = null
        return localizedFromForm(val, ['description'])
    })({ ...values })

    await updateEducationDoc(data, res => {
        const { data } = res
        addEducation(data)
        if (activeEduItem.value) activeEduItem.value._imported = true
    })
}

/**
 * Experience
 */
const refModalExp = ref()
const activeExpItem = ref(null)

function openExperienceModal(item) {
    prefill(experienceDoc, experienceModel, item)
    activeExpItem.value = item
    refModalExp.value?.show()
}

async function handleSaveExperience(values) {
    const data = (val => {
        val.startDate = +new Date(val.startDate)
        val.endDate = +new Date(val.endDate)
        !val.isCurrent && (val.isCurrent = false)
        val._id = null
        return localizedFromForm(val, ['description'])
    })({ ...values })

    await updateExperienceDoc(data, res => {
        const { data } = res
        addExperience(data)
        if (activeExpItem.value) activeExpItem.value._imported = true
    })
}
</script>

<template>
    <div class="space-y-6">
        <Heading :level="1" :text="t('nav.importCv')" :description="t('importCv.description')" />
        <input ref="fileInput" type="file" accept=".zip" class="hidden" @change="handleSelectFile($event, 'linkedin')" />
        <input ref="pdfInput" type="file" accept=".pdf,application/pdf" class="hidden" @change="handleSelectFile($event, 'pdf')" />
        <input ref="jsonInput" type="file" accept=".json,application/json" class="hidden" @change="handleSelectFile($event, 'jsonresume')" />

        <section class="space-y-4 rounded-md border border-line bg-surface p-4">
            <div>
                <p class="form-label block">{{ t('importCv.source') }}</p>
                <SegmentedControl v-model="picker" :options="PICKERS" :aria-label="t('importCv.source')" />
            </div>
            <p class="m-0 text-sm text-fg-2">
                <i18n-t v-if="picker === 'linkedin'" keypath="importCv.linkedinHint" scope="global">
                    <template #link>
                        <a href="https://www.linkedin.com/mypreferences/d/download-my-data" target="_blank" rel="noopener">LinkedIn Data export</a>
                    </template>
                </i18n-t>
                <template v-else-if="picker === 'pdf'">{{ t('importCv.pdfHint') }}</template>
                <i18n-t v-else keypath="importCv.jsonHint" scope="global">
                    <template #link><a href="https://jsonresume.org/schema" target="_blank" rel="noopener">JSON Resume</a></template>
                    <template #file><code>resume.json</code></template>
                </i18n-t>
            </p>
            <Button type="primary" icon="fa-solid fa-paperclip" :text="activePicker.button" @click="activePicker.open()" />
        </section>

        <template v-if="hasParsed">
            <p class="m-0 text-sm text-fg-2">{{ t('importCv.sourceIs', { source: SOURCES[source].label }) }}<span v-if="source === 'pdf'"> · {{ t('importCv.pdfGuess') }}</span></p>

            <section v-for="group in [
                { key: 'edu', title: t('importCv.foundEducation'), items: parsedEducations, name: i => i.school || t('importCv.unknownSchool'), sub: i => i.major, open: openEducationModal },
                { key: 'exp', title: t('importCv.foundExperience'), items: parsedExperiences, name: i => i.company || t('importCv.unknownCompany'), sub: i => i.position, open: openExperienceModal },
            ]" :key="group.key" class="rounded-md border border-line bg-surface">
                <h2 class="m-0 flex h-12 items-center border-b border-line px-4 text-md font-semibold">
                    {{ group.title }} <span class="ms-1 font-normal tabular-nums text-fg-3">({{ group.items.length }})</span>
                </h2>
                <NoData v-if="!group.items.length" :title="t('importCv.nothingFound')" />
                <ul v-else class="m-0 list-none divide-y divide-line p-0">
                    <li v-for="(item, idx) in group.items" :key="idx" class="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                        <div class="min-w-0">
                            <p class="m-0 break-words text-sm font-medium text-fg">{{ group.name(item) }}</p>
                            <p v-if="group.sub(item)" class="m-0 text-xs text-fg-2">{{ group.sub(item) }}</p>
                        </div>
                        <Button v-if="!item._imported" icon="fa-solid fa-plus" :text="t('common.add')" size="sm" @click="group.open(item)" />
                        <span v-else class="inline-flex items-center gap-1 text-sm text-success"><FontAwesomeIcon icon="fa-solid fa-circle-check" aria-hidden="true" />{{ t('importCv.added') }}</span>
                    </li>
                </ul>
            </section>

            <details v-if="extractedText" class="rounded-md border border-line bg-surface p-4">
                <summary class="cursor-pointer text-sm font-medium">{{ t('importCv.extractedText') }}</summary>
                <pre class="mb-0 mt-2 whitespace-pre-wrap break-words text-sm text-fg-2">{{ extractedText }}</pre>
            </details>
        </template>
    </div>

    <Modal ref="refModalEdu" :title="t('importCv.addEducationFrom', { source: SOURCES[source].label })" is-hidden-footer>
        <div class="block-container">
            <VeeForm :fields="educationModel" :document="educationDoc" :submit-fn="handleSaveEducation" button-position="end">
                <template #cancel>
                    <Button :text="t('common.cancel')" type="ghost" data-bs-dismiss="modal" />
                </template>
            </VeeForm>
        </div>
    </Modal>

    <Modal ref="refModalExp" :title="t('importCv.addExperienceFrom', { source: SOURCES[source].label })" is-hidden-footer>
        <div class="block-container">
            <VeeForm :fields="experienceModel" :document="experienceDoc" :submit-fn="handleSaveExperience" button-position="end">
                <template #cancel>
                    <Button :text="t('common.cancel')" type="ghost" data-bs-dismiss="modal" />
                </template>
            </VeeForm>
        </div>
    </Modal>
</template>
