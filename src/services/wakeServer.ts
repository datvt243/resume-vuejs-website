import { API } from '@/config/api.config'

/**
 * Fire-and-forget ping so a sleeping Render free-tier backend starts its
 * ~30s cold boot while the user is still reading the login page, not after
 * they submit. `no-cors`: the opaque response is never read, the request
 * only has to reach the server. Failures are ignored — the real API calls
 * report their own errors.
 */
export function wakeServer(api: string = API): Promise<void> {
    return fetch(`${api}health`, { mode: 'no-cors', cache: 'no-store' }).then(
        () => undefined,
        () => undefined,
    )
}
