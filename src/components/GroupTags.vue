<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { ref, defineEmits, defineProps, watch } from 'vue'

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
    title: { type: String, default: 'Title' },
    handleAction: { type: Function, default: () => {} },
    modelValue: { type: Array, default: () => [] },
})

const tags = ref([...props.modelValue])
watch(
    () => props.modelValue,
    val => {
        tags.value = [...val]
    },
)

const tag = ref('')
async function addTag() {
    if (!tag.value.trim()) return
    const newTags = [...tags.value, tag.value.trim()]
    tags.value = newTags
    emits('update:modelValue', newTags)
    await props.handleAction(newTags)
    tag.value = ''
}

async function removeTag(_tag, index) {
    const newTags = tags.value.filter((_, i) => i !== index)
    tags.value = newTags
    emits('update:modelValue', newTags)
    await props.handleAction(newTags)
}
</script>

<template>
    <div class="clearfix">
        <div class="flex items-center mb-[1rem]">
            <p class="h6 m-0">{{ props.title }}</p>
            <div class="ps-[1.5rem] m-0">
                <div class="input-group input-group-sm mb-0">
                    <input type="text" class="form-control" placeholder="Thêm mới" v-model="tag" />
                    <button class="btn btn-outline-success" type="button" @click="addTag()">
                        <FontAwesomeIcon icon="fa-solid fa-plus" />
                    </button>
                </div>
            </div>
        </div>
        <ul class="tag-list">
            <li v-for="(tag, i) in tags" :key="`tag${i}`">
                <span class="badge text-bg-secondary">
                    {{ tag }}
                    <span class="text-danger pointer" @click="removeTag(tag, i)"
                        ><FontAwesomeIcon icon="fa-solid fa-times"
                    /></span>
                </span>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.tag-list {
    padding: 0;
    margin: 0;
    display: inline-flex;
    list-style: none;
}
.tag-list li {
    margin: 0 10px 10px 0;
}
</style>
