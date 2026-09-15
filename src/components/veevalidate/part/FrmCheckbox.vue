<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { useField } from 'vee-validate'
import { defineProps, computed } from 'vue'

const props = defineProps({
    name: String,
    checkedValue: { type: [String, Boolean], default: 'text' },
    label: { type: String, default: 'text' },
})

const { checked, handleChange } = useField(
    () => props.name,
    undefined,
    typeof props.checkedValue === 'boolean'
        ? {
              type: 'checkbox',
              checkedValue: true,
              uncheckedValue: false,
          }
        : {
              type: 'checkbox',
              checkedValue: props.checkedValue,
          },
)

const getId = computed(() => `checkbox_${props.name}_${~(Math.random() * 1000)}`)
const vbind = computed(() => {
    return typeof props.checkedValue === 'boolean' ? { 'true-value': true, 'false-value': false } : {}
})
</script>

<template>
    <div class="mb-[1rem]">
        <div class="form-check">
            <input
                :id="getId"
                class="form-check-input"
                type="checkbox"
                :value="checkedValue"
                :checked="checked"
                v-bind="vbind"
                @change="handleChange"
            />
            <label :for="getId" class="form-check-label"> {{ props.label }} </label>
        </div>
    </div>
</template>
