<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { defineProps, defineExpose, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'

import {
    FrmInput,
    FrmPwd,
    FrmTextArea,
    FrmCheckbox,
    FrmSelect,
    FrmCurrency,
    FrmCkediter,
    FrmDatePicker,
} from '@/components/veevalidate'

const props = defineProps({
    fields: { type: Array, default: () => [] },
    submitFn: { type: Function, default: () => {} },
    submitText: { type: String, default: 'Submit' },
    buttonPosition: { type: String, default: 'start' },

    // document
    document: { type: Object, default: () => ({}) },
    resetAfterSave: { type: Boolean, default: false },
})

const getFields = computed(() => {
    return props.fields.map(e => {
        const { valid: _valid, ...rest } = e
        return rest
    })
})
const getFieldId = computed(() => {
    const _find = props.fields.find(e => e.name === '_id')
    return _find ? _find : null
})

/**
 * Khởi tạo Schema - để validate
 */
const schema = computed(() => {
    const object = {}
    for (const field of props.fields) {
        object[field.name] = field?.valid?.(yup)
    }
    return yup.object(object).json()
})

/**
 * Khởi tạo From
 */
const { values, meta, setValues, resetForm } = useForm({
    validationSchema: schema,
    /* initialValues: (() => {
        const keys = props.fields.map(e => ({ name: e.name, default: e.default }))
        const _newDoc = {}
        for (const k of keys) {
            
            _newDoc[k.name] = k.default
        }
        return _newDoc
    })(), */
})
watch(
    () => props.document,
    doc => {
        const keys = getFields.value.map(e => e.name)
        const _newDoc = {}
        for (const k of keys) {
            _newDoc[k] = doc[k]
        }
        setValues(_newDoc)
        if (!doc._id) {
            reset()
        }
    },
    { deep: true },
)

defineExpose({
    reset,
})

function reset() {
    // reset về default của TỪNG field (model.default), không phải luôn
    // '' — field ngày (startDate/endDate...) có default là timestamp số,
    // hardcode '' làm yup cast '' -> NaN, chặn luôn việc tạo mới
    resetForm({
        values: getFields.value.reduce((obj, e) => ({ ...obj, [e.name]: e.default ?? '' }), {}),
    })
}

function onSubmit() {
    /**
     * callback
     */

    if (!meta.value.valid) {
        return false
    }

    props?.submitFn?.(values)

    if (props.resetAfterSave) {
        resetForm()
    }
}

const objComponent = {
    checkbox: FrmCheckbox,
    currency: FrmCurrency,
    select: FrmSelect,
    textarea: FrmTextArea,
    ckediter: FrmCkediter,
    password: FrmPwd,
    date: FrmDatePicker,
    text: FrmInput,
    default: FrmInput,
}
</script>

<template>
    <form class="form">
        <div class="row">
            <template v-for="el in getFields.filter(f => f.type !== 'hidden')" :key="el.nam">
                <div :class="['col-12', el?.col || 'col-md-12']">
                    <component :is="objComponent?.[`${el.type}`] || objComponent['default']" :key="el?.name" v-bind="el" />
                </div>
            </template>
        </div>
        <FrmInput v-if="getFieldId" key="_id" v-bind="getFieldId" type="hidden" label="" class="mb-0" />
        <div class="footer flex my-[1rem]" :class="[`justify-${props.buttonPosition}`]">
            <button type="button" class="btn btn-success" @click="onSubmit" :disabled="!meta.valid">{{ submitText }}</button>
            <slot name="button"></slot>
        </div>
    </form>
</template>
