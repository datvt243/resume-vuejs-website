<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
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
    value: { type: String, default: '' },
})
watch(
    () => props.value,
    (val) => {
        value.value = val
    },
)

/**
 *
 */
const attrs = useAttrs()

const { value, errorMessage, handleChange, handleBlur } = useField(() => props.name)

const getPlaceholder = computed(() => {
    const text = 'Vui lòng nhập'
    return props.placeholder ? props.placeholder : `${text} ${props.label.toLowerCase()}`
})
</script>

<template>
    <div class="mb-4">
        <label :for="props.name" class="form-label">{{ props.label }}</label>
        <textarea
            class="form-control"
            style="min-height: 180px"
            :value="value"
            :type="props.type"
            :id="props.name"
            :placeholder="getPlaceholder"
            :class="[props.size, { 'border-danger': errorMessage }]"
                :aria-invalid="errorMessage ? 'true' : undefined"
                :aria-describedby="errorMessage ? `${props.name}-error` : undefined"
            v-bind="attrs"
            @input="handleChange"
            @blur="handleBlur"
        ></textarea>
        <p v-if="errorMessage" :id="`${props.name}-error`" class="mb-0 mt-1 flex items-center gap-1 text-xs text-danger">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" aria-hidden="true" />{{ errorMessage }}
        </p>
        <p v-if="props.text" class="form-text mb-0">{{ props.text }}</p>
    </div>
</template>
