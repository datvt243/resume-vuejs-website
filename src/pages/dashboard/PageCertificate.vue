<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'

import ItemTemplate from '@/components/global/ItemTemplate.vue'

import { ref, shallowRef } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'

import model from '@/models/certificate.model.ts'

import { formatDate, localizedToForm, localizedFromForm } from '@/utilities/index'

const { certificates: dataList, removeRecordById, addRecordToList } = useCandidate({ field: 'certificates' })

/**
 *
 */
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'certificate', fields: model })

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
        !val.isNoExpiration && (val.isNoExpiration = false)
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

function showModalEditDoc(doc) {
    isDuplicating.value = false
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }

    !document.isNoExpiration && (document.isNoExpiration = false)
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

    !document.isNoExpiration && (document.isNoExpiration = false)
    Object.assign(document, localizedToForm(doc, ['description']))
    refModal.value?.show()
}
</script>

<template>
    <div>
        <Heading :level="1" text="Chứng chỉ">
          <Button type="primary" icon="fa-solid fa-plus" text="Thêm chứng chỉ" @click="showModalCreateDoc()" />
        </Heading>

        <div v-if="dataList.length">
            <ListTransition class="m-0 list-none divide-y divide-line rounded-md border border-line bg-surface p-0">
                <li v-for="item in dataList" :key="item._id">
                    <ItemTemplate
                        :model-value="{
                            title: item.name,
                            subTitle: item.organization,
                            date: () => {
                                const { startDate, endDate, isNoExpiration } = item
                                const _start = formatDate(startDate, 'MM/YYYY')
                                const _end = isNoExpiration ? 'Không thời hạn' : formatDate(endDate, 'MM/YYYY')
                                return `${_start} - ${_end}`
                            },
                            description: item.description,
                        }"
                        icon="fa-certificate"
                    >
                        <ItemActions :label="item.name" @edit="showModalEditDoc({ ...item })" @duplicate="showModalDuplicateDoc({ ...item })"
                @delete="deleteDoc({ ...item }, 'name', res => removeRecordById(res.data._id))" />
                    </ItemTemplate>
                </li>
            </ListTransition>
        </div>
        <LoadingGate v-else>
            <div class="rounded-md border border-line bg-surface">
                <NoData title="Chưa có chứng chỉ nào">
                    <Button icon="fa-solid fa-plus" text="Thêm chứng chỉ" @click="showModalCreateDoc()" />
                </NoData>
            </div>
        </LoadingGate>
    </div>

    <Modal
        ref="refModal"
        :title="
            isDuplicating ? `Nhân bản: ${document.name}` : document._id ? `Chỉnh sửa: ${document.name}` : 'Thêm chứng chỉ'
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
