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

const router = useRouter()
const auth = authStore()
const { loading, toast } = useHelper()

function handleDeleteAccount() {
    confirmDelete({
        title: 'Xóa tài khoản này?',
        getHtml: () => 'Toàn bộ dữ liệu hồ sơ (học vấn, kinh nghiệm, dự án…) và file CV đã upload sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.',
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
        <Heading :level="1" text="Cài đặt tài khoản" />

        <FormSection title="Email đăng nhập" description="Email bạn dùng để đăng nhập.">
            <div class="flex flex-wrap items-end justify-between gap-4 pb-4">
                <div class="min-w-0">
                    <p class="form-label">Email</p>
                    <p class="m-0 break-all text-base text-fg">{{ auth.getUser?.email || '—' }}</p>
                </div>
                <!-- disabled buttons swallow hover, so the tooltip sits on the wrapper -->
                <span class="inline-flex" title="Sắp ra mắt">
                    <Button text="Đổi email" disabled aria-describedby="account-soon" />
                </span>
            </div>
        </FormSection>

        <FormSection title="Mật khẩu" description="Đổi mật khẩu đăng nhập của bạn.">
            <div class="pb-4">
                <span class="inline-flex" title="Sắp ra mắt">
                    <Button text="Đổi mật khẩu" disabled aria-describedby="account-soon" />
                </span>
            </div>
        </FormSection>
        <span id="account-soon" class="sr-only">Sắp ra mắt</span>

        <FormSection title="Xóa tài khoản" description="Xóa vĩnh viễn hồ sơ và mọi file đã tải lên.">
            <div class="pb-4">
                <p class="mb-4 mt-0 text-sm text-fg-2">Không thể khôi phục sau khi xóa.</p>
                <Button text="Xóa tài khoản" type="danger" icon="fa-solid fa-trash" @click="handleDeleteAccount()" />
            </div>
        </FormSection>
    </div>
</template>
