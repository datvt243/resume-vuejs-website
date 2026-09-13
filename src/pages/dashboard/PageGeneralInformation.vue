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
import { getLocalizedText, wrapLocalizedText } from '@/utilities/index'

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
const _mesRequired = 'Vui lòng nhập'
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
// giữ lại giá trị careerGoal/career gốc (có thể là object { vi, en } từ
// backend — `career` tuy là field `text` thường nhưng backend cũng yêu
// cầu dạng object, giống careerGoal) để khi lưu lại không mất phần `en`
// — xem utilities/index.ts
const originalCareerGoal = ref(null)
const originalCareer = ref(null)

onMounted(() => {
  isLoading.value = true
})
watch(generalInformation, val => {
  const _val = Array.isArray(val) ? val?.[0] || {} : val
  for (const [key, value] of Object.entries(_val)) {
    document[key] = value
  }
  originalCareerGoal.value = _val.careerGoal
  document.careerGoal = getLocalizedText(_val.careerGoal)
  originalCareer.value = _val.career
  document.career = getLocalizedText(_val.career)
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
  const document = { ...values }
  document.careerGoal = wrapLocalizedText(document.careerGoal, originalCareerGoal.value)
  document.career = wrapLocalizedText(document.career, originalCareer.value)
  await updateDoc(document, res => {
    const { data } = res
    candidate.setCandidateByField({ generalInformation: [data] })
  })
}

const foreignLanguageFields = computed(() => {
  return [
    {
      name: 'language',
      label: 'Ngôn ngữ',
      type: 'text',
      placeholder: 'Vui lòng nhập Ngôn ngữ',
      valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
      default: '',
    },
    {
      name: 'level',
      label: 'Cấp độ',
      type: 'select',
      options: [
        { value: 'basic', text: 'Cơ bản' },
        { value: 'intermediate', text: 'Trung bình' },
        { value: 'advanced', text: 'Khá' },
        { value: 'expert', text: 'Giỏi' },
      ],
      placeholder: 'Vui lòng nhập Cấp độ',
      valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
      default: '',
    },
  ]
})

const professionalSkillFields = computed(() => {
  return [
    {
      name: 'name',
      label: 'Kỹ năng',
      type: 'text',
      placeholder: 'Vui lòng nhập kỹ năng',
      valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
      default: '',
    },
    {
      name: 'exp',
      label: 'Năm kinh nghiệm',
      type: 'number',
      placeholder: 'Vui lòng nhập Năm kinh nghiệm',
      valid: yup =>
        yup.number('Vui lòng nhập vào số').positive('Số năm kinh nghiệm nhỏ nhất bằng 0').required(_mesRequired),
      default: '',
    },
    {
      name: 'group',
      label: 'Nhóm',
      type: 'select',
      options: (list => {
        return list.map(i => ({ value: i, text: i }))
      })(skillsGroup.value || []),
      placeholder: 'Vui lòng nhập Nhóm',
      valid: yup => yup.string(),
      default: '',
    },
  ]
})
</script>

<template>
  <div class="block-container mb-[3rem]">
    <Heading text="Thông tin chung">
      <div class="btn-group">
        <Button @click="getData?.()" icon="fa-solid fa-repeat" type="outline-info" size="sm"></Button>
      </div>
    </Heading>
    <VeeForm :fields="formFields" :document="document" :submit-fn="handleUpdate" :submit-text="'Cập nhật'" />
  </div>

  <template v-if="isLoading">
    <hr class="border-success mb-[3rem]" />

    <VeeFormGeneralInformationUpdate key="professionalSkills" :model-value="generalInformation"
      :heading="'Kỹ năng chuyên môn'" :field-key="'professionalSkills'" :has-button-add="true"
      :fields="professionalSkillFields">
      <template #group>
        <GroupTags title="Danh sách nhóm" v-model="skillsGroup" :handle-action="handleUpdateGroup" />
      </template>
    </VeeFormGeneralInformationUpdate>

    <VeeFormGeneralInformationUpdate key="personalSkills" :model-value="generalInformation" :heading="'Kỹ năng cá nhân'"
      :field-key="'personalSkills'" :has-button-add="true" :fields="[
        {
          name: 'name',
          label: 'Kỹ năng',
          type: 'text',
          placeholder: 'Vui lòng nhập kỹ năng',
          valid: yup => yup.string().trim().max(100, 'Tối đa 100 ký tự').required(_mesRequired),
          default: '',
        },
      ]" />

    <VeeFormGeneralInformationUpdate key="foreignLanguages" :model-value="generalInformation" :heading="'Ngoại ngữ'"
      :field-key="'foreignLanguages'" :has-button-add="true" :fields="foreignLanguageFields" />
  </template>
</template>
