<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'
import ExperienceItem from '@/components/experience/ExperienceItem.vue'

import { ref, shallowRef } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { useManualOrder } from '@/composables/useManualOrder'
import { localizedToForm, localizedFromForm } from '@/utilities/index'

import model from '@/models/experience.model.ts'

const { experiences: dataList, removeRecordById, addRecordToList } = useCandidate({ field: 'experiences' })

// Sắp xếp thủ công (issue #57) — chỉ lưu ở trình duyệt (localStorage),
// KHÔNG đồng bộ server (backend chưa có field order — xem comment đầu
// `useManualOrder.ts`).
const { orderedItems, reorder } = useManualOrder('experience', dataList)
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
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'experience', fields: model })

/**
 *  modal
 */
const refModal = ref()
const refVeeForm = ref()
const formFields = shallowRef(model)

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
        return localizedFromForm(val, ['description'])
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
    deleteDoc({ ...doc }, 'company', res => {
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
    Object.assign(document, localizedToForm(doc, ['description']))

    refModal.value?.show()
}

function showModalCreateDoc() {
    isDuplicating.value = false
    for (const k of formFields.value) {
        document[k.name] = k.default
    }
    refModal.value?.show()
    refVeeForm.value?.reset()
}

function showModalDuplicateDoc(doc) {
    isDuplicating.value = true
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }
    Object.assign(document, localizedToForm(doc, ['description']))

    refModal.value?.show()
}
</script>

<template>
    <div>
        <Heading :level="1" text="Kinh nghiệm làm việc">
            <Button type="primary" icon="fa-solid fa-plus" text="Thêm kinh nghiệm" @click="showModalCreateDoc()" />
        </Heading>

        <div v-if="dataList.length">
            <p class="mb-2 mt-0 text-xs text-fg-3">Kéo thả để sắp xếp. Thứ tự chỉ lưu trên trình duyệt này.</p>
            <ListTransition class="m-0 list-none divide-y divide-line rounded-md border border-line bg-surface p-0">
                <li
                    v-for="edu in orderedItems"
                    :key="edu._id"
                    class="draggable-item flex items-start gap-1 ps-2"
                    draggable="true"
                    @dragstart="onDragStart(edu._id)"
                    @dragover.prevent
                    @drop="onDrop(edu._id)"
                >
                    <span class="drag-handle" aria-hidden="true"><FontAwesomeIcon icon="fa-solid fa-grip-vertical" /></span>
                    <div class="min-w-0 grow">
                        <ExperienceItem
                            :model-value="edu"
                            icon="fa-building"
                            @on-edit="showModalEditDoc"
                            @on-delete="handleDelete"
                            @on-duplicate="showModalDuplicateDoc"
                        />
                    </div>
                </li>
            </ListTransition>
        </div>
        <div v-else class="rounded-md border border-line bg-surface">
            <NoData title="Chưa có kinh nghiệm nào" description="Thêm nơi bạn từng làm và vai trò của bạn.">
                <Button icon="fa-solid fa-plus" text="Thêm kinh nghiệm" @click="showModalCreateDoc()" />
            </NoData>
        </div>
    </div>

    <Modal
        ref="refModal"
        :title="
            isDuplicating
                ? `Nhân bản: ${document.company}`
                : document._id
                  ? `Chỉnh sửa: ${document.company}`
                  : 'Thêm kinh nghiệm'
        "
        is-hidden-footer
    >
        <div class="block-container">
            <VeeForm
                ref="refVeeForm"
                :fields="formFields"
                :document="document"
                :submit-fn="handleUpdate"
                submit-text="Lưu"
                button-position="end"
            >
                <template #cancel>
                    <Button text="Hủy" type="ghost" data-bs-dismiss="modal" />
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
    @apply flex h-14 w-6 shrink-0 items-center justify-center text-fg-3;
}
/* the handle already gives the row its left inset */
.draggable-item :deep(.item) {
    @apply ps-0;
}
</style>
