<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import TableDefault from '@/components/table/TableDefault.vue'
import Modal from '@/components/Modal.vue'

import { ref, defineProps, computed, onBeforeMount, reactive, watch, inject } from 'vue'

import { useDocument } from '@/composables/useDocument'
import Swal from 'sweetalert2'
import { candidateStore } from '@/stores/candidate'

const candidate = inject('candidate')

const props = defineProps({
    heading: { type: String, default: '' },
    fieldKey: { type: String, default: '' },
    fields: { type: Array, default: () => [] },
    hasButtonAdd: { type: Boolean, default: false },
    modelValue: { type: [Array, Object], default: () => ({}) },
})

/**
 *
 * Modal & VeeForm
 */
const refModal02 = ref()
const refVeeForm02 = ref()

function showModalCreateDoc() {
    for (const k of generalInformationField.value) {
        document[k.name] = k.default
    }
    refModal02.value?.show()
    refVeeForm02.value?.reset()
}

/**
 *
 */
const generalInformation = reactive({})
onBeforeMount(() => {
    getValueForGeneralInformation(props.modelValue)
})
watch(
    () => props.modelValue,
    val => {
        getValueForGeneralInformation(val)
    },
    { deep: true },
)
const generalInformationField = computed(() => generalInformation?.[props.fieldKey] || [])
function getValueForGeneralInformation(value) {
    const _list = value
    const _type = Array.isArray(_list) ? 'array' : 'object'
    const _val = _type === 'array' ? (_list.length ? _list?.[0] : {}) : _list
    for (const e of Object.keys(_val)) {
        generalInformation[e] = _val[e]
    }
}

/**
 *
 */
const { document, updatePatchDoc } = useDocument({ collection: 'general-information', fields: generalInformationField.value })
async function handleUpdate(values, action = 'create') {
    const _id = candidate.value._id

    if (!_id) return

    const { _flag, _list } = await (async () => {
        let _list = []
        if (action === 'create') {
            const _document = { ...values }
            _list = [...generalInformationField.value, _document]
            return { _flag: true, _list }
        }

        const { value } = await Swal.fire({
            title: 'Bạn có chắc là muốn xoá?',
            icon: 'question',
            input: 'text',
            html: 'Vui lòng nhập vào <code class="code">"delete"</code> để xác nhận xoá',
            inputValue: '',
            inputPlaceholder: 'Enter "delete" to delete',
            showCancelButton: true,
            cancelButtonText: 'Huỷ',
            confirmButtonText: 'Xoá',
            customClass: {
                confirmButton: 'btn btn-danger mx-1 bg-danger',
                cancelButton: 'btn btn-secondary mx-1',
            },
            inputValidator: value => {
                if (!value) {
                    return 'Vui lòng nhập vào <span class="code">"delete"</span> để xác nhận xoá'
                }
            },
        })

        // remove

        const { index } = values

        let __list = [...generalInformationField.value]

        __list.splice(index, 1)

        return {
            _flag: value === 'delete',
            _list: __list,
        }
    })()

    _flag &&
        (await updatePatchDoc(
            {
                _id,
                [props.fieldKey]: _list,
            },
            res => {
                const { data } = res
                const _value = data[props.fieldKey]
                if (_value) {
                    generalInformation[props.fieldKey] = [..._value]
                    const candidate = candidateStore()
                    candidate.setGeneralInformation({ [props.fieldKey]: generalInformation[props.fieldKey] })
                }
            },
        ))
}
</script>

<template>
    <div class="block-container mb-[3rem]">
        <Heading :text="props.heading">
            <template v-if="props.hasButtonAdd">
                <button class="btn btn-sm btn-success" @click="showModalCreateDoc()">
                    <FontAwesomeIcon icon="fa-solid fa-plus" />
                </button>
            </template>
        </Heading>

        <div v-if="$slots.group" class="clearfix mb-[1rem]">
            <slot name="group"></slot>
        </div>

        <!--  -->
        <TableDefault
            :model-value="generalInformationField"
            :settings="props.fields"
            :cols-hidden="[]"
            col-control="fullName"
            :height-auto="true"
        >
            <template #theadMore>
                <td style="width: 100px" class="text-end">Action</td>
            </template>
            <template #tbodyMore="{ doc }">
                <td style="width: 100px" class="text-end">
                    <a class="dropdown-item" href="#" @click="handleUpdate({ ...doc }, 'delete')">
                        <span class="text-danger pe-2"><FontAwesomeIcon icon="fa-solid fa-trash" /></span>
                    </a>
                </td>
            </template>
        </TableDefault>
    </div>

    <template v-if="props.hasButtonAdd">
        <Modal
            ref="refModal02"
            :title="document._id ? `Chỉnh sửa: ${props.heading}` : `Thêm mới ${props.heading}`"
            is-hidden-footer
        >
            <div class="block-container">
                <VeeForm
                    ref="refVeeForm02"
                    :fields="props.fields"
                    :document="document"
                    :submit-fn="handleUpdate"
                    :submit-text="document._id ? 'Cập nhật' : 'Thêm mới'"
                    buttonPosition="end"
                    reset-after-save
                >
                    <template #button>
                        <button type="button" class="btn btn-secondary mx-[1rem]" data-bs-dismiss="modal">Đóng</button>
                    </template>
                </VeeForm>
            </div>
        </Modal>
    </template>
</template>
