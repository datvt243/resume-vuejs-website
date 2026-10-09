import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

/**
 * Send the user to /login whenever auth is lost while on a protected route.
 * Forced logouts (refresh failure in services/axios.ts, `invalidToken` in
 * services/base.ts) clear the store without a router, and the beforeEach
 * guard only runs on navigation — without this the dashboard page stays
 * mounted inside LayoutAuth and keeps firing 401ing requests.
 */
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
}
