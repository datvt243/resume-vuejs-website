<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField, FieldArray, Field } from 'vee-validate'
import { tr } from '@/i18n'
import { defineProps, watch } from 'vue'

const props = defineProps({
    name: String,
    type: { type: String, default: 'text' },
    label: { type: String, default: '' },
    text: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    size: { type: String, default: '' },
    validFeedback: { type: String, default: '' },
    invalidFeedback: { type: String, default: '' },
    rules: { type: String, default: '' },
    value: { type: [String, Number, Date], default: '' },
})
watch(
    () => props.value,
    val => {
        value.value = val
    },
)

const { value, errorMessage } = useField(() => props.name)
</script>

<template>
    <div class="mb-4">
        <label v-if="props.label" :for="props.name" class="form-label">{{ tr(props.label) }}</label>
        <FieldArray :name="props.name" v-slot="{ fields, push, remove }">
            <div v-for="(field, idx) in fields" :key="field.key">
                <Field :name="`${props.name}[${idx}].url`" type="url" />
                <button type="button" @click="remove(idx)">Remove</button>
            </div>
            <button type="button" @click="push({ id: Date.now(), name: '', url: '' })">Add</button>
        </FieldArray>
        <p v-if="errorMessage" :id="`${props.name}-error`" class="mb-0 mt-1 flex items-center gap-1 text-xs text-danger">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" aria-hidden="true" />{{ tr(errorMessage) }}
        </p>
        <p v-if="props.text" class="form-text mb-0">{{ tr(props.text) }}</p>
    </div>
</template>
