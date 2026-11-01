<script setup>
/**
 * Skills page: professional and personal skills, one tab each. Both live on the
 * `general-information` document, so this page reads and patches that collection.
 */

import VeeFormGeneralInformationUpdate from '@/components/veevalidate/VeeFormGeneralInformationUpdate.vue'
import GroupTags from '@/components/GroupTags.vue'

import { ref, computed, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocument } from '@/composables/useDocument'
import { useCandidate } from '@/composables/useCandidate'
import { candidateStore } from '@/stores/candidate'
import { t, withParams } from '@/i18n'

const _mesRequired = 'validation.required'
const candidate = candidateStore()

const { generalInformation, getData } = useCandidate({ field: 'generalInformation', collection: 'general-information' })
const { updatePatchDoc } = useDocument({ collection: 'general-information', fields: [] })

provide(
    'candidate',
    computed(() => ({ _id: candidate.getGeneralInformation?._id || '' })),
)

const route = useRoute()
const router = useRouter()
const TABS = computed(() => [
    { value: 'professional', label: t('generalInfo.professionalSkills') },
    { value: 'personal', label: t('generalInfo.personalSkills') },
])
// the selected tab lives in the URL query (DESIGN.md §5.7), professional by default
const tab = computed({
    get: () => (route.query.tab === 'personal' ? 'personal' : 'professional'),
    set: value => router.replace({ query: { ...route.query, tab: value } }),
})

/**
 * skill groups
 */
const skillsGroup = ref([])
watch(
    generalInformation,
    val => {
        const _val = Array.isArray(val) ? val?.[0] || {} : val || {}
        skillsGroup.value = _val.professionalSkillsGroup || []
    },
    { immediate: true },
)
async function handleUpdateGroup(list) {
    await updatePatchDoc({ _id: candidate.getGeneralInformation?._id, professionalSkillsGroup: list }, res => {
        const { data } = res
        candidate.setCandidateByField({ generalInformation: [data] })
    })
}

const professionalSkillFields = computed(() => [
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
        valid: yup => yup.number().typeError('validation.number').positive('validation.positive').required(_mesRequired),
        default: '',
    },
    {
        name: 'group',
        label: 'generalInfo.group',
        type: 'select',
        options: skillsGroup.value.map(i => ({ value: i, text: i })),
        valid: yup => yup.string(),
        default: '',
    },
])

const personalSkillFields = [
    {
        name: 'name',
        label: 'generalInfo.skill',
        type: 'text',
        valid: yup => yup.string().trim().max(100, withParams('validation.maxChars', { max: 100 })).required(_mesRequired),
        default: '',
    },
]
</script>

<template>
    <div class="max-w-4xl space-y-6">
        <Heading :level="1" :text="$t('nav.skills')">
            <Button @click="getData?.()" icon="fa-solid fa-repeat" type="ghost" :aria-label="$t('common.reload')" />
        </Heading>

        <Tabs v-model="tab" :tabs="TABS" :aria-label="$t('nav.skills')">
            <template #professional>
                <VeeFormGeneralInformationUpdate
                    key="professionalSkills"
                    :model-value="generalInformation"
                    :heading="$t('generalInfo.professionalSkills')"
                    :description="$t('generalInfo.professionalSkillsDescription')"
                    field-key="professionalSkills"
                    has-button-add
                    :fields="professionalSkillFields"
                >
                    <template #group>
                        <GroupTags :title="$t('generalInfo.skillGroups')" v-model="skillsGroup" :handle-action="handleUpdateGroup" />
                    </template>
                </VeeFormGeneralInformationUpdate>
            </template>
            <template #personal>
                <VeeFormGeneralInformationUpdate
                    key="personalSkills"
                    :model-value="generalInformation"
                    :heading="$t('generalInfo.personalSkills')"
                    :description="$t('generalInfo.personalSkillsDescription')"
                    field-key="personalSkills"
                    has-button-add
                    :fields="personalSkillFields"
                />
            </template>
        </Tabs>
    </div>
</template>
