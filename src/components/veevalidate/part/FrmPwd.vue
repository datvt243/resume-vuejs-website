<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
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
    const text = 'Vui lòng nhập'
    return props.placeholder ? props.placeholder : `${text} ${props.label.toLowerCase()}`
})

/**
 * vee field
 */
const { value, errorMessage, handleChange, handleBlur } = useField(() => props.name)
</script>

<template>
    <div class="mb-[1rem]">
        <label v-if="!props.icon" :for="props.name" class="form-label">{{ props.label }}</label>
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
                :class="[props.size]"
                v-bind="attrs"
                @input="handleChange"
                @blur="handleBlur"
            />
            <span class="input-group-text" id="inputGroup-sizing-sm">
                <span
                    class="inline-block text-center text-success"
                    style="width: 24px"
                    @click="
                        () => {
                            isShow = !isShow
                        }
                    "
                >
                    <FontAwesomeIcon :icon="`fa-solid ${isShow ? 'fa-eye' : 'fa-eye-slash'}`" />
                </span>
            </span>
        </div>

        <p v-if="errorMessage" class="text-danger text-sm my-1">{{ errorMessage }}</p>
        <p v-if="props.text" class="form-text mb-0">{{ props.text }}</p>
    </div>
</template>
