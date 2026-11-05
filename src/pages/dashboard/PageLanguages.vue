<script setup>
/**
 * Foreign languages page. The list lives on the `general-information`
 * document (`foreignLanguages`), so this page reads and patches that collection.
 */

import VeeFormGeneralInformationUpdate from '@/components/veevalidate/VeeFormGeneralInformationUpdate.vue'

import { provide, computed } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { candidateStore } from '@/stores/candidate'
import { withParams } from '@/i18n'

const candidate = candidateStore()
const { generalInformation, getData } = useCandidate({ field: 'generalInformation', collection: 'general-information' })

const candidateProvide = computed(() => ({
  _id: candidate.getGeneralInformation?._id || '',
}))
provide('candidate', candidateProvide)

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
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <Heading :level="1" :text="$t('nav.languages')">
      <Button @click="getData?.()" icon="fa-solid fa-repeat" type="ghost" :aria-label="$t('common.reload')" />
    </Heading>

    <VeeFormGeneralInformationUpdate key="foreignLanguages" :model-value="generalInformation" :heading="$t('generalInfo.foreignLanguages')"
      :description="$t('generalInfo.foreignLanguagesDescription')" :field-key="'foreignLanguages'" :has-button-add="true"
      :fields="foreignLanguageFields" />
  </div>
</template>
