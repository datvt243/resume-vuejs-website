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
        getHtml: () => 'Toàn bộ dữ liệu hồ sơ (học vấn, kinh nghiệm, dự án...) và file CV đã upload sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.',
        callback: async () => {
            await handleBase({ method: 'delete', url: 'candidate' }, { loading, toast }, () => {
                auth.logOut({ router })
            })
        },
    })
}
</script>

<template>
    <div class="mb-[1.5rem]">
        <Heading :level="1" text="Cài đặt tài khoản" />

        <Box class="mb-6">
            <h6 class="text-uppercase opacity-75 mb-2">Email đăng nhập</h6>
            <p class="mb-1">{{ auth.getUser?.email || 'Chưa cập nhật' }}</p>
            <p class="text-sm opacity-50 mb-0">
                Đổi email hiện chưa được hỗ trợ — backend chưa có endpoint cho việc này.
            </p>
        </Box>

        <Box class="mb-6">
            <h6 class="text-uppercase opacity-75 mb-2">Mật khẩu</h6>
            <p class="text-sm opacity-50 mb-0">
                Đổi mật khẩu hiện chưa được hỗ trợ — backend chưa có endpoint cho việc này.
            </p>
        </Box>

        <Box class="border-danger">
            <h6 class="text-uppercase text-danger mb-2">Vùng nguy hiểm</h6>
            <p class="text-sm opacity-75 mb-2">
                Xoá tài khoản sẽ xoá vĩnh viễn toàn bộ dữ liệu hồ sơ của bạn, không thể khôi phục.
            </p>
            <Button text="Xóa tài khoản" type="danger" icon="fa-solid fa-trash" @click="handleDeleteAccount()" />
        </Box>
    </div>
</template>
