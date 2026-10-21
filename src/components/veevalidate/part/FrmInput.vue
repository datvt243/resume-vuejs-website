<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
import { t, tr } from '@/i18n'
import { defineProps, useAttrs, computed } from 'vue'

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
    icon: { type: String, default: '' },
})

const attrs = useAttrs()

const { value, errorMessage, handleChange, handleBlur } = useField(() => props.name)

const getPlaceholder = computed(() => {
    const text = t('common.pleaseEnter')
    return props.placeholder ? tr(props.placeholder) : `${text} ${tr(props.label).toLowerCase()}`
})
</script>

<template>
    <div class="mb-4">
        <label v-if="props.label && !props.icon" :for="props.name" class="form-label">{{ tr(props.label) }}</label>
        <div :class="props.icon ? 'input-group' : null">
            <span v-if="props.icon" class="input-group-text">
                <FontAwesomeIcon :icon="props.icon" />
            </span>
            <input
                class="form-control"
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
            />
        </div>

        <p v-if="errorMessage" :id="`${props.name}-error`" class="mb-0 mt-1 flex items-center gap-1 text-xs text-danger">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" aria-hidden="true" />{{ tr(errorMessage) }}
        </p>
        <p v-if="props.text" class="form-text mb-0">{{ tr(props.text) }}</p>
    </div>
</template>
