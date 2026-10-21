<script setup>
/**
 * Row actions for CRUD lists (DESIGN.md §4.4): icon-only ghost buttons, each
 * with an aria-label that names the item.
 */

import { defineProps, defineEmits } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
    // item name, read by screen readers ("Sửa Đại học X")
    label: { type: String, default: '' },
    deleteDisabled: { type: Boolean, default: false },
    // shows a read-only "view details" button before edit
    viewable: { type: Boolean, default: false },
})
const emit = defineEmits(['view', 'edit', 'duplicate', 'delete'])

const name = verb => `${verb} ${props.label}`.trim()
</script>

<template>
    <Button
        v-if="props.viewable"
        icon="fa-solid fa-eye"
        type="ghost"
        :aria-label="name(t('common.view'))"
        :title="t('common.view')"
        @click="emit('view')"
    />
    <!-- `!`: the ghost variant sets its own text/hover colors -->
    <Button
        icon="fa-solid fa-square-pen"
        type="ghost"
        class="!text-info hover:!bg-info-subtle"
        :aria-label="name(t('common.edit'))"
        :title="t('common.edit')"
        @click="emit('edit')"
    />
    <Button
        icon="fa-solid fa-copy"
        type="ghost"
        class="!text-success hover:!bg-success-subtle"
        :aria-label="name(t('common.duplicate'))"
        :title="t('common.duplicate')"
        @click="emit('duplicate')"
    />
    <Button
        icon="fa-solid fa-trash"
        type="ghost"
        class="!text-danger hover:!bg-danger-subtle"
        :aria-label="name(t('common.delete'))"
        :title="t('common.delete')"
        :disabled="props.deleteDisabled"
        @click="emit('delete')"
    />
</template>
