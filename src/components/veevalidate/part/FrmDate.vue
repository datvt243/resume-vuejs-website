<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
import { t, tr } from '@/i18n'
import { defineProps, useAttrs, computed, watch } from 'vue'

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
    (val) => {
        value.value = val
    },
)

const attrs = useAttrs()

const { value, errorMessage, handleChange, handleBlur } = useField(() => props.name)

const getPlaceholder = computed(() => {
    const text = t('common.pleaseEnter')
    return props.placeholder ? tr(props.placeholder) : `${text} ${tr(props.label).toLowerCase()}`
})
</script>

<template>
    <div class="mb-4">
        <label :for="props.name" class="form-label">{{ tr(props.label) }}</label>
        <input
            class="form-control"
            :value="value"
            type="date"
            :id="props.name"
            :placeholder="getPlaceholder"
            :class="[props.size, { 'border-danger': errorMessage }]"
                :aria-invalid="errorMessage ? 'true' : undefined"
                :aria-describedby="errorMessage ? `${props.name}-error` : undefined"
            v-bind="attrs"
            @input="handleChange"
            @blur="handleBlur"
        />

        <p v-if="errorMessage" :id="`${props.name}-error`" class="mb-0 mt-1 flex items-center gap-1 text-xs text-danger">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" aria-hidden="true" />{{ tr(errorMessage) }}
        </p>
        <p v-if="props.text" class="form-text mb-0">{{ tr(props.text) }}</p>
    </div>
</template>
