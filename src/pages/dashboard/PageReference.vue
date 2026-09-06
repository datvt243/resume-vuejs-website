<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import TableDefault from '@/components/table/TableDefault.vue'
import Modal from '@/components/Modal.vue'

import { ref, shallowRef } from 'vue'
import { useCandidate, useDocument } from '@/composables'
/* import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument' */

import model from '@/models/reference.model.ts'
/** */
const { references: dataList, removeRecordById, addRecordToList, getData } = useCandidate({ field: 'references' })
const colHidden = ['_id']

/**
 *
 */
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'reference', fields: model })

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
    const data = { ...values }
    if (isDuplicating.value) {
        data._id = null
        isDuplicating.value = false
    }
    await updateDoc(data, res => {
        const { data } = res
        addRecordToList(data)
    })
}

function showModalEditDoc(doc) {
    isDuplicating.value = false
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }
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
    refModal.value?.show()
}
</script>

<template>
    <div class="mb-4">
        <Heading text="Người tham khảo">
            <div class="btn-group">
                <Button @click="showModalCreateDoc()" icon="fa-solid fa-plus" type="outline-success" size="sm"></Button>
                <Button @click="getData?.()" icon="fa-solid fa-repeat" type="outline-info" size="sm"></Button>
            </div>
        </Heading>

        <!--  -->
        <TableDefault :model-value="dataList" :settings="formFields" :cols-hidden="colHidden" col-control="fullName">
            <template #control="{ doc }">
                <Dropdown text="" :style="'outline-success border-0'" split>
                    <li>
                        <a class="dropdown-item" href="#" @click="showModalEditDoc({ ...doc })">
                            <span class="text-warning pe-2"><FontAwesomeIcon icon="fa-solid fa-square-pen" /></span>
                            <span>Sửa</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click="showModalDuplicateDoc({ ...doc })">
                            <span class="text-primary pe-2"><FontAwesomeIcon icon="fa-solid fa-copy" /></span>
                            <span>Nhân bản</span>
                        </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                        <a
                            class="dropdown-item"
                            href="#"
                            :class="{ disabled: !doc._id }"
                            @click="
                                () => {
                                    deleteDoc({ ...doc }, 'fullName', res => {
                                        const { data } = res
                                        removeRecordById(data._id)
                                    })
                                }
                            "
                        >
                            <span class="text-danger pe-2"><FontAwesomeIcon icon="fa-solid fa-trash" /></span>
                            <span>Xoá</span>
                        </a>
                    </li>
                </Dropdown>
            </template>
        </TableDefault>
    </div>

    <Modal
        ref="refModal"
        :title="
            isDuplicating
                ? `Nhân bản: ${document.fullName}`
                : document._id
                  ? `Chỉnh sửa: ${document.fullName}`
                  : 'Thêm mới Người tham khảo'
        "
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
