/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

export interface Education {
    _id?: string
    // { vi, en } from the owner API; a resolved string from the public API
    school: string | { vi: string; en?: string }
    major: string | { vi: string; en?: string }
    startDate: number
    endDate: number
    isCurrent: boolean
    description: string
    image?: ''
}
