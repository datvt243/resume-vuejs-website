/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

export interface Experience {
    _id?: string
    company: string
    position: string
    startDate: number
    endDate: number
    isCurrent: boolean
    description: string
    isCareerBreak?: boolean
    careerBreakType?: string
    image?: ''
    website?: ''
}
