<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'

import ProjectItem from '@/components/project/ProjectItem.vue'

import { ref, shallowRef } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { getLocalizedText, wrapLocalizedText } from '@/utilities/index'

import model from '@/models/project.model.ts'

const { projects: dataList, removeRecordById, addRecordToList, getData } = useCandidate({ field: 'projects' })

/**
 *
 */
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'project', fields: model })

/**
 *  modal
 */
const refModal = ref()
const refVeeForm = ref()
const formFields = shallowRef(model)

// giữ lại giá trị description gốc (có thể là object { vi, en } từ backend)
// để khi lưu lại không mất phần `en` — xem utilities/index.ts
const originalDescription = ref(null)

// Nhân bản (issue #60): giữ `document._id` = id của bản ghi gốc (KHÔNG
// để rỗng) trong lúc modal mở — VeeForm.vue có watch(document) tự
// reset() form về default nếu `_id` falsy, nên xoá `_id` ngay từ đầu sẽ
// làm mất luôn dữ liệu vừa copy. Thay vào đó chỉ đánh dấu qua cờ này,
// rồi xoá `_id` ngay trước khi gọi updateDoc để tạo bản ghi MỚI (POST)
// thay vì ghi đè bản ghi gốc (PUT).
const isDuplicating = ref(false)

/**
 *
 * Method
 */
async function handleUpdate(values) {
    /**
     * re-format data
     */
    const data = (val => {
        val.startDate = +new Date(val.startDate)
        val.endDate = +new Date(val.endDate)
        val.technology = val.technology?.split(',')
        val.description = wrapLocalizedText(val.description, originalDescription.value)

        !val.isWorking && (val.isWorking = false)
        return val
    })({ ...values })

    if (isDuplicating.value) {
        data._id = null
        isDuplicating.value = false
    }

    await updateDoc(data, res => {
        const { data } = res
        addRecordToList(data)
    })
}

async function handleDelete(doc) {
    deleteDoc({ ...doc }, 'name', res => {
        const { data } = res
        removeRecordById(data._id)
    })
}

function showModalEditDoc(doc) {
    isDuplicating.value = false
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }

    document.technology = document.technology?.join(', ')
    originalDescription.value = doc.description
    document.description = getLocalizedText(doc.description)

    refModal.value?.show()
}

function showModalCreateDoc() {
    isDuplicating.value = false
    for (const k of formFields.value) {
        document[k.name] = k.default
    }
    originalDescription.value = null
    refModal.value?.show()
    refVeeForm.value?.reset()
}

function showModalDuplicateDoc(doc) {
    isDuplicating.value = true
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }

    document.technology = document.technology?.join(', ')
    originalDescription.value = doc.description
    document.description = getLocalizedText(doc.description)

    refModal.value?.show()
}
</script>

<template>
    <div class="mb-4">
        <Heading text="Dự án">
            <div class="btn-group">
                <Button @click="showModalCreateDoc()" icon="fa-solid fa-plus" type="outline-success" size="sm"></Button>
                <Button @click="getData?.()" icon="fa-solid fa-repeat" type="outline-info" size="sm"></Button>
            </div>
        </Heading>

        <div v-if="dataList.length" class="clearfix">
            <ListTransition>
                <li v-for="edu in dataList" :key="edu._id">
                    <ProjectItem
                        :model-value="edu"
                        icon="fa-code"
                        @on-edit="showModalEditDoc"
                        @on-delete="handleDelete"
                        @on-duplicate="showModalDuplicateDoc"
                    >
                        <template #sub>
                            <p>Công Nghệ: {{ edu.technology?.join(', ') || '' }}</p>
                        </template>
                    </ProjectItem>
                </li>
            </ListTransition>
        </div>
        <NoData v-else />
    </div>

    <Modal
        ref="refModal"
        :title="isDuplicating ? `Nhân bản: ${document.name}` : document._id ? `Chỉnh sửa: ${document.name}` : 'Thêm mới Dự án'"
        is-hidden-footer
    >
        <div class="block-container">
            <VeeForm
                ref="refVeeForm"
                :fields="formFields"
                :document="document"
                :submit-fn="handleUpdate"
                :submit-text="isDuplicating ? 'Nhân bản' : document._id ? 'Cập nhật' : 'Thêm mới'"
                buttonPosition="end"
            >
                <template #button>
                    <button type="button" class="btn btn-secondary mx-3" data-bs-dismiss="modal">Đóng</button>
                </template>
            </VeeForm>
        </div>
    </Modal>
</template>
