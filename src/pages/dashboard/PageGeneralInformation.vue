<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { ref, shallowRef, watch } from 'vue'
import { useDocument } from '@/composables/useDocument'
import { useCandidate } from '@/composables/useCandidate'
import { localizedToForm, localizedFromForm } from '@/utilities/index'
import { errorCodeOf } from '@/services/axios'

/**
 * store
 */
import { candidateStore } from '@/stores/candidate'
const candidate = candidateStore()

/**
 * import
 */
import model from '@/models/generalInformation.model'
const formFields = shallowRef(model)

/**
 *
 */
const { generalInformation, getData } = useCandidate({ field: 'generalInformation', collection: 'general-information' })
const { document, updateDoc } = useDocument({ collection: 'general-information', fields: formFields.value })

// `career` tuy là field `text` thường nhưng backend cũng lưu dạng
// object { vi, en }, giống careerGoal
const LOCALIZED_FIELDS = ['careerGoal', 'career']

watch(generalInformation, val => {
  const _val = Array.isArray(val) ? val?.[0] || {} : val
  for (const [key, value] of Object.entries(_val)) {
    document[key] = value
  }
  Object.assign(document, localizedToForm(_val, LOCALIZED_FIELDS))
})

const refVeeForm = ref(null)
const SALARY_FIELDS = ['salaryDesiredFrom', 'salaryDesiredTo']

async function handleUpdate(values) {
  const document = localizedFromForm(values, LOCALIZED_FIELDS)
  await updateDoc(
    document,
    res => {
      const { data } = res
      candidate.setCandidateByField({ generalInformation: [data] })
    },
    err => {
      const details = err?.error?.details
      const onSalary = errorCodeOf(err) === 'VALIDATION_ERROR' && details?.length && details.every(d => SALARY_FIELDS.includes(d.field))
      onSalary && details.forEach(d => refVeeForm.value?.setFieldError(d.field, d.message))
      return !!onSalary
    },
  )
}
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <Heading :level="1" :text="$t('nav.generalInformation')">
      <Button @click="getData?.()" icon="fa-solid fa-repeat" type="ghost" :aria-label="$t('common.reload')" />
    </Heading>

    <FormSection :title="$t('generalInfo.jobPreferences')" :description="$t('generalInfo.jobPreferencesDescription')">
      <LoadingGate variant="form">
        <VeeForm ref="refVeeForm" :fields="formFields" :document="document" :submit-fn="handleUpdate" :submit-text="$t('common.saveChanges')"
          button-position="end" cancelable />
      </LoadingGate>
    </FormSection>
  </div>
</template>
