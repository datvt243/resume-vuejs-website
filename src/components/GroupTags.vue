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
    <div>
        <div class="mb-3 flex flex-wrap items-center gap-3">
            <p class="m-0 text-sm font-medium text-fg">{{ props.title }}</p>
            <div class="m-0">
                <div class="input-group input-group-sm mb-0">
                    <input type="text" class="form-control" placeholder="Thêm mới" v-model="tag" />
                    <button class="btn btn-outline-success" type="button" aria-label="Thêm thẻ" @click="addTag()">
                        <FontAwesomeIcon icon="fa-solid fa-plus" />
                    </button>
                </div>
            </div>
        </div>
        <ul class="tag-list">
            <li v-for="(tag, i) in tags" :key="`tag${i}`">
                <span class="badge text-bg-secondary inline-flex items-center gap-1">
                    {{ tag }}
                    <button type="button" class="inline-flex items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        :aria-label="`Xóa thẻ ${tag}`" @click="removeTag(tag, i)">
                        <FontAwesomeIcon icon="fa-solid fa-times" />
                    </button>
                </span>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.tag-list {
    @apply m-0 flex list-none flex-wrap gap-2 p-0;
}
</style>
