/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { createWebHashHistory, createRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

const routes = [
    { path: '/', component: () => import('@/pages/home/PageHome.vue'), meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: () => import('@/pages/auth/PageLogin.vue') },
    { path: '/register', name: 'register', component: () => import('@/pages/auth/PageRegister.vue') },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('@/pages/auth/PageForgotPassword.vue') },
    { path: '/reset-password', name: 'reset-password', component: () => import('@/pages/auth/PageResetPassword.vue') },
    {
        path: '/resume/:email',
        name: 'public-resume',
        component: () => import('@/pages/public/PagePublicResume.vue'),
        // No requiresAuth — this is the public share-link page (issue #56),
        // fetches read-only data straight from the backend's own public
        // endpoint (GET /api/me/:email, gated server-side by isPublic).
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/PageDashboard.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'information',
                name: 'information',
                component: () => import('@/pages/dashboard/PageInformation.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'general-information',
                name: 'generalInformation',
                component: () => import('@/pages/dashboard/PageGeneralInformation.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'education',
                name: 'education',
                component: () => import('@/pages/dashboard/PageEducation.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'experience',
                name: 'experience',
                component: () => import('@/pages/dashboard/PageExperience.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'project',
                name: 'project',
                component: () => import('@/pages/dashboard/PageProject.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'award',
                name: 'award',
                component: () => import('@/pages/dashboard/PageAward.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'certificate',
                name: 'certificate',
                component: () => import('@/pages/dashboard/PageCertificate.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'reference',
                name: 'reference',
                component: () => import('@/pages/dashboard/PageReference.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'visits',
                name: 'visits',
                component: () => import('@/pages/dashboard/PageVisits.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'preview',
                name: 'preview',
                component: () => import('@/pages/dashboard/PagePreview.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'account-settings',
                name: 'account-settings',
                component: () => import('@/pages/dashboard/PageAccountSettings.vue'),
                meta: { requiresAuth: true },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: () => import('@/pages/notFound/NotFound.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router?.beforeEach((to, from, next) => {
    const { path } = to
    if (path !== '/') localStorage.setItem('current-page', path)

    if (to.matched.some(record => record.meta.requiresAuth)) {
        const store = authStore()
        const isAuthenticated = store.isAuthenticated

        if (!isAuthenticated) {
            next({ name: 'login' })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
