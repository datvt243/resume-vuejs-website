<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: profile basics page (DESIGN.md §4.3). Avatar upload is shown
 * disabled: the backend has no candidate-level avatar field or endpoint, and
 * Joi rejects unknown keys, so an `avatar` value must never reach `updateDoc`.
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import QrCode from '@/components/QrCode.vue'

import { ref, reactive, shallowRef, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDocument, useHelper, useCandidate } from '@/composables'
import { useCvTheme, DEFAULT_THEME } from '@/composables/useCvTheme'
import { useActiveProfile } from '@/composables/useActiveProfile'
import { useCvLang } from '@/composables/useCvLang'
import { localizedToForm, localizedFromForm } from '@/utilities/index'
import { t } from '@/i18n'

/* import { useDocument } from '@/composables/useDocument' */

/**
 * store
 */
import { candidateStore } from '@/stores/candidate'
const candidate = candidateStore()

/**
 *
 */
/* import { useHelper } from '@/composables/useHelper' */
const { toast } = useHelper()

const avatarUrl = computed(() => candidate.getCandidate?.avatar || '')

const initials = computed(() => {
    const { firstName = '', lastName = '' } = candidate.getCandidate
    return (`${firstName?.[0] || ''}${lastName?.[0] || ''}` || 'U').toUpperCase()
})

/**
 *
 */
import { modalDefault as model } from '@/models/information.model'
const formFields = shallowRef(model)
/* const socialMediaFields = ref(modalSocial) */
const socialMediaFields = ref([
    {
        name: 'socialMedia.github',
        label: 'GitHub',
        type: 'text',
        placeholder: 'https://github.com/…',
        inputmode: 'url',
        autocomplete: 'url',
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'socialMedia.linkedin',
        label: 'LinkedIn',
        type: 'text',
        placeholder: 'https://linkedin.com/in/…',
        inputmode: 'url',
        autocomplete: 'url',
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'socialMedia.website',
        label: 'Website',
        type: 'text',
        placeholder: 'https://…',
        inputmode: 'url',
        autocomplete: 'url',
        default: '',
        col: 'col-md-12',
    },
])

/**
 * Slug tùy chỉnh cho link CV công khai (issue #117) — cố tình KHÔNG thêm
 * vào `modalDefault`/`formFields`: form đó submit qua `updateDoc` (PUT
 * `candidate/update`), validate bằng `schemaCandidate` ở backend — schema
 * đó KHÔNG khai báo `slug`, và Joi mặc định `unknown(false)` nên cả
 * request cập nhật thông tin cơ bản sẽ bị từ chối hoàn toàn (cùng class
 * lỗi đã ghi chú ở đầu file cho field `avatar`, issue #63). `slug` chỉ
 * được backend chấp nhận qua `PATCH candidate/update`
 * (`schemaCandidatePatch`) — dùng `updatePatchDoc` riêng, giống hệt
 * pattern của `socialMediaFields`/`handleUpdateSocialNetwork` ở trên.
 */
const router = useRouter()
const slugFields = ref([
    {
        name: 'slug',
        label: 'Slug',
        type: 'text',
        placeholder: 'information.slugPlaceholder',
        text: 'information.slugHint',
        autocomplete: 'off',
        autocapitalize: 'none',
        spellcheck: 'false',
        default: '',
        col: 'col-md-12',
        valid: yup =>
            yup
                .string()
                .trim()
                .lowercase()
                .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
                    excludeEmptyString: true,
                    message: 'validation.slugFormat',
                })
                .test('slug-length', 'validation.slugLength', v => !v || (v.length >= 3 && v.length <= 50)),
    },
])
// `_id` is included so VeeForm's own `watch(document, ...)` (VeeForm.vue)
// takes the `setValues()` branch instead of its `!doc._id -> reset()`
// branch — required for the seeded `slug` value to actually land in
// vee-validate's real form state (not just a DOM-attribute display trick
// like `socialMediaFields`' `field.value` above, which only affects what
// renders, not what `values` submits if the user leaves it untouched).
const slugDocument = reactive({ _id: '', slug: '' })
// Issue #119: carry the owner's chosen CV theme into the copyable public
// link/QR code as `?theme=`, so anonymous visitors see the same theme
// picked in `PagePreview.vue` — no backend preference field needed.
// Omitted for the default theme to keep the link clean when unused.
const { selectedTheme } = useCvTheme()

// Issue #116: carry the owner's chosen CV profile into the copyable
// public link as `?profile=`, same mechanism issue #119 used for `?theme=`
// — a pure frontend choice, no backend preference field. Falls back to
// "no filter" (full data, pre-#116 behavior) if the stored id no longer
// matches a real profile (e.g. it was deleted since).
const { profiles } = useCandidate({ field: 'profiles', collection: 'profile' })
const { activeProfileId, setActiveProfile } = useActiveProfile()
const activeProfile = computed(() => profiles.value.find(p => p._id === activeProfileId.value) || null)

// Issue #182: CV language as `?lang=en`, omitted for the default vi
const { selectedLang } = useCvLang()

const publicLink = computed(() => {
    const value = slugDocument.slug || candidate.getCandidate?.email || ''
    if (!value) return ''
    const query = {
        ...(selectedTheme.value !== DEFAULT_THEME ? { theme: selectedTheme.value } : {}),
        ...(activeProfile.value ? { profile: activeProfile.value._id } : {}),
        ...(selectedLang.value === 'en' ? { lang: 'en' } : {}),
    }
    const resolved = router.resolve({ name: 'public-resume', params: { slug: value }, query })
    return `${window.location.origin}${import.meta.env.BASE_URL}${resolved.href}`
})

/**
 *
 */
const { document, updateDoc, updatePatchDoc } = useDocument({ collection: 'candidate', fields: formFields.value })

onMounted(() => {
    const _candidate = candidate.getCandidate

    /** gán value cho doc */
    for (const k of Object.keys(document)) {
        document[k] = _candidate[k]
    }
    Object.assign(document, localizedToForm(_candidate, ['introduction']))

    const { socialMedia = {} } = _candidate

    for (const field of socialMediaFields.value) {
        const { name } = field
        const [, key] = name.split('.')
        field['value'] = socialMedia[key] || ''
    }

    slugDocument._id = _candidate._id || ''
    slugDocument.slug = _candidate.slug || ''
})

async function handleUpdate(values) {
    const _newValues = { ...values }

    _newValues._id = candidate.getId
    if (!_newValues._id) {
        toast?.({
            message: t('error.generic'),
            bg: 'danger',
        })
    }
    const data = (val => {
        val.gender = !!val.gender
        val.marital = !!val.marital
        val.birthday = +new Date(val.birthday)

        return localizedFromForm(val, ['introduction'])
    })({ ..._newValues })

    await updateDoc(data, res => {
        const { data } = res
        candidate.setCandidateByField({ ...data })
    })
}

async function handleUpdateSocialNetwork(values) {
    const { socialMedia } = values
    const _id = candidate.getId

    if (!_id) return false

    await updatePatchDoc({ _id, socialMedia }, res => {
        const { data } = res
        const { socialMedia } = data
        candidate.setCandidateByField({ socialMedia })
    })
}

async function handleUpdateSlug(values) {
    const _id = candidate.getId
    if (!_id) return false

    await updatePatchDoc({ _id, slug: values.slug }, res => {
        const { data } = res
        slugDocument.slug = data.slug || ''
        candidate.setCandidateByField({ slug: data.slug })
    })
}
</script>

<template>
    <div class="max-w-4xl space-y-6">
        <Heading :level="1" :text="$t('nav.information')" />

        <FormSection :title="$t('information.avatar')" :description="$t('information.avatarDescription')">
            <div class="flex flex-wrap items-center gap-4 pb-4">
                <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-lg font-semibold text-fg-2">
                    <img v-if="avatarUrl" :src="avatarUrl" :alt="$t('information.avatar')" class="h-full w-full object-cover" />
                    <span v-else aria-hidden="true">{{ initials }}</span>
                </div>
                <!-- disabled buttons swallow hover, so the tooltip sits on the wrapper -->
                <span class="inline-flex" :title="$t('common.comingSoon')">
                    <Button icon="fa-solid fa-camera" :text="$t('information.chooseImage')" disabled aria-describedby="avatar-soon" />
                </span>
                <span id="avatar-soon" class="sr-only">{{ $t('common.comingSoon') }}</span>
            </div>
        </FormSection>

        <FormSection :title="$t('information.personal')" :description="$t('information.personalDescription')">
            <LoadingGate variant="form">
                <VeeForm
                    :key="'frm-basic-info'"
                    :fields="formFields"
                    :document="document"
                    :submit-fn="handleUpdate"
                    :submit-text="$t('common.saveChanges')"
                    button-position="end"
                    cancelable
                />
            </LoadingGate>
        </FormSection>

        <FormSection :title="$t('information.social')" :description="$t('information.socialDescription')">
            <LoadingGate variant="form">
                <VeeForm
                    :key="'frm-social-media'"
                    :fields="socialMediaFields"
                    :submit-fn="handleUpdateSocialNetwork"
                    :submit-text="$t('common.saveChanges')"
                    button-position="end"
                />
            </LoadingGate>
        </FormSection>

        <FormSection :title="$t('information.publicLink')" :description="$t('information.publicLinkDescription')">
            <LoadingGate variant="form">
                <VeeForm
                    :key="'frm-slug'"
                    :fields="slugFields"
                    :document="slugDocument"
                    :submit-fn="handleUpdateSlug"
                    :submit-text="$t('common.saveChanges')"
                    button-position="end"
                    cancelable
                />
            </LoadingGate>
        </FormSection>

        <FormSection :title="$t('information.share')" :description="$t('information.shareDescription')">
            <div class="space-y-4 pb-4">
                <div class="grid gap-4 sm:grid-cols-2">
                    <div v-if="profiles.length">
                        <label for="share-profile" class="form-label">{{ $t('field.cvProfile') }}</label>
                        <select id="share-profile" class="form-select w-full" :value="activeProfileId" @change="setActiveProfile($event.target.value)">
                            <option value="">{{ $t('information.allProfiles') }}</option>
                            <option v-for="p in profiles" :key="p._id" :value="p._id">{{ p.name }}</option>
                        </select>
                    </div>
                </div>
                <div v-if="publicLink">
                    <p class="form-label">{{ $t('information.yourLink') }}</p>
                    <p class="m-0 break-all rounded bg-surface-2 px-3 py-2 font-mono text-sm text-fg-2">{{ publicLink }}</p>
                </div>
                <QrCode :value="publicLink" />
            </div>
        </FormSection>
    </div>
</template>
