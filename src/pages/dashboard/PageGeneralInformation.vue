<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import VeeFormGeneralInformationUpdate from '@/components/veevalidate/VeeFormGeneralInformationUpdate.vue'
import GroupTags from '@/components/GroupTags.vue'

import { ref, toRef, shallowRef, onMounted, watch, provide, computed } from 'vue'
import { useDocument } from '@/composables/useDocument'
import { useCandidate } from '@/composables/useCandidate'
import { localizedToForm, localizedFromForm } from '@/utilities/index'
import { withParams } from '@/i18n'

/**
 *
 */
const isLoading = ref(false)

/**
 * store
 */
import { candidateStore } from '@/stores/candidate'
const candidate = candidateStore()

/**
 * import
 */
import model from '@/models/generalInformation.model'
const _mesRequired = 'validation.required'
const formFields = shallowRef(model)

/**
 *
 */
const { generalInformation, getData } = useCandidate({ field: 'generalInformation', collection: 'general-information' })
const { document, updateDoc, updatePatchDoc } = useDocument({ collection: 'general-information', fields: formFields.value })

const candidateProvide = computed(() => ({
  _id: candidate.getGeneralInformation?._id || '',
}))
provide('candidate', candidateProvide)
// `career` tuy là field `text` thường nhưng backend cũng lưu dạng
// object { vi, en }, giống careerGoal
const LOCALIZED_FIELDS = ['careerGoal', 'career']

onMounted(() => {
  isLoading.value = true
})
watch(generalInformation, val => {
  const _val = Array.isArray(val) ? val?.[0] || {} : val
  for (const [key, value] of Object.entries(_val)) {
    document[key] = value
  }
  Object.assign(document, localizedToForm(_val, LOCALIZED_FIELDS))
})

/**
 *
 * tags
 */
const skillsGroup = toRef(document, 'professionalSkillsGroup')
async function handleUpdateGroup(list) {
  await updatePatchDoc({ _id: document._id, professionalSkillsGroup: list }, res => {
    const { data } = res
    candidate.setCandidateByField({ generalInformation: [data] })
    document.professionalSkillsGroup = skillsGroup.value
  })
}

async function handleUpdate(values) {
  const document = localizedFromForm(values, LOCALIZED_FIELDS)
  await updateDoc(document, res => {
    const { data } = res
    candidate.setCandidateByField({ generalInformation: [data] })
  })
}

const foreignLanguageFields = computed(() => {
  return [
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
})

const professionalSkillFields = computed(() => {
  return [
    {
      name: 'name',
      label: 'generalInfo.skill',
      type: 'text',
      valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
      default: '',
    },
    {
      name: 'exp',
      label: 'generalInfo.skillYears',
      type: 'number',
      valid: yup =>
        yup.number().typeError('validation.number').positive('validation.positive').required(_mesRequired),
      default: '',
    },
    {
      name: 'group',
      label: 'generalInfo.group',
      type: 'select',
      options: (list => {
        return list.map(i => ({ value: i, text: i }))
      })(skillsGroup.value || []),
      valid: yup => yup.string(),
      default: '',
    },
  ]
})
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <Heading :level="1" :text="$t('nav.generalInformation')">
      <Button @click="getData?.()" icon="fa-solid fa-repeat" type="ghost" :aria-label="$t('common.reload')" />
    </Heading>

    <FormSection :title="$t('generalInfo.jobPreferences')" :description="$t('generalInfo.jobPreferencesDescription')">
      <LoadingGate variant="form">
        <VeeForm :fields="formFields" :document="document" :submit-fn="handleUpdate" :submit-text="$t('common.saveChanges')"
          button-position="end" cancelable />
      </LoadingGate>
    </FormSection>

    <template v-if="isLoading">
      <VeeFormGeneralInformationUpdate key="professionalSkills" :model-value="generalInformation"
        :heading="$t('generalInfo.professionalSkills')" :description="$t('generalInfo.professionalSkillsDescription')" :field-key="'professionalSkills'"
        :has-button-add="true" :fields="professionalSkillFields">
        <template #group>
          <GroupTags :title="$t('generalInfo.skillGroups')" v-model="skillsGroup" :handle-action="handleUpdateGroup" />
        </template>
      </VeeFormGeneralInformationUpdate>

      <VeeFormGeneralInformationUpdate key="personalSkills" :model-value="generalInformation" :heading="$t('generalInfo.personalSkills')"
        :description="$t('generalInfo.personalSkillsDescription')" :field-key="'personalSkills'" :has-button-add="true" :fields="[
          {
            name: 'name',
            label: 'generalInfo.skill',
            type: 'text',
            valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
            default: '',
          },
        ]" />

      <VeeFormGeneralInformationUpdate key="foreignLanguages" :model-value="generalInformation" :heading="$t('generalInfo.foreignLanguages')"
        :description="$t('generalInfo.foreignLanguagesDescription')" :field-key="'foreignLanguages'" :has-button-add="true"
        :fields="foreignLanguageFields" />
    </template>
  </div>
</template>
