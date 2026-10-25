import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

/**
 * Send the user to /login whenever auth is lost while on a protected route.
 * Forced logouts (refresh failure in services/axios.ts, a token error code in
 * services/base.ts) clear the store without a router, and the beforeEach
 * guard only runs on navigation — without this the dashboard page stays
 * mounted inside LayoutAuth and keeps firing 401ing requests.
 *
 * Also sends an already logged-in user who opens /login or /register to the
 * dashboard. Any other URL (a reload, a deep link) is kept as loaded.
 */
const GUEST_ONLY = ['login', 'register']

export const useAuthRedirect = () => {
    const store = authStore()
    const route = useRoute()
    const router = useRouter()

    watch(
        () => store.isAuthenticated,
        isAuthenticated => {
            if (!isAuthenticated && route.meta.requiresAuth) router.push({ name: 'login' })
        },
    )

    router.isReady().then(() => {
        if (store.isAuthenticated && GUEST_ONLY.includes(String(route.name))) router.push('/dashboard/information')
    })
}
