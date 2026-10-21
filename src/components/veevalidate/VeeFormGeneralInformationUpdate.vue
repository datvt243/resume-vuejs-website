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
import { buttonClass } from '@/lib/button.lib'
import { candidateStore } from '@/stores/candidate'
import { t } from '@/i18n'

const candidate = inject('candidate')

const props = defineProps({
    heading: { type: String, default: '' },
    description: { type: String, default: '' },
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
            title: t('confirm.deleteSure'),
            icon: 'question',
            input: 'text',
            html: t('confirm.typeDelete'),
            inputValue: '',
            inputPlaceholder: t('confirm.typeDeletePlaceholder'),
            showCancelButton: true,
            reverseButtons: true,
            cancelButtonText: t('common.cancel'),
            confirmButtonText: t('common.delete'),
            customClass: {
                confirmButton: buttonClass({ variant: 'danger' }),
                cancelButton: buttonClass({ variant: 'secondary' }),
            },
            buttonsStyling: false,
            inputValidator: value => {
                if (value !== 'delete') {
                    return t('confirm.typeDelete')
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
    <FormSection :title="props.heading" :description="props.description" :card="false">
        <template v-if="props.hasButtonAdd" #actions>
            <Button icon="fa-solid fa-plus" :text="t('common.add')" size="sm" @click="showModalCreateDoc()" />
        </template>

        <div class="space-y-4">
            <slot name="group"></slot>

            <TableDefault
                :model-value="generalInformationField"
                :settings="props.fields"
                :cols-hidden="[]"
                col-control="fullName"
                :height-auto="true"
            >
                <template #theadMore>
                    <th scope="col" class="w-12"><span class="sr-only">{{ t('common.actions') }}</span></th>
                </template>
                <template #tbodyMore="{ doc }">
                    <td class="w-12 text-right">
                        <Button icon="fa-solid fa-trash" type="ghost" size="sm" :aria-label="`${t('common.delete')} ${doc.name || doc.language || ''}`.trim()" @click="handleUpdate({ ...doc }, 'delete')" />
                    </td>
                </template>
            </TableDefault>
        </div>
    </FormSection>

    <template v-if="props.hasButtonAdd">
        <Modal
            ref="refModal02"
            :title="t(document._id ? 'form.editTitle' : 'form.addTitle', { name: props.heading.toLowerCase() })"
            is-hidden-footer
        >
            <div class="block-container">
                <VeeForm
                    ref="refVeeForm02"
                    :fields="props.fields"
                    :document="document"
                    :submit-fn="handleUpdate"
                    :submit-text="t('common.save')"
                    buttonPosition="end"
                    reset-after-save
                >
                    <template #cancel>
                        <Button :text="t('common.cancel')" type="ghost" data-bs-dismiss="modal" />
                    </template>
                </VeeForm>
            </div>
        </Modal>
    </template>
</template>
