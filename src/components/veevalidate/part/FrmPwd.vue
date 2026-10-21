<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
import { t, tr } from '@/i18n'
import { ref, defineProps, useAttrs, computed, watch } from 'vue'

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
    icon: { type: String, default: '' },
})
watch(
    () => props.value,
    (val) => {
        value.value = val
    },
)

const attrs = useAttrs()

const isShow = ref(false)

const getPlaceholder = computed(() => {
    const text = t('common.pleaseEnter')
    return props.placeholder ? tr(props.placeholder) : `${text} ${tr(props.label).toLowerCase()}`
})

/**
 * vee field
 */
const { value, errorMessage, handleChange, handleBlur } = useField(() => props.name)
</script>

<template>
    <div class="mb-4">
        <label v-if="!props.icon" :for="props.name" class="form-label">{{ tr(props.label) }}</label>
        <div class="input-group">
            <span v-if="props.icon" class="input-group-text">
                <FontAwesomeIcon :icon="props.icon" />
            </span>
            <input
                class="form-control"
                :value="value"
                :type="isShow ? 'text' : 'password'"
                :id="props.name"
                :placeholder="getPlaceholder"
                :class="[props.size, { 'border-danger': errorMessage }]"
                :aria-invalid="errorMessage ? 'true' : undefined"
                :aria-describedby="errorMessage ? `${props.name}-error` : undefined"
                v-bind="attrs"
                @input="handleChange"
                @blur="handleBlur"
            />
            <button
                type="button"
                class="input-group-text text-fg-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                :aria-label="t('form.showPassword')"
                :aria-pressed="isShow ? 'true' : 'false'"
                @click="isShow = !isShow"
            >
                <FontAwesomeIcon :icon="`fa-solid ${isShow ? 'fa-eye' : 'fa-eye-slash'}`" aria-hidden="true" />
            </button>
        </div>

        <p v-if="errorMessage" :id="`${props.name}-error`" class="mb-0 mt-1 flex items-center gap-1 text-xs text-danger">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" aria-hidden="true" />{{ tr(errorMessage) }}
        </p>
        <p v-if="props.text" class="form-text mb-0">{{ tr(props.text) }}</p>
    </div>
</template>
