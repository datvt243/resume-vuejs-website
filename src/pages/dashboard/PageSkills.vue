<script setup>
/**
 * Skills page: professional and personal skills, one tab each. Both live on the
 * `general-information` document, so this page reads and patches that collection.
 */

import VeeFormGeneralInformationUpdate from '@/components/veevalidate/VeeFormGeneralInformationUpdate.vue'
import GroupTags from '@/components/GroupTags.vue'
import PickedSkills from '@/components/PickedSkills.vue'

import { ref, computed, watch, provide, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocument } from '@/composables/useDocument'
import { useCandidate } from '@/composables/useCandidate'
import { candidateStore } from '@/stores/candidate'
import { t, withParams } from '@/i18n'
import { confirmDelete } from '@/lib/swal.lib'
import { buttonClass } from '@/lib/button.lib'
import Swal from 'sweetalert2'
import { groupSkills } from '@/utilities/index'

const _mesRequired = 'validation.required'
// the API rejects more than this many main skills
const MAIN_SKILLS_MAX = 5
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
// the store and the lists on this page share one document object: saves patch it in place
// (`setGeneralInformation`), never replace it, or the lists stop seeing later changes
const info = computed(() => (Array.isArray(generalInformation.value) ? generalInformation.value[0] : generalInformation.value) || {})
const skills = computed(() => info.value.professionalSkills || [])
const skillsGroup = ref([])
watch(
    () => info.value.professionalSkillsGroup,
    val => {
        skillsGroup.value = [...(val || [])]
    },
    { immediate: true },
)
// tags plus group names skills already use (accounts can have groups that were never tags)
const groupNames = computed(() => groupSkills(skills.value, skillsGroup.value).flatMap(g => (g.name ? [g.name] : [])))

// the add modal fills itself from field defaults, so the clicked group goes in as the default for one open;
// kept for one more tick because opening the modal re-runs the form reset on the next flush
const presetGroup = ref('')
async function addToGroup(name, add) {
    presetGroup.value = name
    await nextTick()
    add()
    await nextTick()
    presetGroup.value = ''
}

// the API rejects a skill without a group, so deleting a group deletes its skills too
function deleteGroup(group) {
    confirmDelete({
        title: t('generalInfo.deleteGroupTitle', { name: group.name }),
        getHtml: () => t('generalInfo.deleteGroupText', { count: group.skills.length }),
        callback: async () => {
            const payload = {
                _id: candidate.getGeneralInformation?._id,
                professionalSkillsGroup: skillsGroup.value.filter(name => name !== group.name),
                professionalSkills: skills.value.filter(skill => skill.group !== group.name),
            }
            await updatePatchDoc(payload, ({ data }) => {
                candidate.setGeneralInformation({ professionalSkills: data.professionalSkills, professionalSkillsGroup: data.professionalSkillsGroup })
            })
        },
    })
}

// renames the tag (if it is one) and moves every skill of the group, in one save
async function renameGroup(group) {
    const { value } = await Swal.fire({
        title: t('generalInfo.renameGroupTitle', { name: group.name }),
        input: 'text',
        inputValue: group.name,
        showCancelButton: true,
        reverseButtons: true,
        cancelButtonText: t('common.cancel'),
        confirmButtonText: t('common.save'),
        customClass: { confirmButton: buttonClass({ variant: 'primary' }), cancelButton: buttonClass({ variant: 'secondary' }) },
        buttonsStyling: false,
        inputValidator: input => {
            const name = input.trim()
            if (!name) return t('validation.required')
            if (name !== group.name && groupNames.value.includes(name)) return t('generalInfo.groupExists')
        },
    })
    const name = value?.trim()
    if (!name || name === group.name) return
    const payload = {
        _id: candidate.getGeneralInformation?._id,
        professionalSkillsGroup: skillsGroup.value.map(tag => (tag === group.name ? name : tag)),
        professionalSkills: skills.value.map(skill => (skill.group === group.name ? { ...skill, group: name } : skill)),
    }
    await updatePatchDoc(payload, ({ data }) => {
        candidate.setGeneralInformation({ professionalSkills: data.professionalSkills, professionalSkillsGroup: data.professionalSkillsGroup })
    })
}

// saves one picked-skills field (mainSkills, familiarSkills); resolves true on success
async function savePicked(field, list) {
    let saved = false
    await updatePatchDoc({ _id: candidate.getGeneralInformation?._id, [field]: list }, ({ data }) => {
        candidate.setGeneralInformation({ [field]: data[field] })
        saved = true
    })
    return saved
}

async function handleUpdateGroup(list) {
    await updatePatchDoc({ _id: candidate.getGeneralInformation?._id, professionalSkillsGroup: list }, ({ data }) => {
        candidate.setGeneralInformation({ professionalSkillsGroup: data.professionalSkillsGroup })
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
        options: groupNames.value.map(i => ({ value: i, text: i })),
        valid: yup => yup.string().required(_mesRequired),
        default: presetGroup.value,
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

        <PickedSkills
            :title="$t('generalInfo.mainSkills')"
            :description="$t('generalInfo.mainSkillsDescription', { max: MAIN_SKILLS_MAX })"
            :pick-title="$t('generalInfo.mainSkillsPick')"
            :model-value="info.mainSkills || []"
            :skills="skills"
            :groups="groupNames"
            :max="MAIN_SKILLS_MAX"
            :save="list => savePicked('mainSkills', list)"
        />
        <PickedSkills
            :title="$t('generalInfo.familiarSkills')"
            :description="$t('generalInfo.familiarSkillsDescription')"
            :pick-title="$t('generalInfo.familiarSkillsPick')"
            :model-value="info.familiarSkills || []"
            :skills="skills"
            :groups="groupNames"
            :save="list => savePicked('familiarSkills', list)"
        />

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
                    <template #list="{ items, remove, add, edit }">
                        <div v-if="items.length || skillsGroup.length" class="divide-y divide-line rounded-md border border-line bg-surface px-4">
                            <section v-for="group in groupSkills(items, skillsGroup)" :key="group.name ?? ''" class="py-4">
                                <div class="mb-2 flex flex-wrap items-center gap-2">
                                    <h3 class="m-0 text-md font-semibold text-fg">{{ group.name ?? $t('generalInfo.ungrouped') }}</h3>
                                    <template v-if="group.name">
                                        <Button :text="$t('common.add')" icon="fa-solid fa-plus" type="ghost" size="sm" :aria-label="$t('generalInfo.addSkillToGroup', { name: group.name })" @click="addToGroup(group.name, add)" />
                                        <Button icon="fa-solid fa-square-pen" type="ghost" size="sm" class="ms-auto" :aria-label="$t('generalInfo.renameGroup', { name: group.name })" @click="renameGroup(group)" />
                                        <Button icon="fa-solid fa-trash" type="ghost" size="sm" :aria-label="$t('generalInfo.deleteGroup', { name: group.name })" @click="deleteGroup(group)" />
                                    </template>
                                </div>
                                <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
                                    <li v-for="skill in group.skills" :key="skill.index">
                                        <span class="inline-flex h-7 items-center gap-1.5 rounded-sm bg-surface-2 px-2.5 text-sm">
                                            <button
                                                type="button"
                                                class="rounded-sm font-medium text-fg hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                                                :aria-label="$t('generalInfo.editSkill', { name: skill.name })"
                                                @click="edit(skill.index)"
                                            >
                                                {{ skill.name }}
                                            </button>
                                            <span v-if="skill.exp" class="text-fg-3">· {{ $t('generalInfo.skillYearsShort', { n: skill.exp }) }}</span>
                                            <button
                                                type="button"
                                                class="inline-flex items-center rounded-sm text-fg-3 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                                                :aria-label="$t('generalInfo.deleteSkill', { name: skill.name })"
                                                @click="remove(skill.index)"
                                            >
                                                <FontAwesomeIcon icon="fa-solid fa-xmark" />
                                            </button>
                                        </span>
                                    </li>
                                </ul>
                            </section>
                        </div>
                        <div v-else class="rounded-md border border-line bg-surface">
                            <NoData />
                        </div>
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
