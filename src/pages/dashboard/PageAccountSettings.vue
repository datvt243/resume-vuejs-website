<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Trang cài đặt tài khoản — issue #63. Chỉ triển khai phần
 * backend đã hỗ trợ thật: xoá tài khoản (`DELETE /api/v1/candidate`, có
 * sẵn, cascade xoá toàn bộ dữ liệu CV + file đã upload). Đổi email/mật
 * khẩu KHÔNG triển khai ở đây — backend chưa có endpoint nào chấp nhận
 * `email`/`password` cho user đã đăng nhập (`schemaCandidatePatch`/
 * `schemaCandidate` trong resume-nodejs-api không khai báo 2 field này,
 * Joi mặc định `unknown(false)` sẽ reject request) — cùng cách xử lý
 * BLOCKED_ON_BACKEND như issue #8, không dựng form giả gọi API không tồn
 * tại.
 */
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import { useHelper } from '@/composables/useHelper'
import { handleBase } from '@/services/base'
import { confirmDelete } from '@/lib/swal.lib'
import { t } from '@/i18n'

const router = useRouter()
const auth = authStore()
const { loading, toast } = useHelper()

function handleDeleteAccount() {
    confirmDelete({
        title: t('account.deleteConfirmTitle'),
        getHtml: () => t('account.deleteConfirmText'),
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
                    <p class="m-0 break-all text-base text-fg">{{ auth.getUser?.email || '—' }}</p>
                </div>
                <!-- disabled buttons swallow hover, so the tooltip sits on the wrapper -->
                <span class="inline-flex" :title="$t('common.comingSoon')">
                    <Button :text="$t('account.changeEmail')" disabled aria-describedby="account-soon" />
                </span>
            </div>
        </FormSection>

        <FormSection :title="$t('auth.password')" :description="$t('account.passwordDescription')">
            <div class="pb-4">
                <span class="inline-flex" :title="$t('common.comingSoon')">
                    <Button :text="$t('account.changePassword')" disabled aria-describedby="account-soon" />
                </span>
            </div>
        </FormSection>
        <span id="account-soon" class="sr-only">{{ $t('common.comingSoon') }}</span>

        <FormSection :title="$t('account.delete')" :description="$t('account.deleteDescription')">
            <div class="pb-4">
                <p class="mb-4 mt-0 text-sm text-fg-2">{{ $t('account.cannotUndo') }}</p>
                <Button :text="$t('account.delete')" type="danger" icon="fa-solid fa-trash" @click="handleDeleteAccount()" />
            </div>
        </FormSection>
    </div>
</template>
