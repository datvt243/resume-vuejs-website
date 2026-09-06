<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: "Ảnh đại diện" block (issue #58) — chọn file + xem
 * trước cục bộ, KHÔNG gửi lên server: backend (`resume-nodejs-api`)
 * chưa có field `avatar` trên `Candidate` lẫn endpoint lưu ảnh cấp
 * candidate (endpoint ảnh hiện có, `POST /:collection/:id/images`, chỉ
 * dành cho project/certificate/award — gắn với 1 record cụ thể, sai
 * hình dạng cho use case này). Cố tình KHÔNG thêm field `avatar` vào
 * `information.model.ts`/đưa vào `VeeForm` — nếu field đó lọt vào
 * payload gửi cho `handleUpdate`/`updateDoc`, backend sẽ từ chối TOÀN
 * BỘ request cập nhật thông tin cơ bản (Joi `Joi.object()` mặc định
 * `unknown(false)`, đã xác nhận lại ở issue #63). Thay vào đó dùng lại
 * đúng pattern "chọn file, xem trước, disclose rõ chưa lưu" đã có sẵn ở
 * `PageHome.vue`'s "Đính kèm CV" section — không phải hàng giả, chỉ là
 * phần thật duy nhất làm được khi chưa có backend.
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'

import { ref, shallowRef, onMounted, onBeforeUnmount, computed } from 'vue'
import { useDocument, useHelper } from '@/composables'
import { getLocalizedText, wrapLocalizedText } from '@/utilities/index'

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

/**
 * Ảnh đại diện — chọn + xem trước cục bộ, chưa lưu server (xem comment
 * đầu file). `previewUrl` ưu tiên hơn `avatar` thật từ candidate (nếu
 * backend sau này có field đó) vì đây là bản người dùng vừa chọn, mới
 * hơn dữ liệu đã lưu.
 */
const avatarInput = ref(null)
const avatarPreviewUrl = ref('')
const avatarFileName = ref('')
const avatarUrl = computed(() => avatarPreviewUrl.value || candidate.getCandidate?.avatar || '')

const initials = computed(() => {
    const { firstName = '', lastName = '' } = candidate.getCandidate
    return (`${firstName?.[0] || ''}${lastName?.[0] || ''}` || 'U').toUpperCase()
})

function triggerAvatarPicker() {
    avatarInput.value?.click()
}

function handleSelectAvatar(e) {
    const file = e.target?.files?.[0]
    e.target.value = ''
    if (!file) return

    if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = URL.createObjectURL(file)
    avatarFileName.value = file.name

    toast?.({
        message: `Đã chọn "${file.name}" — chỉ xem trước tại đây, tính năng lưu ảnh đại diện lên server đang chờ backend cập nhật.`,
        bg: 'info',
    })
}

onBeforeUnmount(() => {
    if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
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
        label: 'Github',
        type: 'text',
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'socialMedia.linkedin',
        label: 'Linkedin',
        type: 'text',
        default: '',
        col: 'col-md-12',
    },
    {
        name: 'socialMedia.website',
        label: 'Website',
        type: 'text',
        default: '',
        col: 'col-md-12',
    },
])

/**
 *
 */
const { document, updateDoc, updatePatchDoc } = useDocument({ collection: 'candidate', fields: formFields.value })

// giữ lại giá trị introduction gốc (có thể là object { vi, en } từ backend)
// để khi lưu lại không mất phần `en` — xem utilities/index.ts
const originalIntroduction = ref(null)

onMounted(() => {
    const _candidate = candidate.getCandidate

    /** gán value cho doc */
    for (const k of Object.keys(document)) {
        document[k] = _candidate[k]
    }
    originalIntroduction.value = _candidate.introduction
    document.introduction = getLocalizedText(_candidate.introduction)

    const { socialMedia = {} } = _candidate

    for (const field of socialMediaFields.value) {
        const { name } = field
        const [, key] = name.split('.')
        field['value'] = socialMedia[key] || ''
    }
})

async function handleUpdate(values) {
    const _newValues = { ...values }

    _newValues._id = candidate.getId
    if (!_newValues._id) {
        toast?.({
            message: 'Xảy ra lỗi',
            bg: 'danger',
        })
    }
    const data = (val => {
        val.gender = !!val.gender
        val.marital = !!val.marital
        val.birthday = +new Date(val.birthday)
        val.introduction = wrapLocalizedText(val.introduction, originalIntroduction.value)

        return val
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
</script>

<template>
    <div class="block-container mb-5">
        <Heading text="Ảnh đại diện" />
        <div class="avatar-row">
            <div class="avatar-preview">
                <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
                <span v-else>{{ initials }}</span>
            </div>
            <div class="flex-grow-1">
                <Button icon="fa-solid fa-camera" type="outline-secondary" size="sm" text="Chọn ảnh" @click="triggerAvatarPicker" />
                <input ref="avatarInput" type="file" accept="image/*" class="d-none" @change="handleSelectAvatar" />
                <p v-if="avatarFileName" class="small opacity-75 mt-2 mb-0">Đã chọn: {{ avatarFileName }}</p>
                <p class="small opacity-50 mt-2 mb-0">
                    Chỉ xem trước tại đây — tính năng lưu ảnh đại diện lên server đang chờ backend cập nhật.
                </p>
            </div>
        </div>
    </div>
    <div class="block-container mb-5">
        <Heading text="Thông tin cơ bản" />
        <!-- <Teleport to="#reload">
            <button class="btn btn-sm btn-outline-info" @click="getData?.()">
                <FontAwesomeIcon icon="fa-solid fa-repeat" /> Reload
            </button>
        </Teleport> -->

        <VeeForm
            :key="'frm-basic-info'"
            :fields="formFields"
            :document="document"
            :submit-fn="handleUpdate"
            :submit-text="'Cập nhật'"
            buttonPosition="center"
        />
    </div>
    <div class="block-container">
        <Heading text="Liên kết mạng xã hội" />
        <VeeForm
            :key="'frm-social-media'"
            :fields="socialMediaFields"
            :submit-fn="handleUpdateSocialNetwork"
            :submit-text="'Cập nhật'"
            buttonPosition="center"
        />
    </div>
</template>

<style scoped lang="scss">
.avatar-row {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
}

.avatar-preview {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.35rem;
    background-color: var(--bs-green);
    color: #fff;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
