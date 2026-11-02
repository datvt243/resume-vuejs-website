<script setup>
/**
 * A list of skill names picked from the professional skills (main skills, familiar skills).
 * "Add" opens a picker (search by name, filter by group) that edits the whole selection; × removes one.
 */

import Modal from '@/components/Modal.vue'
import { ref, computed, defineProps } from 'vue'

const props = defineProps({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    pickTitle: { type: String, default: '' },
    // stored picks, [{ name }]
    modelValue: { type: Array, default: () => [] },
    // professional skills to pick from, [{ name, group }]
    skills: { type: Array, default: () => [] },
    groups: { type: Array, default: () => [] },
    // 0 = no limit
    max: { type: Number, default: 0 },
    // saves the new [{ name }] list, resolves true on success
    save: { type: Function, required: true },
})

const refModal = ref()
const selected = ref([])
const search = ref('')
const group = ref('')

function open() {
    selected.value = props.modelValue.map(skill => skill.name)
    search.value = ''
    group.value = ''
    refModal.value?.show()
}

const options = computed(() => {
    const query = search.value.trim().toLowerCase()
    return props.skills.filter(skill => (!group.value || skill.group === group.value) && skill.name.toLowerCase().includes(query))
})

function toggle(name) {
    selected.value = selected.value.includes(name) ? selected.value.filter(n => n !== name) : [...selected.value, name]
}

async function submit() {
    if (await props.save(selected.value.map(name => ({ name })))) refModal.value?.hide()
}
</script>

<template>
    <FormSection :title="title" :description="description" :card="false">
        <template #actions>
            <Button icon="fa-solid fa-plus" :text="$t('common.add')" size="sm" @click="open()" />
        </template>

        <ul v-if="modelValue.length" class="m-0 flex list-none flex-wrap gap-2 p-0">
            <li v-for="skill in modelValue" :key="skill.name">
                <span class="inline-flex h-7 items-center gap-1.5 rounded-sm bg-surface-2 px-2.5 text-sm">
                    <span class="font-medium text-fg">{{ skill.name }}</span>
                    <button
                        type="button"
                        class="inline-flex items-center rounded-sm text-fg-3 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        :aria-label="$t('generalInfo.deleteSkill', { name: skill.name })"
                        @click="save(modelValue.filter(s => s.name !== skill.name))"
                    >
                        <FontAwesomeIcon icon="fa-solid fa-xmark" />
                    </button>
                </span>
            </li>
        </ul>
        <NoData v-else />
    </FormSection>

    <Modal ref="refModal" :title="pickTitle">
        <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
                <input v-model="search" type="search" class="form-control min-w-0 flex-1" :placeholder="$t('generalInfo.searchSkill')" :aria-label="$t('generalInfo.searchSkill')" />
                <select v-model="group" class="form-select w-auto" :aria-label="$t('generalInfo.group')">
                    <option value="">{{ $t('generalInfo.allGroups') }}</option>
                    <option v-for="name in groups" :key="name" :value="name">{{ name }}</option>
                </select>
            </div>
            <p class="m-0 text-sm text-fg-2" aria-live="polite">{{ max ? $t('generalInfo.mainSkillsCount', { count: selected.length, max }) : $t('generalInfo.selectedCount', { count: selected.length }) }}</p>
            <ul v-if="options.length" class="m-0 max-h-80 list-none space-y-1 overflow-y-auto p-0">
                <li v-for="(skill, i) in options" :key="i">
                    <label class="form-check m-0 flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            class="form-check-input m-0"
                            :checked="selected.includes(skill.name)"
                            :disabled="!!max && !selected.includes(skill.name) && selected.length >= max"
                            @change="toggle(skill.name)"
                        />
                        <span class="text-sm text-fg">{{ skill.name }}</span>
                        <span v-if="skill.group" class="text-sm text-fg-3">· {{ skill.group }}</span>
                    </label>
                </li>
            </ul>
            <NoData v-else />
        </div>
        <template #footer>
            <Button :text="$t('common.save')" @click="submit()" />
        </template>
    </Modal>
</template>
