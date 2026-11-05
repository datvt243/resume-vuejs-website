/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { inject } from 'vue'

export const useHelper = () => {
    const refSpinner = inject('spinner')
    const refToast = inject<(_opts: { message: string; bg?: string }) => void>('toast')

    return {
        loading: refSpinner,
        toast: refToast,
    }
}
