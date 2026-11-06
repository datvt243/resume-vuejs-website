<script setup>
/**
 * Foreign languages page. The list lives on the `general-information`
 * document (`foreignLanguages`), so this page reads and patches that collection.
 * Read-only list by default; edit mode shows the add/edit/delete form (each change saves on its own).
 */

import VeeFormGeneralInformationUpdate from '@/components/veevalidate/VeeFormGeneralInformationUpdate.vue'

import { provide, computed, ref } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { candidateStore } from '@/stores/candidate'
import { t, withParams } from '@/i18n'
import { badgeClass } from '@/lib/badge.lib'

const candidate = candidateStore()
const { generalInformation, getData, loadError } = useCandidate({ field: 'generalInformation', collection: 'general-information' })

const candidateProvide = computed(() => ({
  _id: candidate.getGeneralInformation?._id || '',
}))
provide('candidate', candidateProvide)

const isEditing = ref(false)
// the store, not `generalInformation`: the edit form writes its saves back there
const languages = computed(() => candidate.getGeneralInformation?.foreignLanguages || [])

const _mesRequired = 'validation.required'
const foreignLanguageFields = [
  {
    name: 'language',
    label: 'generalInfo.language',
    type: 'text',
    valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
    default: '',
  },
  {
    name: 'level',
    label: 'generalInfo.level',
    type: 'select',
    options: [
      { value: 'basic', text: 'option.languageLevel.basic' },
      { value: 'intermediate', text: 'option.languageLevel.intermediate' },
      { value: 'advanced', text: 'option.languageLevel.advanced' },
      { value: 'expert', text: 'option.languageLevel.expert' },
    ],
    valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
    default: '',
  },
]
// unknown (legacy free-text) levels show as stored
const levelText = level => {
  const key = foreignLanguageFields[1].options.find(o => o.value === level)?.text
  return key ? t(key) : level
}
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <Heading :level="1" :text="$t('nav.languages')">
      <Button @click="getData?.()" icon="fa-solid fa-repeat" type="ghost" :aria-label="$t('common.reload')" />
      <!-- one button, not v-if/v-else: swapping elements would drop keyboard focus to <body> -->
      <Button v-if="isEditing || languages.length" :icon="isEditing ? 'fa-solid fa-xmark' : 'fa-solid fa-square-pen'" type="secondary"
        :action="isEditing ? '' : 'update'" :text="$t(isEditing ? 'common.close' : 'common.edit')" @click="isEditing = !isEditing" />
    </Heading>

    <VeeFormGeneralInformationUpdate v-if="isEditing" key="foreignLanguages" :model-value="generalInformation" :heading="$t('generalInfo.foreignLanguages')"
      :description="$t('generalInfo.foreignLanguagesDescription')" :field-key="'foreignLanguages'" :has-button-add="true"
      :fields="foreignLanguageFields" />

    <ul v-else-if="languages.length" class="divide-y divide-line rounded-md border border-line bg-surface">
      <li v-for="(item, i) in languages" :key="`${item.language}_${i}`" class="flex items-center justify-between gap-3 px-4 py-3">
        <span class="min-w-0 break-words text-md font-medium text-fg">{{ item.language }}</span>
        <span v-if="item.level" :class="[badgeClass(), 'shrink-0']">{{ levelText(item.level) }}</span>
      </li>
    </ul>

    <LoadingGate v-else :error="loadError" @retry="getData">
      <NoData :description="$t('generalInfo.foreignLanguagesDescription')">
        <Button icon="fa-solid fa-plus" action="add" :text="$t('common.add')" @click="isEditing = true" />
      </NoData>
    </LoadingGate>
  </div>
</template>
