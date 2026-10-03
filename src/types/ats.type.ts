/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Kiểu dữ liệu cho tính năng xuất CV tối ưu ATS (issue #159)
 *   — khớp với backend resume-nodejs-api (`GET download-pdf?template=`,
 *   `POST cv/ats-check`, xem `src/services/atsChecks.ts` phía backend).
 */

export type CvTemplate = 'classic' | 'ats'

export interface AtsCheckRequest {
    template?: CvTemplate
    lang?: 'vi' | 'en'
    jobDescription?: string
}

export interface AtsCheckResult {
    id: string
    passed: boolean
    severity: 'error' | 'warning'
    message: string
}

export interface AtsKeywordMatch {
    matched: string[]
    missing: string[]
    coverage: number
}

export interface AtsCheckResponse {
    score: number
    pages: number
    checks: AtsCheckResult[]
    extractedText: string
    keywordMatch?: AtsKeywordMatch
}
