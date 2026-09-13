<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import '@/styles/vue3datepicker.scss'

import { useField } from 'vee-validate'
import { ref, useAttrs, watch, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()

const props = defineProps({
    name: String,
    label: { type: String, default: '' },
    text: { type: String, default: '' },
    rules: { type: String, default: '' },
    value: { type: Number, default: +new Date() },
})
const attrs = useAttrs()
const isMonthPicker = computed(() => Object.hasOwn(attrs, 'monthPicker'))
watch(
    () => props.value,
    val => {
        date.value = checkValue(val)
    },
)
// ----- useField

const { value, errorMessage, handleChange } = useField(() => props.name)
watch(value, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        handleChange(newVal)
        date.value = checkValue(newVal)
    }
})

// ----- useField
const date = ref(checkValue(value.value))
watch(date, (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        value.value = convertToNumber(newVal)
    }
})

// ------
function checkValue(date) {
    const _check = Object.hasOwn(attrs, 'monthPicker')
    const _val = date || +new Date()
    const _date = new Date(_val)
    if (_check) {
        return {
            month: _date.getMonth(),
            year: _date.getFullYear(),
        }
    }
    return +_date
}
function convertToNumber(value) {
    if (isMonthPicker.value) {
        const date = new Date()
        date.setMonth(value.month)
        date.setFullYear(value.year)
        return +date
    }
    return +new Date(value)
}
function format(date) {
    let day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear()

    day = day < 10 ? `0${day}` : day
    month = month < 10 ? `0${month}` : month

    const { monthPicker = false } = attrs

    return !monthPicker ? `${day}/${month}/${year}` : `${month}/${year}`
}
</script>

<template>
    <div class="mb-[1rem]">
        <label :for="props.name" class="form-label">{{ props.label }}</label>

        <VueDatePicker
            :dark="theme === 'dark'"
            :id="props.name"
            v-model="date"
            :enable-time-picker="false"
            :format="format"
            :month-picker="attrs.monthPicker || false"
            auto-apply
        ></VueDatePicker>

        <p v-if="errorMessage" class="text-danger text-sm my-1">{{ errorMessage }}</p>
        <p v-if="props.text" class="form-text mb-0">{{ props.text }}</p>
    </div>
</template>
