<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Nhập Học vấn/Kinh nghiệm từ file LinkedIn "Data export"
 *   (.zip) hoặc từ PDF CV cũ. Cả 2 endpoint backend
 *   (`POST candidate/parse-linkedin-export`, `POST candidate/parse-cv-pdf`)
 *   chỉ parse và trả về cùng một shape, KHÔNG lưu gì cả — mỗi mục tìm thấy
 *   phải qua đúng form Học vấn/Kinh nghiệm hiện có để người dùng review/sửa
 *   trước khi bấm lưu thật, không tự động lưu thẳng.
 */

import Modal from '@/components/Modal.vue'
import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { ref } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { useHelper } from '@/composables/useHelper'
import { handleBase } from '@/services/base'
import { localizedFromForm } from '@/utilities/index'

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
}

const fileInput = ref(null)
const pdfInput = ref(null)
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

async function handleSelectFile(e, sourceKey = 'linkedin') {
    const file = e.target?.files?.[0]
    e.target.value = ''
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    await handleBase({ method: 'post', url: SOURCES[sourceKey].url, data: formData }, { loading, toast }, res => {
        const { data } = res
        source.value = sourceKey
        parsedEducations.value = (data?.educations || []).map(item => ({ ...item, _imported: false }))
        parsedExperiences.value = (data?.experiences || []).map(item => ({ ...item, _imported: false }))
        extractedText.value = data?.extractedText || ''
        hasParsed.value = true
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
    <div class="mb-[1.5rem]">
        <Heading text="Nhập CV (LinkedIn / PDF)">
            <div class="flex flex-wrap gap-2">
                <Button icon="fa-solid fa-paperclip" type="outline-success" size="sm" text="Chọn file export (.zip)" @click="triggerFilePicker" />
                <Button icon="fa-solid fa-paperclip" type="outline-success" size="sm" text="Chọn file PDF CV" @click="triggerPdfPicker" />
            </div>
        </Heading>
        <input ref="fileInput" type="file" accept=".zip" class="hidden" @change="handleSelectFile($event, 'linkedin')" />
        <input ref="pdfInput" type="file" accept=".pdf,application/pdf" class="hidden" @change="handleSelectFile($event, 'pdf')" />

        <p class="text-sm opacity-75">
            Xuất dữ liệu LinkedIn tại
            <a href="https://www.linkedin.com/mypreferences/d/download-my-data" target="_blank" rel="noopener">linkedin.com/mypreferences/d/download-my-data</a>
            ("Data export" — chọn "Positions" và "Education"), tải về file .zip rồi chọn ở trên.
        </p>
        <p class="text-sm opacity-75">
            Hoặc chọn PDF CV cũ (tối đa 5MB). Việc đọc PDF chỉ là phỏng đoán: CV một cột cho kết quả tốt nhất, CV nhiều cột/thiết kế phức tạp có thể sót
            mục, PDF scan (ảnh) không đọc được. Kiểm tra kỹ từng mục trước khi thêm.
        </p>

        <template v-if="hasParsed">
            <p class="text-sm opacity-75">Nguồn: {{ SOURCES[source].label }}</p>
            <div class="mb-[1.5rem]">
                <h6>Học vấn tìm thấy ({{ parsedEducations.length }})</h6>
                <NoData v-if="!parsedEducations.length" />
                <ul v-else class="list-unstyled">
                    <li v-for="(item, idx) in parsedEducations" :key="idx" class="flex items-center justify-between gap-2 py-2 border-b border-[var(--bs-border-color)]">
                        <div>
                            <strong>{{ item.school || '(Không rõ tên trường)' }}</strong>
                            <span v-if="item.major" class="opacity-75"> — {{ item.major }}</span>
                        </div>
                        <Button v-if="!item._imported" icon="fa-solid fa-plus" type="outline-success" size="sm" text="Thêm" @click="openEducationModal(item)" />
                        <span v-else class="text-success"><FontAwesomeIcon icon="fa-solid fa-circle-check" /> Đã thêm</span>
                    </li>
                </ul>
            </div>

            <div class="mb-[1.5rem]">
                <h6>Kinh nghiệm tìm thấy ({{ parsedExperiences.length }})</h6>
                <NoData v-if="!parsedExperiences.length" />
                <ul v-else class="list-unstyled">
                    <li v-for="(item, idx) in parsedExperiences" :key="idx" class="flex items-center justify-between gap-2 py-2 border-b border-[var(--bs-border-color)]">
                        <div>
                            <strong>{{ item.company || '(Không rõ tên công ty)' }}</strong>
                            <span v-if="item.position" class="opacity-75"> — {{ item.position }}</span>
                        </div>
                        <Button v-if="!item._imported" icon="fa-solid fa-plus" type="outline-success" size="sm" text="Thêm" @click="openExperienceModal(item)" />
                        <span v-else class="text-success"><FontAwesomeIcon icon="fa-solid fa-circle-check" /> Đã thêm</span>
                    </li>
                </ul>
            </div>

            <details v-if="extractedText" class="block-container">
                <summary class="pointer">Văn bản đọc được từ PDF (copy phần bị sót)</summary>
                <pre class="mt-2 mb-0 text-sm" style="white-space: pre-wrap">{{ extractedText }}</pre>
            </details>
        </template>
    </div>

    <Modal ref="refModalEdu" :title="`Thêm mới Học vấn (từ ${SOURCES[source].label})`" is-hidden-footer>
        <div class="block-container">
            <VeeForm :fields="educationModel" :document="educationDoc" :submit-fn="handleSaveEducation" submit-text="Thêm mới" buttonPosition="end">
                <template #button>
                    <button type="button" class="btn btn-secondary mx-[1rem]" data-bs-dismiss="modal">Đóng</button>
                </template>
            </VeeForm>
        </div>
    </Modal>

    <Modal ref="refModalExp" :title="`Thêm mới kinh nghiệm làm việc (từ ${SOURCES[source].label})`" is-hidden-footer>
        <div class="block-container">
            <VeeForm :fields="experienceModel" :document="experienceDoc" :submit-fn="handleSaveExperience" submit-text="Thêm mới" buttonPosition="end">
                <template #button>
                    <button type="button" class="btn btn-secondary mx-[1rem]" data-bs-dismiss="modal">Đóng</button>
                </template>
            </VeeForm>
        </div>
    </Modal>
</template>
