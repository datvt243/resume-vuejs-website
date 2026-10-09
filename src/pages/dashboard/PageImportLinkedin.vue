<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Nhập Học vấn/Kinh nghiệm từ file LinkedIn "Data export"
 *   (issue #120, chỉ nhánh LinkedIn — PDF chưa có endpoint parse phía
 *   backend, xem resume-nodejs-api#141). Endpoint backend
 *   (`POST candidate/parse-linkedin-export`) chỉ parse và trả về, KHÔNG
 *   lưu gì cả — mỗi mục tìm thấy phải qua đúng form Học vấn/Kinh nghiệm
 *   hiện có để người dùng review/sửa trước khi bấm lưu thật (yêu cầu rõ
 *   trong issue #120: "map vào form để user review và sửa trước khi lưu
 *   — không tự động lưu thẳng").
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

const fileInput = ref(null)
const hasParsed = ref(false)
const parsedEducations = ref([])
const parsedExperiences = ref([])

function triggerFilePicker() {
    fileInput.value?.click()
}

async function handleSelectFile(e) {
    const file = e.target?.files?.[0]
    e.target.value = ''
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    await handleBase({ method: 'post', url: 'candidate/parse-linkedin-export', data: formData }, { loading, toast }, res => {
        const { data } = res
        parsedEducations.value = (data?.educations || []).map(item => ({ ...item, _imported: false }))
        parsedExperiences.value = (data?.experiences || []).map(item => ({ ...item, _imported: false }))
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
        <Heading text="Nhập CV từ LinkedIn">
            <Button icon="fa-solid fa-paperclip" type="outline-success" size="sm" text="Chọn file export (.zip)" @click="triggerFilePicker" />
        </Heading>
        <input ref="fileInput" type="file" accept=".zip" class="hidden" @change="handleSelectFile" />

        <p class="text-sm opacity-75">
            Xuất dữ liệu LinkedIn tại
            <a href="https://www.linkedin.com/mypreferences/d/download-my-data" target="_blank" rel="noopener">linkedin.com/mypreferences/d/download-my-data</a>
            ("Data export" — chọn "Positions" và "Education"), tải về file .zip rồi chọn ở trên. Chỉ hỗ trợ file export từ LinkedIn — nhập từ PDF CV
            chưa có endpoint xử lý phía backend, xem
            <a href="https://github.com/datvt243/resume-vuejs-website/issues/120" target="_blank" rel="noopener">issue #120</a>.
        </p>

        <template v-if="hasParsed">
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
        </template>
    </div>

    <Modal ref="refModalEdu" title="Thêm mới Học vấn (từ LinkedIn)" is-hidden-footer>
        <div class="block-container">
            <VeeForm :fields="educationModel" :document="educationDoc" :submit-fn="handleSaveEducation" submit-text="Thêm mới" buttonPosition="end">
                <template #button>
                    <button type="button" class="btn btn-secondary mx-[1rem]" data-bs-dismiss="modal">Đóng</button>
                </template>
            </VeeForm>
        </div>
    </Modal>

    <Modal ref="refModalExp" title="Thêm mới kinh nghiệm làm việc (từ LinkedIn)" is-hidden-footer>
        <div class="block-container">
            <VeeForm :fields="experienceModel" :document="experienceDoc" :submit-fn="handleSaveExperience" submit-text="Thêm mới" buttonPosition="end">
                <template #button>
                    <button type="button" class="btn btn-secondary mx-[1rem]" data-bs-dismiss="modal">Đóng</button>
                </template>
            </VeeForm>
        </div>
    </Modal>
</template>
