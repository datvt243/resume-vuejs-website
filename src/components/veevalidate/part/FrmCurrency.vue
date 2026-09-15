<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
import { defineProps, watch } from 'vue'
import { component as VueNumber } from '@coders-tm/vue-number-format'

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

const format = {
    decimal: '.',
    separator: ',',
    prefix: 'VND ',
    precision: 2,
    masked: false,
}

const { value, errorMessage, handleChange } = useField(() => props.name)
// tránh set 0 ở đây: yup có positive() nên 0 luôn invalid — trong lúc
// document thật (async) chưa load xong, ép value = 0 làm hiện nhầm lỗi
// "phải lớn hơn 0" dù giá trị thật hợp lệ. '' khớp với default của field
// trong model (vd. salaryDesired) và khớp thông điệp required() thay vì
// positive() sai ngữ cảnh.
if (value.value === undefined || value.value === null) {
    value.value = ''
}
function _handleChange($event) {
    const number = $event
    handleChange(+number)
}
</script>

<template>
    <div class="mb-[1rem]">
        <label :for="props.name" class="form-label">{{ props.label }}</label>
        <VueNumber
            :model-value="value"
            @update:model-value="_handleChange"
            v-bind="format"
            :id="props.name"
            class="form-control"
        />
        <!-- <input
            class="form-control"
            :value="value"
            :type="props.type"
            :id="props.name"
            :placeholder="getPlaceholder"
            :class="[props.size]"
            v-bind="attrs"
            @input="handleChange"
            @blur="handleBlur"
        /> -->
        <p v-if="errorMessage" class="text-danger text-sm my-1">{{ errorMessage }}</p>
        <p v-if="props.text" class="form-text mb-0">{{ props.text }}</p>
    </div>
</template>
