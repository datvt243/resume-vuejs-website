<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'
import EducationItem from '@/components/education/EducationItem.vue'

import { ref, shallowRef } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { useManualOrder } from '@/composables/useManualOrder'
import { getLocalizedText, wrapLocalizedText } from '@/utilities/index'

import model from '@/models/education.model'

const {
    educations: dataList,
    removeRecordById,
    addRecordToList,
    getData,
} = useCandidate({ field: 'educations', collection: 'education' })

// Sắp xếp thủ công (issue #57) — chỉ lưu ở trình duyệt (localStorage),
// KHÔNG đồng bộ server (backend chưa có field order — xem comment đầu
// `useManualOrder.ts`).
const { orderedItems, reorder } = useManualOrder('education', dataList)
const dragId = ref(null)
function onDragStart(id) {
    dragId.value = id
}
function onDrop(targetId) {
    if (dragId.value === null || dragId.value === targetId) return
    const list = [...orderedItems.value]
    const fromIndex = list.findIndex(e => e._id === dragId.value)
    const toIndex = list.findIndex(e => e._id === targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    reorder(list)
    dragId.value = null
}

/**
 *
 */
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'education', fields: model })

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
        !val.isCurrent && (val.isCurrent = false)
        val.description = wrapLocalizedText(val.description, originalDescription.value)
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
    deleteDoc({ ...doc }, 'school', res => {
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
    originalDescription.value = doc.description
    document.description = getLocalizedText(doc.description)

    refModal.value?.show()
}
</script>

<template>
    <div class="mb-4">
        <Heading text="Học vấn">
            <div class="btn-group">
                <Button @click="showModalCreateDoc()" icon="fa-solid fa-plus" type="outline-success" size="sm"></Button>
                <Button @click="getData?.()" icon="fa-solid fa-repeat" type="outline-info" size="sm"></Button>
            </div>
        </Heading>

        <div v-if="dataList.length" class="clearfix">
            <p class="small opacity-50 mb-2">Kéo-thả để sắp xếp thứ tự hiển thị (chỉ lưu trên trình duyệt này).</p>
            <ListTransition>
                <li
                    v-for="edu in orderedItems"
                    :key="edu._id"
                    class="draggable-item d-flex align-items-start gap-2"
                    draggable="true"
                    @dragstart="onDragStart(edu._id)"
                    @dragover.prevent
                    @drop="onDrop(edu._id)"
                >
                    <span class="drag-handle"><FontAwesomeIcon icon="fa-solid fa-grip-vertical" /></span>
                    <div class="flex-grow-1">
                        <EducationItem
                            :model-value="edu"
                            icon="fa-graduation-cap"
                            @on-edit="showModalEditDoc"
                            @on-delete="handleDelete"
                            @on-duplicate="showModalDuplicateDoc"
                        />
                    </div>
                </li>
            </ListTransition>
        </div>
        <NoData v-else />
    </div>

    <Modal
        ref="refModal"
        :title="isDuplicating ? `Nhân bản: ${document.school}` : document._id ? `Chỉnh sửa: ${document.school}` : 'Thêm mới Học vấn'"
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

<style scoped>
.draggable-item {
    cursor: grab;
}
.draggable-item:active {
    cursor: grabbing;
}
.drag-handle {
    padding-top: 1.25rem;
    opacity: 0.4;
}
</style>
