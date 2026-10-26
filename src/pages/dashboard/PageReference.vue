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
const { references: dataList, removeRecordById, addRecordToList, loadError, getData } = useCandidate({ field: 'references' })
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
        refModal.value?.hide()
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
    <div>
        <Heading :level="1" :text="$t('nav.reference')">
            <Button type="primary" icon="fa-solid fa-plus" :text="$t('crud.reference.add')" @click="showModalCreateDoc()" />
        </Heading>

        <!--  -->
        <TableDefault
            v-if="dataList.length"
            :model-value="dataList"
            :settings="formFields"
            :cols-hidden="colHidden"
            col-control="fullName"
            height-auto
        >
            <template #control="{ doc }">
                <div class="flex items-center gap-1">
                    <ItemActions
                        :label="doc.fullName"
                        :delete-disabled="!doc._id"
                        @edit="showModalEditDoc({ ...doc })"
                        @duplicate="showModalDuplicateDoc({ ...doc })"
                        @delete="deleteDoc({ ...doc }, 'fullName', res => removeRecordById(res.data._id))"
                    />
                </div>
            </template>
        </TableDefault>
        <LoadingGate v-else :error="loadError" @retry="getData">
            <div class="rounded-md border border-line bg-surface">
                <NoData :title="$t('crud.reference.empty')" :description="$t('crud.reference.emptyDescription')">
                    <Button icon="fa-solid fa-plus" :text="$t('crud.reference.add')" @click="showModalCreateDoc()" />
                </NoData>
            </div>
        </LoadingGate>
    </div>

    <Modal
        ref="refModal"
        :title="
            isDuplicating
                ? $t('form.duplicateTitle', { name: document.fullName })
                : document._id
                  ? $t('form.editTitle', { name: document.fullName })
                  : $t('crud.reference.add')
        "
        is-hidden-footer
    >
        <div class="block-container">
            <VeeForm
                ref="refVeeForm"
                :fields="formFields"
                :document="document"
                :submit-fn="handleUpdate"
                button-position="end"
            >
                <template #cancel>
                    <Button :text="$t('common.cancel')" type="ghost" data-bs-dismiss="modal" />
                </template>
            </VeeForm>
        </div>
    </Modal>
</template>
