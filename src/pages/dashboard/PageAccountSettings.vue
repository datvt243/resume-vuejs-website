<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Trang cài đặt tài khoản — issue #63. Xoá tài khoản
 * (`DELETE /api/v1/candidate`, cascade xoá toàn bộ dữ liệu CV + file đã
 * upload); đổi mật khẩu / đổi email (issue #460, backend
 * resume-nodejs-api#412) — đổi email chỉ gửi link xác nhận, email thật
 * đổi ở `PageConfirmEmailChange.vue`.
 */
import { reactive, ref, watchPostEffect } from 'vue'
import { useRouter } from 'vue-router'
import VeeForm from '@/components/veevalidate/VeeForm.vue'
import { authStore } from '@/stores/auth'
import { candidateStore } from '@/stores/candidate'
import { useHelper } from '@/composables/useHelper'
import { useDocument } from '@/composables/useDocument'
import { handleBase } from '@/services/base'
import { confirmDelete } from '@/lib/swal.lib'
import { t, uiLang, setUiLang, withParams } from '@/i18n'
import { useCvLang, LANG_OPTIONS } from '@/composables/useCvLang'

const router = useRouter()
const auth = authStore()
const candidate = candidateStore()
const { loading, toast } = useHelper()
const { selectedLang, setLang } = useCvLang()

// same rules as the backend's `schemaCandidatePatch.cvFileName`
const cvFileNameFields = [
    {
        name: 'cvFileName',
        label: 'account.cvFileName',
        type: 'text',
        placeholder: 'account.cvFileNamePlaceholder',
        text: 'account.cvFileNameHint',
        autocomplete: 'off',
        spellcheck: 'false',
        default: '',
        col: 'col-md-12',
        valid: yup =>
            yup
                .string()
                .trim()
                .max(100, withParams('validation.maxChars', { max: 100 }))
                .matches(/^[^\\/"\r\n]*$/, 'validation.cvFileNameChars'),
    },
]
// `_id` makes VeeForm `setValues()` the seeded value instead of resetting it
const cvFileNameDocument = reactive({ _id: '', cvFileName: '' })
// post: VeeForm's document watcher only exists after mount; re-seeds when App.vue's fetch lands late
watchPostEffect(() => {
    cvFileNameDocument._id = candidate.getId || ''
    cvFileNameDocument.cvFileName = candidate.getCandidate?.cvFileName || ''
})
const { updatePatchDoc } = useDocument({ collection: 'candidate', fields: [] })

async function handleUpdateCvFileName(values) {
    const _id = candidate.getId
    if (!_id) return false

    await updatePatchDoc({ _id, cvFileName: values.cvFileName }, ({ data }) => {
        candidate.setCandidateByField({ cvFileName: data.cvFileName || '' })
    })
}

// same rules as PageRegister.vue (backend `passwordRegex`, min 12)
const changePasswordFields = [
    { name: 'currentPassword', label: 'account.currentPassword', type: 'password', autocomplete: 'current-password', valid: yup => yup.string().required('validation.passwordRequired') },
    {
        name: 'password',
        label: 'auth.newPassword',
        type: 'password',
        autocomplete: 'new-password',
        text: 'auth.passwordHint',
        valid: yup =>
            yup
                .string()
                .min(12, 'validation.passwordMin')
                .matches(/[a-z]/, 'validation.passwordLower')
                .matches(/[A-Z]/, 'validation.passwordUpper')
                .matches(/[0-9]/, 'validation.passwordDigit')
                .matches(/[^A-Za-z0-9]/, 'validation.passwordSpecial')
                .required('validation.passwordRequired'),
    },
    {
        name: 'repassword',
        label: 'auth.confirmPassword',
        type: 'password',
        autocomplete: 'new-password',
        valid: yup =>
            yup
                .string()
                .oneOf([yup.ref('password')], 'validation.passwordMismatch')
                .required('validation.confirmPasswordRequired'),
    },
]
const changeEmailFields = [
    { name: 'email', label: 'account.newEmail', type: 'email', placeholder: 'auth.emailPlaceholder', autocomplete: 'email', valid: yup => yup.string().trim().email('validation.emailInvalid').required('validation.emailRequired') },
    { name: 'currentPassword', label: 'account.currentPassword', type: 'password', autocomplete: 'current-password', valid: yup => yup.string().required('validation.passwordRequired') },
]
// v-if: closing unmounts the form, which clears what was typed
const isChangingPassword = ref(false)
const isChangingEmail = ref(false)

async function handleChangePassword({ currentPassword, password, repassword }) {
    await handleBase({ method: 'post', url: 'auth/change-password', data: { currentPassword, password, repassword } }, { loading, toast }, ({ data }) => {
        // the backend revoked every older token, this tab's too — store the new pair before any other request
        data?.token && data?.tokenRefresh && auth.setTokens({ token: data.token, tokenRefresh: data.tokenRefresh })
        isChangingPassword.value = false
    })
}

async function handleChangeEmail({ email, currentPassword }) {
    await handleBase({ method: 'post', url: 'auth/change-email', data: { currentPassword, email: email.trim() } }, { loading, toast }, () => {
        isChangingEmail.value = false
    })
}

function handleDeleteAccount() {
    confirmDelete({
        title: t('account.deleteConfirmTitle'),
        getHtml: () => t('account.deleteConfirmText'),
        typed: true,
        callback: async () => {
            await handleBase({ method: 'delete', url: 'candidate' }, { loading, toast }, () => {
                auth.logOut({ router })
            })
        },
    })
}
</script>

<template>
    <div class="max-w-4xl space-y-6">
        <Heading :level="1" :text="$t('nav.accountSettings')" />

        <FormSection :title="$t('account.email')" :description="$t('account.emailDescription')">
            <div class="flex flex-wrap items-end justify-between gap-4 pb-4">
                <div class="min-w-0">
                    <p class="form-label">Email</p>
                    <p class="m-0 break-all text-base text-fg" data-current-email>{{ auth.getUser?.email || '—' }}</p>
                </div>
                <Button v-if="!isChangingEmail" :text="$t('account.changeEmail')" data-open-change-email @click="isChangingEmail = true" />
            </div>
            <VeeForm v-if="isChangingEmail" key="frm-change-email" :fields="changeEmailFields" :submit-fn="handleChangeEmail" :submit-text="$t('account.changeEmail')" button-position="end">
                <template #cancel>
                    <Button :text="$t('common.cancel')" type="ghost" @click="isChangingEmail = false" />
                </template>
            </VeeForm>
        </FormSection>

        <FormSection :title="$t('auth.password')" :description="$t('account.passwordDescription')">
            <div v-if="!isChangingPassword" class="pb-4">
                <Button :text="$t('account.changePassword')" data-open-change-password @click="isChangingPassword = true" />
            </div>
            <VeeForm v-else key="frm-change-password" :fields="changePasswordFields" :submit-fn="handleChangePassword" :submit-text="$t('account.changePassword')" button-position="end">
                <template #cancel>
                    <Button :text="$t('common.cancel')" type="ghost" @click="isChangingPassword = false" />
                </template>
            </VeeForm>
        </FormSection>

        <FormSection :title="$t('account.delete')" :description="$t('account.deleteDescription')" danger>
            <div class="pb-4">
                <p class="mb-4 mt-0 text-sm text-fg-2">{{ $t('account.cannotUndo') }}</p>
                <Button :text="$t('account.delete')" type="danger" icon="fa-solid fa-trash" @click="handleDeleteAccount()" />
            </div>
        </FormSection>

        <FormSection :title="$t('account.appLanguage')" :description="$t('account.appLanguageDescription')">
            <div class="pb-4">
                <SegmentedControl :model-value="uiLang" :options="LANG_OPTIONS" :aria-label="$t('account.appLanguage')" @update:model-value="setUiLang" />
            </div>
        </FormSection>

        <FormSection :title="$t('account.cvFileName')" :description="$t('account.cvFileNameDescription')">
            <LoadingGate variant="form">
                <VeeForm
                    :key="'frm-cv-file-name'"
                    :fields="cvFileNameFields"
                    :document="cvFileNameDocument"
                    :submit-fn="handleUpdateCvFileName"
                    :submit-text="$t('common.saveChanges')"
                    button-position="end"
                    cancelable
                />
            </LoadingGate>
        </FormSection>

        <FormSection :title="$t('preview.cvLanguage')" :description="$t('account.cvLanguageDescription')">
            <div class="pb-4">
                <SegmentedControl :model-value="selectedLang" :options="LANG_OPTIONS" :aria-label="$t('preview.cvLanguage')" @update:model-value="setLang" />
            </div>
        </FormSection>
    </div>
</template>
