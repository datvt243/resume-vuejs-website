<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import Header from '@/pages/_layouts/Header.vue'
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import Footer from '@/pages/_layouts/Footer.vue'
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import Main from '@/pages/_layouts/Main.vue'

import { computed } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { useVisits } from '@/composables/useVisits'

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const candidate = candidateStore()
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const fullName = computed(() => {
    const { firstName = '', lastName = '' } = candidate.getCandidate
    return `${firstName} ${lastName}`.trim() || 'Chưa cập nhật'
})
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const isOpenToWork = computed(() => !!candidate.getGeneralInformation?.openToWork)
// lượt xem CV — backend đã có API thật (candidate/visits, v1.2.0+),
// LayoutDefault là ancestor duy nhất bọc mọi trang dashboard nên fetch ở
// đây, cache vào candidateStore; PageHome.vue chỉ đọc lại giá trị cache,
// không fetch riêng (tránh gọi API 2 lần cùng lúc)
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const { count: cvViewCount } = useVisits()

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const routers = [
    { text: 'Dashboard', name: 'home', to: '/' },
    { text: 'Thông tin cơ bản', name: 'personal-information', to: '/dashboard/information' },
    { text: 'Thông tin chung', name: 'general-information', to: '/dashboard/general-information' },
    { text: 'Học vấn', name: 'education', to: '/dashboard/education' },
    { text: 'Kinh nghiệm', name: 'experience', to: '/dashboard/experience' },
    { text: 'Dự án', name: 'project', to: '/dashboard/project' },
    { text: 'Giải thưởng', name: 'award', to: '/dashboard/award' },
    { text: 'Chứng chỉ', name: 'certificate', to: '/dashboard/certificate' },
    { text: 'Người tham khảo', name: 'reference', to: '/dashboard/reference' },
    { text: 'Ứng tuyển', name: 'application', to: '/dashboard/application' },
    { text: 'Profile CV', name: 'profile', to: '/dashboard/profile' },
    { text: 'Xem trước / Xuất PDF', name: 'preview', to: '/dashboard/preview' },
    { text: 'Cài đặt tài khoản', name: 'account-settings', to: '/dashboard/account-settings' },
]
</script>

<template lang="pug">
.body-container
    Header
    Main
        .container
            .dashboard-layout.flex.items-start(class="gap-[1.5rem]")
                aside.dashboard-sidebar
                    .dashboard-sidebar-welcome
                        span.dashboard-sidebar-welcome-hi 👋 Chào mừng
                        p.dashboard-sidebar-welcome-name.mb-2 {{ fullName }}
                        p.dashboard-sidebar-welcome-stat.mb-1
                            | Tìm việc:
                            span(:class="isOpenToWork ? 'text-success' : 'opacity-50'") {{ isOpenToWork ? ' On' : ' Off' }}
                        p.dashboard-sidebar-welcome-stat.mb-0
                            | Lượt xem CV:
                            span {{ ' ' + (cvViewCount ?? 0) }}
                    .dashboard-sidebar-nav-card
                        nav.nav.flex-col.dashboard-sidebar-nav
                            RouterLink.dashboard-sidebar-link(v-for="r in routers" :key="r.name" :to="r.to" :class="{ active: r.to === $route.path }") {{ r.text }}
                .dashboard-content.grow
                    #reload
                    slot

    Footer
</template>

<style scoped lang="scss">
.body-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    .main-container {
        flex-grow: 1;
    }
}

.dashboard-layout {
    .dashboard-sidebar {
        width: 220px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
    }

    .dashboard-sidebar-welcome,
    .dashboard-sidebar-nav-card {
        background-color: var(--bs-tertiary-bg);
        border: 1px solid var(--bs-border-color-translucent);
        border-radius: 0.75rem;
        padding: 1rem;
    }

    .dashboard-sidebar-welcome-hi {
        display: block;
        font-size: 0.8rem;
        opacity: 0.6;
        margin-bottom: 0.25rem;
    }

    .dashboard-sidebar-welcome-name {
        font-weight: 600;
        font-size: 1.1rem;
    }

    .dashboard-sidebar-welcome-stat {
        font-size: 0.85rem;
        opacity: 0.85;
    }

    .dashboard-sidebar-link {
        display: block;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        color: var(--bs-body-color);
        text-decoration: none;

        &:hover {
            background-color: var(--bs-border-color-translucent);
        }

        &.active {
            background-color: var(--bs-green);
            color: #fff;
            font-weight: 600;
        }
    }

    .dashboard-content {
        min-width: 0;
    }
}

@media (max-width: 767.98px) {
    .dashboard-layout {
        flex-direction: column;

        .dashboard-sidebar {
            width: 100%;
            position: static;
        }
    }
}
</style>
