/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

export interface SuccessResponse<T = Document | Document[]> {
    success: true
    message: string
    data: T
    meta?: Record<string, any>
}

export interface ErrorDetail {
    field: string
    message: string
}

/** legacy `message`/`errors`/`errorCode` stay optional until backend phase 5 is everywhere (API-STANDARD C6) */
export interface ErrorResponse {
    success: false
    error?: { code: string; message: string; details?: ErrorDetail[] }
    message?: string
    errors?: Record<string, string> | string[]
    errorCode?: string
}

/** what `handleBase` callbacks receive — `success:false` bodies go to the error branch instead */
export type Response<T = Document | Document[]> = SuccessResponse<T>

export interface Document {
    _id: string
    [key: string]: any
}
