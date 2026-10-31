<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { ClassicEditor, Bold, Essentials, Italic, Paragraph, Undo, List, Heading } from 'ckeditor5'
import CKEditor from '@ckeditor/ckeditor5-vue'
import viTranslations from 'ckeditor5/translations/vi.js'

import 'ckeditor5/ckeditor5.css'
import 'ckeditor5-premium-features/ckeditor5-premium-features.css'
import './custom.scss'

import { defineModel, computed, useAttrs } from 'vue'
import { i18n, t, tr } from '@/i18n'

const model = defineModel({ type: String, default: '' })
const attrs = useAttrs()

const editor = ClassicEditor
// CKEditor reads its config once: the template keys the wrapper by language to remount it (not the editor itself, which moves its own DOM next to the textarea)
const editorConfig = computed(() => ({
    plugins: [Bold, Essentials, Italic, Paragraph, Undo, List, Heading],
    toolbar: ['heading', '|', 'bold', 'italic', '|', 'numberedList', 'bulletedList', '|', 'undo', 'redo'],
    height: 500,
    placeholder: tr(attrs?.placeholder) || t('common.pleaseEnter'),
    name: 'description',
    language: i18n.global.locale.value,
    // CKEditor falls back to the only loaded translation whatever `language` says, and crashes on an empty list
    ...(i18n.global.locale.value === 'vi' && { translations: [viTranslations] }),
}))

const cssHeight = computed(() => {
    const _height = attrs?.height || 200
    return typeof _height === 'number' ? `${_height}px` : _height
})
</script>

<template>
    <div :key="editorConfig.language" class="ck-wrapper">
        <CKEditor.component :editor="editor" v-model="model" :config="editorConfig" tag-name="textarea" />
    </div>
</template>

<style scoped>
:deep(.ck-editor__editable_inline:not(.ck-comment__input *)) {
    min-height: v-bind('cssHeight');
}
</style>
