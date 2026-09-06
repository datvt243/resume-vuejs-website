<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Trang tổng quan (route '/', mở khi click logo "Resume
 * API"). Bố cục 4 section được thiết kế lại theo tham khảo thực tế từ
 * https://itviec.com/profile-dashboard (operator cung cấp, xem screenshot
 * trong evidence note) — cùng cấu trúc thông tin, giữ màu accent riêng
 * của app ($green #00d095) thay vì chép màu thương hiệu của itviec.
 * Section 1 + tình trạng open-to-work là dữ liệu thật từ candidateStore.
 * Section 2 (lượt xem CV) giờ là dữ liệu thật (candidate/visits API, xem
 * useVisits.ts) — LayoutDefault.vue (ancestor bọc mọi trang dashboard,
 * gồm cả trang này) đã fetch và cache vào candidateStore, ở đây chỉ đọc
 * lại giá trị cache, không fetch riêng. Section 4 (% hoàn thành hồ sơ)
 * — issue #59 — giờ là số liệu thật, tính qua `useProfileCompletion`
 * (dựa trên field `required` khai báo sẵn trong từng model, so với dữ
 * liệu thật trong candidateStore). Section 3 (đính kèm CV): phần tải CV hiện tại là thật (dùng lại
 * endpoint download-pdf có sẵn, PDF được generate live từ dữ liệu hồ sơ
 * — không phải file đã "upload" như itviec); nút "Đính kèm file mới" chỉ
 * là UI, backend chưa có endpoint lưu file upload.
 */

import { computed, ref } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { authStore } from '@/stores/auth'
import { useHelper } from '@/composables/useHelper'
import { useProfileCompletion } from '@/composables/useProfileCompletion'
import { API } from '@/config/api.config'

const candidate = candidateStore()
const auth = authStore()
const { toast } = useHelper()

/**
 * section 1: thông tin cơ bản
 */
const info = computed(() => candidate.getCandidate)
const generalInfo = computed(() => candidate.getGeneralInformation)

const fullName = computed(() => {
    const { firstName = '', lastName = '' } = info.value
    return `${firstName} ${lastName}`.trim() || 'Chưa cập nhật'
})
const initials = computed(() => {
    const { firstName = '', lastName = '' } = info.value
    return (`${firstName?.[0] || ''}${lastName?.[0] || ''}` || 'U').toUpperCase()
})
// backend candidate chưa có field avatar — component vẫn kiểm tra "nếu
// có" để không phải sửa lại khi backend bổ sung field này sau
const avatarUrl = computed(() => info.value?.avatar || '')
const email = computed(() => info.value?.email || auth.getUser?.email || '')
const position = computed(() => generalInfo.value?.positionDesired || 'Chưa cập nhật')
const isOpenToWork = computed(() => !!generalInfo.value?.openToWork)

/**
 * section 2: lượt xem CV — đọc lại giá trị đã fetch/cache bởi
 * LayoutDefault.vue (useVisits), không fetch riêng ở đây
 */
const cvViewCount = computed(() => info.value?.visitCount ?? 0)

/**
 * section 3: đính kèm CV
 * - tải CV hiện tại: dùng lại endpoint có sẵn (giống Header.vue). Đặt
 *   attribute `download` để trình duyệt lưu đúng tên file thật (không
 *   phải tên bịa) — CV được server generate live từ dữ liệu hồ sơ hiện
 *   tại, không phải file tĩnh đã "upload" từ trước như itviec.
 * - "đính kèm file mới": chỉ chọn file + hiển thị tên, CHƯA gửi lên
 *   server vì backend chưa có endpoint lưu file upload
 */
const _host = window.location.host === 'localhost' ? 'http://localhost:3001/' : API
const downloadCVUrl = computed(() => `${_host}api/v1/download-pdf?token=${auth.getToken}`)
const cvFileName = computed(() => {
    const { firstName = '', lastName = '' } = info.value
    const name = `${firstName}_${lastName}`.replace(/\s+/g, '_').replace(/^_+|_+$/g, '')
    return `${name || 'CV'}.pdf`
})

const fileInput = ref(null)
const selectedFileName = ref('')
function triggerFilePicker() {
    fileInput.value?.click()
}
function handleSelectFile(e) {
    const file = e.target?.files?.[0]
    e.target.value = ''
    if (!file) return

    selectedFileName.value = file.name
    toast?.({
        message: `Đã chọn "${file.name}" — tính năng lưu file lên server đang chờ backend cập nhật, file chưa được gửi lên.`,
        bg: 'info',
    })
}

/**
 * section 4: % hoàn thành hồ sơ — issue #59, số liệu thật
 */
const { percent: profileCompletion, missingSections } = useProfileCompletion()
</script>

<template>
    <div class="profile-card mb-5">
        <RouterLink to="/dashboard/information" class="profile-card-edit-link">Cập nhật hồ sơ →</RouterLink>
        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
            <div class="home-avatar">
                <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
                <span v-else>{{ initials }}</span>
            </div>
            <div class="flex-grow-1">
                <p class="h4 mb-2">{{ fullName }}</p>
                <p class="mb-1 opacity-75">
                    <FontAwesomeIcon icon="fa-solid fa-briefcase" class="me-2 opacity-50" />{{ position }}
                </p>
                <p class="mb-2 opacity-75">
                    <FontAwesomeIcon icon="fa-solid fa-envelope" class="me-2 opacity-50" />{{ email || 'Chưa cập nhật' }}
                </p>
                <span class="badge rounded-pill" :class="isOpenToWork ? 'text-bg-success' : 'text-bg-secondary'">
                    <FontAwesomeIcon :icon="isOpenToWork ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'" class="me-1" />
                    {{ isOpenToWork ? 'Đang mở tìm việc' : 'Không tìm việc' }}
                </span>
            </div>
        </div>
    </div>

    <div class="stat-highlight mb-5">
        <div class="stat-highlight-number">
            {{ cvViewCount }}
            <span>lượt xem</span>
        </div>
        <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
                <p class="fw-semibold mb-0">Lượt truy cập hồ sơ của bạn</p>
                <span class="badge text-bg-success-subtle">Mới</span>
            </div>
            <p class="small opacity-75 mb-1">Số lần trang hồ sơ công khai của bạn được xem (IP + vị trí, ghi nhận qua API thật). Số này sẽ không tăng qua app hiện tại — trang xem hồ sơ công khai qua link chia sẻ chưa được xây dựng ở frontend, chưa có nơi nào ở đây gọi API ghi nhận lượt xem.</p>
            <RouterLink to="/dashboard/visits" class="small fw-semibold">Xem chi tiết từng lượt truy cập →</RouterLink>
        </div>
    </div>

    <div class="block-container mb-5">
        <Heading text="Đính kèm CV" />
        <div class="attach-row">
            <div class="attach-icon">
                <FontAwesomeIcon icon="fa-solid fa-file-lines" />
            </div>
            <div class="flex-grow-1">
                <a class="fw-semibold" :href="downloadCVUrl" :download="cvFileName" target="_blank">{{ cvFileName }}</a>
                <p class="small opacity-50 mb-0">Được tạo tự động từ hồ sơ của bạn — luôn là bản mới nhất</p>
            </div>
            <Button icon="fa-solid fa-paperclip" type="outline-secondary" size="sm" text="Đính kèm file mới" @click="triggerFilePicker" />
            <input ref="fileInput" type="file" accept="application/pdf" class="d-none" @change="handleSelectFile" />
        </div>
        <p v-if="selectedFileName" class="small opacity-75 mt-2 mb-0">Đã chọn: {{ selectedFileName }}</p>
        <p class="small opacity-50 mt-2 mb-0">Tính năng lưu file đính kèm đang chờ backend cập nhật, file chọn ở trên chưa được gửi lên server.</p>
    </div>

    <div class="block-container">
        <Heading text="Profile Information" />
        <div class="d-flex align-items-center gap-4 flex-wrap">
            <div class="completion-ring" :style="{ '--percent': `${profileCompletion}%` }">
                <span class="completion-ring-value">{{ profileCompletion }}%</span>
                <span class="completion-ring-caption">hoàn thành</span>
            </div>
            <div class="flex-grow-1" style="min-width: 220px">
                <template v-if="missingSections.length">
                    <p class="mb-2">Hồ sơ còn thiếu {{ missingSections.length }} mục:</p>
                    <ul class="missing-sections-list mb-0">
                        <li v-for="section in missingSections" :key="section.to">
                            <RouterLink :to="section.to">{{ section.label }} →</RouterLink>
                        </li>
                    </ul>
                </template>
                <template v-else>
                    <p class="mb-2">Hồ sơ của bạn đã điền đầy đủ các mục bắt buộc — sẵn sàng để tạo CV.</p>
                    <RouterLink to="/dashboard/information" class="fw-semibold">Xem hồ sơ →</RouterLink>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.profile-card,
.stat-highlight {
    position: relative;
    background-color: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color-translucent);
    border-radius: 0.75rem;
    padding: 1.25rem;
}

.profile-card-edit-link {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    font-size: 0.875rem;
}

.home-avatar {
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

.stat-highlight {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border-left: 4px solid var(--bs-green);
    background-color: rgba(0, 208, 149, 0.08);
}

.stat-highlight-number {
    flex-shrink: 0;
    width: 84px;
    height: 84px;
    border-radius: 0.75rem;
    background-color: rgba(0, 208, 149, 0.15);
    color: var(--bs-green);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;

    span {
        font-size: 0.7rem;
        font-weight: 500;
        margin-top: 0.25rem;
    }
}

.attach-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.attach-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 0.6rem;
    background-color: rgba(0, 208, 149, 0.12);
    color: var(--bs-green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.completion-ring {
    --percent: 0%;

    width: 96px;
    height: 96px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: conic-gradient(var(--bs-green) var(--percent), var(--bs-border-color-translucent) 0);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        background-color: var(--bs-tertiary-bg);
    }
}

.completion-ring-value,
.completion-ring-caption {
    position: relative;
    z-index: 1;
}

.completion-ring-value {
    font-weight: 700;
    font-size: 1.15rem;
}

.completion-ring-caption {
    font-size: 0.7rem;
    opacity: 0.6;
}

.missing-sections-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;

    li {
        font-size: 0.9rem;
    }
}
</style>
